var fs = require("fs");
var xlsx = require("node-xlsx");
var excel = require("excel-export");
var math = require("mathjs");
var moment = require("moment");
var RiotApi = require("./riotApi");

function checkError(e)
{
    if(e)
    {
        console.log(e.message || e.toString() || "Unknown Error");
        process.exit(1);
    }
}

var config;
try
{
    config = require("./../config.json");
}
catch(e)
{
    checkError(e);
}
var riot = new RiotApi(config, "c5038ac4-ba32-4296-9e1b-00d4333880ea");

var cache;
try
{
    var cache = require("./cache.json");
    if(config.summonerName == cache.summonerName)
        main();
    else
        throw "";
}
catch(e)
{
    cache = {};
    riot.getSummoner(config.summonerName, function(err, result)
    {
        checkError(err);
        var friendlyName = Object.keys(result)[0] || checkError("Could not find summoner " + config.summonerName)
        var result = result[friendlyName] || checkError("Could not find summoner " + config.summonerName);

        cache.summonerId = result.id;
        cache.summonerName = result.name;
        cache.renderedGames = [];

        var cacheTimes = 3;
        function cachedOne()
        {
            cacheTimes--;
            if(cacheTimes == 0)
                main();
        }

        function createdCacher(propertyName)
        {
            return function(err, result)
            {
                checkError(err);

                cache[propertyName] = {};
                for(var key in result.data)
                {
                    var id = result.data[key].id;
                    var name = result.data[key].name;
                    cache[propertyName][id] = name;
                }

                cacheTimes--;
                if(cacheTimes == 0)
                    main();
            }
        }

        riot.getChampions(createdCacher("champions"));
        riot.getItems(createdCacher("items"));
        riot.getSummonerSpells(createdCacher("summonerSpells"));
    });
}

function main()
{
    var rows;
    try
    {
        var rows = xlsx.parse(config.outputFile)[0].data.slice(1) || [];
    }
    catch(e)
    {
        rows = [];
    }

    riot.getGames(cache.summonerId, function(err, result)
    {
        checkError(err);

        var games = result.matches;

        var cols = config.columnBluePrint;
        for(var i = 0; i < games.length; i++)
        {
            if(cache.renderedGames.indexOf(games[i].matchId) !== -1)
                continue;

            if(config.rankedOnly && games[i].queueType != "RANKED_SOLO_5x5")
                continue;

            var format = {};
            var game = games[i].participants[0];
            var stats = game.stats;
            format.id = games[i].matchId;
            format.stats = stats;
            format.summonerSpell1 = cache.summonerSpells[game.spell1Id]
            format.summonerSpell2 = cache.summonerSpells[game.spell2Id];
            format.champion = cache.champions[game.championId];
            format.result = stats.winner ? "win" : "lose";
            format.time = games[i].matchCreation;
            format.duration = game.matchDuration;
            format.durationMin = Math.floor(games[i].matchDuration / 60);
            var durationSec = games[i].matchDuration % 60;
            format.durationSec = durationSec.toString().length == 2 ? durationSec : "0" + durationSec;

            var items = [];
            for(var ii = 0; ii < 7; ii++)
            {
                if(stats.hasOwnProperty("item" + ii) && cache.items[stats["item" + ii]])
                {
                    var itemName = cache.items[stats["item" + ii]];
                    items.push(itemName);
                    format["item" + ii] = itemName;
                }
            }
            format.items = items.join(", ");


            var row = config.rowBluePrint.slice(0);
            for(var ii = 0; ii < row.length; ii++)
            {
                var content = formatColumn(row[ii], format);
                if(content[0] == "=")
                {
                    try
                    {
                        content = math.eval(content.substr(1));
                    }
                    catch (e)
                    {
                        checkError(e);
                    }
                }
                if(cols[ii].type == "date")
                {
                    content = moment(new Date(parseInt(content))).format(config.timeFormat);
                }

                row[ii] = content;
            }
            rows.push(row);
            cache.renderedGames.push(games[i].matchId);
        }

        for(var i = 0; i < cols.length; i++)
            if(cols[i].type == "date")
                cols[i].type = "string";

        var excelResult = excel.execute({stylesXmlFile: config.stylesXmlFile, cols: cols, rows: rows});

        var write = fs.createWriteStream(config.outputFile);
        write.end(excelResult, "binary");

        fs.writeFileSync("./src/cache.json", JSON.stringify(cache, undefined, 4));
    });
}

function formatColumn(text, replacements, prefix)
{
    prefix = prefix || "";
    for(var key in replacements)
    {
        if(typeof replacements[key] == 'object')
        {
            text = formatColumn(text, replacements[key], prefix + key + ".");
        }
        else
        {
            var _key = escapeRegExp("{" + prefix + key + "}");
            var regexp = new RegExp(_key, "g");
            if(regexp.test(text))
                text = text.replace(regexp, replacements[key]);
        }
    }
    return text;
}

function escapeRegExp(str)
{
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

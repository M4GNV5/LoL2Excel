var request = require("request");

function api(config, key)
{
    this.region = config.region.toLowerCase();
    this.key = key;
}

api.prototype.makeRequest = function(url, cb)
{
    url = encodeURI(url);
    request(url, function (err, res, body)
    {
		if(err || res.statusCode != 200)
        {
            var err = err || "Riot server returned status code " + res.statusCode + " when requesting " + url;
			cb(err);
		}
        else
        {
            try
            {
                cb(null, JSON.parse(body));
            }
            catch (e)
            {
                cb(e);
            }
		}
	});
};

api.prototype.getChampions = function(cb)
{
    var url = "https://global.api.pvp.net/api/lol/static-data/" + this.region + "/v1.2/champion?api_key=" + this.key;

    this.makeRequest(url, cb);
};
api.prototype.getItems = function(cb)
{
    var url = "https://global.api.pvp.net/api/lol/static-data/" + this.region + "/v1.2/item?api_key=" + this.key;

    this.makeRequest(url, cb);
};
api.prototype.getSummonerSpells = function(cb)
{
    var url = "https://global.api.pvp.net/api/lol/static-data/" + this.region + "/v1.2/summoner-spell?api_key=" + this.key;
    this.makeRequest(url, cb);
};
api.prototype.getGames = function(id, cb)
{
    var url = "https://" + this.region + ".api.pvp.net/api/lol/" + this.region + "/v2.2/matchhistory/" + id + "?api_key=" + this.key;
    this.makeRequest(url, cb);
};
api.prototype.getSummoner = function(name, cb)
{
    var url = "https://" + this.region + ".api.pvp.net/api/lol/" + this.region + "/v1.4/summoner/by-name/" + name + "?api_key="  + this.key;
    this.makeRequest(url, cb);
};

module.exports = api;

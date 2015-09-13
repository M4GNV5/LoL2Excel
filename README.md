# LoL2Excel
inspired by https://redd.it/3kja2x - auto creates most parts of the table

##Config
- `summonerName` your summoner name
- `region` your region
- `outputFile` xlsx file to output table to
- `rankedOnly` when true will only put ranked games in the table
- `timeFormat` format for colums of type date (see http://momentjs.com/docs/#/displaying/)
- `columnBluePrint` captions and data types for column
- `rowBluePrint` text inserted in all the rows (see below for formatting)

##Column definition
- `caption` text to display in the first row
- `type` can be string, bool, number, date
- `width` width of the column

##Formatting
you can insert data from the game using {name} where name can be one of the following

if the first character is a = it will pass the text to mathjs for calculating e.g. KDAs etc. (e.g. `sin({stats.kills}) * 42` would write the sine of your kills multiplicated with 42 to the table)
- `id` game id
- `summonerSpell1` name of first summoner spell
- `summonerSpell2` name of second summoner spell
- `champion` name of champion played
- `result` win or loose
- `time` time when the game has been played
- `duration` duration in seconds
- `durationMin` duration / 60
- `durationSec` duration mod 60
- `itemX` name of item in slot X (0-6)
- `items` all items together divided by ,
- `stats.<statName>` value of the game stat (e.g. kills, deaths, assists, pentaKills) see below for a full list

###`stats.<statName>` possible statNames
`winner`, `champLevel`, `item0`, `item1`, `item2`, `item3`, `item4`, `item5`, `item6`, `kills`, `doubleKills`, `tripleKills`, `quadraKills`, `pentaKills`, `unrealKills`, `largestKillingSpree`, `deaths`, `assists`, `totalDamageDealt`, `totalDamageDealtToChampions`, `totalDamageTaken`, `largestCriticalStrike`, `totalHeal`, `minionsKilled`, `neutralMinionsKilled`, `neutralMinionsKilledTeamJungle`, `neutralMinionsKilledEnemyJungle`, `goldEarned`, `goldSpent`, `combatPlayerScore`, `objectivePlayerScore`, `totalPlayerScore`, `totalScoreRank`, `magicDamageDealtToChampions`, `physicalDamageDealtToChampions`, `trueDamageDealtToChampions`, `visionWardsBoughtInGame`, `sightWardsBoughtInGame`, `magicDamageDealt`, `physicalDamageDealt`, `trueDamageDealt`, `magicDamageTaken`, `physicalDamageTaken`, `trueDamageTaken`, `firstBloodKill`, `firstBloodAssist`, `firstTowerKill`, `firstTowerAssist`, `firstInhibitorKill`, `firstInhibitorAssist`, `inhibitorKills`, `towerKills`, `wardsPlaced`, `wardsKilled`, `largestMultiKill`, `killingSprees`, `totalUnitsHealed`, `totalTimeCrowdControlDealt`

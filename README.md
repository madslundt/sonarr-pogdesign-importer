About
====
Import tv series from pogdesign into Sonarr.

Install
=======
`npm i -g sonarr-pogdesign-importer`

Run
===
`sonarr-pogdesign-importer --config="[CONFIG PATH]"`

or

`sonarr-pogdesign-importer -c "[CONFIG PATH]"`

Create config
=============
Create a config.json file some where with the following content:
```
{
    "monthsForward": 0,
    "sonarrApi": "abcdef12345",
    "sonarrUrl": "http://localhost:8989",
    "sonarrProfileId": 1,
    "sonarrPath": "/tv/",
    "sonarrSeasonFolder": true,
    "genresIgnored": ["comedy", "documentary"],
    "minimumStars": 5000,
    "verbose": false,
    "test": false
}
```

**monthsForward** lookups up series from today's date and X months in the future. 0 means only current month.

**sonarrApi** can be found in sonarr under Settings > General > SecuriGidety > API Key

**sonarrUrl** your url to sonarr

**sonarrProfileId** the profile id in Sonarr. Must be greater than 0. Can be found by running `sonarr-pogdesign-importer --config="[CONFIG PATH]" --profiles` or `sonarr-pogdesign-importer -c "[CONFIG PATH]" --profiles`.

**sonarrPath** where Sonarr should store the series. Can be found by running `sonarr-pogdesign-importer --config="[CONFIG PATH]" --paths` or `sonarr-pogdesign-importer -c "[CONFIG PATH]" --paths`.

**sonarrSeasonFolder** if sonarr should create season folders for the series.

**genresIgnored** genres to be ignored. If a series contain one of the genres in the list it is not imported to Sonarr.

**minimumStars** the minimum users who has given an interest in the series. Pogdesign writes "Selected by X Users"

**verbose** if you want to include verbose. Can be ignored.

**test** if you want to test it without adding series to Sonarr. Can be ignored

Run from source
===============
1. Clone this repository.
2. Create config.json file
3. Change files in /src and transpile them to js by using the command `tsc` (you need to have tsc installed globally `npm i -g tsc`)
4. Go to /dist and run `node index --config="[CONFIG PATH]"` or `node index -c "[CONFIG PATH]"`

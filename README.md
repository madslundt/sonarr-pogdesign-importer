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
```
{
    "monthsForward: 0,
    "sonarrApi: "abcdef12345",
    "sonarrUrl: "http://localhost:8989",
    "genresIgnored: ["comedy", "documentary"],
    "minimumStars": 5000,
    "verbose": false
}
```

monthsForward lookups up series from dates date and X months in the future.

sonarrApi can be found in sonarr under Settings > General > SecuriGidety > API Key

sonarrUrl your url to sonarr

genresIgnored genres to be ignored. If a series contain one of the genres in the list it is not imported to Sonarr.

minimumStars the minimum users who has given an interest in the series. Pogdesign writes "Selected by X Users"

verbose if you want to include verbose. Can be ignored.

Run from source
===============
1. Clone this repository.
2. Create config.json file
3. Go to /dist and run `node index.js --config="[CONFIG PATH]"` or `node index.js -c "[CONFIG PATH]"`
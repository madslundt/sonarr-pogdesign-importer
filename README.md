About
====
Scrape tv series from either Pogdesign and/or Trakt and import them into Sonarr based on ratings and genre. Pogdesign rating is how many users have selected the tv show. Trakt rating is the rating from 0-100.
When the tv series have been found from Trakt and/or Pogdesign it is being looked up in Sonarr and based on the genre from Sonarr it is imported into Sonarr for later download.

[![NPM](https://nodei.co/npm/sonarr-pogdesign-importer.png?compact=true)](https://nodei.co/npm/sonarr-pogdesign-importer/)

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
    "genresIgnored": ["comedy", "documentary"],
    "sonarr": {
        "url": "http://localhost:8989",
        "apiKey": "abcdef12345",
        "profileId": 1,
        "path": "/tv/",
        "useSeasonFolder": true
    },
    "scrapers": [
        {
            "type": "pogdesign",
            "monthsForward": 3,
            "minimumStars": 5000
        },
        {
            "type": "trakt",
            "apiKey": "abcdef12345",
            "listName": "trending",
            "minimumRating": 70,
            "fromYear": 2018,
            "toYear": 2020
        }
    ],
    "verbose": false,
    "test": false
}
```

**genresIgnored**: Genres to be ignored. If a series contain one of the genres in the list it is not imported to Sonarr.

**verbose**: If you want to include verbose. Can be ignored.

**test**: If you want to test it without adding series to Sonarr. Can be ignored

**sonarr**: Sonarr configurations see [Sonarr section](#sonarr)

**scrapers**: A list of scrapers. See [scraper section](#scraper)

### Sonarr
**url**: Sonarr url. Has to include http protocol and port.

**apiKey**: Api key for Sonarr. Can be found in sonarr under Settings > General > Security > API Key

**profileId**: Profile id in Sonarr. Must be greater than 0. Can be found by running `sonarr-pogdesign-importer --config="[CONFIG PATH]" --profiles` or `sonarr-pogdesign-importer -c "[CONFIG PATH]" --profiles`.

**path**: Where Sonarr should store the series. Can be found by running `sonarr-pogdesign-importer --config="[CONFIG PATH]" --paths` or `sonarr-pogdesign-importer -c "[CONFIG PATH]" --paths`.

**useSeasonFolder**: If sonarr should create season folders for the series.

### Scraper
**type**: Type must always be declared for each scraper. At this time it can be either `pogdesign` or `trakt`.

There are no limit on how many scraper configurations you fill in, as long as they match configuration for either `pogdesign` or `trakt`. Atleast one scraper is required.
#### Pogdesign
**monthsForward**: Lookups up series from current month and X months in the future. 0 means only current month.

**minimumStars**: Minimum users who has given an interest in the series. Pogdesign writes "Selected by X Users"

#### Trakt
**apiKey**: Your own api key for Trakt.

**listName**: List that you want to crawl from on Trakt. Can be either `trending`, `popular`,`watched`, `collected` or `anticipated`

**minimumRating**: Minimum rating for a show to be imported to Sonarr. Must be between 0 and 100.

**startYear**: Start year for a show to be released after. If this is not specified it will look from current year.

**endYear** End year for a show to be released within. If this is not specified it will be set to 10 years ahead of current year.



Run from source
===============
1. Clone this repository.
2. Create config.json file
3. Change files in /src and transpile them to js by using the command `tsc` (you need to have tsc installed globally `npm i -g tsc`)
4. Go to /dist and run `node index --config="[CONFIG PATH]"` or `node index -c "[CONFIG PATH]"`

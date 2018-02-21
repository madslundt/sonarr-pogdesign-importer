About
====
The program scrapes pogdesign and adds new series based on how many users have selected them. This is done by scraping new tv shows starting from the webpage https://www.pogdesign.co.uk/cat/TV-shows-starting-January-2018 (this is just an example for January 2018). The users choose how popular the TV show needs to be and the regarding to the text 'Selected by X Users'. When it has been scraped it looks up the tv shows in sonarr to get metadata on them. Finally it filters out tv shows for genres that the user chose to ignore and add these to sonarr.

Now Trakt is also included to import from.

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
            "apiKey": "abcdef12345,
            "listName": "trending",
            "minimumRating": 70,
            "fromYear": 2018,
            "toYear": 2020
        },
    ],
    "verbose": false,
    "test": false
}
```

**genresIgnored**: Genres to be ignored. If a series contain one of the genres in the list it is not imported to Sonarr.

**verbose**: If you want to include verbose. Can be ignored.

**test**: If you want to test it without adding series to Sonarr. Can be ignored

### Sonarr
**url**: Sonarr url. Has to include http protocol and port.

**apiKey**: Api key for Sonarr. Can be found in sonarr under Settings > General > Security > API Key

**profileId**: Profile id in Sonarr. Must be greater than 0. Can be found by running `sonarr-pogdesign-importer --config="[CONFIG PATH]" --profiles` or `sonarr-pogdesign-importer -c "[CONFIG PATH]" --profiles`.

**path**: Where Sonarr should store the series. Can be found by running `sonarr-pogdesign-importer --config="[CONFIG PATH]" --paths` or `sonarr-pogdesign-importer -c "[CONFIG PATH]" --paths`.

**useSeasonFolder**: If sonarr should create season folders for the series.

### Scrapers
**type**: Type must always be declared for each scraper. At this time it can be either `pogdesign` or `trakt`.

It is possible to add more scrapers as long as they have type `pogdesign` or `trakt`.
#### Pogdesign
**monthsForward**: Lookups up series from current month and X months in the future. 0 means only current month.

**minimumStars**: Minimum users who has given an interest in the series. Pogdesign writes "Selected by X Users"

#### Trakt
**apiKey**: Your own api key for Trakt.

**listName**: List that you want to crawl from on Trakt. Can be either `trending`, `popular`,`watched`, `collected` or `anticipated`

**minimumRating**: Minimum rating for a show to be imported to Sonarr. Must be between 0 and 100.

**startYear**: Start year for a show to be released after. If this is not specified it will look from current year.

**endYear** End year for a show to be released within. If this is not specified it will look 10 years ahead of current year.



Run from source
===============
1. Clone this repository.
2. Create config.json file
3. Change files in /src and transpile them to js by using the command `tsc` (you need to have tsc installed globally `npm i -g tsc`)
4. Go to /dist and run `node index --config="[CONFIG PATH]"` or `node index -c "[CONFIG PATH]"`

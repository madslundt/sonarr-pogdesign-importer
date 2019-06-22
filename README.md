About
====
Scrape tv series from either Pogdesign and/or Trakt and import them into Sonarr based on ratings and genre. Pogdesign rating is how many users have selected the tv show. Trakt rating is the rating from 0-100.
When the tv series have been found from Trakt and/or Pogdesign it is being looked up in Sonarr and based on the genre from Sonarr it is imported into Sonarr for later download.

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
            "toYear": 2020,
            "countries": ["us", "ca", "uk"],
            "languages": ["en"],
            "statuses": ["returning series", "in production", "planned"]
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

**listName**: List that you want to crawl from on Trakt. Can be either `trending`, `popular`,`watched`, `collected`, `anticipated` or `new`.

**minimumRating**: Minimum rating for a show to be imported to Sonarr. Must be between 0 and 100. Minimum rating is ignored when having list name set to `new`.

**startYear**: Start year for a show to be released after. If this is not specified it will look from current year. Start year is ignored when having list name set to `new`.

**endYear** End year for a show to be released within. If this is not specified it will be set to 10 years ahead of current year. End year is ignored when having list name set to `new`.

**countries** List of country codes you want only want to include. Example: `["us", "ca", "gb"]`.

**languages** List of languages you want only want to include. Example: `["en"]`.

**statuses** List of statuses you only want to include. Can be one or more of `returning series`, `in production`, `planned`, `canceled` or `ended`.

**networks** List of networks you only want to include. Example: `["HBO", "NBC", "CBS"]`.

#### Trakt Data Lookup

**To view all supported counties:**
(replace client_id with your api key)

```
curl --include \
     --header "Content-Type: application/json" \
     --header "trakt-api-version: 2" \
     --header "trakt-api-key: [client_id]" \
  'https://api.trakt.tv/countries/shows'
```

**To view all supported languages:**
(replace client_id with your api key)

```
curl --include \
     --header "Content-Type: application/json" \
     --header "trakt-api-version: 2" \
     --header "trakt-api-key: [client_id]" \
  'https://api.trakt.tv/languages/shows'
```

**To view all supported networks**
(replace client_id with your api key)

```
curl --include \
     --header "Content-Type: application/json" \
     --header "trakt-api-version: 2" \
     --header "trakt-api-key: [client_id]" \
  'https://api.trakt.tv/networks'
```

Run from source
===============
1. Clone this repository.
2. Create config.json file
3. Change files in /src and transpile them to js by using the command `tsc` (you need to have tsc installed globally `npm i -g typescript`)
4. Go to /dist and run `node index --config="[CONFIG PATH]"` or `node index -c "[CONFIG PATH]"`

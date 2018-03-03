# NUSMods API

The NUSMods API is comprised of backend projects that support our NUSMods
website by scraping and serving data.

## Structure

This API folder is set up to support both multiple scrapers and multiple
servers.

Currently, the NUSMods API consists of 2 projects. More information can be
found within their respective folders.

1. [NUS data scraper](https://github.com/nusmodifications/nusmods/tree/master/api/scrapers/nus)

    This scraper consolidates data from various NUS data sources, normalizes
    them and stores them in easy to use JSON files.

2. [Data server](https://github.com/nusmodifications/nusmods/tree/master/api/servers/data)

    Our REST API is documented here. Our new GraphQL data server is also
    implemented here.

The scrapers should store their data in a data folder. Once a scraper has been
run, this is what the `/api` directory should look like:

```
├── data      - Folder containing all scraped data
│   └── nus   - NUS data in static JSON files
├── scrapers  - Folder containing all data scrapers
│   └── nus   - NUS scrapers
└── servers   - Folder containing all API servers
    └── data  - GraphQL data server
```

## Contributing

Suggestions are very welcome, and if you have any particular needs for your app,
feel free to open an issue or pull request, or simply contact us directly.
We'd be happy to deploy any additional tasks to the live API site as well.

### What about other unis?

If you are from another university and would like to implement a scraper for
your uni, feel free to file an issue or just contact us! We already have some
half implemented scrapers for SMU [in an older
repo](https://github.com/nusmodifications/nusmods-api/tree/smu) but we don't
have the time to work on them.

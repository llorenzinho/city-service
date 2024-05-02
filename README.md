# City Scraping challenge

This service contains a **Nest JS** App which is used to:

- scrape data from [Agenzia delle entrate](https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/catalog.search#/home?pg=) website
- save scraped data into DB
- get data from DB

# Configuration

This section is on **How to run the app**

## Prerequisites

- Docker / Docker compose
- node (`v21.7.3`)
- yarn

## Development

Be sure your docker instance is running. Then install dependecies with `yarn install` (needed since the node_modules are synced from local dir).

Now run `docker compose up` and wait for the service to be up and running.

You can now visit [mongo-express](http://127.0.0.1:8081)
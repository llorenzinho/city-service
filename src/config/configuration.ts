export default () => ({
  app: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  database: {
    host: process.env.MONGO_HOST,
    port: parseInt(process.env.MONGO_PORT, 10) || 27017,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
  },
  puppeteer: {
    scrapingEndpoint: process.env.PUPPETEER_CITY_SCRAPER_ENDPOINT,
    slowMoMs: process.env.PUPPETEER_SLOW_MO_MS || null,
    headless: process.env.PUPPETEER_HEADLESS || true,
  },
});

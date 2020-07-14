const axios = require("axios");
const cheerio = require("cheerio");

class Scraper {}

exports.scrape = async (url, scrapper) => {
  const resp = await axios.get(url);
  const $ = cheerio.load(resp.data);
  return scrapper($);
};

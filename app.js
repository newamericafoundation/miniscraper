require('babel/register');

var Scraper = require('./scraper.js');

// Job description
var job = require('./jobs/education_sector/show.js');
//var job = require('./jobs/college_navigator/index.js');

var scraper = new Scraper(job, 0);

scraper.scrape();
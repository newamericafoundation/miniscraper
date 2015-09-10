require('babel/register');

var scraper = require('./scraper.js');

// Job description
var job = require('./jobs/education_sector/show.js');
//var job = require('./jobs/college_navigator/index.js');

scraper.scrape(job, 0);
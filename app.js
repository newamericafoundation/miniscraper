require('babel/register');

var fs = require('fs');
var json2csv = require('json2csv');

var Scraper = require('./src/scraper.js');

// Job description
var job = require('./jobs/education_sector/show.js');
//var job = require('./jobs/college_navigator/index.js');

var scraper = new Scraper(job);

scraper.scrape(function(data) { 
	json2csv({ data: data }, function(err, csv) {
		fs.writeFile(__dirname + '/temp/result.csv', csv, function(err) {
			if (err) { return console.dir(err); }
			console.log('Saved completed file. Bye!');
		});
	});
});
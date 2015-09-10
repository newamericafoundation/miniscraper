var fs = require('fs'),
    cheerio = require('cheerio'),
    tableParser = require('./table_parser.js'),
    request = require('request'),
    numeral = require('numeral'),
    json2csv = require('json2csv');

var scraper = {

	/*
	 * Search tables in an HTML section for a give data point.
	 * @param {object} $ - DOM image as a jQuery-like object.
	 * @param {object} options - Selector, table name, row name, column name and format.
	 */
	extractTableField: function($, location, options) {

	    var selector = location.selector,
	        tableName = location.tableName,
	        rowName = location.rowName,
	        columnName = location.columnName,
	        format = options ? options.format : false,
	        result;

	    $(selector).find('table').each(function() {
	        var innerMarkup = $(this).html(),
	            table = tableParser.getJson(innerMarkup);
	        if (table.name === tableName) {
	            result = table.data[rowName][columnName];
	        }
	    });

	    if (format) { result = numeral().unformat(result); }

	    return result;

	},

	extractAll: function($, location, options) {

		var selector = location.selector,
			attributeName = location.attributeName,
			list = [];

		$(selector).each(function() {
			var $el = $(this);
			var item = itemAttributeName ? $el.attr(attributeName) : $el.html();
		});

		return list;

	},

	extractOne: function($, location, options) {

		var selector = location.selector,
			attributeName = location.attributeName;

		var $el = $(selector);

		var item = attributeName ? $el.attr(attributeName) : $el.html();

		return item;

	},

	extractOneUrlAndSave: function($, location, options) {

		var self = this;

		var selector = location.selector,
			attributeName = location.attributeName;

		var $el = $(selector);

		var item = attributeName ? $el.attr(attributeName) : $el.html();

		if (item) {

			var fileUrl = options.urlPrefix + item;

			var fileName = fileUrl.slice(fileUrl.lastIndexOf('/') + 1);

			var requestOptions = {
				host: options.urlPrefix,
				port: 80,
				path: fileUrl
			};

			request(requestOptions, function(err, response, body) {

				fs.writeFile('jobs/' + self.job.id + '/results/' + options.downloadFolderName + '/' + fileName, body, function(err) {
					if(err) { return console.log(err); }
					console.log('write successful');
				});
			});

		}

		return item;

	},

	/*
	 * Scrape a single entry.
	 * @param {object} entry
	 * @param {function} next - Callback.
	 */
	scrapeEntry: function(entry, next) {

		var self = this;

	    if (entry.id == null) {
	        return next(entry);
	    }

	    request(self.job.getEntryUrl(entry), function(err, request, body) {

	        var $ = cheerio.load(body);

	        self.job.extractables.forEach(function(exbl) {
	        	entry[exbl.field] = scraper[exbl.extractMethodName]($, exbl.location, exbl.options);
	        });

	        next(entry);

	    });

	},

	/*
	 * Scrape entries.
	 * @param {array} entries
	 * @param {function} next - Callback.
	 */
	scrapeEntries: function(entries, next) {
		var self = this,
			length = entries.length,
			scraped = 0;

		console.log('Hello! Just started scraping ' + length + ' entries.');

		entries.forEach(function(entry) {

			self.scrapeEntry(entry, function() {
				scraped += 1;
				console.log('Scraped entry #' + scraped + '.');
				if (scraped === length) {
					console.log('Scraped all entries!')
					next(entries);
				}
			});

		});

	},

	/*
	 * Save entries as csv.
	 * @param {object} json
	 */
	saveCsv: function(json) {
		var self = this;
		console.log('saving csv..');
		json2csv({ data: json }, function(err, csv) {
		    if (err) console.log(err);
		    fs.writeFile('jobs/' + self.job.id + '/results/file.csv', csv, function(err) {
		        if (err) throw err;
		        console.log('Saved completed file. Bye!');
		    });
		});
	},

	/*
	 * Consolidate entries.
	 */
	beforeSave: function() {

	},

	/*
	 * Save entries as csv.
	 * @param {object} json
	 */
	saveJson: function(json) {
		var self = this;
		console.log('saving json..');
		fs.writeFile('jobs/' + self.job.id + '/results/' + self.job.saveFileName, JSON.stringify(json), function(err) {
		    if (err) throw err;
		    console.log('Saved completed file. Bye!');
		});
	},

	scrape: function(job, entriesIndex) {
		this.job = job;
		this.scrapeEntries(job.getEntries(entriesIndex), this.saveJson.bind(this));
	}

};

module.exports = scraper;
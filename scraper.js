var fs = require('fs'),
    cheerio = require('cheerio'),
    tableParser = require('./table_parser.js'),
    request = require('request'),
    numeral = require('numeral'),
    json2csv = require('json2csv');

class Scraper {

	constructor(job, entriesIndex) {
		this.job = job;
		this.entriesIndex = entriesIndex;
	}

	scrape() {
		var entries = this.job.getEntries(this.entriesIndex);
		entries = this.cleanEntries(entries);

		this.scrapeEntries(entries, this.saveJson.bind(this));
	}

	/*
	 * Removes entries that have a duplicate unique field.
	 *
	 */
	cleanEntries(entries) {
		var uniqueFieldValues = [],
			cleanedEntries = [];

		var uniqueField = this.job.uniqueEntryField;

		if (!uniqueField) { return entries; }

		entries.forEach((entry, i) => {
			var uniqueFieldValue = entry[uniqueField];
			if (uniqueFieldValues.indexOf(uniqueFieldValue) === -1) {
				cleanedEntries.push(entry);
				uniqueFieldValues.push(uniqueFieldValue);
			}
		});

		return cleanedEntries;
	}

	/*
	 * Search tables in an HTML section for a give data point.
	 * @param {object} $ - DOM image as a jQuery-like object.
	 * @param {object} options - Selector, table name, row name, column name and format.
	 */
	extractTableField($, location, options) {

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

	}

	extractAll($, location, options) {

		var selector = location.selector,
			attributeName = location.attributeName,
			list = [];

		$(selector).each(function() {
			var $el = $(this);
			var item = attributeName ? $el.attr(attributeName) : $el.html();
			list.push(item);
		});

		return list;

	}

	extractOne($, location, options) {

		var selector = location.selector,
			attributeName = location.attributeName;

		var $el = $(selector);

		var item = attributeName ? $el.attr(attributeName) : $el.html();

		return item;

	}

	extractOneUrlAndSave($, location, options, entryId) {

		var fileName;

		var self = this;

		var selector = location.selector,
			attributeName = location.attributeName;

		var $el = $(selector);

		var item = attributeName ? $el.attr(attributeName) : $el.html();

		if (item) {

			var fileUrl = options.urlPrefix + item;

			var fileName = fileUrl.slice(fileUrl.lastIndexOf('/') + 1);

			var newFileName = fileName.slice(0, -4) + '__' + entryId + fileName.slice(-4);

			console.log(newFileName);

			var requestOptions = {
				host: options.urlPrefix,
				port: 80,
				path: fileUrl
			};

			var writePath = 'jobs/' + this.job.id + '/results/' + options.downloadFolderName + '/' + fileName;

			request('http://' + fileUrl).pipe(fs.createWriteStream(writePath));

		}

		if(fileName) { return fileName; }

		return 'file_not_available';

	}

	/*
	 * Scrape a single entry.
	 * @param {object} entry
	 * @param {function} next - Callback.
	 */
	scrapeEntry(entry, next) {

		var self = this;

	    if (entry.id == null) {
	        return next(entry);
	    }

	    request(self.job.getEntryUrl(entry), function(err, request, body) {

	        var $ = cheerio.load(body);

	        self.job.extractables.forEach(function(exbl) {
	        	entry[exbl.field] = self[exbl.extractMethodName]($, exbl.location, exbl.options, entry.id);
	        });

	        next(entry);

	    });

	}

	/*
	 * Scrape entries.
	 * @param {array} entries
	 * @param {function} next - Callback.
	 */
	scrapeEntries(entries, next) {
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

	}

	/*
	 * Save entries as csv.
	 * @param {object} json
	 */
	saveCsv(json) {
		var self = this;
		console.log('saving csv..');
		json2csv({ data: json }, function(err, csv) {
		    if (err) console.log(err);
		    fs.writeFile('jobs/' + self.job.id + '/results/file.csv', csv, function(err) {
		        if (err) throw err;
		        console.log('Saved completed file. Bye!');
		    });
		});
	}

	/*
	 * Consolidate entries.
	 */
	beforeSave() {

	}

	/*
	 * Save entries as csv.
	 * @param {object} json
	 */
	saveJson(json) {
		var self = this;
		console.log('saving json..');
		fs.writeFile('jobs/' + self.job.id + '/results/' + self.job.saveFileName, JSON.stringify(json), function(err) {
		    if (err) throw err;
		    console.log('Saved completed file. Bye!');
		});
	}

};

module.exports = Scraper;
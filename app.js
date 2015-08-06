var fs = require('fs'),
    cheerio = require('cheerio'),
    tableParser = require('./table_parser.js'),
    request = require('./request.js'),
    numeral = require('numeral'),
    json2csv = require('json2csv');

// Job description
var job = {

	id: 'college_navigator',

	extractables: [
		{
			field: 'anbpy_2013_2014',
			selector: '#netprc',
	        tableName: 'Average net price by Income',
	        rowName: '$0 &#x2013; $30,000',
	        columnName: '2013-2014'
		},
		{
			field: 'pra',
			selector: '#finaid',
			tableName: 'Type of Aid',
			rowName: 'Pell grants',
			columnName: 'Percent receiving aid'
		}
	],

	entriesFiles: [
		'undermining-pell-publics.json',
		'undermining-pell-privates.json'
	],

	getEntries: function(index) {
		return require('./jobs/' + this.id + '/entries/' + this.entriesFiles[index]);
	},

	getEntryUrl: function(entry) {
		return require('./jobs/' + this.id + '/url.js')(entry);
	}

};

var scraper = {

	/*
	 * Search tables in an HTML section for a give data point.
	 * @param {object} $ - DOM image as a jQuery-like object.
	 * @param {object} options - Selector, table name, row name, column name and format.
	 */
	searchHtmlSectionTables: function($, options) {

	    var selector = options.selector,
	        tableName = options.tableName,
	        rowName = options.rowName,
	        columnName = options.columnName,
	        format = options.format,
	        result;

	    $(selector).find('table').each(function() {
	        var innerMarkup = $(this).html(),
	            table = tableParser.getJson(innerMarkup);
	        if (table.name === tableName) {
	            result = table.data[rowName][columnName];
	        }
	    });

	    if (format != null) {
	        result = numeral().unformat(result);
	    }

	    return result;

	},

	/*
	 * Scrape a single entry.
	 * @param {object} entry
	 * @param {function} next - Callback.
	 */
	scrapeEntry: function(entry, next) {

	    if (entry.id == null) {
	        return next(entry);
	    }

	    request(job.getEntryUrl(entry), function(markup) {
	        var $ = cheerio.load(markup);

	        entry.anpby_2013_2014_raw = scraper.searchHtmlSectionTables($, {
	            selector: '#netprc',
	            tableName: 'Average net price by Income',
	            rowName: '$0 &#x2013; $30,000',
	            columnName: '2013-2014'
	        });

	        entry.pra_raw = scraper.searchHtmlSectionTables($, {
	            selector: '#finaid',
	            tableName: 'Type of Aid',
	            rowName: 'Pell grants',
	            columnName: 'Percent receiving aid'
	        });

	        entry.anpby_2013_2014 = scraper.searchHtmlSectionTables($, {
	            selector: '#netprc',
	            tableName: 'Average net price by Income',
	            rowName: '$0 &#x2013; $30,000',
	            columnName: '2013-2014',
	            format: true
	        });

	        entry.pra = scraper.searchHtmlSectionTables($, {
	            selector: '#finaid',
	            tableName: 'Type of Aid',
	            rowName: 'Pell grants',
	            columnName: 'Percent receiving aid',
	            format: true
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
		var length = entries.length,
			scraped = 0;

		console.log('Hello! Just started scraping ' + length + ' entries.');

		entries.forEach(function(entry) {
			scraper.scrapeEntry(entry, function() {
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
	 * Save csv.
	 * @param {object} json
	 */
	saveCsv: function(json) {
		console.log('saving csv..');
		json2csv({ data: json }, function(err, csv) {
		    if (err) console.log(err);
		    fs.writeFile('jobs/' + job.id + '/results/file.csv', csv, function(err) {
		        if (err) throw err;
		        console.log('Saved completed file. Bye!');
		    });
		});
	},

	scrape: function(job, entriesIndex) {
		this.job = job;
		this.entriesIndex = entriesIndex;
	}

};

scraper.scrapeEntries(job.getEntries(0), scraper.saveCsv);
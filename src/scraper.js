import fs from 'fs';
import cheerio from 'cheerio';
import request from 'request';
import numeral from 'numeral';
import Extractor from './extractor.js';
import json2csv from 'json2csv';

class Scraper {

	/*
	 * Initialize a scraper with a scraping job.
	 */
	constructor(job) {
		this.job = job;
	}

	/*
	 * Main entry point to the scraping process.
	 * @param {function} next - Callback.
	 */
	scrape(next) {
		var entries = this.job.getEntries();
		next = next || this.saveJson.bind(this);
		entries = this.cleanEntries(entries);
		this.scrapeEntries(entries, next);
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
	 * Scrape a single entry, executing callback when ready.
	 * @param {object} entry
	 * @param {function} next - Callback.
	 */
	scrapeEntry(entry, next) {

		var self = this;

	    // if (!entry.id) { return next(entry); }

	    request(self.job.getEntryUrl(entry), (err, request, body) => {

	        var $ = cheerio.load(body),
	        	extractor = new Extractor($);

	        self.job.extractables.forEach((exbl) => {
	        	entry[exbl.field] = extractor[exbl.extractMethodName](exbl.location, exbl.options);
	        });

	        next(entry);

	    });

	}

	/*
	 * Scrape entries, counting each individual asynchronous scrape operation and executing callback when all are done.
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

};

module.exports = Scraper;
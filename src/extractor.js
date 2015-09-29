// Class containing different data extraction methods.

import request from 'request';
import tableParser from './util/table_parser.js';
import fs from 'fs';

class Extractor {

	constructor($, location, options) {
		this.$ = $;
		this.location = location;
		this.options = options;
	}

	/*
	 * Search tables in an HTML section for a give data point.
	 * @param {object} $ - DOM image as a jQuery-like object.
	 * @param {object} options - Selector, table name, row name, column name and format.
	 */
	extractTableField(location, options) {

		var { $ } = this;

		var { selector, tableName, rowName, columnName } = location,
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

	/*
	 * Extract list of items.
	 *
	 */
	extractAll(location, options) {

		var { $ } = this;

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

	/*
	 * Extract single item.
	 *
	 */
	extractOne(location, options) {

		var { $ } = this;

		var selector = location.selector,
			attributeName = location.attributeName;

		var $el = $(selector);

		var item = attributeName ? $el.attr(attributeName) : $el.html();

		return item;

	}

	extractOneUrlAndSave(location, options) {

		var { $ } = this;

		var fileName;

		var self = this;

		var { selector, attributeName } = location;

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

			var writePath = 'temp/downloads/' + fileName;

			request('http://' + fileUrl).pipe(fs.createWriteStream(writePath));

		}

		if(fileName) { return fileName; }

		return 'file_not_available';

	}

	extractDescriptionListField(location, options) {

		var { $ } = this,
			result = '';

		var { rowName, selector, attributeName } = location;

		var $el = $(selector);

		$el.find('dt').each(function(i) {
			if ($(this).html() === rowName) {
				let $targetEl = $(this).next();
				result = attributeName ? $targetEl.attr(attributeName) : $targetEl.html();
			}
		});

		return result;

	}

}

export default Extractor;
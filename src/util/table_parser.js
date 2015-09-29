var cheerio = require('cheerio');

var tableParser = {

	assembleJson: function(headRow, bodyRows) {
		var json = {
			name: (!headRow[0]) || (headRow[0] === '') ? 'untitled' : headRow[0],
			data: {}
		};
		bodyRows.forEach(function(row) {
			json.data[row[0]] = {};
			row.forEach(function(item, i) {
				if (i !== 0) { json.data[row[0]][headRow[i]] = item; }
			});
		});
		return json;
	},

	extractRows: function(innerMarkup) {
		var $ = cheerio.load(innerMarkup),
			headRow = [],
			bodyRows = [],
			bodyRow;
		$('thead th').each(function() {
			headRow.push($(this).html());
		});
		$('tbody tr').each(function() {
			bodyRow = [];
			$(this).find('td').each(function() {
				bodyRow.push($(this).html());
			});
			bodyRows.push(bodyRow);
		});
		return {
			headRow: headRow,
			bodyRows: bodyRows
		};
	},

	getJson: function(innerMarkup) {
		var extracted = this.extractRows(innerMarkup);
		return this.assembleJson(extracted.headRow, extracted.bodyRows);
	}

};

module.exports = tableParser;
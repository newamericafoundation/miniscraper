var entries = require('./entries/papers.json');

module.exports = {

	id: 'education_sector',

	extractables: [

		{
			field: 'urls',
			extractMethodName: 'extractAll',
			location: {
				selector: '#mainColumn h3',
				attributeName: null
			}
		}

	],

	getEntries: function() {
		return entries;
	},

	getEntryUrl: function(entry) {
		return entry.url;
	}

};
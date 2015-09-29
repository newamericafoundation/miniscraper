var entries = [
	require('./entries/analysis.json')
];

module.exports = {

	id: 'education_sector',

	extractables: [

		{
			field: 'urls',
			extractMethodName: 'extractAll',
			location: {
				selector: '#zone2 h4 > a',
				attributeName: 'href'
			}
		}

	],

	getEntries: function() {
		return entries[0];
	},

	getEntryUrl: function(entry) {
		return entry.url;
	}

};
var entries = [
	require('./entries/research.json')
];

module.exports = {

	id: 'education_sector',

	saveFileName: 'es_index.json',

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
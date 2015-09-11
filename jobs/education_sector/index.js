var entries = [
	require('./entries/research_1.json')
];

module.exports = {

	id: 'education_sector',

	saveFileName: 'es_index_1.json',

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

	getEntries: function(index) {
		return entries[index];
	},

	getEntryUrl: function(entry) {
		return entry.url;
	}

};
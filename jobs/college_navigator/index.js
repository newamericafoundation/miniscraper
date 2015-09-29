var entries = [
	require('./entries/undermining-pell-publics.json'),
	require('./entries/undermining-pell-privates.json'),
];

// Job description
module.exports = {

	id: 'college_navigator',

	saveFileName: '1.json',

	extractables: [
		{
			field: 'anbpy_2013_2014',
			extractMethodName: 'extractTableField',
			location: {
				selector: '#netprc',
		        tableName: 'Average net price by Income',
		        rowName: '$0 &#x2013; $30,000',
		        columnName: '2013-2014'
			}
		},
		{
			field: 'pra',
			extractMethodName: 'extractTableField',
			location: {
				selector: '#finaid',
				tableName: 'Type of Aid',
				rowName: 'Pell grants',
				columnName: 'Percent receiving aid'
			}
		}
	],

	getEntries: function() {
		return entries[0];
	},

	getEntryUrl: function(entry) {
		return 'http://nces.ed.gov/collegenavigator/?id=' + entry.id;
	}

};
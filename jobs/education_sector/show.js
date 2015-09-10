var entries = [
	require('./entries/show.json')
];

module.exports = {

	id: 'education_sector',

	saveFileName: 'es_show.json',

	extractables: [

		{
			field: 'title',
			extractMethodName: 'extractOne',
			location: {
				selector: '.containerCntDetails h4'
			}
		},

		{
			field: 'subtitle',
			extractMethodName: 'extractOne',
			location: {
				selector: '.containerCntDetails h5.subtitle'
			}
		},

		{
			field: 'file_url',
			extractMethodName: 'extractOne',
			location: {
				selector: '.attachments a',
				attributeName: 'href'
			}
		},

		{
			field: 'file',
			urlPrefix: 'web.archive.org',
			extractMethodName: 'extractOneUrlAndSave',
			location: {
				selector: '.attachments a',
				attributeName: 'href'
			},
			options: {
				urlPrefix: 'web.archive.org',
				downloadFolderName: 'attachments'
			}
		}

	],

	getEntries: function(index) {
		return entries[index];
	},

	getEntryUrl: function(entry) {
		return 'http://web.archive.org/web/20100412190211/http://www.educationsector.org/research/' + entry.urlFragment;
	}

};
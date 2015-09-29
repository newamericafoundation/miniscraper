A scraping utility for highly customized mass-data collection.

# Usage

The main scraper module expects a ``job`` object as follows:

	var job = {

		id: 'find_favorite_foods',

		saveFileName: 'cartoon_characters.json',

		extractables: [
			{
				field: 'favorite_food',
				extractMethodName: 'extractOne',
				location: {
					selector: '.favorite-food p'
				}
			}
		],

		getEntries: function() {
			return [
				{
					name: 'Jerry',
					species: 'mouse'
				},
				{
					name: 'Tom',
					species: 'cat'
				}
			];
		},

		// The URL where the entry can be found, e.g. http://www.cartoonnetwork.com/jerry-mouse
		getEntryUrl: function(entry) {
			return ('http://www.cartoonnetwork.com/' + entry.name + '-' + entry.species);
		}

	};

The scraper generates a new, extended JSON object of the new entries by scraping each corresponding URL for the inner html of ``.favorite-food p``. The following code:

	var scraper = new Scraper(job);

	scraper.scrape(function(data) {
		console.log(data);
	});

Will log:

	{
		name: 'Jerry',
		species: 'mouse',
		favorite_food: 'cheese'
	},
	{
		name: 'Tom',
		species: 'cat',
		favorite_food: 'milk'
	}

# Customize

This scraper implements a range of further options to handle multiple extracts, table lookups and file downloads. Here are the available customization options for ``job`` fields.

## extractMethodName

This option accepts the following method names implemented on scraper:
* extractOne
* extractAll
* extractAndDownloadUrl

Extend from the scraper class  
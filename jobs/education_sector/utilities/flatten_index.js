var fs = require('fs');

fs.readFile('./jobs/education_sector/results/es_index.json', 'utf-8', function(err, file) {
	if (err) { return console.dir(err); }
	var json = JSON.parse(file);
	var arr = [];
	json.forEach(function(obj) {
		arr = arr.concat(arr, obj.urls);
	});
	arr = arr.map(function(item, i) {
		return {
			id: i,
			urlFragment: item
		};
	});
	fs.writeFile('./jobs/education_sector/entries/show.json', JSON.stringify(arr), function(err) {
		if (err) { return console.log(err); }
		console.log('saved successfully');
	});
});
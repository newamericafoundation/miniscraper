var http = require('follow-redirects').http;

var request = function(url, next) {

	http.request(url, function(resp) {

		var str = '';

		resp.on('data', function(chunk) {
			str += chunk;
		});

		resp.on('end', function() {
			if (str === '') { console.log('empty response'); }
			next(str);
		});

		resp.on('error', function() {
			console.log('error');
			next('');
		});

	}).end();

};

module.exports = request;
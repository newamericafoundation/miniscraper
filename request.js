var http = require('http');

var request = function(url, next) {

	http.request(url, function(resp) {

		var str = '';

		resp.on('data', function(chunk) {
			str += chunk;
		});

		resp.on('end', function() {
			next(str);
		});

	}).end();

};

module.exports = request;
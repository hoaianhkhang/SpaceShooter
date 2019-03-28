var http = require('http');
var fs = require('fs');
var url = require('url');
var mime = require('mime');

http.createServer(function(req, res)
{

	var requestedFile = url.parse(req.url, true);
	var file = "." + requestedFile.pathname;

	fs.readFile(file, function(err, data)
	{

		if(err)
		{

			res.writeHead(404, {'Content-Type': 'text/html'});

			return res.end("404 Not Found");

		}

		res.writeHead(200, {'Content-Type': mime.getType(file)});
		res.write(data);
		return res.end();

	});

}).listen(8080);

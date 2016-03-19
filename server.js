var http = require('http');
var fs = require('fs');
var url = require('url');

var port = 8080;

var httpServer = http.createServer(requestHandler);
httpServer.listen(port, function(){
	console.log('server started on port', port);
});

function requestHandler(req, res){
	var parsedUrl = url.parse(req.url);
	var path = parsedUrl.pathname;
	if(path == '/'){
		path = '/multitrack-eartrainer/index.html';
	}

	fs.readFile('public' + path, function(err, data){
		if(err){
			res.writeHead(500);
			return res.end('Error loading page',req.url);
		}

		res.writeHead(200); //200 is success code
		res.end(data);
	});
}

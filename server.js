var http = require('http');
var fs = require('fs');

var port = 8080;

var httpServer = http.createServer(requestHandler);
httpServer.listen(port, function(){
	console.log('server started on port', port);
});

function requestHandler(request, response){
	console.log(request.url);
	fs.readFile('public'+request.url, function(err, data){
		if(err){
			response.writeHead(500);
			return response.end('please specify a route');
		}

		response.writeHead(200); //200 is success code
		response.end(data);
	});
}

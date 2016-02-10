var http = require('http');
var fs = require('fs');

var httpServer = http.createServer(requestHandler);
httpServer.listen(8080, function(){
	console.log('server started on port 80');
});

function requestHandler(request, response){
	console.log(request.url);
	fs.readFile('public'+request.url, function(err, data){
		if(err){
			response.writeHead(500);
			return response.end('Error loading canvas_socket.html');
		}

		response.writeHead(200); //200 is success code
		response.end(data);
	});
}
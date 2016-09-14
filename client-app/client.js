var express = require("express");
var app = express();

var path = __dirname + '/public/';

app.use(express.static(__dirname + '/public'));

app.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

app.get("/hello", function(req, res){
  var path = '/hello-world';

  sayHelloToServer(res, path);
});

app.get("/hello/:name", function(req, res){

  var name = req.params.name;
  var path = '/hello-world?name=' + name;

  sayHelloToServer(res, path);
});

function sayHelloToServer(res, path){
  var http = require('http');

  var options = {
      host: '172.18.0.22',
      port: 8080,
      path: path,
      headers: {
          'Content-Type': 'application/json'
      }
  };

  var callback = function(response){
     var body = '';
     response.on('data', function(data) {
        body += data;
     });

     response.on('end', function() {
        res.send(body);
     });

  }

  var request = http.request(options, callback);
  request.on('error', function() {
  });

  request.end();
}


app.listen(3000, function(){
  console.log("Live at Port 3000");
});

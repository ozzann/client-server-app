var express = require("express");
var app = express();

var path = __dirname + '/public/';

app.use(express.static(__dirname + '/public'));

app.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

app.get("/hello", function(req, res){
  var path = '/hello-world';

console.log("Hello!");

  sayHelloToServer(res, path);
});

app.get("/hello/:name", function(req, res){

  var name = req.params.name;
  var path = '/hello-world?name=' + name;

  sayHelloToServer(res, path);
});


function sayHelloToServer(res, path){

  var request = require("request");

  var fullUrl = 'http://172.18.0.22:8080' + path;
  var options = {
    url: fullUrl,
    timeout: 500,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonBody = JSON.parse(body);
      res.send(jsonBody);
    }
  }


  request(options, callback);
}


app.listen(3000, function(){
  console.log("Live at Port 3000");
});

module.exports.getApp = app;

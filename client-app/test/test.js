

var nock = require('nock');
var request = require('supertest');
var expect = require('chai').expect;

var app = require("../src/client.js").getApp;

describe('GET /hello', function() {

    it("server should return default message", function(done) {

      nock("http://172.18.0.22:8080")
      .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/hello-world')
        .reply(200, {"id":1,"content":"Hello, world!"});

      request(app)
      .get('/hello/')
      .end(function (err, res) {
        //assert that the mocked response is returned
        expect(res.body.id).to.equal(1);
        expect(res.body.content).to.equal("Hello, world!");
        done();
      });

    });
  });

  describe('GET /hello/NAME', function() {

    it("server should respond with special greetings for the client", function(done) {

      var name = "client";
      var path = '/hello-world?name=' + name;

      nock("http://172.18.0.22:8080")
      .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(path)
        .reply(200, {"id":1,"content":"Hello, client!"});

      request(app)
      .get('/hello/client')
      .end(function (err, res) {
        //assert that the mocked response is returned
        expect(res.body.id).to.equal(1);
        expect(res.body.content).to.equal("Hello, client!");
        done();
      });

    });
  });

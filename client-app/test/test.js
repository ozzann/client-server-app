

var nock = require('nock');
var request = require('supertest');
var expect = require('chai').expect;

var app = require("../client.js").getApp;

describe('GET /hello', function() {

    it("should return server's response be default", function(done) {

      nock("http://172.18.0.22:9080")
      .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/hello-world')
        .reply(200, {
          "id": 1,
          "content": "Hello, world!"
        });

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

    it("should return server's special greetings for client", function(done) {

      var name = "client";
      var path = '/hello-world?name=' + name;

      nock("http://172.18.0.22:9080")
      .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(path)
        .reply(200, {
          "id": 1,
          "content": "Hello, client!"
        });

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

"use strict";

var express = require("express");
var Router = require("./lib/Router");
var bodyParser = require("body-parser");
var app = express();

var router = new Router();
app.use(bodyParser.json());
app.use("/", router.router);

//the app is locally hosted at port 8081, or set to an environmental variable by the host
var server = app.listen(process.env.PORT || 8081, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log("Example app listening at http://%s:%s", host, port);

});

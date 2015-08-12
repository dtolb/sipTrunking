"use strict";

var catapult = require("node-bandwidth");
var express = require("express");
var bodyParser = require("body-parser");
var conf = require("./conf.json");

var Router = function (id, token, secret, domId) {
	var userId = id || conf.CATAPULT_USER_ID;
	var apiToken = token || conf.CATAPULT_API_TOKEN;
	var apiSecret = secret || conf.CATAPULT_API_SECRET;
	var domainId = domId || conf.SIP_TRUNKING_DOMAIN_ID;
	var client = new catapult.Client(userId, apiToken, apiSecret);
	var router = express.Router();
	var cors = require("cors");

	router.use(cors({
		origin : function (origin, callback) {
			callback(null, true);
		}
	}));

	router.use(bodyParser.json());
	router.use("/", express.static("public"));

	router.post("/calls/:name", function (req, res) {
		if (req.body.eventType === "answer") {
			catapult.Call.get(client, req.body.callId, function (err, call) {
				if (err) {
					res.sendStatus(500);
				}
				else if (req.body.from.substr(0, 4) === "sip:") {
					call.update({
						transferCallerId : "+18285525655",
						transferTo       : req.body.to,
						state            : "transferring" }, function (err) {
							if (err) {
								res.sendStatus(500);
							}
							else {
								res.send();
							}
						});
				}
				else {
					call.update({
						transferTo : "sip:" + req.params.name + "@siptrunking.bwapp.bwsip.io",
						state      : "transferring" }, function (err) {
							if (err) {
								res.sendStatus(500);
							}
							else {
								res.send();
							}
						});
				}
			});
		}
		else {
			res.send();
		}
	});

	router.get("/trunks", function (req, res) {
		catapult.Domain.get(client, domainId, function (err, domain) {
			if (err) {
				res.sendStatus(500);
			}
			else {
				domain.getEndPoints(function (err, endpoints) {
					if (err) {
						res.sendStatus(500);
					}
					else {
						res.status(200).send(endpoints);
					}
				});
			}
		});
	});

	router.post("/trunks", function (req, res) {
		console.log(req.body);
		catapult.Domain.get(client, domainId, function (err, domain) {
			if (err) {
				res.sendStatus(500);
			}
			else {
				catapult.Application.create(client,
					{ "name"          : req.body.name,
					"incomingCallUrl" : conf.NGROK_URL + "/calls/" + req.body.name },
					function (err, newApp) {
						if (err) {
							res.sendStatus(500);
						}
						else {
							domain.createEndPoint(
								{ "applicationId" : newApp.id,
								"name"            : req.body.name,
								"credentials"     : { "password" : "password" } }, function (err, point) {
									if (err) {
										res.sendStatus(500);
									}
									else {
										res.status(200).send(point);
									}
								});
						}
					});
			}
		});
	});

	router.get("/trunks/:trunkId/phoneNumbers", function (req, res) {
		var appId;
		catapult.Domain.get(client, domainId, function (err, domain) {
			if (err) {
				res.sendStatus(500);
			}
			else {
				domain.getEndPoints(function (err, endpoints) {
					for (var i = 0; i < endpoints.length; i++) {
						if (endpoints[i].name === req.params.trunkId) {
							appId = endpoints[i].applicationId;
						}
					}
					if (err) {
						res.sendStatus(500);
					}
					else {
						catapult.PhoneNumber.list(client,
							{ "applicationId" : appId },
							function (err, list) {
								if (err) {
									res.sendStatus(500);
								}
								else {
									res.status(200).send(list);
								}
							});
					}
				});
			}
		});
	});

	router.post("/trunks/:trunkId/phoneNumbers", function (req, res) {
		var appId;
		catapult.Domain.get(client, domainId, function (err, domain) {
			if (err) {
				res.sendStatus(500);
			}
			else {
				domain.getEndPoints(function (err, endpoints) {
					for (var i = 0; i < endpoints.length; i++) {
						if (endpoints[i].name === req.params.trunkId) {
							appId = endpoints[i].applicationId;
						}
					}
					if (err) {
						res.sendStatus(500);
					}
					else {
						catapult.AvailableNumber.searchLocal(client,
							{ "areaCode" : req.body.areaCode
							},
							function (err, numbers) {
								if (err) {
									res.sendStatus(500);
								}
								else {
									catapult.PhoneNumber.create(client,
									{ "applicationId" : appId,
									"number"          : numbers[0].number },
									function (err) {
										if (err) {
											res.sendStatus(500);
										}
										else {
											res.send();
										}
									});
								}
							});
					}
				});
			}
		});
	});

	this.router = router;
};

module.exports = Router;

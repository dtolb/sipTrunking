

function Model(){
	var self = this;
	this.trunks = ko.observable([]);
	this.selectedTrunk = ko.observable(null);
	this.newTrunkName = ko.observable("");
	this.manage = function (trunk) {
		if(self.selectedTrunk() == trunk.name){
			self.selectedTrunk(null);
		}else{
			trunk.loadNumbers();
			self.selectedTrunk(trunk.name);
		}
	};
	this.createTrunk = function(){
		$.ajax({
			type: "POST",
			url: "http://b4eda1e7.ngrok.io/trunks/",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({
				name: self.newTrunkName()
			}),
			success: function () {
				loadTrunks();
			}
		});
	};
}

function Trunk(info){
	var self = this;
	this.name = info.name;
	this.sipUri = info.sipUri;
	this.numbers = ko.observable([]);
	this.areaCode = ko.observable("");
	this.newNumber = function (){
		console.log("new number: ", this.name);
		$.ajax({
			type: "POST",
			url: "http://b4eda1e7.ngrok.io/trunks/" + self.name + "/phoneNumbers",
			contentType: "application/json",
			data: JSON.stringify({
				areaCode: self.areaCode()
			}),
			success: function () {
				console.log("allocate success");
				self.loadNumbers();
			}
		});
	}
}
Trunk.prototype.loadNumbers = function () {
	console.log("load numbers");
	var self = this;
	$.ajax({
		type: "GET",
		url: "http://b4eda1e7.ngrok.io/trunks/" + this.name + "/phoneNumbers",
		success: function (data) {
			console.log(data);
			var numbers = [];
			for(var a=0; a<data.length; a++){
				numbers.push(data[a]);
			}
			self.numbers(numbers);
		}
	});
}

var model = new Model();
$(function () {
	ko.applyBindings(model);
	loadTrunks();
});

function loadTrunks(){
	$.ajax({
		type: "GET",
		url: "http://b4eda1e7.ngrok.io/trunks",
		success: function (data) {
			console.log(data);
			var trunks = [];
			for(var a=0; a<data.length; a++){
				trunks.push(new Trunk(data[a]))
			}
			model.trunks(trunks);
		}
	});
}
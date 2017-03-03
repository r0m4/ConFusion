var express = require('express');
var bodyParser = require('body-parser');	
var morgan = require('morgan');
var mongoose = require('mongoose');

var Leaders = require('../models/leadership')


var leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());
leaderRouter.route('/')



.get(function(req, res, next){
	
	Leaders.find({}, function(err, dish) {
		if(err)throw err;
		res.json(dish);
	});

})

.post(function(req, res, next){
	
	Leaders.create(req.body, function (err, dish) {
		if (err) throw err;

		console.log('Dish created!');
		var id = dish._id;
		res.writeHead(200, {
			'Content-Type': 'text/plain'
		});

		res.end('Added the dish with id: ' + id);
	});
})

.delete(function(req, res, next) {
	Leaders.remove({}, function(err, resp) {
		if (err) throw err;
		res.json(resp);
	})
});



leaderRouter.route('/:leaderId')

.get( function(req, res, next) {
	
	Leaders.findById(req.params.leaderId, function (err, dish) {
		if (err) throw err;

		res.json(dish);
	});
})

.put( function(req, res, next) {
	
	Leaders.findByIdAndUpdate(req.params.leaderId, {
		$set: req.body
	}, {
		new:true
	}, function(err, dish) {
		if(err) throw err;

		res.json(dish);
	});

})

.delete(function(req, res, next) {
	
	Leaders.remove(req.params.leaderId, function(err, resp) {
		if (err) throw err;
		res.json(resp);
	});
});

module.exports = leaderRouter;
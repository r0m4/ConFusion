var express = require('express');
var bodyParser = require('body-parser');	
var morgan = require('morgan');
var mongoose = require('mongoose');

var Promotions = require('../models/promotions')


var promoRouter = express.Router();
promoRouter.use(bodyParser.json());
promoRouter.route('/')



.get(function(req, res, next){
	
	Promotions.find({}, function(err, dish) {
		if(err)throw err;
		res.json(dish);
	});

})

.post(function(req, res, next){
	
	Promotions.create(req.body, function (err, dish) {
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
	Promotions.remove({}, function(err, resp) {
		if (err) throw err;
		res.json(resp);
	})
});



promoRouter.route('/:promoId')

.get( function(req, res, next) {
	
	Promotions.findById(req.params.promoId, function (err, dish) {
		if (err) throw err;

		res.json(dish);
	});
})

.put( function(req, res, next) {
	
	Promotions.findByIdAndUpdate(req.params.promoId, {
		$set: req.body
	}, {
		new:true
	}, function(err, dish) {
		if(err) throw err;

		res.json(dish);
	});

})

.delete(function(req, res, next) {
	
	Promotions.remove(req.params.promoId, function(err, resp) {
		if (err) throw err;
		res.json(resp);
	});
});

module.exports = promoRouter;
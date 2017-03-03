var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
//.all(Verify.verifyOrdinaryUser, Verify.verifyAdmin)

// Save a favorite dish for this user
.post(function(req, res, next){

  var userId = req.decoded._id;

  Favorites.findOneAndUpdate(
      { 'postedBy' : userId }, // get the favorites for this user
      { $addToSet: { dishes: req.body }}, // save favorite but avoid duplicating the dish
      { upsert: true, // create a favorites list for this user if not already existing
       new: true },  // return the updated document
      function ( err, favorite ) {
          if (err) next (err);
          res.json(favorite);
      }
  );
})

// Retrieve favorites associated with user
.get(function(req,res,next){

    var userId = req.decoded._id;
    Favorites.find({ 'postedBy' : userId })
        .populate('postedBy')
        .populate('dishes')
        .populate('dishes.comments')
        .exec( function(err, favorite) {
            if (err) next (err);
            res.json(favorite);
        });
})

// Delete all favorites for this user
.delete(function(req, res, next){

  var userId = req.decoded._id;

  // Capture the favorites prior to deletion for return in result
  Favorites.find({ 'postedBy' : userId }, function(err, favorite) {
      if (err) next (err);

      Favorites.remove({ 'postedBy' : userId }, function (err, resp) {
        if (err) next (err);
        res.json(favorite);
      });
  });
});

favoriteRouter.route('/:dishId')
.all(Verify.verifyOrdinaryUser)

// Delete a specific favorite for this user
.delete(function(req, res, next){

    var userId = req.decoded._id;
    var favoriteToRemove = req.params.dishId;

    Favorites.update(
        { 'postedBy' : userId },
        { $pull: { 'dishes': favoriteToRemove } },
        { new: true }, function (err, resp) {
            if (err) next (err);

            // Now return the modified user favorites after deletion
            Favorites.find({ 'postedBy' : userId }, function(err, favorite) {
                if (err) next (err);
                res.json(favorite);
        });
    });
});

module.exports = favoriteRouter;
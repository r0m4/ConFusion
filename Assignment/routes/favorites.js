
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Dishes = require('../models/dishes');
var verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')

  .all(verify.verifyOrdinaryUser)

  .get(function (req, res, next) {
        Favorites.find({'postedBy': req.decoded._doc._id})
            .populate(['postedBy', 'dishes'])
            .exec(function (err, favorites) {
                if (err) return err;
                res.json(favorites);
            });
    })

 .post(function (req, res, next) {
        Favorites.find({'postedBy': req.decoded._doc._id})
            .exec(function (err, favorites) {
                if (err) throw err;
                req.body.postedBy = req.decoded._doc._id;

                if (favorites.length) {
                    var favoriteAlreadyExist = false;
                    if (favorites[0].dishes.length) {
                        for (var i = (favorites[0].dishes.length - 1); i >= 0; i--) {
                            favoriteAlreadyExist = favorites[0].dishes[i] == req.body._id;
                            if (favoriteAlreadyExist) break;
                        }
                    }
                    if (!favoriteAlreadyExist) {
                        favorites[0].dishes.push(req.body._id);
                        favorites[0].save(function (err, favorite) {
                            if (err) throw err;
                            console.log('This dish is already in the favorites list!');
                            res.json(favorite);
                        });
                    } else {
                        console.log('Setup!');
                        res.json(favorites);
                    }

                } else {

                    Favorites.create({postedBy: req.body.postedBy}, function (err, favorite) {
                        if (err) throw err;
                        favorite.dishes.push(req.body._id);
                        favorite.save(function (err, favorite) {
                            if (err) throw err;
                            console.log('A new favorite dish is added to the list!');
                            res.json(favorite);
                        });
                    })
                }
            });
    })

delete(function (req, res, next) {
        Favorites.remove({'postedBy': req.decoded._doc._id}, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        })
    });


favoriteRouter.route('/:objectId')
    .all(verify.verifyOrdinaryUser)

    .get(function(req, res, next){
        Favorites.findById(req.params.objectId)
        .populate(['postedBy', 'dishes'])
        .exec(function(err, fav){
            if (err) throw err;
            res.json(fav);
        });
    })

    .put(function(req, res, next){
        Favorites.findByIdAndUpdate(req.params.objectId, {
            $set: req.body
        },{
            new: true
        }, function(err, fav){
            if (err) throw err;
            // Delete the recent comment then add the new one
            fav.id(req.params.objectId).remove();
            req.body.createdBy = req.decoded._doc._id;
            fav.push(req.body);

            fav.save(function(err, fav){
                if(err) throw err;

                console.log('Updated comments!');
                res.json(fav);
            });
        });
    })

    .delete(function (req, res, next) {
        Favorites.findById({'postedBy': req.decoded._doc._id}, 
                       function (err, favorites) {
            if (err) return err;
            var favorite = favorites ? favorites[0] : null;

            if (favorite) {
                for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
                    if (favorite.dishes[i] == req.params.dishId) {
                        favorite.dishes.remove(req.params.dishId);
                    }
                }
                favorite.save(function (err, favorite) {
                    if (err) throw err;
                    res.json(favorite);
                });
            } else {
                console.log('');
                res.json(favorite);
            }

        });
    });

module.exports = favoriteRouter;

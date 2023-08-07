var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const authenticate = require("../authenticate");
var Phones = require('../models/phones');
const cors = require('./cors');

var phoneRouter = express.Router();
phoneRouter.use(bodyParser.json());

phoneRouter.route('/')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.get(cors.cors, function (req, res, next) {
    Phones.find(req.query)
        .exec(function (err, phone) {
        if (err) throw err;
        res.json(phone);
    });
})

.post(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
    Phones.create(req.body, function (err, phone) {
        if (err) throw err;
        console.log('Phone added!');
        var id = phone._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Post Completed');
    });
})

.delete(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
    Phones.deleteMany({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

phoneRouter.route('/:phoneId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.get(cors.cors, function(req, res, next) {
    Phones.findById(req.params.phoneId)
        .exec(function (err, dish) {
        if (err) throw err;
        res.json(dish);
    });
})

.put(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
    Phones.findByIdAndUpdate(req.params.phoneId, {
        $set: req.body
    }, {
        new: true
    }, function (err, dish) {
        if (err) throw err;
        res.json(dish);
    });
})

.delete(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
        Phones.findByIdAndRemove(req.params.phoneId, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

phoneRouter.route('/:phoneId/comments')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.all(authenticate.verifyUser)

.get(cors.cors, function (req, res, next) {
    Phones.findById(req.params.phoneId)
        .exec(function (err, dish) {
        if (err) throw err;
        res.json(dish.comments);
    });
})
.post(cors.corsWithOptions, function (req, res, next) {
    Phones.findById(req.params.phoneId, function (err, dish) {
        if (err) throw err;
        req.body.postedBy = req.decoded._doc._id;
        dish.comments.push(req.body);
        dish.save(function (err, dish) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, function (req, res, next) {
    Phones.findById(req.params.phoneId, function (err, dish) {
        if (err) throw err;
        for (var i = (dish.comments.length - 1); i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).deleteMany();
        }

        dish.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

phoneRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.all(authenticate.verifyUser)

.get(cors.cors, function (req, res, next) {
    Phones.findById(req.params.dishId)
        .exec(function (err, dish) {
        if (err) throw err;
        res.json(dish.comments.id(req.params.commentId));
    });
})

.put(cors.corsWithOptions, function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Phones.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        dish.comments.id(req.params.commentId).remove();
                req.body.postedBy = req.decoded._doc._id;
        dish.comments.push(req.body);
        dish.save(function (err, dish) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})

.delete(cors.corsWithOptions, function (req, res, next) {
    Phones.findById(req.params.dishId, function (err, dish) {
        if (dish.comments.id(req.params.commentId).postedBy
           != req.decoded._doc._id) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        dish.comments.id(req.params.commentId).deleteOne();
        dish.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});
module.exports = phoneRouter;
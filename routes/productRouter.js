var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Product = require('../models/product');
const cors = require('./cors');

var productRouter = express.Router();
productRouter.use(bodyParser.json());

productRouter.route('/')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.get(cors.cors, function (req, res, next) {
    Product.find(req.query)
    .populate('comments.author')
    .then((products) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(products);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, function (req, res, next) {
    Product.create(req.body, function (err, product) {
        if (err) throw err;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Post Completed');
    });
})

.delete(cors.corsWithOptions, function (req, res, next) {
    Product.deleteMany({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

productRouter.route('/:Id')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.get(cors.cors, function (req, res, next) {
    Product.findById(req.params.Id)
    .populate('comments.author')
    .then((product) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(product);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, function (req, res, next) {
    Product.findByIdAndUpdate(req.params.Id, {
        $set: req.body
    }, {
        new: true
    }, function (err, product) {
        if (err) throw err;
        res.json(product);
    });
})

.delete(cors.corsWithOptions, function (req, res, next) {
        Product.findByIdAndRemove(req.params.Id, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

productRouter.route('/:Id/comments')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.all(authenticate.verifyUser)
.get(cors.cors, function (req, res, next) {
    Product.findById(req.params.Id)
    .populate('comments.author')    
    .exec(function (err, product) {
        if (err) throw err;
        res.json(product.comments);
    });
})

.post(cors.corsWithOptions, function (req, res, next) {
    Product.findById(req.params.Id)
    .then((product) => {
        if (product != null) {
          req.body.author = req.user._id;

            product.comments.push(req.body);
            product.save()
            .then((product) => {
                Product.findById(product._id)
                .populate('comments.author')
                .then((product) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(product);
                })            
            }, (err) => next(err));
        }
        else {
            err = new Error('product ' + req.params.Id + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, function(req, res, next) {
    Product.findById(req.params.Id, function (err, product) {
        if (err) throw err;
        if (req.user._id !== product.comments.author)
        for (var i = (product.comments.length - 1); i >= 0; i--) {
            product.comments.id(product.comments[i]._id).remove();
        }

        product.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});
 
productRouter.route('/:Id/comments/:commentId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.all(authenticate.verifyUser)
.get(cors.cors, function (req, res, next) {
    Product.findById(req.params.Id)
    .populate('comments.author')
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error(' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment  not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, function (req, res, next) {
    
    Product.findById(req.params.Id)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            product.save()
            .then((dish) => {
                Product.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })              
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, function (req, res, next) {
    Product.findById(req.params.Id)
    .then((product) => {
        if (product != null && product.comments.id(req.params.commentId) != null) {

            product.comments.id(req.params.commentId).remove();
            product.save()
            .then((dish) => {
                Product.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })               
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});
module.exports = productRouter;
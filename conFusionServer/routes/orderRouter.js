var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const authenticate = require("../authenticate");
var Order = require('../models/order');
const cors = require('./cors');

var orderRouter = express.Router();
orderRouter.use(bodyParser.json());

orderRouter.route('/')
.options(cors.cors, (req,res) => { res.sendStatus(200)})
.get(cors.corsWithOptions, function (req, res, next) {
    Order.find(req.query)
    
    .then((order) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(order);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
    var order = {
        user: req.user._id,
        cart: req.user.cart,
        address: req.user.address,
        name: req.user.firstname + req.user.lastname,
        paymentId: req.body.paymentId
    }
    Order.create(order, function (err, order) {
        if (err) throw err;
        console.log('order created!');
        res.json(order);
    });
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
    Order.deleteMany({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});
module.exports = orderRouter;
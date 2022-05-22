var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var authenticate = require('../authenticate');
const cors = require('./cors');

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res)=> {res.sendStatus(200); })
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
   User.find({}, function (err, user) {
        if (err) throw err;
        res.json(user);
    });
});

router.get('/:Id', cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
    User.findById(req.params.Id)
    .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.delete("/:Id", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
    User.findByIdAndRemove(req.params.Id, function (err, resp) {
    if (err) throw err;
    res.json(resp);
});
});

router.post('/signup', cors.corsWithOptions, function(req, res) {
    User.register(new User({ username : req.body.username }),
        req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if(req.body.firstname) {
             user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
            user.lastname = req.body.lastname;
        }
        if(req.body.address) {
            user.address = req.body.address;
        }
                user.save(function(err,user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({status: 'Registration Successful!', success: true});
            });
        });
    });
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({
            success: false,
            status: 'Login Unsuccessful!',
            err: info
          });
        }
        req.logIn(user, function(err) {
          if (err) {
            return res.status(500).json({
              err: 'Could not log in user'
            });
          }
            
          var token = authenticate.getToken({_id: req.user._id});
            res.status(200).json({
            status: 'Login successful!',
            success: true,
            token: token,
            userId: user._id
          });
        });
      })(req,res,next);
    });
  

router.get('/logout', cors.corsWithOptions,  authenticate.verifyUser, function(req, res) {
    req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

router.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err) {
            return next(err);
            
        }
        if (!user) {
            res.statusCode = 401;
            return res.json({status: 'JWT invalid', success: false, err: info});
        }
        else {
            res.statusCode= 200;
            return res.json({status: "JWT valid", success: true, user: user})
        }
    }) (req, res);
});

router.get('/:Id/cartTotal',cors.corsWithOptions, authenticate.verifyUser, (req,res) => {
    User.findById(req.params.Id)
    .exec(function (err, user) {
        if (err) throw err;
    let grandTotal = 0;
    user.cart.map((a)=> {
    grandTotal += a.price;
    })
    res.json(grandTotal);
    });
});

router.route('/:Id/cart')
.options(cors.cors, (req,res) => { res.sendStatus(200)})
.all(authenticate.verifyUser)
.get(cors.corsWithOptions, function (req, res, next) {
    
    User.findById(req.params.Id)
    .exec(function (err, user) {
        if (err) throw err;
        res.json(user.cart);
    });
})

.post(cors.corsWithOptions, function(req, res, next) {
    
    User.findById(req.params.Id)
    .then((user) => {
        if (user != null) {
            
            if (user.cart.id(req.body._id) != null) {
                user.cart.id(req.body._id).quantity++;
                user.cart.id(req.body._id).price = user.cart.id(req.body._id).price * user.cart.id(req.body._id).quantity;
                    
            }
            else {

                user.cart.push(req.body);
                
            }
            user.save()
            .then((user) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user.cart);
                });            
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
    
    User.findById(req.params.Id, function (err, user) {
        if (err) throw err;
        for (var i = (user.cart.length - 1); i >= 0; i--) {
            user.cart.id(user.cart[i]._id).remove();
        }

        user.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all cart items!');
        });
    });
});

router.route('/:Id/cart/:cartId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.all(authenticate.verifyUser)
.get(cors.corsWithOptions, function (req, res, next) {
    
    User.findById(req.params.Id)
    .then((user) => {
        if (user != null && user.cart.id(req.params.cartId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user.cart.id(req.params.cartId));
        }
        else if (user == null) {
            err = new Error(' Cart' + req.params.cartId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Cart ' + req.params.cartId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, function (req, res, next) {
    
    User.findById(req.params.Id)
    .then((user) => {
        if (user != null && user.cart.id(req.params.cartId) != null) {
            if (req.body.quantity) {
                user.cart.id(req.params.cartId).quantity = req.body.quantity;
            }
            
            if (req.body.price) {
                user.cart.id(req.params.cartId).price = req.body.price;
            }
            
            user.save()
            .then((user) => {
                User.findById(user._id)
                .then((user) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);  
                })              
            }, (err) => next(err));
        }
        else if (user == null) {
            err = new Error('User ' + req.params.Id + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Cart ' + req.params.cartId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, function (req, res, next) {
    
    User.findById(req.params.Id)
    .then((user) => {
        if (user != null && user.cart.id(req.params.cartId) != null) {

            user.cart.id(req.params.cartId).remove();
            user.save()
            .then((user) => {
                User.findById(user._id)
                .then((user) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user.cart);  
                })               
            }, (err) => next(err));
        }
        else if (user == null) {
            err = new Error('User ' + req.params.Id + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Cart ' + req.params.cartId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = router;
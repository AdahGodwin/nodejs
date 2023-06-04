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
    User.register(new User({ email : req.body.email }),
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
        if(req.body.mobileNumber) {
            user.mobileNumber = req.body.mobileNumber;
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

module.exports = router;
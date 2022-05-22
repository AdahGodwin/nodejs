const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer'); 
const cors = require('./cors');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }

});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('You can upload only image files!'), false);

    }
    cb(null, true);
};

const upload = multer({storage: storage, fileFilter: imageFileFilter});


const uploadRouter = express.Router();

uploadRouter.route('/')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200)})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('file'), (req,res) => {    
    
    res.statusCode = 200;
    res.json(req.file);

});


module.exports = uploadRouter;
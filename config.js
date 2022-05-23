// const aws = require('aws-sdk');

// aws = new aws.S3({
//     secretKey: process.env.secretKey,
//     'mongoUrl' : process.env.mongoUrl
// })

module.exports = {
    "secretKey": process.env.secretKey,
    "mongoUrl": process.env.mongoUrl
}
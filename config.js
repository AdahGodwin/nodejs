const aws = require('aws-sdk');

module.exports = new aws.S3({
    secretKey: process.env.secretKey,
    'mongoUrl' : process.env.mongoUrl
})


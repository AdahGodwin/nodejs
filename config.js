// const aws = require('aws-sdk');

// aws = new aws.S3({
//     secretKey: process.env.secretKey,
//     'mongoUrl' : process.env.mongoUrl
// })

module.exports = {
    "secretKey": process.env.secretKey,
    "mongoUrl": process.env.mongoUrl
}

// module.exports = {
//     "secretKey": "1234567654321",
//     "mongoUrl": "mongodb+srv://cypher-admin:fgcot157813@cluster0.dzl4n.mongodb.net/conFusion"
// }
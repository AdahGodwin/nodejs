// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Will add the Currency type to the Mongoose Schema types
 var Currency = mongoose.Types.Currency;

var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
     author:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// create a schema
var productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true
    },
    storeName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    rating: {
        type: Number
    },
    price: {
        type: Number
    },
    comments:[commentSchema],
    imageUrl: {
        type: String,
    },
    category:{
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
    },
    quantity: {
        type: Number
    }
    
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Product = mongoose.model('Product', productSchema);

// make this available to our Node applications
module.exports = Product;
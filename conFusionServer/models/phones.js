// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Will add the Currency type to the Mongoose Schema types
 require('mongoose-currency').loadType(mongoose);
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
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// create a schema
var phoneSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number
    },
    price: {
        type: Number
    },
    comments:[commentSchema],
    image: {
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
var Phones = mongoose.model('Phone', phoneSchema);

// make this available to our Node applications
module.exports = Phones;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var cartSchema = new Schema({
    name: {
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
        type: Number,
        min: 1
    }
    
}, {
    timestamps: true
});


var User = new Schema({
    firstname: {
      type: String,
      default: ''
    },
    lastname: {
      type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    cart: [cartSchema],
    address: {
        type: String,
        default: ''
    }
});

User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
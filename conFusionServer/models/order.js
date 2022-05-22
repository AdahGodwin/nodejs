var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema =  new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cart: {
        type: Array,
        required: true
    },
    address: {
        type: String
    },
    name: {  
        type: String
    },
    paymentId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "in progress"
    }
});

module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema ({
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    payment: {
        type: Number,
        required: true
    },
    card_holder: {
        type: String,
        required: true
    },
    card_number: {
        type: String,
        required: true
    },
    exp_date: {
        type: String,
        required: true
    }
},
{
    timestamps: true, // Created At and Updated At fields
}
)
module.exports = mongoose.model('Payment', paymentSchema);
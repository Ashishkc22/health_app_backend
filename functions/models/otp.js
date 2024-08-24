const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    code: {
        type: Number
    },
    time: {
        type: Number
    },
    token: {
        type: String
    },
    user_id: {
        type: String
    }
});

module.exports = mongoose.model('otps', otpSchema);
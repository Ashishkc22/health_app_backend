const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    name: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('State', stateSchema);

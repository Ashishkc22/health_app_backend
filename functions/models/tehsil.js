const mongoose = require('mongoose');

const tehsilSchema = new mongoose.Schema({
    name: {
        type: String
    },
    ref_id: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('Tehsil', tehsilSchema);
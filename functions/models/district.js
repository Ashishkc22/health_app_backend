const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
    name: {
        type: String
    },
    ref_id: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('District', districtSchema);
const mongoose = require('mongoose');

const gramSchema = new mongoose.Schema({
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
    grampanchayat_name: {
        type: String
    },
    map_link: {
        type: String
    }
});

module.exports = mongoose.model('Gram', gramSchema);
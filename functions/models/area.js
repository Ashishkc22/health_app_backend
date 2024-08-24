const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
    name: {
        type: String
    },
    ref_id: {
        type: String
    },
    sarpanch: {
        type: Object
    },
    sachiv: {
        type: Object
    },
    rojgar_sahayak: {
        type: Object
    },
    tehsil: {
        type: String
    },
    updated_by: {
        type: String
    },
    pincode: {
        type: String
    },
    grams: {
        type: Array
    },
    active: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Area', areaSchema);
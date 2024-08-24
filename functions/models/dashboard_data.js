const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
    rank: {
        type: Number
    },
    name: {
        type: String
    },
    location: {
        type: String
    },
    score: {
        type: Number
    },
    ratio: {
        type: Number
    },
    uid: {
        type: String
    },
    claim_enabled: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Dashboard', dashboardSchema);
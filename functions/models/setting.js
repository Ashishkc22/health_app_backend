const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    hospital_category: {
        type: Array
    },
    doctor_specialization: {
        type: Array
    },
    basic_facilities: {
        type: Array
    },
    advance_facilities: {
        type: Array
    },
    hospital_rates: {
        type: Array
    },
    tele_gram: {
        type: String
    },
    contact_us: {
        type: String
    },
    youtube: {
        type: String
    },
    whatsapp: {
        type: String
    },
    fb: {
        type: String
    },
    ig: {
        type: String
    },
    tw: {
        type: String
    }
});

module.exports = mongoose.model('Setting', settingSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    address: {
        line: String,
        city: String,
        state: String,
        zip: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

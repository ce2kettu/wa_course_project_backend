const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, select: false },
    password: { type: String, select: false },
    displayName: String,
    bio: { type: String, select: false },
    isAdmin: { type: Boolean, select: false },
});

module.exports = mongoose.model('User', schema);

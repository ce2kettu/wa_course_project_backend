const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    body: String,
    score: { type: Number, default: 0 },
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', schema);

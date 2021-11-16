const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    body: String,
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    score: { type: String, default: 0 },
}, {
    timestamps: true
});

module.exports = mongoose.model('Vote', schema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['up', 'down'] },
}, {
    timestamps: true
});

module.exports = mongoose.model('Vote', schema);

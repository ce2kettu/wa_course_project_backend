const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, param, validationResult } = require("express-validator");
const Vote = require('../models/vote');
const Comment = require('../models/comment');
const Post = require('../models/post');

router.post('/post/:postId',
    passport.authenticate('jwt', { session: false }),
    param('postId').exists().isMongoId(),
    body('type').isIn(['up', 'down']),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Bad Request", errors: errors.array() });
            }

            const post = await Post.findById(req.params.postId);

            if (!post) {
                return res.status(400).json({ success: false, message: "Bad Request" });
            }

            const priorVote = await Vote.find({ post: post._id, user: req.user._id });

            if (!priorVote) {
                return res.status(400).json({ success: false, message: "Already voted" });
            }

            const vote = new Vote();
            vote.post = post._id;
            vote.user = req.user._id;
            vote.type = req.body.type;
            await vote.save();
            await Post.findOneAndUpdate({ _id: post._id }, { $inc: { 'score': req.params.type == 'up' ? 1 : -1 } });
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

router.post('/comment/:commentId',
    passport.authenticate('jwt', { session: false }),
    param('commentId').exists().isMongoId(),
    body('type').isIn(['up', 'down']),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Bad Request", errors: errors.array() });
            }

            const comment = await Comment.findById(req.params.commentId);

            if (!comment) {
                return res.status(400).json({ success: false, message: "Bad Request" });
            }

            const priorVote = await Vote.find({ comment: comment._id, user: req.user._id });

            if (!priorVote) {
                return res.status(400).json({ success: false, message: "Already voted" });
            }

            const vote = new Vote();
            vote.comment = comment._id;
            vote.user = req.user._id;
            vote.type = req.body.type;
            await vote.save();
            await Comment.findOneAndUpdate({ _id: post._id }, { $inc: { 'score': req.params.type == 'up' ? 1 : -1 } });
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

module.exports = router;

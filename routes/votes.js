const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, param, validationResult } = require("express-validator");
const Vote = require('../models/vote');
const Comment = require('../models/comment');
const Post = require('../models/post');

router.post('/hasVoted/:contentId',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    param('contentId').exists().isMongoId(),
    body('type').isIn(['post', 'comment']),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Bad Request", errors: errors.array() });
            }

            let content;

            if (req.body.type === 'post') {
                content = await Post.findById(req.params.contentId);
            } else {
                content = await Comment.findById(req.params.contentId);
            }

            if (!content) {
                return res.status(400).json({ success: false, message: "Bad Request" });
            }

            let priorVote;

            if (req.body.type === 'post') {
               priorVote = await Vote.findOne({ post: content._id, user: req.user._id });
            } else {
               priorVote = await Vote.findOne({ comment: content._id, user: req.user._id });
            }

            return res.json({ success: true, hasVoted: priorVote != null, type: priorVote ? priorVote.type : null });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

router.post('/post/:postId',
    passport.authenticate('jwt', { session: false, failWithError: true }),
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

            const priorVote = await Vote.findOne({ post: post._id, user: req.user._id });

            if (priorVote) {
                if (priorVote.type == req.body.type) {
                    return res.status(400).json({ success: false, message: "Already voted" });
                } else {
                    priorVote.type = req.body.type;
                    await Post.findOneAndUpdate({ _id: post._id }, { $inc: { 'score': req.body.type === 'up' ? 2 : -2 } }, { timestamps: false });
                    await priorVote.save();
                    return res.json({ success: true });
                }
            }

            const vote = new Vote();
            vote.post = post._id;
            vote.user = req.user._id;
            vote.type = req.body.type;
            const increment = req.body.type === 'up' ? 1 : -1;
            await vote.save();
            await Post.findOneAndUpdate({ _id: post._id }, { $inc: { 'score': increment } }, { timestamps: false });
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

router.post('/comment/:commentId',
    passport.authenticate('jwt', { session: false, failWithError: true }),
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

            const priorVote = await Vote.findOne({ comment: comment._id, user: req.user._id });

            if (priorVote) {
                if (priorVote.type == req.body.type) {
                    return res.status(400).json({ success: false, message: "Already voted" });
                } else {
                    priorVote.type = req.body.type;
                    await Comment.findOneAndUpdate({ _id: comment._id }, { $inc: { 'score': req.body.type === 'up' ? 2 : -2 } }, { timestamps: false });
                    await priorVote.save();
                    return res.json({ success: true });
                }
            }

            const vote = new Vote();
            vote.comment = comment._id;
            vote.user = req.user._id;
            vote.type = req.body.type;
            const increment = req.body.type == 'up' ? 1 : -1;
            await vote.save();
            await Comment.findOneAndUpdate({ _id: comment._id }, { $inc: { 'score': increment } }, { timestamps: false });
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

module.exports = router;

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const Comment = require('../models/comment');
const Post = require('../models/post');

router.post('/:postId/newComment',
    passport.authenticate('jwt', { session: false }),
    param('postId').exists().isMongoId(),
    body('body').exists(),
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

            const comment = new Comment();
            comment.body = req.body.body;
            comment.post = post._id;
            comment.user = req.user._id;
            await comment.save();
            post.comments.push(comment);
            await post.save();
            return res.json({ success: true, comment });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

router.put('/:commentId/edit',
    passport.authenticate('jwt', { session: false }),
    param('commentId').exists().isMongoId(),
    body('body').exists(),
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

            if (req.user._id.equals(comment.user) || req.user.isAdmin) {
                comment.body = req.body.body;
                await comment.save();
                return res.json({ success: true, comment });
            } else {
                return res.status(400).json({ success: false, message: "Bad Request" });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

router.delete('/:commentId/delete',
    passport.authenticate('jwt', { session: false }),
    param('commentId').exists().isMongoId(),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Bad Request", errors: errors.array() });
            }

            const comment = await Comment.findById(req.params.commentId).populate('post');

            if (!comment) {
                return res.status(400).json({ success: false, message: "Bad Request" });
            }

            if (req.user.isAdmin) {
                comment.post.comments.pull(comment);
                await comment.delete();
                await comment.post.save();
                return res.json({ success: true });
            } else {
                return res.status(400).json({ success: false, message: "Bad Request" });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" + err.message });
        }
    });

module.exports = router;

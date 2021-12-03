const express = require('express');
const passport = require('passport');
const { body, param, validationResult } = require("express-validator");
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');

router.get('/all', async (req, res, next) => {
    try {
        const posts = await Post.find({}).populate('user');
        return res.json({ success: true, posts: posts || [] });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/:postId',
    param('postId').exists().isMongoId(),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Bad Request", errors: errors.array() });
            }

            const post = await Post.findById(req.params.postId)
                .populate('user')
                .populate({
                    path: 'comments',
                    populate: { path: 'user' }
                });

            if (!post) {
                return res.status(400).json({ success: false, message: "Bad Request" });
            } else {
                return res.json({ success: true, post });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

router.post('/new',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    body('title').exists(),
    body('body').exists(),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Bad Request", errors: errors.array() });
            }

            const post = new Post();
            post.title = req.body.title;
            post.body = req.body.body;
            post.user = req.user._id;
            await post.save();
            return res.json({ success: true, post });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

router.put('/:postId/edit',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    param('postId').exists().isMongoId(),
    body('title').exists(),
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

            if (req.user._id.equals(post.user) || req.user.isAdmin) {
                post.title = req.body.title;
                post.body = req.body.body;
                await post.save();
                res.json({ success: true, post });
            } else {
                return res.status(400).json({ success: false, message: "Bad Request" });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

router.delete('/:postId/delete',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    param('postId').exists().isMongoId(),
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

            if (req.user.isAdmin) {
                const postId = post._id;
                await post.delete();
                Comment.remove({ post: postId }).exec();
                res.json({ success: true });
            } else {
                return res.status(400).json({ success: false, message: "Bad Request" });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    });

module.exports = router;

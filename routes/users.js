const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { param, body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

router.get('/profile/:userId',
  passport.authenticate('jwt', { session: false }),
  param('userId').exists().isMongoId(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Bad Request', errors: errors.array() });
      }

      const user = await User.findById(req.params.userId).select('+bio');

      return res.json({ success: true, profile: user });
    } catch {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

router.get('/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select('+bio +email');
      return res.json({ success: true, profile: user });
    } catch {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isStrongPassword(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Bad Request', errors: errors.array() });
      }

      const user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(403).json({ success: false, message: 'Email already in use' });
      } else {
        const newUser = new User();

        bcrypt.hash(req.body.password, 8, async (err, hash) => {
          newUser.email = req.body.email;
          newUser.password = hash;
          await newUser.save();
          return res.json({ success: true });
        });
      }

    } catch (err) {
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

router.post('/login',
  body('email').exists(),
  body('password').exists(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Bad Request', errors: errors.array() });
      }

      const user = await User.findOne({ email: req.body.email }).select('+password +email');

      if (!user) {
        return res.status(403).json({ success: false, message: 'Invalid credentials' });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            const jwtPayload = {
              id: user._id,
              email: user.email,
            }

            jwt.sign(
              jwtPayload,
              process.env.JWT_SECRET,
              {
                expiresIn: '30d'
              },
              (err, token) => {
                res.json({ success: true, token });
              }
            );
          } else {
            return res.status(403).json({ success: false, message: 'Invalid credentials' });
          }
        });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

module.exports = router;

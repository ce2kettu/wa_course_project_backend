const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { param, body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Return user profile
router.get('/profile/:userId',
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

// Get authenticated user profile
router.get('/profile',
  passport.authenticate('jwt', { session: false, failWithError: true }),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select('+bio +email +isAdmin');
      return res.json({ success: true, profile: user });
    } catch {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

router.post('/editProfile',
  passport.authenticate('jwt', { session: false, failWithError: true }),
  body('displayName').exists(),
  body('bio').exists(),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select('+bio +email +isAdmin');
      user.bio = req.body.bio;
      user.displayName = req.body.displayName;
      await user.save();

      return res.json({ success: true, profile: user });
    } catch {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

router.post('/register',
  body('displayName').exists(),
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
          newUser.displayName = req.body.displayName;
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
  body('email').isEmail().normalizeEmail(),
  body('password').isStrongPassword(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Bad Request', errors: errors.array() });
      }

      const user = await User.findOne({ email: req.body.email }).select('+password +email');

      // No user with such email
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

            // Send back a JWT token
            jwt.sign(
              jwtPayload,
              process.env.JWT_SECRET,
              {
                expiresIn: '30d'
              },
              (err, token) => {
                res.json({ success: true, token, 
                  user: { _id: user._id, displayName: user.displayName, email: user.email } });
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

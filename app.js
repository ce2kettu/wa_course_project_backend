require('dotenv').config()
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('./models/user');

const mongoDB = process.env.MONGOURL || 'mongodb://localhost:27017/testdb';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('connected', () => console.log('Connected to MongoDB'));
db.on('error', () => console.error('MongoDB connection error'));

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
var options = {}
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET;
passport.use(new JwtStrategy(options, (jwtPayload, done) => {
    User.findById(jwtPayload.id, (err, user) => {
        if (err) {
            return done(err, false);
        }

        return done(null, user || false);
    }).populate('+isAdmin +email');
}));

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const votesRouter = require('./routes/votes');

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/votes', votesRouter);

// not found
app.use(function (req, res, next) {
    res.status(404).json({ message: "Not Found" })
});

// error handler
app.use(function (err, req, res, next) {
    const isDev = req.app.get('env') === 'development';
    const message = isDev ? err.message : "Internal server error";
    const error = isDev ? err : {};

    res.status(err.status || 500).json({ message });
});

module.exports = app;

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


const mongoDB = process.env.MONGOURL || 'mongodb://localhost:27017/testdb';
mongoose.connect(mongoDB);
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on('connected', () => console.log('Connected to MongoDB'));
db.on('error', () => console.error('MongoDB connection error'));


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// not found
app.use(function (req, res, next) {
    res.status(404).json({ message: "Not Found" })
});

// error handler
app.use(function (err, req, res, next) {
    const isDev = req.app.get('env') === 'development';
    const message = isDev ? err.message : "Internal server error";
    const error = isDev ? err : {};

    // render the error page
    res.status(err.status || 500).json({ message });
});

module.exports = app;

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const bodyParser = require("body-parser");

const app = express();

// Tutorial
// https://www.youtube.com/watch?v=6FOq4cUdH8k

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDBConnected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
})

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/api', require('./routes/api'));
app.use('/api/geoloc', require('./routes/geoloc'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server started on  ${PORT}`))

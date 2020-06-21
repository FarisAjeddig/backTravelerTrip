const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');
const Availability = require('../models/Availability');
const Interest = require('../models/Interest');

// Login page
router.get('/login', (req, res) => res.render('login'));

// Register page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
  const {name, email, password, password2} = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2){
    errors.push({msg: 'Fill in all fields...'});
  }

  // Check password matchs
  if (password !== password2){
    errors.push({msg: 'Passwords are not the same...'});
  }

  // Check password length
  if (password.length < 6){
    errors.push({msg: 'Password must be at least 6 characters long...'});
  }

  if (errors.length > 0){
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation Passed
    User.findOne({ email: email })
      .then(user => {
        if (user){
          errors.push({msg: 'Email address is already in use...'});
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {

          availability = new Availability();
          interest = new Interest();

          availability.save()
            .then(availability => {
              interest.save()
                .then(interest => {
                  const newUser = new User({
                    name,
                    email,
                    password,
                    availability: availability._id,
                    interests: interest._id
                  });

                  // Hash Password
                  bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                      if(err) throw err;

                      // Set password to hashed
                      newUser.password = hash;
                      // Save user
                      newUser.save()
                        .then(user => {
                          req.flash('success_msg', 'You are registered and can log in!');
                          res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                  }))
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }
      })
  }
})

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});



module.exports = router;

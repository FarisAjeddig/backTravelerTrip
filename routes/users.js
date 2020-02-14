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

// Login Handle API WAY

  // const {email, password} = req.body;
  // let errors = [];
  //
  // // Check errors
  // if (!email || !password){
  //   errors.push({msg: 'Les deux champs sont obligatoires...'});
  //   res.render('login', {
  //     errors,
  //     email,
  //     password
  //   });
  // } else {
  //   // Validation Passed
  //   User.findOne({ email: email })
  //     .then(user => {
  //       if (!user){
  //         errors.push({msg: 'L\'adresse mail n\'existe pas chez nous...'});
  //         res.render('login', {
  //           errors,
  //           email,
  //           password
  //         });
  //       } else {
  //         // Check Hash Password : API Way
  //         // bcrypt.compare(password, user.password, (err, isMatch) => {
  //         //   if(err) throw err;
  //         //
  //         //   if (isMatch){
  //         //     req.flash('success_msg', 'Vous êtes désormais connecté!');
  //         //     res.redirect('/users/login');
  //         //   } else {
  //         //     errors.push({msg: 'Le mot de passe ne correspond pas à l\'adresse mail.'});
  //         //     res.render('login', {
  //         //       errors,
  //         //       email,
  //         //       password
  //         //     });
  //         //   }
  //         // })
  //       }
  //     })
  // }

// Register page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
  const {name, email, password, password2} = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2){
    errors.push({msg: 'Remplissez tous les champs...'});
  }

  // Check password matchs
  if (password !== password2){
    errors.push({msg: 'Les mots de passent ne sont pas les mêmes...'});
  }

  // Check password length
  if (password.length < 6){
    errors.push({msg: 'Le mot de passe doit faire au moins 6 caractères...'});
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
          errors.push({msg: 'L\'adresse mail est déjà utilisée...'});
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
                          req.flash('success_msg', 'Vous êtes enregistré et vous pouvez vous connecter!');
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

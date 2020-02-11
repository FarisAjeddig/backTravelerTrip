const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fetch = require('node-fetch');

// User model
const User = require('../models/User');


// Register Handle
router.post('/register', (req, res) => {

  const {email, password, password2} = req.body;
  let errors = [];

  // Check required fields
  if (!email || !password || !password2){
    errors.push('Remplissez tous les champs...');
  }

  // Check password matchs
  if (password !== password2){
    errors.push('Les mots de passent ne sont pas les mêmes...');
  }

  // Check password length
  if (password.length < 6){
    errors.push('Le mot de passe doit faire au moins 6 caractères...');
  }

  if (errors.length > 0){
    res.json({
      errors: errors,
      statut: "ERROR"
    });
  } else {
    // Validation Passed
    User.findOne({ email: email })
      .then(user => {
        if (user){
          errors.push('L\'adresse mail est déjà utilisée...');
          res.json({
            errors: errors,
            statut: "ERROR"
          });
        } else {
          const newUser = new User({
            email,
            password
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
                  res.json({
                    message: 'Vous êtes enregistré et vous pouvez vous connecter!',
                    statut: "SUCCESS"
                  });
                })
                .catch(err => console.log(err));
          }))
        }
      })
  }
})

// Login Handle
router.post('/login', (req, res) => {

  const {email, password} = req.body;
  let errors = [];

  // Check errors
  if (!email || !password){
    errors.push('Les deux champs sont obligatoires...');
    res.json({
      errors: errors,
      statut: "ERROR"
    });
  } else {
    // Validation Passed
    User.findOne({ email: email })
      .then(user => {
        if (!user){
          errors.push('L\'adresse mail n\'existe pas chez nous...');
          res.json({
            errors: errors,
            statut: "ERROR"
          });
        } else {
          // Check Hash Password : API Way
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err) throw err;

            if (isMatch){
              res.json({
                message: 'Vous êtes désormais connecté!',
                statut: "SUCCESS"
              });
            } else {
              errors.push('Le mot de passe ne correspond pas à l\'adresse mail.');
              res.json({
                errors: errors,
                statut: "ERROR"
              });
            }
          })
        }
      })
  }

})

// Facebook Login / Register Handle
router.post('/sign/facebook', (req, res) => {
  const { token } = req.body;

  fetch(`https://graph.facebook.com/me?access_token=${token}&fields=email,name,about,picture`)
    .then(res => res.json())
    .then(json => {
      User.findOne({ email: json.email })
        .then(user => {
          if (!user){
            const newUser = new User({
              email: json.email,
              password: "facebook",
              picture: json.url,
              name: json.name,
              fbToken: token
            });
            // Save user
            newUser.save()
              .then(user => {})
              .catch(err => console.log(err));

            res.json({
              statut: "SIGNUP",
              user: newUser
            });
          } else {
            // L'utilisateur est déjà inscrit, on renvoit les informations du profil.
            if (user.fbToken !== null){
              User.updateOne({_id: user._id},
                { picture: json.picture.data.url, name: json.name, fbToken: token})
              user.save()
                .then(user => {
                  res.json({
                    statut: "LOGIN",
                    user: user
                  });
                })
                .catch(err => console.log(err));
            } else {
              res.json({
                statut: "LOGIN",
                user: user
              });
            }
          }
        })

      // res.json({json})
    });
})

module.exports = router;

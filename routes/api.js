const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fetch = require('node-fetch');

// Models
const User = require('../models/User');
const Availability = require('../models/Availability');
const Interest = require('../models/Interest');

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

          availability = new Availability();
          interest = new Interest();

          availability.save()
            .then(availability => {
              interest.save()
                .then(interest => {
                  const newUser = new User({
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
                          res.json({
                            message: 'Vous êtes enregistré et vous pouvez vous connecter!',
                            statut: "SUCCESS"
                          });
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

            availability = new Availability();
            interest = new Interest();

            availability.save()
              .then(availability => {
                interest.save()
                  .then(interest => {

                    const newUser = new User({
                      email: json.email,
                      password: "facebook",
                      picture: json.url,
                      name: json.name,
                      fbToken: token,
                      availability: availability._id,
                      interests: interest._id
                    });
                    // Save user
                    newUser.save()
                      .then(user => {})
                      .catch(err => console.log(err));

                    res.json({
                      statut: "SIGNUP",
                      user: newUser
                    });
                  })
                  .catch(err => console.log(err));
              })
              .catch(err => console.log(err));
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

// Availabilities and Interests handling
router.post('/profile/availandinter', (req, res) => {
  var { availabilities, interests, email } = req.body;

  User.findOne({ email: email })
    .then(user => {
      if (!user){
        // L'adresse mail n'est pas reconnue, peu probable
        res.json({
          statut: "NO_USER"
        })
      } else {
        Availability.updateOne({_id: user.availability},
        {
          a6to8: availabilities.a6to8,
          a8to12: availabilities.a8to12,
          a12to14: availabilities.a12to14,
          a14to18: availabilities.a14to18,
          a18to22: availabilities.a18to22
        })
          .then(availability => {
            Interest.updateOne({_id: user.interests},
            {
              business: interests.business,
              restaurant: interests.restaurant,
              sport: interests.sport,
              tourism: interests.tourism,
              carsharing: interests.carsharing
            })
              .then(interest => {
                console.log(interest);
                res.json({
                  statut: "SUCCESS",
                });
              })
              .catch(err => console.log(err))
            })
          .catch(err => console.log(err));

        }
      })
    })

module.exports = router;

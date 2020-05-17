const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fetch = require('node-fetch');
var nodemailer = require('nodemailer');

var logger = require('logger').createLogger(); // logs to STDOUT
var logger = require('logger').createLogger('development.log'); // logs to a file
var fs = require('fs');
var multer  = require('multer');

// Multer Config, for upload files
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname + '.jpeg');
  }
});

var upload = multer({ storage: storage });


// Mailer Config
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'digibinks@gmail.com',
    pass: 'd1g1b!nks'
  }
});

// Models
const User = require('../models/User');
const Availability = require('../models/Availability');
const Interest = require('../models/Interest');

// Register Handle
router.post('/register', (req, res) => {

  const {email, name, position, enterprise, phone, password, password2} = req.body;
  let errors = [];

  // Check required fields
  if (!email || !password || !password2 || !phone || !name || !position || !enterprise){
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
      errors: errors[0],
      statut: "ERROR"
    });
  } else {
    // Validation Passed
    User.findOne({ email: email })
      .then(user => {
        if (user){
          res.json({
            message: 'L\'adresse mail est déjà utilisée... Essayez de vous connecter via Facebook',
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
                    name,
                    position,
                    enterprise,
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
                            statut: "SUCCESS",
                            user: newUser
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

  // Check errors
  if (!email || !password){
    res.json({
      message: 'Les deux champs sont obligatoires...',
      statut: "ERROR"
    });
  } else {
    // Validation Passed
    User.findOne({ email: email })
      .then(user => {
        if (!user){
          res.json({
            message: 'L\'adresse mail n\'existe pas chez nous...',
            statut: "ERROR"
          });
        } else {
          // Check Hash Password : API Way
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err) throw err;

            if (isMatch){
              res.json({
                message: 'Vous êtes désormais connecté!',
                statut: "SUCCESS",
                user: user
              });
            } else {
              let error = ''
              if (user.fbToken == null){
                error = 'Le mot de passe ne correspond pas à l\'adresse mail.';
              } else {
                error = 'Connectez vous via Facebook.';
              }
              res.json({
                message: error,
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
      console.log(json);
      User.findOne({ email: json.email })
        .then(user => {
          if (!user){

            availability = new Availability();
            interest = new Interest();

            availability.save()
              .then(availability => {
                interest.save()
                  .then(interest => {

                    console.log(json);

                    const newUser = new User({
                      email: json.email,
                      password: "facebook",
                      picture: json.picture.data.url,
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
      User.updateOne({_id: user._id}, {firstlaunch: false})
      .then(result => {
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
                carsharing: interests.carsharing,
                spectacle: interests.spectacle,
                shopping: interests.shopping
              })
              .then(interest => {
                res.json({
                  statut: "SUCCESS",
                });
              })
              .catch(err => console.log(err))
            })
            .catch(err => console.log(err));
          })
        }
    })
})

// Update position, enterprise & phone when connect with facebook
router.post('/update/facebook', (req, res) => {

  const {email, position, enterprise, phone} = req.body;

  User.findOne({ email: email })
    .then(user => {
      User.updateOne({_id: user._id}, {firstlaunch: false, position, enterprise, phoneNumber: phone})
      .then(result => {
        console.log(result);
        res.json({
          statut: "SUCCESS",
          user: user
        })
      })
      })
    .catch(err => console.log(err));

})


router.post('/upload', upload.single('file'), (req, res,next) => {
  console.log("UPLOAD");
  console.log(req.file);

  User.updateOne({ _id: req.file.originalname }, { picture: req.file.filename })
    .then(user => {
      res.json({
        statut: "SUCCESS",
        picture: req.file.filename
      });
    })
    .catch(err => console.log(err))
})

// Edit Infos Profile
router.post('/profile/editInfo', (req, res) => {
  var { name, position, enterprise, id } = req.body;

  User.updateOne({_id: id},
  {name: name, position: position, enterprise: enterprise})
    .then(user => {
      res.json({
        statut: "SUCCESS"
      });
    })
    .catch(err => console.log(err))
})

// Contact Us
router.post('/contact', (req, res) => {
  var { id, message } = req.body;

  User.findOne({_id: id})
    .then(user => {
      var mailOptions = {
        from: 'digibinks@gmail.com',
        to: 'fajeddig@hotmail.fr',
        subject: 'Message reçu depuis l\'application mobile',
        text: "L'utilisateur " + user.name  + " (email : " + user.email +") t'a envoyé le message suivant sur l'application mobile : \n\n "+ message
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.json({
            statut: "ERROR"
          })
        } else {
          res.json({
            statut: "SUCCESS"
          })
        }
      });
    })
})

// Get Availabilities
router.get('/availability/:id', (req, res) => {
  var id = req.params.id;

  Availability.findOne({_id: id})
    .then(availability => {
      res.json({
        statut: "SUCCESS",
        availability: availability
      });
    })
    .catch(err => console.log(err))
})

// Get Interests
router.get('/interests/:id', (req, res) => {
  var id = req.params.id;

  Interest.findOne({_id: id})
    .then(interests => {
      res.json({
        statut: "SUCCESS",
        interests: interests
      });
    })
    .catch(err => console.log(err))
})

module.exports = router;

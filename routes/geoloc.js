const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fetch = require('node-fetch');

// Models
const User = require('../models/User');


router.post('/position', (req, res) => {

  const {email, coords} = req.body;

  User.findOne({ email: email })
    .then(user => {
      console.log(coords.longitude.toString());
      console.log(coords.longitude);
      User.updateOne({_id: user._id}, { lastLong: coords.longitude.toString(), lastLat: coords.latitude.toString(), lastLocationTime: Date.now()})
      // User.updateOne({_id: user._id}, { lastLong: 25, lastLat: "20", lastLocationTime: Date.now()})
        .then( user => {
          // user.save()
          //   .then(user => {
          //     console.log(user);
          //     res.json({
          //       statut: "SUCCESS",
          //       user: user
          //     });
          //   })
          //   .catch(err => console.log(err));
          res.json({
            statut: "SUCCESS",
            user: this.user
          });
        })
        .catch(err => console.log(err))
  })
})

router.get('/users/:longitude/:latitude', (req, res) => {
  User.find()
    .then(users => {
      console.log(users);
      res.json({
        users: users
      })
    })
})


module.exports = router;

const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const User = require('../models/User');

// Welcome Page
router.get('/', (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  User.find()
  .then(users => {
    res.render('dashboard', {
      user: req.user,
      users: users
    });
  })
)

router.get('/delete/:id', ensureAuthenticated, (req, res) => {
  var id = req.params.id

  User.deleteOne({_id: id}, function(err) {
    console.log(err);
    res.redirect('/dashboard')
  })
})


module.exports = router;

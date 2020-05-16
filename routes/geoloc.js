const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fetch = require('node-fetch');

// Models
const User = require('../models/User');
const Availability = require('../models/Availability');
const Interest = require('../models/Interest');

// Calcul de la distance entre deux points. unit : 'K' pour kilometres, 'M' pour miles, 'N' pour Nautic
function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

// Vérifie s'il y a des disponibilités communes entre deux utilisateurs
function commonAvailability(avail1, avail2){
  if (avail1.a6to8 && avail2.a6to8) {
    return true
  } else if (avail1.a8to12 && avail2.a8to12) {
    return true
  } else if (avail1.a12to14 && avail2.a12to14) {
    return true
  } else if (avail1.a14to18 && avail2.a14to18) {
    return true
  } else if (avail1.a18to22 && avail2.a18to22) {
    return true
  } else {
    return false
  }
}

// Vérifie s'il y a des intérêts communs entre deux utilisateurs
function commonInterest(inter1, inter2){
  if (inter1.business && inter2.business) {
    return true
  } else if (inter1.restaurant && inter2.restaurant) {
    return true
  } else if (inter1.sport && inter2.sport) {
    return true
  } else if (inter1.tourism && inter2.tourism) {
    return true
  } else if (inter1.carsharing && inter2.carsharing) {
    return true
  } else {
    return false
  }
}

router.post('/position', (req, res) => {

  const {email, coords} = req.body;

  User.findOne({ email: email })
    .then(user => {
			console.log(email);
			console.log(user);
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

router.get('/users/:longitude/:latitude/:email', (req, res) => {
  var email = req.params.email;
  var longitude = req.params.longitude;
  var latitude = req.params.latitude;
  let result = []
	User.find()
		.then(users => {
			res.json({
				users: users
			})
		})

  // User.findOne({email: email})
  //   .then(originalUser => {
  //     Availability.findOne({_id: originalUser.availability})
  //       .then(avail2 => {
  //         Interest.findOne({_id: originalUser.interests})
  //           .then(inter2 => {
  //             User.find()
  //             .then(users => {
  //               var itemProcessed = 0;
  //               users.forEach((user, i) => {
  //                 itemProcessed++;
  //                 if (user.email != email && distance(user.lastLat, user.lastLong, originalUser.lastLat, originalUser.lastLong, 'K') < 20){
  //                   Availability.findOne({_id: user.availability})
  //                   .then(avail1 => {
  //                     Interest.findOne({_id: user.interests})
  //                     .then(inter1 => {
  //                       if (commonInterest(inter1, inter2) && commonAvailability(avail1, avail2)){
  //                         console.log(user.email);
  //                         result.push(user);
  //                         if(itemProcessed === users.length) {
  //                           res.json({
  //                             users: result
  //                           })
  //                         }
  //                         // console.log(users[users.length-1]._id);
  //                         // console.log(user._id);
  //                         // console.log(users[users.length-1]._id == user._id);
  //                         // console.log(users[users.length-1]._id == originalUser._id);
  //                         // console.log(originalUser._id);
  //                         // if (users[users.length-1]._id == user._id){
  //                         //   res.json({
  //                         //     users: result
  //                         //   })
  //                         // }
  //                       }
  //                     })
  //                   })
  //                 }
  //               })
  //               // res.json({
  //               //   users: users
  //               // })
  //             })
  //           })
  //       })
  //   })
})

router.get('/common/:userId1/:email2', (req, res) => {
	var userId1 = req.params.userId1;
	var email2 = req.params.email2;

	User.findOne({ _id: userId1 })
	.then(user1 => {
		User.findOne({ email: email2 })
		.then(user2 => {
			if (user1.email === user2.email || distance(user1.lastLat, user1.lastLong, user2.lastLat, user2.lastLong, 'K') > 20){
				return res.json({
					common: "false"
				});
			}
			Availability.findOne({_id: user1.availability})
      .then(avail1 => {
        Interest.findOne({_id: user1.interests})
          .then(inter2 => {
					Availability.findOne({_id: user2.availability})
          .then(avail2 => {
            Interest.findOne({_id: user2.interests})
            .then(inter1 => {
              if (commonInterest(inter1, inter2) && commonAvailability(avail1, avail2)){
								res.json({
			            common: "true"
			          });
							} else {
								res.json({
									common: "false"
								})
							}
						})
					})
				})
			})
		})
	})
})

module.exports = router;

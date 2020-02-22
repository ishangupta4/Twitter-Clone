const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

router.get('/test', (req,res) => res.json({msg: 'Users route work'}));

router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid) {
      return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        errors.email = 'Email already exists';
        return res.status(400).json(errors);
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', // Size
          r: 'pg', // Rating
          d: 'mm' // Default
        });
  
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          username: req.body.username,
          phone: req.body.phone,
          avatar,
          password: req.body.password
        });
  
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            //if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
  });

router.post('/login', (req, res) => {

  const {errors, isValid} = validateLoginInput(req.body);

  if(!isValid) {
    console.log('something is wrong here');
    return res.status(400).json(errors);
  }

    const email = req.body.email;
    const password = req.body.password;
    
    User.findOne({ email }).then(user => {
        if(!user) {
          errors.email = 'user not found';
            return res.status(404).json(errors);
        }

        bcrypt.compare(password, user.password).then(isMatch => {
            if(isMatch) {
                const payload = {id: user.id, name: user.name, username: user.username, avatar: user.avatar};

                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {expiresIn : 36000},
                    (err,token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        })
                    }
                )
            } else {
              errors.password = 'username or password is incorrect';
              return res.status(400).json(errors);
            }
        });
    });
});

module.exports = router;
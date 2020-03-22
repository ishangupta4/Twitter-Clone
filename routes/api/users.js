const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
// const fs = require('fs');
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 }, fileFilter: fileFilter }); //limit set to 1 mb


const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

router.get('/', (req, res) => {
  User.find()
    .exec()
    .then(users => {
      const response = {
        count: users.length,
        users: users
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/myprofile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    name: req.user.name,
    username: req.user.username,
    bio: req.user.bio,
    avatar: req.user.avatar,
    coverPic: req.user.coverPic,
    location: req.user.location,
    dateOfJoining: req.user.dateOfJoining,
    daeOfBirth: req.user.dateOfBirth,
    noOfFollowers: req.user.noOfFollowers,
    noOfFollowings: req.user.noOfFollowings,
    tweets: req.user.tweets,
    retweets: req.user.retweets,
    likes: req.user.likes,
    id: req.user.id
  });
});


router.get("/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .exec()
    .then(user => {
      if (user) {
        res.status(200).json({
          user: user,
          request: {
            type: "GET",
            url: "http://localhost:5000/users"
          }
        });
      } else {
        res
          .status(404)
          .json({ message: "No user found for provided id" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post('/register', (req, res) => {
  console.log(req.file);
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ username: req.body.username }).then(user => {
    if (user) {
      errors.username = 'Username already exists';
      return res.status(400).json(errors);
    }
  })

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

  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    console.log('something is wrong here');
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = 'Email does not exist';
      return res.status(404).json(errors);
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = { id: user.id, name: user.name, username: user.username, avatar: user.avatar };

        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 36000 },
          (err, token) => {
            res.json({
              success: true,
              userId: user.id,
              token: 'Bearer ' + token
            })
          }
        )
      } else {
        errors.password = 'Incorrect password';
        return res.status(400).json(errors);
      }
    });
  });
});

router.patch("/update/:userId", (req, res, next) => {
  const id = req.params.userId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  User.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User Data Updated",
        request: {
          type: "GET",
          url: "http://localhost:5000/api/users/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.patch("/avatar/:userId", upload.single('avatar'), (req, res, next) => {
  const id = req.params.userId;
  const updateOps = {
    avatar: req.file.path
  };
  User.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User avatar updated",
        request: {
          type: "GET",
          url: "http://localhost:5000/api/users/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete('/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndRemove({ _id: req.user.id }).then(() => {
      res.json({ success: true })
        .catch((error) => {
          assert.isNotOk(error, 'Promise error');
          done();
        });
    });
  }
);

module.exports = router;
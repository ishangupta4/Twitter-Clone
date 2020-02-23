const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

router.get("/test", (req, res) => res.json({ msg: "Users route work" }));

//This route will be teriminated in future
router.get("/all", (req, res) => {
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

router.get('/myprofile', passport.authenticate('jwt', {session: false}), (req, res) => {
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
    noOfFollowings: req.user.noOfFollowings
  });
});

router.get("/getuser/:username", (req, res, next) => {
  User.findOne({ username: req.params.username})
    .then(user => {
      if (user) {
        res.status(200).json({
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          noOfFollowers: user.noOfFollowers,
          noOfFollowings: user.noOfFollowings,
          request: {
            type: "GET",
            url: "http://localhost:5000/users"
          }
        });
      } else {
        res.status(404).json({ message: "No user found for provided username" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ username: req.body.username }).then(user => {
    if (user) {
      errors.username = "Username already exists";
      return res.status(400).json(errors);
    }
  });

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm" // Default
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

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    console.log("something is wrong here");
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "user not found";
      return res.status(404).json(errors);
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar
        };

        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 36000 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "username or password is incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

//This route is only for testing and might be removed in future
router.get('/current',passport.authenticate("jwt", { session: false }),(req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.email,
      username: req.user.username,
      email: req.user.email
    });
  }
);

router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndRemove({ _id: req.user.id }).then(() => {
      res.json({ success: true })
      .catch((error) => {
        assert.isNotOk(error,'Promise error');
        done();
      });
    });
  }
);

module.exports = router;

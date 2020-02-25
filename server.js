<<<<<<< HEAD
const express = require('express');
const mongoose = require('mongoose');
const morgan = require("morgan");
const bodyParser = require('body-parser');
const passport = require('passport');
=======
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const morgan = require("morgan");
>>>>>>> upstream/master

const app = express();

const users = require("./routes/api/users");
const tweets = require("./routes/api/tweets");

<<<<<<< HEAD

=======
>>>>>>> upstream/master
mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Root path of the app"));

const db = require("./config/keys").mongoURI;

<<<<<<< HEAD
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected Succesfully'))
=======
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected Succesfully"))
>>>>>>> upstream/master
  .catch(err => console.log(err));

app.use(passport.initialize());
require("./config/passport")(passport);

app.use("/api/users", users);
app.use("/api/tweets", tweets);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log("server is running on port: " + port));

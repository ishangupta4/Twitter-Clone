const express = require('express');
const mongoose = require('mongoose');
const morgan = require("morgan");
// const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const passport = require('passport');


const app = express();

const users = require("./routes/api/users");
const tweets = require("./routes/api/tweets");


mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Root path of the app"));

const db = require("./config/keys").mongoURI;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected Succesfully"))
  .catch(err => console.log(err));

app.use(passport.initialize());
require("./config/passport")(passport);

app.use("/api/users", users);
app.use("/api/tweets", tweets);

app.use((req, res, next) => {
  const error = new Error("Route not found");
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

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const tweets = require('./routes/api/tweets');

app.get('/', (req, res) => res.send('Root path of the app'));

const db = require('./config/keys').mongoURI;

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('MongoDB Connected Succesfully'))
  .catch(err => console.log(err));

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/tweets', tweets);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('server is runnint on port: ' + port));
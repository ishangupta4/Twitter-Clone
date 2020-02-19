const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('Starting path of the app'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('server is runnint on port: ' + port));
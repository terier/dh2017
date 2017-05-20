var express = require('express');
var app = express();
var path = require('path');
var models = require('./models/models');

const constants = require('constants')

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/data', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send('{ "test": "17" }');
});

app.use('/display', express.static(path.join(__dirname, '../client')))

app.post('/login', function (req, res) {
  const name = req.params.name;

  const user = models.createUser(name);

  res.json({
    user: user
  });
})

app.listen(3000, function () {
  console.log(`Listening at http://localhost:3000`)
});

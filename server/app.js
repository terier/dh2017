var express = require('express');
var app = express();
var path = require('path');
var THREE = require('three-math');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/data', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send('{ "test": "17" }');
});

app.use('/display', express.static(path.join(__dirname, '../client')));
app.use('/shared', express.static(path.join(__dirname, '../shared')));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

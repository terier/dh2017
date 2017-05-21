var express = require('express');
var app = express();
var path = require('path');
var models = require('./models/models');
var bodyParser = require('body-parser');
var THREE = require('three-math');
var MongoClient = require('mongodb').MongoClient;

var constants = require('./constants');

const canvasWidth = constants.canvasSize.width;
const canvasHeight = constants.canvasSize.height;

const mongodbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/k1ller'

// Connect to the db
MongoClient.connect(mongodbUrl, function (err, db) {
  if (err) {
    throw err;
  }

  console.log('Database connected!');

  // set db variable
  this.db = db;
});

getDatabase = function() {
  return this.db;
}

app.set('port', process.env.PORT || 3000)

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/data', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send('{ "test": "17" }');
});

app.use(bodyParser.json());

app.use('/display', express.static(path.join(__dirname, '../client')));
app.use('/shared', express.static(path.join(__dirname, '../shared')));

// initialize users
app.get('/reset', function (req, res) {
  models.initUsers(db);

  res.json({
    message: 'success'
  });
});

// login user endpoint
app.post('/login', function (req, res) {
  var name = req.body.name;

  console.log('Creating user with name: ' + name);

  var targetUserId = null;
  var targetUserName = null;

  this.db.collection('user', function (err, collection) {
    if (err) {
      console.error('Error accessing user collection: ' + err);
    }

    collection.find().toArray(function (err, users) {
      if (err) {
        console.error('Error fetching all users: ' + err);
      }

      console.log('Looking for a suitable target user...');

      var targetedUsers = [];
      var nonTargetedUsers = [];

      users.forEach(function (user) {
        if (user.targetUserId !== null) {
          targetedUsers.push(user.targetUserId);
        }
      });

      users.forEach(function (user) {
        if (targetedUsers.indexOf(user._id) === -1) {
          nonTargetedUsers.push(user);
        }
      });

      console.log('Targeted users: ' + targetedUsers.join(', '));
      console.log('Non targeted users: ' + nonTargetedUsers.join(', '));

      if (nonTargetedUsers.length > 0) {
        const userIdx = Math.round(Math.random() * (nonTargetedUsers.length - 1));
        const targetUser = nonTargetedUsers[userIdx];

        if (targetUser !== null) {
          targetUserId = targetUser._id;
          targetUserName = targetUser.name;
        }
      }

      if (name == null) {
        name = 'Dummy';
      }

      // generate user with random starting position
      var user = new models.User ({
        name: name,
        x: Math.random() * canvasWidth - (canvasWidth / 2),
        y: Math.random() * canvasHeight - (canvasHeight / 2),
        targetUserId: targetUserId,
        targetUserName: targetUserName
      });

      console.log('Saving user...');

      collection.save(user, {w: 1}, function (err) {
        if (err) {
          console.error('Error when saving user: ' + err);
        }

        console.log('User saved successfully!');

        collection.findOne({ _id: user._id }, function (err, user) {
          if (err) {
            console.error('Error when fetching inserted user: ' + err);
          }

          res.json({
            user
          });
        })
      });
    });
  });
});

// update user position endpoint
app.post('/update', function (req, res) {
  var userId = req.body._id;
  var ax = req.body.ax;
  var ay = req.body.ay;
  var az = req.body.az;

  console.log('Update called for user ' + userId + ', data: ax: ' + ax + ' ay: ' + ay + 'az: ' + az);

  this.db.collection('user', function (err, collection) {
    if (err) {
      console.error('Error accessing user collection: ' + err);
    }

    collection.find().toArray(function (err, users) {
      if (err) {
        console.error('Error fetching users collection ' + err);
      }

      res.json({
        users
      })
    });
  });
});

app.listen(app.get('port'), function () {
  console.log(`Listening at http://localhost:${app.get('port')}`)
});

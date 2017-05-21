var express = require('express');
var app = express();
var path = require('path');
var models = require('./models/models');
var bodyParser = require('body-parser');
var THREE = require('three-math');
var MongoClient = require('mongodb').MongoClient;
var Map = require('./Map.js');
var ObjectId = require('mongodb').ObjectID;

var constants = require('./constants');

const canvasWidth = constants.canvasSize.width;
const canvasHeight = constants.canvasSize.height;

const mongodbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/k1ller'

const killMargin = 100;

var map = new Map.Map({
  vertices: [[-1000, -1000], [-1000, 1000], [1000, 1000], [1000, -1000]],
  indices: [[0, 1], [1, 2], [2, 3], [3, 0]]
});

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
      });
    });
  });
});

app.use(bodyParser.json());

app.use('/display', express.static(path.join(__dirname, '../client')));
app.use('/shared', express.static(path.join(__dirname, '../shared')));

// initialize users
app.get('/reset', function (req, res) {
  console.log('Resetting database, clearing all users...');

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
        if (targetedUsers.indexOf(user._id.toString()) == -1) {
          nonTargetedUsers.push(user);
        }
      });

      console.log('Targeted users: ' + targetedUsers.join(', '));
      console.log('Non targeted users: ' + nonTargetedUsers.map(function(u) { return u.name; }).join(', '));

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
        x: Math.random() * canvasWidth - (canvasWidth / 2) - 200,
        y: Math.random() * canvasHeight - (canvasHeight / 2) - 200,
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

  console.log('Update called for user ' + userId + ', data: ax: ' + ax + ' ay: ' + ay + ' az: ' + az);

  this.db.collection('user', function (err, collection) {
    if (err) {
      console.error('Error accessing user collection on update: ' + err);
    }

    collection.findOne({ _id: new ObjectId(userId) }, function (err, user) {
      if (err) {
        console.error('Error when fetching inserted user on update: ' + err);
      }

      if (user != null) {
        var newAx = user.x + (-7 * Number(ax));
        var newAy = user.y + (7 * Number(ay));

        var from = new THREE.Vector2(user.x, user.y);
        var to = new THREE.Vector2(newAx, newAy);

        // calculate new position
        var newPositionVector = map.move(from, to);

        user.x = newPositionVector.x;
        user.y = newPositionVector.y;

        collection.save(user, {w: 1}, function (err) {
          if (err) {
            console.error('Error when saving user: ' + err);
          }

          console.log('User saved successfully!');

          this.db.collection('user', function (err, collection) {
            if (err) {
              console.error('Error accessing user collection on update: ' + err);
            }

            collection.find().toArray(function (err, users) {
              if (err) {
                console.error('Error fetching users collection on update ' + err);
              }

              res.json({
                users
              });
            });
          });
        });
      } else {
        collection.find().toArray(function (err, users) {
          if (err) {
            console.error('Error fetching users collection on update ' + err);
          }

          res.json({
            users
          });
        });
      }
    })
  });
});

// kill user & update position endpoint
app.post('/kill', function (req, res) {
  var userId = req.body._id;

  console.log('Kill called for user ' + userId);

  try {
    this.db.collection('user', function (err, collection) {
      if (err) {
        console.error('Error accessing user collection on kill: ' + err);
        throw err;
      }

      collection.findOne({ _id: new ObjectId(userId) }, function (err, user) {
        if (err) {
          console.error('Error when fetching trigger user on kill: ' + err);
          throw err;
        }

        var x = user.x;
        var y = user.y;
        var targetUserId = user.targetUserId;

        collection.findOne({ _id: new ObjectId(targetUserId) }, function (err, targetUser) {
          if (err) {
            console.error('Error when fetching killed user on kill: ' + err);
            throw err;
          }

          if (targetUser != null) {
            var targetX = targetUser.x;
            var targetY = targetUser.y;

            var diffX = Math.abs(x - targetX);
            var diffY = Math.abs(y - targetY);

            console.log(diffX);
            console.log(diffY);

            if (diffX < killMargin && diffY < killMargin) {
              console.log('Killed user with id: ' + targetUserId);

              collection.remove({ _id: new ObjectId(targetUserId) }, function (err) {
                if (err) {
                  console.error('Error removing user ' + err);
                  throw err;
                }

                collection.find().toArray(function (err, users) {
                  if (err) {
                    console.error('Error fetching users collection on update ' + err);
                    throw err;
                  }

                  // update target
                  var targetUserId = null;
                  var targetUserName = null;

                  var targetedUsers = [];
                  var nonTargetedUsers = [];

                  users.forEach(function (user) {
                    if (user.targetUserId !== null) {
                      targetedUsers.push(user.targetUserId);
                    }
                  });

                  users.forEach(function (user) {
                    // exclude targeted users and yourself
                    if (targetedUsers.indexOf(user._id) === -1 && user._id.toString() !== userId) {
                      nonTargetedUsers.push(user);
                    }
                  });

                  console.log('Targeted users: ' + targetedUsers.join(', '));
                  console.log('Non targeted users: ' + nonTargetedUsers.map(function(u) { return u.name; }).join(', '));

                  if (nonTargetedUsers.length > 0) {
                    const userIdx = Math.round(Math.random() * (nonTargetedUsers.length - 1));
                    var targetUser = nonTargetedUsers[userIdx];

                    if (targetUser !== null) {
                      targetUserId = targetUser._id;
                      targetUserName = targetUser.name;
                    }
                  } else if (nonTargetedUsers.length == 1) {
                    var targetUser = nonTargetedUsers[0];

                    if (targetUser !== null) {
                      targetUserId = targetUser._id;
                      targetUserName = targetUser.name;
                    }
                  }

                  // update user that successfully killed
                  collection.findOne({ _id: new ObjectId(userId) }, function (err, user) {
                    if (err) {
                      console.error('Error when fetching trigger user on kill: ' + err);
                      throw err;
                    }

                    console.log('Updating target of a user');

                    user.targetUserId = targetUserId;
                    user.targetUserName = targetUserName;

                    collection.save(user, {w: 1}, function (err) {
                      console.log('Targets of a user updated!');

                      collection.find().toArray(function (err, users) {
                        if (err) {
                          console.error('Error fetching users collection on kill target update ' + err);
                          throw err;
                        }

                        res.json({
                          users
                        });
                      });
                    });
                  });
                });
              });
            } else {
              console.log('User not close enough to kill');

              collection.find().toArray(function (err, users) {
                if (err) {
                  console.error('Error fetching users collection on update ' + err);
                  throw err;
                }

                res.json({
                  users
                });
              });
            }
          } else {
            console.log('Target user for this user is null!');

            collection.find().toArray(function (err, users) {
              if (err) {
                console.error('Error fetching users collection on update ' + err);
                throw err;
              }

              res.json({
                users
              });
            });
          }
        });
      })
    });
  } catch (err) {
    res.json({
      message: 'error happened ' + err
    });
  }
});

app.listen(app.get('port'), function () {
  console.log(`Listening at http://localhost:${app.get('port')}`)
});

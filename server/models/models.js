var mongoose = require('mongoose');
var constants = require('../constants');

const canvasWidth = constants.canvasSize.width;
const canvasHeight = constants.canvasSize.height;

var Schema = new mongoose.Schema({
  name: {
    type: String
  },
  x: {
    type: Number
  },
  y: {
    type: Number
  },
  targetUserId: {
    type: String,
    index: true
  },
  targetUserName: {
    type: String
  }
});

var User = mongoose.model('User', Schema);

var initUsers = function(db) {
  // clear users and one user when instantiating the server
  db.collection('user', function (err, collection) {
    if (err) {
      console.error('Error accessing user collection: ' + err);
    }

    collection.remove(function (err) {
      if (err) {
        console.error('Error removing users from user collection: ' + err);
      }

      var user = new User ({
        name: 'Ziga',
        x: Math.random() * canvasWidth - (canvasWidth / 2),
        y: Math.random() * canvasHeight - (canvasHeight / 2),
        targetUserId: null,
        targetUserName: null
      });

      collection.save(user, {w: 1}, function (err) {
        if (err) {
          console.error('Error when saving user: ' + err);
        }

        console.log('Initial user saved successfully!');
      });
    })
  });
}

var createUser = function (db, name) {
  const canvasWidth = constants.canvasSize.width;
  const canvasHeight = constants.canvasSize.height;

  var targetUserId = null;

  return db.collection('user').then(
    function (collection) {
      collection.find({}, function (users) {
        console.log('Looking for a suitable target user...');

        var targetedUsers = [];
        var nonTargetedUsers = [];

        users.forEach(function(user) {
          if (user.targetUserId !== null) {
            targetedUsers.push(user.targetUserId);
          }
        });

        users.forEach(function(user) {
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
          }
        }

        if (name == null) {
          name = 'Dummy';
        }

        // generate user with random starting position
        var user = new User ({
          name: name,
          x: Math.random() * canvasWidth - (canvasWidth / 2),
          y: Math.random() * canvasHeight - (canvasHeight / 2),
          targetUserId: targetUserId
        });

        return user;
      });
    },
    function (err) {
      console.error(err);
    }
  );
}

var saveUser = function (db, user) {
  console.log('Accessing user collection...');

  return db.collection('user').then(
    function (collection) {
      console.log('Saving user collection...');

      console.log(user);

      collection.save(user, {w: 1}).then(
        function(user) {
          console.log('User saved successfully!');
        },
        function (err) {
          console.error('Error when saving user: ' + err);
        }
      );
    },
    function (err) {
      console.error('Error when accessing user collection: ' + err);
    }
  );
}

var getUserByName = function (db, name) {
  db.collection('user').then(
    function (err, collection) {
      if (err) {
        console.error('Error when accessing user collection ' + err);
      }

      collection.find({ name: name }, function (err, user) {
        if (err) {
          console.error('Error finding user with name ' + name + ' error: ' + err);
        }

        return user;
      });
  });
}

module.exports = {
  User: User,
  initUsers: initUsers,
  createUser: createUser,
  saveUser: saveUser,
  getUserByName: getUserByName
}

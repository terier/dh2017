var mongoose = require('mongoose');
var constants = require('../constants')

var Schema = new mongoose.Schema({
  userId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    index: true
  },
  avatar: {
    data: Buffer,
    contentType: String
  },
  x: {
    type: Number
  },
  y: {
    type: Number
  }
});

var User = mongoose.model('User', Schema);

var createUser = function (name) {
  const canvasWidth = constants.canvasSize.width;
  const canvasHeight = constants.canvasSize.height;

  // generate user with random starting position
  var user = new User ({
    name: name,
    x: Math.random() * canvasWidth - (canvasWidth / 2),
    y: Math.random() * canvasHeight - (canvasHeight / 2)
  });

  return user;
}

module.exports = {
  User: User,
  createUser: createUser

}

module.exports = (function() {
  var mongodb = require('mongodb')
  ,   ObjectID = mongodb.ObjectID
  ,   crypto = require('crypto')

  ,   UserProvider = function() {
    var db = this.db = new mongodb.Db('nodejitsu_airandfingers_nodejitsudb5539450801',
      new mongodb.Server('ds043947.mongolab.com', 43947, {}),
      {w: 1}
    );
    db.open(function (err, db_p) {
      if (err) { throw err; }
      db.authenticate('nodejitsu_airandfingers', 'v7te00ee9hrlhslv24sp2r6b4f', function (err, replies) {
      // You are now connected and authenticated.
      });
    });
  };

  UserProvider.prototype.getCollection= function(callback) {
    this.db.collection('users', function(error, user_collection) {
      if (error) callback(error);
      else callback(null, user_collection);
    });
  };

  UserProvider.prototype.authenticate = function(username, password, callback) {
    this.getCollection(function(error, user_collection) {
      if (error) callback(error);
      else {
        // encrypt password using SHA-1
        var shasum = crypto.createHash('sha1');
          shasum.update(password);
          shasum = shasum.digest('hex');
        // look for a matching username/password combination
        user_collection.findOne({
          username: username,
          password: shasum
        }, function(error, result) {
          if (error) callback(error);
          else callback(null, result)
        });
      }
    });
  };

  UserProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, user_collection) {
      if (error) callback(error);
      else {
        user_collection.findOne({_id: ObjectID.createFromHexString(id)}, function(error, result) {
          if (error) callback(error);
          else callback(null, result)
        });
      }
    });
  };

  /*UserProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
      if (error) callback(error);
      else {
        user_collection.find().sort({_id:1}).toArray(function(error, results) {
          if (error) callback(error);
          else callback(null, results)
        });
      }
    });
  };

  UserProvider.prototype.save = function(users, callback) {
    this.getCollection(function(error, user_collection) {
      if (error) callback(error);
      else {
        if (typeof(users.length) === "undefined")
          users = [users];

        for (var i = 0, max = users.length; i < max; i++) {
          user = users[i];
          user.created_at = new Date();
        }

        user_collection.insert(users, {safe: true}, function() {
          callback(null, users);
        });
      }
    });
  };*/

  return UserProvider;
})();
module.exports = (function () {
  var UserProvider = require('./user_provider')
    , user_provider = new UserProvider()
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

  //gets called whenever attempted login
  //returns user or an error message
  passport.use(new LocalStrategy(
    function (username, password, done) {
      user_provider.authenticate(username, password, function(err, result) {
        if (err) {
          return done(err);
        }
        else if (! result) {
          return done(null, false, { message: 'Invalid credentials!' });
        }
        else {
          return done(null, result);
        }
      });
    }
  ));
  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.
  passport.serializeUser(function(user, done) {
    //console.log("serializeUser called!");
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    //console.log("deserializeUser called!");
    user_provider.findById(id, function(err, result) {
      if (err) { return done(err); }
      if (! result) {
        return done(null, false, {message: 'Unknown id!'});
      }
      else {
        return done(null, result);
      }
    });
  });

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.  Otherwise, the user will be redirected to the
  //   login page.
  return {
    ensureAuthenticated: function (req, res, next) {
      //console.log("ensureAuthenticated called!");
      if (req.isAuthenticated()) { return next(); }
      res.redirect('/login?next=' + req.url);
    }
  };
})();
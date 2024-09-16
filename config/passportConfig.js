// config/passportConfig.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
    ? process.env.CONFIG_REDIRECT_URL_PROD
    : process.env.CONFIG_REDIRECT_URL_DEV 
  },
  async (accessToken, refreshToken, profile, done) => {
    // The user data will be handled in the googleAuthCallback in authController
    return done(null, profile);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
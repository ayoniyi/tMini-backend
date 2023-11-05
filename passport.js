// require("dotenv/config");
// const passport = require("passport");

// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const TwitterStrategy = require("passport-twitter").Strategy;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback",
//     },

//     // to create user in db
//     //   function(accessToken, refreshToken, profile, cb) {
//     //     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//     //       return cb(err, user);
//     //     });
//     //     User.findOne({ googleId: profile.id }).then((existingUser) => {
//     //     if (existingUser) {
//     //       // we already have a record with the given profile ID
//     //       done(null, existingUser);
//     //     } else {
//     //       // we don't have a user record with this ID, make a new record!
//     //        new User({ googleId: profile.id })
//     //       .save()
//     //         .then((user) => done(null, user));
//     //     }
//     //   });
//     //     //------ user object
//     //     const user = new User({
//     //     name: profile.dislayName,
//     //     username: profile.dislayName,
//     //     email: profile.email,
//     //     isAdmin: false,
//     //   })
//     // save user
//     //    }
//     // to move on without creating user
//     function (accessToken, refreshToken, profile, done) {
//       done(null, profile);
//     }
//   )
// );

// passport.use(
//   new TwitterStrategy(
//     {
//       consumerKey: TWITTER_CONSUMER_KEY,
//       consumerSecret: TWITTER_CONSUMER_SECRET,
//       callbackURL: "/api/auth/twitter/callback",
//     },
//     function (token, tokenSecret, profile, cb) {
//       User.findOrCreate({ twitterId: profile.id }, function (err, user) {
//         return cb(err, user);
//       });
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });
// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

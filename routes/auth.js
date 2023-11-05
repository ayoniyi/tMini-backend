const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv/config");
const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;

// Signup
router.post("/signup", async (req, res) => {
  // check if user exists
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists");
  //
  const usernameExist = await User.findOne({ username: req.body.username });
  if (usernameExist) return res.status(400).send("Username already in use");
  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // user object
  const user = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    isAdmin: req.body.isAdmin,
  });
  // save user
  try {
    const newUser = await user.save();
    res.json(newUser);
    //res.status(200)
  } catch (err) {
    res.json({ messages: err, description: err.data });
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    //Check if email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Incorrect username/password");
    //Check if password is correct
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return res.status(400).send("Wrong password.");

    //create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token);
    const userObj = {
      user,
      token,
    };
    res.status(200).json(userObj);
  } catch (err) {
    console.log(err);
    res.json({ messages: err, description: err.data });
  }
});

// google auth
//sign up
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);
// google auth endpoints
const CLIENT_URL = "http://localhost:5173/auth/req";
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/loginFail",
  })
);

router.get("/google/loginSuccess", (req, res) => {
  if (req.user) {
    res.status(200).json({
      sucess: true,
      message: "success",
      user: req.user,
      // jwt
    });
  } else {
    res.status(401).json({ message: "No user found" });
  }
});
router.get("/google/loginFail", (req, res) => {
  res.status(401).json({
    sucess: false,
    message: "failure",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("http://localhost:5173/auth");
});

//twitter auth
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TW_API_KEY,
      consumerSecret: process.env.TW_API_KEY_SECRET,
      callbackURL: "/api/auth/twitter/callback",
    },
    // function (token, tokenSecret, profile, cb) {
    //   User.findOrCreate({ twitterId: profile.id }, function (err, user) {
    //     return cb(err, user);
    //   });
    // }
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);
//twitter auth endpoints
router.get("/twitter", passport.authenticate("twitter"));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/auth" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:5173/auth/req");
  }
);
router.get("/twitter/loginSuccess", (req, res) => {
  //if (req.user) {
  res.status(200).json({
    sucess: true,
    message: "success",
    user: req.user,
    // jwt
  });
  console.log("req?", req);
  // } else {
  //   res.status(401).json({ message: "No user found" });
  // }
});
router.get("/twitter/loginFail", (req, res) => {
  res.status(401).json({
    sucess: false,
    message: "failure",
  });
});
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = router;

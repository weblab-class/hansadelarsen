/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
// GET /api/whoami
// Checks if the user is logged in AND fetches their latest data from the DB
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // Not logged in
    return res.send({});
  }

  // FORCE A DB LOOKUP (The Fix)
  // Instead of just sending 'req.user' (which might be stale),
  // we ask MongoDB for the latest version of this user.
  User.findById(req.user._id).then((user) => {
    res.send(user);
  });
});
router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|
router.post("/preferences", (req, res) => {
  if (!req.user) {
    return res.status(401).send({ msg: "You must be logged in to save!" });
  }

  User.findById(req.user._id).then((user) => {
    if (!user) return res.status(404).send({ msg: "User not found" });

    // 1. Update Personal Details (Top level fields)
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.birthdate = req.body.birthdate || user.birthdate;
    user.gender = req.body.gender || user.gender;

    // 2. Update Preferences (Nested object)
    if (!user.preferences) user.preferences = {};
    if (req.body.preferences) {
      user.preferences = Object.assign(user.preferences, req.body.preferences);
    }

    user.markModified("preferences");

    user.save().then((updatedUser) => {
      res.send(updatedUser);
    });
  });
});

// POST /api/schedule
router.post("/schedule", (req, res) => {
  if (!req.user) {
    return res.status(401).send({ msg: "Not logged in" });
  }

  User.findById(req.user._id).then((user) => {
    // req.body.schedule should be the 7x16 array
    user.schedule = req.body.schedule;

    // Tell Mongoose it changed (arrays can be tricky)
    user.markModified("schedule");

    user.save().then((updatedUser) => {
      res.send(updatedUser);
    });
  });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

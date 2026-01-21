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
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
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
  // 1. Safety Check: Are they logged in?
  if (!req.user) {
    return res.status(401).send({ msg: "You must be logged in to save!" });
  }

  User.findById(req.user._id).then((user) => {
    // 2. Safety Check: Does user exist?
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    // 3. THE FIX: Handle missing preferences
    // If user.preferences is undefined, use an empty object {} instead.
    const existingPrefs = user.preferences || {};

    // Merge new data into the existing (or empty) object
    user.preferences = Object.assign(existingPrefs, req.body);

    // 4. Save to MongoDB
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

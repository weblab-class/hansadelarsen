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
router.get("/whoami", (req, res) => {
  if (!req.user) {
    return res.send({});
  }
  User.findById(req.user._id).then((user) => {
    res.send(user);
  });
});

router.post("/initsocket", (req, res) => {
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

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.birthdate = req.body.birthdate || user.birthdate;
    user.gender = req.body.gender || user.gender;

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

// --- UPDATED SCHEDULE ROUTE STARTS HERE ---
router.post("/schedule", (req, res) => {
  if (!req.user) {
    return res.status(401).send({ msg: "Not logged in" });
  }

  User.findById(req.user._id).then((user) => {
    // 1. Update Recurring Schedule (if provided)
    if (req.body.schedule) {
      user.schedule = req.body.schedule;
      user.markModified("schedule");
    }

    // 2. Update Specific Weeks (if provided)
    if (req.body.specificWeeks) {
      user.specificWeeks = req.body.specificWeeks;
      user.markModified("specificWeeks");
    }

    // 3. Update Accepted Quests List (NEW)
    if (req.body.acceptedQuestsByWeek) {
      user.acceptedQuestsByWeek = req.body.acceptedQuestsByWeek;
      user.markModified("acceptedQuestsByWeek");
    }

    // 4. Update Ignored Quests List (NEW)
    if (req.body.ignoredQuestIds) {
      user.ignoredQuestIds = req.body.ignoredQuestIds;
      user.markModified("ignoredQuestIds");
    }

    user.save().then((updatedUser) => {
      res.send(updatedUser);
    });
  });
});
// --- UPDATED SCHEDULE ROUTE ENDS HERE ---

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

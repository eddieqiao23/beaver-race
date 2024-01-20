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
const Round = require("./models/round");
const ProblemSet = require("./models/problem_set");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.get("/test", (req, res) => {
  const newRound = new Round({
    id: '2',
    creator: '2',
    players: ['3', '2'],
    problems: '3',
    player_scores: [1, 2],
    multiplayer: true,
    started: true,
    public: true,
  });
  newRound.save().then((round) => res.send(round));

  // return res.send({});
});

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


// router.get("/test", (req, res) => {
//   // console.log(1);
//   // const newRound = new Round({
//   //   id: '2',
//   //   creator: '2',
//   //   players: ['3', '2'],
//   //   problems: '3',
//   //   player_scores: [1, 2],
//   //   multiplayer: true,
//   //   started: true,
//   //   public: true,
//   // });
//   // newRound.save().then((round) => res.send(round));
//   return res.send({});
// });


// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

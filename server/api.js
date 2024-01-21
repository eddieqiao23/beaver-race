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

// router.get("/test", (req, res) => {
//   const newRound = new Round({
//     id: '2',
//     creator: '2',
//     players: ['3', '2'],
//     problems: '3',
//     player_scores: [1, 2],
//     multiplayer: true,
//     started: true,
//     public: true,
//   });
//   newRound.save().then((round) => res.send(round));

//   // return res.send({});
// });

router.post("/create_problem_set", (req, res) => {
  const newProblemSet = new ProblemSet({
    questions: req.body.questions,
    answers: req.body.answers,
  });
  newProblemSet.save().then((problem_set) => res.send(problem_set));
});

router.post("/create_indiv_round", (req, res) => {
  let creatorUsername = "Guest";
  let creatorName = "Guest";
  if (req.user) {
    creatorUsername = req.user._id;
    creatorName = req.user.name;
  }
  const newRound = new Round({
    creator: creatorUsername, // _id of creator
    players: [creatorName], // list of _ids of participants
    problem_set_id: req.body.problem_set_id,
    player_scores: [0],
    multiplayer: false,
    started: true,
    public: false,
  });
  newRound.save().then((round) => res.send(round));
});

router.get("/get_round_by_id", (req, res) => {
  // find round by id 
  Round.findById(req.query.roundID).then((round) => {
    if (!round) {
      return res.send({ error: "Round not found" });
    }
    else {
      return res.send(round);
    }
  });
});

router.get("/get_problem_set_by_id", (req, res) => {
  ProblemSet.findById(req.query.problemSetID).then((problem_set) => {
    if (!problem_set) {
      return res.send({ error: "Problem set not found" });
    }
    else {
      return res.send(problem_set);
    }
  });
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

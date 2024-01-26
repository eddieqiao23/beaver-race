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

const Filter = require("bad-words");
const filter = new Filter();

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

router.post("/updateusername", (req, res) => {
    const { userId, username } = req.body;
    console.log(userId, username);

    if (filter.isProfane(username) || username.length < 2 || username.length > 20) {
        res.send({ success: false });
    } else {
        User.findByIdAndUpdate(userId, { username: username }, { new: true }, (err, user) => {
            if (err || !user) {
                res.send({ success: false });
            } else {
                res.send({ success: true });
            }
        });
    }
});

router.post("/update_user_pastgames", (req, res) => {
    const { userId, score, time } = req.body;
    const gameResult = time / score;
    User.findByIdAndUpdate(
        userId,
        { $push: { pastGames: gameResult } },
        { new: true },
        (err, user) => {
            if (err || !user) {
                res.send({ success: false });
            } else {
                res.send({ success: true });
                console.log("updated past games with score", { gameResult });
            }
        }
    );
});

router.get("/get_user_by_id", (req, res) => {
    User.findById(req.query.userId, (err, user) => {
        if (err) {
            res.send({ success: false, error: err });
        } else {
            res.send(user);
        }
    });
});

router.get("/get_top_users", (req, res) => {
    User.find({}).then((users) => {
        let usersWithScore;

        if (req.query.sortMethod === "best") {
            usersWithScore = users.map((user) => {
                const bestScore = user.pastGames.length === 0 ? 999 : Math.min(...user.pastGames);
                return { ...user._doc, bestScore };
            });
            usersWithScore.sort((a, b) => a.bestScore - b.bestScore);
        } else {
            // Default to sorting by average
            usersWithScore = users.map((user) => {
                const totalScore =
                    user.pastGames.length === 0 ? 999 : user.pastGames.reduce((a, b) => a + b, 0);
                const averageScore =
                    user.pastGames.length === 0 ? 999 : totalScore / user.pastGames.length;
                return { ...user._doc, averageScore };
            });
            usersWithScore.sort((a, b) => a.averageScore - b.averageScore);
        }

        const topUsers = usersWithScore.slice(0, 10);
        res.send({ success: true, users: topUsers });
    });
});

router.post("/create_problem_set", (req, res) => {
    const newProblemSet = new ProblemSet({
        questions: req.body.questions,
        answers: req.body.answers,
    });
    newProblemSet.save().then((problem_set) => res.send(problem_set));
});

router.post("/create_indiv_round", (req, res) => {
    let creatorID = "Guest Beaver";
    let creatorUsername = "Guest Beaver";
    if (req.user) {
        creatorID = req.user._id;
        creatorUsername = req.user.name;
    }
    const newRound = new Round({
        creator: creatorID, // _id of creator
        players: [creatorID], // list of _ids of participants
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
        } else {
            return res.send(round);
        }
    });
});

router.get("/get_round_by_shortID", (req, res) => {
    // find round by shortID
    const shortID = req.query.shortID;
    console.log(shortID)
    Round.find({}).then((rounds) => {
        const matchingRounds = rounds.filter(round => round._id.toString().toUpperCase().endsWith(shortID));
        console.log("matching rounds", matchingRounds);
        if (!matchingRounds || matchingRounds.length === 0) {
            return res.send({ error: "Round not found" });
        } else {
            return res.send(matchingRounds[0]._id); // return the first match
        }
    });
});

router.get("/get_problem_set_by_id", (req, res) => {
    ProblemSet.findById(req.query.problemSetID).then((problem_set) => {
        if (!problem_set) {
            return res.send({ error: "Problem set not found" });
        } else {
            return res.send(problem_set);
        }
    });
});

router.post("/delete_problem_set_by_id", (req, res) => {
    let problemSetID = req.body.problemSetID;
    ProblemSet.findByIdAndDelete(problemSetID).then((problem_set) => {
        if (!problem_set) {
            return res.send({ error: "Problem set not found" });
        } else {
            return res.send(problem_set);
        }
    });
});

router.post("/delete_round_by_id", (req, res) => {
    let roundID = req.body.roundID;
    Round.findByIdAndDelete(roundID).then((round) => {
        if (!round) {
            return res.send({ error: "Round not found" });
        } else {
            return res.send(round);
        }
    });
});

router.post("/update_round", (req, res) => {
    let roundID = req.body.roundID;
    let problemSetID = req.body.problemSetID;
    // update round with new problem set
    Round.findByIdAndUpdate(
        roundID, 
        { problemSet : problemSetID },
        { players : [req.user._id]},
        { new: true },
    )
    .then((updatedRound) => {
        if (!updatedRound) {
            return res.send({ error: "Round not found" });
        } else {
            return res.send(updatedRound);
        }
    })
    .catch((err) => {
        return res.send({ error: err });
    });
});

// router.get("/activeUsers", (req, res) => {
//     res.send({ activeUsers: socketManager.getAllConnectedUsers() });
// });

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
    if (req.user) {
        console.log("hi");
        socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
    }

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

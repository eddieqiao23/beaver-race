// const mongoose = require("mongoose");

// const ProblemSetSchema = new mongoose.Schema({
//     name: String,
//     problems: [String],
//     });

// // compile model from schema
// module.exports = mongoose.model("user", UserSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProblemSchema = new Schema({
  Problem: String,
  Solution: String,
});

const ProblemSetSchema = new Schema({
  problems: [ProblemSchema],
});

module.exports = mongoose.model('problem_set', ProblemSetSchema);

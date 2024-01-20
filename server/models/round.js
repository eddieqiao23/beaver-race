const mongoose = require("mongoose");

const RoundSchema = new mongoose.Schema({
    id: String,
    creator: String, // _id of creator
    players: [String], // list of _ids of participants
    problems: String,
    player_scores: [Number],
    multiplayer: Boolean,
    started: Boolean,
    public: Boolean,

});
    
// compile model from schema
module.exports = mongoose.model("round", RoundSchema);
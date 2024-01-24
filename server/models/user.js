const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    name: String,
    googleid: String,
    pastGames: [Number],
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
// export default mongoose.model("user", UserSchema);

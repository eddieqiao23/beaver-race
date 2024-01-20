import React from "react";
import Leaderboard from "../modules/Leaderboard.js";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";

import "./Race.css"

// Page that displays all elements of a multiplayer race 
const Race = (props) => {
    let user_ids = ["Dylan", "Eddie"];
    let scores = [1, 2];
    return (
        <div className="Race-container">
            <Leaderboard user_ids={user_ids} scores={scores} />
            <Timer />
            {/* <Question /> */}
        </div>
    )
}

export default Race;
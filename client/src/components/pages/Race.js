import React from "react";
import Scoreboard from "../modules/Scoreboard.js";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";

import "./Race.css"

// Page that displays all elements of a multiplayer race 
const Race = (props) => {
    let user_ids = ["Dylan", "Eddie"];
    let scores = [1, 2];
    return (
        <div className="Race-container">
            <Scoreboard user_ids={user_ids} scores={scores} />
            <Timer />
            {/* <Question /> */}
        </div>
    )
}

export default Race;
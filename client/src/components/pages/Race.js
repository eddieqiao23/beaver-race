import React from "react";
import Leaderboard from "../modules/Leaderboard.js";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";

import "./Race.css"

// Page that displays all elements of a multiplayer race 
const Race = (props) => {
    return (
        <div className="Race-container">
            <Leaderboard />
            <Timer />
            <Question />
        </div>
    )
}

export default Race;
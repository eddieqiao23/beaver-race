import React from "react";
import Scoreboard from "../modules/Scoreboard.js";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";

import "./Multi.css"

// Page that displays all elements of a multiplayer race 
const Multi = (props) => {
    let user_ids = ["dylan", "eddie"];
    let scores = [1, 2];
    return (
        <div className="Multi-container">
            <Scoreboard user_ids = {user_ids} scores = {scores} />
            <Timer />
            {/* <Question /> */}
        </div>
    )
}

export default Multi;
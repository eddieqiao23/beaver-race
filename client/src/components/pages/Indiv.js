import React from "react";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";

import "./Indiv.css"

// Page that displays all elements of a multiplayer race 
const Indiv = (props) => {
    return (
        <div className="Indiv-container">
            <Timer />
            <Question />
        </div>
    )
}

export default Indiv;
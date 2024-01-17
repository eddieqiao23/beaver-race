import React, { useState } from "react";
// import AnswerBox from "./AnswerBox.js";

import "./Question.css";


// Page that displays all elements of a multiplayer race 
const Question = (props) => {
    const [currProblem, setCurrProblem] = useState(0);

    let allQuestions = props.questions;
    console.log(allQuestions);
    
    const handleInputChange = (event) => {
        if (event.target.value === allQuestions[currProblem]['answer']) {
            setTimeout(() => {
                setCurrProblem(currProblem + 1);
                event.target.value = "";    
            }, 50);
        }
    }

    return (
        <div className="Question-container">
            <div className="Question-score">
                <p>
                    Score: { currProblem }
                </p>
            </div>
            <div className="Question-problem">
                {allQuestions[currProblem]['question']}
            </div>
            <div className="Question-answer-box">
                <input type="text" placeholder="" onChange={handleInputChange} style={{fontSize: '24pt'}}/>
            </div>
        </div>
    )
}

export default Question;
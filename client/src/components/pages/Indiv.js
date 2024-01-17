import React, { useState } from "react";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";

import "./Indiv.css"

// Page that displays all elements of a multiplayer race 
const Indiv = (props) => {
    const [currProblem, setCurrProblem] = useState(0);

    const getRandomProblem = () => {
        let sign = Math.floor(Math.random() * 2); // 0 = +, *, 1 = -, /
        let num1 = 0;
        let num2 = 0;
        if (sign === 0) {
            num1 = Math.floor(Math.random() * 98) + 2;
            num2 = Math.floor(Math.random() * 98) + 2;
        }
        else {
            num1 = Math.floor(Math.random() * 10) + 2;
            num2 = Math.floor(Math.random() * 98) + 2;
        }

        if (sign === 0) {
            if (Math.floor(Math.random() * 2) === 0) {
                return {'question': `${num1} + ${num2}`, 'answer': `${num1 + num2}`}
            }
            else {
                return {'question': `${num1 + num2} - ${num1}`, 'answer': `${num2}`}
            }
        }
        else {
            if (Math.floor(Math.random() * 2) === 0) {
                return {'question': `${num1} x ${num2}`, 'answer': `${num1 * num2}`}
            }
            else {
                return {'question': `${num1 * num2} ÷ ${num1}`, 'answer': `${num2}`}
            }
        }
    }
    
    let questions = [];
    for (let i = 0; i < 20; i++) {
        questions.push(getRandomProblem());
    }

    console.log(questions);

    return (
        <div className="Indiv-container">
            <Timer />
            <Question 
                questions={questions}
            />
            
        </div>
    )
}

export default Indiv;
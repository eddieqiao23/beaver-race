import React, { useState, useEffect, useRef } from "react";
import { get, post } from "../../utilities";
import "./MultiQuestion.css";
import { move } from "../../client-socket";

// Page that displays all elements of a multiplayer race
const MultiQuestion = (props) => {
    const [currProblem, setCurrProblem] = useState(0);
    const inputRef = useRef();

    let score = props.score;
    let setScore = props.setScore;
    let questions = props.questions;
    let answers = props.answers;
    let doneLoading = props.doneLoading;

    useEffect(() => {
        if (doneLoading && props.raceStarted) {
            inputRef.current && inputRef.current.focus();
        }
    }, [doneLoading, props.raceStarted]);

    const handleInputChange = (event) => {
        if (event.target.value === answers[score]) { // Checks if correct
            setTimeout(() => {
                setScore(score + 1);
                event.target.value = "";
            }, 50); // 50 ms delay to make it smoother
            move();
        }
    };

    return (
        <div>
            {!doneLoading ? (
                <div> </div>
            ) : (
                <>
                    {props.raceStarted ? (
                        <div>
                            <div className="MultiQuestion-container">
                                <div className="MultiQuestion-score">Score: {score}</div>
                                <div className="MultiQuestion-problem">{questions[score]}</div>
                                <div className="MultiQuestion-answer-box">
                                    <input
                                        type="text"
                                        placeholder=""
                                        onChange={handleInputChange}
                                        ref={inputRef}
                                        style={{ fontSize: "24pt" }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div> </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MultiQuestion;

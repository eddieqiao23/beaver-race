import React, { useState, useEffect, useRef } from "react";
import { get, post } from "../../utilities";
import "./MultiQuestion.css";
import { move } from "../../client-socket";

// Page that displays all elements of a multiplayer race
const MultiQuestion = (props) => {
    const [currProblem, setCurrProblem] = useState(0);
    const inputRef = useRef();
    const [fontSize, setFontSize] = useState(24);
    const fontSizeRef = useRef(fontSize);

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
        if (event.target.value.toLowerCase() === answers[score].toLowerCase()) { // Checks if correct
            setTimeout(() => {
                setScore(score + 1);
                event.target.value = "";
            }, 50); // 50 ms delay to make it smoother
            move();
        }
    };

    let text = "";
    useEffect(() => {
        // console.log(score);
        console.log(questions);
        if (questions[score]) {
            // console.log(questions[score]);
            const questionLength = questions[score].length;
            console.log(questions[score]);
            console.log(questionLength);

            if (questionLength < 10) {
                fontSizeRef.current = 40;
            }
            else if (questionLength < 30) {
                fontSizeRef.current = 30;
            } 
            else if (questionLength < 50) {
                fontSizeRef.current = 20;
            } 
            else {
                fontSizeRef.current = 16;
            }
        }
    }, [score]);

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
                                <div className="MultiQuestion-problem" style={{ fontSize: `${fontSizeRef.current}pt`}}>{questions[score]}</div>
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

import React, { useState, useEffect, useRef } from "react";
import { get, post } from "../../utilities";
import "./MultiQuestion.css";
import { move } from "../../client-socket";

// Page that displays all elements of a multiplayer race
const MultiQuestion = (props) => {
    const [currProblem, setCurrProblem] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [doneLoading, setDoneLoading] = useState(false);
    const inputRef = useRef();

    let score = props.score;
    let setScore = props.setScore;

    const getRoundInfo = async () => {
        get("/api/get_round_by_id", { roundID: props.gameID }).then((round) => {
            console.log("This displays the round for ID " + round.problem_set_id);
            console.log("User ID: " + props.userID);
            console.log("Players: ");
            console.log(round.players);
            if (round.players[0] === props.userID) {
                props.setIsHost(true);
            }
            get("/api/get_problem_set_by_id", { problemSetID: round.problem_set_id }).then(
                (problemSet) => {
                    console.log("This displays the problem set for ID " + problemSet._id);
                    setQuestions(problemSet.questions);
                    setAnswers(problemSet.answers);
                    setDoneLoading(true);
                    console.log(questions);
                }
            );
        });
    };

    useEffect(() => {
        const roundID = props.gameID;
        const userID = props.userID;

        // console.log("Round ID: " + roundID);
        // console.log("User ID: " + userID);

        getRoundInfo();
    }, []);

    useEffect(() => {
        if (doneLoading && props.raceStarted) {
            inputRef.current && inputRef.current.focus();
        }
    }, [doneLoading, props.raceStarted]);

    const handleInputChange = (event) => {
        if (event.target.value === answers[score]) {
            setTimeout(() => {
                setScore(score + 1);
                event.target.value = "";
            }, 50);
            move();
        }
    };

    return (
        <div>
            {!doneLoading ? (
                <div> </div>
            ) : (
                <>
                    {props.raceStarted ? 
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
                                : <div> </div> }
                </>
            )}
        </div>
    );

    return <div>hi</div>;
};

export default MultiQuestion;

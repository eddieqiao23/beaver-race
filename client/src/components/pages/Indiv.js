import React, { useState, useEffect, useRef } from "react";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";
import MultiQuestion from "../modules/MultiQuestion.js";
import RoundEndScoreboard from "../modules/RoundEndScoreboard.js";
import { Link } from "react-router-dom";

import beaver_image from "../../public/assets/beavers/beaver_picture.png";
import logs from "../../public/assets/beavers/logs.png";

import "../../utilities.css";
import "./Indiv.css";

import { get, post } from "../../utilities.js";

import Leaderboard from "../modules/Leaderboard.js";

const getRandomProblem = () => {
    let sign = Math.floor(Math.random() * 2); // 0 = +, *, 1 = -, /
    let num1 = 0;
    let num2 = 0;
    if (sign === 0) {
        num1 = Math.floor(Math.random() * 98) + 2;
        num2 = Math.floor(Math.random() * 98) + 2;
    } else {
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 98) + 2;
    }

    if (sign === 0) {
        if (Math.floor(Math.random() * 2) === 0) {
            return { question: `${num1} + ${num2}`, answer: `${num1 + num2}` };
        } else {
            return { question: `${num1 + num2} - ${num1}`, answer: `${num2}` };
        }
    } else {
        if (Math.floor(Math.random() * 2) === 0) {
            return { question: `${num1} x ${num2}`, answer: `${num1 * num2}` };
        } else {
            return { question: `${num1 * num2} ÷ ${num1}`, answer: `${num2}` };
        }
    }
};

// Page that displays all elements of a multiplayer race
const Indiv = (props) => {
    // const [currProblem, setCurrProblem] = useState(0);
    let round_time = 120;
    let pre_match_time = 0;
    let num_problems = 10;
    const [roundTimer, setRoundTimer] = useState(round_time + pre_match_time);
    // const [preMatchTimer, setPreMatchTimer] = useState(pre_match_time);
    const [newProblemSetID, setNewProblemSetID] = useState("");
    const [newRoundID, setNewRoundID] = useState("");
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [spqScore, setSpqScore] = useState(0);
    const [score, setScore] = useState(0);
    const [notUpdatedGame, setNotUpdatedGame] = useState(true);
    const [updateLeaderboard, setUpdateLeaderboard] = useState(false);
    const [createdNewRound, setCreatedNewRound] = useState(false);
    const gameFinishedRef = useRef(gameFinished);

    // useEffect(() => {
    //     const intervalTimer = setInterval(() => {
    //         setPreMatchTimer((preMatchTimer) => preMatchTimer - 1);
    //     }, 1000);

    //     // Clear the interval when the timer reaches 0
    //     if (preMatchTimer <= 0) {
    //         clearInterval(intervalTimer);
    //         setGameStarted(true);
    //     }

    //     // Cleanup the interval on component unmount
    //     return () => clearInterval(intervalTimer);
    // }, [preMatchTimer]);

    useEffect(() => {
    let intervalTimer;
        if (gameStarted && !gameFinished) {
            intervalTimer = setInterval(() => {
            setRoundTimer((roundTimer) => roundTimer - 0.01);
            }, 10);
        }

        // Clear the interval when the timer reaches 0
        if (roundTimer <= 0) {
            clearInterval(intervalTimer);
            setGameFinished(true);
            gameFinishedRef.current = true;
            setRoundTimer(0);
            post("/api/delete_problem_set_by_id", { problem_set_id: newRoundID });
            post("/api/delete_round_by_id", { round_id: newRoundID });
            console.log("game finished");
        }    

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [roundTimer, gameStarted]);

    useEffect(() => {
        if (score === num_problems) {
            setGameFinished(true);
            gameFinishedRef.current = true;
        }
    }, [score]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Enter" && score === 0) {
                setGameStarted(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Prevent the default behavior when the Tab key is pressed
            if (event.key === 'Tab') {
                event.preventDefault();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {  
            if (event.ctrlKey && event.key === "Enter") {
                setGameFinished(false);
                setScore(0);
                setNewRoundID("");
                setRoundTimer(round_time + pre_match_time);
                setNotUpdatedGame(true);
                setCreatedNewRound(false);
                gameFinishedRef.current = false;
                setGameStarted(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Enter" && gameFinishedRef.current) {
                setGameFinished(false);
                setGameStarted(false);
                setScore(0);
                setNewRoundID("");
                setRoundTimer(round_time + pre_match_time);
                setNotUpdatedGame(true);
                setCreatedNewRound(false);
                gameFinishedRef.current = false;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const updatePastGames = async () => {
            setSpqScore(((round_time - roundTimer) / score).toFixed(2));
            console.log(gameFinished, props.userId, notUpdatedGame, score)
            if (gameFinished && props.userId && notUpdatedGame && score > 0) {
            console.log(score, roundTimer);
            await post(`/api/update_user_pastgames`, {
                userId: props.userId,
                score: score,
                time: (round_time - roundTimer),
            }); 
            setNotUpdatedGame(false);
            }
            if (gameFinished && !props.userId) {
            setNotUpdatedGame(false);
            }
        };

        updatePastGames();
    }, [gameFinished]);

    useEffect(() => {
        setUpdateLeaderboard(true);
        setUpdateLeaderboard(false);
    }, [notUpdatedGame]);

    useEffect(() => {
        const createProblemSetAndRound = async () => {
            console.log("started...");
            let questions = [];
            let answers = [];
            for (let i = 0; i < 20; i++) {
                let newQuestion = getRandomProblem();
                questions.push(newQuestion.question);
                answers.push(newQuestion.answer);
            }

            try {
                const problemSetRes = await post("/api/create_problem_set", {
                    questions: questions,
                    answers: answers,
                });
                const problemSetID = problemSetRes._id;
                setNewProblemSetID(problemSetID);
                console.log("Problem Set: " + problemSetID);

                const newRoundRes = await post("/api/create_indiv_round", {
                    problem_set_id: problemSetID,
                });
                const createdRoundID = newRoundRes._id;
                console.log("Round: " + createdRoundID);

                return createdRoundID;
            } catch (error) {
                console.log(error);
                console.log("error creating problem set or round :(");
            }
        };
        // createProblemSetAndRound().then(() => console.log("finished!"));
        if (!createdNewRound) {
            const changeRoundID = async () => {
                let createdRoundID = await createProblemSetAndRound();
                setNewRoundID(createdRoundID);
            };

            try {
                changeRoundID().then(() => console.log("finished!"));
                setCreatedNewRound(true);
            } catch (error) {
                location.reload();
            }
        }
    }, [newRoundID]);

    // console.log("Round ID: " + newRoundID);
    let scores = [score];
    return (
        <div className="Indiv-container">
            <div className="Indiv-game">
                {newRoundID === "" ? (
                    // <div className="Indiv-preMatchTimer">round starting in {preMatchTimer}</div>
                    <div></div>
                ) : (
                    <div>
                        <div className="Indiv-roundTimer Indiv-headline-text">
                            <div className="u-inlineBlock">
                                {gameStarted ? "Get to the logs asap!" : "Press enter to start!"}
                            </div>
                            <div className="u-inlineBlock">
                                Remaining time: {roundTimer.toFixed(0)}
                            </div>
                        </div>
                        <div className="Indiv-beaver-river">
                            <div className="Indiv-beaver-bar">
                                <div style={{ marginLeft: `${score * 50}px` }}>
                                    <img src={beaver_image} className="Indiv-beaver-image" />
                                </div>
                                <div className="Indiv-log">
                                    <img src={logs} className="Indiv-log-image" />
                                </div>
                            </div>
                        </div>
                        {/* <Timer />  */}
                        {/* <Question roundID={newRoundID} score={score} setScore={setScore} /> */}
                        {gameStarted && !gameFinished && <Question roundID={newRoundID} score={score} setScore={setScore} />}
                        {/* <MultiQuestion gameID={newRoundID} score={score} setScore={setScore} /> */}
                        {!gameStarted ? (
                            <div className="Indiv-game-start-container">
                            <button
                                className="u-pointer Indiv-start-play-button"
                                onClick={() => {
                                    setGameStarted(true);
                            }}
                        >
                            Press enter to start!
                        </button>
                    </div>
                        ) : (
                            <div></div>
                        )}
                    </div>
                )}
            </div>
            {gameFinished ? (
                <>
                    <div className="Indiv-game-finished-container">
                        {/* <RoundEndScoreboard multiplayer={false} scores={scores} /> */}
                        Score: {spqScore} spq
                        <button
                            className="u-pointer Indiv-play-again-button"
                            onClick={() => {
                                // location.reload();
                                setGameFinished(false);
                                setGameStarted(false);
                                setScore(0);
                                setNewRoundID("");
                                setRoundTimer(round_time + pre_match_time);
                            }}
                        >
                            Press enter to play again!
                        </button>
                    </div>
                    <div className="Indiv-leaderboard Home-main-rounded-div Home-headline-text Home-leaderboard">
                        {!notUpdatedGame && <Leaderboard userId={props.userId} updateLeaderboard={updateLeaderboard} />}
                    </div>
                </>
            ) : (
                <div></div>
            )}
        </div>
    );
};

export default Indiv;

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

const TOTAL_QUESTIONS = 10;
const ROUND_TIME = 120;

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
    const [roundTimer, setRoundTimer] = useState(ROUND_TIME);
    const [newProblemSetID, setNewProblemSetID] = useState("");
    const [newRoundID, setNewRoundID] = useState("");
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [spqScore, setSpqScore] = useState(0);
    const [score, setScore] = useState(0);
    const [notUpdatedGame, setNotUpdatedGame] = useState(true);
    // const [updateLeaderboard, setUpdateLeaderboard] = useState(false);
    const [createdNewRound, setCreatedNewRound] = useState(false);
    const gameFinishedRef = useRef(gameFinished);

    // Timer for the round (120 sec)
    useEffect(() => {
        let intervalTimer;
        // Start when the race starts, end when it's finished
        if (gameStarted && !gameFinished) { 
            intervalTimer = setInterval(() => {
                setRoundTimer((roundTimer) => roundTimer - 0.01);
            }, 10); // Update every 0.01 sec
        }

        // Stop the timer if it reaches 0
        if (roundTimer <= 0) {
            // Restart states when the game finishes
            clearInterval(intervalTimer);
            setGameFinished(true);
            setRoundTimer(0);
            gameFinishedRef.current = true;

            // Clear from MongoDB
            post("/api/delete_problem_set_by_id", { problem_set_id: newProblemSetID });
            post("/api/delete_round_by_id", { round_id: newRoundID });
        }

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [roundTimer, gameStarted]);

    // Check if the game is over
    useEffect(() => {
        if (score === TOTAL_QUESTIONS) {
            setGameFinished(true);
            gameFinishedRef.current = true;
        }
    }, [score]);

    // Enter is how the game starts
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

    // Prevent default tab behavior
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Tab") {
                event.preventDefault();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Command + Enter to reset the game quickly
    useEffect(() => {
        const handleKeyDown = (event) => {  
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                setGameFinished(false);
                setScore(0);
                setNewRoundID("");
                setRoundTimer(ROUND_TIME);
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

    // Enter to reset the game
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Enter" && gameFinishedRef.current) {
                setGameFinished(false);
                setGameStarted(false);
                setScore(0);
                setNewRoundID("");
                setRoundTimer(ROUND_TIME);
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

    // After the game is over, update the user's past games
    useEffect(() => {
        const updatePastGames = async () => {
            setSpqScore(((ROUND_TIME - roundTimer) / score).toFixed(2));
            console.log(gameFinished, props.userId, notUpdatedGame, score);
            if (gameFinished && props.userId && notUpdatedGame && score > 0) {
                console.log(score, roundTimer);
                await post(`/api/update_user_pastgames`, {
                    userId: props.userId,
                    score: score,
                    time: ROUND_TIME - roundTimer,
                });
                setNotUpdatedGame(false);
            }
            if (gameFinished && !props.userId || score === 0) {
                setNotUpdatedGame(false);
            }
        };

        updatePastGames();
    }, [gameFinished]);

    useEffect(() => {
        const createProblemSetAndRound = async () => {
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

    return (
        <div className="Indiv-container">
            <div className="Indiv-game">
                {newRoundID === "" ? (
                    <div></div>
                ) : (
                    <div>
                        <div className="Indiv-roundTimer Indiv-headline-text">
                            <div className="u-inlineBlock">
                                {!gameFinished ? "Get to the logs asap!" : "Great job beaver!"}
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
                                <div className={`${score === TOTAL_QUESTIONS ? "Indiv-highlighted-log" : "Indiv-log"}`}>
                                    <img src={logs} className="Indiv-log-image" />
                                </div>
                            </div>
                        </div>
                        {gameStarted && !gameFinished && (
                            <Question roundID={newRoundID} score={score} setScore={setScore} />
                        )}
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
                        Score: {spqScore} spq
                        <button
                            className="u-pointer Indiv-play-again-button"
                            onClick={() => {
                                setGameFinished(false);
                                setGameStarted(false);
                                setScore(0);
                                setNewRoundID("");
                                setRoundTimer(ROUND_TIME);
                                setNotUpdatedGame(true);
                                setCreatedNewRound(false);
                                gameFinishedRef.current = false;
                            }}
                        >
                            Press enter to play again!
                        </button>
                    </div>
                    <div className="Indiv-leaderboard">
                        {!notUpdatedGame && (
                            <Leaderboard userId={props.userId}/>
                        )}
                    </div>
                </>
            ) : (
                <div></div>
            )}
        </div>
    );
};

export default Indiv;

import React, { useState, useEffect } from "react";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";
import MultiQuestion from "../modules/MultiQuestion.js";
import RoundEndScoreboard from "../modules/RoundEndScoreboard.js";

import "./Indiv.css";

import { get, post } from "../../utilities.js";

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
    let round_time = 30;
    const [roundTimer, setRoundTimer] = useState(round_time);
    const [preMatchTimer, setPreMatchTimer] = useState(5);
    const [newProblemSetID, setNewProblemSetID] = useState("");
    const [newRoundID, setNewRoundID] = useState("");
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [score, setScore] = useState(0);

    let userId = props.userId;

    useEffect(() => {
        const intervalTimer = setInterval(() => {
            setPreMatchTimer((preMatchTimer) => preMatchTimer - 1);
        }, 1000);

        // Clear the interval when the timer reaches 0
        if (preMatchTimer === 0) {
            clearInterval(intervalTimer);
            setGameStarted(true);
        }

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [preMatchTimer]);

    useEffect(() => {
        const intervalTimer = setInterval(() => {
            setRoundTimer((roundTimer) => roundTimer - 1);
        }, 1000);

        // Clear the interval when the timer reaches 0
        if (roundTimer === 0) {
            clearInterval(intervalTimer);
            setGameFinished(true);
            post("/api/delete_problem_set_by_id", { problem_set_id: newRoundID });
            post("/api/delete_round_by_id", { round_id: newRoundID });
            console.log("game finished");
        }

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [roundTimer]);

    useEffect(() => {
        if (gameFinished && userId) {
            console.log(score, roundTimer);
            post(`/api/update_user_pastgames`, { userId: userId, score: score, time: round_time});
        }}, [gameFinished]);

    useEffect(() => {
        const createProblemSetAndRound = async () => {
            console.log("started...");
            let questions = [];
            let answers = [];
            for (let i = 0; i < 200; i++) {
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

        const changeRoundID = async () => {
            let createdRoundID = await createProblemSetAndRound();
            setNewRoundID(createdRoundID);
        };

        try {
            changeRoundID().then(() => console.log("finished!"));
        } catch (error) {
            location.reload();
        }
    }, []);

    console.log("Round ID: " + newRoundID);
    let scores = [score];
    return (
        <div className="Indiv-container">
            {gameFinished ? (
                <div className="Indiv-gameFinished">
                    <RoundEndScoreboard multiplayer={false} scores={scores} />
                </div>
            ) : (
                <div className="Indiv-game">
                    {!gameStarted || newRoundID === "" ? (
                        <div className="Indiv-preMatchTimer"> {preMatchTimer} </div>
                    ) : (
                        <div>
                            <div className="Indiv-roundTimer"> {roundTimer} </div>
                            {/* <Timer />  */}
                            <Question roundID={newRoundID} score={score} setScore={setScore} />
                            {/* <MultiQuestion gameID={newRoundID} score={score} setScore={setScore} /> */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // const newRound = new Round({
    //     creator: '2',
    //     players: ['3', '2'],
    //     question: 1,
    //     player_scores: [0],
    //     multiplayer: false,
    //     started: true,
    //     public: false,
    // });
    // newRound.save();
};

export default Indiv;

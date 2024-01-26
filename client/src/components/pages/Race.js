import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../../client-socket.js";
import { Link, useNavigate } from "react-router-dom";
import Scoreboard from "../modules/Scoreboard.js";
// import Timer from "../modules/Timer.js";
// import Question from "../modules/Question.js";
import MultiQuestion from "../modules/MultiQuestion.js";

import beaver_image from "../../public/assets/beavers/beaver_picture.png";
import logs from "../../public/assets/beavers/logs.png";

import { get, post } from "../../utilities";
// import { drawCanvas } from "../../canvasManager";

import "./Race.css";

const TOTAL_QUESTIONS = 10;

// Page that displays all elements of a multiplayer race
const Race = (props) => {
    let round_time = 120;
    const [roundTimer, setRoundTimer] = useState(round_time);
    const [loggedIn, setLoggedIn] = useState(false);
    const [score, setScore] = useState(0);
    const [showGame, setShowGame] = useState(true);
    const [players, setPlayers] = useState([]);
    const [scores, setScores] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [raceStarted, setRaceStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [placements, setPlacements] = useState(0);
    const [emittedPlacing, setEmittedPlacing] = useState(false);
    const emittedPlacingRef = useRef(emittedPlacing);
    const [everyoneFinished, setEveryoneFinished] = useState(false);
    const [preGameTimer, setPreGameTimer] = useState(0);
    const [preGameTimerStarted, setPreGameTimerStarted] = useState(false);

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    const [spqScore, setSpqScore] = useState(0);
    const [notUpdatedGame, setNotUpdatedGame] = useState(true);
    const [doneLoading, setDoneLoading] = useState(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const gameID = searchParams.get("id");

    const navigate = useNavigate();
    // const canvasRef = useRef(null);

    useEffect(() => {
    let intervalTimer;
        if (raceStarted && !everyoneFinished) {
            intervalTimer = setInterval(() => {
            setRoundTimer((roundTimer) => roundTimer - 0.01);
            }, 10);
        }

        // Clear the interval when the timer reaches 0
        if (roundTimer <= 0) {
            clearInterval(intervalTimer);
            setGameFinished(true);
            setRoundTimer(0);
            post("/api/delete_problem_set_by_id", { problem_set_id: gameID });
            post("/api/delete_round_by_id", { round_id: gameID });
            console.log("game finished");
        }    

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [roundTimer, raceStarted]);

    const getRoundInfo = async () => {
        get("/api/get_round_by_id", { roundID: gameID }).then((round) => {
            console.log("This displays the round for ID " + round.problem_set_id);
            console.log("User ID: " + props.userId);
            console.log("Players: ");
            console.log(round.players);
            if (round.players[0] === props.userId) {
                setIsHost(true);
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
        getRoundInfo();
    }, []);


    useEffect(() => {
        if (loggedIn) {
            get("/api/get_user_by_id", { userId: props.userId }).then((user) => {
                let username = user.username;
                socket.emit("joinGame", gameID, username);
            });
            // socket.emit("joinGame", gameID);

            socket.on("update", (update) => {
                let data = update[gameID]["players"];
                let newPlayers = [];
                let newScores = [];
                let newUsernames = [];
                let newPlacements = {};
                let finished = false;
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    newPlayers.push(data[i]['id']);
                    newScores.push(data[i]['score']);
                    newUsernames.push(data[i]['username']);
                    if (!emittedPlacingRef.current) {
                        if (data[i]['id'] === props.userId && data[i]['score'] >= TOTAL_QUESTIONS) {
                            socket.emit("finishGame", gameID, props.userId);
                            finished = true;
                            setGameFinished(true);
                            setEmittedPlacing(true);
                            emittedPlacingRef.current = true;
                            console.log("emitting finish game...");
                        }    
                    }
                    newPlacements[data[i]['id']] = -1;
                    // newPlacements.push(-1);
                }

                let placings_data = update[gameID]["placings"];
                console.log(placings_data);
                for (let i = 0; i < placings_data.length; i++) {
                    newPlacements[placings_data[i]] = i + 1;
                }
                let placementsList = [];
                for (let i = 0; i < newPlayers.length; i++) {
                    placementsList.push(newPlacements[newPlayers[i]]);
                }
                if (!placementsList.includes(-1)) {
                  setEveryoneFinished(true);
                }
                setPlacements(placementsList);
                console.log(newPlacements);

                setPlayers(newPlayers);
                setScores(newScores);
                setUsernames(newUsernames);
                console.log(newUsernames);
                console.log(update);
                // find time until update[gameID]["start_time"]
                let timeUntil = new Date(update[gameID]["start_time"]) - new Date();
                // check if timeUntil is positive
                if (timeUntil > 0 && update[gameID]["started"]) {
                    setPreGameTimer(Math.floor(timeUntil / 1000) + 1);
                    // console.log("updating pregame timer");
                } 
                else if (timeUntil <= 0 && update[gameID]["started"]) {
                    setPreGameTimer(0);
                    setRaceStarted(true);
                }
                else {
                    setPreGameTimer(0);
                }
                // else {
                //     setPreGameTimer(-1);
                // }
                // // if (update[gameID]["started"] and )
                // if (update[gameID]["started"]) {
                //     setRaceStarted(true);
                // }
                // processUpdate(update);
            });

            socket.on("alreadyInGame", () => {
                // setShowGame(false);
                navigate("/")
            });

            // return () => {
            //     socket.emit("leaveGame", gameID);
            // };
        }
    }, [loggedIn]);

    // const processUpdate = (update) => {
    //     drawCanvas(update, canvasRef, gameID);
    // };

    useEffect(() => {
        setLoggedIn(props.userId);
        // console.log("CHECK HERE")
        // console.log(props.userId)
    }, [props.userId]);

    // useEffect(() => {
    //     console.log(emittedPlacing)

    // }, [emittedPlacing]);

    // let loginModal = null;
    // if (!props.userId) {
    //     loginModal = <div> Pleas`e Login First! </div>;
    // }

    useEffect(() => {
        setSpqScore(((round_time - roundTimer) / score).toFixed(2));
        if (gameFinished && notUpdatedGame && score > 0) {
            console.log(score, roundTimer);
            post(`/api/update_user_pastgames`, {
                userId: props.userId,
                score: score,
                time: round_time - roundTimer,
            });
            setNotUpdatedGame(false);
        }
    }, [gameFinished]);

    const startGameButton = () => {
        socket.emit("startGame", gameID);
        setPreGameTimerStarted(true);
    }

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]) + " place";
    }

    return (
        <>
            {loggedIn ? (
                <div className="Race-container">
                    <div className="Race-headline-text">
                      <div className="u-inlineBlock">{raceStarted ? "Get to the logs asap!" : "Waiting for host..."}</div>
                      <div className="u-inlineBlock">Remaining time: {roundTimer.toFixed(0)}</div>
                    </div>
                    {showGame ? (
                      <> 
                        <>
                        <div className="Race-beaver-river">
                          {players.map((player, index) => (
                            <div className="Race-beaver-bar">
                                <div style={{ marginLeft: `${scores[index] * 58}px` }}>
                                    <img src={beaver_image} className="Race-beaver-image" />
                                    <div className="Race-username">{usernames[index]}</div>
                                </div>
                                <div className="Race-log">
                                    <img src={logs} className="Race-log-image" />
                                    <div className="Race-position-text"> 
                                      {placements[index] === -1 ? null : placements[index] === -1 ? null : getOrdinal(placements[index])}
                                    </div>
                                </div>
                            </div>
                            ))}
                          </div>
                          <>
                            { (isHost && preGameTimer === 0 && !raceStarted && !preGameTimerStarted) ? <div> <button className="Race-start-button" onClick={startGameButton}>Start game!</button> </div> : null}
                          </>
                          <>
                            { preGameTimer !== 0 ? <h3 style={{ color: 'white'}}>Pregame Timer: { preGameTimer }</h3> : null }
                          </>
                          {!gameFinished && <MultiQuestion
                              gameID={gameID}
                              userID={props.userId}
                              score={score}
                              setScore={setScore}
                              setIsHost={setIsHost}
                              raceStarted={raceStarted}
                              doneLoading={doneLoading}
                              questions={questions}
                              answers={answers}
                          />}
                          </>
                        </>
                    ) : (
                        <div> You already joined this game! Please only join on one tab. </div>
                    )}
                </div>
            ) : (
                <div className="Race-container Race-login-prompt">Please login first!</div>
            )}
        </>
    );

    // return (
    //     <div className="Race-container">
    //         race will be here
    //         {/* <Scoreboard user_ids={user_ids} scores={scores} /> */}
    //         {/* <Timer /> */}
    //         {/* <Question /> */}
    //     </div>
    // );
};

export default Race;

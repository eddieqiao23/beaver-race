import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../../client-socket.js";
import { useNavigate } from "react-router-dom";
import { get, post } from "../../utilities";

// Components used
import MultiQuestion from "../modules/MultiQuestion.js";

// Images for the river
import beaver_image from "../../public/assets/beavers/beaver_picture.png";
import logs from "../../public/assets/beavers/logs.png";

// CSS for page
import "./Race.css";

// Parameters for game
const TOTAL_QUESTIONS = 10;
const ROUND_TIME = 120;

// Page that displays all elements of a multiplayer race
const Race = (props) => {
    const [roundTimer, setRoundTimer] = useState(ROUND_TIME);
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

    const [preGameTimerOpacity, setPreGameTimerOpacity] = useState(1);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const gameID = searchParams.get("id");

    const navigate = useNavigate();

    // Timer for the round (120 sec)
    useEffect(() => {
        let intervalTimer;
        // Start when the race starts, end when it's finished
        if (raceStarted && !everyoneFinished) { 
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

            // Clear from MongoDB
            post("/api/delete_problem_set_by_id", { problem_set_id: gameID });
            post("/api/delete_round_by_id", { round_id: gameID });
        }

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [roundTimer, raceStarted, everyoneFinished]);

    // Fetch the problem set + round information
    const getRoundInfo = async () => {
        // First gets the round information
        get("/api/get_round_by_id", { roundID: gameID }).then((round) => {
            // If the first player is the current user, then they're host
            if (round.players[0] === props.userId) {
                setIsHost(true);
            }

            // Then gets the problem set info
            get("/api/get_problem_set_by_id", { problemSetID: round.problem_set_id }).then(
                (problemSet) => {
                    setQuestions(problemSet.questions);
                    setAnswers(problemSet.answers);
                    setDoneLoading(true); 
                }
            );
        });
    };

    // When page loads in, fetches all the round info
    useEffect(() => {
        getRoundInfo();
    }, []);

    // Runs when the user logs in
    useEffect(() => {
        if (loggedIn) {
            // Gets info about the user and joins the socket room
            get("/api/get_user_by_id", { userId: props.userId }).then((user) => {
                let username = user.username;
                socket.emit("joinGame", gameID, username);
            });

            // These updates contain game_state defined in game-logic.js
            socket.on("update", (update) => {
                // Data about the players, usernames, and scores
                let data = update[gameID]["players"];

                // Reads in the data from JSON format
                let newPlayers = [];
                let newScores = [];
                let newUsernames = [];
                // Format: key is player ID, value is placement (-1 if not finished)
                let newPlacements = {};
                let finished = false; // Whether the game is over for this user
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    // Extract data from JSON
                    newPlayers.push(data[i]["id"]);
                    newScores.push(data[i]["score"]);
                    newUsernames.push(data[i]["username"]);

                    if (!emittedPlacingRef.current) { // Checks if game is over
                        if (data[i]["id"] === props.userId && data[i]["score"] >= TOTAL_QUESTIONS) {
                            socket.emit("finishGame", gameID, props.userId);
                            finished = true;
                            setGameFinished(true);
                            setEmittedPlacing(true);
                            emittedPlacingRef.current = true;
                        }
                    }
                    newPlacements[data[i]["id"]] = -1;
                }

                // Do some scuffed parsing to get the placements
                let placings_data = update[gameID]["placings"];
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

                // Set states to the new data
                setPlacements(placementsList);
                setPlayers(newPlayers);
                setScores(newScores);
                setUsernames(newUsernames);

                // Time until start_time to calculate pre-game timer
                let timeUntil = new Date(update[gameID]["start_time"]) - new Date();
                // If "Start Game" clicked but game hasn't started
                // preGameTimer = 0 means don't show the timer
                if (timeUntil > 0 && update[gameID]["started"]) {
                    setPreGameTimer(Math.floor(timeUntil / 1000) + 1);
                    setPreGameTimerOpacity(Math.abs((timeUntil % 1000)-0.5)/1000)
                    // console.log("updating pregame timer");
                } 
                else if (timeUntil <= 0 && update[gameID]["started"]) {
                    setPreGameTimer(0);
                    setRaceStarted(true);
                } else {
                    setPreGameTimer(0);
                }
            });

            // If the user reloads or joins on two tabs
            socket.on("alreadyInGame", () => {
                navigate("/");
            });
        }
    }, [loggedIn]);

    // When the user logs in?
    useEffect(() => {
        setLoggedIn(props.userId);
    }, [props.userId]);

    // When the game finishes, updates past info for statistics
    useEffect(() => {
        setSpqScore(((ROUND_TIME - roundTimer) / score).toFixed(2));
        if (gameFinished && notUpdatedGame && score > 0) {
            post(`/api/update_user_pastgames`, {
                userId: props.userId,
                score: score,
                time: ROUND_TIME - roundTimer,
            });
            setNotUpdatedGame(false);
        }
    }, [gameFinished]);

    // Runs when the "Start Game" button is clicked
    const startGameButton = () => {
        socket.emit("startGame", gameID);
        setPreGameTimerStarted(true);
    };

    // Huge brain code for converting number to ordinal
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]) + " place";
    };

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
                            { preGameTimer !== 0 ? <div className="Race-pregame-timer" style={{ opacity: preGameTimerOpacity }}>{ preGameTimer }</div> : null }
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
};

export default Race;

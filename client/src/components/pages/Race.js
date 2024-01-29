import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../../client-socket.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import MultiQuestion from "../modules/MultiQuestion.js";

import beaver_image from "../../public/assets/beavers/beaver_picture.png";
import logs from "../../public/assets/beavers/logs.png";

import { get, post } from "../../utilities";
import "./Race.css";

import Leaderboard from "../modules/Leaderboard.js";
import { getRandomProblem } from "./Home"

const TOTAL_QUESTIONS = 2;
const round_time = 120;

// Page that displays all elements of a multiplayer race
const Race = (props) => {
    const navigate = useNavigate();
    const [roundTimer, setRoundTimer] = useState(round_time);
    const [loggedIn, setLoggedIn] = useState(false);
    const [score, setScore] = useState(0);
    const [showGame, setShowGame] = useState(true);
    const [players, setPlayers] = useState([]);
    const [scores, setScores] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const isHostRef = useRef(isHost);
    const [raceStarted, setRaceStarted] = useState(false);
    const raceStartedRef = useRef(raceStarted);
    const [roundFinished, setGameFinished] = useState(false);
    const [placements, setPlacements] = useState(0);
    const [emittedPlacing, setEmittedPlacing] = useState(false);
    const emittedPlacingRef = useRef(emittedPlacing);
    const [everyoneFinished, setEveryoneFinished] = useState(false);
    const everyoneFinishedRef = useRef(everyoneFinished);
    const [preGameTimer, setPreGameTimer] = useState(0);
    const [preGameTimerStarted, setPreGameTimerStarted] = useState(false);
    const preGameTimerStartedRef = useRef(preGameTimerStarted);

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    const [spqScore, setSpqScore] = useState(0);
    const [notUpdatedGame, setNotUpdatedGame] = useState(true);
    const [doneLoading, setDoneLoading] = useState(false);

    const [preGameTimerOpacity, setPreGameTimerOpacity] = useState(1);

    const [finishedJoinGame, setFinishedJoinGame] = useState(false);
    const finishedJoinGameRef = useRef(finishedJoinGame);

    const [hostMadeNewGame, setHostMadeNewGame] = useState(false);
    const hostMadeNewGameRef = useRef(hostMadeNewGame);

    const [newShortenedRoundID, setNewShortenedRoundID] = useState(null);
    const newShortenedRoundIDRef = useRef(newShortenedRoundID);

    let userId = props.userId;
    console.log(userId);
    console.log(useLocation());

    if (!userId) {
        try {
            userId = useLocation().state.userId;
        }
        catch {
            navigate("/");
        }
    }

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    // const roundID = searchParams.get("id");
    const shortenedGameID = searchParams.get("id");
    const [roundID, setGameID] = useState(null);
    const roundIDRef = useRef(roundID);

    const [game, setGame] = useState({});
    const { game_url } = useParams();


    const getRoundInfo = async () => {
        get("/api/get_round_by_id", { roundID: roundIDRef.current }).then((round) => {
            console.log("This displays the round for ID " + round.problem_set_id);
            console.log("User ID: " + userId);
            console.log("Players: ");
            console.log(round.players);
            if (round.players[0] === userId) {
                setIsHost(true);
                isHostRef.current = true;
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

    const fetchGameID = async () => {
        console.log("RUNNING NOW");
        await get(`/api/get_round_by_shortID`, { shortID: shortenedGameID }).then((res) => {
            if (res.error) {
                console.error("Error: bad round ID");
                navigate("/");
            } else {
                setGameID(res);
                roundIDRef.current = res;
            }
        });
    };
    
    useEffect(() => {
        fetchGameID().then(() => {
            if (roundIDRef.current) {
                getRoundInfo();
            }
        });

        get("/api/get_game_by_url", { url: game_url })
            .then((newGame) => {
                setGame(newGame);
                console.log(game);
                console.log(newGame);
            })
            .catch((error) => {
                console.error("Error fetching game:", error);
                const newGame = {title: "Math", url: "zetamac"};
                setGame(newGame);
            });

        console.log("Game: ");
        console.log(game);
        console.log("Round ID: " + roundIDRef.current);
    }, []);

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
            everyoneFinishedRef.current = true;
            setEveryoneFinished(true);
            setRoundTimer(0);
            post("/api/delete_problem_set_by_id", { problem_set_id: roundIDRef.current });
            post("/api/delete_round_by_id", { round_id: roundIDRef.current });
            console.log("round finished");
        }

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [roundTimer, raceStarted]);

    // The one with literally everything
    useEffect(() => {
        if (loggedIn && roundIDRef.current) {
            // If logged in, emits socket message to log in
            get("/api/get_user_by_id", { userId: userId }).then((user) => {
                let username = user.username;
                socket.emit("joinGame", roundIDRef.current, username);
                finishedJoinGameRef.current = true;
            });

            // Updates received from socket very often
            socket.on("update", (update) => {
                // Data about the players, usernames, and scores
                if (finishedJoinGameRef.current) {
                    // Used to determine if the "Play Again" button was pressed
                    let data;
                    try {
                        if (update[roundIDRef.current]["new_round"] !== null) {
                            newShortenedRoundIDRef.current = update[roundIDRef.current]["new_round"];
                            hostMadeNewGameRef.current = true;
                        }
                        data = update[roundIDRef.current]["players"];    
                    }
                    catch {
                        navigate("/");
                    }

                    // Reads in the data from JSON format
                    let newPlayers = [];
                    let newScores = [];
                    let newUsernames = [];
                    // Format: key is player ID, value is placement (-1 if not finished)
                    let newPlacements = {};
                    let finished = false; // Whether the round is over for this user

                    // Extracts information from the strange format of update
                    for (let i = 0; i < data.length; i++) {
                        // Extract data from JSON
                        newPlayers.push(data[i]["id"]);
                        newScores.push(data[i]["score"]);
                        newUsernames.push(data[i]["username"]);

                        if (!emittedPlacingRef.current) {
                            // Checks if round is over
                            if (data[i]["id"] === userId && data[i]["score"] >= TOTAL_QUESTIONS) {
                                socket.emit("finishGame", roundIDRef.current, userId);
                                finished = true;
                                setGameFinished(true);
                                setEmittedPlacing(true);
                                emittedPlacingRef.current = true;
                            }
                        }
                        newPlacements[data[i]["id"]] = -1;
                    }

                    // Do some scuffed parsing to get the placements
                    let placings_data = update[roundIDRef.current]["placings"];
                    for (let i = 0; i < placings_data.length; i++) {
                        newPlacements[placings_data[i]] = i + 1;
                    }
                    let placementsList = [];
                    for (let i = 0; i < newPlayers.length; i++) {
                        placementsList.push(newPlacements[newPlayers[i]]);
                    }
                    if (!placementsList.includes(-1)) {
                        setEveryoneFinished(true);
                        everyoneFinishedRef.current = true;
                    }

                    // Set states to the new data
                    setPlacements(placementsList);
                    setPlayers(newPlayers);
                    setScores(newScores);
                    setUsernames(newUsernames);

                    // Time until start_time to calculate pre-round timer
                    let timeUntil = new Date(update[roundIDRef.current]["start_time"]) - new Date();
                    // If "Start Game" clicked but round hasn't started
                    // preGameTimer = 0 means don't show the timer
                    if (timeUntil > 0 && update[roundIDRef.current]["started"]) {
                        setPreGameTimer(Math.floor(timeUntil / 1000) + 1);
                        setPreGameTimerOpacity(Math.abs((timeUntil % 1000) - 0.5) / 1000);
                        // console.log("updating preround timer");
                    } else if (timeUntil <= 0 && update[roundIDRef.current]["started"]) {
                        setPreGameTimer(0);
                        setRaceStarted(true);
                        raceStartedRef.current = true;
                    } else {
                        setPreGameTimer(0);
                    }
                }
            });

            socket.on("alreadyInGame", () => {
                // setShowGame(false);
                navigate("/");
            });
        }

        // Cleanup the socket things on component unmount
        return () => {
            socket.off("update");
            socket.off("alreadyInGame");
        };
    }, [loggedIn, roundIDRef.current]);

    useEffect(() => {
        setLoggedIn(userId);
    }, [userId]);

    // After the round is over, update the user's past rounds
    useEffect(() => {
        const updatePastGames = async () => {
            console.log(round_time, roundTimer, score);
            setSpqScore(((round_time - roundTimer) / TOTAL_QUESTIONS).toFixed(2));
            if (roundFinished && userId && notUpdatedGame && score > 0) {
                await post(`/api/update_user_pastrounds`, {
                    userId: userId,
                    score: TOTAL_QUESTIONS,
                    time: round_time - roundTimer,
                });
                setNotUpdatedGame(false);
            }
            if (roundFinished && !userId) {
                setNotUpdatedGame(false);
            }
        };

        updatePastGames();
    }, [roundFinished]);

    // Is run when the "Start Game" button is prepped
    const startGameButton = () => {
        if (roundIDRef.current) {
            socket.emit("startGame", roundIDRef.current);
            setPreGameTimerStarted(true);
            preGameTimerStartedRef.current = true;
        }
    };

    // Runs once the page loads in
    useEffect(() => {
        // Fetches information about the game
        fetchGameID().then(() => {
            if (roundIDRef.current) {
                getRoundInfo();
            }
        });

        const handleKeyDown = (event) => {
            // Enter for host to start game
            if (
                event.key === "Enter" &&
                isHostRef.current &&
                !raceStartedRef.current &&
                !preGameTimerStartedRef.current &&
                roundIDRef.current
            ) {
                socket.emit("startGame", roundIDRef.current);
                setPreGameTimerStarted(true);
                preGameTimerStartedRef.current = true;
            }

            // Enter for host to create new game
            if (event.key === "Enter" && isHostRef.current && everyoneFinishedRef.current) {
                makeNewRound();
            }

            // Enter for non-host to join new game
            if (
                event.key === "Enter" &&
                hostMadeNewGameRef.current &&
                !isHostRef.current &&
                everyoneFinishedRef.current
            ) {
                playAgain();
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // For 1st, 2nd, 3rd, etc.
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]) + " place";
    };

    // When non-hosts press the "Play Again" button
    const playAgain = async () => {
        navigate(`../race?id=${newShortenedRoundIDRef.current}`, { state: { userId: userId } });
        navigate(0);
    };

    // When hosts create a new game
    const makeNewRound = async () => {
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
            console.log("Problem Set: " + problemSetID);

            const newRoundRes = await post("/api/create_indiv_round", {
                problem_set_id: problemSetID,
            });
            const createdRoundID = newRoundRes._id;
            const shortenedRoundID = createdRoundID.slice(-6).toUpperCase();
            newShortenedRoundIDRef.current = shortenedRoundID;
            socket.emit("newGame", roundIDRef.current, shortenedRoundID);
            setHostMadeNewGame(true);
            hostMadeNewGameRef.current = true;

            navigate(`../race?id=${shortenedRoundID}`, { state: { userId: userId } });
            navigate(0);
        } catch (error) {
            console.log(error);
            console.log("error creating problem set or round :(");
        }
    };

    return (
        <>
            {loggedIn ? (
                <div className="Race-container">
                    <div className="Race-headline-text">
                        {roundFinished ? (
                            <div className="u-inlineBlock">Great job beaver!</div>
                        ) : (
                            <div className="u-inlineBlock">
                                {preGameTimerStarted
                                    ? "Get to the logs asap!"
                                    : `Game Code: ${shortenedGameID}`}
                            </div>
                        )}
                        <div className="u-inlineBlock">Remaining time: {roundTimer.toFixed(0)}</div>
                    </div>
                            <>
                                <div className="Race-beaver-river">
                                    {players.map((player, index) => (
                                        <div className="Race-beaver-bar">
                                            <div style={{ marginLeft: `${scores[index] * 58}px` }}>
                                                <img
                                                    src={beaver_image}
                                                    className="Race-beaver-image"
                                                />
                                                <div className="Race-username">
                                                    {usernames[index]}
                                                </div>
                                            </div>
                                            <div className="Race-log">
                                                <img src={logs} className="Race-log-image" />
                                                <div className="Race-position-text">
                                                    {placements[index] === -1
                                                        ? null
                                                        : placements[index] === -1
                                                          ? null
                                                          : getOrdinal(placements[index])}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <>
                                    {preGameTimer === 0 && !raceStarted && !preGameTimerStarted ? (
                                        <>
                                            {isHost ? (
                                                <div>
                                                    {" "}
                                                    <button
                                                        className="Race-start-button"
                                                        onClick={startGameButton}
                                                    >
                                                        Press enter to start round!
                                                    </button>{" "}
                                                </div>
                                            ) : (
                                                <div className="Race-waiting-for-host">
                                                    Waiting for host to start round...
                                                </div>
                                            )}
                                        </>
                                    ) : null}
                                </>
                                <>
                                    {preGameTimer !== 0 ? (
                                        <div
                                            className="Race-preround-timer"
                                            style={{ opacity: preGameTimerOpacity }}
                                        >
                                            {preGameTimer}
                                        </div>
                                    ) : null}
                                </>
                                {!roundFinished && (
                                    <MultiQuestion
                                        roundID={roundIDRef.current}
                                        userID={userId}
                                        score={score}
                                        setScore={setScore}
                                        setIsHost={setIsHost}
                                        raceStarted={raceStarted}
                                        doneLoading={doneLoading}
                                        questions={questions}
                                        answers={answers}
                                    />
                                )}
                                {roundFinished ? (
                                    <>
                                        <div className="Race-finished-container">
                                            <div className="Race-your-score">
                                                Score: {spqScore} spq
                                            </div>
                                            {everyoneFinished && isHost ? (
                                                <button
                                                    className="u-pointer Race-play-again-button"
                                                    onClick={makeNewRound}
                                                >
                                                    Press enter to create a new round!
                                                </button>
                                            ) : (
                                                <div></div>
                                            )}
                                            {everyoneFinished &&
                                            !isHostRef.current &&
                                            hostMadeNewGameRef.current ? (
                                                <button
                                                    className="u-pointer Race-play-again-button"
                                                    onClick={playAgain}
                                                >
                                                    Press enter to join new round!
                                                </button>
                                            ) : (
                                                <div></div>
                                            )}
                                        </div>
                                        <div className="Race-leaderboard">
                                            <Leaderboard userId={userId} />
                                        </div>
                                    </>
                                ) : (
                                    <div></div>
                                )}
                            </>
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

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
import "./Race.css";
// import { drawCanvas } from "../../canvasManager";

import Leaderboard from "../modules/Leaderboard.js";

const TOTAL_QUESTIONS = 2;
const round_time = 120

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
    const [gameFinished, setGameFinished] = useState(false);
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

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    // const gameID = searchParams.get("id");
    const shortenedGameID = searchParams.get("id");
    const [gameID, setGameID] = useState(null);
    const gameIDRef = useRef(gameID);

    const fetchGameID = async () => {
      console.log("RUNNING NOW")
      await get(`/api/get_round_by_shortID`, { shortID: shortenedGameID })
        .then(res => {
          if (res.error) {
            console.error('Error: bad game ID');
            navigate("/")
          } else {
            setGameID(res);
            gameIDRef.current = res;
          }
        });
    };

    const getRoundInfo = async () => {
        get("/api/get_round_by_id", { roundID: gameIDRef.current }).then((round) => {
            console.log("This displays the round for ID " + round.problem_set_id);
            console.log("User ID: " + props.userId);
            console.log("Players: ");
            console.log(round.players);
            if (round.players[0] === props.userId) {
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

    useEffect(() => {
      fetchGameID().then(() => {
        if (gameIDRef.current) {
          getRoundInfo()
        }
      });
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
            post("/api/delete_problem_set_by_id", { problem_set_id: gameIDRef.current });
            post("/api/delete_round_by_id", { round_id: gameIDRef.current });
            console.log("game finished");
        }    

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [roundTimer, raceStarted]);


    useEffect(() => {
      console.log("CHECKING IF LOGGED IN AND GAME ID")
      // console.log(loggedIn, gameIDRef.current)
        if (loggedIn && gameIDRef.current) {
            console.log("this is logged in");
            // Gets info about the user and joins the socket room
            get("/api/get_user_by_id", { userId: props.userId }).then((user) => {
                let username = user.username;
                socket.emit("joinGame", gameIDRef.current, username);
                // setFinishedJoinGame(true);
                finishedJoinGameRef.current = true;
                // setFinishedJoinGame(true);
                console.log("JOIN GAME WAS EMITTED");
            });
            // socket.emit("joinGame", gameIDRef.current);

            socket.on("update", (update) => {
                // Data about the players, usernames, and scores
                // console.log(update);
                // console.log(gameIDRef.current);
                if (finishedJoinGameRef.current) {
                    if (update[gameIDRef.current]["new_game"]) {
                        hostMadeNewGameRef.current = true;
                    }
                    let data = update[gameIDRef.current]["players"];

                    // Reads in the data from JSON format
                    let newPlayers = [];
                    let newScores = [];
                    let newUsernames = [];
                    // Format: key is player ID, value is placement (-1 if not finished)
                    let newPlacements = {};
                    let finished = false; // Whether the game is over for this user
                    // console.log(data);
                    for (let i = 0; i < data.length; i++) {
                        // Extract data from JSON
                        newPlayers.push(data[i]["id"]);
                        newScores.push(data[i]["score"]);
                        newUsernames.push(data[i]["username"]);

                        if (!emittedPlacingRef.current) { // Checks if game is over
                            if (data[i]["id"] === props.userId && data[i]["score"] >= TOTAL_QUESTIONS) {
                                socket.emit("finishGame", gameIDRef.current, props.userId);
                                finished = true;
                                setGameFinished(true);
                                setEmittedPlacing(true);
                                emittedPlacingRef.current = true;
                            }
                        }
                        newPlacements[data[i]["id"]] = -1;
                    }

                    // Do some scuffed parsing to get the placements
                    let placings_data = update[gameIDRef.current]["placings"];
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

                    // Time until start_time to calculate pre-game timer
                    let timeUntil = new Date(update[gameIDRef.current]["start_time"]) - new Date();
                    // If "Start Game" clicked but game hasn't started
                    // preGameTimer = 0 means don't show the timer
                    if (timeUntil > 0 && update[gameIDRef.current]["started"]) {
                        setPreGameTimer(Math.floor(timeUntil / 1000) + 1);
                        setPreGameTimerOpacity(Math.abs((timeUntil % 1000)-0.5)/1000)
                        // console.log("updating pregame timer");
                    } 
                    else if (timeUntil <= 0 && update[gameIDRef.current]["started"]) {
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
                navigate("/")
            });
        }

    }, [loggedIn, gameIDRef.current]);

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

    // After the game is over, update the user's past games
    useEffect(() => {
        const updatePastGames = async () => {
            console.log(round_time, roundTimer, score)
            setSpqScore(((round_time - roundTimer) / TOTAL_QUESTIONS).toFixed(2));
            if (gameFinished && props.userId && notUpdatedGame && score > 0) {
                await post(`/api/update_user_pastgames`, {
                    userId: props.userId,
                    score: TOTAL_QUESTIONS,
                    time: round_time - roundTimer,
                });
                setNotUpdatedGame(false);
            }
            if (gameFinished && !props.userId) {
                setNotUpdatedGame(false);
            }
        };

        updatePastGames();
    }, [gameFinished]);

    const startGameButton = () => {
      if (gameIDRef.current) {
        socket.emit("startGame", gameIDRef.current);
        setPreGameTimerStarted(true);
        preGameTimerStartedRef.current = true;
      }
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
          console.log(isHost, preGameTimer, preGameTimerStarted, raceStarted)
            if (event.key === "Enter" && isHostRef.current && !raceStartedRef.current && !preGameTimerStartedRef.current && gameIDRef.current) {
                socket.emit("startGame", gameIDRef.current);
                setPreGameTimerStarted(true);
                preGameTimerStartedRef.current = true;
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {window.removeEventListener("keydown", handleKeyDown);};
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // console.log(isHost, preGameTimer, preGameTimerStarted, raceStarted)
            if (event.key === "Enter" && isHostRef.current && everyoneFinishedRef.current) {
                makeNewRound();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        
        return () => {window.removeEventListener("keydown", handleKeyDown);};
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // console.log(isHost, preGameTimer, preGameTimerStarted, raceStarted)
            if (event.key === "Enter" && hostMadeNewGameRef.current && !isHostRef.current && everyoneFinishedRef.current) {
                playAgain();  
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        
        return () => {window.removeEventListener("keydown", handleKeyDown);};
    }, []);

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]) + " place";
    }

    const playAgain = async () => {
        // console.log("Play again stuff");
        navigate(`../race?id=${newShortenedRoundIDRef.current}`, { replace: true});
        navigate(0);
    } 

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
            // setRoundID(createdRoundID);
            console.log("Round: " + createdRoundID);
            // post("/api/initsocket", { socketid: socket.id });
            const shortenedRoundID = createdRoundID.slice(-6).toUpperCase();
            newShortenedRoundIDRef.current = shortenedRoundID;
            // navigate(`/race?id=${createdRoundID}`);
            socket.emit("newGame", gameIDRef.current);
            setHostMadeNewGame(true);
            console.log(shortenedRoundID);
            hostMadeNewGameRef.current = true;
            navigate(`../race?id=${shortenedRoundID}`, { replace: true});
            navigate(0);
            // NavigationActions.push({ id: shortenedRoundID })
            // props.navigation.push('race', {
            //     id: shortenedRoundID,
            //   }); 
            // const goToNewParam = () => {
            //   navigate(`/race/${shortenedRoundID}`);
            // };
            // goToNewParam();
        } catch (error) {
            console.log(error);
            console.log("error creating problem set or round :(");
        }
    };

    return (
        <>
            {(loggedIn) ? (
                <div className="Race-container">
                    <div className="Race-headline-text">
                      {gameFinished ? (
                        <div className="u-inlineBlock">Great job beaver!</div>
                      ) : (
                        <div className="u-inlineBlock">{preGameTimerStarted ? "Get to the logs asap!" : `Game Code: ${shortenedGameID}`}</div>
                      )}
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
                            { (isHost && preGameTimer === 0 && !raceStarted && !preGameTimerStarted) ? 
                              <div> <button className="Race-start-button" onClick={startGameButton}>Press enter to start game!</button> </div> 
                              : <div className="Race-waiting-for-host">Waiting for host to start game...</div>}
                          </>
                          <>
                            { preGameTimer !== 0 ? <div className="Race-pregame-timer" style={{ opacity: preGameTimerOpacity }}>{ preGameTimer }</div> : null }
                          </>
                          {!gameFinished && <MultiQuestion
                              gameID={gameIDRef.current}
                              userID={props.userId}
                              score={score}
                              setScore={setScore}
                              setIsHost={setIsHost}
                              raceStarted={raceStarted}
                              doneLoading={doneLoading}
                              questions={questions}
                              answers={answers}
                          />}
                          {gameFinished ? (
                            <>
                              <div className="Race-finished-container">
                                <div className="Race-your-score">
                                  Score: {spqScore} spq
                                </div>
                                {(everyoneFinished && isHost) ? (
                                  <button
                                  className="u-pointer Race-play-again-button"
                                    onClick={ makeNewRound }
                                    >
                                      Press enter to create a new game!
                                  </button>
                                ) : (<div></div>)}  
                                {(everyoneFinished && !isHostRef.current && hostMadeNewGameRef.current) ? (
                                  <button
                                  className="u-pointer Race-play-again-button"
                                    onClick={ playAgain }
                                    >
                                      Press enter to join new game!
                                  </button>
                                ) : (<div></div>)}  
                                </div>
                                <div className="Race-leaderboard">
                                  <Leaderboard userId={props.userId}/>
                                </div>
                            </>
                          ) : (<div></div>)}  
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

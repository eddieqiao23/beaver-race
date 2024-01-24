import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../../client-socket.js";
import Scoreboard from "../modules/Scoreboard.js";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";
import MultiQuestion from "../modules/MultiQuestion.js";

import beaver_image from "../../public/assets/beavers/beaver_picture.png";
import logs from "../../public/assets/beavers/logs.png";

import { get, post } from "../../utilities";
// import { drawCanvas } from "../../canvasManager";

import "./Race.css";
import { startGame } from "../../../../server/game-logic.js";

// Page that displays all elements of a multiplayer race
const Race = (props) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [score, setScore] = useState(0);
    const [showGame, setShowGame] = useState(true);
    const [players, setPlayers] = useState([]);
    const [scores, setScores] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [raceStarted, setRaceStarted] = useState(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const gameID = searchParams.get("id");

    const canvasRef = useRef(null);

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
                for (let i = 0; i < data.length; i++) {
                    newPlayers.push(data[i]['id']);
                    newScores.push(data[i]['score']);
                    newUsernames.push(data[i]['username']);
                }
                setPlayers(newPlayers);
                setScores(newScores);
                setUsernames(newUsernames);
                console.log(newUsernames);
                console.log(update);
                if (update[gameID]["started"]) {
                    setRaceStarted(true);
                }
                // processUpdate(update);
            });

            socket.on("alreadyInGame", () => {
                setShowGame(false);
            });

            return () => {
                socket.emit("leaveGame", gameID);
            };
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

    // let loginModal = null;
    // if (!props.userId) {
    //     loginModal = <div> Please Login First! </div>;
    // }

    const startGameButton = () => {
        socket.emit("startGame", gameID);
    }

    return (
        <>
            {loggedIn ? (
                <div className="Race-container">
                    <div className="Race-headline-text">
                      {raceStarted ? "get to the logs asap!" : "waiting for host to start game..."}
                    </div>
                    {showGame ? (
                      <>
                        <div className="Race-beaver-river">
                          {players.map((player, index) => (
                            <div className="Race-beaver-bar">
                                <div style={{ marginLeft: `${scores[index] * 50 + 30}px` }}>
                                    <img src={beaver_image} className="Race-beaver-image" />
                                    <div className="Race-username">{usernames[index]}</div>
                                </div>
                                <div className="Race-log">
                                    <img src={logs} className="Race-log-image" />
                                </div>
                            </div>
                            ))}
                          </div>
                          { isHost ? <div> <button className="Race-start-button" onClick={startGameButton}>start game!</button> </div> : null}
                          <MultiQuestion
                              gameID={gameID}
                              userID={props.userId}
                              score={score}
                              setScore={setScore}
                              setIsHost={setIsHost}
                              raceStarted={raceStarted}
                          />
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

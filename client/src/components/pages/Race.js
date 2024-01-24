import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../../client-socket.js";
import Scoreboard from "../modules/Scoreboard.js";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";
import MultiQuestion from "../modules/MultiQuestion.js";

import { get, post } from "../../utilities";
import { drawCanvas } from "../../canvasManager";


import "./Race.css";

// Page that displays all elements of a multiplayer race
const Race = (props) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [score, setScore] = useState(0);
  const [showGame, setShowGame] = useState(true);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameID = searchParams.get('id');

  

    const canvasRef = useRef(null);

    useEffect(() => {
      if (loggedIn) {
        socket.emit('joinGame', gameID);

        socket.on("update", (update) => {
            console.log(update);
            processUpdate(update);
        });

        socket.on("alreadyInGame", () => {
          setShowGame(false);
        });

        return () => {
          socket.emit('leaveGame', gameID);
        }
      }
    }, [loggedIn]);


    const processUpdate = (update) => {
        drawCanvas(update, canvasRef, gameID);
    }

    useEffect(() => {
      setLoggedIn(props.userId);
    }, [props.userId]);

    // let loginModal = null;
    // if (!props.userId) {
    //     loginModal = <div> Please Login First! </div>;
    // }

    return (
        <>
          { loggedIn ? 
          <div className="Race-container">
            <div className="Race-headline-text">
              let's go racing! -DJ Tim
            </div>
            { showGame ? 
              <div>
              <canvas ref={canvasRef} id={`game-canvas-${gameID}`} width="1000" height="400" />
              <MultiQuestion gameID={gameID} userID={props.userId} score={score} setScore={setScore}/>
              </div>
              : <div> You are already in a game! </div>
            }
          </div> : 
          <div className="Race-container Race-login-prompt"> 
            Please login first!
          </div>}
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

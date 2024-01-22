import React, { useEffect, useRef } from "react";
import { socket } from "../../client-socket.js";
import Scoreboard from "../modules/Scoreboard.js";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";

import { get, post } from "../../utilities";
import { drawCanvas } from "../../canvasManager";


import "./Race.css";

// Page that displays all elements of a multiplayer race
const Race = (props) => {
    const canvasRef = useRef(null);

    // useEffect(() => {
    //     get("/api/activeUsers").then((res) => {
    //         console.log(res);
    //     });
    // })

    useEffect(() => {
        socket.on("update", (update) => {
            console.log(update);
            processUpdate(update);
        });
    }, []);

    const processUpdate = (update) => {
        drawCanvas(update, canvasRef);
    }

    // display text if the player is not logged in
    let loginModal = null;
    if (!props.userId) {
        loginModal = <div> Please Login First! </div>;
    }


    // let user_ids = ["Dylan", "Eddie"];
    // let scores = [1, 2];
    return (
        <>
          <div>
            {/* important: canvas needs id to be referenced by canvasManager */}
            <canvas ref={canvasRef} id="game-canvas" width="500" height="500" />
            {loginModal}
          </div>
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

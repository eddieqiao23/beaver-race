import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../utilities.css";
import "./OtherGames.css";

import { get, post } from "../../utilities";

const OtherGames = (props) => {
    useEffect(() => {
        post("/api/create_game").then((res) => {
            console.log(res);
        });
    }, []);

    return (
        <div>
            hi
        </div>
    )
};

export default OtherGames;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../utilities.css";
import "./OtherGames.css";

import successful_beaver from "../../public/assets/beavers/successful_beaver.png";

import { get, post } from "../../utilities";

const OtherGames = (props) => {
    const [allGames, setAllGames] = useState([]);

    // let image = require(`../../public/assets/beavers/${imageName}.png`).default;
    // let image = require(`../../public/assets/beavers/successful_beaver.png`).default;

    // useEffect(() => {
    //     post("/api/create_game").then((res) => {
    //         console.log(res);
    //     });
    // }, []);

    useEffect(() => {
        get("/api/get_all_games").then((res) => {
            setAllGames(res.games);
            console.log(allGames);
        });
    }, []);

    function getImage(game) {
        try {
            console.log();
            return require(`../../public/assets/beavers/${game.url}.png`).default;
        } catch (err) {
            return require(`../../public/assets/beavers/successful_beaver.png`).default;
        }
    }
    
    return (
        <>
            <div className="grid-container">
                {allGames.map((game, index) => {
                    const image = getImage(game);
                    return image ? (
                        <Link to={`/${game.url}`}>
                            <div className="grid-item">
                                <img src={image} alt={game.title}></img>
                                <div className="tile-name">{game.title}</div>
                            </div>
                        </Link>
                    ) : null;
                })}
            </div>
        </>
    )
};

export default OtherGames;

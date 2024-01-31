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
        const konamiCodeSequence = [
            "ArrowUp",
            "ArrowUp",
            "ArrowDown",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "ArrowLeft",
            "ArrowRight",
            "b",
            "a",
            "Enter",
        ];
        let currentInput = [];

        const handleKeyDown = (event) => {
            currentInput.push(event.key);

            // Ensure the length of current input does not exceed the Konami Code length
            currentInput = currentInput.slice(-konamiCodeSequence.length);

            if (JSON.stringify(currentInput) === JSON.stringify(konamiCodeSequence)) {
                // Change CSS variable when Konami Code is entered
                if (
                    getComputedStyle(document.documentElement).getPropertyValue("--secondary") ==
                    "#a688fa"
                ) {
                    document.documentElement.style.setProperty("--secondary", "#FF8C00");
                } else {
                    document.documentElement.style.setProperty("--secondary", "#a688fa");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        get("/api/get_all_games").then((res) => {
            setAllGames(res.games);
            console.log(allGames);
        });
    }, []);

    function getImage(game) {
        try {
            console.log(game.url);
            return require(`../../public/assets/beavers/${game.url}.png`).default;
        } catch (err) {
            console.log(err);
            return require(`../../public/assets/beavers/default-game.png`).default;
        }
    }

    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = event => {
        setSearchTerm(event.target.value);
    };

    const filteredGames = allGames.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <>
            <div className="OtherGames-headline-container">
                <div className="OtherGames-headline-text">
                    Welcome to Beaver Race!
                </div>
                <div className="OtherGames-sub-text">
                    Select a game from below or create your own
                </div>
                <div>
                    <input
                        className="OtherGames-search-bar"
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="OtherGames-grid-container">
                { filteredGames ? 
                    filteredGames.map((game, index) => {
                        const image = getImage(game);
                        return (image ? (
                            <Link to={`/${game.url}`}>
                                <div className="OtherGames-grid-item">
                                    <img src={image} alt={game.title}></img>
                                    <div className="OtherGames-tile-name">{game.title}</div>
                                </div>
                            </Link>
                        ) : null)})  
                    : 
                    allGames.map((game, index) => {
                    const image = getImage(game);
                    return (image ? (
                        <Link to={`/${game.url}`}>
                            <div className="OtherGames-grid-item">
                                <img src={image} alt={game.title}></img>
                                <div className="OtherGames-tile-name">{game.title}</div>
                            </div>
                        </Link>
                    ) : null)})
                }
            </div>
        </>
    )
};

export default OtherGames;

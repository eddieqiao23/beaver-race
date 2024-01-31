import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStar } from 'react-icons/fa';


import "../../utilities.css";
import "./OtherGames.css";

import { get, post } from "../../utilities";

import beaver_background from "../../public/assets/beavers/beaver-background.png";

const OtherGames = (props) => {
    const [allGames, setAllGames] = useState([]);
    const [gamesLoaded, setGamesLoaded] = useState(false);
    const priorityUrls = ['24', 'arithmetic', 'taylor-swift-lyrics', 'mit-course-numbers', 'periodic-table-quiz'];

    document.documentElement.style.setProperty("--primary", "#212121");
    document.documentElement.style.setProperty("--secondary", "#a688fa");
    document.documentElement.style.setProperty("--primary--dim", "#303030");
    document.documentElement.style.setProperty("--secondary-dim", "#8870cb");
    document.documentElement.style.setProperty("--text", "#fff");
    document.documentElement.style.setProperty("--button--text", "#000");

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
                document.documentElement.style.setProperty("--primary", "#212121");
                document.documentElement.style.setProperty("--secondary", "#FF8C00");
                document.documentElement.style.setProperty("--button--text", "#212121");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        get("/api/get_all_games").then((res) => {
            // const sortedGames = res.games.sort((a, b) => a.title.localeCompare(b.title));
            const sortedGames = res.games.sort((a, b) => {
                const aIsPriority = priorityUrls.includes(a.url);
                const bIsPriority = priorityUrls.includes(b.url);

                if (aIsPriority && !bIsPriority) {
                    return -1;
                } else if (!aIsPriority && bIsPriority) {
                    return 1;
                } else {
                    return a.title.localeCompare(b.title);
                }
            });
            setAllGames(sortedGames);
            setGamesLoaded(true);
        });
    }, []);

    function getImage(game) {
        try {
            // console.log(game.url);
            return require(`../../public/assets/beavers/${game.url}.png`).default;
        } catch (err) {
            // console.log(err);
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

    const backgroundImageStyle = () => {
        return {
          backgroundImage: `url(${beaver_background})`,
          backgroundPosition: 'center',
        //   filter: 'blur(20px)',
          zIndex: -1,
        };
    };
    
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
                        className="OtherGames-search-bar OtherGames-input"
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleChange}
                    />
                </div>
            </div>
            {(gamesLoaded) ? (
                <div className="OtherGames-grid-container">
                    {/* <div style={backgroundImageStyle()} className="Home-background"></div> */}
                { filteredGames ? 
                    filteredGames.map((game, index) => {
                        const image = getImage(game);
                        return (image ? (
                            <Link to={`/${game.url}`} key={index}>
                                <div className="OtherGames-grid-item">
                                    {priorityUrls.includes(game.url) && <FaStar className="OtherGames-star" />} {/* Add this line */}
                                    <img src={image} alt={game.title}></img>
                                    <div className="OtherGames-tile-name">{game.title}</div>
                                </div>
                            </Link>
                        ) : null)})  
                    : 
                    allGames.map((game, index) => {
                    const image = getImage(game);
                    return (image ? (
                        <Link to={`/${game.url}`} key={index}>
                            <div className="OtherGames-grid-item">
                                {priorityUrls.includes(game.url) && <FaStar className="OtherGames-star" />} {/* Add this line */}
                                <img src={image} alt={game.title}></img>
                                <div className="OtherGames-tile-name">{game.title}</div>
                            </div>
                        </Link>
                    ) : null)})
                }
            </div>
            ) : (
                <div className="OtherGames-loading"></div>
            )}
            
        </>
    )
};

export default OtherGames;

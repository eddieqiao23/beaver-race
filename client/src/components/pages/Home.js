import React from "react";
import { Link } from "react-router-dom";

import "../../utilities.css";
import "./Home.css";

import Leaderboard from "../modules/Leaderboard.js";

const Home = (props) => {
    return (
        <body>
            <div className="Home-container">
                <div className="Home-main-rounded-div Home-sign-in">
                    <div className="u-inlineBlock Home-subheadline-text">
                        Sign in on the top right to save your progress and create custom games!
                    </div>
                    <button className="u-inlineBlock Home-sign-in-button Home-align-right Home-subheadline-text">
                        Sign In!
                    </button>
                </div>
                <div className="Home-main-rounded-div Home-multiplayer-random">
                    <div className="Home-headline-text">
                        MetaZacRacer - The MIT Mathing Competition
                    </div>
                    <div className="Home-subheadline-text">
                        Increase your mathing speed while racing against others!
                    </div>
                    <Link to="/race">
                        <button className="Home-button Home-mathing-race-button">
                            Mathing race
                        </button>
                    </Link>
                </div>
                <div className="Home-two-divs">
                    <div className="Home-main-rounded-div Home-individual">
                        <div className="Home-headline-text">Mathing Test</div>
                        <div className="Home-subheadline-text">
                            Practice your mathing skills on your own!
                        </div>
                        <Link to="/indiv">
                            <button className="Home-button Home-practice-yourself-button">
                                Practice Yourself
                            </button>
                        </Link>
                    </div>
                    <div className="Home-main-rounded-div Home-multiplayer-party">
                        <div className="Home-headline-text">Race Your Friends</div>
                        <div className="Home-subheadline-text">
                            Create your own river and race your friends!
                        </div>
                        <Link to="/indiv">
                            <button className="Home-button Home-create-party-button">
                                Create River
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="Home-main-rounded-div Home-headline-text Home-leaderboard">
                    Leaderboards
                    {/* <Leaderboard /> */}
                </div>
            </div>
        </body>
    );
};

export default Home;

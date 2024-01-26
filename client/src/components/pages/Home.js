import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../utilities.css";
import "./Home.css";

import successful_beaver from "../../public/assets/beavers/successful_beaver.png";
import unsuccessful_beaver from "../../public/assets/beavers/unsuccessful_beaver.png";

import beaver_image from "../../public/assets/beavers/beaver_picture.png";
import lonely_beaver from "../../public/assets/beavers/lonelyBeaver.png";
import three_beavers from "../../public/assets/beavers/3beavers.png";

import { get, post } from "../../utilities";
// import { socket } from "../../client-socket.js";

import Leaderboard from "../modules/Leaderboard.js";

const Home = (props) => {
    const [current_username, setCurrentUsername] = useState("");
    const [new_username, setNewUsername] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [roundID, setRoundID] = useState("");
    const [updateLeaderboard, setUpdateLeaderboard] = useState(false);

    let userId = props.userId;

    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            get(`/api/get_user_by_id`, { userId: userId }).then((user) => {
                setCurrentUsername(user.username);
            });
        }
    }, [userId]);

    const updateUsername = () => {
        post("/api/updateusername", { userId: userId, username: new_username }).then((res) => {
            if (res.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    setCurrentUsername(new_username);
                    setNewUsername("");
                }, 2000);
            } else {
                setShowFailure(true);
                setTimeout(() => {
                    setShowFailure(false);
                    setNewUsername("");
                }, 2000);
            }
        });
    };

    useEffect(() => {
        setUpdateLeaderboard(true);
        setUpdateLeaderboard(false);
    }, [current_username]);

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

    const createMultiplayerRound = async () => {
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
            setRoundID(createdRoundID);
            console.log("Round: " + createdRoundID);
            // post("/api/initsocket", { socketid: socket.id });
            navigate(`/race?id=${createdRoundID}`);
        } catch (error) {
            console.log(error);
            console.log("error creating problem set or round :(");
        }
    };

    return (
        <>
            {showSuccess && (
                <div className="Home-fade-div Home-username-text">
                    {" "}
                    <img src={successful_beaver} className="Home-fade-image" />{" "}
                    <div>Hi {new_username}!</div>
                </div>
            )}
            {showFailure && (
                <div className="Home-fade-div Home-username-text">
                    {" "}
                    <img src={unsuccessful_beaver} className="Home-fade-image" />{" "}
                    <div>{new_username} is not valid</div>
                </div>
            )}
            <div className="Home-container">
                <div className="Home-main-rounded-div Home-sign-in">
                    {userId ? (
                        <>
                            <div className="u-inlineBlock Home-subheadline-text Home-username-text">
                                Welcome to Beaver Race, {current_username}!
                            </div>
                            <input
                                className="u-inlineBlock Home-username-button Home-white-placeholder Home-align-right Home-subheadline-text"
                                placeholder="new username..."
                                type="text"
                                value={new_username}
                                onChange={(e) => setNewUsername(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault(); // prevent form submission
                                        updateUsername();
                                    }
                                }}
                            ></input>
                        </>
                    ) : (
                        <div className="u-inlineBlock Home-subheadline-text">
                            Sign in to change your username and view your stats!
                        </div>
                    )}
                </div>
                <div className="Home-main-rounded-div Home-multiplayer-random">
                    <div className="Home-headline-text">
                        Beaver Racer - The MIT Mathing Competition
                    </div>
                    <div className="Home-subheadline-text">
                        Increase your mathing speed while racing against other beavers!
                    </div>
                    {/* <Link to="/race"> */}
                    <button
                        className="u-pointer Home-button Home-mathing-race-button"
                        onClick={createMultiplayerRound}
                    >
                        Mathing Race
                    </button>
                    {/* </Link> */}
                    {/* <img src={beaver_image} className="Home-multiplayer-random-image" /> */}
                </div>
                <div className="Home-two-divs">
                    <div className="Home-main-rounded-div Home-individual">
                        <div className="Home-headline-text">Join Game</div>
                        <div className="Home-subheadline-text">Swim to a random river!</div>
                        <Link to="/indiv">
                            <button className="u-pointer Home-button Home-practice-yourself-button">
                                Join Game
                            </button>
                        </Link>
                        {/* <img src={lonely_beaver} className="Home-individual-image" /> */}
                    </div>
                    <div className="Home-main-rounded-div Home-multiplayer-party">
                        <div className="Home-headline-text">IDK</div>
                        <div className="Home-subheadline-text">IDK</div>
                        {/* <Link to={`/race/${roundID}`}> */}
                        <button
                            className="u-pointer Home-button Home-create-party-button"
                            onClick={createMultiplayerRound}
                        >
                            IDK
                        </button>
                        {/* </Link> */}
                        {/* <img src={three_beavers} className="Home-multiplayer-party-image" /> */}
                    </div>
                </div>
                <div className="Home-two-divs">
                    <div className="Home-main-rounded-div Home-individual">
                        <div className="Home-headline-text">Mathing Test</div>
                        <div className="Home-subheadline-text">
                            Practice your mathing skills on your own!
                        </div>
                        <Link to="/indiv">
                            <button className="u-pointer Home-button Home-practice-yourself-button">
                                Practice Yourself
                            </button>
                        </Link>
                        {/* <img src={lonely_beaver} className="Home-individual-image" /> */}
                    </div>
                    <div className="Home-main-rounded-div Home-multiplayer-party">
                        <div className="Home-headline-text">Race Your Friends</div>
                        <div className="Home-subheadline-text">
                            Create your own river and race your beaver friends!
                        </div>
                        {/* <Link to={`/race/${roundID}`}> */}
                        <button
                            className="u-pointer Home-button Home-create-party-button"
                            onClick={createMultiplayerRound}
                        >
                            Create River
                        </button>
                        {/* </Link> */}
                        {/* <img src={three_beavers} className="Home-multiplayer-party-image" /> */}
                    </div>
                </div>
                <div className="Home-main-rounded-div Home-headline-text Home-leaderboard">
                    <Leaderboard userId={userId} updateLeaderboard={updateLeaderboard} />
                </div>
            </div>
        </>
    );
};

export default Home;

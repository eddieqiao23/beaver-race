import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useParams } from "react-router-dom";

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

export const getRandomProblem = (game) => {
    if (game.title === "Arithmetic") {
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
    }
    else {
        let index = Math.floor(Math.random() * game.questions.length);
        return { question: game.questions[index], answer: game.answers[index] };
    }
};

const Home = (props) => {
    const [current_username, setCurrentUsername] = useState("");
    const [new_username, setNewUsername] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [signInPrompt, setSignInPrompt] = useState(false);
    const [roundCode, setGameCode] = useState("");
    const [roundID, setRoundID] = useState("");
    const [game, setGame] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    // const [updateLeaderboard, setUpdateLeaderboard] = useState(false);

    let userId = props.userId;

    const navigate = useNavigate();

    let game_url = useParams().game_url;
    useEffect(() => {
        if (game_url === undefined) {
            const newGame = {title: "Arithmetic", url: "arithmetic"};
            setGame(newGame);
            setIsLoading(false);
        }
        else {
            console.log(game_url);
            get(`/api/get_game_by_url`, { url: game_url }).then((game) => {
                setGame(game);
                console.log(game);
                setIsLoading(false);
            });
        }
    }, []);

    useEffect(() => {
        if (userId) {
            get(`/api/get_user_by_id`, { userId: userId }).then((user) => {
                setCurrentUsername(user.username);
            });
        }
    }, [userId]);

    const tryGameCode = () => {
      if (roundCode.length !== 6) {
        setGameCode("");
        return;
      }
      navigate(`/race/?id=${roundCode}`);
      setGameCode("");
    };

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

    const showSignInPrompt = () => {
        setSignInPrompt(true);
        setTimeout(() => {
            setSignInPrompt(false);
        }, 2000);
    };

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

    // useEffect(() => {
    //     setUpdateLeaderboard(true);
    //     setUpdateLeaderboard(false);
    // }, [current_username]);

    const createMultiplayerRound = async () => {
        console.log("started...");
        let questions = [];
        let answers = [];
        for (let i = 0; i < 20; i++) {
            let newQuestion = getRandomProblem(game);
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
            console.log("Game: " + game.url);
            const newRoundRes = await post("/api/create_indiv_round", {
                problem_set_id: problemSetID,
                game_url: game.url,
            });
            const createdRoundID = newRoundRes._id;
            setRoundID(createdRoundID);
            console.log("Round: " + createdRoundID);
            // post("/api/initsocket", { socketid: socket.id });
            const shortenedRoundID = createdRoundID.slice(-6).toUpperCase();
            // navigate(`/race?id=${createdRoundID}`);
            navigate(`/race/?id=${shortenedRoundID}`);
        } catch (error) {
            console.log(error);
            console.log("error creating problem set or round :(");
        }
    };

    const BackgroundImageComponent = ({ imageUrl, children }) => {
        const style = {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover', // Cover the entire space of the component
            backgroundPosition: 'center', // Center the image
            height: '100vh', // Set the height to fill the viewport
            width: '100%', // Set the width to fill its container
        };
    
        return <div style={style}>{children}</div>;
    };

    return (
      <>
        {isLoading ? null : (
          <>
            {showSuccess && (
              <div className="Home-fade-div Home-username-text">
                {" "}
                <img src={successful_beaver} className="Home-fade-image" />{" "}
                <div>Hi {new_username}!</div>
              </div>
            )}
            {signInPrompt && (
              <div className="Home-fade-div Home-username-text">
                {" "}
                <img src={successful_beaver} className="Home-fade-image" />{" "}
                <div>Sign in on the top right!</div>
              </div>
            )}
            {showFailure && (
              <div className="Home-fade-div Home-username-text">
                {" "}
                <img src={unsuccessful_beaver} className="Home-fade-image" />{" "}
                <div>{new_username} is not valid</div>
              </div>
            )}
            <BackgroundImageComponent imageUrl="../../public/assets/beavers/default-game.png">
            <div className="Home-container">
              <div className="Home-main-rounded-div Home-sign-in">
                {userId ? (
                  <>
                    <div className="u-inlineBlock Home-subheadline-text Home-username-text">
                      Welcome to Beaver Race, {current_username}!
                    </div>
                    <input
                      className="u-inlineBlock Home-username-button Home-white-placeholder Home-align-right Home-subheadline-text"
                      placeholder="Enter Username"
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
                  <div className="u-inlineBlock Home-subheadline-text" onClick={showSignInPrompt}>
                    Sign in to change your username and view your stats!
                  </div>
                )}
              </div>
              <div className="Home-main-rounded-div Home-multiplayer-random">
                <div className="Home-headline-text">
                  Beaver Racer - The {game.title} Competition
                </div>
                <div className="Home-subheadline-text">
                  Increase your {game.title} speed while racing against other beavers!
                </div>
                {/* <Link to="/race"> */}

                {userId ? (
                    <button
                    className="u-pointer Home-button Home-mathing-race-button"
                    onClick={createMultiplayerRound}
                    >
                    Create Party
                    </button>
                ) : (
                  <button className="u-pointer Home-party-sign-in" onClick={showSignInPrompt}>
                    Sign in to create a party!
                  </button>
                )}

                {/* </Link> */}
                {/* <img src={beaver_image} className="Home-multiplayer-random-image" /> */}
              </div>
              <div className="Home-two-divs">
                <div className="Home-main-rounded-div Home-individual">
                  <div className="Home-headline-text">{game.title} Test</div>
                  <div className="Home-subheadline-text">
                    {" "}
                    Practice your skills on your own!{" "}
                  </div>
                  <Link to={`/${game.url}/indiv`}>
                    <button className="u-pointer Home-button Home-practice-yourself-button">
                      Individual Practice
                    </button>
                  </Link>
                  {/* <img src={lonely_beaver} className="Home-individual-image" /> */}
                </div>
                <div className="Home-main-rounded-div Home-multiplayer-party">
                  <div className="Home-headline-text">Race Your Friends</div>
                  <div className="Home-subheadline-text">
                    Join a river to race your beaver friends!
                  </div>
                  {/* <Link to={`/race/${roundID}`}> */}
                  {userId ? (
                    <>
                      <button
                            className="u-pointer Home-button Home-create-party-button"
                            onClick={tryGameCode}
                        >
                            Join Party
                        </button>
                      <input
                        className="u-inlineBlock Home-round-code Home-white-placeholder"
                        placeholder="Enter Code"
                        type="text"
                        value={roundCode}
                        onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // prevent form submission
                            tryGameCode();
                          }
                        }}
                      ></input>
                    </>
                  ) : (
                    <button className="u-pointer Home-party-sign-in" onClick={showSignInPrompt}>
                      Sign in to join a party!
                    </button>
                  )}
                  {/* </Link> */}
                  {/* <img src={three_beavers} className="Home-multiplayer-party-image" /> */}
                </div>
              </div>
              <div className="Home-main-rounded-div Home-headline-text Home-leaderboard">
                { game.title && <Leaderboard userId={userId} current_username={current_username} gameTitle={game.title} /> }
              </div>
            </div>
            </BackgroundImageComponent>
          </>
        )}
      </>
    );
};

export default Home;

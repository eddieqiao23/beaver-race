import React from "react";
import { Link } from "react-router-dom";

import "../../utilities.css";
import "./Home.css";

import successful_beaver from "../../public/assets/beaver images/successful_beaver.png";
import unsuccessful_beaver from "../../public/assets/beaver images/unsuccessful_beaver.png";

import { get, post } from "../../utilities";

import Leaderboard from "../modules/Leaderboard.js";

const Home = (props) => {
    const [username, setUsername] = React.useState("");
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showFailure, setShowFailure] = React.useState(false);

    let userId = props.userId;

    const updateUsername = () => {
      post("/api/updateusername", { userId: userId, username: username }).then((res) => {
        if (res.success) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false); 
            setUsername("");
          }, 2000);
        } else {
          setShowFailure(true);
          setTimeout(() => setShowFailure(false), 2000);
        }
      });
    };
 
    return (
        <body>
          {showSuccess && <div className="Home-fade-div"> <img src={successful_beaver} className="Home-fade-image" /> <div>Hi {username}!</div></div>}
          {showFailure && <div className="Home-fade-div"> <img src={unsuccessful_beaver} className="Home-fade-image" /> <div>{username} is not valid</div></div>}
            <div className="Home-container">
                <div className="Home-main-rounded-div Home-sign-in">
                  {userId ? ( 
                    <>  
                      <div className="u-inlineBlock Home-subheadline-text">
                        add user stats here later
                      </div> 
                      <input 
                        className="u-inlineBlock Home-username-button Home-white-placeholder Home-align-right Home-subheadline-text"
                        placeholder="new username..."
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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

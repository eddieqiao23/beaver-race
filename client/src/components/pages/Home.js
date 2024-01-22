import React from "react";
import { Link } from "react-router-dom";

import "../../utilities.css";
import "./Home.css";

import successful_beaver from "../../public/assets/beavers/successful_beaver.png";
import unsuccessful_beaver from "../../public/assets/beavers/unsuccessful_beaver.png";

import beaver_image from "../../public/assets/beavers/beaver_picture.png";
import lonely_beaver from "../../public/assets/beavers/lonelyBeaver.png";
import three_beavers from "../../public/assets/beavers/3beavers.png";


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
                        Beaver Racer - The MIT Mathing Competition
                    </div>
                    <div className="Home-subheadline-text">
                        Increase your mathing speed while racing against other beavers!
                    </div>
                    <Link to="/race">
                        <button className="u-pointer Home-button Home-mathing-race-button">
                            Mathing Race
                        </button>
                    </Link>
                    <img src={beaver_image} className="Home-multiplayer-random-image" />
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
                        <img src={lonely_beaver} className="Home-individual-image" />
                    </div>
                    <div className="Home-main-rounded-div Home-multiplayer-party">
                        <div className="Home-headline-text">Race Your Friends</div>
                        <div className="Home-subheadline-text">
                            Create your own river and race your beaver friends!
                        </div>
                        <Link to="/indiv">
                            <button className="u-pointer Home-button Home-create-party-button">
                                Create River
                            </button>
                        </Link>
                        <img src={three_beavers} className="Home-multiplayer-party-image" />
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

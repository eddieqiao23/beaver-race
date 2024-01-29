import React from "react";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";

import BeaverRaceLogo from "../../public/assets/beavers/BeaverIcon.png";

import "./NavBar.css";

// This identifies your web application to Google's authentication service
const GOOGLE_CLIENT_ID = "956478673522-odt9nc158u9obsuqpeb16s3uiabon4lf.apps.googleusercontent.com";

/**
 * The navigation bar at the top of all pages. Takes no props.
 */
const NavBar = ({ userId, handleLogin, handleLogout }) => {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <nav className="NavBar-container">
                <Link to="/">
                    {/* <div className="u-inlineBlock NavBar-align-top">
                        <img src={BeaverRaceLogo} alt="" className="NavBar-image" />
                    </div> */}
                    <div className="u-inlineBlock NavBar-align-top NavBar-title-beaver">Beaver</div>
                    <div className="u-inlineBlock NavBar-align-top NavBar-title-race">Race</div>
                </Link>

                <Link to="/other_rounds">
                    <button className="NavBar-button">Play More Games!</button>
                </Link>

                <a
                    href="https://forms.gle/hhnryvakyackzM467"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <button className="NavBar-button">report bug</button>
                </a>

                <div className="u-inlineBlock NavBar-auth-button">
                    {userId ? (
                        <button
                            className="u-pointer NavBar-sign-in-button"
                            onClick={() => {
                                googleLogout();
                                handleLogout();
                            }}
                        >
                            Logout
                        </button>
                    ) : (
                        <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
                    )}
                </div>
            </nav>
        </GoogleOAuthProvider>
    );
};

export default NavBar;

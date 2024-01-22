import React from "react";
import { Link } from "react-router-dom";

import CryingBeaver from "../../public/assets/beavers/crying beaver.png";

import "./Footer.css";

const NavBar = (props) => {
    return (
        <footer className="Footer-container">
            <div className="Footer-content">
                <p>No Copyright &copy; 2024 BeaverGamesCompany. No rights reserved.</p>
                <p>fuck this shit why is it so hard</p>
                {/* <p>Contact us at: <a href="mailto:contact@example.com">contact@example.com</a></p> */}

                <img src={CryingBeaver} alt="" className="Footer-image" />
            </div>
        </footer>
    );
};

export default NavBar;

import React, { useEffect, useState } from "react";
import "../../utilities.css";
import "./Leaderboard.css";

import { get, post } from "../../utilities";

const Leaderboard = (props) => {
    let userId = props.userId;
    const [topUsers, setTopUsers] = useState([]);
    const [userAvgScore, setUserAvgScore] = useState(0);
    const [userHighScore, setUserHighScore] = useState(0);

    useEffect(() => {
      if (userId) {
        get(`/api/get_user_by_id`, { userId: userId }).then((user) => {
            const averageScore = (user.pastGames.length === 0) ? 0 : user.pastGames.reduce((a, b) => a + b, 0) / user.pastGames.length;
            const highScore = (user.pastGames.length === 0) ? 0 : Math.max(...user.pastGames);
            setUserAvgScore(averageScore);
            setUserHighScore(highScore);
        });
      }
    }, [userId]);

    useEffect(() => {
        get("/api/get_top_users").then((res) => {
            setTopUsers(res.users);
        });
    }, []);

    return (
        <div className="Leaderboard-container">
            <div className="u-inlineBlock Leaderboard-title">
                Leaderboard
            </div>

            {userId ? (
                <div className="Leaderboard-your-stats">
                    Your Stats: Avg {userAvgScore.toFixed(2)} q/s | Best {userHighScore.toFixed(2)} q/s 
                </div>
            ) : (   
                <div className="Leaderboard-your-stats">
                    Log in to see your stats!
                </div>
            )}

           {topUsers.map((user, index) => (
                <div className={` ${user._id === userId ? "Leaderboard-highlight" : "Leaderboard-player"}`} key={index}>
                    <div className="u-inlineBlock">
                        {index + 1}. {user.username}
                    </div>
                    <div className="u-inlineBlock">
                        Avg {(user.pastGames.length === 0) ? 0 : user.averageScore.toFixed(2)} q/s | Best {(user.pastGames.length === 0) ? 0 : Math.max(...user.pastGames).toFixed(2)} q/s 
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Leaderboard;

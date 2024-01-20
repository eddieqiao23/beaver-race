import React from "react";
import "./Leaderboard.css";

const Leaderboard = (props) => {
    const { user_ids, scores } = props;

    return (
        <div className="Leaderboard-container">
            <p>Leaderboard</p>
            {user_ids.map((userId, index) => (
                <div key={userId} className="Leaderboard-item">
                    <span>User ID: {userId}</span>
                    <span>Score: {scores[index]}</span>
                </div>
            ))}
        </div>
    )
}

export default Leaderboard;
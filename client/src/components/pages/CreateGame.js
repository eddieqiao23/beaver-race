import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../utilities.css";
import "./CreateGame.css";

import successful_beaver from "../../public/assets/beavers/successful_beaver.png";

import { get, post } from "../../utilities";

function CreateGame() {
    const [title, setTitle] = useState('');
    const [skipTime, setSkipTime] = useState('');
    const [questionsPerRound, setQuestionsPerRound] = useState('');
    const [qna, setQna] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Form Submitted!');
        console.log('Title:', title);
        const url = title.replace(/\s/g, '-').toLowerCase();
        console.log('Skip Time:', skipTime);
        console.log('Questions Per Round:', questionsPerRound);
        console.log('Questions and Answers:', qna);
        const all_info = qna.split('\n').map(q => q.split('\t'));
        const questions = all_info.map(q => q[0]);
        const answers = all_info.map(q => q[1]);
        console.log('Questions:', questions);
        console.log('Answers:', answers);
        post("/api/create_game", {
            title: title,
            url: url,
            skipTime: skipTime,
            questionsPerRound: questionsPerRound,
            questions: questions,
            answers: answers
        }).then((res) => {
            const new_url = `/${url}`;
            navigate(new_url);
        });
        // Add here any further processing like sending data to a server
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <label>
                    Title:
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
                </label><br /><br />

                <label>
                    Skip Time (in seconds):
                    <input type="number" value={skipTime} onChange={e => setSkipTime(e.target.value)} />
                </label><br /><br />

                <label>
                    Questions Per Round:
                    <input type="number" value={questionsPerRound} onChange={e => setQuestionsPerRound(e.target.value)} />
                </label><br /><br />

                <label>
                    Questions and Answers:
                    <textarea value={qna} onChange={e => setQna(e.target.value)}></textarea>
                </label><br /><br />

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default CreateGame;
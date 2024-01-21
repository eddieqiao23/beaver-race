import React, { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import "./Question.css";

// Page that displays all elements of a multiplayer race 
const Question = (props) => {
    const [currProblem, setCurrProblem] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [doneLoading, setDoneLoading] = useState(false);

    const getRoundInfo = async () => {
        console.log("Check 1: " + props.roundID);
        get("/api/get_round_by_id", { roundID: props.roundID }).then((round) => {
            console.log("This displays the round for ID " + round.problem_set_id);
            get("/api/get_problem_set_by_id", { problemSetID: round.problem_set_id }).then((problemSet) => {
                console.log("This displays the problem set for ID " + problemSet._id);
                setQuestions(problemSet.questions);
                setAnswers(problemSet.answers);
                setDoneLoading(true);
                console.log(questions);
            });
        });
    }
    
    useEffect(() => {
        getRoundInfo();
    }, []);

    const handleInputChange = (event) => {
        if (event.target.value === answers[currProblem]) {
            setTimeout(() => {
                setCurrProblem(currProblem + 1);
                event.target.value = "";    
            }, 50);
        }
    }

    return (
        <div>
            { !doneLoading ? 
            <div> </div> : 
            <div> 
                <div className="Question-container">
                    <div className="Question-score">
                        <p>
                            Score: { currProblem }
                        </p>
                    </div>
                    <div className="Question-problem">
                        { questions[currProblem] }
                    </div>
                    <div className="Question-answer-box">
                        <input type="text" placeholder="" onChange={handleInputChange} style={{fontSize: '24pt'}}/>
                    </div>
                </div>
            </div>}
        </div>
    )

    // return ({ !doneLoading ? <div> Loading... </div> : 
    //         <div className="Question-container">
    //             <div className="Question-score">
    //                 <p>
    //                     Score: { currProblem }
    //                 </p>
    //             </div>
    //             <div className="Question-problem">
    //                 { questions[currProblem] }
    //             </div>
    //             <div className="Question-answer-box">
    //                 <input type="text" placeholder="" onChange={handleInputChange} style={{fontSize: '24pt'}}/>
    //             </div>
    //         </div> }
    // )
}

export default Question;
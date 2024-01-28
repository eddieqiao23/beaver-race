const NUM_QUESTIONS = 10;
const TRACK_LENGTH = 500;

// const gameState = {
//     players: [],
//     winner: null,
// };

const gameState = {};

const spawnPlayer = (id, username, gameID) => {
    // check if gameID is in gameState
    if (!(gameID in gameState)) {
        gameState[gameID] = {
            players: [],
            placings: [],
            winner: null,
            started: false,
            start_time: null, // maybe??
            new_game: null,
        };
    }
    console.log(gameState);
    if (!(id in gameState[gameID]["players"])) {
        gameState[gameID]["players"].push({ id: id, username: username, score: 0 });
        console.log("spawned!");
    }
};

const startGame = (gameID) => {
    gameState[gameID]["started"] = true;
    const now = new Date();
    gameState[gameID]["start_time"] = new Date(now.getTime() + 3 * 1000);
};

const removePlayer = (id, gameID) => {
    const index = gameState[gameID]["players"].indexOf(id);
    gameState[gameID]["players"].splice(index, 1);
    gameState[gameID]["players"].splice(index, 1);
};

const movePlayer = (id, gameID) => {
    console.log(gameState);
    console.log("moving...");
    console.log(gameID);
    console.log(gameState[gameID]);
    for (let i = 0; i < gameState[gameID]["players"].length; i++) {
        if (gameState[gameID]["players"][i].id === id) {
            gameState[gameID]["players"][i].score += 1;
        }
    }
};

const doesPlayerExist = (userID) => {
    return gameState.players.some((player) => player.userId === userId);
};

const finishGame = (gameID, userID) => {
    console.log("hi i am here");
    gameState[gameID]["placings"].push(userID);
};

const updateGameState = () => {};

const newGame = (gameID, shortenedRoundID) => {
    gameState[gameID]["new_game"] = shortenedRoundID;
}

module.exports = {
    gameState,
    spawnPlayer,
    removePlayer,
    movePlayer,
    updateGameState,
    doesPlayerExist,
    startGame,
    finishGame,
    newGame,
};

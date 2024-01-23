const NUM_QUESTIONS = 10;
const TRACK_LENGTH = 500;

// const gameState = {
//     players: [],
//     winner: null,
// };

const gameState = {};

const spawnPlayer = (id, gameID) => {
    // check if gameID is in gameState 
    if (!(gameID in gameState)) {
        gameState[gameID] = {
            "players": [],
            "winner": null,
        };
    }
    console.log(gameState);
    if (!(id in gameState[gameID]["players"])) {
        gameState[gameID]["players"].push({id: id, score: 0});
        console.log("spawned!");    
    }
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
    return gameState.players.some(player => player.userId === userId);
}

const updateGameState = () => {

};

module.exports = {
    gameState,
    spawnPlayer,
    removePlayer,
    movePlayer,
    updateGameState,
    doesPlayerExist,
}
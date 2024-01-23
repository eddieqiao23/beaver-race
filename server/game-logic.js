const NUM_QUESTIONS = 10;
const TRACK_LENGTH = 500;

const gameState = {
    players: [],
    winner: null,
};

const spawnPlayer = (id) => {
    gameState.players.push({id: id, score: 0});
    // gameState.players.push(id);
    // gameState.scores.push(0);
    console.log("spawned!")
};

const removePlayer = (id) => {
    const index = gameState.players.indexOf(id);
    gameState.players.splice(index, 1);
    gameState.scores.splice(index, 1);
};

const movePlayer = (id) => {
    console.log("moving...");
    for (let i = 0; i < gameState.players.length; i++) {
        if (gameState.players[i].id === id) {
            gameState.players[i].score += 1;
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
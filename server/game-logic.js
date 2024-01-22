const NUM_QUESTIONS = 10;
const TRACK_LENGTH = 500;

const gameState = {
    players: [],
    winner: null,
};

const spawnPlayer = (id) => {
    gameState.players.push({id: id, position: 0});
    // gameState.players.push(id);
    // gameState.scores.push(0);
    console.log("spawned!")
};

const removePlayer = (id) => {
    const index = gameState.players.indexOf(id);
    gameState.players.splice(index, 1);
    gameState.scores.splice(index, 1);
};

const updateScore = (id) => {
    const index = gameState.players.indexOf(id);
    gameState.scores[index] += 1;
};

const updateGameState = () => {

};

module.exports = {
    gameState,
    spawnPlayer,
    removePlayer,
    updateScore,
    updateGameState,
}
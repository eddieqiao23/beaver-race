const gameLogic = require("./game-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const socketToGameMap = {};
const userToGameMap = {};

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];
const getGameFromSocketID = (socketid) => socketToGameMap[socketid];
const getGameFromUserID = (userid) => userToGameMap[userid];


const sendGameState = (gameID) => {
    console.log("updates emitted to " + gameID);
    console.log(gameLogic.gameState);
    io.to(gameID).emit("update", gameLogic.gameState);
}

const startRunningGame = (gameID) => {
    let intervalId = setInterval(() => {
        gameLogic.updateGameState();
        sendGameState(gameID);
    }, 1000); // 1 fps right now

    setTimeout(() => {
        clearInterval(intervalId);
    }, 60000);
}

// startRunningGame();

const addUser = (user, socket) => {
    const oldSocket = userToSocketMap[user._id];
    // gameLogic.spawnPlayer(user._id);
    // console.log("spawned player");
    if (oldSocket && oldSocket.id !== socket.id) {
        // there was an old tab open for this user, force it to disconnect
        // FIXME: is this the behavior you want?
        oldSocket.disconnect();
        delete socketToUserMap[oldSocket.id];
    }

    // let exists = false;
    // for (let i = 0; i < gameLogic.gameState.players.length; i++) {
    //     if (gameLogic.gameState.players[i].id === user._id) {
    //         exists = true;
    //         break;
    //     }
    // }
    // let gameID = getGameFromSocketID(socket.id);
    // if (!exists) {
    //     console.log("spawning...")
    //     gameLogic.spawnPlayer(user._id, gameID);
    // }

    console.log("ADDING!! " + user._id + " and " + socket.id);
    userToSocketMap[user._id] = socket;
    socketToUserMap[socket.id] = user;
    // userToGameMap[user._id] = getGameFromSocketID(socket.id);
};

const removeUser = (user, socket) => {
    console.log("DELETING!! " + user._id);
    if (user) delete userToSocketMap[user._id];
    delete socketToUserMap[socket.id];
};

module.exports = {
    init: (http) => {
        io = require("socket.io")(http);

        io.on("connection", (socket) => {
            console.log(`socket has connected ${socket.id}`);
            let gameID = null;
            console.log("this is the game ID: " + gameID);
            socket.on('joinGame', (newGameID) => {
                console.log("new game: " + newGameID);
                console.log("socket: " + socket.id);
                console.log("game to socket mapping");
                console.log(socketToGameMap);
                // can access user immediately
                let currGame = null;
                try {
                    currGame = getGameFromUserID(getUserFromSocketID(socket.id)._id);
                }
                catch (error) {
                    console.log("lol didn't work");
                }

                if (currGame !== newGameID) {
                    const userID = getUserFromSocketID(socket.id)._id;

                    gameID = newGameID;
                    socket.join(newGameID);
                    socketToGameMap[socket.id] = newGameID;
                    userToGameMap[userID] = newGameID;

                    console.log("S to U MAP!"); 
                    console.log(socketToUserMap);
                    console.log("Socket ID: " + socket.id);
    
                    gameLogic.spawnPlayer(userID, newGameID);
                    startRunningGame(newGameID);    
                }
                else {
                    // gameLogic.gameInProgress();
                    console.log("rip already in game");
                    socket.emit("alreadyInGame");
                    // 
                }
            });
            socket.on('leaveGame', (gameID) => {
                socket.leave(gameID);
                // delete socketToGameMap[socket.id];
                // removeUser(getUserFromSocketID(socket.id), socket, gameID);
            });
            socket.on("disconnect", (reason) => {
                // const user = getUserFromSocketID(socket.id);
                // removeUser(user, socket, gameID);
            });
            socket.on("move", () => {
                const user = getUserFromSocketID(socket.id);
                if (user) gameLogic.movePlayer(user._id, gameID);
            });
        });
    },

    addUser: addUser,
    removeUser: removeUser,

    getSocketFromUserID: getSocketFromUserID,
    getUserFromSocketID: getUserFromSocketID,
    getSocketFromSocketID: getSocketFromSocketID,
    getAllConnectedUsers: getAllConnectedUsers,
    getIo: () => io,
};

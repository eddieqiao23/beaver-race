const gameLogic = require("./game-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const socketToGameMap = {};

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const sendGameState = (gameID) => {
    console.log("updates emitted to " + gameID);
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

    let exists = false;
    for (let i = 0; i < gameLogic.gameState.players.length; i++) {
        if (gameLogic.gameState.players[i].id === user._id) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        console.log("spawning...")
        gameLogic.spawnPlayer(user._id);
    }

    userToSocketMap[user._id] = socket;
    socketToUserMap[socket.id] = user;
};

const removeUser = (user, socket) => {
    if (user) delete userToSocketMap[user._id];
    delete socketToUserMap[socket.id];
};

module.exports = {
    init: (http) => {
        io = require("socket.io")(http);

        io.on("connection", (socket) => {
            console.log(`socket has connected ${socket.id}`);
            socket.on('joinGame', (gameID) => {
                socket.join(gameID);
                socketToGameMap[socket.id] = gameID;
                console.log("joined successfully");
                startRunningGame(gameID);
            });
            socket.on('leaveGame', (gameID) => {
                socket.leave(gameID);
                delete socketToGameMap[socket.id];
                removeUser(getUserFromSocketID(socket.id), socket);
            });
            socket.on("disconnect", (reason) => {
                const user = getUserFromSocketID(socket.id);
                removeUser(user, socket);
            });
            socket.on("move", () => {
                const user = getUserFromSocketID(socket.id);
                if (user) gameLogic.movePlayer(user._id);
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

let canvas;

const fillRectangle = (context, x, y, width, height) => {
    context.fillStyle = "black";
    context.fillRect(x, y, width, height);
};

const drawPlayer = (context, number, score) => {
    fillRectangle(context, 20, score / 30 * 100, 100, 100);
    // context.fillStyle = "black";
    // context.fillText(number, 50, 50);
    // context.fillText(score, 50, 80);
};

export const drawCanvas = (drawState, canvasRef) => {
    canvas = document.getElementById("game-canvas");
    console.log("hi");
    if (!canvas) return;
    console.log("hii");
    const context = canvas.getContext("2d");
    console.log(drawState);
    // fillRectangle(context, 0, 0, 500, 500);
    Object.values(drawState.players).forEach((p) => {
        fillRectangle(context, p.position / 30 * 100 + 20, 10 + drawState.players.indexOf(p) * 80, 100, 40);
    });
};
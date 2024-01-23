let canvas;
const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
const highlightColor = getComputedStyle(document.documentElement).getPropertyValue('--orange');

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 400;
const TOTAL_QUESTIONS = 20;

import beaver_image from "./public/assets/beavers/beaver_picture.png";

const img = new Image();
img.src = beaver_image;

const fillRectangle = (context, x, y, width, height, color) => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
};

export const drawCanvas = (drawState, canvasRef, gameID) => {
    canvas = document.getElementById(`game-canvas-${gameID}`);
    console.log("accessing canvas " + gameID);
    if (!canvas) return;
    console.log("hii");
    const context = canvas.getContext("2d");
    console.log(drawState);

    fillRectangle(context, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, primaryColor);
    fillRectangle(context, CANVAS_WIDTH * 0.9, 0, 45, CANVAS_WIDTH, highlightColor);
    Object.values(drawState.players).forEach((p) => {
        // fillRectangle(context, p.score / 20 * 580 + 120, 120 + drawState.players.indexOf(p) * 80, 100, 40, "black");
        if (img.complete) {
            context.drawImage(img, p.score / TOTAL_QUESTIONS * CANVAS_WIDTH * 0.85 + CANVAS_WIDTH * 0.05, CANVAS_HEIGHT * 0.1 + drawState.players.indexOf(p) * CANVAS_HEIGHT * 0.2, 60, 40);
        }
    });
};
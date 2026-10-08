const mainMenu = document.getElementById("main-menu");
const gameElement = document.getElementById("game");
const pauseMenu = document.getElementById("pause-menu");
const gameOverMenu = document.getElementById("game-over-menu");
const pauseGameButton = document.getElementById("pause-game-button");

const startButton = document.getElementById("start-button");
const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");
const mainMenuButton = document.getElementById("main-menu-button");
const retryButton = document.getElementById("retry-button");
const gameOverMainMenuButton = document.getElementById("game-over-main-menu-button");

function updateGameUI(gameState) {
    mainMenu.style.display = "none";
    gameElement.style.display = "none";
    pauseMenu.style.display = "none";
    gameOverMenu.style.display = "none";
    pauseGameButton.style.display = gameState === "PLAYING" ? "flex" : "none";
    console.log("Updating UI for game state:", gameState);

    if (gameState === "READY") {
        mainMenu.style.display = "flex";
    }

    if (gameState === "PLAYING") {
        gameElement.style.display = "flex";
    }

    if (gameState === "PAUSED") {
        gameElement.style.display = "flex";
        pauseMenu.style.display = "flex";
    }

    if (gameState === "GAME OVER") {
        gameElement.style.display = "flex";
        gameOverMenu.style.display = "flex";
    }
}

function setupUIEvents({
    onStart,
    onPause,
    onResume,
    onRestart,
    onMainMenu,
    onRetry,
    onGameOverMainMenu
}) {
    startButton.addEventListener("click", onStart);
    pauseGameButton.addEventListener("click", onPause);
    resumeButton.addEventListener("click", onResume);
    restartButton.addEventListener("click", onRestart);
    mainMenuButton.addEventListener("click", onMainMenu);
    retryButton.addEventListener("click", onRetry);
    gameOverMainMenuButton.addEventListener("click", onGameOverMainMenu);
}
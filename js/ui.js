const mainMenu = document.getElementById("main-menu");
const gameElement = document.getElementById("game");
const pauseMenu = document.getElementById("pause-menu");
const gameOverMenu = document.getElementById("game-over-menu");
const levelCompleteMenu = document.getElementById("level-complete-menu");
const levelSelectMenu = document.getElementById("level-select-menu");

const pauseGameButton = document.getElementById("pause-game-button");
const nextLevelButton = document.getElementById("next-level-button");
const startButton = document.getElementById("start-button");
const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");
const mainMenuButton = document.getElementById("main-menu-button");
const retryButton = document.getElementById("retry-button");
const gameOverMainMenuButton = document.getElementById("game-over-main-menu-button");
const levelCompleteMainMenuButton = document.getElementById("level-complete-main-menu-button");
const pauseMenuLevelSelectButton = document.getElementById("pause-menu-level-select-button");
const levelSelectButton = document.getElementById("level-select-button");
const levelSelectMainMenuButton = document.getElementById("level-select-main-menu-button");
const playSelectedLevelButton = document.getElementById("play-selected-level-button");
const levelButtonsContainer = document.getElementById("level-buttons-container");

function renderLevelButtons({ levels, selectedLevel, unlockedLevels, onSelectLevel }) {
    levelButtonsContainer.innerHTML = "";

    levels.forEach((level) => {
        const isUnlocked = unlockedLevels.includes(level);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "level-button";
        button.textContent = isUnlocked ? `Level ${level}` : `🔒 ${level}`;
        button.setAttribute(
            "aria-label",
            isUnlocked ? `Level ${level}` : `Level ${level}, locked`
        );
        button.disabled = !isUnlocked;

        if (level === selectedLevel) {
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        } else {
            button.setAttribute("aria-pressed", "false");
        }

        button.addEventListener("click", () => onSelectLevel(level));
        levelButtonsContainer.appendChild(button);
    });
}

function updateGameUI(gameState) {
    mainMenu.style.display = "none";
    gameElement.style.display = "none";
    pauseMenu.style.display = "none";
    gameOverMenu.style.display = "none";
    levelCompleteMenu.style.display = "none";
    levelSelectMenu.style.display = "none";
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

    if (gameState === "GAME_OVER") {
        gameElement.style.display = "flex";
        gameOverMenu.style.display = "flex";
    }

    if (gameState === "LEVEL_COMPLETE") {
        gameElement.style.display = "flex";
        levelCompleteMenu.style.display = "flex";
    }

    if (gameState === "LEVEL_SELECT") {
        levelSelectMenu.style.display = "flex";
    }
}

function setupUIEvents({
    onStart,
    onPause,
    onResume,
    onRestart,
    onMainMenu,
    onRetry,
    onGameOverMainMenu,
    onNextLevel,
    onLevelSelect,
    onPlaySelectedLevel
}) {
    startButton.addEventListener("click", onStart);
    pauseGameButton.addEventListener("click", onPause);
    resumeButton.addEventListener("click", onResume);
    restartButton.addEventListener("click", onRestart);
    mainMenuButton.addEventListener("click", onMainMenu);
    retryButton.addEventListener("click", onRetry);
    gameOverMainMenuButton.addEventListener("click", onGameOverMainMenu);
    nextLevelButton.addEventListener("click", onNextLevel);
    levelCompleteMainMenuButton.addEventListener("click", onMainMenu);
    levelSelectButton.addEventListener("click", onLevelSelect);
    levelSelectMainMenuButton.addEventListener("click", onMainMenu);
    pauseMenuLevelSelectButton.addEventListener("click", onLevelSelect);
    playSelectedLevelButton.addEventListener("click", onPlaySelectedLevel);
}
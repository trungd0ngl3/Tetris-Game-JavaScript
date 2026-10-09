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
const selectedLevelName = document.getElementById("selected-level-name");
const selectedLevelObjectives = document.getElementById("selected-level-objectives");
const objectiveProgressList = document.getElementById("objective-progress-list");

const OBJECTIVE_LABELS = {
    lines: "Lines",
    targets: "Targets",
    obstacles: "Obstacles",
    elements: "Elements",
    garbage: "Garbage",
    blindEvents: "Blind events"
};

function updateObjectiveProgress({ objectives, progress }) {
    objectiveProgressList.innerHTML = "";

    Object.entries(objectives).forEach(([objective, target]) => {
        const current = Math.min(progress[objective] || 0, target);
        const item = document.createElement("li");
        const label = document.createElement("span");
        const progressBar = document.createElement("progress");

        label.textContent =`${OBJECTIVE_LABELS[objective] || objective}: ${current}/${target}`;
        progressBar.max = target;
        progressBar.value = current;
        progressBar.setAttribute("aria-label", `${OBJECTIVE_LABELS[objective] || objective} progress`);
        item.append(label, progressBar);
        objectiveProgressList.appendChild(item);
    });
}

function renderLevelButtons({
    levels,
    selectedLevel,
    selectedLevelConfig,
    unlockedLevels,
    onSelectLevel
}) {
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

    selectedLevelName.textContent = `Level ${selectedLevel}: ${selectedLevelConfig.name}`;
    selectedLevelObjectives.innerHTML = "";

    Object.entries(selectedLevelConfig.objectives).forEach(([objective, count]) => {
        const item = document.createElement("li");
        item.textContent = `${OBJECTIVE_LABELS[objective] || objective}: ${count}`;
        selectedLevelObjectives.appendChild(item);
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
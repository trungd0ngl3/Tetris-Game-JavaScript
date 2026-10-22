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
const selectedLevelDescription = document.getElementById("selected-level-description");
const currentLevelDescription = document.getElementById("current-level-description");
const selectedLevelObjectives = document.getElementById("selected-level-objectives");
const objectiveProgressList = document.getElementById("objective-progress-list");

const LEVEL_DESCRIPTIONS = {
    1: "Xóa 5 hàng để hoàn thành màn chơi. Sắp xếp các khối thật khéo léo và đừng để bảng bị lấp đầy!",
    2: "Xóa 10 hàng và đạt mục tiêu điểm số. Khối rơi nhanh hơn, hãy phản ứng thật nhanh!",
    3: "Xóa 8 hàng và phá hủy 5 Target Blocks bằng cách xóa các hàng chứa chúng.",
    4: "Xóa các hàng và phá hủy vật cản để mở rộng không gian xếp khối.",
    5: "Xóa 10 hàng và kích hoạt Fire 5 lần. Vụ nổ Fire phá hủy các khối trong vùng 3×3.",
    6: "Xóa 10 hàng và kích hoạt Ice 5 lần. Ice làm chậm tốc độ rơi của khối trong thời gian ngắn.",
    7: "Xóa 10 hàng và kích hoạt Lightning 5 lần. Tia sét phá hủy các khối theo cột dọc.",
    8: "Xóa 12 hàng và kích hoạt 8 nguyên tố. Kết hợp Fire, Ice và Lightning để kiểm soát bảng chơi!",
    9: "Xóa 10 hàng và loại bỏ 5 Garbage Rows. Đừng để những hàng rác đẩy bảng lên quá cao!",
    10: "Xóa 15 hàng, loại bỏ 5 Garbage Rows và kích hoạt 10 nguyên tố. Tận dụng sức mạnh nguyên tố để chống lại Garbage!",
    11: "Xóa 12 hàng và xóa 6 hàng khi Blind hoạt động. Ghi nhớ vị trí các khối khi bảng còn hiển thị!"
};

const OBJECTIVE_LABELS = {
    lines: "Lines",
    targets: "Targets",
    obstacles: "Obstacles",
    elements: "Elements",
    garbage: "Garbage",
    garbageRowsCleared: "Garbage rows",
    blindLinesCleared: "Blind lines",
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
    selectedLevelDescription.textContent = LEVEL_DESCRIPTIONS[selectedLevel] || "";
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
    currentLevelDescription.textContent =
        LEVEL_DESCRIPTIONS[Number(document.getElementById("level").textContent)] || "";
    currentLevelDescription.hidden =
        !currentLevelDescription.textContent ||
        (gameState !== "PLAYING" && gameState !== "PAUSED");
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
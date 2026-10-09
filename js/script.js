// CONSTANTS
const PIECES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],

    O: [
        [1, 1],
        [1, 1]
    ],

    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],

    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]  
    ],

    L: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    J: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ]
};

const COLORS = {
    I: '#00A896',
    O: '#D4A373',
    T: '#6C5CE7',
    S: '#2EC4B6',
    Z: '#E63946',
    J: '#1D3557',
    L: '#E07A5F'
};

const GAME_STATES = {
    READY: 'READY',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER',
    PAUSED: 'PAUSED',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    LEVEL_SELECT: 'LEVEL_SELECT'
};

const LEVEL_CONFIG = {
    1: {
        name: "Classic",
        mechanics: [],
        gravity: 1000,
        objectives: {
            lines: 5
        }
    },

    2: {
        name: "Speed",
        mechanics: ["speed"],
        gravity: 700,
        objectives: {
            lines: 10
        }
    },

    3: {
        name: "Target",
        mechanics: ["target"],
        gravity: 700,
        objectives: {
            lines: 8,
            targets: 5
        }
    },

    4: {
        name: "Locked",
        mechanics: ["locked"],
        objectives: {
            lines: 10,
            obstacles: 5
        }
    },

    5: {
        name: "Element",
        mechanics: ["element"],
        objectives: {
            elements: 5,
            lines: 10
        }
    },

    6: {
        name: "Garbage",
        mechanics: ["garbage"],
        objectives: {
            lines: 10,
            garbage: 10
        }
    },

    7: {
        name: "Blind",
        mechanics: ["blind"],
        objectives: {
            lines: 10,
            blindEvents: 3
        }
    },

    8: {
        name: "Element + Garbage",
        mechanics: ["element", "garbage"],
        objectives: {
            lines: 10
        }
    },

    9: {
        name: "Blind + Garbage",
        mechanics: ["blind", "garbage"],
        objectives: {
            lines: 10
        }
    },

    10: {
        name: "Boss",
        mechanics: ["element", "garbage", "blind"],
        objectives: {
            lines: 10
        }
    }
};

const TARGET_BLOCK = 2

const ROWS = 20;
const COLS = 10;

const gameBoard = document.getElementById('game-board');
const nextBoard = document.getElementById('next-board');
const holdBoard = document.getElementById('hold-board');

// GAME STATE
const game = {
    state: GAME_STATES.READY,
    board: [],
    currentPiece: null,
    nextPiece: null,
    holdPiece: null,
    selectedLevel: 1,
    score: 0,
    lines: 0,
    level: 1,
    objectives: {
        lines: 0,
        targets: 0
    },
    completedLevels: [1,2,3,4,5,6,7,8,9,10],
    canHold: true,
    interval: null,
    pieceBag: []
};

// BOARD

function createGameBoard() {
    gameBoard.innerHTML = '';
    for(let r = 0; r < ROWS; r++){
        const tr = document.createElement('tr')
        for(let c = 0; c < COLS; c++){
            const td = document.createElement('td')
            td.setAttribute('data-row', r);
            td.setAttribute('data-col', c);
            tr.appendChild(td)
        }
        gameBoard.appendChild(tr)   
    }
}
function createNextBoard() {
    nextBoard.innerHTML = '';

    for (let r = 0; r < 4; r++) {
        const tr = document.createElement('tr');

        for (let c = 0; c < 4; c++) {
            const td = document.createElement('td');
            tr.appendChild(td);
        }

        nextBoard.appendChild(tr);
    }
}

function createHoldBoard() {
    holdBoard.innerHTML = '';

    for (let r = 0; r < 4; r++) {
        const tr = document.createElement('tr');

        for (let c = 0; c < 4; c++) {
            const td = document.createElement('td');
            tr.appendChild(td);
        }

        holdBoard.appendChild(tr);
    }
}

// PIECES
function createRandomPiece() {
    if (game.pieceBag.length === 0) {
        refillPieceBag();
    }
    const randomType = game.pieceBag.pop();
    return {
        type: randomType,
        shape: PIECES[randomType].map(row => [...row]),
        color: COLORS[randomType],
        row: randomType === 'I' ? -1 : 0,
        col: Math.floor(COLS / 2) - 1
    };  
}

function renderBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = gameBoard.rows[r].cells[c];

            cell.className = '';
            cell.style.background = '';

            const cellValue = game.board[r][c];
            if (cellValue === 0) {
                continue;
            }
            cell.classList.add('filled');
            if (cellValue === TARGET_BLOCK) {
                cell.classList.add('target');
            } else {
                cell.style.background = COLORS[cellValue];
            }
        }
    }
}

function renderNextPiece() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = nextBoard.rows[r].cells[c];

            cell.className = '';
            cell.style.backgroundColor = '';
            cell.background='';
        }
    }

    for (let r = 0; r < game.nextPiece.shape.length; r++) {
        for (let c = 0; c < game.nextPiece.shape[r].length; c++) {
            if (game.nextPiece.shape[r][c] === 0) {
                continue;
            }

            const cell = nextBoard.rows[r].cells[c];

            cell.classList.add('filled');
            cell.style.backgroundColor = game.nextPiece.color;
        }
    }
}
function renderHoldPiece() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = holdBoard.rows[r].cells[c];

            cell.className = '';
            cell.style.backgroundColor = '';
        }
    }
    if (game.holdPiece === null) {
        return;
    }
    for (let r = 0; r < game.holdPiece.shape.length; r++) {
        for (let c = 0; c < game.holdPiece.shape[r].length; c++) {
            if (game.holdPiece.shape[r][c] === 0) {
                continue;
            }

            const cell = holdBoard.rows[r].cells[c];

            cell.classList.add('filled');
            cell.style.backgroundColor = game.holdPiece.color;
        }
    }
}
function renderPiece(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 0) {
                continue;
            }
            const boardRow = piece.row + r;
            const boardCol = piece.col + c;
            if (
                boardRow < 0 ||
                boardRow >= ROWS ||
                boardCol < 0 ||
                boardCol >= COLS
            ) {
                continue;
            }
            const cell = gameBoard.rows[boardRow].cells[boardCol];

            cell.classList.add('filled');
            cell.style.backgroundColor = piece.color;
        }
    }
}

// MOVEMENT
function spawnPiece() {
    const newPiece = game.nextPiece;
    game.nextPiece = createRandomPiece();

    if (!canMove(newPiece, newPiece.row, newPiece.col)) {
        gameOver();
        return false;
    }
    else {
        game.currentPiece = newPiece;
        return true;
    }
}

function spawnTargets() {
    const config = LEVEL_CONFIG[game.level];
    if (!config || !config.mechanics.includes("target")) {
        return;
    }
    const targetsOnBoard = game.board.flat().filter(cell => cell === TARGET_BLOCK).length;
    if(targetsOnBoard > 0){
        return
    }

    const targetRemaining = config.objectives.targets - game.objectives.targets;

    if(targetRemaining <= 0){
        return;
    }

    const targetsToSpawn = Math.min(3 - targetsOnBoard, targetRemaining);
    let spawned = 0;
    let attempts = 0;
    const maxAttempts = 100;
    while ( spawned < targetsToSpawn && attempts < maxAttempts) {
        attempts++;
        const randomRow = Math.floor(Math.random() * (ROWS - ROWS / 2)) + ROWS / 2; // Avoid spawning in the top 4 rows
        const randomCol = Math.floor(Math.random() * COLS);
        if (game.board[randomRow][randomCol] === 0) {
            game.board[randomRow][randomCol] = TARGET_BLOCK;
            spawned++;
        }
    }
    if (targetsToSpawn > 0) {
        console.warn(`Could not spawn ${targetsToSpawn} Target blocks.`);
    }
}

function render() {
    renderBoard();
    renderNextPiece();
    renderHoldPiece();
    renderPiece(game.currentPiece);
}

function canMove(piece, newRow, newCol, shape = piece.shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) { 
            if (shape[r][c] === 0) {
                continue;
            }

            const boardRow = newRow + r;
            const boardCol = newCol + c;

            if (
                // boardRow < 0 ||
                boardRow >= ROWS ||
                boardCol < 0 ||
                boardCol >= COLS
            ) {
                return false;
            }

            if (boardRow >= 0 && game.board[boardRow][boardCol] !== 0) {
                return false;
            }
        }
    }
    return true;
}

function moveLeft() {
    if (canMove(game.currentPiece, game.currentPiece.row, game.currentPiece.col - 1)) {
        game.currentPiece.col--;
        render();
    }
}

function moveRight() {
    if (canMove(game.currentPiece, game.currentPiece.row, game.currentPiece.col + 1)) {
        game.currentPiece.col++;
        render();
    }
}

function moveDown() {
    if (canMove(game.currentPiece, game.currentPiece.row + 1, game.currentPiece.col)) {
        game.currentPiece.row++;
        render();
    } else {
        lockPiece();
    }
}

function lockPiece() {
    placePiece();
    const linesCleared = clearLines();
    updateScore(linesCleared);
    if (game.state === GAME_STATES.LEVEL_COMPLETE) {
        return false;
    }
    if (!spawnPiece()) {
        return false;
    }
    game.canHold = true;
    render();
    return true;
}

function placePiece() {
    for (let r = 0; r < game.currentPiece.shape.length; r++) {
        for (let c = 0; c < game.currentPiece.shape[r].length; c++) {
            if (game.currentPiece.shape[r][c] === 0) {
                continue;
            }
            const boardRow = game.currentPiece.row + r;
            const boardCol = game.currentPiece.col + c;

            if(boardRow < 0) {
                continue;
            }
            
            game.board[boardRow][boardCol] = game.currentPiece.type;
        }
    }
}

// LEVEL SYSTEM
function setLevel(level) {
    if (!LEVEL_CONFIG[level]) {
        return;
    }
    game.selectedLevel = level;
    game.level = level;
}

function nextLevel() {
    const nextLevel = game.level + 1;
    if (!LEVEL_CONFIG[nextLevel] || !isLevelUnlocked(nextLevel)) {
        return;
    }
    selectLevel(nextLevel);
    startGame();
}

function isLevelUnlocked(level) {
    return level === 1 || game.completedLevels.includes(level - 1);
}

function selectLevel(level) {
    if (!LEVEL_CONFIG[level] || !isLevelUnlocked(level)) {
        return false;
    }
    game.selectedLevel = level;
    renderLevelSelect();
    return true;
}

function renderLevelSelect() {
    renderLevelButtons({
        levels: Object.keys(LEVEL_CONFIG).map(Number),
        selectedLevel: game.selectedLevel,
        selectedLevelConfig: LEVEL_CONFIG[game.selectedLevel],
        unlockedLevels: Object.keys(LEVEL_CONFIG)
            .map(Number)
            .filter(isLevelUnlocked),
        onSelectLevel: selectLevel
    });
}

function completeLevel() {
    clearInterval(game.interval);
    game.state = GAME_STATES.LEVEL_COMPLETE;
    console.log(`Level ${game.level} Complete!`);
    if (!game.completedLevels.includes(game.level)) {
        game.completedLevels.push(game.level);
    }
    document.getElementById('level-complete-score').textContent = `Score: ${game.score}`;
    document.getElementById('level-complete-level').textContent = `Level: ${game.level}`;
    document.getElementById('level-complete-lines').textContent = `Lines: ${game.lines}`;
    document.getElementById('next-level-button').style.display =LEVEL_CONFIG[game.level + 1] ? "block" : "none";
    updateGameUI(game.state);
}
// MECHANICS
function clearLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (game.board[r].every(cell => cell !== 0)) {
            const targetsInLine = game.board[r]
                .filter(cell => cell === TARGET_BLOCK)
                .length;

            game.objectives.targets += targetsInLine;
            game.board.splice(r, 1);
            game.board.unshift(Array(COLS).fill(0));
            linesCleared++;
            r++;
        }
    }
    spawnTargets();
    return linesCleared;
}

function rotatePiece(piece) {
    const newShape = new Array(piece.shape[0].length);

    for (let c = 0; c < piece.shape[0].length; c++) {
        newShape[c] = new Array(piece.shape.length);
    }

    for(let r = 0; r < piece.shape.length; r++) {
        for(let c = 0; c < piece.shape[r].length; c++) {
            newShape[c][piece.shape.length - 1 - r] = piece.shape[r][c];
        }
    }
    
    if (canMove(piece, piece.row, piece.col, newShape)) {
        piece.shape = newShape;
    } else {
        if (canMove(piece, piece.row, piece.col - 1, newShape)) {
            piece.col--;
            piece.shape = newShape;
        } else if (canMove(piece, piece.row, piece.col + 1, newShape)) {
            piece.col++;
            piece.shape = newShape;
        }
    }
}

function holdCurrentPiece() {
    if (!game.canHold || game.state !== GAME_STATES.PLAYING) {
        return;
    }
    if (game.holdPiece === null) {
        game.holdPiece = game.currentPiece;
        if (!spawnPiece()) {
            render();
            return;
        }
    } else {
        const temp = game.currentPiece;
        game.currentPiece = game.holdPiece;
        game.holdPiece = temp;
        resetPiecePosition(game.currentPiece);
        if (!canMove(game.currentPiece, game.currentPiece.row, game.currentPiece.col)) {
            gameOver();
            render();
            return;
        }
    }
    game.canHold = false;
    render();
}

function resetPiecePosition(piece) {
    piece.shape = PIECES[piece.type].map(row => [...row]);
    piece.row = piece.type === 'I' ? -1 : 0;
    piece.col = Math.floor(COLS / 2) - 1;
}

function refillPieceBag() {
    game.pieceBag = Object.keys(PIECES);
    for (let i = game.pieceBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [game.pieceBag[i], game.pieceBag[j]] = [game.pieceBag[j], game.pieceBag[i]];
    }
}

// SCORE & OBJECTIVES
function updateScore(linesCleared) {
    const points = linesCleared * 100;
    game.score += points;
    game.lines += linesCleared;
    game.objectives.lines += linesCleared;
    document.getElementById('score').textContent = game.score;
    document.getElementById('level').textContent = game.level;
    document.getElementById('lines').textContent = game.lines;
    updateObjectiveProgress({
        objectives: LEVEL_CONFIG[game.level].objectives,
        progress: game.objectives
    });
    checkObjectives();
}

function checkObjectives() {
    const config = LEVEL_CONFIG[game.level];
    if (!config) {
        return;
    }
    if (
        (config.objectives.lines !== undefined &&
        game.objectives.lines >= config.objectives.lines) && 
        (config.objectives.targets === undefined || game.objectives.targets >= config.objectives.targets)
    ) {
        completeLevel();
    }
}

// GAME LOOP
function gameOver() {
    game.state = GAME_STATES.GAME_OVER;
    clearInterval(game.interval);
    document.getElementById('final-score').textContent = `Score: ${game.score}`;
    document.getElementById('final-level').textContent = `Level: ${game.level}`;
    updateGameUI(game.state);
}

function startGame() {
    resetGame();
    game.state = GAME_STATES.PLAYING;
    updateGameUI(game.state);
    restartGameLoop();
}

function pauseGame() {
    clearInterval(game.interval);
    game.state = GAME_STATES.PAUSED;
    updateGameUI(game.state);
}
function resumeGame() {
    game.state = GAME_STATES.PLAYING;
    updateGameUI(game.state);
    restartGameLoop();
}

function showMainMenu() {
    clearInterval(game.interval);
    game.state = GAME_STATES.READY;
    updateGameUI(game.state);
}

function restartGameLoop() {
    if (game.interval) {
        clearInterval(game.interval);
    }
    const config = LEVEL_CONFIG[game.level];
    game.interval = setInterval(moveDown, config.gravity);
}

function resetGame() {
    game.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    game.score = 0;
    game.lines = 0;
    game.objectives = {
        lines: 0,
        targets: 0
    };
    game.level = game.selectedLevel || 1;
    game.holdPiece = null;
    game.canHold = true;
    game.pieceBag = [];
    game.currentPiece = createRandomPiece();
    game.nextPiece = createRandomPiece();
    document.getElementById('score').textContent = game.score;
    document.getElementById('level').textContent = game.level;
    document.getElementById('lines').textContent = game.lines;
    updateObjectiveProgress({
        objectives: LEVEL_CONFIG[game.level].objectives,
        progress: game.objectives
    });
    spawnTargets();
    render();
}

// INPUT
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (game.state === GAME_STATES.PAUSED) {
            resumeGame();
        }
        else if (game.state === GAME_STATES.PLAYING) {
            pauseGame();
        }
        return;
    }

    if (game.state !== GAME_STATES.PLAYING) {
        return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        moveLeft();
    }

    if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        moveRight();
    }

    if (event.key === 'ArrowDown'|| event.key === 's' || event.key === 'S') {
        moveDown();
    }

    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        rotatePiece(game.currentPiece);
        render();
    }

    if (event.key === ' ') {
        event.preventDefault();
        while (canMove(game.currentPiece, game.currentPiece.row + 1, game.currentPiece.col)) {
            game.currentPiece.row++;
        }
        lockPiece();
    }

    if (event.key === 'c' || event.key === 'C') {
        holdCurrentPiece();
    }
});

// INITIALIZATION
createHoldBoard();
createNextBoard();
createGameBoard();
updateGameUI(game.state);
setupUIEvents({
    onStart: () => {
        startGame();
    },

    onPause: () => {
        pauseGame();
    },

    onResume: () => {
        resumeGame();
    },

    onRestart: () => {
        startGame();
    },

    onMainMenu: () => {
        showMainMenu();
    },

    onRetry: () => {
        startGame();
    },

    onGameOverMainMenu: () => {
        showMainMenu();
    },

    onNextLevel: () => {
        nextLevel();
    },

    onLevelSelect: () => {
        clearInterval(game.interval);
        game.state = GAME_STATES.LEVEL_SELECT;
        renderLevelSelect();
        updateGameUI(game.state);
    },

    onPlaySelectedLevel: () => {
        startGame();
    }
});
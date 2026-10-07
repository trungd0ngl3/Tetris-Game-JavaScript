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
    I: 'cyan',
    O: 'yellow',
    T: 'purple',
    S: 'green',
    Z: 'red',
    J: 'blue',
    L: 'orange'
};

const GAME_STATES = {
    READY: 'READY',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME OVER',
    PAUSED: 'PAUSED'
};
const ROWS = 20;
const COLS = 10;

const gameBoard = document.getElementById('game-board');
const nextBoard = document.getElementById('next-board');
const holdBoard = document.getElementById('hold-board');

let pieceBag = [];
let currentPiece = createRandomPiece();
let nextPiece = createRandomPiece();
let board = Array.from({ length: ROWS },() => Array(COLS).fill(0));
let score = 0;
let totalLinesCleared = 0;
let level = 1;
let gravity = 1000; // Gravity in milliseconds
let gameInterval = null;
let gameState = GAME_STATES.READY;
let holdPiece = null;
let canHold = true;

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

function createRandomPiece() {
    if (pieceBag.length === 0) {
        refillPieceBag();
    }
    const randomType = pieceBag.pop();
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
            cell.style.backgroundColor = '';

            const cellValue = board[r][c];
            if (cellValue !== 0) {
                cell.classList.add('filled');
                cell.style.backgroundColor = COLORS[cellValue];
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
        }
    }

    for (let r = 0; r < nextPiece.shape.length; r++) {
        for (let c = 0; c < nextPiece.shape[r].length; c++) {
            if (nextPiece.shape[r][c] === 0) {
                continue;
            }

            const cell = nextBoard.rows[r].cells[c];

            cell.classList.add('filled');
            cell.style.backgroundColor = nextPiece.color;
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
    if (holdPiece === null) {
        return;
    }
    for (let r = 0; r < holdPiece.shape.length; r++) {
        for (let c = 0; c < holdPiece.shape[r].length; c++) {
            if (holdPiece.shape[r][c] === 0) {
                continue;
            }

            const cell = holdBoard.rows[r].cells[c];

            cell.classList.add('filled');
            cell.style.backgroundColor = holdPiece.color;
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

function spawnPiece() {
    const newPiece = nextPiece;
    nextPiece = createRandomPiece();

    if (!canMove(newPiece, newPiece.row, newPiece.col)) {
        gameOver();
        return false;
    }
    else {
        currentPiece = newPiece;
        return true;
    }
}

function render() {
    renderBoard();
    renderNextPiece();
    renderHoldPiece();
    renderPiece(currentPiece);
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

            if (boardRow >= 0 && board[boardRow][boardCol] !== 0) {
                return false;
            }
        }
    }
    return true;
}

function moveLeft() {
    if (canMove(currentPiece, currentPiece.row, currentPiece.col - 1)) {
        currentPiece.col--;
        render();
    }
}

function moveRight() {
    if (canMove(currentPiece, currentPiece.row, currentPiece.col + 1)) {
        currentPiece.col++;
        render();
    }
}

function moveDown() {
    if (canMove(currentPiece, currentPiece.row + 1, currentPiece.col)) {
        currentPiece.row++;
        render();
    } else {
        lockPiece();
    }
}

function lockPiece() {
    placePiece();
    const linesCleared = clearLines();
    updateScore(linesCleared);
    if (!spawnPiece()) {
        return false;
    }
    canHold = true;
    render();
    return true;
}

function placePiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c] === 0) {
                continue;
            }
            const boardRow = currentPiece.row + r;
            const boardCol = currentPiece.col + c;

            if(boardRow < 0) {
                continue;
            }
            
            board[boardRow][boardCol] = currentPiece.type;
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (gameState === GAME_STATES.PAUSED) {
            resumeGame();
        }
        else if (gameState === GAME_STATES.PLAYING) {
            pauseGame();
        }
        return;
    }

    if (gameState !== GAME_STATES.PLAYING) {
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
        rotatePiece(currentPiece);
        render();
    }
    
    if (event.key === ' ') {
        event.preventDefault();
        while (canMove(currentPiece, currentPiece.row + 1, currentPiece.col)) {
            currentPiece.row++;
        }
        lockPiece();
    }

    if (event.key === 'c' || event.key === 'C') {
        holdCurrentPiece();
    }
    
    
});

function clearLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            r++;
        }
    }
    return linesCleared;
}

function updateScore(linesCleared) {
    const points = linesCleared * 100;
    score += points;

    totalLinesCleared += linesCleared;

    const newLevel = Math.floor(totalLinesCleared / 10) + 1;

    if (newLevel !== level) {
        level = newLevel;
        restartGameLoop();
    }
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = totalLinesCleared;
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
    if (!canHold || gameState !== GAME_STATES.PLAYING) {
        return;
    }
    if (holdPiece === null) {
        holdPiece = currentPiece;
        if (!spawnPiece()) {
            render();
            return;
        }
    } else {
        const temp = currentPiece;
        currentPiece = holdPiece;
        holdPiece = temp;
        resetPiecePosition(currentPiece);
        if (!canMove(currentPiece, currentPiece.row, currentPiece.col)) {
            gameOver();
            render();
            return;
        }
    }
    canHold = false;
    render();
}

function resetPiecePosition(piece) {
    piece.shape = PIECES[piece.type].map(row => [...row]);
    piece.row = piece.type === 'I' ? -1 : 0;
    piece.col = Math.floor(COLS / 2) - 1;
}

function refillPieceBag() {
    pieceBag = Object.keys(PIECES);
    for (let i = pieceBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
    }
}
// Game control functions

function gameOver() {
    gameState = GAME_STATES.GAME_OVER;
    clearInterval(gameInterval);
    updateGameUI(gameState);
}

function startGame() {
    resetGame();
    gameState = GAME_STATES.PLAYING;
    updateGameUI(gameState);
    restartGameLoop();
}

function pauseGame() {
    clearInterval(gameInterval);
    gameState = GAME_STATES.PAUSED;
    updateGameUI(gameState);
}
function resumeGame() {
    gameState = GAME_STATES.PLAYING;
    updateGameUI(gameState);
    restartGameLoop();
}

function showMainMenu() {
    clearInterval(gameInterval);
    gameState = GAME_STATES.READY;
    updateGameUI(gameState);
}

function restartGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(moveDown, gravity / level);
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    totalLinesCleared = 0;
    level = 1;
    holdPiece = null;
    canHold = true;
    pieceBag = [];
    currentPiece = createRandomPiece();
    nextPiece = createRandomPiece();
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = totalLinesCleared;
    render();
}

createHoldBoard();
createNextBoard();
createGameBoard();
updateGameUI(gameState);
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
    }
});
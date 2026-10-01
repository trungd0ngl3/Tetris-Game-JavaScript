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

const ROWS = 20;
const COLS = 10;

const gameBoard = document.getElementById('game-board');

let currentPiece = createRandomPiece();
let board = Array.from({ length: ROWS },() => Array(COLS).fill(0));
let score = 0;
let totalLinesCleared = 0;
let level = 1;
let gravity = 1000; // Gravity in milliseconds
let gameInterval = null;
let gameOverFlag = false;

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
createGameBoard();

function createRandomPiece() {
    const pieceTypes = Object.keys(PIECES);
    const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
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
    const newPiece = createRandomPiece();
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
        placePiece();
        const linesCleared = clearLines();
        updateScore(linesCleared);
        if (!spawnPiece()) {
            return;
        }
        render();
    }
}

function placePiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c] === 0) {
                continue;
            }
            const boardRow = currentPiece.row + r;
            const boardCol = currentPiece.col + c;
            board[boardRow][boardCol] = currentPiece.type;
        }
    }
}

document.addEventListener('keydown', (event) => {
    if(gameOverFlag) {
        return;
    }

    if (event.key === 'ArrowLeft') {
        moveLeft();
    }

    if (event.key === 'ArrowRight') {
        moveRight();
    }

    if (event.key === 'ArrowDown') {
        moveDown();
    }
    if (event.key === ' ') {
        event.preventDefault();
        while (canMove(currentPiece, currentPiece.row + 1, currentPiece.col)) {
            currentPiece.row++;
        }
        placePiece();
        const linesCleared = clearLines();
        updateScore(linesCleared);
        if (spawnPiece()) {
            render();
        }
    }
    if (event.key === 'ArrowUp') {
        rotatePiece(currentPiece);
        render();
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
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('level').textContent = `Level: ${level}`;
}

function rotatePiece(piece) {
    const newShape = piece.shape[0].map((_, index) =>
        piece.shape.map(row => row[index]).reverse()
    );
    if (canMove(piece, piece.row, piece.col, newShape)) {
        piece.shape = newShape;
    }else {
        if (canMove(piece, piece.row, piece.col - 1, newShape)) {
            piece.col--;
            piece.shape = newShape;
        } else if (canMove(piece, piece.row, piece.col + 1, newShape)) {
            piece.col++;
            piece.shape = newShape;
        }
    }
}

function gameOver() {
    gameOverFlag = true;
    clearInterval(gameInterval);
    alert('Game Over! Your score: ' + score);
}

function startGame() {
    render();
    restartGameLoop();
}

function restartGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(moveDown, gravity / level);
}


startGame();
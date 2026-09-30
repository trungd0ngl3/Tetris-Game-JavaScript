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
const currentPiece = createRandomPiece();
const board = Array.from(
    { length: ROWS },
    () => Array(COLS).fill(0)
);

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

            if (board[r][c] !== 0) {
                cell.classList.add('filled');
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
        }
    }
}
function render() {
    renderBoard();
    renderPiece(currentPiece);
}
function canMove(piece, newRow, newCol) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 0) {
                continue;
            }

            const boardRow = newRow + r;
            const boardCol = newCol + c;

            if (
                boardRow < 0 ||
                boardRow >= ROWS ||
                boardCol < 0 ||
                boardCol >= COLS
            ) {
                return false;
            }

            if (board[boardRow][boardCol] !== 0) {
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
        currentPiece = createRandomPiece();
        render();
    }
}




document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        moveLeft();
    }

    if (event.key === 'ArrowRight') {
        moveRight();
    }

    if (event.key === 'ArrowDown') {
        moveDown();
    }
});
console.log(currentPiece);
render();
console.log(
    canMove(
        currentPiece,
        currentPiece.row + 1,
        currentPiece.col
    )
);
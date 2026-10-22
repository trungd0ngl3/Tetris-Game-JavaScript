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

const ELEMENT_TYPES = {
    FIRE: {
        id: 'fire',
        block: 'element-fire',
        className: 'fire-element'
    },
    ICE: {
        id: 'ice',
        block: 'element-ice',
        className: 'ice-element'
    },
    LIGHTNING: {
        id: 'lightning',
        block: 'element-lightning',
        className: 'lightning-element'
    }
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
        name: "Obstacle",
        mechanics: ["obstacle"],
        gravity: 700,
        objectives: {
            lines: 10,
            obstacles: 8
        }
    },

    5: {
        name: "Element - Fire",
        mechanics: ["element"],
        elementTypes: [ELEMENT_TYPES.FIRE.id],
        gravity: 700,
        objectives: {
            elements: 5,
            lines: 10
        }
    },

    6: {
        name: "Element - Ice",
        mechanics: ["element"],
        elementTypes: [ELEMENT_TYPES.ICE.id],
        gravity: 700,
        objectives: {
            lines: 10,
            elements: 5
        }
    },

    7: {
        name: "Element - Lightning",
        mechanics: ["element"],
        elementTypes: [ELEMENT_TYPES.LIGHTNING.id],
        gravity: 700,
        objectives: {
            lines: 10,
            elements: 5
        }
    },

    8: {
        name: "Elemental Chaos",
        mechanics: ["element"],
        elementTypes: [
            ELEMENT_TYPES.FIRE.id,
            ELEMENT_TYPES.ICE.id,
            ELEMENT_TYPES.LIGHTNING.id
        ],
        gravity: 700,
        objectives: {
            lines: 12,
            elements: 8
        }
    },

    9: {
        name: "Garbage Survival",
        mechanics: ["garbage"],
        gravity: 700,
        objectives: {
            lines: 10,
            garbageRowsCleared: 5
        }
    },

    10: {
        name: "Elemental Garbage Storm",
        mechanics: ["element", "garbage"],
        elementTypes: [
            ELEMENT_TYPES.FIRE.id,
            ELEMENT_TYPES.ICE.id,
            ELEMENT_TYPES.LIGHTNING.id
        ],
        gravity: 700,
        objectives: {
            lines: 15,
            garbageRowsCleared: 5,
            elements: 10
        }
    },

    11: {
        name: "Blind Challenge",
        mechanics: ["blind"],
        gravity: 700,
        objectives: {
            lines: 12,
            blindLinesCleared: 6
        }
    }
};

const TARGET_BLOCK = 2
const ROCK_BLOCK_2HP = 'rock-2hp';
const ROCK_BLOCK_1HP = 'rock-1hp';
const GARBAGE_BLOCK = 'garbage-block';
const LOCKS_PER_GARBAGE_ROW = 8;
const FIRE_IGNITION_DURATION = 100;
const FIRE_BLAST_DURATION = 250;
const ICE_DURATION = 3000;
const ICE_FALL_MULTIPLIER = 0.5;
const ICE_ACTIVATION_DURATION = 125;
const LINE_FALL_SPEED_MULTIPLIER = 1.05;
const BLIND_VISIBLE_DURATION = 5000;
const BLIND_DURATION = 4000;
const BLIND_WARNING_DURATION = 1500;
const BLIND_ROW_COUNT = 6;

const ROWS = 20;
const COLS = 10;
const OBSTACLE_LAYOUT = [
    { row: 14, col: 2 },
    { row: 15, col: 2 },
    { row: 16, col: 2 },
    { row: 16, col: 3 },
    { row: 15, col: 7 },
    { row: 16, col: 7 },
    { row: 17, col: 7 },
    { row: 17, col: 6 },
];

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
        targets: 0,
        obstacles: 0,
        elements: 0,
        garbageRowsCleared: 0,
        blindLinesCleared: 0
    },
    completedLevels: [1,2,3,4,5,6,7,8,9,10],
    canHold: true,
    interval: null,
    pieceBag: [],
    isAnimating: false,
    iceActive: false,
    iceEndTime: 0,
    iceTimeout: null,
    iceAnimationPositions: [],
    iceAnimationEndTime: 0,
    animationId: 0,
    piecesLocked: 0,
    garbageRowsSpawned: 0,
    blindActive: false,
    blindWarningActive: false,
    blindStartRow: null,
    blindNextTransitionAt: 0,
    blindRemainingTime: 0,
    blindCyclePaused: false
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
    const piece = {
        type: randomType,
        shape: PIECES[randomType].map(row => [...row]),
        color: COLORS[randomType],
        row: randomType === 'I' ? -1 : 0,
        col: Math.floor(COLS / 2) - 1
    };
    return createElementPiece(piece);
}

function createElementPiece(piece) {
    const config = LEVEL_CONFIG[game.level];
    if (!config || !config.mechanics.includes("element") || !config.elementTypes || Math.random() >= 0.35) {
        return piece;
    }

    const availableElements = config.elementTypes.map(elementId => {
        const element = Object.values(ELEMENT_TYPES).find(elementType => elementType.id === elementId);
        if (!element) {
            throw new Error(`Unknown element type in level configuration: ${elementId}`);
        }
        return element;
    });

    const element = availableElements[Math.floor(Math.random() * availableElements.length)];
    const occupiedCells = [];
    piece.shape.forEach((row, r) => row.forEach((cell, c) => {
        if (cell !== 0) {
            occupiedCells.push({ row: r, col: c });
        }
    }));
    const elementCell = occupiedCells[Math.floor(Math.random() * occupiedCells.length)];
    piece.shape[elementCell.row][elementCell.col] = element.block;
    piece.element = {
        type: element.id,
        row: elementCell.row,
        col: elementCell.col
    };
    return piece;
}

function getElementType(block) {
    return Object.values(ELEMENT_TYPES).find(element => element.block === block) || null;
}

function renderBoard() {
    const blindEndRow = game.blindStartRow === null
        ? null
        : game.blindStartRow + Math.min(BLIND_ROW_COUNT, ROWS);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = gameBoard.rows[r].cells[c];

            cell.className = '';
            cell.style.background = '';
            if (
                (game.blindActive || game.blindWarningActive) &&
                game.blindStartRow !== null &&
                LEVEL_CONFIG[game.level].mechanics.includes("blind") &&
                r >= game.blindStartRow && r < blindEndRow
            ) {
                if (game.blindActive) {
                    cell.classList.add('blind-hidden');
                } else {
                    cell.classList.add('blind-warning');
                    if (r === game.blindStartRow) {
                        cell.classList.add('blind-warning-top');
                    }
                    if (r === blindEndRow - 1) {
                        cell.classList.add('blind-warning-bottom');
                    }
                    if (c === 0) {
                        cell.classList.add('blind-warning-left');
                    }
                    if (c === COLS - 1) {
                        cell.classList.add('blind-warning-right');
                    }
                }
            }

            const cellValue = game.board[r][c];
            if (cellValue === 0) {
                continue;
            }
            cell.classList.add('filled');
            if (cellValue === TARGET_BLOCK) {
                cell.classList.add('target');
            } else if (cellValue === ROCK_BLOCK_2HP || cellValue === ROCK_BLOCK_1HP) {
                cell.classList.add('obstacle');
                cell.classList.add(cellValue === ROCK_BLOCK_2HP ? 'obstacle-2hp' : 'obstacle-1hp');
                cell.dataset.hp = cellValue === ROCK_BLOCK_2HP ? '2' : '1';
            } else if (cellValue === GARBAGE_BLOCK) {
                cell.classList.add('garbage');
            } else if (getElementType(cellValue)) {
                cell.classList.add(getElementType(cellValue).className);
            } else {
                cell.style.background = COLORS[cellValue];
            }
            if (
                Date.now() < game.iceAnimationEndTime &&
                game.iceAnimationPositions.some(position => position.row === r && position.col === c)
            ) {
                cell.classList.add('ice-activating');
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
            const element = getElementType(game.nextPiece.shape[r][c]);
            if (element) {
                cell.classList.add(element.className);
            } else {
                cell.style.backgroundColor = game.nextPiece.color;
            }
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
            const element = getElementType(game.holdPiece.shape[r][c]);
            if (element) {
                cell.classList.add(element.className);
            } else {
                cell.style.backgroundColor = game.holdPiece.color;
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

            cell.classList.add('filled', 'active-piece');
            const element = getElementType(piece.shape[r][c]);
            if (element) {
                cell.classList.add(element.className);
            } else {
                cell.style.backgroundColor = piece.color;
            }
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
        const randomRow = Math.floor(Math.random() * (ROWS - ROWS / 2)) + ROWS / 2;
        const randomCol = Math.floor(Math.random() * COLS);
        if (game.board[randomRow][randomCol] === 0) {
            game.board[randomRow][randomCol] = TARGET_BLOCK;
            spawned++;
        }
    }
    if (targetsToSpawn > 0) {
        console.warn(targetsToSpawn);
    }
}

function initializeObstacles() {
    const config = LEVEL_CONFIG[game.level];
    if (!config || !config.mechanics.includes("obstacle")) {
        return;
    }

    OBSTACLE_LAYOUT.forEach(({ row, col }) => {
        game.board[row][col] = ROCK_BLOCK_2HP;
    });
}

function render() {
    renderBoard();
    renderNextPiece();
    renderHoldPiece();
    if (game.currentPiece) {
        renderPiece(game.currentPiece);
    }
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
    if (game.isAnimating || !game.currentPiece) {
        return;
    }
    if (canMove(game.currentPiece, game.currentPiece.row, game.currentPiece.col - 1)) {
        game.currentPiece.col--;
        render();
    }
}

function moveRight() {
    if (game.isAnimating || !game.currentPiece) {
        return;
    }
    if (canMove(game.currentPiece, game.currentPiece.row, game.currentPiece.col + 1)) {
        game.currentPiece.col++;
        render();
    }
}

function moveDown() {
    if (game.isAnimating || !game.currentPiece) {
        return;
    }
    updateBlindEffect();
    if (canMove(game.currentPiece, game.currentPiece.row + 1, game.currentPiece.col)) {
        game.currentPiece.row++;
        render();
    } else {
        lockPiece();
    }
}

function hardDrop() {
    if (game.state !== GAME_STATES.PLAYING || game.isAnimating || !game.currentPiece) {
        return false;
    }

    while (canMove(game.currentPiece, game.currentPiece.row + 1, game.currentPiece.col)) {
        game.currentPiece.row++;
    }
    render();
    return lockPiece();
}

async function lockPiece() {
    if (game.isAnimating || !game.currentPiece) {
        return false;
    }
    updateBlindEffect();
    placePiece();
    game.currentPiece = null;
    const clearAnimation = animatePendingClear();
    if (clearAnimation) {
        clearInterval(game.interval);
        game.interval = null;
        const animationId = game.animationId;
        await clearAnimation;
        if (animationId !== game.animationId) {
            return false;
        }
    }
    const linesCleared = clearLines();

    const garbageEnabled = LEVEL_CONFIG[game.level].mechanics.includes("garbage");
    if (garbageEnabled) {
        game.piecesLocked++;
    }
    updateScore(linesCleared);
    if (game.state === GAME_STATES.LEVEL_COMPLETE) {
        render();
        return false;
    }
    if (
        garbageEnabled &&
        game.piecesLocked % LOCKS_PER_GARBAGE_ROW === 0 &&
        !spawnGarbageRow()
    ) {
        render();
        return false;
    }
    if (!spawnPiece()) {
        render();
        return false;
    }
    game.canHold = true;
    render();
    if (game.state === GAME_STATES.PLAYING && (!game.interval || linesCleared > 0)) {
        restartGameLoop();
    }
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
            
            game.board[boardRow][boardCol] = getElementType(game.currentPiece.shape[r][c])
                ? game.currentPiece.shape[r][c]
                : game.currentPiece.type;
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
    stopBlindEffect();
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
function animateClearEffects(effects, icePositions, lightningPositions, fullRows) {
    const animationId = ++game.animationId;
    game.isAnimating = true;

    effects.forEach(({ center }) => {
        const centerCell = gameBoard.rows[center.row].cells[center.col];
        centerCell.classList.add('fire-activating');
    });
    icePositions.forEach(({ row, col }) => {
        gameBoard.rows[row].cells[col].classList.add('ice-activating');
    });
    lightningPositions.forEach(({ col }) => {
        for (let row = 0; row < ROWS; row++) {
            gameBoard.rows[row].cells[col].classList.add('lightning-strike');
        }
    });
    fullRows.forEach(row => {
        for (let col = 0; col < COLS; col++) {
            gameBoard.rows[row].cells[col].classList.add('line-clearing');
        }
    });

    return new Promise(resolve => {
        setTimeout(() => {
            if (animationId === game.animationId) {
                effects.forEach(({ center }) => {
                    const centerCell = gameBoard.rows[center.row].cells[center.col];
                    centerCell.classList.remove('fire-activating');
                });
                effects.forEach(({ center, affected }) => {
                    for (let row = Math.max(0, center.row - 1); row <= Math.min(ROWS - 1, center.row + 1); row++) {
                        for (let col = Math.max(0, center.col - 1); col <= Math.min(COLS - 1, center.col + 1); col++) {
                            gameBoard.rows[row].cells[col].classList.add('fire-blast');
                        }
                    }
                    affected.forEach(({ row, col, kind }) => {
                        const cell = gameBoard.rows[row].cells[col];
                        if (kind === 'obstacle-damaged') {
                            cell.classList.add('obstacle-cracked');
                        } else if (kind === 'destroyed') {
                            cell.classList.add('fire-destroying');
                        }
                    });
                });
            }

            setTimeout(() => {
                if (animationId === game.animationId) {
                    effects.forEach(({ center, affected }) => {
                        for (let row = Math.max(0, center.row - 1); row <= Math.min(ROWS - 1, center.row + 1); row++) {
                            for (let col = Math.max(0, center.col - 1); col <= Math.min(COLS - 1, center.col + 1); col++) {
                                gameBoard.rows[row].cells[col].classList.remove('fire-blast');
                            }
                        }
                        affected.forEach(({ row, col }) => {
                            gameBoard.rows[row].cells[col].classList.remove('fire-destroying', 'obstacle-cracked');
                        });
                    });
                    icePositions.forEach(({ row, col }) => {
                        gameBoard.rows[row].cells[col].classList.remove('ice-activating');
                    });
                    lightningPositions.forEach(({ col }) => {
                        for (let row = 0; row < ROWS; row++) {
                            gameBoard.rows[row].cells[col].classList.remove('lightning-strike');
                        }
                    });
                    fullRows.forEach(row => {
                        for (let col = 0; col < COLS; col++) {
                            gameBoard.rows[row].cells[col].classList.remove('line-clearing');
                        }
                    });
                    game.isAnimating = false;
                }
                resolve();
            }, FIRE_BLAST_DURATION);
        }, FIRE_IGNITION_DURATION);
    });
}

function getPendingClearEffects() {
    const fullRows = game.board
        .map((row, index) => row.every(cell => cell !== 0) ? index : -1)
        .filter(index => index !== -1);
    if (fullRows.length === 0) {
        return null;
    }

    const effects = [];
    const icePositions = [];
    const lightningPositions = [];
    const affectedPositions = new Set();
    fullRows.forEach(row => {
        game.board[row].forEach((cell, col) => {
            const element = getElementType(cell);
            if (!element) {
                return;
            }

            if (element.id === ELEMENT_TYPES.ICE.id) {
                icePositions.push({ row, col });
            } else if (element.id === ELEMENT_TYPES.FIRE.id) {
                const affected = [];
                for (let blastRow = Math.max(0, row - 1); blastRow <= Math.min(ROWS - 1, row + 1); blastRow++) {
                    for (let blastCol = Math.max(0, col - 1); blastCol <= Math.min(COLS - 1, col + 1); blastCol++) {
                        const position = `${blastRow},${blastCol}`;
                        if (affectedPositions.has(position)) {
                            continue;
                        }
                        affectedPositions.add(position);

                        const block = game.board[blastRow][blastCol];
                        if (block === ROCK_BLOCK_2HP) {
                            affected.push({ row: blastRow, col: blastCol, kind: 'obstacle-damaged' });
                        } else if (
                            block === ROCK_BLOCK_1HP ||
                            COLORS[block] ||
                            getElementType(block) ||
                            block === GARBAGE_BLOCK
                        ) {
                            affected.push({ row: blastRow, col: blastCol, kind: 'destroyed' });
                        }
                    }
                }
                effects.push({ center: { row, col }, affected });
            } else if (element.id === ELEMENT_TYPES.LIGHTNING.id) {
                lightningPositions.push({ row, col });
            }
        });
    });
    return { effects, icePositions, lightningPositions, fullRows };
}

function animatePendingClear() {
    const pendingClear = getPendingClearEffects();
    if (!pendingClear) {
        return null;
    }
    return animateClearEffects(
        pendingClear.effects,
        pendingClear.icePositions,
        pendingClear.lightningPositions,
        pendingClear.fullRows
    );
}

function activateElement(elementType, row, col, affectedPositions = new Set(), cells = null) {
    switch (elementType) {
        case ELEMENT_TYPES.ICE.id:
            activateIce(row, col);
            return [];
        case ELEMENT_TYPES.FIRE.id: {
            return applyFireExplosion(cells || getFireExplosionCells(row, col), affectedPositions);
        }
        case ELEMENT_TYPES.LIGHTNING.id:
            return applyLightningStrike(cells || getLightningStrikeCells(row, col), affectedPositions);
        default:
            throw new Error(`Element effect is not implemented: ${elementType}`);
    }
}

function getFireExplosionCells(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return [];
    }
    const cells = [];
    for (let blastRow = Math.max(0, row - 1); blastRow <= Math.min(ROWS - 1, row + 1); blastRow++) {
        for (let blastCol = Math.max(0, col - 1); blastCol <= Math.min(COLS - 1, col + 1); blastCol++) {
            cells.push({ row: blastRow, col: blastCol });
        }
    }
    return cells;
}

function applyFireExplosion(cells, affectedPositions = new Set()) {
    const affected = [];
    cells.forEach(({ row, col }) => {
        const position = `${row},${col}`;
        if (affectedPositions.has(position)) {
            return;
        }

        const block = game.board[row][col];
        if (block === ROCK_BLOCK_2HP) {
            affectedPositions.add(position);
            game.board[row][col] = ROCK_BLOCK_1HP;
            affected.push({ row, col, kind: 'obstacle-damaged' });
        } else if (block === ROCK_BLOCK_1HP) {
            affectedPositions.add(position);
            game.board[row][col] = 0;
            game.objectives.obstacles++;
            affected.push({ row, col, kind: 'destroyed' });
        } else if (COLORS[block] || getElementType(block) || block === GARBAGE_BLOCK) {
            affectedPositions.add(position);
            game.board[row][col] = 0;
            affected.push({ row, col, kind: 'destroyed' });
        }
    });
    return affected;
}

function getLightningStrikeCells(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return [];
    }
    return Array.from({ length: ROWS }, (_, strikeRow) => ({ row: strikeRow, col }));
}

function applyLightningStrike(cells, affectedPositions = new Set()) {
    const affected = [];
    cells.forEach(({ row, col }) => {
        const position = `${row},${col}`;
        if (affectedPositions.has(position)) {
            return;
        }

        const block = game.board[row][col];
        if (!COLORS[block] && !getElementType(block) && block !== GARBAGE_BLOCK) {
            return;
        }
        affectedPositions.add(position);
        game.board[row][col] = 0;
        affected.push({ row, col, kind: 'destroyed' });
    });
    return affected;
}

function activateIce(row, col) {
    const now = Date.now();
    game.iceActive = true;
    game.iceEndTime = now + ICE_DURATION;
    game.iceAnimationPositions = now < game.iceAnimationEndTime
        ? [...game.iceAnimationPositions, { row, col }]
        : [{ row, col }];
    game.iceAnimationEndTime = now + ICE_ACTIVATION_DURATION;

    if (game.iceTimeout !== null) {
        clearTimeout(game.iceTimeout);
    }
    game.iceTimeout = setTimeout(updateIceEffect, ICE_DURATION);

    if (game.state === GAME_STATES.PLAYING) {
        restartGameLoop();
    }
}

function updateIceEffect() {
    if (!game.iceActive || Date.now() < game.iceEndTime) {
        return;
    }

    game.iceActive = false;
    game.iceEndTime = 0;
    game.iceTimeout = null;
    if (game.state === GAME_STATES.PLAYING) {
        restartGameLoop();
    }
}

function clearLines() {
    let linesCleared = 0;
    let obstaclesDestroyed = 0;
    const fullRows = game.board
        .map((row, index) => row.every(cell => cell !== 0) ? { row, index } : null)
        .filter(Boolean);
    if (game.blindActive && LEVEL_CONFIG[game.level].mechanics.includes("blind")) {
        game.objectives.blindLinesCleared += fullRows.length;
    }
    game.objectives.garbageRowsCleared += fullRows.filter(
        ({ row }) => row.includes(GARBAGE_BLOCK)
    ).length;
    const affectedPositions = new Set();
    const activatedElements = [];
    fullRows.forEach(({ row, index }) => {
        row.forEach((cell, col) => {
            const element = getElementType(cell);
            if (!element) {
                return;
            }

            activatedElements.push({
                type: element.id,
                row: index,
                col,
                cells: element.id === ELEMENT_TYPES.FIRE.id
                    ? getFireExplosionCells(index, col)
                    : element.id === ELEMENT_TYPES.LIGHTNING.id
                        ? getLightningStrikeCells(index, col)
                        : []
            });
        });
    });
    activatedElements.forEach(({ type, row, col, cells }) => {
        activateElement(type, row, col, affectedPositions, cells);
    });
    game.objectives.elements += activatedElements.length;

    for (let i = fullRows.length - 1; i >= 0; i--) {
        const { row } = fullRows[i];
        const index = game.board.indexOf(row);
        const targetsInLine = row
            .filter(cell => cell === TARGET_BLOCK)
            .length;
        game.objectives.targets += targetsInLine;

        let survivingObstacles = 0;
        row.forEach((cell, col) => {
            if (cell === ROCK_BLOCK_2HP) {
                survivingObstacles++;
                row[col] = ROCK_BLOCK_1HP;
            } else if (cell === ROCK_BLOCK_1HP) {
                obstaclesDestroyed++;
                row[col] = 0;
            } else {
                row[col] = 0;
            }
        });

        if (survivingObstacles === 0) {
            game.board.splice(index, 1);
            game.board.unshift(Array(COLS).fill(0));
        }
        linesCleared++;
    }

    if (obstaclesDestroyed > 0) {
        game.objectives.obstacles += obstaclesDestroyed;
    }
    spawnTargets();
    return linesCleared;
}

function spawnGarbageRow() {
    if (game.board[0].some(cell => cell !== 0)) {
        gameOver();
        return false;
    }

    const gapCol = Math.floor(Math.random() * COLS);
    const garbageRow = Array(COLS).fill(GARBAGE_BLOCK);
    garbageRow[gapCol] = 0;
    game.board.shift();
    game.board.push(garbageRow);
    game.garbageRowsSpawned++;
    return true;
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
    if (piece.element) {
        const element = Object.values(ELEMENT_TYPES).find(
            elementType => elementType.id === piece.element.type
        );
        if (!element) {
            throw new Error(`Unknown element type: ${piece.element.type}`);
        }
        piece.shape[piece.element.row][piece.element.col] = element.block;
    }
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
    refreshObjectiveProgress();
    checkObjectives();
}

function checkObjectives() {
    const config = LEVEL_CONFIG[game.level];
    if (!config) {
        return;
    }
    const objectivesComplete =
        (config.objectives.lines === undefined || game.objectives.lines >= config.objectives.lines) &&
        (config.objectives.targets === undefined || game.objectives.targets >= config.objectives.targets) &&
        (config.objectives.obstacles === undefined || game.objectives.obstacles >= config.objectives.obstacles) &&
        (config.objectives.elements === undefined || game.objectives.elements >= config.objectives.elements) &&
        (config.objectives.garbageRowsCleared === undefined ||
            game.objectives.garbageRowsCleared >= config.objectives.garbageRowsCleared) &&
        (config.objectives.blindLinesCleared === undefined ||
            game.objectives.blindLinesCleared >= config.objectives.blindLinesCleared);
    if (objectivesComplete) {
        completeLevel();
    }
}

function refreshObjectiveProgress() {
    const config = LEVEL_CONFIG[game.level];
    if (!config) return;
    updateObjectiveProgress({
        objectives: config.objectives,
        progress: game.objectives
    });
}
// GAME LOOP
function gameOver() {
    stopBlindEffect();
    game.state = GAME_STATES.GAME_OVER;
    clearInterval(game.interval);
    document.getElementById('final-score').textContent = `Score: ${game.score}`;
    document.getElementById('final-level').textContent = `Level: ${game.level}`;
    updateGameUI(game.state);
}

function startGame() {
    resetGame();
    game.state = GAME_STATES.PLAYING;
    startBlindCycle();
    updateGameUI(game.state);
    restartGameLoop();
}

function pauseGame() {
    if (game.isAnimating) {
        return;
    }
    pauseBlindCycle();
    clearInterval(game.interval);
    game.state = GAME_STATES.PAUSED;
    updateGameUI(game.state);
}
function resumeGame() {
    game.state = GAME_STATES.PLAYING;
    resumeBlindCycle();
    updateGameUI(game.state);
    restartGameLoop();
}

function showMainMenu() {
    clearInterval(game.interval);
    stopBlindEffect();
    game.state = GAME_STATES.READY;
    updateGameUI(game.state);
}

function restartGameLoop() {
    if (game.interval) {
        clearInterval(game.interval);
    }
    game.interval = setInterval(moveDown, getCurrentFallInterval());
}

function startBlindCycle() {
    game.blindActive = false;
    game.blindWarningActive = false;
    game.blindStartRow = null;
    game.blindRemainingTime = 0;
    game.blindCyclePaused = false;
    game.blindNextTransitionAt = LEVEL_CONFIG[game.level].mechanics.includes("blind")
        ? Date.now() + BLIND_VISIBLE_DURATION - BLIND_WARNING_DURATION
        : 0;
}

function updateBlindEffect() {
    if (
        game.state !== GAME_STATES.PLAYING ||
        !LEVEL_CONFIG[game.level].mechanics.includes("blind") ||
        game.blindNextTransitionAt === 0 ||
        Date.now() < game.blindNextTransitionAt
    ) {
        return;
    }

    if (game.blindActive) {
        game.blindActive = false;
        game.blindStartRow = null;
        game.blindNextTransitionAt = Date.now() +
            BLIND_VISIBLE_DURATION - BLIND_WARNING_DURATION;
    } else if (game.blindWarningActive) {
        game.blindWarningActive = false;
        game.blindActive = true;
        game.blindNextTransitionAt = Date.now() + BLIND_DURATION;
    } else {
        game.blindWarningActive = true;
        game.blindStartRow = getRandomBlindStartRow();
        game.blindNextTransitionAt = Date.now() + BLIND_WARNING_DURATION;
    }
    render();
}

function getRandomBlindStartRow() {
    const blindRowCount = Math.min(BLIND_ROW_COUNT, ROWS);
    return Math.floor(Math.random() * (ROWS - blindRowCount + 1));
}

function pauseBlindCycle() {
    if (game.blindNextTransitionAt !== 0) {
        game.blindRemainingTime = Math.max(0, game.blindNextTransitionAt - Date.now());
        game.blindNextTransitionAt = 0;
        game.blindCyclePaused = true;
    }
}

function resumeBlindCycle() {
    if (
        LEVEL_CONFIG[game.level].mechanics.includes("blind") &&
        game.blindCyclePaused
    ) {
        game.blindNextTransitionAt = Date.now() + game.blindRemainingTime;
        game.blindRemainingTime = 0;
        game.blindCyclePaused = false;
    }
}

function stopBlindEffect() {
    const wasBlindVisible = game.blindActive || game.blindWarningActive;
    game.blindActive = false;
    game.blindWarningActive = false;
    game.blindStartRow = null;
    game.blindNextTransitionAt = 0;
    game.blindRemainingTime = 0;
    game.blindCyclePaused = false;
    if (wasBlindVisible) {
        renderBoard();
    }
}

function getCurrentFallInterval() {
    const config = LEVEL_CONFIG[game.level];
    const lineSpeedMultiplier = Math.pow(LINE_FALL_SPEED_MULTIPLIER, game.lines);
    const iceMultiplier = game.iceActive ? ICE_FALL_MULTIPLIER : 1;
    return Math.max(1, config.gravity / (lineSpeedMultiplier * iceMultiplier));
}

function resetGame() {
    game.animationId++;
    game.isAnimating = false;
    if (game.iceTimeout !== null) {
        clearTimeout(game.iceTimeout);
    }
    game.iceActive = false;
    game.iceEndTime = 0;
    game.iceTimeout = null;
    game.iceAnimationPositions = [];
    game.iceAnimationEndTime = 0;
    game.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    game.score = 0;
    game.lines = 0;
    game.objectives = {
        lines: 0,
        targets: 0,
        obstacles: 0,
        elements: 0,
        garbageRowsCleared: 0,
        blindLinesCleared: 0
    };
    game.piecesLocked = 0;
    game.garbageRowsSpawned = 0;
    stopBlindEffect();
    game.level = game.selectedLevel || 1;
    game.holdPiece = null;
    game.canHold = true;
    game.pieceBag = [];
    game.currentPiece = createRandomPiece();
    game.nextPiece = createRandomPiece();
    document.getElementById('score').textContent = game.score;
    document.getElementById('level').textContent = game.level;
    document.getElementById('lines').textContent = game.lines;
    if (LEVEL_CONFIG[game.level].mechanics.includes("obstacle")) {
        initializeObstacles();
    }
    updateObjectiveProgress({
        objectives: LEVEL_CONFIG[game.level].objectives,
        progress: game.objectives
    });
    spawnTargets();
    render();
}

// INPUT
document.addEventListener('keydown', (event) => {
    if (game.isAnimating) {
        return;
    }

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
        hardDrop();
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
let board = [];
let size = parseInt(document.getElementById("size").value);

let mineCount = parseInt(document.getElementById("mine").value);
let startTime;
let isPlaying = false;
let highScore = localStorage.getItem("highScore") || 0;
let highScoreDiv = document.getElementById("highScore");
let playerName = localStorage.getItem("bestPlayer");
highScoreDiv.textContent = "Best: " + playerName + "(" + highScore + ")";
let timerInterval;
let intervalId;
let cellFlagged = 0;
let cellSuspect = 0;

let loss;

let lastClickTime = 0;
const delay = 200; // Time interval in milliseconds

document.addEventListener(
    "contextmenu",
    function (event) {
        event.preventDefault();
        let currentTime = new Date().getTime();
        if (currentTime - lastClickTime < delay) {
            event.stopImmediatePropagation();
            event.preventDefault();
            return false;
        }
        lastClickTime = currentTime;
    },
    true
);

document.getElementById("size").addEventListener("input", function (e) {
    let max = parseInt(e.target.max);
    let size = parseInt(document.getElementById("size").value);
    document.getElementById("mine").value = Math.floor(
        size * size * 0.2 - size / 10
    );

    if (e.target.value > max) {
        e.target.value = max;
        document.getElementById("mine").value = Math.floor(
            max * max * 0.2 - size / 10
        );
    }

    if (e.target.value < 1) {
        e.target.value = 5;
        document.getElementById("mine").value = Math.floor(
            5 * 5 * 0.2 - size / 10
        );
    }
});

document.getElementById("mine").addEventListener("input", function (e) {
    let size = parseInt(document.getElementById("size").value);

    if (e.target.value > size * (size - 1)) {
        e.target.value = size * (size - 1);
    }

    if (e.target.value == 0) {
        e.target.value = 1;
    }
});

function setValue() {
    if (!isPlaying || loss) {
        // let prevSize = size;
        // let prevMineCount = mineCount;
        size = parseInt(document.getElementById("size").value);
        mineCount = parseInt(document.getElementById("mine").value);

        if (size < 5)
            document.getElementById("errMsg").innerHTML =
                "Please set size to 5 or greater to setup table.";
        else {
            document.getElementById("errMsg").innerHTML = "";
            resetGame();
        }
    } else {
        alert("Cannot change value while a game is in progress.");
        return;
    }
}

function resetValue() {
    if (!isPlaying || loss) {
        document.getElementById("size").value = 10;
        document.getElementById("mine").value = 18;
        size = 10;
        mineCount = 18;
        resetGame();
    } else {
        alert("Cannot reset value while a game is in progress.");
        return;
    }
}

function resetHighScore() {
    let password = prompt(
        "Please enter password to delete high score."
    );
    // confirm('Do you want to reset the high score? This can\'t be undone?');
    if (password === "developerdeptraivl") {
        alert("Reset successful.");
        highScore = 0;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highScore").textContent = "Best: " + highScore;
        for (var i = 1; i <= 10; ++i) {
            localStorage.setItem("hofName" + i, '');
            localStorage.setItem("hofScore" + i, '');
        }
    }
}

function createBoard() {
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = {
                mine: false,
                number: 0,
                revealed: false,
                flagged: false,
                suspect: false,
                x: i,
                y: j,
                id: i + "-" + j,
            };
        }
    }
}

function placeMines(exceptX, exceptY) {
    let availableCells = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i !== exceptX || j != exceptY) {
                availableCells.push({ x: i, y: j });
            }
        }
    }
    for (let i = 0; i < mineCount; i++) {
        let index = Math.floor(Math.random() * availableCells.length);
        let cell = availableCells.splice(index, 1)[0];
        board[cell.x][cell.y].mine = true;
    }
}

function calculateNumbers() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!board[i][j].mine) {
                let mines = 0;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (
                            i + dx >= 0 &&
                            i + dx < size &&
                            j + dy >= 0 &&
                            j + dy < size &&
                            board[i + dx][j + dy].mine
                        ) {
                            mines++;
                        }
                    }
                }
                board[i][j].number = mines;
            }
        }
    }
}

function drawBoard() {
    let boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let cell = document.createElement("div");
            cell.className = "cell hidden";
            cell.onclick = (function (i, j) {
                return function () {
                    if (!startTime) {
                        startTime = new Date();
                        placeMines(i, j);
                        calculateNumbers();
                        startTimer();
                    }
                    // if (board[i][j].flagged) {
                    //     board[i][j].flagged = !board[i][j].flagged;
                    // }

                    if (!loss) {
                        revealCell(i, j);
                        drawBoard();
                        checkWin();
                    } else return;
                };
            })(i, j);
            cell.oncontextmenu = (function (i, j) {
                return function (e) {
                    e.preventDefault();
                    if (!startTime) {
                        startTime = new Date();
                        placeMines(i, j);
                        calculateNumbers();
                        startTimer();
                    } else {
                        if (!loss) {
                            if (!board[i][j].flagged && !board[i][j].suspect) {
                                board[i][j].flagged = true;
                                ++cellFlagged;
                            } else if (
                                board[i][j].flagged &&
                                !board[i][j].suspect
                            ) {
                                board[i][j].suspect = true;
                                board[i][j].flagged = false;
                                --cellFlagged;
                                ++cellSuspect;
                            } else if (
                                !board[i][j].flagged &&
                                board[i][j].suspect
                            ) {
                                board[i][j].suspect = false;
                                --cellSuspect;
                            }
                            drawBoard();
                            document.getElementById(
                                "cell-flagged"
                            ).textContent = " " + cellFlagged + "/" + mineCount;
                            document.getElementById(
                                "cell-suspected"
                            ).textContent = " " + cellSuspect;
                        } else return;
                    }
                };
            })(i, j);
            if (board[i][j].revealed) {
                if (board[i][j].mine) {
                    if (board[i][j].flagged) {
                        cell.className = "cell true-flag";
                    } else {
                        cell.className = "cell mine fa-solid fa-bomb";
                    }
                } else if (board[i][j].number > 0) {
                    cell.className = "cell number";
                    cell.textContent = board[i][j].number;
                } else {
                    cell.className = "cell empty";
                }
            } else if (board[i][j].flagged) {
                cell.className = "cell flagged";
            } else if (board[i][j].suspect) {
                cell.className = "cell suspect";
            }
            boardDiv.appendChild(cell);
        }
        boardDiv.appendChild(document.createElement("br"));
    }
}

function revealCell(x, y) {
    if (
        x >= 0 &&
        x < size &&
        y >= 0 &&
        y < size &&
        !board[x][y].revealed &&
        !board[x][y].flagged
    ) {
        board[x][y].revealed = true;
        if (board[x][y].mine) {
            checkLoss();
            return;
        }
        if (board[x][y].number == 0) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    revealCell(x + dx, y + dy);
                }
            }
        }
    }
}

function checkWin() {
    let win = true;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!board[i][j].mine && !board[i][j].revealed) {
                win = false;
                break;
            }
        }
    }
    if (win) {
        let endTime = new Date();
        let timeTaken = (endTime - startTime) / 1000;
        let score = scoreCalculator(timeTaken, win);
        setTimeout(function () {
            alert("Congratulation for the winner! Score: " + score);
            var name = prompt("Enter your name: ");
            checkHallOfFame(score, name);
            if (score > highScore) {
                highScore = score;
                let highScoreDiv = document.getElementById("highScore");
                highScoreDiv.textContent =
                    "Best: " + name + " (" + highScore + ")";
                localStorage.setItem("highScore", highScore);
                localStorage.setItem("bestPlayer", name);
            }
            resetGame();
        }, 100);
    }
    return win;
}

function addHallOfFame(score, name, pos) {
    for (var i = 9; i >= pos; --i) {
        var playerName = localStorage.getItem("hofName" + i);
        var playerScore = localStorage.getItem("hofScore" + i);
        localStorage.setItem("hofName" + (i + 1), playerName);
        localStorage.setItem("hofScore" + (i + 1), playerScore);
    }

    localStorage.setItem("hofName" + pos, name);
    localStorage.setItem("hofScore" + pos, score);
}

function checkHallOfFame(score, name) {
    for (var i = 0; i < 10; ++i) {
        var playerScore = localStorage.getItem("hofScore" + i);
        if (score > playerScore || playerScore === null) {
            addHallOfFame(score, name, i);
            return;
        }
    }
}

function revealMines() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j].mine) board[i][j].revealed = true;
        }
    }
}

function checkFlagged() {
    let correctCount = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j].flagged) {
                if (board[i][j].mine) ++correctCount;
            }
        }
    }
    return correctCount;
}

function checkRevealed() {
    let revealCount = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j].revealed) ++revealCount;
        }
    }
    return revealCount;
}

function checkLoss() {
    loss = false;
    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            if (board[i][j].mine && board[i][j].revealed) {
                let endTime = new Date();
                let timeTaken = (endTime - startTime) / 1000;
                let score = scoreCalculator(timeTaken, false);
                revealMines();
                drawBoard();
                setTimeout(function () {
                    clearInterval(timerInterval);
                    clearInterval(intervalId);
                }, 100);
                alert("You lost! Score: " + score);
                var name = prompt("Enter your name: ");
                checkHallOfFame(score, name);
                if (score > highScore) {
                    highScore = score;
                    let highScoreDiv = document.getElementById("highScore");

                    highScoreDiv.textContent =
                        "Best: " + name + " (" + highScore + ")";
                    localStorage.setItem("highScore", highScore);
                    localStorage.setItem("bestPlayer", name);
                }
                loss = true;

                break;
            }
        }
        if (loss) break;
    }
    return loss;
}

function resetGame() {
    clearInterval(timerInterval);
    // showNotification('game started');
    clearInterval(intervalId);
    document.getElementById("timer").innerHTML =
        '<i class="fa-solid fa-stopwatch"></i>' + " 00:00";
    isPlaying = false;
    loss = false;
    board = [];
    startTime = null;
    cellFlagged = 0;
    cellSuspect = 0;
    document.getElementById("cell-flagged").textContent =
        " " + cellFlagged + "/" + mineCount;
    document.getElementById("cell-suspected").textContent = " " + cellSuspect;
    createBoard();
    calculateNumbers();
    drawBoard();
}

function startTimer() {
    isPlaying = true;
    timerInterval = setInterval(function () {
        let now = new Date();
        let timeElapsed = Math.floor((now - startTime) / 1000);
        let minutes = Math.floor(timeElapsed / 60);
        let seconds = timeElapsed % 60;
        document.getElementById("timer").innerHTML =
            '<i class="fa-solid fa-stopwatch"></i>' +
            " " +
            pad(minutes) +
            ":" +
            pad(seconds);
    }, 1000);
}

function pad(number) {
    return number < 10 ? "0" + number : number;
}

function calculateDifficulty(size, mineCount) {
    return mineCount / (0.2 * size * size);
}

function scoreCalculator(timeTaken, win) {
    let cellRevealed = 0;
    let mineFlagged = 0;

    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            if (board[i][j].flagged && board[i][j].mine) ++mineFlagged;
            if (board[i][j].revealed && !board[i][j].mine) ++cellRevealed;
        }
    }
    let timeBonus = 0;
    let standardTime = (size * size * mineCount) / 20;
    if (win) {
        timeBonus = Math.max(0, (standardTime - timeTaken) / standardTime);
        mineFlagged = mineCount;
    }
    let baseScore = cellRevealed * 2 + mineFlagged * 5;
    let difficultyScore = baseScore * calculateDifficulty(size, mineCount);
    let totalScore = Math.round(difficultyScore + timeBonus * difficultyScore);
    console.log("timeBonus: " + timeBonus);
    if (!win) totalScore = totalScore - Math.round(timeBonus * difficultyScore);
    return totalScore;
}
window.onload = function () {
    resetGame();
};

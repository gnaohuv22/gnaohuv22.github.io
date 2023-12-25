var board = [];
var size = parseInt(document.getElementById("size").value);
var mineCount = parseInt(document.getElementById("mine").value);
var startTime;
var isPlaying = false;
var highScore = localStorage.getItem("highScore") || Infinity;
document.getElementById("highScore").textContent = "High score: " + highScore;
var timerInterval;
document.getElementById("size").addEventListener("input", function (e) {
    var max = parseInt(e.target.max);

    if (e.target.value > max) {
        e.target.value = max;
    }

    if (e.target.value < 2) {
        e.target.value = 5;
    }
});

document.getElementById("mine").addEventListener("input", function (e) {
    var size = parseInt(document.getElementById("size").value);

    if (e.target.value > size * (size - 1)) {
        e.target.value = size * (size - 1);
    }

    if (e.target.value == 0) {
        e.target.value = 1;
    }
});

function setValue() {
    if (isPlaying) {
        alert("Cannot change value while a game is in progress");
        return;
    }
    // var prevSize = size;
    // var prevMineCount = mineCount;
    size = parseInt(document.getElementById("size").value);
    mineCount = parseInt(document.getElementById("mine").value);

    document.getElementById("errMsg").innerHTML = "";
    resetGame();
}

function resetHighScore() {
    highScore = Infinity;
    document.getElementById("highScore").textContent =
        "High score: " + highScore;
}

function createBoard() {
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                mine: false,
                number: 0,
                revealed: false,
                flagged: false,
                x: i,
                y: j,
                id: i + "-" + j,
            };
        }
    }
}

function placeMines(exceptX, exceptY) {
    var availableCells = [];
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (i !== exceptX || j != exceptY) {
                availableCells.push({ x: i, y: j });
            }
        }
    }
    for (var i = 0; i < mineCount; i++) {
        var index = Math.floor(Math.random() * availableCells.length);
        var cell = availableCells.splice(index, 1)[0];
        board[cell.x][cell.y].mine = true;
    }
}

function calculateNumbers() {
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (!board[i][j].mine) {
                var mines = 0;
                for (var dx = -1; dx <= 1; dx++) {
                    for (var dy = -1; dy <= 1; dy++) {
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
    var boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var cell = document.createElement("div");
            cell.className = "cell hidden";
            cell.onclick = (function (i, j) {
                return function () {
                    if (!startTime) {
                        startTime = new Date();
                        placeMines(i, j);
                        calculateNumbers();
                        startTimer();
                    }
                    revealCell(i, j);
                    drawBoard();
                    checkWin();
                };
            })(i, j);
            cell.oncontextmenu = (function (i, j) {
                return function (e) {
                    e.preventDefault();
                    board[i][j].flagged = !board[i][j].flagged;
                    drawBoard();
                };
            })(i, j);
            if (board[i][j].revealed) {
                if (board[i][j].mine) {
                    cell.className = "cell mine";
                } else if (board[i][j].number > 0) {
                    cell.className = "cell number";
                    cell.textContent = board[i][j].number;
                } else {
                    cell.className = "cell empty";
                }
            } else if (board[i][j].flagged) {
                cell.className = "cell flagged";
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
            for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                    revealCell(x + dx, y + dy);
                }
            }
        }
    }
}

function checkWin() {
    var win = true;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (!board[i][j].mine && !board[i][j].revealed) {
                win = false;
                break;
            }
        }
    }
    if (win) {
        var endTime = new Date();
        var timeTaken = (endTime - startTime) / 1000;
        setTimeout(function () {
            alert("You win! Time taken: " + timeTaken + " seconds");
            if (timeTaken < highScore) {
                highScore = timeTaken;
                var highScoreDiv = document.getElementById("highScore");
                var minutes = Math.floor(highScore / 60);
                var seconds = highScore % 60;
                highScoreDiv.textContent =
                    "High score: " + pad(minutes) + ":" + pad(seconds);
                localStorage.setItem("highScore", highScore);
                alert("New high score!");
            }
            resetGame();
        }, 100);
    }
}

function revealMines() {
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (board[i][j].mine) {
                board[i][j].revealed = true;
            }
        }
    }
}

function checkLoss() {
    for (var i = 0; i < size; ++i) {
        for (var j = 0; j < size; ++j) {
            if (board[i][j].mine && board[i][j].revealed) {
                revealMines();
                drawBoard();
                setTimeout(function () {
                    alert("You lost! Clicked on a mine.");
                    resetGame();
                }, 100);
                return;
            }
        }
    }
}

function resetGame() {
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = "Time: 00:00";
    isPlaying = false;
    board = [];
    startTime = null;
    createBoard();
    calculateNumbers();
    drawBoard();
}

function startTimer() {
    isPlaying = true;
    timerInterval = setInterval(function () {
        var now = new Date();
        var timeElapsed = Math.floor((now - startTime) / 1000);
        var minutes = Math.floor(timeElapsed / 60);
        var seconds = timeElapsed % 60;
        document.getElementById("timer").textContent =
            "Time: " + pad(minutes) + ":" + pad(seconds);
    }, 1000);
}

function pad(number) {
    return number < 10 ? "0" + number : number;
}

resetGame();

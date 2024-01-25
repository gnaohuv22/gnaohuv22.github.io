var board = [];
var size = parseInt(document.getElementById("size").value);

var mineCount = parseInt(document.getElementById("mine").value);
var startTime;
var isPlaying = false;
var highScore = localStorage.getItem("highScore") || 0;
var highScoreDiv = document.getElementById("highScore");
highScoreDiv.textContent = "Best: " + highScore;
var timerInterval;
var intervalId;
var cellFlagged = 0;
var cellSuspect = 0;

var loss;
document.getElementById("size").addEventListener("input", function (e) {
    var max = parseInt(e.target.max);
    var size = parseInt(document.getElementById("size").value);
    document.getElementById("mine").value = Math.floor(size * size * 0.2 - (size / 10));

    if (e.target.value > max) {
        e.target.value = max;
        document.getElementById("mine").value = Math.floor(max * max * 0.2 - (size / 10));
    }

    if (e.target.value < 1) {
        e.target.value = 5;
        document.getElementById("mine").value = Math.floor(5 * 5 * 0.2 - (size / 10));
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
        alert("Cannot change value while a game is in progress.");
        return;
    }
    // var prevSize = size;
    // var prevMineCount = mineCount;
    size = parseInt(document.getElementById("size").value);
    mineCount = parseInt(document.getElementById("mine").value);

    if (size < 5)
        document.getElementById("errMsg").innerHTML =
            "Please set size to 5 or greater to setup table.";
    else {
        document.getElementById("errMsg").innerHTML = "";
        resetGame();
    }
}

function resetHighScore() {
    highScore = 0;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").textContent = "Best: " + highScore;
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
                suspect: false,
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
                    if (board[i][j].flagged) {
                        board[i][j].flagged = !board[i][j].flagged;
                    }


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
                            } else if (board[i][j].flagged && !board[i][j].suspect) {
                                board[i][j].suspect = true;
                                board[i][j].flagged = false;
                                --cellFlagged;
                                ++cellSuspect;
                            } else if (!board[i][j].flagged && board[i][j].suspect) {
                                board[i][j].suspect = false;
                                --cellSuspect;
                            }
                            drawBoard();
                            document.getElementById('cell-flagged').textContent = ' ' + cellFlagged + '/' + mineCount;
                            document.getElementById('cell-suspected').textContent = ' ' + cellSuspect;
                        } else return;
                    }
                };
            })(i, j);
            if (board[i][j].revealed) {
                if (board[i][j].mine) {
                    if (board[i][j].flagged) {
                        cell.className = "cell true-flag";
                    } else {
                        cell.className = "cell mine";
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
        var score = scoreCalculator(timeTaken, win);
        setTimeout(function () {
            alert("Congratulation for the winner! Score: " + score);
            if (score > highScore) {
                highScore = score;
                var highScoreDiv = document.getElementById("highScore");

                highScoreDiv.textContent = "Best: " + highScore;
                localStorage.setItem("highScore", highScore);
            }
            resetGame();
        }, 100);
    }
    return win;
}

function revealMines() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j].mine) board[i][j].revealed = true;
        }
    }
}

function checkFlagged() {
    var correctCount = 0;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (board[i][j].flagged) {
                if (board[i][j].mine) ++correctCount;
            }
        }
    }
    return correctCount;
}

function checkRevealed() {
    var revealCount = 0;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (board[i][j].revealed) ++revealCount;
        }
    }
    return revealCount;
}

function checkLoss() {
    loss = false;
    for (var i = 0; i < size; ++i) {
        for (var j = 0; j < size; ++j) {
            if (board[i][j].mine && board[i][j].revealed) {
                var endTime = new Date();
                var timeTaken = (endTime - startTime) / 1000;
                var score = scoreCalculator(timeTaken, false);
                revealMines();
                drawBoard();
                setTimeout(function () {
                    clearInterval(timerInterval);
                    clearInterval(intervalId);
                }, 100);
                alert("You lost! Score: " + score);
                if (score > highScore) {
                    highScore = score;
                    var highScoreDiv = document.getElementById("highScore");

                    highScoreDiv.textContent = "Best: " + highScore;
                    localStorage.setItem("highScore", highScore);
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
    clearInterval(intervalId);
    document.getElementById("timer").textContent = "Time: 00:00";
    isPlaying = false;
    loss = false;
    board = [];
    startTime = null;
    cellFlagged = 0;
    cellSuspect = 0;
    document.getElementById('cell-flagged').textContent = ' ' + cellFlagged + '/' + mineCount;
    document.getElementById('cell-suspected').textContent = ' ' + cellSuspect;
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

function calculateDifficulty(size, mineCount) {
    return mineCount / (0.2 * size * size);
}

function scoreCalculator(timeTaken, win) {
    var cellRevealed = 0;
    var mineFlagged = 0;

    for (var i = 0; i < size; ++i) {
        for (var j = 0; j < size; ++j) {
            if (board[i][j].flagged && board[i][j].mine) ++mineFlagged;
            if (board[i][j].revealed && !board[i][j].mine) ++cellRevealed;
        }
    }
    var timeBonus = 0;
    var standardTime = size * size * mineCount / 20;
    if (win) {
        timeBonus = Math.max(0, (standardTime - timeTaken) / standardTime);
        mineFlagged = mineCount;
    }
    var baseScore = cellRevealed * 2 + mineFlagged * 5;
    var difficultyScore = baseScore * calculateDifficulty(size, mineCount);
    var totalScore = Math.round(difficultyScore + timeBonus * difficultyScore);
    console.log("timeBonus: " + timeBonus);
    if (!win) totalScore = totalScore - Math.round(timeBonus * difficultyScore);
    return totalScore;
}
resetGame();

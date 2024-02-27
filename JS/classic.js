let board = [];
document.getElementById("size").value = localStorage.getItem("size") || 10;
document.getElementById("mine").value = localStorage.getItem("mine") || 18;

let size = parseInt(document.getElementById("size").value);
let mineCount = parseInt(document.getElementById("mine").value);

let playbotDiv = document.getElementById("playbot");

let startTime;
let timerInterval;
let intervalId;

let isPlaying = false;
let cellFlagged = 0;
let cellSuspect = 0;
let botPlaying = false;
var sliderValue = document.getElementById("myRange").value;

let loss;
let win;

let highScore = localStorage.getItem("highScore") || 0;
let highScoreDiv = document.getElementById("highScore");
highScoreDiv.textContent = "Best: " + highScore;

let lastClickTime = 0;
const delay = 100; // Time interval in milliseconds

function displayValue(value) {
    var sliderValue = document.getElementById("sliderValue");
    sliderValue.style.display = "block";
    sliderValue.innerHTML = value / 1000 + "s";
    var slider = document.getElementById("myRange");
    var rect = slider.getBoundingClientRect();
    var sliderValueRect = sliderValue.getBoundingClientRect();
    sliderValue.style.left =
        rect.left +
        ((slider.value - slider.min) / (slider.max - slider.min)) * rect.width -
        sliderValueRect.width / 2 +
        "px";
    // sliderValue.style.top = rect.top - sliderValue.offsetHeight + "px";
}

function showValue() {
    var sliderValue = document.getElementById("sliderValue");
    sliderValue.style.display = "block";
}

function hideValue() {
    var sliderValue = document.getElementById("sliderValue");
    sliderValue.style.display = "none";
}

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

    if (e.target.value > Math.round(size * size * 0.22)) {
        e.target.value = Math.round(size * size * 0.22);
    }

    if (e.target.value == 0) {
        e.target.value = 1;
    }
});

function setValue() {
    if (!isPlaying || loss || win) {
        // let prevSize = size;
        // let prevMineCount = mineCount;
        size = parseInt(document.getElementById("size").value);
        mineCount = parseInt(document.getElementById("mine").value);

        if (size < 5)
            showMsg("Please set size to 5 or greater to setup table.");
        else {
            showMsg("Value changed!");
            localStorage.setItem("size", size);
            localStorage.setItem("mine", mineCount);
            resetGame();
        }
    } else {
        showMsg("Cannot change value while a game is in progress.");
        return;
    }
}

function resetValue() {
    if (!isPlaying || loss || win) {
        document.getElementById("size").value = 10;
        document.getElementById("mine").value = 18;
        localStorage.setItem("size", 10);
        localStorage.setItem("mine", 18);
        size = 10;
        mineCount = 18;
        playbotDiv.style.pointerEvents = "all";
        playbotDiv.style.opacity = "1";
        resetGame();
    } else {
        showMsg("Cannot reset value while a game is in progress.");
        return;
    }
}

function resetHighScore() {
    let password = prompt("Please enter password to delete high score.");
    // confirm('Do you want to reset the high score? This can\'t be undone?');
    if (password === "developerdeptraivl") {
        showMsg("Reset successful.");
        highScore = 0;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highScore").textContent = "Best: " + highScore;
        for (var i = 1; i <= 10; ++i) {
            localStorage.setItem("hofScore" + i, "");
            localStorage.setItem("hofTime" + i, "");
            localStorage.setItem("hofState" + i, "");
        }
    }
}

function resetGame() {
    clearInterval(timerInterval);
    // showNotification('game started');
    clearInterval(intervalId);
    document.getElementById("timer").innerHTML =
        '<i class="fa-solid fa-stopwatch"></i>' + " 00:00";
    isPlaying = false;
    loss = false;
    win = false;
    board = [];
    startTime = null;
    cellFlagged = 0;
    cellSuspect = 0;
    botPlaying = false;
    playbotDiv.style.pointerEvents = "all";
    playbotDiv.style.opacity = "1";
    document.getElementById("cell-flagged").textContent =
        " " + cellFlagged + "/" + mineCount;
    document.getElementById("cell-suspected").textContent = " " + cellSuspect;
    createBoard();
    calculateNumbers();
    drawBoard();
    console.clear();
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

function pad(number) {
    return number < 10 ? "0" + number : number;
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
    if (!win) totalScore = totalScore - Math.round(timeBonus * difficultyScore);
    return totalScore;
}

function checkWin() {
    win = true;
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
            showMsg("Congratulation to the winner! Score: " + score);
            setTimeout(function () {
                clearInterval(timerInterval);
                clearInterval(intervalId);
            }, 1);
            if (!botPlaying) {
                checkHallOfFame(score, timeTaken, "W");
                if (score > highScore) {
                    highScore = score;
                    let highScoreDiv = document.getElementById("highScore");
                    highScoreDiv.textContent = "Best: " + highScore;
                    localStorage.setItem("highScore", highScore);
                }
            }
            // resetGame();
        }, 100);
    }
    return win;
}

function checkWinWithoutAlert() {
    let win = true;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!board[i][j].mine && !board[i][j].revealed) {
                win = false;
                break;
            }
        }
    }
    return win;
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
                showMsg("You lost! Score: " + score);
                if (!botPlaying) {
                    checkHallOfFame(score, timeTaken, "L");
                    if (score > highScore && !botPlaying) {
                        highScore = score;
                        let highScoreDiv = document.getElementById("highScore");

                        highScoreDiv.textContent = "Best: " + highScore;
                        localStorage.setItem("highScore", highScore);
                    }
                    loss = true;
                }

                break;
            }
        }
        if (loss) break;
    }
    return loss;
}

function checkLossWithoutAlert() {
    loss = false;
    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            if (board[i][j].mine && board[i][j].revealed) {
                loss = true;
                break;
            }
        }
        if (loss) break;
    }
    return loss;
}

function addHallOfFame(score, pos, timeTaken, win) {
    for (var i = 9; i >= pos; --i) {
        var playerScore = localStorage.getItem("hofScore" + i);
        var time = localStorage.getItem("hofTime" + i);
        var state = localStorage.getItem("hofState" + i);
        localStorage.setItem("hofScore" + (i + 1), playerScore);
        localStorage.setItem("hofTime" + (i + 1), time);
        localStorage.setItem("hofState" + (i + 1), state);
    }

    localStorage.setItem("hofScore" + pos, score);
    localStorage.setItem("hofTime" + pos, timeTaken);
    localStorage.setItem("hofState" + pos, win);
}

function checkHallOfFame(score, timeTaken, win) {
    for (var i = 1; i <= 10; ++i) {
        var playerScore = localStorage.getItem("hofScore" + i);
        var time = localStorage.getItem("hofTime" + i);
        if (score > playerScore || playerScore === null) {
            addHallOfFame(score, i, timeTaken, win);
            return;
        } else if (score === playerScore && timeTaken < time) {
            addHallOfFame(score, i, timeTaken, win);
            return;
        }
    }
}

window.onload = function () {
    resetGame();
};

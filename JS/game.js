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

function startTimer() {
    isPlaying = true;
    playbotDiv.style.pointerEvents = "none";
    playbotDiv.style.opacity = "0.6";
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

function drawBoard() {
    let boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let cell = document.createElement("div");
            cell.className = "cell hidden";
            if (!botPlaying) {
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

                        if (!loss && !win) {
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
                            if (!loss && !win) {
                                if (
                                    !board[i][j].flagged &&
                                    !board[i][j].suspect &&
                                    !board[i][j].revealed
                                ) {
                                    board[i][j].flagged = true;
                                    ++cellFlagged;
                                } else if (
                                    board[i][j].flagged &&
                                    !board[i][j].suspect &&
                                    !board[i][j].revealed
                                ) {
                                    board[i][j].suspect = true;
                                    board[i][j].flagged = false;
                                    --cellFlagged;
                                    ++cellSuspect;
                                } else if (
                                    !board[i][j].flagged &&
                                    board[i][j].suspect &&
                                    !board[i][j].revealed
                                ) {
                                    board[i][j].suspect = false;
                                    --cellSuspect;
                                }

                                drawBoard();
                                document.getElementById(
                                    "cell-flagged"
                                ).textContent =
                                    " " + cellFlagged + "/" + mineCount;
                                document.getElementById(
                                    "cell-suspected"
                                ).textContent = " " + cellSuspect;
                            } else return;
                        }
                    };
                })(i, j);
            }
            if (board[i][j].revealed) {
                if (board[i][j].mine) {
                    if (board[i][j].flagged) {
                        cell.className =
                            "cell true-flag fa-solid fa-check fa-xl";
                    } else {
                        cell.className = "cell mine fa-solid fa-bomb";
                    }
                } else if (board[i][j].number > 0) {
                    cell.classList.remove("hidden");
                    cell.classList.add("number");
                    cell.textContent = board[i][j].number;
                } else {
                    cell.classList.remove("hidden");
                    cell.classList.add("empty");
                }
            } else if (board[i][j].flagged) {
                cell.classList.remove("hidden");
                cell.classList.add("flagged");
                cell.classList.add("fa-solid");
                cell.classList.add("fa-flag");
                cell.classList.add("fa-lg");
            } else if (board[i][j].suspect) {
                cell.classList.remove("hidden");
                cell.classList.add("suspect");
                cell.classList.add("fa-solid");
                cell.classList.add("fa-question");
                cell.classList.add("fa-lg");
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

function revealMines() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j].mine) board[i][j].revealed = true;
        }
    }
}
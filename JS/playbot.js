var openedCells = [
    {
        x: 0,
        y: 0,
    },
];
while (openedCells.length != 0) {
    openedCells.pop();
}
var probability = [[]];
var dX = [-1, 0, 1, -1, 1, -1, 0, 1];
var dY = [-1, -1, -1, 0, 0, 1, 1, 1];

function playBot() {
    if (checkLoss() || startTime) {
        alert("Please restart the game before let the bot play.");
        return;
    }
    while (openedCells.length != 0) {
        openedCells.pop();
    }
    var x =
      Math.round(Math.random() * board.length);
    var y = 
     Math.round(Math.random() * board[0].length);
    if (!startTime) {
        startTime = new Date();
        placeMines(x, y);
        calculateNumbers();
        startTimer();
    }
    revealCell(x, y);
    drawBoard();
    checkWin();

    intervalId = setInterval(function () {
        // function spaceKeyDown(e) {
        // if (e.code === "Space") {
            // e.preventDefault();
            //Set the default probability values
            for (var i = 0; i < board.length; ++i) {
                // if (probability[i] === undefined) {
                probability[i] = [];
                // }

                for (var j = 0; j < board[0].length; ++j) {
                    if (probability[i][j] === undefined) {
                        probability[i][j] = 0.0;
                    }
                }
            }

            // openedCells.push({ x: 1, y: 1 });
            for (var i = 0; i < board.length; i++) {
                for (var j = 0; j < board[0].length; j++) {
                    if (isOpenedCells(i, j)) {
                        openedCells.push({
                            x: i,
                            y: j,
                        });
                    }
                }
            }

            makeDecision();
            if (checkWin() || checkLossWithoutAlert()) {
                clearInterval(intervalId);
                // window.removeEventListener("keydown", spaceKeyDown);
                return;
            }
        // }
    }, 300);
    // }

    // window.addEventListener("keydown", spaceKeyDown);
}

function countSurrounded(posX, posY) {
    // console.log('pos: ', posX, posY);
    var count = 0;
    for (var i = 0; i < 8; ++i) {
        var x = posX + dX[i];
        var y = posY + dY[i];
        // console.log(x, y);
        if (x < 0 || y < 0 || x >= board.length || y >= board[0].length)
            ++count;
        else {
            if (board[x][y].revealed || board[x][y].flagged) ++count;
        }
    }
    return count;
}

function isOpenedCells(x, y) {
    return board[x][y].revealed && countSurrounded(x, y) < 8;
}

// function validMove(x, y) {
//     if (!board[x][y].revealed) return false;
//     return (
//         board[x][y].number > 0 && board[x][y].revealed && surroundedCell(x, y)
//     );
// }

function mineRemaining(cellX, cellY) {
    var number = board[cellX][cellY].number;
    for (var i = 0; i < 8; ++i) {
        var x = cellX + dX[i];
        var y = cellY + dY[i];
        if (x >= 0 && y >= 0 && x < board.length && y < board[0].length) {
            if (board[x][y].flagged) --number;
        }
    }
    return number;
}

var opened = false;

function makeDecision() {
    for (var cell of openedCells) {
        var unopenedCount = 0;
        var flaggedCells = 0;
        //get flagged cells and unrevealed cells
        for (var i = 0; i < 8; ++i) {
            var x = cell.x + dX[i];
            var y = cell.y + dY[i];
            if (x >= 0 && y >= 0 && x < board.length && y < board[0].length) {
                if (!board[x][y].revealed && !board[x][y].flagged)
                    ++unopenedCount;
                if (board[x][y].flagged) ++flaggedCells;
            }
        }

        // console.log('makeDecision ' + cell.x + ', ' + cell.y);
        // console.log("flaggedCells", flaggedCells);
        // console.log("unopenedCount", unopenedCount);
        //calculate probability of unopened cells
        var number = mineRemaining(cell.x, cell.y);
        if (number === 0) {
            for (var i = 0; i < 8; ++i) {
                var x = cell.x + dX[i];
                var y = cell.y + dY[i];
                if (
                    x >= 0 &&
                    y >= 0 &&
                    x < board.length &&
                    y < board[0].length
                ) {
                    if (!board[x][y].revealed && !board[x][y].flagged) {
                        revealCell(x, y);
                        drawBoard();
                        opened = true;
                        // console.log(
                        //     "p[" + x + "][" + y + "] = ",
                        //     probability[x][y]
                        // );
                    }
                }
            }
        } else {
            for (var i = 0; i < 8; ++i) {
                var x = cell.x + dX[i];
                var y = cell.y + dY[i];
                if (
                    x >= 0 &&
                    y >= 0 &&
                    x < board.length &&
                    y < board[0].length
                ) {
                    if (!board[x][y].revealed && !board[x][y].flagged) {
                        probability[x][y] = Math.max(
                            probability[x][y],
                            number / (unopenedCount * 1.0)
                        );
                        // console.log(
                        //     "p[" + x + "][" + y + "] = ",
                        //     probability[x][y]
                        // );
                    }
                }
            }
        }
    }

    //Get the unopened cells with 0 and 100% probability
    if (openedCells.length > 0) {
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[0].length; ++j) {
                var x = i;
                var y = j;
                if (probability[x][y] === 1.0) {
                    board[x][y].flagged = true;
                    drawBoard();
                }
            }
        }
    }

    //If there are no cells revealed, open the least probability one
    if (!opened) {
        var pos = { x: -1, y: -1 };
        var min = 1;
        for (var cell of openedCells) {
            for (var i = 0; i < 8; ++i) {
                var x = cell.x + dX[i];
                var y = cell.y + dY[i];
                if (
                    x >= 0 &&
                    y >= 0 &&
                    x < board.length &&
                    y < board[0].length &&
                    !board[x][y].revealed
                ) {
                    if (probability[x][y] < min && probability[x][y] !== 0.0) {
                        min = probability[x][y];
                        pos.x = x;
                        pos.y = y;
                    }
                }
            }
        }
        console.log("min: ", min);
        if (pos.x === -1) {
            pos.x = Math.round(Math.random() * board.length);
            pos.y = Math.round(Math.random() * board[0].length);
            while (
                board[pos.x][pos.y].revealed ||
                board[pos.x][pos.y].flagged
            ) {
                pos.x = Math.round(Math.random() * board.length);
                pos.y = Math.round(Math.random() * board[0].length);
            }
        }
        console.log(probability);
        console.log(
            "Chosen: " +
                pos.x +
                ", " +
                pos.y +
                " with probability " +
                probability[pos.x][pos.y]
        );
        revealCell(pos.x, pos.y);
        drawBoard();
    }

    opened = false;

    //Remove the cell surrounded by opened/revealed/flagged cells
    while (openedCells.length != 0) {
        openedCells.pop();
    }
}

// playBot();

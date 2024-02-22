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
    sliderValue = document.getElementById("myRange").value;

    if (checkLossWithoutAlert() || startTime) {
        alert("Please restart the game before let the bot play.");
        return;
    }
    while (openedCells.length != 0) {
        openedCells.pop();
    }
    resetGame();
    var x = Math.round(Math.random() * (board.length - 1));
    var y = Math.round(Math.random() * (board[0].length - 1));
    if (!startTime) {
        startTime = new Date();
        placeMines(x, y);
        calculateNumbers();
        startTimer();
        botPlaying = true;
        
    }
    revealCell(x, y);
    drawBoard();
    checkWin();

    if (sliderValue === undefined) sliderValue === 1000;
    intervalId = setInterval(function () {
        // function spaceKeyDown(e) {
        // if (e.code === "Space") {
        // e.preventDefault();
        //Set the default probability values
        for (var i = 0; i < board.length; ++i) {
            probability[i] = [];

            for (var j = 0; j < board[0].length; ++j) {
                if (probability[i][j] === undefined) {
                    probability[i][j] = -1.0;
                }
            }
        }

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
            playbotDiv.style.pointerEvents = "all";
            playbotDiv.style.opacity = "1";
            // window.removeEventListener("keydown", spaceKeyDown);
            return;
        }
        // }
    }, sliderValue);
    // }

    // window.addEventListener("keydown", spaceKeyDown);
}

function countSurrounded(posX, posY) {
    var count = 0;
    for (var i = 0; i < 8; ++i) {
        var x = posX + dX[i];
        var y = posY + dY[i];
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
                    ++cellFlagged;
                    document.getElementById(
                        "cell-flagged"
                    ).textContent =
                        " " + cellFlagged + "/" + mineCount;
                    drawBoard();
                }
            }
        }
    }

    //If there are no cells revealed, open the least probability one
    var minProbCells = [
        {
            x: -1,
            y: -1,
        },
    ];
    minProbCells.pop();
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
                    if (probability[x][y] === min) {
                        minProbCells.push({ x: x, y: y });
                    }
                    if (probability[x][y] < min && probability[x][y] !== -1.0) {
                        while (minProbCells.length != 0) minProbCells.pop();
                        min = probability[x][y];
                        minProbCells.push({ x: x, y: y });
                    }
                }
            }
        }
        if (minProbCells.length === 0) {
            pos.x = Math.round(Math.random() * (board.length - 1));
            pos.y = Math.round(Math.random() * (board[0].length - 1));
            while (
                board[pos.x][pos.y].revealed ||
                board[pos.x][pos.y].flagged
            ) {
                pos.x = Math.round(Math.random() * (board.length - 1));
                pos.y = Math.round(Math.random() * (board[0].length - 1));
                revealCell(pos.x, pos.y);
            }
        } else {
            minProbCells.sort(function (a, b) {
                return (
                    getUnopenedCellsAround(a.x, a.y).length -
                    getUnopenedCellsAround(b.x, b.y).length
                );
            });
            let index = Math.round(Math.random() * (minProbCells.length - 1));
            revealCell(minProbCells[index].x, minProbCells[index].y);
        }

        drawBoard();
    }

    opened = false;

    //Remove the cell surrounded by opened/revealed/flagged cells
    while (openedCells.length != 0) {
        openedCells.pop();
    }
}

function getUnopenedCellsAround(cell) {
    var unopenedCells = [
        {
            x: 0,
            y: 0,
        },
    ];
    unopenedCells.pop();

    for (var i = 0; i < 8; ++i) {
        var x = cell.x + dX[i];
        var y = cell.y + dY[i];
        if (
            x >= 0 &&
            y >= 0 &&
            x < board.length &&
            y < board[0].length &&
            !board[x][y].revealed
        )
            unopenedCells.push({ x: x, y: y });
    }
    return unopenedCells;
}

function generateMineConfigurations(numCells, numMines) {
    var configurations = [];
    for (var i = 0; i < Math.pow(2, numCells); i++) {
        var binary = (i >>> 0).toString(2).padStart(numCells, "0");
        if ((binary.match(/1/g) || []).length === numMines) {
            configurations.push(binary.split("").map(Number));
        }
    }
    return configurations;
}

function calculateConfigurationProbability(configuration) {
    var numMines = configuration.reduce((a, b) => a + b, 0);
    return numMines / configuration.length;
}

function advancedProbabilisticAnalysis() {
    //For each opened cell...
    for (var cell of openedCells) {
        var unopenedCells = getUnopenedCellsAround(cell);

        var mineAround = mineRemaining(cell.x, cell.y);

        //Generate all possible mine configurations around this cell
        var mineConfigurations = generateMineConfigurations(
            unopenedCells.length,
            mineAround
        );

        //For each configuration...
        for (var configuration of mineConfigurations) {
            //Calculate probability of this configuration
            var configurationProb =
                calculateConfigurationProbability(configuration);

            //Update the probabilities of the unopened cells accordingly
            for (var i = 0; i < unopenedCells.length; i++) {
                var x = unopenedCells[i].x;
                var y = unopenedCells[i].y;
                probability[x][y] = Math.max(
                    probability[x][y],
                    configurationProb
                );
            }
        }
    }
}

function makeAdvancedDecision() {
    //Calculate probabilities
    advancedProbabilisticAnalysis();

    var minProbCells = [
        {
            x: null,
            y: null,
        },
    ];
    minProbCells.pop();
    var pos = null;
    var minProb = 1;
    for (var i = 0; i < board.length; ++i) {
        for (var j = 0; j < board[0].length; ++j) {
            if (
                !board[i][j].revealed &&
                probability[i][j] <= minProb &&
                probability[i][j] !== -1.0
            ) {
                if (minProb === probability[i][j]) {
                    minProbCells.push({ x: i, y: j });
                } else {
                    minProb = probability[i][j];
                    while (minProbCells.length != 0) minProbCells.pop();
                    minProbCells.push({ x: i, y: j });
                }
            }
        }
    }
    if (minProbCells.length === 0) {
        pos.x = Math.round(Math.random() * (board.length - 1));
        pos.y = Math.round(Math.random() * (board[0].length - 1));
        while (board[pos.x][pos.y].revealed || board[pos.x][pos.y].flagged) {
            pos.x = Math.round(Math.random() * (board.length - 1));
            pos.y = Math.round(Math.random() * (board[0].length - 1));
            revealCell(pos.x, pos.y);
        }
    } else {
        minProbCells.sort(function (a, b) {
            return (
                getUnopenedCellsAround(a.x, a.y).length -
                getUnopenedCellsAround(b.x, b.y).length
            );
        });
        let index = Math.round(Math.random() * (minProbCells.length - 1));
        revealCell(minProbCells[index].x, minProbCells[index].y);
    }

    drawBoard();

    //Remove the cell surrounded by opened/revealed/flagged cells
    while (openedCells.length != 0) {
        openedCells.pop();
    }
}

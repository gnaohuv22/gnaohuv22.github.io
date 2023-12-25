function playBot() {
    var unopenedCells = getUnopenedCells();
    var constraints = getConstraints();

    var assignments = cspSolver(unopenedCells, constraints);
    if (assignments) {
        var index = 0;
        var intervalId = setInterval(function () {
            var cell = unopenedCells[index];
            if (assignments[cell.id] === "mine") {
                cell.flagged = true;
            } else {
                revealCell(cell.x, cell.y);
            }
            drawBoard();
            index++;
            if (index >= unopenedCells.length) {
                clearInterval(intervalId);
            }
        }, 300); // Thay đổi số này để điều chỉnh thời gian trễ
    }
}

function getUnopenedCells() {
    var unopenedCells = [];
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (!board[i][j].revealed && !board[i][j].flagged) {
                unopenedCells.push(board[i][j]);
            }
        }
    }
    return unopenedCells;
}

function getSurroundingCells(x, y) {
    var surroundingCells = [];
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            var newX = x + dx;
            var newY = y + dy;
            if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
                surroundingCells.push(board[newX][newY]);
            }
        }
    }
    return surroundingCells;
}

function getConstraints() {
    var constraints = [];
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (board[i][j].revealed && board[i][j].number > 0) {
                var surroundingCells = getSurroundingCells(i, j);
                constraints.push({
                    cells: surroundingCells,
                    count: board[i][j].number,
                });
            }
        }
    }
    return constraints;
}

function cspSolver(variables, constraints) {
    var assignments = {};

    function backtrack(index) {
        if (index === variables.length) {
            return true; // Tất cả các biến đều đã được gán
        }

        var cell = variables[index];

        for (var value of ["mine", "safe"]) {
            assignments[cell.id] = value;
            if (isConsistent(cell, value, assignments, constraints)) {
                var result = backtrack(index + 1);
                // console.log(assignments, cell.id);
                if (result) {
                    return result;
                }
            }
        }

        delete assignments[cell.id];
        return false;
    }

    function isConsistent(cell, value, assignments, constraints) {
        // Tạo một bản sao của các gán để kiểm tra tính nhất quán
        var testAssignments = Object.assign({}, assignments);
        testAssignments[cell.id] = value;

        for (var constraint of constraints) {
            var mines = 0;
            for (var constrainedCell of constraint.cells) {
                if (testAssignments[constrainedCell.id] === "mine") {
                    mines++;
                }
            }
            console.log(constraint.count);
            // Nếu số lượng bom vượt quá số lượng cho phép, gán này không nhất quán
            if (mines > constraint.count) {
                return false;
            }
        }

        // Nếu không có ràng buộc nào bị vi phạm, gán này là nhất quán
        return true;
    }

    if (backtrack(0)) {
        return assignments;
    } else {
        return null;
    }
}

// if (!startTime) {
//     startTime = new Date();
//     placeMines(1, 1);
//     calculateNumbers();
//     startTimer();
// }
// revealCell(1, 1);
// drawBoard();
// checkWin();
// playBot();

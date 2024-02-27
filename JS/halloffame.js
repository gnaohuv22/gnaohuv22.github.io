document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

function convertTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.round(time % 60);
    return minutes + "m" + seconds + "s";
}

function goBack() {
    window.history.back();
}

for (var i = 1; i <= 10; ++i) {
    let score = localStorage.getItem("hofScore" + i);
    let timeTaken = localStorage.getItem("hofTime" + i);
    let state = localStorage.getItem("hofState" + i);
    let hofTable = document.getElementById("hof");
    let row = document.createElement("tr");

    let position = document.createElement("td");
    position.textContent = i;

    let playerScore = document.createElement("td");
    playerScore.textContent = score;

    let scorePerMin = document.createElement("td");
    scorePerMin.textContent = ((score / timeTaken) * 60.0).toFixed(1);

    timeTaken = convertTime(timeTaken);
    let playerTime = document.createElement("td");
    playerTime.textContent = timeTaken;

    let playerState = document.createElement("td");
    playerState.textContent = state;

    switch (i) {
        case 1:
            position.className = "first-place";
            position.textContent = i + 'st';
            playerScore.className = "first-place";
            playerTime.className = "first-place";
            scorePerMin.className = "first-place";
            playerState.className = "first-place";
            break;
        case 2:
            position.className = "second-place";
            position.textContent = i + 'nd';
            playerScore.className = "second-place";
            playerTime.className = "second-place";
            scorePerMin.className = "second-place";
            playerState.className = "second-place";
            break;
        case 3:
            position.className = "third-place";
            position.textContent = i + 'rd';
            playerScore.className = "third-place";
            playerTime.className = "third-place";
            scorePerMin.className = "third-place";
            playerState.className = "third-place";
            break;
        default:
            position.className = "other";
            position.textContent = i + 'th';
            playerScore.className = "other";
            playerTime.className = "other";
            scorePerMin.className = "other";
            playerState.className = "other";
    }

    row.appendChild(position);
    row.appendChild(playerScore);
    row.appendChild(playerTime);
    row.appendChild(scorePerMin);
    row.appendChild(playerState);
    hofTable.appendChild(row);
}

function pad(number) {
    return number < 10 ? "0" + number : number;
}
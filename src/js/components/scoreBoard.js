const buildScoreBoard = (data) => {
    const scoreBoard = document.getElementById("score-board");
    data.scores.forEach((score, i) => {
        const scoreContainerId = `score-${i}`;
        let scoreContainer = document.getElementById(scoreContainerId);
        if (!scoreContainer) {
            scoreContainer = document.createElement("div");
            scoreContainer.id = scoreContainerId;
            scoreBoard.appendChild(scoreContainer);
        }
        const votedNextGame = `${score.voted ? "🚀" : ""}`;
        const won = `${score.won ? "🎉" : ""}`
        const scoreDisplay = `${votedNextGame}${won}${score.playerId}: ${score.score}`;
        if (data.playerTurn === score.playerId) {
            scoreContainer.innerHTML = `<b>${scoreDisplay}</b>`;
        } else {
            scoreContainer.innerHTML = scoreDisplay;
        }

        if (data.playerId === score.playerId) {
            scoreContainer.classList.add("player-reset-game");
        } else {
            scoreContainer.classList.remove("player-reset-game");
        }
    })
    for (let i = scoreBoard.children.length - 1; i >= data.scores.length; i--) {
        scoreBoard.removeChild(scoreBoard.children[i]);
    }
}

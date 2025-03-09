const buildScoreBoard = (data) => {
    const scoreBoard = document.getElementById("score-board");
    data.scores.forEach((score, i) => {
        const scoreContainerId = `score-${i}`;
        let scoreContainer = document.getElementById(scoreContainerId);
        if (!scoreContainer) {
            scoreContainer = document.createElement("div");
            scoreContainer.id = `score-${i}`;
            scoreBoard.appendChild(scoreContainer);
        }
        if (data.playerTurn === score.playerId) {
            scoreContainer.innerHTML = `<b>${score.won ? "🎉 " : ""}${score.playerId}: ${score.score}</b>`;
        } else {
            scoreContainer.innerHTML = `${score.won ? "🎉 " : ""}${score.playerId}: ${score.score}`;
        }
    })
    for (let i = scoreBoard.children.length - 1; i >= data.scores.length; i--) {
        scoreBoard.removeChild(scoreBoard.children[i]);
    }
}

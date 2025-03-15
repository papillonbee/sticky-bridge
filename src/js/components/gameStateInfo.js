const buildGameStateInfo = (data) => {
    const gameStateInfo = document.getElementById("game-state-info");
    const tooltip = gameStateInfo.querySelector(".tooltip");
    if (!data.bidWinner) {
        tooltip.innerHTML = "No bid winner yet!";
        return;
    }
    let text = `${data.bidWinner} won the bid with ${data.bidLevel}`;
    if (data.trumpSuit) {
        text += `${data.trumpSuit}`;
    } else {
        text += ` no trump`;
    }
    if (!data.partner) {
        tooltip.innerHTML = text;
        return;
    }
    text += `<br>and called partner ${data.partner}`;
    tooltip.innerHTML = text;
}

const setupGameStateInfoClick = () => {
    const gameStateInfo = document.getElementById("game-state-info");
    gameStateInfo.addEventListener("click", (event) => {
        event.target.classList.toggle("active");
        event.stopPropagation();
    });
}

const setupGameStateInfoOutsideClick = () => {
    const gameStateInfo = document.getElementById("game-state-info");
    document.addEventListener("click", () => {
        gameStateInfo.classList.remove("active");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupGameStateInfoClick();
    setupGameStateInfoOutsideClick();
});

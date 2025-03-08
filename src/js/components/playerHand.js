const buildPlayerHand = (data) => {
    const cardIds = data.playerHand;
    const playerHandContainer = document.getElementById("player-hand");
    cardIds.forEach((cardId, i) => {
        let existingCard = Array.from(playerHandContainer.children).find(card => card.getAttribute("cid") === cardId);
        if (!existingCard) {
            let newCard = document.createElement("playing-card");
            newCard.setAttribute("cid", cardId);
            newCard.setAttribute("cardcolor", "rgb(221, 213, 213)");
            if (i < playerHandContainer.children.length) {
                playerHandContainer.insertBefore(newCard, playerHandContainer.children[i]);
            } else {
                playerHandContainer.appendChild(newCard);
            }
        }
    });
    Array.from(playerHandContainer.children).forEach(playerCard => {
        const cardId = playerCard.getAttribute("cid");
        if (!cardIds.includes(cardId)) {
            playerHandContainer.removeChild(playerCard);
        }
    });
};

window.buildPlayerHand = buildPlayerHand;

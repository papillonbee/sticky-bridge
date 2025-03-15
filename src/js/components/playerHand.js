const buildPlayerHand = (data) => {
    const cardIds = data.playerHand;
    const playerHandContainer = document.getElementById("player-hand");
    const existingCards = Array.from(playerHandContainer.children);

    // First, remove cards that are no longer in the hand
    existingCards.forEach(playerCard => {
        const cardId = playerCard.getAttribute("cid");
        if (!cardIds.includes(cardId)) {
            playerHandContainer.removeChild(playerCard);
        }
    });

    // Then, ensure cards are in correct order
    cardIds.forEach((cardId, targetIndex) => {
        let card = Array.from(playerHandContainer.children).find(card => card.getAttribute("cid") === cardId);
        
        if (!card) {
            // Create new card if it doesn't exist
            card = document.createElement("playing-card");
            card.setAttribute("cid", cardId);
            card.setAttribute("cardcolor", "rgb(221, 213, 213)");
        }

        // Move or insert card to correct position
        const currentIndex = Array.from(playerHandContainer.children).indexOf(card);
        if (currentIndex === -1) {
            // New card: insert at correct position
            if (targetIndex < playerHandContainer.children.length) {
                playerHandContainer.insertBefore(card, playerHandContainer.children[targetIndex]);
            } else {
                playerHandContainer.appendChild(card);
            }
        } else if (currentIndex !== targetIndex) {
            // Existing card: move to correct position
            playerHandContainer.insertBefore(card, playerHandContainer.children[targetIndex]);
        }
    });
};

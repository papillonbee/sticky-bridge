const buildGameStateHistory = (data) => {
    buildBids(data);
    buildPartner(data);
    buildTricks(data);
    const gameStateHistoryContainer = document.getElementById("game-state-history");
    requestAnimationFrame(() => {
        gameStateHistoryContainer.scrollTop = gameStateHistoryContainer.scrollHeight;
    });
}

const buildBids = (data) => {
    const bids = data.bids;
    const bidsContainer = document.getElementById("bids");
    
    const playerBidTurnContainerId = `player-bid-turn`;
    let playerBidTurnContainer = document.getElementById(playerBidTurnContainerId);
    if (!data.playerActions.includes(PLAYER_ACTION.BID)) {
        if (playerBidTurnContainer) {
            bidsContainer.removeChild(playerBidTurnContainer);
        }
    }

    bids.forEach((bid, i) => {
        const bidContainerId = `bid-${i}`;
        let bidContainer = Array.from(bidsContainer.children).find(bidContainer => bidContainer.id === bidContainerId);
        if (!bidContainer) {
            bidContainer = document.createElement("div");
            bidContainer.id = bidContainerId;
            bidsContainer.appendChild(bidContainer);
        }
        if (bid.bid) {
            bidContainer.innerHTML = `${bid.playerId} bids ${bid.bid}`;
        } else {
            bidContainer.innerHTML = `${bid.playerId} passes`;
        }
    });
    Array.from(bidsContainer.children).forEach((bidContainer, i) => {
        if (i >= bids.length) {
            bidsContainer.removeChild(bidContainer);
        }
    });

    if (data.playerActions.includes(PLAYER_ACTION.BID)) {
        playerBidTurnContainer = document.getElementById(playerBidTurnContainerId);
        if (!playerBidTurnContainer) {
            playerBidTurnContainer = document.createElement("div");
            playerBidTurnContainer.id = playerBidTurnContainerId;
            bidsContainer.appendChild(playerBidTurnContainer);
        }
        playerBidTurnContainer.innerHTML = `<b>Your turn to bid!</b>`;
    }
}

const buildPartner = (data) => {
    const partner = data.partner;
    const partnerContainer = document.getElementById("partner");
    if (partner) {
        const chosenPartnerContainerId = `chosen-partner`;
        let chosenPartnerContainer = Array.from(partnerContainer.children).find(child => child.id === chosenPartnerContainerId);
        if (!chosenPartnerContainer) {
            chosenPartnerContainer = document.createElement("div");
            chosenPartnerContainer.id = chosenPartnerContainerId;
            partnerContainer.appendChild(chosenPartnerContainer);
        }
        chosenPartnerContainer.innerHTML = `${data.bidWinner} chooses ${partner}`;
    }
    Array.from(partnerContainer.children).forEach(child => {
        if (!partner) {
            partnerContainer.removeChild(child);
        }
    });

    buildPlayerChoosePartnerTurn(data);
}

const buildPlayerChoosePartnerTurn = (data) => {
    const partnerContainer = document.getElementById("partner");
    const playerChoosePartnerTurnContainerId = `player-choose-partner-turn`;
    let playerChoosePartnerTurnContainer = document.getElementById(playerChoosePartnerTurnContainerId);
    if (data.playerActions.includes(PLAYER_ACTION.CHOOSE_PARTNER)) {
        if (!playerChoosePartnerTurnContainer) {
            playerChoosePartnerTurnContainer = document.createElement("div");
            playerChoosePartnerTurnContainer.id = playerChoosePartnerTurnContainerId;
            partnerContainer.appendChild(playerChoosePartnerTurnContainer);
        }
        playerChoosePartnerTurnContainer.innerHTML = `<b>Your turn to choose partner!</b>`;
    } else {
        if (playerChoosePartnerTurnContainer) {
            partnerContainer.removeChild(playerChoosePartnerTurnContainer);
        }
    }
}

const buildTricks = (data) => {
    const tricks = data.tricks;
    const tricksContainer = document.getElementById("tricks");
    tricks.forEach((trick, i) => {
        const playerTricksContainerId = `player-tricks-${i}`;
        let playerTricksContainer = Array.from(tricksContainer.children).find(playerTricksContainer => playerTricksContainer.id === playerTricksContainerId);
        if (!playerTricksContainer) {
            playerTricksContainer = document.createElement("div");
            playerTricksContainer.id = playerTricksContainerId;
            tricksContainer.appendChild(playerTricksContainer);
        }
        buildPlayerTricks(playerTricksContainer, trick.playerTricks);
    });
    Array.from(tricksContainer.children).forEach((playerTricksContainer, i) => {
        if (i >= tricks.length) {
            tricksContainer.removeChild(playerTricksContainer);
        }
    });
}

const buildPlayerTricks = (playerTricksContainer, playerTricks) => {
    playerTricks.forEach((playerTrick, j) => {
        const playerId = document.getElementById("player-id");
        let playerCard = Array.from(playerTricksContainer.children).find(card => card.getAttribute("cid") === playerTrick.trick);
        if (!playerCard) {
            playerCard = document.createElement("playing-card");
            playerCard.setAttribute("cid", playerTrick.trick);

            if (playerTrick.playerId === playerId.value) {
                playerCard.setAttribute("cardcolor", "rgb(221, 213, 213)");
            }

            if (j < playerTricksContainer.children.length) {
                playerTricksContainer.insertBefore(playerCard, playerTricksContainer.children[j]);
            } else {
                playerTricksContainer.appendChild(playerCard);
            }
        } else {
            if (!playerCard.getAttribute("cardcolor") && playerTrick.playerId === playerId.value) {
                playerTricksContainer.removeChild(playerCard);
                playerCard = document.createElement("playing-card");
                playerCard.setAttribute("cid", playerTrick.trick);
                playerCard.setAttribute("cardcolor", "rgb(221, 213, 213)");
            }
            if (playerCard.getAttribute("cardcolor") && playerTrick.playerId !== playerId.value) {
                playerTricksContainer.removeChild(playerCard);
                playerCard = document.createElement("playing-card");
                playerCard.setAttribute("cid", playerTrick.trick);
            }
            if (j < playerTricksContainer.children.length) {
                playerTricksContainer.insertBefore(playerCard, playerTricksContainer.children[j]);
            } else {
                playerTricksContainer.appendChild(playerCard);
            }
        }
        playerCard.setAttribute("winner-card", playerTrick.won);
        playerCard.setAttribute("player-id", playerTrick.playerId);
    })
    Array.from(playerTricksContainer.children).forEach(playerCard => {
        const cardId = playerCard.getAttribute("cid");
        if (!playerTricks.map(playerTrick => playerTrick.trick).includes(cardId)) {
            playerTricksContainer.removeChild(playerCard);
        }
    });
}

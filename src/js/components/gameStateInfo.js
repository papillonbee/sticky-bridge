const buildGameStateInfo = (data) => {
    const gameStateInfo = document.getElementById("game-state-info");
    const tooltip = gameStateInfo.querySelector(".tooltip");
    if (!data.bidWinner) {
        tooltip.innerHTML = "No bid winner yet!";
        return;
    }

    const getBidInfo = () => {
        const trumpInfo = data.trumpSuit ? data.trumpSuit : " no trump";
        const bidWinner = data.playerId === data.bidWinner ? "You" : data.bidWinner;
        return `${bidWinner} won the bid with ${data.bidLevel}${trumpInfo}`;
    };

    const getPartnerInfo = () => {
        if (!data.partner) return "";
        return `<br>and called partner ${data.partner}.`;
    };

    const calculateSetsToWin = () => {
        const isOnBidWinningTeam =
            data.playerId === data.bidWinner ||
            data.playerHand.includes(data.partner) ||
            data.playerId === data.partnerPlayerId;

        return isOnBidWinningTeam ? data.bidLevel + 6 : 13 - (data.bidLevel + 6) + 1;
    };

    const determinePartner = () => {
        if (data.playerHand.includes(data.partner)) return ` ${data.bidWinner}`;
        if (!data.partnerPlayerId) return "<br>your partner";
        
        if (data.playerId === data.bidWinner) return ` ${data.partnerPlayerId}`;
        if (data.playerId === data.partnerPlayerId) return ` ${data.bidWinner}`;

        const playerIds = data.scores.map(score => score.playerId);
        const partnerId = playerIds.find(playerId =>
            playerId !== data.playerId &&
            playerId !== data.bidWinner &&
            playerId !== data.partnerPlayerId
        );
        return ` ${partnerId}`;
    };

    const buildTooltipText = () => {
        let text = getBidInfo();
        text += getPartnerInfo();
        
        if (!data.partner) return text;

        const setsToWin = calculateSetsToWin();
        const partner = determinePartner();
        return `${text}<br>You have to win at least<br>${setsToWin} sets together with${partner}!`;
    };

    tooltip.innerHTML = buildTooltipText();
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

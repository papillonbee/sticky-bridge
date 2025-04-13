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
        return isOnBidWinningTeam() ? data.bidLevel + 6 : 13 - (data.bidLevel + 6) + 1;
    };

    const isOnBidWinningTeam = () => isBidWinner() || isHoldingPartnerCard() || isPartnerPlayer();
    
    const isBidWinner = () => data.playerId === data.bidWinner;
    const isHoldingPartnerCard = () => data.playerHand.includes(data.partner);
    const isPartnerPlayer = () => data.playerId === data.partnerPlayerId;

    const determinePartner = () => {
        if (isHoldingPartnerCard()) {
            return isBidWinner() ? " by yourself" : ` together with ${data.bidWinner}`;
        }
        if (!data.partnerPlayerId) return " together with<br>your partner";

        if (isBidWinner() && isPartnerPlayer()) return " by yourself";
        
        if (isBidWinner()) return ` together with ${data.partnerPlayerId}`;

        if (isPartnerPlayer()) return ` together with ${data.bidWinner}`;

        const otherTeamMembers = data.scores
            .map(score => score.playerId)
            .filter(playerId =>
                playerId !== data.playerId &&
                playerId !== data.bidWinner &&
                playerId !== data.partnerPlayerId
            )
            .join(" and ");
        return ` together with ${otherTeamMembers}`;
    };

    const buildTooltipText = () => {
        let text = getBidInfo();
        text += getPartnerInfo();
        
        if (!data.partner) return text;

        const setsToWin = calculateSetsToWin();
        const setsText = setsToWin === 1 ? " set" : " sets";
        const partner = determinePartner();
        return `${text}<br>You have to win at least<br>${setsToWin}${setsText}${partner}!`;
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

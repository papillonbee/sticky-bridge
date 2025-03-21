// DOM Utilities
const getElement = id => document.getElementById(id);
const getModal = name => getElement(`${name}-modal`);
const getPlayerHand = () => getElement("player-hand");

// State Management
const createGameState = () => ({
    selectedPlayingCard: null,
    selectedAutoPlayingCard: null,
});

let gameState = createGameState();

// API Response Handler
const handleApiResponse = (response, errorMessage = "Failed to connect to game") => {
    if (!response || (response.code !== 0 && response.code !== 10019 && response.code !== 10002)) {
        alert(response?.msg || errorMessage);
        return false;
    }
    return true;
};

// Connection Management
const connect = async (apiClient, wsClient, event) => {
    event.preventDefault();
    const elements = {
        button: event.target.querySelector("button"),
        gameInput: getElement("game-id"),
        playerInput: getElement("player-id"),
    };

    if (elements.gameInput.value.includes(" ") || elements.playerInput.value.includes(" ")) {
        alert("Game and Player cannot contain whitespaces!");
        return;
    }

    const toggleElements = disabled => 
        Object.values(elements).forEach(el => el.disabled = disabled);

    toggleElements(true);
    try {
        wsClient.setIntentionalReconnect(true);

        if (await initializeGame(apiClient)) {
            await wsClient.connect(
                event => handleWsMessage(apiClient, event),
                () => handleWsReopen(apiClient),
            );
        }
    } finally {
        toggleElements(false);
    }
};

const initializeGame = async (apiClient) => {
    const createResponse = await apiClient.createGame();
    if (!handleApiResponse(createResponse)) return false;

    if (createResponse.code === 10019) {
        const joinResponse = await apiClient.joinGame();
        if (!handleApiResponse(joinResponse)) return false;
    }

    const viewResponse = await apiClient.viewGame();
    if (!handleApiResponse(viewResponse)) return false;

    await updateGameState(apiClient, viewResponse.data);
    return true;
};

// WebSocket Handlers
const handleWsMessage = async (apiClient, event) => {
    const msg = JSON.parse(event.data);
    if (msg.messageType === MESSAGE_TYPE.CHAT) {
        addMessage(msg.message);
        event.preventDefault();
    }
    if (msg.messageType === MESSAGE_TYPE.GAME) {
        await updateGameState(apiClient, JSON.parse(msg.message));
    }
};

const handleWsReopen = async (apiClient) => {
    const retry = async (attempts = 0, maxAttempts = 3) => {
        if (attempts >= maxAttempts) {
            alert("Failed to refresh game state after multiple attempts");
            return;
        }

        try {
            const viewResponse = await apiClient.viewGame();
            if (viewResponse?.code === 0) {
                await updateGameState(apiClient, viewResponse.data);
                return;
            }
            const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
            await retry(attempts + 1, maxAttempts);
        } catch (error) {
            console.error("ViewGame error:", error);
            await retry(attempts + 1, maxAttempts);
        }
    };

    await retry();
};

// Game State Updates
const updateGameState = async (apiClient, data) => {
    buildPlayerHand(data);
    buildGameStateHistory(data);
    buildGameStateInfo(data);
    buildScoreBoard(data);
    buildModals(apiClient, data);
    await handleAutoPlay(apiClient, data);
};

// Chat Functions
const addMessage = text => {
    const messages = getElement("messages");
    const li = document.createElement("li");
    li.textContent = text;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
};

const sendMessage = (wsClient, event) => {
    event.preventDefault();
    if (!wsClient.connected()) {
        alert("Not connected to game");
        return;
    }
    const input = getElement("messageText");
    wsClient.send(JSON.stringify({
        messageType: MESSAGE_TYPE.CHAT,
        message: input.value
    }));
    input.value = "";
};

// Modal Management
const buildModals = (apiClient, data) => {
    buildBidModal(data);
    buildChoosePartnerModal(data);
    buildPlayCardModal(apiClient, data);
    buildAutoPlayCardModal(data);
    buildNextGameModal(data);
};

const handleModalAction = async (modalName, action) => {
    const modal = getModal(modalName);
    const success = await action();
    if (success) {
        modal.style.display = "none";
    }
    return success;
};

// Bid Functions
const buildBidModal = data => {
    const container = getElement("player-bid-turn");
    if (data.playerActions.includes(PLAYER_ACTION.BID)) {
        container.addEventListener("click", openBidModal);
    }
};

const openBidModal = event => {
    event.stopPropagation();
    openModal(getModal("bid"), event.currentTarget);
};

const sendBid = async (apiClient, event) => {
    event.preventDefault();
    const bidInput = getBidInput(event);
    if (!bidInput) return;

    return handleModalAction("bid", async () => {
        const response = await apiClient.bid(bidInput);
        return handleApiResponse(response);
    });
};

const getBidInput = event => {
    const clickedButton = event.submitter.value;
    if (clickedButton === "pass") return BID.PASS;
    if (clickedButton === "bid") {
        const level = document.querySelector('input[name="bid-level"]:checked');
        const suit = document.querySelector('input[name="bid-suit"]:checked');
        if (!level || !suit) return null;
        return `${level.value}${suit.value}`;
    }
    return null;
};

// Partner Selection Functions
const buildChoosePartnerModal = data => {
    const container = getElement("player-choose-partner-turn");
    if (data.playerActions.includes(PLAYER_ACTION.CHOOSE_PARTNER)) {
        container.addEventListener("click", openChoosePartnerModal);
    }
};

const openChoosePartnerModal = event => {
    event.stopPropagation();
    openModal(getModal("choose-partner"), event.currentTarget);
};

const sendChoosePartner = async (apiClient, event) => {
    event.preventDefault();
    const partnerInput = getElement("partner-card").value;
    if (!partnerInput) return;

    return handleModalAction("choose-partner", async () => {
        const response = await apiClient.partner(partnerInput.toUpperCase());
        return handleApiResponse(response);
    });
};

// Card Playing Functions
const buildPlayCardModal = (apiClient, data) => {
    const isPlayerTurn = data.playerActions.includes(PLAYER_ACTION.TRICK);
    updateCardListeners(isPlayerTurn, openPlayCardModal);

    const playCardBtn = getElement("play-card-btn");
    playCardBtn.replaceWith(playCardBtn.cloneNode(true));
    getElement("play-card-btn").addEventListener("click", 
        () => isPlayerTurn && playCard(apiClient));
};

const openPlayCardModal = event => {
    event.stopPropagation();
    gameState.selectedPlayingCard = event.currentTarget;
    closeModal(getModal("auto-play-card"));
    openModal(getModal("play-card"), gameState.selectedPlayingCard);
};

const playCard = async apiClient => {
    if (!gameState.selectedPlayingCard) return;

    return handleModalAction("play-card", async () => {
        const trickInput = gameState.selectedPlayingCard.getAttribute("cid");
        const response = await apiClient.trick(trickInput);
        return handleApiResponse(response);
    });
};

// Auto Play Functions
const buildAutoPlayCardModal = data => {
    const gameReadyForPlay = data.bidWinner && data.partner;
    if (!gameReadyForPlay && gameState.selectedAutoPlayingCard) {
        gameState.selectedAutoPlayingCard.classList.remove("selected-auto-play");
        gameState.selectedAutoPlayingCard = null;
    }

    const gameReadyForAutoPlay = gameReadyForPlay && !data.playerActions.includes(PLAYER_ACTION.TRICK);
    updateCardListeners(gameReadyForAutoPlay, openAutoPlayCardModal);

    const autoPlayCardBtn = getElement("auto-play-card-btn");
    autoPlayCardBtn.replaceWith(autoPlayCardBtn.cloneNode(true));
    getElement("auto-play-card-btn").addEventListener("click", 
        () => gameReadyForAutoPlay && selectAutoPlayingCard());
};

const openAutoPlayCardModal = event => {
    event.stopPropagation();

    const clickedCard = event.currentTarget;
    const autoPlayCardModal = getModal("auto-play-card");
    autoPlayCardModal.setAttribute("clicked-card-id", clickedCard.getAttribute("cid"));

    const autoPlayCardBtn = getElement("auto-play-card-btn");
    autoPlayCardBtn.innerHTML = clickedCard.classList.contains("selected-auto-play") 
        ? "Cancel" 
        : "Auto<br>play";

    closeModal(getModal("play-card"));
    openModal(autoPlayCardModal, clickedCard);
};

const selectAutoPlayingCard = () => {
    const autoPlayCardModal = getModal("auto-play-card");
    const cardId = autoPlayCardModal.getAttribute("clicked-card-id");
    const clickedCard = Array.from(getPlayerHand().children)
        .find(card => card.getAttribute("cid") === cardId);
    console.log(clickedCard);
    if (!clickedCard) return;

    Array.from(getPlayerHand().children).forEach(card => {
        if (clickedCard !== card) {
            card.classList.remove("selected-auto-play");
        }
    });

    clickedCard.classList.toggle("selected-auto-play");
    gameState.selectedAutoPlayingCard = clickedCard.classList.contains("selected-auto-play")
       ? clickedCard
        : null;
    getModal("auto-play-card").style.display = "none";
};

const handleAutoPlay = async (apiClient, data) => {
    const card = gameState.selectedAutoPlayingCard;
    if (!card?.classList.contains("selected-auto-play") || 
        !data.playerActions.includes(PLAYER_ACTION.TRICK)) return;

    card.classList.remove("selected-auto-play");
    gameState.selectedAutoPlayingCard = null;

    const trickInput = card.getAttribute("cid");
    const response = await apiClient.trick(trickInput);

    handleApiResponse(response);
};

// Next Game Functions
const buildNextGameModal = data => {
    const scoreBoard = getElement("score-board");
    Array.from(scoreBoard.children).forEach(container => {
        if (container.classList.contains("player-reset-game") && 
            data.playerActions.includes(PLAYER_ACTION.RESET)) {
            container.addEventListener("click", openNextGameModal);
        } else {
            container.removeEventListener("click", openNextGameModal);
        }
    });
};

const openNextGameModal = event => {
    event.stopPropagation();
    openModal(getModal("next-game"), event.currentTarget);
};

const sendNextGame = async (apiClient, event) => {
    event.preventDefault();
    return handleModalAction("next-game", async () => {
        const response = await apiClient.resetGame();
        return handleApiResponse(response);
    });
};

// Utility Functions
const updateCardListeners = (condition, handler) => {
    Array.from(getPlayerHand().children).forEach(card => {
        card.removeEventListener("click", handler);
        if (condition) {
            card.addEventListener("click", handler);
        }
    });
};

// Game Service Creation
const createGameService = (apiClient, wsClient) => ({
    connect: event => connect(apiClient, wsClient, event),
    sendMessage: event => sendMessage(wsClient, event),
    sendBid: event => sendBid(apiClient, event),
    sendChoosePartner: event => sendChoosePartner(apiClient, event),
    sendNextGame: event => sendNextGame(apiClient, event),
});

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    window.gameService = createGameService(
        window.bridgeServiceApiClient,
        window.bridgeServiceWsClient,
    );
});

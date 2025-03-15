const buildBridgeServiceRequest = () => {
    const gameId = document.getElementById("game-id").value;
    const playerId = document.getElementById("player-id").value;
    return (!gameId || !playerId) ? undefined : { gameId, playerId };
};

const requestBridgeService = async (url, data) => {
    if (!data) return;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return error;
    }
};

const createEndpointCaller = (endpoint) => async (config, additionalData = {}) => {
    const url = `${config.getBridgeServiceRestUrl()}/game/${endpoint}`;
    const baseData = buildBridgeServiceRequest();
    const data = { ...baseData, ...additionalData };
    return requestBridgeService(url, data);
};

const createGame = createEndpointCaller("create");
const joinGame = createEndpointCaller("join");
const viewGame = createEndpointCaller("view");
const bid = createEndpointCaller("bid");
const partner = createEndpointCaller("partner");
const trick = createEndpointCaller("trick");
const resetGame = createEndpointCaller("reset");

const createBridgeServiceApiClient = (config) => ({
    createGame: () => createGame(config),
    joinGame: () => joinGame(config),
    viewGame: () => viewGame(config),
    bid: (bidData) => bid(config, { bid: bidData }),
    partner: (partnerData) => partner(config, { partner: partnerData }),
    trick: (trickData) => trick(config, { trick: trickData }),
    resetGame: () => resetGame(config),
});

document.addEventListener("DOMContentLoaded", () => {
    window.bridgeServiceApiClient = createBridgeServiceApiClient(window.bridgeServiceConfig);
});

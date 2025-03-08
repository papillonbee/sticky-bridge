const getBridgeServiceRestUrl = (config) => 
    `${config.BRIDGE_SERVICE_REST_PROTOCOL}://${config.BRIDGE_SERVICE_URL}`;

const getBridgeServiceWebSocketUrl = (config) =>  {
    const gameId = document.getElementById("game-id").value;
    const playerId = document.getElementById("player-id").value;
    if (!gameId || !playerId) {
        return undefined;
    }
    return `${config.BRIDGE_SERVICE_WEB_SOCKET_PROTOCOL}://${config.BRIDGE_SERVICE_URL}/ws/${gameId}/${playerId}`;
}

const createBridgeServiceConfig = (config) => ({
    getBridgeServiceRestUrl: () => getBridgeServiceRestUrl(config),
    getBridgeServiceWebSocketUrl: () => getBridgeServiceWebSocketUrl(config)
});

document.addEventListener("DOMContentLoaded", () => {
    window.bridgeServiceConfig = createBridgeServiceConfig(window.CONFIG);
});

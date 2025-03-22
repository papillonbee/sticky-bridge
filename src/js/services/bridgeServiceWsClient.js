const createBridgeServiceWsClient = (config) => {
    let ws = null;
    let healthCheckInterval = null;

    let intentionalReconnect = false;

    let onMessageHandler = null;
    let onReopenHandler = null;

    const connect = (onMessage, onReopen) => {
        onMessageHandler = onMessage;
        onReopenHandler = onReopen;

        if (ws) {
            ws.close();
        }

        ws = new WebSocket(config.getBridgeServiceWebSocketUrl());
        setupWebSocketHandlers();
        startHealthCheck();
    };

    const startHealthCheck = () => {
        if (healthCheckInterval) {
            clearInterval(healthCheckInterval);
        }
        healthCheckInterval = setInterval(() => {
            console.log("checking WebSocket health");
            if (!connected()) {
                console.log("WebSocket disconnected, attempting to reconnect...");
                connect(onMessageHandler, onReopenHandler);
            }
        }, 5000);
    };

    const connected = () => {
        return ws && ws.readyState === WebSocket.OPEN;
    }

    const setupWebSocketHandlers = () => {
        ws.onmessage = handleMessage;
        ws.onclose = handleClose;
        ws.onopen = handleOpen;
        ws.onerror = handleError;
    };

    const handleMessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.messageType === MESSAGE_TYPE.PING) {
            send(JSON.stringify({messageType: MESSAGE_TYPE.PONG}));
            return;
        }
        await onMessageHandler(event);
    }

    const handleClose = (event) => {
        console.log("WebSocket closed:", event);
    };

    const handleOpen = async (event) => {
        console.log("WebSocket opened:", event);

        if (intentionalReconnect) {
            intentionalReconnect = false;
            return;
        }
        await onReopenHandler(event);
    };

    const handleError = (event) => {
        console.log("WebSocket error:", event);
    }

    const send = (message) => {
        if (!ws) return false;
        ws.send(message);
        return true;
    };

    return {
        connect,
        connected,
        send,
        setIntentionalReconnect: (value) => intentionalReconnect = value,
    };
};

document.addEventListener("DOMContentLoaded", () => {
    window.bridgeServiceWsClient = createBridgeServiceWsClient(window.bridgeServiceConfig);
});

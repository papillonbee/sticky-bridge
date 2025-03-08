const createBridgeServiceWsClient = (config) => {
    let ws = null;
    let reconnectAttempts = 0;
    let maxReconnectAttempts = 5;
    let reconnectTimeout = null;

    let intentionalClose = false;
    let intentionalReconnect = false;

    let onMessageHandler = null;
    let onReconnectHandler = null;
    let onMaxReconnectHandler = null;
    let onReopenHandler = null;

    const connect = (onMessage, onReconnect, onMaxReconnect, onReopen) => {
        onMessageHandler = onMessage;
        onReconnectHandler = onReconnect;
        onMaxReconnectHandler = onMaxReconnect;
        onReopenHandler = onReopen;

        if (ws) {
            intentionalClose = true;
            ws.close();
        }

        ws = new WebSocket(config.getBridgeServiceWebSocketUrl());
        setupWebSocketHandlers();
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
        await onMessageHandler(event);
    }

    const handleClose = (event) => {
        console.log("WebSocket closed:", event);
        if (intentionalClose) {
            intentionalClose = false;
            return;
        }

        if (reconnectAttempts < maxReconnectAttempts) {
            const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            onReconnectHandler(event, backoffDelay);
            reconnectTimeout = setTimeout(() => {
                reconnectAttempts++;
                connect(onMessageHandler, onReconnectHandler, onMaxReconnectHandler, onReopenHandler);
            }, backoffDelay);
        } else {
            onMaxReconnectHandler(event);
        }
    };

    const handleOpen = async (event) => {
        console.log("WebSocket opened:", event);
        reconnectAttempts = 0;
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

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
        setIntentionalReconnect: (value) => intentionalReconnect = value
    };
};

document.addEventListener("DOMContentLoaded", () => {
    window.bridgeServiceWsClient = createBridgeServiceWsClient(window.bridgeServiceConfig);
});

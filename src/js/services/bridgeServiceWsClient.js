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

    let lastPingTime = Date.now();
    const pingTimeout = 30000;
    const checkConnectionTime = 10000;

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
        const msg = JSON.parse(event.data);
        if (msg.messageType === MESSAGE_TYPE.PING) {
            send(JSON.stringify({messageType: MESSAGE_TYPE.PONG}));
            updateLastPingTime();
            return;
        }
        await onMessageHandler(event);
    }

    const updateLastPingTime = () => {
        lastPingTime = Date.now();
    }

    const handleClose = (event) => {
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

    const checkConnection = () => {
        if (!ws) return;
        if (Date.now() - lastPingTime > pingTimeout) {
            console.log("missed pings, reconnecting...");
            ws.close(); 
        }
    }

    setInterval(checkConnection, checkConnectionTime);

    return {
        connect,
        connected,
        send,
        setIntentionalReconnect: (value) => intentionalReconnect = value,
        checkConnection,
    };
};

document.addEventListener("DOMContentLoaded", () => {
    window.bridgeServiceWsClient = createBridgeServiceWsClient(window.bridgeServiceConfig);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            console.log("Tab is in the background");
        } else {
            console.log("Tab is active, checking websocket...");
            window.bridgeServiceWsClient.checkConnection();
        }
    });
});

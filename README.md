# sticky-bridge

`sticky-bridge` is a static website in plain HTML, CSS, and JavaScript for playing floating bridge through [`bridge-service`](https://github.com/papillonbee/bridge-service) REST API and WebSocket!

## Dependencies
1. [cardmeister](https://github.com/cardmeister/cardmeister.github.io), also a static website used for generating SVG playing card DOM

Example of generating an Ace of Spades SVG
```html
<head>
    <script src="https://cardmeister.github.io/elements.cardmeister.min.js"></script>
</head>
<body>
    <playing-card>cid="AS"</playing-card>
</body>
```

2. [`bridge-service`](https://github.com/papillonbee/bridge-service), a backend service for playing floating bridge. Players visit `sticky-bridge` static website then create game, join game, bid, choose partner, and play trick through `bridge-service` REST API, and view latest game state change, and chat through `bridge-service` WebSocket

Example of REST API for player = `anita` to create a new game = `my-first-game`
```javascript
let data = {
    "gameId": "my-first-game",
    "playerId": "anita"
}
fetch("http://localhost:8000/game/create", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
.then(response => response.json());
```

Example of WebSocket for player = `anita` to chat and listen to the latest game state change of game = `my-first-game`
```javascript
let ws = new WebSocket("ws://localhost:8000/ws/my-first-game/anita");
ws.onmessage = async (event) => {
    // listen to bridge-service websocket
    if (isValidJson(event.data)) {
        const data = JSON.parse(event.data);
        // map latest game state to playing card DOM's
        await onReceiveGameData(data);
    } else {
        // append chat message
        addMessage(event.data);
        event.preventDefault();
    }
};

sendMessage = (event) => {
    const input = document.getElementById("messageText");
    // send chat message to bridge-service through websocket
    ws.send(input.value);
    input.value = "";
    event.preventDefault();
}
```

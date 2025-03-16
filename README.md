# sticky-bridge

`sticky-bridge` is a static website in plain HTML, CSS, and JavaScript for playing floating bridge until the cards become sticky! 

Find 4 players then visit https://papillonbee.github.io/sticky-bridge/ and play now!

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

2. [`bridge-service`](https://github.com/papillonbee/bridge-service), a backend service for playing floating bridge. Players visit [`sticky-bridge`](https://papillonbee.github.io/sticky-bridge/) then create game, join game, bid, choose partner, play trick, and reset game through `bridge-service` REST API, and view latest game state change, and chat through `bridge-service` WebSocket

Example of REST API for player = `Anita` to view game = `Daddy`
```javascript
const response = await fetch("http://localhost:8000/game/view", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({"gameId": "Daddy", "playerId": "Anita"})
})
.then(response => response.json());
if (response && response.code === 0) {
    // create or update some DOM if success view game response
}
```

Example of WebSocket for player = `Anita` to chat and listen to the latest game state change of game = `Daddy`
```javascript
const ws = new WebSocket("ws://localhost:8000/ws/Daddy/Anita");
ws.onmessage = (event) => {
    // create or update some DOM when receive game state change
    // append message to chat DOM when receive chat message
};
```

## How to play
1. Anita creates game Daddy

<img src="https://github.com/user-attachments/assets/2cad0685-4ab8-46de-8d15-04a14a1ccec4" alt="Alt Text" width="200">

2. Anita bids 1 Hearts

<img src="https://github.com/user-attachments/assets/e95dae98-e47d-431d-8188-568bb41f40c1" alt="Alt Text" width="200">
<img src="https://github.com/user-attachments/assets/ae776156-a8b3-4202-aaab-593c2ce5dfa3" alt="Alt Text" width="200">

3. Anita calls Ace of Hearts as partner

<img src="https://github.com/user-attachments/assets/d2113359-1e89-4c79-9f58-643994f06933" alt="Alt Text" width="200">
<img src="https://github.com/user-attachments/assets/ca3b7c9c-f40b-45bb-bf27-e740ce517ff6" alt="Alt Text" width="200">

4. Anita plays 5 of Spades

<img src="https://github.com/user-attachments/assets/9a1ac59c-384e-435d-96b9-b20eef803082" alt="Alt Text" width="200">

5. Anita trumps with 4 of Hearts

<img src="https://github.com/user-attachments/assets/a5bf8a0b-2392-4e7c-b6c4-6c641fd92b84" alt="Alt Text" width="200">
<img src="https://github.com/user-attachments/assets/8a491747-2199-48fa-9791-7b9140447e61" alt="Alt Text" width="200">
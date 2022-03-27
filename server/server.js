const fs = require("fs");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const Player = require("./player.js");
const Message = require("./message.js");


app.use(cors());
app.use(bodyParser.json());

app.use("/leaderboard", express.static("leaderboardClient"));


const players = [];
// const points = {};

app.post("/new-player", (req, res) => {
  const name = req.body.name;

  // check if name already taken
  if (players.some(p => p.name === name)) {
    return res.status(400).json({ message: "name already taken" });
  }

  // create player
  const player = new Player(req.body.uuid, name);
  players.push(player);
  console.log(`Player created with name ${player.name} and uuid ${player.uuid}`);

  return res.status(201).json({ message: "player created" });
});

let isGameRunning = false;

app.post("/egg-found", (req, res) => {

  if (!isGameRunning) {
    return res.status(403).json({ message: "game is not running" });
  }

  const player = players.find(p => p.uuid == req.body.uuid);

  if (player) {
    console.log(`egg ${req.body.eggId} found by ${player.name} (${player.uuid})`);

    player.eggsFound.push(req.body.eggId);

    return res.status(200).json({ message: "Point added", points: player.eggsFound.length });
  } else {
    console.log("invalid player found an egg: " + req.body.uuid);
    return res.status(400).json({ message: "no player with that uuid" });
  }
});

app.get("/eggs-found", (req, res) => {
  const player = players.find(p => p.uuid === req.query.uuid);

  if (!player) {
    return res.status(400).json({ message: "no player with that uuid" });
  }

  return res.status(200).json({ eggsFound: player.eggsFound, score: player.eggsFound.length });
});

// for the leaderboad
app.get("/players", (req, res) => {
  res.status(200).json({
    players: players.map(p => ({
      score: p.eggsFound.length,
      eggsFound: p.eggsFound,
      uuid: p.uuid,
      name: p.name
    }))
  });
});

// change whether running or not with a request
app.put("/game-settings", (req, res) => {
  try {
    isGameRunning = req.body.running;
    console.log("Game running: " + isGameRunning.toString());
    return res.status(200).json({ isGameRunning });
  } catch (err) {
    return res.status(400).json({ message: error.message });
  }
});

// #region messages
let messages = [new Message("starting soon!", new Date("2022-03-19T12:22:00+0100")), new Message("starting soon actually not!", new Date("2022-03-19T12:25:00+0100"))];

app.put("/messages", (req, res) => {
  let messagesFromClient = [];
  try {
    for (let msg of req.body.messages) {
      if (msg.text && msg.expiryTime) {
        messagesFromClient.push(new Message(msg.text, new Date(msg.expiryTime)));
      } else {
        throw new Error("Messages not of required format");
      }
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  messages = messagesFromClient;
  return res.status(200).json({ messages });
});

// announcement messages
app.get("/messages", (req, res) => {
  res.status(200).json({ messages });
});

// #endregion messages

// app.listen(8081);
https.createServer({
  pfx: fs.readFileSync('C:\\Users\\georg\\Documents\\Programming\\cert.pfx'),
  passphrase: "kilt-leggings-dispatch"
}, app)
  .listen(8081);
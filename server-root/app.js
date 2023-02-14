const express = require("express");
const dgram = require('dgram');
const classes = require('./classes');
const { json } = require("express");
const { HitEvent } = require("./classes");

const app = express();
app.use(express.static('public'));

const socket = dgram.createSocket('udp4');
socket.on('listening', () => {
    let addr = socket.address();
    console.log(`Listening for UDP packets at ${addr.address}:${addr.port}`);
});

socket.on('error', (err) => {
    console.error(`UDP error: ${err.stack}`);
});

socket.on('message', (msg, rinfo) => {

    let hitEvent = new classes.HitEvent(parseInt(msg.toString('utf-8', 0, 1)), parseInt(msg.toString('utf-8', 2, 3)));
    scoreboard.addHitEvent(hitEvent);
    console.log(scoreboard.getRecentHitEvents(5));
});

//Front end website get call
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

//app.get for getting the array of scores as a JSON obj
app.get("/scores", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(scoreboard));
});

app.post("/", function(req, res) {
    console.log("Post received, time to start game");
    res.send();
});

app.listen(3000, function () {
    console.log("Server is running on localhost3000");
});

socket.bind(7501);

let scoreboard = new classes.Scoreboard(10);

for (let i = 1; i < 5; i++) {
    scoreboard.addPlayerEntry(new classes.PlayerEntry(i, 500));
}
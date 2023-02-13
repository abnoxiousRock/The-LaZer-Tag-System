const express = require("express");
const dgram = require('dgram');
const classes = require('./classes');

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
    console.log('Recieved UDP message');
    console.log(msg);

    //update players array with new hits
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

//app.get for getting the array of scores as a JSON obj

app.listen(3000, function () {
    console.log("Server is running on localhost3000");
});

socket.bind(7501);

let players = [];
for (let i = 0; i < 40; i++) {
    if (i<20) {
        players.push(new classes.ScoreboardEntry(i, 'red', 'default', 0));
    }
    else {
        players.push(new classes.ScoreboardEntry(i, 'green', 'default', 0));
    }
}

let hitEvents = [];
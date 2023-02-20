const express = require('express');
const dgram = require('dgram');
const classes = require('./classes');
const {createClient} = require('@supabase/supabase-js');
const { json } = require('express');

const SUPA_URL = 'https://hkgckknlshbgvedsphzs.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZ2Nra25sc2hiZ3ZlZHNwaHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY0MDI3MDUsImV4cCI6MTk5MTk3ODcwNX0.9zWMlf9DqDfP4zuKOz4oLW80GPypJfogOJIqw1N79hM';
const sbClient = createClient(SUPA_URL, SUPA_KEY);

const app = express();
app.use(express.static('public'));
app.use(express.json());

const socket = dgram.createSocket('udp4');
socket.on('listening', () => {
    let addr = socket.address();
    console.log(`Listening for UDP packets at ${addr.address}:${addr.port}`);
});

socket.on('error', (err) => {
    console.error(`UDP error: ${err.stack}`);
});

socket.on('message', (msg, rinfo) => {
    let messageLength = msg.length;
    let stringMessage = msg.toString('utf-8');
    let playerIdArray = stringMessage.split(':');
    let hitEvent = new classes.HitEvent(parseInt(playerIdArray[0]), parseInt(playerIdArray[1]));
    scoreboard.addHitEvent(hitEvent);
    console.log('player ' + playerIdArray[0] + ' hit player ' + playerIdArray[1]);
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

app.get("/dbdata", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    (async () => {
            let {data, error} = await sbClient.from('player').select();
            if (error)
                res.end(JSON.stringify(error));
            else
                res.end(JSON.stringify(data));
    })();
});

app.post("/register", function (req, res) {
    console.log("Post received to add user to database");
    console.log(req.body);
    res.setHeader('Content-Type', 'application/json');
    (async () => {
            let {data, error} = await sbClient.from('player').insert({
                id: req.body.data.id,
                first_name: req.body.data.fName,
                last_name: req.body.data.lName,
                codename: req.body.data.nName
            });
            if (error)
                res.end(JSON.stringify(error));
            else
                res.end(JSON.stringify(data));
    })();

    res.send();
});

app.post("/", function (req, res) {
    console.log("Post received, time to start game");
    console.log(req.body);
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
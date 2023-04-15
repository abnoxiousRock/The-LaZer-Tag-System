// CONST values
const NUMPLAYERS = 40;
const POINTSPERHIT = 10;
// for future use if you want to take off points for being hit
const NUMPOINTSTOSTART = 0;

// Team Arrays (need better title...)
const redTeamPlayers = [];
const greenTeamPlayers = [];

let timer;

// end CONSTs

var songArray = ['0.mp3', '1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3'];
//moved into function for now
//shuffle(songArray);

//this object contains ids/nicknames, updated scores, and hit events
var scoresAndHitEvents = {};

//this is used to start stop poll(). Set this to false when the timer runs out
var isPolling = false;
var firstPoll = true;

//this method runs every 1/4 second after it has been called in startgame
var poll = function() {
	//console.log("polling is happening, insert logic below me");

	//This call updates the local variable scoresAndHitEvents with current data from server and python traffic
	updateScoresAndHitEvents();

	//recursive call to keep updating whatever is in this method
	if (isPolling) {
		setTimeout(poll, 500);  
        if(!firstPoll)
        {
            var players = scoresAndHitEvents.playerEntries
            for(let i = 0; i < players.length; i++)
            {
                var redTeamPoints, greenTeamPoints;
                if(players[i].isRed == true && players[i].id == redTeamPlayers[0].id)
                {
                    document.getElementById('redP1-NumPoints').innerHTML = players[i].numPoints;
                    redTeamPoints = players[i].numPoints;
                }

                if(players[i].isRed == true && players[i].id == redTeamPlayers[1].id)
                {
                    document.getElementById('redP2-NumPoints').innerHTML = players[i].numPoints;
                    redTeamPoints += players[i].numPoints;
                }
                document.getElementById('redTeamNumPoints').innerHTML = redTeamPoints;

                var redTeamPoints, isNotRedTeamPoints;
                if(players[i].isRed == false && players[i].id == greenTeamPlayers[0].id)
                {
                    document.getElementById('greenP1-NumPoints').innerHTML = players[i].numPoints;
                    greenTeamPoints = players[i].numPoints;
                }

                if(players[i].isRed == false && players[i].id == greenTeamPlayers[1].id)
                {
                    document.getElementById('greenP2-NumPoints').innerHTML = players[i].numPoints;
                    greenTeamPoints += players[i].numPoints;
                }
                document.getElementById('greenTeamNumPoints').innerHTML = greenTeamPoints;
                // grab teams numPoints to update scoreboard id with data
            }
        }  
    }
}

//updates the local variable scoresAndHitEvents with current data from server and python traffic
//meant to be called repeatedly by poll()
var updateScoresAndHitEvents = function() {
    let url = '/scores';
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let returnObj = JSON.parse(this.responseText);
            //console.log(returnObj);
            //checking that the return object from server isn't empty due to error
            if (returnObj !== {}) {
                //console.log("success, received non-empty object from /scores");
                scoresAndHitEvents = returnObj;
                firstPoll = false;
            }
            //console.log(scoresAndHitEvents);
        }
    };

    xhr.open('GET', url, true);
    xhr.send();
}

var fadeSplash = function() {
    let elem = document.getElementById('splashscreen');
    elem.style.display = 'none';
    elem = document.getElementById('scoreboard');
    elem.style.display = 'block';
}

window.onload = function() {
    setTimeout(fadeSplash, 3000);
    let form = document.getElementById('myForm');
    form.addEventListener('submit', handleFormStartGame);
    form = document.getElementById('regPlayer');
    //form.addEventListener('submit', handleFormRegister);

    for (let i = 1; i <= NUMPLAYERS; i++) {
        tempString = 'id';
        tempString += i;
        let elem = document.getElementById(tempString);
        elem.value = '';
        elem.addEventListener("input", getNickname);
        elem = document.getElementById('nickname' + i);
        elem.disabled = true;
        elem.value = '';
    }
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

function handleFormStartGame(event) {
    event.preventDefault();

    for (let i = 1; i <= NUMPLAYERS; i++) {
        let elem = document.getElementById('id' + i);
        let elem2 = document.getElementById('nickname' + i);
        if (elem.value !== '' && elem2.value === '') {
            alert('Nickname required for ID: ' + elem.value);
            return;
        }
    }

    startTimer();
    startGame();
    setTimeout(delayableSongPlay, 14000);

    //function to disable form/button and prevent further changes and 
    //syncs with the remote nickname database (form = disabled?)
    //function to start music
    //after a second or so (dont want button and form to disappear the moment you click)
    //function hide player entry form, unhide scoreboard with hit action ticker
    //function to start timer?
    //conditions for a win to stop game early?
}

function handleFormRegister(event) {
    event.preventDefault();
    register();
    resetFields();
}

//not sure how to use setTimeout with a func that takes arguments recursively (see below), so using this
let delayableSongPlay = function() {
    shuffle(songArray);
    playSongList(songArray);
}

function playSongList(array) {
    //console.log('in playSongList()')
    if (array.length > 0) {
        var music = new Audio(array[0]).play();
        console.log('playing song ' + array[0]);
    }
}

let register = function () {
    let newId = document.getElementById('newId').value;
    let fName = document.getElementById('fName').value;
    let lName = document.getElementById('lName').value;
    let nName = document.getElementById('nName').value;
    let returnObj = {
        'id': newId,
        'fName': fName,
        'lName': lName,
        'nName': nName,
    }

    let post = JSON.stringify({'data': returnObj});
    const url = '/register'
    let xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(post)     
}

let getNickname = function (e) {
    let id = e.target.value;
    let url = '/nickname?id=' + id;
    let xhr = new XMLHttpRequest();
    let nName = '';

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var returnData = JSON.parse(this.responseText);
            if (returnData.length === 0) {
                nName = '';
            }
            else 
            {
                nName = returnData[0].codename;
            }
        }
        let elem2 = document.getElementById('nickname' + e.target.id.substring(2));
        elem2.value = nName;
        if (elem2.value !== '') {
            elem2.disabled = true;
        }
        else {
            elem2.disabled = false;
        }
    };

    xhr.open('GET', url, true);
    xhr.send();
}

let resetFields = function () {
    document.getElementById('newId').value = "";
    document.getElementById('fName').value = "";
    document.getElementById('lName').value = "";
    document.getElementById('nName').value = "";
}

let startGame = function () {
    let tempString = '';

    let scoreboard = new Scoreboard(POINTSPERHIT);
    for (let i = 1; i <= NUMPLAYERS; i++) {
        tempString = 'id';
        tempString += i;
        let elem = document.getElementById(tempString);
        let id = elem.value;
        elem = document.getElementById('nickname' + i);
        if (id !== '') {
            let isRed = false;
            if (i <= NUMPLAYERS/2)
                isRed = true;
            let tempPlayer = new PlayerEntry(isRed, id, elem.value, NUMPOINTSTOSTART);
            scoreboard.addPlayerEntry(tempPlayer);
        }
    }

	// Parsing Data for Player Action Screen
//	console.log(scoreboard.playerEntries);
	let players = scoreboard.playerEntries;
//	console.log(players.length);

	// Load Players into Respective Teams
	for (let i = 0; i < players.length; i++)
	{
		//console.log(scoreboard.playerEntries[i]);
		

		// Adding Players to Their Respective Teams' Array
		if (players[i].isRed)
			{redTeamPlayers.push(players[i]);}
		else
			{greenTeamPlayers.push(players[i]);}
	}
	//console.log(redTeamPlayers);
	//console.log(greenTeamPlayers);
	

    let post = JSON.stringify(scoreboard);
    const url = '/'
    let xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(post);
}

function startTimer() {
    var counter = 30;
    timer = setInterval(function() {
      document.getElementById("countDownButton").value = counter + " seconds till game begins";
      document.getElementById("countDownButton").disabled = true;
      counter--;
      if (counter < 0) {
        clearInterval(timer);
        let elem = document.getElementById('scoreboard');
        elem.style.display = 'none';
        elem = document.getElementById('playAction');
        elem.style.display = 'block';
        playerActionScreen();
      }
    }, 1000);
}

function playerActionScreen() {

	/* GENERAL PROCEDURE HERE:
	 * 1.) Initialize and Start Countdown Timer.
	 * 2.) Initialize and Start "Live Log" of Events.
	 * 3.) Initialize and Start (polling for) Scoreboard.
	 * 4.) Update the Scoreboard and "Live Log".
	 * 5.) Repeat Step 4 until Timer is Done.
	 * 6.) End Game.
	 */

	// 1.) Countdown Timer (in seconds)
	var timeLeft = 360;
	var timer = setInterval(function() {
	
	var minutes = Math.floor(timeLeft / 60);
	var seconds = timeLeft % 60;

	if(seconds < 10){
        	seconds = "0" + seconds;
	}

	document.getElementById("playActionTimer").innerHTML = minutes + ":" + seconds;
	--timeLeft;
    	if(minutes == 0 && seconds == 0){
        	clearInterval(timer);
    	}
	}, 1000);

	// 2.) Initialize and Start "Live Log" of Events
	
	// 3.) Initialize and Start (polling for) Scoreboard
	
	// Red Team
	document.getElementById('redP1-Nickname').innerHTML = redTeamPlayers[0].nickname;
    document.getElementById('redPlayer1_ID').innerHTML = redTeamPlayers[0].id;
	document.getElementById('redP2-Nickname').innerHTML = redTeamPlayers[1].nickname;
    document.getElementById('redPlayer2_ID').innerHTML = redTeamPlayers[1].id;
	//document.getElementById('redP3-Nickname').innerHTML = redTeamPlayers[2].nickname;

	// Green Team
	document.getElementById('greenP1-Nickname').innerHTML = greenTeamPlayers[0].nickname;
    document.getElementById('greenPlayer1_ID').innerHTML = greenTeamPlayers[0].id;
	document.getElementById('greenP2-Nickname').innerHTML = greenTeamPlayers[1].nickname;
    document.getElementById('greenPlayer2_ID').innerHTML = greenTeamPlayers[1].id;
	//document.getElementById('greenP3-Nickname').innerHTML = greenTeamPlayers[2].nickname;

	isPolling = true;
	poll();	
}

document.addEventListener('keydown', (event) => {
    event = event || window.event;
    if(event.keyCode == 116){
        event.preventDefault();
        let elem = document.getElementById('scoreboard');
        elem.style.display = 'none';
        elem = document.getElementById('playAction');
        elem.style.display = 'block';
        startGame();
        playerActionScreen();
    }
});

// CLASSES 

class PlayerEntry {
    constructor(isRed, id, nickname, numPoints) {
        this.isRed = isRed;
        this.id = id;
        this.nickname = nickname;
        this.numPoints = numPoints;
    }
}

class HitEvent {
    constructor(shooterId, shotId) {
        this.shooterId = shooterId;
        this.shotId = shotId;
    }
}

class Scoreboard {
    constructor(pointsPerHit) {
        this.pointsPerHit = pointsPerHit;
        this.playerEntries = [];
        this.hitEvents = [];
    }
    addPlayerEntry(p) {
        this.playerEntries.push(p);
    }
    getScores() {
        return this.playerEntries;
    }
    getRecentHitEvents(numEvents) {
        let startIndex = 0;
        if (this.hitEvents.length > numEvents) {
            startIndex = startIndex - numEvents;
        }
        return this.hitEvents.slice(startIndex, this.hitEvents.length);
    }
    addHitEvent(hitEvent) {
        this.playerEntries.forEach(playerEntry => {
            if (playerEntry.id === hitEvent.shooterId) {
                playerEntry.numPoints += this.pointsPerHit;
            }
        });
        this.hitEvents.push(hitEvent);

        //this can be used to limit how many hit events we store
        this.hitEvents = this.getRecentHitEvents(20);
    }
}

// END CLASSES

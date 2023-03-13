// CONST values
const NUMPLAYERS = 40;
const POINTSPERHIT = 10;
// for future use if you want to take off points for being hit
const NUMPOINTSTOSTART = 0;

// end CONSTs

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
    form.addEventListener('submit', handleFormRegister);

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
    playerActionScreen();
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
            let tempPlayer = new PlayerEntry(id, elem.value, NUMPOINTSTOSTART);
            scoreboard.addPlayerEntry(tempPlayer);
        }
    }

    let post = JSON.stringify(scoreboard);
    const url = '/'
    let xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(post);
}

function startTimer() {
    var counter = 30;
    var timer = setInterval(function() {
      document.getElementById("countDownButton").value = counter + " seconds till game begins";
      counter--;
      if (counter < 0) {
        clearInterval(timer);
        document.getElementById("countDownButton").style.color = "red";
        let elem = document.getElementById('scoreboard');
        elem.style.display = 'none';
        elem = document.getElementById('playAction');
        elem.style.display = 'block';
      }
    }, 1000);
}

function playerActionScreen() {

	// Countdown Timer (in seconds)
	var timeLeft = 120;
	var timer = setInterval(function() {
	
	var minutes = Math.floor(timeLeft / 60);
	var seconds = timeLeft % 60;

	console.log(minutes + ":" + seconds);

	document.getElementById("playActionTimer").innerHTML = minutes + ":" + seconds;
	--timeLeft;
	}, 1000);

	//top scoreboard leaders
	//total points
	//"live" log of events
}

document.addEventListener('keydown', (event) => {
    event = event || window.event;
    if(event.keyCode == 116){
        event.preventDefault();
        let elem = document.getElementById('scoreboard');
        elem.style.display = 'none';
        elem = document.getElementById('playAction');
        elem.style.display = 'block';
        startTimer();
        startGame();
        playerActionScreen();
    }
});

// CLASSES 

class PlayerEntry {
    constructor(id, nickname, numPoints) {
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

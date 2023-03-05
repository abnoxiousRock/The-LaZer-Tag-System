// CONST values
const NUMPLAYERS = 4;
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
}

function handleFormStartGame(event) {
    event.preventDefault();
    startGame();
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

let getNickname = function (id) {
    // let get = JSON.stringify({'data': id});
    let url = '/nickname?id=' + id;
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var returnData = JSON.parse(this.responseText);
            if (returnData.length === 0) {
                return '';
            }
            else 
            {
                return returnData[0].codename;
            }
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
        let tempPlayer = new PlayerEntry(id, NUMPOINTSTOSTART);
        scoreboard.addPlayerEntry(tempPlayer);
    }

    let post = JSON.stringify(scoreboard);
    const url = '/'
    let xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(post);
}

// CLASSES 

class PlayerEntry {
    constructor(id, numPoints) {
        this.id = id;
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
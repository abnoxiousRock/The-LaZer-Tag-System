var fadeSplash = function() {
    let elem = document.getElementById('splashscreen');
    elem.style.display = 'none';
    elem = document.getElementById('scoreboard');
    elem.style.display = 'block';
}

window.onload = function() {
    setTimeout(fadeSplash, 3000);
    let form = document.getElementById('myForm');
    form.addEventListener('submit', handleForm);
}

function handleForm(event) {
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

let startGame = function () {
    let post = JSON.stringify({'data':['replace','with','scoreboard','playerIds','etc']});
    const url = '/'
    let xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(post);
}

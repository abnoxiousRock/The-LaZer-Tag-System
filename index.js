var fadeSplash = function() {
    const elem = document.getElementById('splashscreen');
    elem.style.display = 'none';
}

window.onload = function() {
    setTimeout(fadeSplash, 3000);
  }
let tTime = document.querySelector('#timer-time');
let tResetButton = document.querySelector('#button-reset');
let tToggleButton = document.querySelector('#button-toggle');

let timerId;
// time in seconds
let timeLeft = 12;

function timerStuff() {
    timerId = setInterval(() => {
        timeLeft--;
        tTime.textContent = timeLeft + "s";
        if (timeLeft <= 0) {clearInterval(timerId); alert("Time's up!")}
    }, 1000);
}

let resetButton = document.querySelector('#button-reset')
resetButton.addEventListener('click', timerStuff)
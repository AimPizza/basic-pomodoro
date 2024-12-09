const STUDY_TIME = 65; // time in seconds
const PAUSE_TIME = 5; // time in seconds

// const State = {
//     STUDYING,
//     PAUSING,
//     STOPPED,
// };

class Timer {
    tTime = document.querySelector('#timer-time');
    tResetButton = document.querySelector('#button-reset');
    tToggleButton = document.querySelector('#button-toggle');
    timerId;
    timeLeft = STUDY_TIME;
    seconds;
    minutes;
    // currentState = State.STOPPED;

    constructor() {
        this.runTimer = this.runTimer.bind(this);
        this.tToggleButton.addEventListener('click', this.runTimer)
        console.log("constructed");
    }

    runTimer() {
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.seconds = this.timeLeft % 60;
            this.minutes = (this.timeLeft - this.seconds) / 60;
            this.tTime.textContent = `${this.formatNumbers(this.minutes)}:${this.formatNumbers(this.seconds)}`;
            if (this.timeLeft <= 0) { this.resetTimer(); }
        }, 1000);
    }
    formatNumbers(num) {
        return String(num).padStart(2, '0')
    }
    resetTimer() {
        clearInterval(this.timerId);
        console.log("Time's up!");
        this.timeLeft = STUDY_TIME;
    }
};

let timer = new Timer();

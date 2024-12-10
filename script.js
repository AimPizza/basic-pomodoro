// TODO: time is very low for testing purposes
const STUDY_DURATION = 7; // time in seconds
const BREAK_DURATION = 3; // time in seconds

// const State = {
//     STUDYING,
//     PAUSING,
//     STOPPED,
// };

const pomodoroStatus = {
  STUDYING: 'STUDYING',
  STUDY_PAUSED: 'STUDY_PAUSED',
  ON_BREAK: 'ON_BREAK',
  BREAK_PAUSED: 'BREAK_PAUSED',
};

class TimerState {
  currentStatus;
  timesOnBreak;
  timesStudied;

  constructor() {
    this.currentStatus = pomodoroStatus.STUDY_PAUSED;
    this.timesOnBreak = 0;
    this.timesStudied = 0;
  }

  incrementTimesOnBreak() {
    this.timesOnBreak += 1;
  }

  // getSavedStatus() {};
}

class Timer {
  tTime = document.querySelector('#timer-time');
  tResetButton = document.querySelector('#button-reset');
  tToggleButton = document.querySelector('#button-toggle');
  timerId;
  timeLeft = STUDY_DURATION;
  seconds;
  minutes;
  timerState = new TimerState();

  constructor() {
    this.runTimer = this.runTimer.bind(this);
    this.displayTime = this.displayTime.bind(this);
    this.finishState = this.finishState.bind(this);
    this.toggleState = this.toggleState.bind(this);
    this.tToggleButton.addEventListener('click', this.toggleState)

    this.displayTime();
    console.log("constructed");
  }

  formatNumbers(num) {
    return String(num).padStart(2, '0')
  }
  displayTime() {
    this.seconds = this.timeLeft % 60;
    this.minutes = (this.timeLeft - this.seconds) / 60;
    this.tTime.textContent = `${this.formatNumbers(this.minutes)}:${this.formatNumbers(this.seconds)}`;
  }
  stopTimer() {
    clearInterval(this.timerId);
  }
  setStatus(newStatus) {
    this.timerState.currentStatus = newStatus;
  }
  toggleState() {
    // note that we stop timers at the very beginning and start timers at the end
    switch (this.timerState.currentStatus) {
      case pomodoroStatus.STUDYING:
        this.stopTimer();
        this.setStatus(pomodoroStatus.STUDY_PAUSED);
        break;
      case pomodoroStatus.STUDY_PAUSED:
        this.setStatus(pomodoroStatus.STUDYING);
        this.runTimer();
        break;
      case pomodoroStatus.ON_BREAK:
        this.stopTimer();
        this.setStatus(pomodoroStatus.BREAK_PAUSED);
        break;
      case pomodoroStatus.BREAK_PAUSED:
        this.setStatus(pomodoroStatus.ON_BREAK);
        this.runTimer();
        break;
      default:
        break;
    }
  }
  finishState() {
    switch (this.timerState.currentStatus) {
      case pomodoroStatus.STUDYING:
        console.log('finished studying. now on break..');
        this.stopTimer();
        this.timerState.currentStatus = pomodoroStatus.ON_BREAK;
        this.timeLeft = BREAK_DURATION;
        this.displayTime();
        this.runTimer();
        break;
      case pomodoroStatus.ON_BREAK:
        console.log('break finished. now studying..');
        this.stopTimer();
        this.timerState.currentStatus = pomodoroStatus.STUDYING;
        this.timeLeft = STUDY_DURATION;
        this.displayTime();
        this.runTimer();
        break;
      default:
        console.log('Unhandled state was finished.');
        break;
    }
  };
  runTimer() {
    this.timerId = setInterval(() => {
      this.timeLeft--;
      this.displayTime();
      if (this.timeLeft <= 0) { this.finishState(); }
    }, 1000);
  }
};

let timer = new Timer();

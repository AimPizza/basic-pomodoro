//const STUDY_DURATION = 25 * 60; // time in seconds
//const BREAK_DURATION = 5 * 60; // time in seconds
const STUDY_DURATION = 5; // time in seconds
const BREAK_DURATION = 3; // time in seconds

const pomodoroStatus = {
  STUDYING: 'studying',
  STUDY_PAUSED: 'study paused',
  ON_BREAK: 'on break',
  BREAK_PAUSED: 'break paused',
};

class TimerState {
  currentStatus;
  timesOnBreak;
  timesStudied;

  constructor() {
    this.timesOnBreak = 0;
    this.timesStudied = 0;
  }

  incrementTimesOnBreak() {
    this.timesOnBreak += 1;
  }

  incrementTimesStudied() {
    this.timesStudied += 1;
  }

}

class StorageManager {
  constructor(key) {
    this.key = key;
  }

  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  load() {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : null;
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}

class Timer {
  tTime = document.querySelector('#timer-time');
  tResetButton = document.querySelector('#button-reset');
  tToggleButton = document.querySelector('#button-toggle');
  tStatusText = document.querySelector('#timer-statustext');
  timerId;
  timeLeft;
  seconds;
  minutes;
  timerState = new TimerState();
  storageManger = new StorageManager('timerData');

  constructor() {
    this.displayTime = this.showStatus.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.setTimeLeft = this.setTimeLeft.bind(this);
    this.runTimer = this.runTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.toggleState = this.toggleState.bind(this);
    this.finishState = this.finishState.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.tToggleButton.addEventListener('click', this.toggleState);
    this.tResetButton.addEventListener('click', this.resetTimer);


    this.loadStateOrDefault();
    window.addEventListener('beforeunload', () => {this.saveState();});
    console.log("constructed, waiting for input..");
  }

  saveState() {
    const data = {
      currentStatus: this.timerState.currentStatus,
      timeLeft: this.timeLeft,
      timesOnBreak: this.timerState.timesOnBreak,
      timesStudied: this.timerState.timesStudied
    };
    this.storageManger.save(data);
  }

  // load settings and state from localStorage (as of now)
  // if null -> set defaults
  loadStateOrDefault() {
    const data = this.storageManger.load();
    if (data) {
      switch (data.currentStatus) {
        case pomodoroStatus.STUDYING:
          this.setStatus(pomodoroStatus.STUDY_PAUSED);
          break;
        case pomodoroStatus.ON_BREAK:
          this.setStatus(pomodoroStatus.BREAK_PAUSED);
          break;
        default:
          this.setStatus(data.currentStatus);
      }
      this.setTimeLeft(data.timeLeft);
      this.timerState.timesOnBreak = data.timesOnBreak;
      this.timerState.timesStudied = data.timesStudied;
    } else {
      this.setStatus(pomodoroStatus.STUDY_PAUSED);
      this.setTimeLeft(STUDY_DURATION);
      this.timerState.timesOnBreak = 0;
      this.timerState.timesStudied = 0;
    }
    this.showStatus();
  }

  formatNumbers(num) {
    return String(num).padStart(2, '0')
  }

  showStatus() {
    this.seconds = this.timeLeft % 60;
    this.minutes = (this.timeLeft - this.seconds) / 60;
    this.tTime.textContent = `${this.formatNumbers(this.minutes)}:${this.formatNumbers(this.seconds)}`;
    this.tStatusText.textContent = this.timerState.currentStatus;
  }

  stopTimer() {
    clearInterval(this.timerId);
  }

  setStatus(newStatus) {
    this.timerState.currentStatus = newStatus;
    this.showStatus();
  }

  setTimeLeft(secondsLeft) {
    this.timeLeft = secondsLeft;
    this.showStatus();
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
    this.saveState();
  }

  finishState() {
    switch (this.timerState.currentStatus) {
      case pomodoroStatus.STUDYING:
        console.log('finished studying. now on break..');
        this.stopTimer();
        this.setStatus(pomodoroStatus.ON_BREAK)
        this.setTimeLeft(BREAK_DURATION);
        this.runTimer();
        this.timerState.incrementTimesStudied();
        break;
      case pomodoroStatus.ON_BREAK:
        console.log('break finished. now studying..');
        this.stopTimer();
        this.setStatus(pomodoroStatus.STUDYING)
        this.setTimeLeft(STUDY_DURATION);
        this.runTimer();
        this.timerState.incrementTimesOnBreak();
        break;
      default:
        console.error('Unhandled state was finished.');
        break;
    }
    this.saveState();
  };

  runTimer() {
    this.timerId = setInterval(() => {
      this.timeLeft--;
      this.showStatus();
      if (this.timeLeft <= 0) { this.finishState(); }
    }, 1000);
  }

  resetTimer() {
    this.stopTimer();
    this.setTimeLeft(STUDY_DURATION);
    this.setStatus(pomodoroStatus.STUDY_PAUSED);
  }

};

let timer = new Timer();

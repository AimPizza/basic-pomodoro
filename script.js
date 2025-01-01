
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
  app;
  timerId;
  timeLeft;
  seconds;
  minutes;
  timerState = new TimerState();
  storageManger = new StorageManager('timerData');

  constructor(app) {
    this.app = app;
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
    window.addEventListener('beforeunload', () => { this.saveState(); });
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
      this.setTimeLeft(this.app.STUDY_DURATION);
      this.timerState.timesOnBreak = 0;
      this.timerState.timesStudied = 0;
    }
    this.swapAppearance(this.timerState.currentStatus);
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

  /// accepts a pomodorostate and matches colors to give based on that
  swapAppearance(pomoState) {
    const styles = getComputedStyle(document.documentElement);
    const studyColor = styles.getPropertyValue('--study-color').trim();
    const breakColor = styles.getPropertyValue('--break-color').trim();

    switch (pomoState) {
      case pomodoroStatus.ON_BREAK:
      case pomodoroStatus.BREAK_PAUSED:
        document.documentElement.style.setProperty('--primary-color', breakColor);
        document.documentElement.style.setProperty('--secondary-color', studyColor);
        break;
      case pomodoroStatus.STUDYING:
      case pomodoroStatus.STUDY_PAUSED:
        document.documentElement.style.setProperty('--primary-color', studyColor);
        document.documentElement.style.setProperty('--secondary-color', breakColor);
        break;
      default:
        console.error('attempted to swap appearance to unhandled state: ', pomoState);
        break;
    }

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
        this.setStatus(pomodoroStatus.ON_BREAK);
        this.swapAppearance(pomodoroStatus.ON_BREAK);
        this.setTimeLeft(this.app.BREAK_DURATION);
        this.runTimer();
        this.timerState.incrementTimesStudied();
        break;
      case pomodoroStatus.ON_BREAK:
        console.log('break finished. now studying..');
        this.stopTimer();
        this.setStatus(pomodoroStatus.STUDYING);
        this.swapAppearance(pomodoroStatus.STUDYING);
        this.setTimeLeft(this.app.STUDY_DURATION);
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
    this.setTimeLeft(this.app.STUDY_DURATION);
    this.setStatus(pomodoroStatus.STUDY_PAUSED);
  }

};


class UiHandler {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
    // DEV:
    this.selectElement(document.querySelector('[tab-button=prefs]'));
    //this.selectElement(document.querySelector('[tab-button=timer]'));
    document.querySelectorAll('button[tab-button]')
      .forEach((btn) => {
        btn.addEventListener('click', this.handleClick);

      });
  }

  handleClick(e) {
    e.preventDefault();


    const buttonName = e.currentTarget.getAttribute('tab-button');
    this.selectElement(e.currentTarget);
    //this.hideAll();
    //this.showElementById(buttonName); // show a window based on the corrosponding tab-button
    console.log('Clicked: ', buttonName);
  }

  /// accepts a tab button
  selectElement(anElement) {
    this.hideAll();
    this.setAriaToElement(anElement)
    this.showElementById(anElement.getAttribute('tab-button')) // value of tab-button on the button is the id of the element that's to be enabled
  }

  setAriaToElement(anElement) {
    document.querySelectorAll('button[tab-button]')
      .forEach(btn => btn.setAttribute('aria-selected', 'false'));
    anElement.setAttribute('aria-selected', 'true');
  }

  showElementById(elementId) {
    console.log('the id: ' + elementId);

    document.querySelector('#' + elementId).classList.remove('hidden');
  }

  hideAll() {
    document.querySelectorAll('main > div').forEach(pomoWindow => pomoWindow.classList.add('hidden'));
  }
}


// testing study duration slider

class App {
  constructor() {
    this.STUDY_DURATION = 25 * 60; // time in seconds
    this.BREAK_DURATION = 5 * 60; // time in seconds
    // this.STUDY_DURATION = 5; // time in seconds
    // this.BREAK_DURATION = 3; // time in seconds

    this.ui = new UiHandler();
    this.timer = new Timer(this);

  }
}

let slider = document.querySelector('#study-duration-setting .pref-input');
console.log('sliders value: ', slider.value)
let sliderValueLabel = document.querySelector('#study-duration-setting .pref-value');
sliderValueLabel.textContent = slider.value;
slider.oninput = () => { sliderValueLabel.textContent = slider.value; }


let app = new App();
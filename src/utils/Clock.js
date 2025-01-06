export class Clock {
  constructor(durationInSeconds, startHour = null, startMinute = null, startSecond = null) {
    if (startHour !== null && startMinute !== null && startSecond !== null) {
      const now = new Date();
      this.startTime = new Date(
        now.getFullYear(), 
        now.getMonth(), 
        now.getDate(), 
        startHour, 
        startMinute, 
        startSecond
      ).getTime();
      this.isCustomTime = true;
    } else {
      this.startTime = Date.now();
      this.isCustomTime = false;
    }
    this.endTime = this.startTime + (durationInSeconds * 1000);
    this.localActualTime = Date.now();
    this.elapsedTime = 0;
    this.timerID = null;
  }

  start(cb) {
    const updateTime = () => {
      this.elapsedTime = Date.now() - this.localActualTime;
      if (Date.now() >= this.endTime) {
        this.pause();
        cb?.();
        return;
      }
      this.timerID = requestAnimationFrame(updateTime);
    };
    updateTime();
  }

  pause() {
    if (this.timerID) {
      cancelAnimationFrame(this.timerID);
      this.timerID = null;
    }
  }

  reset() {
    clearInterval(this.timerID);
    this.elapsedTime = 0;
  }

  displayTime() {
    const currentDisplayTime = new Date(this.startTime + this.elapsedTime);
    const hours = currentDisplayTime.getHours();
    const minutes = currentDisplayTime.getMinutes();
    const seconds = currentDisplayTime.getSeconds();
    return `${this.formatTime(hours)} : ${this.formatTime(minutes)} : ${this.formatTime(seconds)}`;
  }

  formatTime(value) {
    return value.toString().padStart(2, '0');
  }

  getCurrentDate() {
    if (!this.timerID) {
      return new Date(); // 如果计时器未启动，返回当前时间
    }
    return new Date(this.isCustomTime ? this.startTime + this.elapsedTime : Date.now());
  }
}
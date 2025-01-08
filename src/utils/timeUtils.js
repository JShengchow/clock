// 格式化时间显示
export const formatTime = (value) => {
  return value.toString().padStart(2, '0');
};

// 创建考试时间对象
export const createExamTime = (duration, startHour, startMinute, startSecond) => {
  // 记录创建时的真实时间
  const realStartTime = Date.now();
  
  // 设置目标显示时间
  const targetTime = new Date();
  targetTime.setHours(startHour, startMinute, startSecond, 0); // 设置秒和毫秒为0
  
  // 如果设置的时间已经过了，就设置为明天
  if (targetTime.getTime() < realStartTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  return {
    realStartTime,          // 实际开始时间
    targetStartTime: targetTime.getTime(), // 目标显示时间
    duration: duration * 1000  // 持续时间（毫秒）
  };
};

// 获取剩余时间
export const getRemainingTime = (examTimes, currentTimeStamp) => {
  const now = new Date(currentTimeStamp);
  const elapsed = now - examTimes.realStartTime; // 已经过去的时间
  
  // 如果已经超过持续时间，考试结束
  if (elapsed >= examTimes.duration) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isFinished: true
    };
  }
  
  // 计算剩余时间
  const remaining = examTimes.duration - elapsed;
  const totalSeconds = Math.floor(remaining / 1000);
  
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isFinished: false
  };
};

// 获取当前显示时间（只显示时分）
export const getCurrentDisplayTime = () => {
  const now = new Date();
  return `${formatTime(now.getHours())} : ${formatTime(now.getMinutes())}`;
};

// 获取当前考试时间显示（精确到秒）
export const getExamDisplayTime = (examTimes) => {
  if (!examTimes) return new Date();
  
  const now = Date.now();
  const elapsed = now - examTimes.realStartTime;
  const examTime = new Date(examTimes.targetStartTime + elapsed);
  
  // 如果时间超过24小时，重置为当天
  if (elapsed > 24 * 60 * 60 * 1000) {
    examTime.setDate(examTime.getDate() - 1);
  }
  
  return examTime;
}; 
<template>
  <div id="app">
    <!-- 全屏倒计时 -->
    <Transition name="el-fade-in-linear">
      <div v-if="showCountdown" class="fullscreen-countdown">
        <div class="countdown-number">{{ countdownNumber }}</div>
      </div>
    </Transition>

    <div class="clock-container">
      <!-- 左侧计时列表 -->
      <TimingList
        ref="timingListRef"
        :is-exam-mode="isExamMode"
        :current-time="currentTime.date"
        class="timing-list-container"
      />
      <!-- 右侧时钟部分 -->
      <div class="clock-main">
        <div class="clock-set-wrapper">
          <div class="clock-set">
            <TimeControls
              :is-exam-mode="isExamMode"
              @set-time="handleSetTime"
              @reset="handleReset"
            />
          </div>

          <el-switch
            v-model="switchClock"
            active-text="指针时钟"
            inactive-text="数字时钟"
          />
        </div>

        <div
          class="clock-display"
          @click="handleFull"
          :class="{ 'is-full': isFull }"
        >
          <!-- 数字时钟 -->
          <div class="clock-countdown" v-show="!switchClock">
            {{ currentTime.display }}
          </div>
          <!-- 指针时钟 -->
          <AnalogClock v-show="switchClock" :time="currentTime.date" />
        </div>

        <div class="clock-current">
          {{ getCurrentDisplayTime() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
  formatTime,
  createExamTime,
  getRemainingTime,
  getCurrentDisplayTime,
  getExamDisplayTime,
} from "./utils/timeUtils";
import AnalogClock from "./components/AnalogClock.vue";
import TimeControls from "./components/TimeControls.vue";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import TimingList from "./components/TimingList.vue";

const switchClock = ref(true);
const isExamMode = ref(false);
const examTimes = ref(null);
const currentTimeStamp = ref(Date.now());

// 创建定时器更新时间
let timer = null;

onMounted(() => {
  // 每秒更新时间戳
  timer = setInterval(() => {
    currentTimeStamp.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

// 统一的时间计算，依赖于 currentTimeStamp
const currentTime = computed(() => {
  if (!isExamMode.value || !examTimes.value) {
    // 非考试模式，返回当前时间
    const now = new Date(currentTimeStamp.value);
    return {
      date: now,
      display: getCurrentDisplayTime(),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
    };
  }

  // 考试模式
  const remaining = getRemainingTime(examTimes.value, currentTimeStamp.value);
  const examTime = getExamDisplayTime(examTimes.value);
  return {
    date: examTime,
    display: remaining.isFinished
      ? "--:--:--"
      : `${formatTime(remaining.hours)} : ${formatTime(
          remaining.minutes
        )} : ${formatTime(remaining.seconds)}`,
    hours: remaining.hours,
    minutes: remaining.minutes,
    seconds: remaining.seconds,
    isFinished: remaining.isFinished,
  };
});

// 使用 watch 监听时间状态，处理考试结束
watch(
  () => currentTime.value?.isFinished,
  async (isFinished) => {
    if (isFinished && isExamMode.value) {
      try {
        // 先进行最后一次计次
        if (timingListRef.value) {
          timingListRef.value.handleLapTime();
        }

        // 然后显示时间到的提示
        await ElMessageBox.alert("时间到啦！！！", "时间到", {
          confirmButtonText: "做完啦！！！",
        });
        handleReset();
      } catch (error) {
        console.error("Error handling exam finish:", error);
      }
    }
  }
);

const showCountdown = ref(false);
const countdownNumber = ref(3);

// 倒计时函数
const startCountdown = (callback) => {
  showCountdown.value = true;
  countdownNumber.value = 3;

  const countdownInterval = setInterval(() => {
    countdownNumber.value--;
    if (countdownNumber.value <= 0) {
      clearInterval(countdownInterval);
      showCountdown.value = false;
      callback?.();
    }
  }, 1000);

  // 返回清理函数
  return () => {
    clearInterval(countdownInterval);
    showCountdown.value = false;
  };
};

// 添加音频提醒
const alertAudio = new Audio("alert.mp3");

let alertTimer = null;
// 处理时间设置
const handleSetTime = (duration, hour, minutes, seconds) => {
  startCountdown(() => {
    examTimes.value = createExamTime(duration, hour, minutes, seconds);
    isExamMode.value = true;
  });

  const alertTime = (duration / 60 - 15) * 60 * 1000 + 3000;
  alertTimer = setTimeout(() => {
    ElMessage("15分钟倒计时");
    alertAudio.play();
  }, alertTime);
};

// 处理重置
const handleReset = () => {
  examTimes.value = null;
  isExamMode.value = false;
  clearTimeout(alertTimer);
  alertTimer = null;
};

const timingListRef = ref(null); // 添加对 TimingList 组件的引用

const isFull = ref(false);
const handleFull = () => {
  isFull.value = !isFull.value;
};
</script>

<style>
#app {
  position: relative;
  min-height: 100vh;
}

.clock-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 20px;
}

.timing-list-container {
  flex: 0 0 400px;
}

.clock-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.clock-set-wrapper {
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.3);
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  border-radius: 10px;
  opacity: 0.3;
  margin-bottom: 20px;
}

.clock-set-wrapper:hover {
  opacity: 1;
}

.clock-set {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.clock-display {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 600px;
}

.clock-current {
  position: fixed;
  right: 10px;
  bottom: 0;
  opacity: 0.3;
}

.clock-countdown {
  font-size: 160px;
  font-weight: 500;
  text-align: center;
  border: 2px solid black;
  border-radius: 20px;
  padding: 20px 40px;
  margin: 0;
  background: rgba(255, 255, 255, 0.8);
  min-width: 900px;
  white-space: nowrap;
}

.fullscreen-countdown {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.countdown-number {
  font-size: 200px;
  color: white;
  font-weight: bold;
}

/* 移动端适配 */
@media screen and (max-width: 767px) {
  .clock-countdown {
    text-align: left;
    font-size: 80px;
    padding: 10px 20px;
    min-width: unset;
    overflow-x: auto;
  }

  .clock-display {
    min-height: 400px;
  }

  .clock-container {
    padding: 10px;
  }

  .clock-set-wrapper {
    padding: 10px;
    margin-bottom: 10px;
  }

  .countdown-number {
    font-size: 120px;
  }
}
.is-full {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: #000;
}
@media screen and (max-width: 767px) {
  .timing-list-container {
    display: none;
  }
}

</style>

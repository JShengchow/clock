<template>
  <div id="app">
    <div class="clock-container">
      <!-- 左侧计时列表 -->
      <TimingList 
        :is-countdown="isCoundown"
        :current-time="clockTime"
        class="timing-list-container"
      />

      <!-- 右侧时钟部分 -->
      <div class="clock-main">
        <div class="clock-set-wrapper">
          <div class="clock-set">
            <TimeControls 
              :is-countdown="isCoundown"
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

        <div class="clock-display">
          <div class="clock-countdown" v-show="!switchClock">
            {{ countdown.displayTime() }}
          </div>

          <AnalogClock 
            v-show="switchClock"
            :time="clockTime"
          />
        </div>

        <div class="clock-current">
          {{ currentClock.displayTime() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Clock } from './utils/Clock.js';
import AnalogClock from './components/AnalogClock.vue';
import TimeControls from './components/TimeControls.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TimingList from './components/TimingList.vue';

const switchClock = ref(true);
const isCoundown = ref(false);

// 计算当前显示的时间
const clockTime = computed(() => {
  if (!isCoundown.value) {
    return new Date(); // 非倒计时状态显示当前时间
  }
  return countdown.value.getCurrentDate(); // 倒计时状态显示设定时间
});

// 当前时钟
const currentClock = ref(new Clock(86400));
currentClock.value.start();

// 倒计时时钟
const countdown = ref(new Clock(5400));

const handleSetTime = (duration, hour, minutes, seconds) => {
  ElMessage.warning('即将开始');
  isCoundown.value = true;
  countdown.value = new Clock(duration, hour, minutes, seconds);
  countdown.value.start(() => {
    ElMessageBox.alert('时间到啦！！！', '时间到', {
      confirmButtonText: '做完啦！！！',
      callback: () => {
        handleReset();
      }
    });
  });
};

const handleReset = () => {
  if (countdown.value.timerID) {
    countdown.value.reset();
  }
  isCoundown.value = false;
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
}

.clock-countdown {
  font-size: 200px;
  font-weight: 500;
  text-align: center;
  border: 2px solid black;
  border-radius: 20px;
  padding: 40px;
  margin: 0;
  background: rgba(255, 255, 255, 0.8);
  min-width: 800px;
}

@media screen and (max-width: 767px) {
  .clock-countdown {
    text-align: left;
    font-size: 120px;
    padding: 20px;
    min-width: unset;
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
}
</style>
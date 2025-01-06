<template>
  <div class="clock" ref="clockRef">
    <div class="clock-pane">
      <div v-for="i in 12" :key="i" class="num" :style="{ '--i': i }">{{ i }}</div>
    </div>
    <div class="hour"></div>
    <div class="min"></div>
    <div class="sec"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  time: {
    type: Date,
    required: true
  }
});

const clockRef = ref(null);

const setClockAngle = (time) => {
  if (!clockRef.value) return;
  
  const clock = clockRef.value;
  clock.classList.remove('clock');
  
  // 触发重排
  void clock.offsetWidth;
  
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  
  clock.style.setProperty('--ds', s);
  clock.style.setProperty('--dm', m + s / 60);
  clock.style.setProperty('--dh', h + m / 60 + s / 3600);
  
  clock.classList.add('clock');
};

watch(() => props.time, (newTime) => {
  setClockAngle(newTime);
}, { 
  immediate: true,
  flush: 'post'
});

onMounted(() => {
  setClockAngle(props.time);
});
</script>

<style scoped>
.clock {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 600px;
  height: 600px;
  margin: 20px auto;
  font-size: 32px;
  border-radius: 30px;
  box-shadow: 2px 2px 20px rgba(0, 0, 0, .1);
  --step: 60s;
  background: white;
  padding: 20px;
}

.clock::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: 
    repeating-conic-gradient(
      from -.5deg,
      #333 0 1deg,
      transparent 1deg 30deg
    ),
    repeating-conic-gradient(
      from -.5deg,
      #ccc 0 1deg,
      transparent 1deg 6deg
    );
  -webkit-mask: radial-gradient(transparent 235px, red 0);
}

.clock-pane {
  width: 500px;
  height: 500px;
  position: absolute;
}

.num {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  transform: 
    translate(-50%, -50%) 
    rotate(calc(var(--i) * 30deg)) 
    translateY(-200px) 
    rotate(calc(var(--i) * -30deg));
  text-align: center;
}

.hour {
  position: absolute;
  width: 10px;
  height: 120px;
  background: #666;
  transform-origin: center bottom;
  transform: translateY(-50%) rotate(0);
  animation: clock calc(var(--step) * 60 * 12) infinite linear;
  animation-delay: calc(-1 * var(--step) * var(--dh) * 60);
  will-change: transform;
}

.min {
  position: absolute;
  width: 8px;
  height: 180px;
  background: #333;
  transform-origin: center bottom;
  transform: translateY(-50%) rotate(0);
  animation: clock calc(var(--step) * 60) infinite linear;
  animation-delay: calc(-1 * var(--step) * var(--dm));
  will-change: transform;
}

.sec {
  position: absolute;
  width: 2px;
  height: 220px;
  background: red;
  transform-origin: center bottom;
  transform: translateY(-50%) rotate(0);
  animation: clock var(--step) infinite steps(60);
  animation-delay: calc(-1 * var(--step) * var(--ds) / 60);
  will-change: transform;
}

.sec::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  left: 50%;
  bottom: 0;
  background: #fff;
  border: 6px solid #333;
  transform: translate(-50%, 50%);
}

@media screen and (max-width: 767px) {
  .clock {
    width: 300px;
    height: 300px;
    font-size: 24px;
    padding: 10px;
  }

  .clock::before {
    width: 250px;
    height: 250px;
    -webkit-mask: radial-gradient(transparent 120px, red 0);
  }

  .clock-pane {
    width: 220px;
    height: 220px;
  }

  .hour {
    width: 4px;
    height: 60px;
  }

  .min {
    width: 3px;
    height: 90px;
  }

  .sec {
    width: 2px;
    height: 120px;
  }

  .sec::after {
    width: 10px;
    height: 10px;
    border: 4px solid #333;
  }

  .num {
    transform: translate(-50%, -50%) 
      rotate(calc(var(--i) * 30deg)) 
      translateY(-105px);
  }
}

@keyframes clock {
  from {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
</style>
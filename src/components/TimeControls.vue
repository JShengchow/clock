<template>
  <div class="clock-set">
    <el-button 
      v-for="preset in timePresets" 
      :key="preset.name"
      @click="handleSetTime(preset)"
      :disabled="isCountdown"
      type="primary"
    >
      {{ preset.name }}
    </el-button>
    
    <el-button 
      @click="handleReset" 
      type="primary" 
      :disabled="!isCountdown" 
      plain
    >
      重置
    </el-button>
    
    <el-button 
      :disabled="isCountdown" 
      @click="visible = true"
    >
      自定义时间
    </el-button>

    <el-dialog v-model="visible" title="开始时间" center align-center>
      <div class="cust-dialog">
        <div v-for="(field, key) in customTime" :key="key">
          <el-input-number 
            v-model="customTime[key].value" 
            :min="0" 
            :max="field.max"
          />
          {{ field.label }}
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleCustomTime">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  isCountdown: Boolean
});

const emit = defineEmits(['setTime', 'reset']);

const timePresets = [
  { name: '事业单位（广东）', duration: 5405, hour: 9, minute: 29, second: 55 },
  { name: '行测时间（广东）', duration: 5405, hour: 13, minute: 59, second: 55 },
  { name: '申论时间（广东）', duration: 7205, hour: 16, minute: 14, second: 55 },
  { name: '行测时间（国考）', duration: 7205, hour: 8, minute: 59, second: 55 },
];

const visible = ref(false);
const customTime = reactive({
  hour: { value: 0, max: 24, label: '时' },
  minute: { value: 0, max: 60, label: '分' },
  second: { value: 0, max: 60, label: '秒' },
  duration: { value: 0, max: Infinity, label: '秒' },
});

const handleSetTime = (preset) => {
  emit('setTime', preset.duration, preset.hour, preset.minute, preset.second);
  visible.value = false;
};

const handleCustomTime = () => {
  const hour = parseInt(customTime.hour.value) || 0;
  const minutes = parseInt(customTime.minute.value) || 0;
  const seconds = parseInt(customTime.second.value) || 0;
  
  // 确保至少有1秒钟
  if (hour === 0 && minutes === 0 && seconds === 0) {
    ElMessage.error('请至少设置1秒钟的时间');
    return;
  }

  const duration = (hour * 3600) + (minutes * 60) + seconds;
  emit('setTime', duration, hour, minutes, seconds);
  
  // 清空输入
  customTime.hour.value = '';
  customTime.minute.value = '';
  customTime.second.value = '';
};

const handleReset = () => {
  emit('reset');
};
</script>

<style scoped>
.clock-set {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.cust-dialog {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.el-input-number {
  width: 120px;
  margin: 0 8px;
}

:deep(.el-button) {
  margin: 0;
}
</style>
<template>
  <div class="clock-set">
    <el-button 
      v-for="preset in timePresets" 
      :key="preset.name"
      @click="handleSetTime(preset)"
      :disabled="isExamMode"
      type="primary"
    >
      {{ preset.name }}
    </el-button>
    
    <el-button 
      @click="handleReset" 
      type="primary" 
      :disabled="!isExamMode" 
      plain
    >
      重置
    </el-button>
    
    <el-button 
      :disabled="isExamMode" 
      @click="visible = true"
    >
      自定义时间
    </el-button>

    <el-dialog v-model="visible" title="考试时间设置" width="400px" center>
      <div class="time-settings">
        <div class="time-section">
          <h4>开始时间</h4>
          <div class="time-inputs">
            <el-input-number 
              v-model="customTime.startHour.value" 
              :min="0" 
              :max="23"
              placeholder="时"
            />
            <span class="time-separator">:</span>
            <el-input-number 
              v-model="customTime.startMinute.value" 
              :min="0" 
              :max="59"
              placeholder="分"
            />
          </div>
        </div>

        <div class="time-section">
          <h4>持续时间</h4>
          <div class="time-inputs">
            <el-input-number 
              v-model="customTime.durationMinute.value" 
              :min="0" 
              :max="999"
              placeholder="分钟"
            />
            <span class="time-separator">:</span>
            <el-input-number 
              v-model="customTime.durationSecond.value" 
              :min="0" 
              :max="59"
              placeholder="秒"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleCustomTime">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  isExamMode: Boolean
});

const emit = defineEmits(['setTime', 'reset']);

const timePresets = [
  { name: '事业单位（广东）', duration: 5400, hour: 9, minute: 30, second: 0 },
  { name: '行测时间（广东）', duration: 5400, hour: 14, minute: 0, second: 0 },
  { name: '申论时间（广东）', duration: 7200, hour: 16, minute: 15, second: 0 },
  { name: '行测时间（国考）', duration: 7200, hour: 9, minute: 0, second: 0 },
];

const visible = ref(false);
const customTime = reactive({
  startHour: { value: 14, max: 23 },
  startMinute: { value: 0, max: 59 },
  durationMinute: { value: 90, max: 999 },
  durationSecond: { value: 0, max: 59 },
});

const handleSetTime = (preset) => {
  emit('setTime', preset.duration, preset.hour, preset.minute, preset.second);
  visible.value = false;
};

const handleCustomTime = () => {
  const startHour = parseInt(customTime.startHour.value);
  const startMinute = parseInt(customTime.startMinute.value);
  const durationMinutes = parseInt(customTime.durationMinute.value) || 0;
  const durationSeconds = parseInt(customTime.durationSecond.value) || 0;

  // 验证输入
  if (isNaN(startHour) || isNaN(startMinute) || startHour >= 24 || startMinute >= 60) {
    ElMessage.error('请输入有效的开始时间');
    return;
  }

  if (durationMinutes === 0 && durationSeconds === 0) {
    ElMessage.error('请输入有效的持续时间');
    return;
  }

  // 计算总持续时间（秒）
  const duration = (durationMinutes * 60) + durationSeconds;

  const preset = {
    duration: duration,
    hour: startHour,
    minute: startMinute,
    second: 0
  };

  handleSetTime(preset);
  
  visible.value = false;
  
  // 使用24小时制显示时间
  const formattedHour = startHour.toString().padStart(2, '0');
  const formattedMinute = startMinute.toString().padStart(2, '0');
  ElMessage.success(`时钟将调至 ${formattedHour}:${formattedMinute} ，持续 ${durationMinutes}分${durationSeconds}秒`);
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

.time-settings {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.time-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-section h4 {
  margin: 0;
  color: #606266;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-separator {
  font-size: 20px;
  color: #909399;
  margin: 0 4px;
}

:deep(.el-input-number) {
  width: 100px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
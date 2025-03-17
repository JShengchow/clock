<template>
  <div class="clock-set">
    <!-- 预设时间按钮组 -->
    <div class="preset-group">
      <div
        v-for="preset in defaultPresets"
        :key="preset.name"
        class="preset-button-wrapper"
      >
        <el-button
          @click="handleSetTime(preset)"
          :disabled="isExamMode"
          type="primary"
          round
        >
          {{ preset.name }}
        </el-button>
      </div>
    </div>

    <!-- 自定义时间按钮组 -->
    <div v-if="customPresets.length" class="preset-group custom-group">
      <div
        v-for="preset in customPresets"
        :key="preset.name"
        class="preset-button-wrapper"
      >
        <el-button
          @click="handleSetTime(preset)"
          :disabled="isExamMode"
          type="info"
          size="small"
          round
        >
          {{ preset.name }}
        </el-button>
        <el-icon class="delete-icon" @click="handleDeletePreset(preset)">
          <Delete />
        </el-icon>
      </div>
    </div>

    <!-- 控制按钮组 -->
    <div class="control-group">
      <el-button
        @click="handleReset"
        type="primary"
        :disabled="!isExamMode"
        plain
      >
        重置
      </el-button>

      <el-button :disabled="isExamMode" @click="visible = true">
        自定义时间
      </el-button>
    </div>

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

        <div class="save-preset">
          <el-checkbox v-model="saveAsPreset">添加为常用练习时间</el-checkbox>

          <!-- 添加自定义名称输入框 -->
          <div v-if="saveAsPreset" class="custom-name-input">
            <el-input
              v-model="customPresetName"
              placeholder="输入自定义名称（可选）"
              clearable
              :maxlength="8"
            >
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
            <div class="name-hint">不填写则默认使用"自定义练习1/2/3..."</div>
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
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit } from "@element-plus/icons-vue";

const props = defineProps({
  isExamMode: Boolean,
});

const emit = defineEmits(["setTime", "reset"]);

// 分开存储预设和自定义时间
const defaultPresets = [
  {
    name: "事业单位（广东）",
    duration: 5400,    // 1.5小时 = 90分钟 = 5400秒
    hour: 15,         // 15点 = 下午3点
    minute: 0,        // 整点开始
    second: 0,
    isCustom: false,
  },
  {
    name: "行测时间（广东）",
    duration: 5400,
    hour: 14,
    minute: 0,
    second: 0,
    isCustom: false,
  },
  {
    name: "申论时间（广东）",
    duration: 7200,
    hour: 16,
    minute: 15,
    second: 0,
    isCustom: false,
  },
  {
    name: "行测时间（国考）",
    duration: 7200,
    hour: 9,
    minute: 0,
    second: 0,
    isCustom: false,
  },
];

const customPresets = ref([]);

// 合并所有时间预设
const allTimePresets = computed(() => [
  ...defaultPresets,
  ...customPresets.value,
]);

const visible = ref(false);
const saveAsPreset = ref(false);
const customPresetName = ref(""); // 添加自定义名称

const customTime = reactive({
  startHour: { value: 14, max: 23 },
  startMinute: { value: 0, max: 59 },
  durationMinute: { value: 90, max: 999 },
  durationSecond: { value: 0, max: 59 },
});

// 加载保存的自定义预设
onMounted(() => {
  const saved = localStorage.getItem("customTimePresets");
  if (saved) {
    customPresets.value = JSON.parse(saved);
  }
});

const handleSetTime = (preset) => {
  emit("setTime", preset.duration, preset.hour, preset.minute, preset.second);
  visible.value = false;
};

const handleCustomTime = () => {
  const startHour = parseInt(customTime.startHour.value);
  const startMinute = parseInt(customTime.startMinute.value);
  const durationMinutes = parseInt(customTime.durationMinute.value) || 0;
  const durationSeconds = parseInt(customTime.durationSecond.value) || 0;

  // 验证输入
  if (
    isNaN(startHour) ||
    isNaN(startMinute) ||
    startHour >= 24 ||
    startMinute >= 60
  ) {
    ElMessage.error("请输入有效的开始时间");
    return;
  }

  if (durationMinutes === 0 && durationSeconds === 0) {
    ElMessage.error("请输入有效的持续时间");
    return;
  }

  // 计算总持续时间（秒）
  const duration = durationMinutes * 60 + durationSeconds;

  const preset = {
    duration: duration,
    hour: startHour,
    minute: startMinute,
    second: 0,
    isCustom: true,
  };

  // 如果选择保存为预设
  if (saveAsPreset.value) {
    const customIndex = customPresets.value.length + 1;
    // 使用自定义名称或默认名称
    preset.name = customPresetName.value.trim() || `自定义练习${customIndex}`;
    customPresets.value.push(preset);
    // 保存到本地存储
    localStorage.setItem(
      "customTimePresets",
      JSON.stringify(customPresets.value)
    );
    ElMessage.success(`已添加为常用练习时间：${preset.name}`);
  }

  handleSetTime(preset);

  visible.value = false;
  saveAsPreset.value = false;
  customPresetName.value = ""; // 重置名称输入

  // 使用24小时制显示时间
  const formattedHour = startHour.toString().padStart(2, "0");
  const formattedMinute = startMinute.toString().padStart(2, "0");
  ElMessage.success(
    `时钟将调至 ${formattedHour}:${formattedMinute} ，持续 ${durationMinutes}分${durationSeconds}秒`
  );
};

const handleReset = () => {
  emit("reset");
};

// 删除自定义预设
const handleDeletePreset = (preset) => {
  ElMessageBox.confirm(`确定要删除 "${preset.name}" 吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 从数组中移除
      customPresets.value = customPresets.value.filter(
        (p) => p.name !== preset.name
      );

      // 重新编号剩余的自定义预设
      customPresets.value = customPresets.value.map((p, index) => ({
        ...p,
        name: `自定义练习${index + 1}`,
      }));

      // 更新本地存储
      localStorage.setItem(
        "customTimePresets",
        JSON.stringify(customPresets.value)
      );

      ElMessage.success("删除成功");
    })
    .catch(() => {});
};
</script>

<style scoped>
.clock-set {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.preset-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  background: rgba(64, 158, 255, 0.05);
}

.custom-group {
  background: rgba(0, 0, 0, 0.02);
}

.control-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
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

.save-preset {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-name-input {
  margin-top: 8px;
  padding-left: 24px; /* 与复选框对齐 */
}

.name-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  padding-left: 8px;
}

:deep(.el-input__prefix) {
  color: #909399;
}

.preset-button-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.delete-icon {
  position: absolute;
  right: -8px;
  top: -8px;
  padding: 4px;
  border-radius: 50%;
  background-color: #f56c6c;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.preset-button-wrapper:hover .delete-icon {
  opacity: 1;
}

.delete-icon:hover {
  transform: scale(1.1);
}
</style>

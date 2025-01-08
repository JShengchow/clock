<template>
  <div
    class="timing-list"
    :class="{ 'timing-list-inactive': !isHovered && !isPinned }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      v-if="isHovered || isPinned"
      class="pin-button"
      :class="{ 'pin-active': isPinned }"
      @click="isPinned = !isPinned"
    ></div>
    <div class="timing-header">
      <div class="header-cell">
        <p>模块</p>
        <div class="module-controls">
          <el-button type="primary" text plain @click="handleAddModule">
            +1 模块
          </el-button>
          <el-button
            v-if="timingRecords.length > DEFAULT_ROWS"
            type="danger"
            text
            plain
            @click="handleDeleteLastModule"
          >
            -1 模块
          </el-button>
        </div>
      </div>
      <div class="header-cell">计次时间</div>
      <div class="header-cell">模块用时</div>
    </div>

    <div class="timing-rows">
      <div
        v-for="(record, index) in timingRecords"
        :key="index"
        class="timing-row"
      >
        <div class="cell">
          <el-input
            v-model="record.module"
            :placeholder="`模块${index + 1}`"
            @change="handleModuleChange(index, $event)"
          />
        </div>
        <div class="cell">{{ record.lapTime }}</div>
        <div class="cell">{{ record.accumulatedTime }}</div>
      </div>
    </div>
    <div class="timing-controls">
      <el-button
        type="primary"
        @click="handleLapTime"
        :disabled="!isExamMode || currentIndex >= timingRecords.length"
      >
        计次
      </el-button>
      <el-button type="warning" @click="handleReset" :disabled="!hasRecords">
        重置
      </el-button>
      <el-button type="success" @click="handleArchive" :disabled="!hasRecords">
        归档
      </el-button>
    </div>

    <div class="archive-section" v-if="archives.length">
      <div class="archive-header">
        <h3>归档记录</h3>
      </div>

      <el-collapse v-model="activeArchives">
        <el-collapse-item
          v-for="(archive, archiveIndex) in archives"
          :key="archive.timestamp"
          :name="archiveIndex"
        >
          <template #title>
            <div class="archive-title">
              <span>{{ formatArchiveTime(archive.timestamp) }}</span>
              <el-button
                type="danger"
                size="small"
                @click.stop="handleDeleteArchive(archiveIndex)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="archive-records">
            <div
              class="archive-record"
              v-for="(record, index) in archive.records"
              :key="index"
            >
              <span class="record-module">{{ record.module }}</span>
              <span class="record-time">{{ record.lapTime }}</span>
              <span class="record-duration">{{ record.accumulatedTime }}</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

const props = defineProps({
  isExamMode: Boolean,
  currentTime: {
    type: Date,
    required: true,
  },
});

const DEFAULT_ROWS = 5;
const EMPTY_RECORD = {
  module: "",
  lapTime: "--:--:--",
  accumulatedTime: "--:--:--",
};

const timingRecords = ref(
  Array(DEFAULT_ROWS)
    .fill()
    .map(() => ({ ...EMPTY_RECORD }))
);
const currentIndex = ref(0);

// 计算是否有记录可以归档
const hasRecords = computed(() => {
  return timingRecords.value.some((record) => record.lapTime !== "--:--:--");
});

let isFirstLap = ref(true);
let examStartTime = ref(null);

const archives = ref([]);
const activeArchives = ref([]);

const isHovered = ref(false);
const isPinned = ref(false);

// 从 localStorage 加载数据
onMounted(() => {
  const savedModules = localStorage.getItem("timingModules");
  if (savedModules) {
    const modules = JSON.parse(savedModules);
    // 确保至少有5行
    const records = modules.map((module) => ({
      module,
      lapTime: "--:--:--",
      accumulatedTime: "--:--:--",
    }));
    while (records.length < DEFAULT_ROWS) {
      records.push({ ...EMPTY_RECORD });
    }
    timingRecords.value = records;
  }

  const savedArchives = localStorage.getItem("timingArchives");
  if (savedArchives) {
    archives.value = JSON.parse(savedArchives).reverse();
  }
});

// 重置函数
const resetRecords = (keepModules = true) => {
  timingRecords.value = timingRecords.value.map((record) => ({
    module: keepModules ? record.module : "",
    lapTime: "--:--:--",
    accumulatedTime: "--:--:--",
  }));
  currentIndex.value = 0;
};

// 监听倒计时状态变化
watch(
  () => props.isExamMode,
  (newValue) => {
    if (newValue) {
      // 使用传入的当前时间作为考试开始时间
      examStartTime.value = props.currentTime;
      isFirstLap.value = true;
      resetRecords(true);
    } else {
      examStartTime.value = null;
    }
  },
  { immediate: true } // 立即执行一次
);

// 处理模块名称变化
const handleModuleChange = (index, value) => {
  const modules = timingRecords.value.map((record) => record.module);
  localStorage.setItem("timingModules", JSON.stringify(modules));
};

// 增加模块按钮处理函数
const handleAddModule = () => {
  timingRecords.value.push({ ...EMPTY_RECORD });
  handleModuleChange();
};

// 处理计次
const handleLapTime = () => {
  if (currentIndex.value >= timingRecords.value.length) {
    ElMessage.warning("已到达最后一行，请先增加模块");
    return;
  }

  const currentTime = props.currentTime;
  const timeString = formatTimeToString(currentTime);

  if (isFirstLap.value) {
    // 第一次计次
    const firstRecord = timingRecords.value[0];
    firstRecord.lapTime = timeString;
    const diffFromStart = Math.floor(
      (currentTime.getTime() - examStartTime.value.getTime()) / 1000
    );
    firstRecord.accumulatedTime = formatSeconds(diffFromStart);
    isFirstLap.value = false;
  } else {
    // 非第一次计次
    const currentRecord = timingRecords.value[currentIndex.value];
    currentRecord.lapTime = timeString;

    // 计算与上一次计次的时间差
    const prevTime = parseTimeString(
      timingRecords.value[currentIndex.value - 1].lapTime
    );
    const currTime = parseTimeString(timeString);
    const diffSeconds = Math.floor((currTime - prevTime) / 1000);
    currentRecord.accumulatedTime = formatSeconds(diffSeconds);
  }

  currentIndex.value++;
  handleModuleChange();
};

// 格式化时间为字符串
const formatTimeToString = (date) => {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
};

// 辅助函数：解析时间字符串
const parseTimeString = (timeStr) => {
  if (timeStr === "--:--:--") return 0;
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return new Date(0, 0, 0, hours, minutes, seconds).getTime();
};

// 辅助函数：格式化秒数
const formatSeconds = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};

// 格式化归档时间显示
const formatArchiveTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
};

// 修改归档功能
const handleArchive = () => {
  const timestamp = new Date().toISOString();
  const archive = {
    timestamp,
    records: timingRecords.value
      .filter((record) => record.lapTime !== "--:--:--") // 只保存有计次的记录
      .map((record, index) => ({
        module: record.module || `模块${index + 1}`,
        lapTime: record.lapTime,
        accumulatedTime: record.accumulatedTime,
      })),
  };

  // 更新本地存储
  const currentArchives = JSON.parse(
    localStorage.getItem("timingArchives") || "[]"
  );
  currentArchives.push(archive);
  localStorage.setItem("timingArchives", JSON.stringify(currentArchives));

  // 更新显示
  archives.value = [archive, ...archives.value];
  activeArchives.value = [0]; // 自动展开最新归档

  resetRecords(true);
  ElMessage.success("归档成功");
};

// 重置按钮处理函数
const handleReset = () => {
  ElMessageBox.confirm("确定要重置当前记录吗？模块名称将会保留。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      resetRecords(true);
      ElMessage.success("重置成功");
    })
    .catch(() => {});
};

// 删除归档记录
const handleDeleteArchive = (index) => {
  ElMessageBox.confirm("确定要删除这条归档记录吗？此操作不可恢复。", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 从显示列表中移除
      archives.value.splice(index, 1);

      // 更新本地存储
      const currentArchives = archives.value.slice().reverse(); // 恢复原始顺序
      localStorage.setItem("timingArchives", JSON.stringify(currentArchives));

      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

// 删除最后一个模块
const handleDeleteLastModule = () => {
  // 如果只剩下默认行数，不允许删除
  if (timingRecords.value.length <= DEFAULT_ROWS) {
    ElMessage.warning(`不能删除，至少需要保留 ${DEFAULT_ROWS} 个模块`);
    return;
  }

  // 如果要删除的行已经有计次记录，需要确认
  const lastRecord = timingRecords.value[timingRecords.value.length - 1];
  if (lastRecord.lapTime !== "--:--:--") {
    ElMessageBox.confirm("该模块已有计次记录，确定要删除吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        timingRecords.value.pop();
        handleModuleChange();
        ElMessage.success("删除成功");
      })
      .catch(() => {});
  } else {
    // 如果没有计次记录，直接删除
    timingRecords.value.pop();
    handleModuleChange();
  }
};

// 暴露给父组件的方法
const exposed = {
  handleLapTime: () => {
    // 只有在考试模式且还有可用行时才执行计次
    if (props.isExamMode && currentIndex.value < timingRecords.value.length) {
      handleLapTime();
    }
  },
};

// 暴露方法给父组件
defineExpose(exposed);
</script>

<style scoped>
.timing-list {
  position: relative;
  width: 100%;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.timing-list-inactive {
  height: 62px;
  overflow: hidden;
}

.timing-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
}

.header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-cell:first-child {
  /* justify-content: space-around; */
  padding: 0 8px;
}

.timing-rows {
  margin-bottom: 24px;
}

.timing-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timing-controls {
  margin: 24px 0;
  padding: 16px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: center;
  gap: 16px;
}

:deep(.el-input__inner) {
  text-align: left;
}

/* 添加当前行高亮样式 */
.timing-row:nth-child(${currentIndex + 1}) {
  background-color: #f0f9eb;
}

.timing-section {
  margin-bottom: 20px;
}

.archive-section {
  margin-top: 24px;
}

.archive-header {
  margin-bottom: 16px;
}

.archive-header h3 {
  margin: 0;
  color: #606266;
}

.archive-records {
  padding: 8px 0;
}

.archive-record {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.archive-record:last-child {
  border-bottom: none;
}

.record-module {
  color: #606266;
  font-weight: 500;
}

.record-time,
.record-duration {
  color: #909399;
  font-family: monospace;
}

.archive-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 16px;
}

:deep(.el-collapse-item__header) {
  padding-right: 0;
}

.module-controls {
  display: flex;
  flex-direction: column;
}

.pin-button {
  position: absolute;
  bottom: 10px;
  right: 50%;
  transform: translateX(50%);
  width: 50%;
  height: 6px;
  background: #eee;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.pin-button:hover {
  opacity: .8;
}

.pin-active {
  background: #b5cfe8;
  height: 6px;
  opacity: 1;
}
</style>

<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb v-if="!settingsStore.topNav" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="settingsStore.topNav" id="topmenu-container" class="topmenu-container" />

    <!-- 实时通话悬浮窗 -->
    <div v-if="activeCallVisible" class="active-call-floating">
      <div class="floating-close-btn" @click="closeActiveCall">
        <i class="el-icon-close"></i>
      </div>
      <div class="floating-content">
        <div class="floating-title">
          <i class="el-icon-phone-outline"></i>
          <span>正在通话中</span>
        </div>
        <div class="floating-customer">
          <span class="customer-name">{{ activeCallData.customerName }}</span>
          <span class="customer-phone">{{ activeCallData.phone }}</span>
        </div>
        <div v-if="activeCallData.consumptionAmount !== null && activeCallData.consumptionAmount !== undefined" class="floating-amount">
          <i class="el-icon-money"></i>
          <span>消费金额: ¥{{ activeCallData.consumptionAmount }}</span>
        </div>
        <div v-if="activeCallData.taskName" class="floating-task">
          <i class="el-icon-collection-tag"></i>
          <span>任务: {{ activeCallData.taskName }}</span>
        </div>
        <div v-if="activeCallData.remark" class="floating-remark">
          <i class="el-icon-document"></i>
          <span>{{ activeCallData.remark }}</span>
        </div>
        <div v-if="activeCallData.callStartTime" class="floating-duration">
          <i class="el-icon-time"></i>
          <span>通话时长: {{ formatCallDuration(activeCallData.callStartTime) }}</span>
        </div>
      </div>
    </div>

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <!-- <header-search id="header-search" class="right-menu-item" />

        <el-tooltip content="源码地址" effect="dark" placement="bottom">
          <ruo-yi-git id="ruoyi-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="文档地址" effect="dark" placement="bottom">
          <ruo-yi-doc id="ruoyi-doc" class="right-menu-item hover-effect" />
        </el-tooltip> -->

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="待办事项" effect="dark" placement="bottom">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="right-menu-item hover-effect">
            <el-icon :size="20" @click="showTodoDialog">
              <Bell />
            </el-icon>
          </el-badge>
        </el-tooltip>

        <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="toggleTheme">
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
          </div>
        </el-tooltip>

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown @command="handleCommand" class="avatar-container right-menu-item hover-effect" trigger="hover">
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar" />
          <span class="user-nickname"> {{ userStore.nickName }} </span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="right-menu-item hover-effect setting" @click="setLayout" v-if="settingsStore.showSettings">
        <svg-icon icon-class="more-up" />
      </div>
    </div>

    <!-- 待办事项弹窗 -->
    <el-dialog title="我的待办事项" v-model="todoDialogVisible" width="900px" append-to-body>
      <el-table v-loading="todoLoading" :data="todoList" @row-click="handleTodoRowClick">
        <el-table-column label="状态" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="warning">未读</el-tag>
            <el-tag v-else type="success">已读</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标题" align="center" prop="title" />
        <el-table-column label="客户" align="center" prop="customerName" width="120" />
        <el-table-column label="手机号" align="center" prop="customerPhone" width="120" />
        <el-table-column label="提醒时间" align="center" prop="remindTime" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.remindTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === '0'" 
              link 
              type="primary" 
              @click.stop="handleMarkAsRead(scope.row.id)"
            >标记已读</el-button>
            <el-button 
              link 
              type="danger" 
              @click.stop="handleDeleteTodo(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="todoTotal > 0"
        :total="todoTotal"
        v-model:page="todoQueryParams.pageNum"
        v-model:limit="todoQueryParams.pageSize"
        @pagination="getTodoList"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleBatchMarkAsRead" type="primary" :disabled="todoList.filter(item => item.status === '0').length === 0">全部已读</el-button>
          <el-button @click="todoDialogVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import { getUnreadCount, listTodoItem, markAsRead, batchMarkAsRead, delTodoItem } from '@/api/system/todoItem'
import { getActiveCall } from '@/api/system/activeCall'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

// 待办事项相关
const unreadCount = ref(0)
const todoDialogVisible = ref(false)
const todoLoading = ref(false)
const todoList = ref([])
const todoTotal = ref(0)
const todoQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  status: null
})

let pollingTimer = null

// 实时通话状态相关
const activeCallVisible = ref(false)
const activeCallData = ref({
  customerName: '',
  phone: '',
  consumptionAmount: null,
  remark: '',
  taskName: '',
  callStartTime: null
})

let activeCallPollingTimer = null

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout()
      break
    case "logout":
      logout()
      break
    default:
      break
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => { })
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}

function toggleTheme() {
  settingsStore.toggleTheme()
}

// 获取未读待办事项数量
function loadUnreadCount() {
  getUnreadCount().then(res => {
    unreadCount.value = res.data
  }).catch(err => {
    console.error('获取未读待办事项数量失败:', err)
  })
}

// 显示待办事项弹窗
function showTodoDialog() {
  todoDialogVisible.value = true
  getTodoList()
}

// 获取待办事项列表
function getTodoList() {
  todoLoading.value = true
  listTodoItem(todoQueryParams).then(res => {
    todoList.value = res.rows
    todoTotal.value = res.total
    todoLoading.value = false
  }).catch(err => {
    console.error('获取待办事项列表失败:', err)
    todoLoading.value = false
  })
}

// 标记单个为已读
function handleMarkAsRead(id) {
  markAsRead(id).then(() => {
    ElMessageBox.success('已标记为已读')
    getTodoList()
    loadUnreadCount()
  }).catch(err => {
    console.error('标记已读失败:', err)
  })
}

// 批量标记为已读
function handleBatchMarkAsRead() {
  const unreadIds = todoList.value.filter(item => item.status === '0').map(item => item.id)
  if (unreadIds.length === 0) {
    return
  }
  batchMarkAsRead(unreadIds).then(() => {
    ElMessageBox.success('已全部标记为已读')
    getTodoList()
    loadUnreadCount()
  }).catch(err => {
    console.error('批量标记已读失败:', err)
  })
}

// 删除待办事项
function handleDeleteTodo(id) {
  ElMessageBox.confirm('确定要删除该待办事项吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delTodoItem(id).then(() => {
      ElMessageBox.success('删除成功')
      getTodoList()
      loadUnreadCount()
    }).catch(err => {
      console.error('删除待办事项失败:', err)
    })
  }).catch(() => {})
}

// 点击行标记已读
function handleTodoRowClick(row) {
  if (row.status === '0') {
    handleMarkAsRead(row.id)
  }
}

// 格式化日期时间
function formatDateTime(dateTime) {
  if (!dateTime) return ''
  return dateTime
}

// 获取实时通话状态
function loadActiveCall() {
  getActiveCall().then(res => {
    if (res.data && res.data.phone) {
      // 有正在进行的通话
      activeCallData.value = {
        customerName: res.data.customerName || '未知客户',
        phone: res.data.phone,
        consumptionAmount: res.data.consumptionAmount,
        remark: res.data.remark || '',
        taskName: res.data.taskName || '',
        callStartTime: res.data.callStartTime
      }
      activeCallVisible.value = true
    } else {
      // 没有通话，隐藏悬浮窗
      activeCallVisible.value = false
    }
  }).catch(err => {
    console.error('获取实时通话状态失败:', err)
    activeCallVisible.value = false
  })
}

// 关闭实时通话悬浮窗
function closeActiveCall() {
  activeCallVisible.value = false
}

// 格式化通话时长
function formatCallDuration(startTime) {
  if (!startTime) return ''
  const start = new Date(startTime)
  const now = new Date()
  const diff = Math.floor((now - start) / 1000) // 秒
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 页面加载时获取未读数量
onMounted(() => {
  loadUnreadCount()
  // 每30秒轮询一次未读数量
  pollingTimer = setInterval(() => {
    loadUnreadCount()
  }, 30000)
  
  // 立即加载一次实时通话状态
  loadActiveCall()
  // 每3秒轮询一次实时通话状态
  activeCallPollingTimer = setInterval(() => {
    loadActiveCall()
  }, 3000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
  if (activeCallPollingTimer) {
    clearInterval(activeCallPollingTimer)
  }
})
</script>

<style lang='scss' scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      &.theme-switch-wrapper {
        display: flex;
        align-items: center;

        svg {
          transition: transform 0.3s;
          
          &:hover {
            transform: scale(1.15);
          }
        }
      }
    }

    :deep(.el-badge) {
      line-height: 50px;
      
      .el-icon {
        cursor: pointer;
        transition: transform 0.3s;
        
        &:hover {
          transform: scale(1.15);
        }
      }
    }

    .avatar-container {
      margin-right: 0px;
      padding-right: 0px;

      .avatar-wrapper {
        margin-top: 10px;
        right: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }

        .user-nickname{
          position: relative;
          left: 5px;
          bottom: 10px;
          font-size: 14px;
          font-weight: bold;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

/* 实时通话悬浮窗 */
.active-call-floating {
  position: fixed;
  top: 80px;
  right: 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.9));
  border-radius: 12px;
  padding: 20px;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  min-width: 280px;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.floating-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: rgba(255, 59, 48, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10000;
}

.floating-close-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 59, 48, 1);
}

.floating-close-btn i {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.floating-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.floating-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #00FF00;
  margin-bottom: 8px;
}

.floating-title i {
  font-size: 18px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.floating-customer {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.customer-name {
  font-size: 18px;
  color: #FFFFFF;
  font-weight: 600;
}

.customer-phone {
  font-size: 20px;
  color: #00FF00;
  font-weight: bold;
  letter-spacing: 1px;
}

.floating-amount,
.floating-task,
.floating-remark,
.floating-duration {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #E0E0E0;
}

.floating-amount {
  color: #FFD700;
  font-weight: 600;
}

.floating-amount i,
.floating-task i,
.floating-remark i,
.floating-duration i {
  font-size: 16px;
  color: #87CEEB;
}

.floating-duration {
  color: #87CEEB;
  font-weight: 600;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.floating-remark {
  font-size: 13px;
  color: #B0B0B0;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.4;
  max-height: 60px;
  overflow-y: auto;
}

.floating-remark::-webkit-scrollbar {
  width: 4px;
}

.floating-remark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>

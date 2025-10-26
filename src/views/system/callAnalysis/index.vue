<template>
  <div class="call-analysis-container">
    <!-- 搜索表单 -->
    <div class="search-section">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
        <!-- 超级管理员可以看到子管理员筛选 -->
        <el-form-item label="子管理员" prop="subAdminUserId" v-if="showSubAdminFilter">
          <el-select v-model="queryParams.subAdminUserId" placeholder="请选择子管理员" clearable style="width: 200px;" @change="handleSubAdminChange">
            <el-option
              v-for="subAdmin in subAdminList"
              :key="subAdmin.userId"
              :label="subAdmin.nickName"
              :value="subAdmin.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <!-- 超级管理员和子管理员可以看到公司管理员筛选 -->
        <el-form-item label="公司管理员" prop="companyUserId" v-if="showCompanyFilter">
          <el-select v-model="queryParams.companyUserId" placeholder="请选择公司管理员" clearable style="width: 200px;" @change="handleCompanyChange">
            <el-option
              v-for="company in companyList"
              :key="company.userId"
              :label="company.nickName"
              :value="company.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <!-- 超级管理员、子管理员和公司管理员可以看到部长筛选 -->
        <el-form-item label="部长" prop="ministerUserId" v-if="showMinisterFilter">
          <el-select v-model="queryParams.ministerUserId" placeholder="请选择部长" clearable style="width: 200px;" @change="handleMinisterChange">
            <el-option
              v-for="minister in ministerList"
              :key="minister.userId"
              :label="minister.nickName"
              :value="minister.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <!-- 超级管理员、子管理员、公司管理员和部长可以看到业务员筛选 -->
        <el-form-item label="业务员" prop="salesmanUserId" v-if="showSalesmanFilter">
          <el-select v-model="queryParams.salesmanUserId" placeholder="请选择业务员" clearable style="width: 200px;" @change="getList">
            <el-option
              v-for="salesman in salesmanList"
              :key="salesman.userId"
              :label="salesman.nickName"
              :value="salesman.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px;"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 用户统计列表 -->
    <div class="table-section">
      <el-table 
        v-loading="loading" 
        :data="userStatisticsList" 
        border
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :load="loadChildrenData"
        lazy
        height="100%"
        class="statistics-table"
        stripe
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold', fontSize: '14px' }"
      >
        <el-table-column label="序号" type="index" width="70" align="center" fixed />
        <el-table-column label="名称" prop="displayName" min-width="180" align="left" fixed>
          <template #default="scope">
            <div class="name-cell">
              <span class="name-text">{{ scope.row.displayName || scope.row.nickName }}</span>
              <el-tag v-if="scope.row.nodeType" size="small" :type="getNodeTypeColor(scope.row.nodeType)" class="node-tag">
                {{ getNodeTypeLabel(scope.row.nodeType) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总通话时长" prop="totalCallDuration" width="130" align="center">
          <template #default="scope">
            <span class="duration-text">{{ formatDuration(scope.row.totalCallDuration) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="通话号码数" prop="uniquePhoneCount" width="120" align="center">
          <template #default="scope">
            <span class="count-text">{{ scope.row.uniquePhoneCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总记录数" prop="totalRecords" width="110" align="center">
          <template #default="scope">
            <span class="count-text">{{ scope.row.totalRecords || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平均通话时长" prop="avgCallDuration" width="130" align="center">
          <template #default="scope">
            <span class="duration-text">{{ formatDuration(scope.row.avgCallDuration) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="未拨号" prop="notDialedCount" width="100" align="center">
          <template #default="scope">
            <el-tag type="info" effect="plain" size="default">{{ scope.row.notDialedCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已拨号" prop="dialedCount" width="100" align="center">
          <template #default="scope">
            <el-tag type="warning" effect="plain" size="default">{{ scope.row.dialedCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已接听" prop="answeredCount" width="100" align="center">
          <template #default="scope">
            <el-tag type="success" effect="plain" size="default">{{ scope.row.answeredCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="未接听" prop="unansweredCount" width="100" align="center">
          <template #default="scope">
            <el-tag effect="plain" size="default">{{ scope.row.unansweredCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="拒接" prop="rejectedCount" width="90" align="center">
          <template #default="scope">
            <el-tag type="danger" effect="plain" size="default">{{ scope.row.rejectedCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="空号" prop="emptyNumberCount" width="90" align="center">
          <template #default="scope">
            <el-tag type="info" effect="plain" size="default">{{ scope.row.emptyNumberCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="停机" prop="suspendedCount" width="90" align="center">
          <template #default="scope">
            <el-tag type="warning" effect="plain" size="default">{{ scope.row.suspendedCount || 0 }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>

<script setup name="CallAnalysis">
import { ref, onMounted, computed } from 'vue'
import { getUserCallStatistics, getUserCallStatisticsTree } from '@/api/system/callRecord'
import { getSubAdminList, getRoleUserList } from '@/api/system/user'
import { getUserProfile } from '@/api/system/user'

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const userStatisticsList = ref([])
const dateRange = ref([])
const subAdminList = ref([])
const companyList = ref([])
const ministerList = ref([])
const salesmanList = ref([])

// 当前登录用户信息
const currentUser = ref(null)
const currentUserRole = ref(null)

const queryParams = ref({
  subAdminUserId: null,
  companyUserId: null,
  ministerUserId: null,
  salesmanUserId: null
})

// 根据当前用户角色显示不同的筛选条件
const showSubAdminFilter = computed(() => {
  // 只有超级管理员可以看到子管理员筛选
  return currentUserRole.value === 'admin'
})

const showCompanyFilter = computed(() => {
  // 超级管理员和子管理员可以看到公司管理员筛选
  return currentUserRole.value === 'admin' || currentUserRole.value === 'subAdmin'
})

const showMinisterFilter = computed(() => {
  // 超级管理员、子管理员和公司管理员可以看到部长筛选
  return currentUserRole.value === 'admin' || currentUserRole.value === 'subAdmin' || currentUserRole.value === 'companyManager'
})

const showSalesmanFilter = computed(() => {
  // 超级管理员、子管理员、公司管理员和部长可以看到业务员筛选
  return currentUserRole.value === 'admin' || currentUserRole.value === 'subAdmin' || 
         currentUserRole.value === 'companyManager' || currentUserRole.value === 'minister'
})

// 格式化通话时长
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0秒'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  let result = ''
  if (hours > 0) result += `${hours}小时`
  if (minutes > 0) result += `${minutes}分`
  if (secs > 0 || result === '') result += `${secs}秒`
  
  return result
}

// 获取用户统计列表（树形聚合展示）
function getList() {
  loading.value = true
  
  const params = {}
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  // 根据筛选条件确定查询层级
  if (queryParams.value.subAdminUserId) {
    params.subAdminUserId = queryParams.value.subAdminUserId
  } else if (queryParams.value.companyUserId) {
    params.companyUserId = queryParams.value.companyUserId
  } else if (queryParams.value.ministerUserId) {
    params.ministerUserId = queryParams.value.ministerUserId
  } else if (queryParams.value.salesmanUserId) {
    params.salesmanUserId = queryParams.value.salesmanUserId
  }
  
  getUserCallStatisticsTree(params).then(response => {
    const list = response.rows || []
    // 为每个节点添加唯一ID和hasChildren属性
    userStatisticsList.value = list.map((item, index) => {
      return {
        ...item,
        id: `${item.nodeType || 'node'}_${item.aggregateKey || item.userId || index}`,
        hasChildren: checkHasChildren(item.nodeType)
      }
    })
    total.value = response.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 获取节点类型标签
function getNodeTypeLabel(nodeType) {
  const labelMap = {
    'company': '公司',
    'department': '部门',
    'person': '个人'
  }
  return labelMap[nodeType] || ''
}

// 获取节点类型颜色
function getNodeTypeColor(nodeType) {
  const colorMap = {
    'company': 'success',
    'department': 'warning',
    'person': ''
  }
  return colorMap[nodeType] || ''
}

// 检查是否有下级
function checkHasChildren(nodeType) {
  // person（个人）节点没有下级
  return nodeType === 'company' || nodeType === 'department'
}

// 懒加载子节点数据（聚合统计）
function loadChildrenData(row, treeNode, resolve) {
  const params = {
    nodeType: row.nodeType,
    nodeId: row.aggregateKey || row.userId
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  getUserCallStatisticsTree(params).then(response => {
    const children = (response.rows || []).map((item, index) => {
      return {
        ...item,
        id: `${item.nodeType || 'node'}_${item.aggregateKey || item.userId || index}_${Date.now()}`,
        hasChildren: checkHasChildren(item.nodeType)
      }
    })
    resolve(children)
  }).catch(() => {
    resolve([])
  })
}

// 获取当前用户信息并确定角色
function getCurrentUserInfo() {
  getUserProfile().then(response => {
    currentUser.value = response.data
    const roles = response.data.roles || []
    
    // 判断当前用户角色
    if (response.data.userId === 1 || roles.some(role => role.roleId === 1)) {
      currentUserRole.value = 'admin' // 超级管理员
    } else if (roles.some(role => role.roleId === 103)) {
      currentUserRole.value = 'subAdmin' // 子管理员
    } else if (roles.some(role => role.roleId === 102)) {
      currentUserRole.value = 'companyManager' // 公司管理员
    } else if (roles.some(role => role.roleId === 101)) {
      currentUserRole.value = 'minister' // 部长
    } else if (roles.some(role => role.roleId === 2)) {
      currentUserRole.value = 'salesman' // 业务员
    }
    
    // 根据角色初始化筛选列表
    initRoleBasedFilters()
  })
}

// 根据角色初始化筛选列表
function initRoleBasedFilters() {
  if (currentUserRole.value === 'admin') {
    // 超级管理员：加载所有层级的筛选列表（不需要层级依赖）
    fetchSubAdminList()
    fetchCompanyList() // 加载所有公司管理员
    fetchMinisterList() // 加载所有部长
    fetchSalesmanList() // 加载所有业务员
  } else if (currentUserRole.value === 'subAdmin') {
    // 子管理员：加载该子管理员下的公司管理员列表
    fetchCompanyList(currentUser.value.userId)
  } else if (currentUserRole.value === 'companyManager') {
    // 公司管理员：加载该公司下的部长列表
    fetchMinisterList(currentUser.value.userId)
  } else if (currentUserRole.value === 'minister') {
    // 部长：加载该部长下的业务员列表
    fetchSalesmanList(currentUser.value.userId)
  }
  // 业务员不需要加载筛选列表
}

// 获取子管理员列表
function fetchSubAdminList() {
  getSubAdminList().then(response => {
    subAdminList.value = response.data || []
  })
}

// 获取公司管理员列表
function fetchCompanyList(subAdminUserId = null) {
  const params = subAdminUserId ? { subAdminUserId } : {}
  getRoleUserList(102, params).then(response => {
    companyList.value = response.data || []
  })
}

// 获取部长列表
function fetchMinisterList(companyUserId = null) {
  const params = companyUserId ? { companyUserId } : {}
  getRoleUserList(101, params).then(response => {
    ministerList.value = response.data || []
  })
}

// 获取业务员列表
function fetchSalesmanList(ministerUserId = null) {
  const params = {}
  if (ministerUserId) {
    params.parentUserId = ministerUserId
  } else if (queryParams.value.companyUserId) {
    params.companyUserId = queryParams.value.companyUserId
  }
  // 如果没有任何参数，则加载所有业务员（超级管理员可以）
  getRoleUserList(2, params).then(response => {
    salesmanList.value = response.data || []
  })
}

// 子管理员选择变化
function handleSubAdminChange(subAdminUserId) {
  // 清空下级筛选
  queryParams.value.companyUserId = null
  queryParams.value.ministerUserId = null
  queryParams.value.salesmanUserId = null
  
  // 重新加载数据
  getList()
  
  // 更新下级筛选列表
  if (subAdminUserId) {
    fetchCompanyList(subAdminUserId)
  } else {
    companyList.value = []
  }
  ministerList.value = []
  salesmanList.value = []
}

// 公司管理员选择变化
function handleCompanyChange(companyUserId) {
  // 清空下级筛选
  queryParams.value.ministerUserId = null
  queryParams.value.salesmanUserId = null
  
  // 重新加载数据
  getList()
  
  // 更新下级筛选列表
  if (companyUserId) {
    fetchMinisterList(companyUserId)
    fetchSalesmanList(null) // 加载该公司下的所有业务员
  } else {
    ministerList.value = []
    salesmanList.value = []
  }
}

// 部长选择变化
function handleMinisterChange(ministerUserId) {
  // 清空下级筛选
  queryParams.value.salesmanUserId = null
  
  // 重新加载数据
  getList()
  
  // 更新下级筛选列表
  if (ministerUserId) {
    fetchSalesmanList(ministerUserId)
  } else if (queryParams.value.companyUserId) {
    // 如果清空了部长但还有公司，加载公司下的所有业务员
    fetchSalesmanList(null)
  } else {
    salesmanList.value = []
  }
}

// 查询
function handleQuery() {
  getList()
}

// 重置
function resetQuery() {
  dateRange.value = []
  queryParams.value = {
    subAdminUserId: null,
    companyUserId: null,
    ministerUserId: null,
    salesmanUserId: null
  }
  
  // 重新初始化筛选列表
  initRoleBasedFilters()
  getList()
}

// 导出
function handleExport() {
  const params = {}
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  // 根据筛选条件确定导出范围
  if (queryParams.value.salesmanUserId) {
    params.salesmanUserId = queryParams.value.salesmanUserId
  } else if (queryParams.value.ministerUserId) {
    params.ministerUserId = queryParams.value.ministerUserId
  } else if (queryParams.value.companyUserId) {
    params.companyUserId = queryParams.value.companyUserId
  } else if (queryParams.value.subAdminUserId) {
    params.subAdminUserId = queryParams.value.subAdminUserId
  }
  
  // 调用导出API（需要确保后端有对应的导出接口）
  // proxy.download('system/callRecord/exportUserStatistics', params, `用户通话统计_${new Date().getTime()}.xlsx`)
  
  // 临时提示，等待后端接口实现
  console.log('导出参数：', params)
  // ElMessage.warning('导出功能暂未开放，敬请期待')
}

onMounted(() => {
  // 初始化日期范围为当天
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`
  dateRange.value = [todayStr, todayStr]
  
  getCurrentUserInfo()
  getList()
})
</script>

<style scoped lang="scss">
.call-analysis-container {
  position: fixed;
  top: 84px;
  left: 200px;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}

.search-section {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  flex-shrink: 0;

  :deep(.el-form) {
    margin-bottom: -18px;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-select),
  :deep(.el-date-picker) {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  :deep(.el-button) {
    padding: 9px 20px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.table-section {
  flex: 1;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .statistics-table {
    flex: 1;
    
    :deep(.el-table__header-wrapper) {
      th {
        border-color: #e4e7ed;
        transition: background 0.3s ease;
        
        &:hover {
          background: #ecf0f5 !important;
        }
      }
    }

    :deep(.el-table__body) {
      tr {
        transition: all 0.3s ease;
        
        &:hover {
          background: #f5f7fa !important;
          transform: scale(1.001);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        td {
          border-color: #ebeef5;
        }
      }
    }

    :deep(.el-table__row--striped) {
      background-color: #fafafa;
    }

    :deep(.el-table__expand-icon) {
      color: #409eff;
      font-size: 14px;
    }
  }
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;

  .name-text {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
  }

  .node-tag {
    flex-shrink: 0;
    font-weight: 500;
  }
}

.duration-text {
  color: #409eff;
  font-weight: 500;
  font-size: 13px;
}

.count-text {
  color: #606266;
  font-weight: 500;
  font-size: 13px;
}

:deep(.el-tag) {
  font-weight: 500;
  border-radius: 4px;
  padding: 4px 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

// 响应式设计
@media screen and (max-width: 1366px) {
  .call-analysis-container {
    padding: 12px;
  }

  .search-section {
    padding: 16px;
  }

  .table-section {
    padding: 12px;
  }
}

// 侧边栏收起时调整布局
:deep(.hideSidebar) ~ .main-container .call-analysis-container {
  left: 54px;
}

// 加载动画优化
:deep(.el-loading-spinner) {
  .circular {
    animation: loading-rotate 2s linear infinite;
  }
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

// 滚动条美化
:deep(.el-table__body-wrapper) {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 4px;
    
    &:hover {
      background-color: #a8a8a8;
    }
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 4px;
  }
}
</style>
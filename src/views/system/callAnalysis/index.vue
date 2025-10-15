<template>
  <div class="app-container">
    <!-- 搜索表单 -->
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

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 用户统计列表 -->
    <el-table 
      v-loading="loading" 
      :data="userStatisticsList" 
      border
    >
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="用户名" prop="userName" width="120" align="center" />
      <el-table-column label="昵称" prop="nickName" width="120" align="center" />
      <el-table-column label="总通话时长" prop="totalCallDuration" width="120" align="center">
        <template #default="scope">
          {{ formatDuration(scope.row.totalCallDuration) }}
        </template>
      </el-table-column>
      <el-table-column label="通话号码数" prop="uniquePhoneCount" width="110" align="center" />
      <el-table-column label="总记录数" prop="totalRecords" width="100" align="center" />
      <el-table-column label="平均通话时长" prop="avgCallDuration" width="120" align="center">
        <template #default="scope">
          {{ formatDuration(scope.row.avgCallDuration) }}
        </template>
      </el-table-column>
      <el-table-column label="未拨号" prop="notDialedCount" width="90" align="center">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.notDialedCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="已拨号" prop="dialedCount" width="90" align="center">
        <template #default="scope">
          <el-tag type="warning">{{ scope.row.dialedCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="已接听" prop="answeredCount" width="90" align="center">
        <template #default="scope">
          <el-tag type="success">{{ scope.row.answeredCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="未接听" prop="unansweredCount" width="90" align="center">
        <template #default="scope">
          <el-tag>{{ scope.row.unansweredCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="拒接" prop="rejectedCount" width="80" align="center">
        <template #default="scope">
          <el-tag type="danger">{{ scope.row.rejectedCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="空号" prop="emptyNumberCount" width="80" align="center">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.emptyNumberCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="停机" prop="suspendedCount" width="80" align="center">
        <template #default="scope">
          <el-tag type="warning">{{ scope.row.suspendedCount || 0 }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup name="CallAnalysis">
import { ref, onMounted, computed } from 'vue'
import { getUserCallStatistics } from '@/api/system/callRecord'
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
  pageNum: 1,
  pageSize: 10,
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

// 获取用户统计列表
function getList() {
  loading.value = true
  
  const params = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    subAdminUserId: queryParams.value.subAdminUserId,
    companyUserId: queryParams.value.companyUserId,
    ministerUserId: queryParams.value.ministerUserId,
    salesmanUserId: queryParams.value.salesmanUserId
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  getUserCallStatistics(params).then(response => {
    userStatisticsList.value = response.rows || []
    total.value = response.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
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
  // 超级管理员可以独立筛选，不清空其他筛选条件
  if (currentUserRole.value !== 'admin') {
    queryParams.value.companyUserId = null
    queryParams.value.ministerUserId = null
    queryParams.value.salesmanUserId = null
    companyList.value = []
    ministerList.value = []
    salesmanList.value = []
    
    if (subAdminUserId) {
      fetchCompanyList(subAdminUserId)
    }
  }
  
  getList()
}

// 公司管理员选择变化
function handleCompanyChange(companyUserId) {
  // 超级管理员可以独立筛选，不清空其他筛选条件
  if (currentUserRole.value !== 'admin') {
    queryParams.value.ministerUserId = null
    queryParams.value.salesmanUserId = null
    ministerList.value = []
    salesmanList.value = []
    
    if (companyUserId) {
      fetchMinisterList(companyUserId)
      fetchSalesmanList(null) // 加载该公司下的所有业务员
    }
  }
  
  getList()
}

// 部长选择变化
function handleMinisterChange(ministerUserId) {
  // 超级管理员可以独立筛选，不清空其他筛选条件
  if (currentUserRole.value !== 'admin') {
    queryParams.value.salesmanUserId = null
    salesmanList.value = []
    
    if (ministerUserId) {
      fetchSalesmanList(ministerUserId)
    } else if (queryParams.value.companyUserId) {
      // 如果清空了部长但还有公司，加载公司下的所有业务员
      fetchSalesmanList(null)
    }
  }
  
  getList()
}

// 查询
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置
function resetQuery() {
  dateRange.value = []
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    subAdminUserId: null,
    companyUserId: null,
    ministerUserId: null,
    salesmanUserId: null
  }
  subAdminList.value = []
  companyList.value = []
  ministerList.value = []
  salesmanList.value = []
  
  // 重新初始化筛选列表
  initRoleBasedFilters()
  getList()
}

// 导出
function handleExport() {
  const params = {
    subAdminUserId: queryParams.value.subAdminUserId,
    companyUserId: queryParams.value.companyUserId,
    ministerUserId: queryParams.value.ministerUserId,
    salesmanUserId: queryParams.value.salesmanUserId
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  // 调用导出API（需要确保后端有对应的导出接口）
  // proxy.download('system/callRecord/exportUserStatistics', params, `用户通话统计_${new Date().getTime()}.xlsx`)
  
  // 临时提示，等待后端接口实现
  console.log('导出参数：', params)
  // ElMessage.warning('导出功能暂未开放，敬请期待')
}

onMounted(() => {
  getCurrentUserInfo()
  getList()
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>
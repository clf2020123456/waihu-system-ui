<template>
  <div class="app-container">
    <el-card class="box-card filter-card" shadow="hover">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="公司管理员" prop="companyUserId">
          <el-select v-model="queryParams.companyUserId" placeholder="请选择公司" clearable style="width: 200px;" @change="handleCompanyChange">
            <el-option
              v-for="company in companyList"
              :key="company.userId"
              :label="company.nickName"
              :value="company.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部长" prop="ministerUserId">
          <el-select v-model="queryParams.ministerUserId" placeholder="请选择部长" clearable style="width: 200px;" @change="handleMinisterChange">
            <el-option
              v-for="minister in ministerList"
              :key="minister.userId"
              :label="minister.nickName"
              :value="minister.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务员" prop="salesmanUserId">
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
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户统计列表 -->
    <el-card class="box-card" shadow="hover" style="margin-top: 20px;">
      <el-table 
        v-loading="loading" 
        :data="userStatisticsList" 
        border
        stripe
        :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="用户名" prop="userName" width="120" align="center" fixed />
        <el-table-column label="昵称" prop="nickName" width="120" align="center" fixed />
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
    </el-card>
  </div>
</template>

<script setup name="CallAnalysis">
import { ref, onMounted } from 'vue'
import { getUserCallStatistics } from '@/api/system/callRecord'
import { getCompanyList, getMinisterList, listUser } from '@/api/system/user'

const loading = ref(false)
const total = ref(0)
const userStatisticsList = ref([])
const dateRange = ref([])
const companyList = ref([])
const ministerList = ref([])
const salesmanList = ref([])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  companyUserId: null,
  ministerUserId: null,
  salesmanUserId: null
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

// 获取公司列表
function fetchCompanyList() {
  getCompanyList().then(response => {
    companyList.value = response.data || []
  })
}

// 获取部长列表
function fetchMinisterList(companyUserId) {
  if (companyUserId) {
    getMinisterList(companyUserId).then(response => {
      ministerList.value = response.data || []
    })
  } else {
    ministerList.value = []
  }
}

// 获取业务员列表（指定部长的下属）
function fetchSalesmanList(ministerUserId) {
  if (ministerUserId) {
    // 查询指定部长下的业务员
    listUser({ parentUserId: ministerUserId, roleId: 2 }).then(response => {
      salesmanList.value = response.rows || []
    })
  } else if (queryParams.value.companyUserId) {
    // 如果选了公司但没选部长，查询该公司下的所有业务员
    listUser({ companyUserId: queryParams.value.companyUserId, roleId: 2 }).then(response => {
      salesmanList.value = response.rows || []
    })
  } else {
    salesmanList.value = []
  }
}

// 公司选择变化
function handleCompanyChange(companyUserId) {
  queryParams.value.ministerUserId = null
  queryParams.value.salesmanUserId = null
  ministerList.value = []
  salesmanList.value = []
  
  if (companyUserId) {
    fetchMinisterList(companyUserId)
    fetchSalesmanList(null) // 加载该公司下的所有业务员
  }
  
  getList()
}

// 部长选择变化
function handleMinisterChange(ministerUserId) {
  queryParams.value.salesmanUserId = null
  salesmanList.value = []
  
  if (ministerUserId) {
    fetchSalesmanList(ministerUserId)
  } else if (queryParams.value.companyUserId) {
    // 如果清空了部长但还有公司，加载公司下的所有业务员
    fetchSalesmanList(null)
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
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    companyUserId: null,
    ministerUserId: null,
    salesmanUserId: null
  }
  dateRange.value = []
  ministerList.value = []
  salesmanList.value = []
  getList()
}

// 导出
function handleExport() {
  const params = {
    companyUserId: queryParams.value.companyUserId,
    ministerUserId: queryParams.value.ministerUserId,
    salesmanUserId: queryParams.value.salesmanUserId
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  // 导出功能，可以根据需要实现
  console.log('导出参数：', params)
  // 这里可以调用导出API
}

onMounted(() => {
  fetchCompanyList()
  getList()
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.filter-card {
  ::v-deep .el-card__body {
    padding: 15px 20px;
  }
  
  .el-form {
    margin-bottom: 0;
  }
}

.box-card {
  ::v-deep .el-card__body {
    padding: 20px;
  }
}
</style>
<template>
  <div class="app-container home">
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="24">
        <h2 style="margin-top: 0;">短信数据分析</h2>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
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
          <el-select v-model="queryParams.salesmanUserId" placeholder="请选择业务员" clearable style="width: 200px;" @change="getStatistics">
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
            value-format="yyyy-MM-dd"
            style="width: 280px;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计数据卡片 -->
    <el-row :gutter="20" style="margin-top: 20px;" type="flex" justify="left">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card-large" shadow="hover">
          <div class="stat-content-large">
            <div class="stat-icon-large" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="el-icon-message"></i>
            </div>
            <div class="stat-info-large">
              <div class="stat-value-large">{{ statistics.uniquePhoneCount || 0 }}</div>
              <div class="stat-label-large">发送号码数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="SmsAnalysis">
import { ref, onMounted } from 'vue'
import { getSmsStatistics } from '@/api/system/smsRecord'
import { listUser, getCompanyList, getMinisterList } from '@/api/system/user'

const queryParams = ref({
  companyUserId: null,
  ministerUserId: null,
  salesmanUserId: null
})

const dateRange = ref([])
const companyList = ref([])
const ministerList = ref([])
const salesmanList = ref([])
const statistics = ref({
  uniquePhoneCount: 0
})

// 查询统计数据
function getStatistics() {
  const params = {
    companyUserId: queryParams.value.companyUserId,
    ministerUserId: queryParams.value.ministerUserId,
    salesmanUserId: queryParams.value.salesmanUserId
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  getSmsStatistics(params).then(response => {
    statistics.value = response.data || {
      uniquePhoneCount: 0
    }
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
  // 清空部长和业务员选择
  queryParams.value.ministerUserId = null
  queryParams.value.salesmanUserId = null
  ministerList.value = []
  salesmanList.value = []
  
  // 加载该公司下的部长列表
  if (companyUserId) {
    fetchMinisterList(companyUserId)
    fetchSalesmanList(null) // 加载该公司下的所有业务员
  }
  
  // 自动刷新统计数据
  getStatistics()
}

// 部长选择变化
function handleMinisterChange(ministerUserId) {
  // 清空业务员选择
  queryParams.value.salesmanUserId = null
  salesmanList.value = []
  
  // 加载该部长下的业务员列表
  if (ministerUserId) {
    fetchSalesmanList(ministerUserId)
  } else if (queryParams.value.companyUserId) {
    // 如果清空了部长但还有公司，加载公司下的所有业务员
    fetchSalesmanList(null)
  }
  
  // 自动刷新统计数据
  getStatistics()
}

// 查询
function handleQuery() {
  getStatistics()
}

// 重置
function resetQuery() {
  queryParams.value = {
    companyUserId: null,
    ministerUserId: null,
    salesmanUserId: null
  }
  dateRange.value = []
  ministerList.value = []
  salesmanList.value = []
  getStatistics()
}

onMounted(() => {
  fetchCompanyList()
  getStatistics()
})
</script>

<style scoped lang="scss">
.home {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.filter-card {
  margin-bottom: 20px;
  
  ::v-deep .el-card__body {
    padding: 15px 20px;
  }
  
  .el-form {
    margin-bottom: 0;
  }
}

.stat-card-large {
  margin-bottom: 20px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  ::v-deep .el-card__body {
    padding: 40px;
  }
  
  .stat-content-large {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    
    .stat-icon-large {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
      
      i {
        font-size: 60px;
        color: #fff;
      }
    }
    
    .stat-info-large {
      text-align: center;
      
      .stat-value-large {
        font-size: 48px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 15px;
      }
      
      .stat-label-large {
        font-size: 20px;
        color: #909399;
        font-weight: 500;
      }
    }
  }
}

h2 {
  color: #303133;
  font-weight: 600;
  margin-bottom: 20px;
}
</style>


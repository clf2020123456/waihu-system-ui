<template>
  <div class="app-container home">
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="24">
        <h2 style="margin-top: 0;">通话数据分析</h2>
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
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="el-icon-phone"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatDuration(statistics.totalCallDuration) }}</div>
              <div class="stat-label">总通话时长</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="el-icon-mobile-phone"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.uniquePhoneCount || 0 }}</div>
              <div class="stat-label">通话号码数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <i class="el-icon-document"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalRecords || 0 }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatDuration(statistics.avgCallDuration) }}</div>
              <div class="stat-label">平均通话时长</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);">
              <i class="el-icon-remove-outline"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.notDialedCount || 0 }}</div>
              <div class="stat-label">未拨号</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
              <i class="el-icon-position"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.dialedCount || 0 }}</div>
              <div class="stat-label">已拨号</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="el-icon-success"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.answeredCount || 0 }}</div>
              <div class="stat-label">已接听</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa8231 0%, #ffc371 100%);">
              <i class="el-icon-phone-outline"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.unansweredCount || 0 }}</div>
              <div class="stat-label">未接听</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);">
              <i class="el-icon-error"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.rejectedCount || 0 }}</div>
              <div class="stat-label">拒接</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.emptyNumberCount || 0 }}</div>
              <div class="stat-label">空号</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #b490ca 0%, #5f72bd 100%);">
              <i class="el-icon-turn-off"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.suspendedCount || 0 }}</div>
              <div class="stat-label">停机</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold;">通话状态分布</span>
          </div>
          <div id="statusChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold;">通话数据统计</span>
          </div>
          <div id="dataChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ref, onMounted, nextTick } from 'vue'
import { getCallStatistics } from '@/api/system/callRecord'
import { listUser, getCompanyList, getMinisterList } from '@/api/system/user'
import * as echarts from 'echarts'

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
  totalCallDuration: 0,
  uniquePhoneCount: 0,
  answeredCount: 0,
  rejectedCount: 0,
  emptyNumberCount: 0,
  notDialedCount: 0,
  dialedCount: 0,
  unansweredCount: 0,
  suspendedCount: 0,
  totalRecords: 0,
  totalConsumption: 0,
  avgCallDuration: 0
})

let statusChart = null
let dataChart = null

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
  
  getCallStatistics(params).then(response => {
    statistics.value = response.data || {
      totalCallDuration: 0,
      uniquePhoneCount: 0,
      answeredCount: 0,
      rejectedCount: 0,
      emptyNumberCount: 0,
      notDialedCount: 0,
      dialedCount: 0,
      unansweredCount: 0,
      suspendedCount: 0,
      totalRecords: 0,
      totalConsumption: 0,
      avgCallDuration: 0
    }
    
    nextTick(() => {
      initCharts()
    })
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

// 初始化图表
function initCharts() {
  initStatusChart()
  initDataChart()
}

// 初始化状态分布饼图
function initStatusChart() {
  const chartDom = document.getElementById('statusChart')
  if (!chartDom) return
  
  if (statusChart) {
    statusChart.dispose()
  }
  
  statusChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '通话状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: statistics.value.notDialedCount, name: '未拨号', itemStyle: { color: '#fcb69f' } },
          { value: statistics.value.dialedCount, name: '已拨号', itemStyle: { color: '#fed6e3' } },
          { value: statistics.value.answeredCount, name: '已接听', itemStyle: { color: '#4facfe' } },
          { value: statistics.value.unansweredCount, name: '未接听', itemStyle: { color: '#ffc371' } },
          { value: statistics.value.rejectedCount, name: '拒接', itemStyle: { color: '#ff6b6b' } },
          { value: statistics.value.emptyNumberCount, name: '空号', itemStyle: { color: '#8ec5fc' } },
          { value: statistics.value.suspendedCount, name: '停机', itemStyle: { color: '#b490ca' } }
        ]
      }
    ]
  }
  
  statusChart.setOption(option)
}

// 初始化数据统计柱状图
function initDataChart() {
  const chartDom = document.getElementById('dataChart')
  if (!chartDom) return
  
  if (dataChart) {
    dataChart.dispose()
  }
  
  dataChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['未拨号', '已拨号', '已接听', '未接听', '拒接', '空号', '停机'],
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        rotate: 30,
        interval: 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: statistics.value.notDialedCount, itemStyle: { color: '#fcb69f' } },
          { value: statistics.value.dialedCount, itemStyle: { color: '#fed6e3' } },
          { value: statistics.value.answeredCount, itemStyle: { color: '#4facfe' } },
          { value: statistics.value.unansweredCount, itemStyle: { color: '#ffc371' } },
          { value: statistics.value.rejectedCount, itemStyle: { color: '#ff6b6b' } },
          { value: statistics.value.emptyNumberCount, itemStyle: { color: '#8ec5fc' } },
          { value: statistics.value.suspendedCount, itemStyle: { color: '#b490ca' } }
        ]
      }
    ]
  }
  
  dataChart.setOption(option)
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  if (statusChart) statusChart.resize()
  if (dataChart) dataChart.resize()
})

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

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  ::v-deep .el-card__body {
    padding: 20px;
  }
  
  .stat-content {
    display: flex;
    align-items: center;
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      
      i {
        font-size: 28px;
        color: #fff;
      }
    }
    
    .stat-info {
      flex: 1;
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 5px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.chart-card {
  margin-bottom: 20px;
  
  ::v-deep .el-card__header {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
  }
  
  ::v-deep .el-card__body {
    padding: 20px;
  }
}

h2 {
  color: #303133;
  font-weight: 600;
  margin-bottom: 20px;
}
</style>


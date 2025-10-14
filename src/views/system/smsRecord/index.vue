<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
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
        <el-select v-model="queryParams.salesmanUserId" placeholder="请选择业务员" clearable style="width: 200px;">
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
      <el-form-item label="批次号" prop="batchNo">
        <el-input
          v-model="queryParams.batchNo"
          placeholder="请输入批次号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="消费金额" prop="consumptionAmount">
        <el-input
          v-model="queryParams.consumptionAmount"
          placeholder="请输入消费金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:smsRecord:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:smsRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:smsRecord:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:smsRecord:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="smsRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务员" align="center" prop="userName" width="120" />
      <!-- <el-table-column label="短信记录ID" align="center" prop="id" />
      <el-table-column label="关联ID" align="center" prop="relationId" />
      <el-table-column label="任务ID" align="center" prop="taskId" /> -->
      <el-table-column label="批次号" align="center" prop="batchNo" />
      <el-table-column label="客户名称" align="center" prop="customerName" />
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="消费金额" align="center" prop="consumptionAmount" />
      <el-table-column label="短信内容" align="center" prop="smsContent" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="回复内容" align="center" prop="replyContent" width="250">
        <template #default="scope">
          <div v-if="scope.row.replyContent">
            <div v-if="isJsonArray(scope.row.replyContent)">
              <el-tag type="info">{{ getReplyCount(scope.row.replyContent) }}条回复</el-tag>
              <el-button link type="primary" @click="viewReplyDetails(scope.row.replyContent)">查看详情</el-button>
            </div>
            <div v-else>{{ scope.row.replyContent }}</div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template #default="scope">
          <el-button link type="primary" icon="ChatDotRound" @click="handleReply(scope.row)" v-hasPermi="['system:smsRecord:edit']">回复</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:smsRecord:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:smsRecord:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 回复内容详情对话框 -->
    <el-dialog title="回复内容详情" v-model="replyDetailOpen" width="600px" append-to-body>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in replyDetailList"
          :key="index"
          :timestamp="formatReplyTime(item)"
          placement="top"
        >
          <el-card>
            <p>{{ item.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <!-- 回复短信对话框 -->
    <el-dialog title="回复短信" v-model="replyDialogVisible" width="500px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="手机号" required>
          <el-input v-model="replyPhone" placeholder="手机号" disabled />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="replyCustomerName" placeholder="客户名称" disabled />
        </el-form-item>
        <el-form-item label="回复内容" required>
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="5"
            placeholder="请输入回复内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmReply">发 送</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改短信记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="smsRecordRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联ID" prop="relationId">
          <el-input v-model="form.relationId" placeholder="请输入关联ID" />
        </el-form-item>
        <el-form-item label="任务ID" prop="taskId">
          <el-input v-model="form.taskId" placeholder="请输入任务ID" />
        </el-form-item>
        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="form.batchNo" placeholder="请输入批次号" />
        </el-form-item>
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="消费金额" prop="consumptionAmount">
          <el-input v-model="form.consumptionAmount" placeholder="请输入消费金额" />
        </el-form-item>
        <el-form-item label="短信内容">
          <el-input v-model="form.smsContent" type="textarea" :rows="3" placeholder="请输入短信内容" />
        </el-form-item>
        <el-form-item label="回复内容">
          <div v-if="isJsonArray(form.replyContent)" style="max-height: 300px; overflow-y: auto; border: 1px solid #dcdfe6; border-radius: 4px; padding: 10px;">
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in parseReplyContent(form.replyContent)"
                :key="index"
                :timestamp="formatReplyTime(item)"
                placement="top"
              >
                <p style="margin: 0;">{{ item.content }}</p>
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-input v-else v-model="form.replyContent" type="textarea" :rows="3" placeholder="请输入回复内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SmsRecord">
import { listSmsRecord, getSmsRecord, delSmsRecord, addSmsRecord, updateSmsRecord } from "@/api/system/smsRecord"
import { listUser, getCompanyList, getMinisterList } from "@/api/system/user"
import { addInstantRequest } from '@/api/system/instantRequest'

const { proxy } = getCurrentInstance()

const smsRecordList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const companyList = ref([])
const ministerList = ref([])
const salesmanList = ref([])
const replyDetailOpen = ref(false)
const replyDetailList = ref([])
const replyDialogVisible = ref(false)
const replyPhone = ref('')
const replyCustomerName = ref('')
const replyContent = ref('')
const currentReplyRecord = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyUserId: null,
    ministerUserId: null,
    salesmanUserId: null,
    relationId: null,
    taskId: null,
    batchNo: null,
    customerName: null,
    phone: null,
    consumptionAmount: null,
    smsContent: null,
    replyContent: null,
  },
  rules: {
    taskId: [
      { required: true, message: "任务ID不能为空", trigger: "blur" }
    ],
    batchNo: [
      { required: true, message: "批次号不能为空", trigger: "blur" }
    ],
    customerName: [
      { required: true, message: "客户名称不能为空", trigger: "blur" }
    ],
    phone: [
      { required: true, message: "手机号不能为空", trigger: "blur" }
    ],
    smsContent: [
      { required: true, message: "短信内容不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询短信记录列表 */
function getList() {
  loading.value = true
  const params = { ...queryParams.value }
  
  // 添加时间范围参数
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  // 将业务员筛选条件映射到userId参数
  if (queryParams.value.salesmanUserId) {
    params.userId = queryParams.value.salesmanUserId
  }
  
  listSmsRecord(params).then(response => {
    smsRecordList.value = response.rows
    total.value = response.total
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

// 获取业务员列表
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
}

// 判断是否为 JSON 数组
function isJsonArray(str) {
  if (!str) return false
  try {
    const data = typeof str === 'string' ? JSON.parse(str) : str
    return Array.isArray(data)
  } catch (e) {
    return false
  }
}

// 获取回复数量
function getReplyCount(replyContent) {
  try {
    const data = typeof replyContent === 'string' ? JSON.parse(replyContent) : replyContent
    return Array.isArray(data) ? data.length : 0
  } catch (e) {
    return 0
  }
}

// 查看回复详情
function viewReplyDetails(replyContent) {
  try {
    const data = typeof replyContent === 'string' ? JSON.parse(replyContent) : replyContent
    if (Array.isArray(data)) {
      replyDetailList.value = data
      replyDetailOpen.value = true
    }
  } catch (e) {
    proxy.$modal.msgError("解析回复内容失败")
  }
}

// 解析回复内容
function parseReplyContent(replyContent) {
  try {
    const data = typeof replyContent === 'string' ? JSON.parse(replyContent) : replyContent
    return Array.isArray(data) ? data : []
  } catch (e) {
    return []
  }
}

// 格式化回复时间
function formatReplyTime(item) {
  try {
    let date
    if (item.timestamp) {
      // 使用时间戳
      date = new Date(item.timestamp)
    } else if (item.time) {
      // 使用时间字符串
      date = new Date(item.time)
    } else {
      return ''
    }
    
    // 格式化为 YYYY-MM-DD HH:mm:ss
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (e) {
    return item.time || ''
  }
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    relationId: null,
    taskId: null,
    batchNo: null,
    customerName: null,
    phone: null,
    consumptionAmount: null,
    smsContent: null,
    replyContent: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("smsRecordRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  queryParams.value.companyUserId = null
  queryParams.value.ministerUserId = null
  queryParams.value.salesmanUserId = null
  ministerList.value = []
  salesmanList.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加短信记录"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getSmsRecord(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改短信记录"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["smsRecordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSmsRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addSmsRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除短信记录编号为"' + _ids + '"的数据项？').then(function() {
    return delSmsRecord(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  const params = { ...queryParams.value }
  
  // 添加时间范围参数
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  // 将业务员筛选条件映射到userId参数
  if (queryParams.value.salesmanUserId) {
    params.userId = queryParams.value.salesmanUserId
  }
  
  proxy.download('system/smsRecord/export', params, `smsRecord_${new Date().getTime()}.xlsx`)
}

/** 回复按钮操作 */
function handleReply(row) {
  currentReplyRecord.value = row
  replyPhone.value = row.phone
  replyCustomerName.value = row.customerName
  replyContent.value = ''
  replyDialogVisible.value = true
}

/** 确认发送回复 */
function confirmReply() {
  if (!replyContent.value || replyContent.value.trim() === '') {
    proxy.$modal.msgWarning('请输入回复内容')
    return
  }
  
  // 1. 先发送一键短信
  const request = {
    phone: replyPhone.value,
    requestType: '2', // 2=短信
    smsContent: replyContent.value.trim(),
    remark: '短信回复'
  }
  
  addInstantRequest(request).then(() => {
    // 2. 发送成功后更新短信记录的回复内容
    const record = currentReplyRecord.value
    
    // 构建新的回复项
    const newReply = {
      content: replyContent.value.trim(),
      time: new Date().toISOString(),
      timestamp: new Date().getTime()
    }
    
    // 解析现有回复内容
    let replyList = []
    if (record.replyContent) {
      try {
        const data = typeof record.replyContent === 'string' 
          ? JSON.parse(record.replyContent) 
          : record.replyContent
        if (Array.isArray(data)) {
          replyList = data
        }
      } catch (e) {
        console.error('解析回复内容失败:', e)
      }
    }
    
    // 添加新回复
    replyList.push(newReply)
    
    // 更新短信记录
    const updateData = {
      id: record.id,
      replyContent: JSON.stringify(replyList)
    }
    
    return updateSmsRecord(updateData)
  }).then(() => {
    proxy.$modal.msgSuccess('回复发送成功')
    replyDialogVisible.value = false
    replyContent.value = ''
    currentReplyRecord.value = null
    // 刷新列表
    getList()
  }).catch(error => {
    console.error('回复发送失败:', error)
    proxy.$modal.msgError('回复发送失败，请重试')
  })
}

// 页面初始化
fetchCompanyList()
getList()
</script>

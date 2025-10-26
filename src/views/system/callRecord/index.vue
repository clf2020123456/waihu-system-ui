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
      <el-form-item label="标签" prop="tags">
        <el-input
          v-model="queryParams.tags"
          placeholder="请输入标签"
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
      <el-form-item label="录音状态" prop="hasRecording">
        <el-select v-model="queryParams.hasRecording" placeholder="请选择录音状态" clearable style="width: 150px;">
          <el-option label="全部" :value="null"></el-option>
          <el-option label="有录音" :value="1"></el-option>
          <el-option label="无录音" :value="0"></el-option>
        </el-select>
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
          v-hasPermi="['system:callRecord:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:callRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:callRecord:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:callRecord:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Download"
          :disabled="multiple"
          @click="handleDownloadRecordings"
          v-hasPermi="['system:callRecord:export']"
        >批量下载录音</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="callRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务员" align="center" prop="userName" width="120" />
      <!-- <el-table-column label="通话记录ID" align="center" prop="id" />
      <el-table-column label="关联ID" align="center" prop="relationId" />
      <el-table-column label="任务ID" align="center" prop="taskId" /> -->
      <el-table-column label="批次号" align="center" prop="batchNo" />
      <el-table-column label="客户名称" align="center" prop="customerName" />
      <el-table-column label="标签" align="center" prop="tags" />
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="消费金额" align="center" prop="consumptionAmount" />
      <el-table-column label="通话时长" align="center" prop="callDuration" />
      <el-table-column label="通话录音" align="center" prop="callRecordingUrl" width="280">
        <template #default="scope">
          <audio 
            v-if="scope.row.callRecordingUrl" 
            :src="scope.row.callRecordingUrl" 
            controls 
            style="width: 250px; height: 32px;"
            preload="none"
          >
            您的浏览器不支持音频播放
          </audio>
          <span v-else style="color: #909399;">无录音</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:callRecord:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:callRecord:remove']">删除</el-button>
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

    <!-- 添加或修改通话记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="callRecordRef" :model="form" :rules="rules" label-width="80px">
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
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="请输入标签" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="消费金额" prop="consumptionAmount">
          <el-input v-model="form.consumptionAmount" placeholder="请输入消费金额" />
        </el-form-item>
        <el-form-item label="通话时长" prop="callDuration">
          <el-input v-model="form.callDuration" placeholder="请输入通话时长" />
        </el-form-item>
        <el-form-item label="通话录音文件url" prop="callRecordingUrl">
          <el-input v-model="form.callRecordingUrl" type="textarea" placeholder="请输入内容" />
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

<script setup name="CallRecord">
import { listCallRecord, getCallRecord, delCallRecord, addCallRecord, updateCallRecord } from "@/api/system/callRecord"
import { listUser, getCompanyList, getMinisterList } from "@/api/system/user"

const { proxy } = getCurrentInstance()

const callRecordList = ref([])
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
    tags: null,
    phone: null,
    consumptionAmount: null,
    callDuration: null,
    callRecordingUrl: null,
    hasRecording: null,
  },
  rules: {
    taskId: [
      { required: true, message: "任务ID不能为空", trigger: "blur" }
    ],
    phone: [
      { required: true, message: "手机号不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询通话记录列表 */
function getList() {
  loading.value = true
  const params = { ...queryParams.value }
  
  // 添加时间范围参数
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0] + ' 00:00:00'
    params.endTime = dateRange.value[1] + ' 23:59:59'
  }
  
  listCallRecord(params).then(response => {
    callRecordList.value = response.rows
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
    tags: null,
    phone: null,
    consumptionAmount: null,
    callDuration: null,
    callRecordingUrl: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("callRecordRef")
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
  title.value = "添加通话记录"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getCallRecord(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改通话记录"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["callRecordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCallRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCallRecord(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除通话记录编号为"' + _ids + '"的数据项？').then(function() {
    return delCallRecord(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/callRecord/export', {
    ...queryParams.value
  }, `callRecord_${new Date().getTime()}.xlsx`)
}

/** 批量下载录音 */
async function handleDownloadRecordings() {
  // 获取选中的记录
  const selectedRecords = callRecordList.value.filter(item => ids.value.includes(item.id))
  
  // 过滤出有录音的记录
  const recordsWithAudio = selectedRecords.filter(item => item.callRecordingUrl)
  
  if (recordsWithAudio.length === 0) {
    proxy.$modal.msgWarning("所选记录中没有录音文件")
    return
  }
  
  // 导入JSZip库
  const JSZip = (await import('jszip')).default
  const { saveAs } = await import('file-saver')
  
  const zip = new JSZip()
  const loadingMsg = proxy.$message({
    message: `正在下载录音文件 0/${recordsWithAudio.length}`,
    type: 'info',
    duration: 0
  })
  
  let successCount = 0
  let failCount = 0
  
  try {
    // 并发下载所有录音文件
    const downloadPromises = recordsWithAudio.map(async (record, index) => {
      try {
        const response = await fetch(record.callRecordingUrl, {
          mode: 'cors'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const blob = await response.blob()
        
        // 生成文件名：批次号_客户名称_手机号.mp3
        const fileName = `${record.batchNo || 'unknown'}_${record.customerName || 'unknown'}_${record.phone || 'unknown'}.mp3`
        
        // 添加到zip
        zip.file(fileName, blob)
        
        successCount++
        loadingMsg.message = `正在下载录音文件 ${successCount + failCount}/${recordsWithAudio.length}`
        
        return true
      } catch (error) {
        console.error(`下载录音失败: ${record.phone}`, error)
        failCount++
        loadingMsg.message = `正在下载录音文件 ${successCount + failCount}/${recordsWithAudio.length}`
        return false
      }
    })
    
    await Promise.all(downloadPromises)
    
    loadingMsg.close()
    
    if (successCount === 0) {
      proxy.$modal.msgError("所有录音文件下载失败，请检查网络或录音URL是否有效")
      return
    }
    
    // 生成zip文件并下载
    const zipLoadingMsg = proxy.$message({
      message: '正在生成压缩包...',
      type: 'info',
      duration: 0
    })
    
    const content = await zip.generateAsync({ type: 'blob' })
    const timestamp = new Date().getTime()
    saveAs(content, `通话录音_${timestamp}.zip`)
    
    zipLoadingMsg.close()
    
    // 显示结果
    if (failCount > 0) {
      proxy.$modal.msgWarning(`下载完成！成功: ${successCount}，失败: ${failCount}`)
    } else {
      proxy.$modal.msgSuccess(`成功下载 ${successCount} 个录音文件`)
    }
    
  } catch (error) {
    loadingMsg.close()
    console.error('批量下载录音失败:', error)
    proxy.$modal.msgError("下载失败: " + error.message)
  }
}

// 页面初始化
fetchCompanyList()
getList()
</script>

<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="关联ID" prop="relationId">
        <el-input
          v-model="queryParams.relationId"
          placeholder="请输入关联ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="任务ID" prop="taskId">
        <el-input
          v-model="queryParams.taskId"
          placeholder="请输入任务ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
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
      <!-- <el-form-item label="消费金额" prop="consumptionAmount">
        <el-input
          v-model="queryParams.consumptionAmount"
          placeholder="请输入消费金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="通话时长" prop="callDuration">
        <el-input
          v-model="queryParams.callDuration"
          placeholder="请输入通话时长"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="callRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    relationId: null,
    taskId: null,
    batchNo: null,
    customerName: null,
    tags: null,
    phone: null,
    consumptionAmount: null,
    callDuration: null,
    callRecordingUrl: null,
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
  listCallRecord(queryParams.value).then(response => {
    callRecordList.value = response.rows
    total.value = response.total
    loading.value = false
  })
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

getList()
</script>

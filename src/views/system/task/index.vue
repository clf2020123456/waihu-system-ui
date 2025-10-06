<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="创建用户ID" prop="createUserId">
        <el-input
          v-model="queryParams.createUserId"
          placeholder="请输入创建用户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="queryParams.taskName"
          placeholder="请输入任务名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务状态" prop="taskStatus">
        <el-select v-model="queryParams.taskStatus" placeholder="请选择任务状态" clearable>
          <el-option
            v-for="dict in task_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="随机时间间隔" prop="randomInterval">
        <el-input
          v-model="queryParams.randomInterval"
          placeholder="请输入随机时间间隔"
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
          v-hasPermi="['system:task:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:task:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:task:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:task:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务ID" align="center" prop="id" />
      <el-table-column label="创建用户ID" align="center" prop="createUserId" />
      <el-table-column label="任务名称" align="center" prop="taskName" />
      <el-table-column label="任务状态" align="center" prop="taskStatus">
        <template #default="scope">
          <dict-tag :options="task_status" :value="scope.row.taskStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="随机时间间隔" align="center" prop="randomInterval" />
      <el-table-column label="短信模式" align="center" prop="useDefaultSms" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.taskName && scope.row.taskName.includes('短信')" :type="scope.row.useDefaultSms === '1' ? 'success' : 'primary'">
            {{ scope.row.useDefaultSms === '1' ? '客户默认' : '自定义' }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="短信内容" align="center" prop="smsContent" :show-overflow-tooltip="true" width="150">
        <template #default="scope">
          <span v-if="scope.row.taskName && scope.row.taskName.includes('短信') && scope.row.useDefaultSms === '0'">
            {{ scope.row.smsContent || '-' }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:task:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:task:remove']">删除</el-button>
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

    <!-- 添加或修改任务对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="taskRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="创建用户ID" prop="createUserId">
          <el-input v-model="form.createUserId" placeholder="请输入创建用户ID" />
        </el-form-item>
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务状态" prop="taskStatus">
          <el-select v-model="form.taskStatus" placeholder="请选择任务状态">
            <el-option
              v-for="dict in task_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="随机时间间隔" prop="randomInterval">
          <el-input v-model="form.randomInterval" placeholder="请输入随机时间间隔" />
        </el-form-item>
        <el-form-item label="短信模式" prop="useDefaultSms" v-if="form.taskName && form.taskName.includes('短信')">
          <el-radio-group v-model="form.useDefaultSms">
            <el-radio label="1">使用客户默认短信</el-radio>
            <el-radio label="0">自定义统一短信</el-radio>
          </el-radio-group>
          <div style="color: #999; font-size: 12px; margin-top: 5px;">
            选择"使用客户默认短信"将为每个客户发送其设置的默认短信内容
          </div>
        </el-form-item>
        <el-form-item label="短信内容" prop="smsContent" v-if="form.taskName && form.taskName.includes('短信') && form.useDefaultSms === '0'">
          <el-input 
            v-model="form.smsContent" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入短信内容（所有客户将收到相同的短信）" 
            maxlength="500" 
            show-word-limit 
          />
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

<script setup name="Task">
import { listTask, getTask, delTask, addTask, updateTask } from "@/api/system/task"

const { proxy } = getCurrentInstance()
const { task_status } = proxy.useDict('task_status')

const taskList = ref([])
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
    createUserId: null,
    taskName: null,
    taskStatus: null,
    randomInterval: null,
  },
  rules: {
    createUserId: [
      { required: true, message: "创建用户ID不能为空", trigger: "blur" }
    ],
    taskName: [
      { required: true, message: "任务名称不能为空", trigger: "blur" }
    ],
    taskStatus: [
      { required: true, message: "任务状态不能为空", trigger: "change" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询任务列表 */
function getList() {
  loading.value = true
  listTask(queryParams.value).then(response => {
    taskList.value = response.rows
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
    createUserId: null,
    taskName: null,
    taskStatus: null,
    randomInterval: null,
    smsContent: null,
    useDefaultSms: '0',
    createTime: null
  }
  proxy.resetForm("taskRef")
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
  title.value = "添加任务"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getTask(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改任务"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["taskRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTask(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addTask(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除任务编号为"' + _ids + '"的数据项？').then(function() {
    return delTask(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/task/export', {
    ...queryParams.value
  }, `task_${new Date().getTime()}.xlsx`)
}

getList()
</script>

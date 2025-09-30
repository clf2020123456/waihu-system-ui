<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="下次联系时间" prop="nextContactTime">
        <el-date-picker clearable
          v-model="queryParams.nextContactTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择下次联系时间">
        </el-date-picker>
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
          v-hasPermi="['system:customerFollowUp:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:customerFollowUp:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:customerFollowUp:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:customerFollowUp:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerFollowUpList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="跟进ID" align="center" prop="id" />
      <el-table-column label="跟进内容" align="center" prop="followContent" />
      <el-table-column label="下次联系时间" align="center" prop="nextContactTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.nextContactTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:customerFollowUp:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:customerFollowUp:remove']">删除</el-button>
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

    <!-- 添加或修改客户跟进对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerFollowUpRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="跟进内容">
          <editor v-model="form.followContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="下次联系时间" prop="nextContactTime">
          <el-date-picker clearable
            v-model="form.nextContactTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择下次联系时间">
          </el-date-picker>
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

<script setup name="CustomerFollowUp">
import { listCustomerFollowUp, getCustomerFollowUp, delCustomerFollowUp, addCustomerFollowUp, updateCustomerFollowUp } from "@/api/system/customerFollowUp"

const { proxy } = getCurrentInstance()

const customerFollowUpList = ref([])
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
    followContent: null,
    nextContactTime: null,
  },
  rules: {
    followContent: [
      { required: true, message: "跟进内容不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询客户跟进列表 */
function getList() {
  loading.value = true
  listCustomerFollowUp(queryParams.value).then(response => {
    customerFollowUpList.value = response.rows
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
    followContent: null,
    nextContactTime: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null
  }
  proxy.resetForm("customerFollowUpRef")
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
  title.value = "添加客户跟进"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getCustomerFollowUp(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改客户跟进"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerFollowUpRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCustomerFollowUp(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCustomerFollowUp(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除客户跟进编号为"' + _ids + '"的数据项？').then(function() {
    return delCustomerFollowUp(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/customerFollowUp/export', {
    ...queryParams.value
  }, `customerFollowUp_${new Date().getTime()}.xlsx`)
}

getList()
</script>

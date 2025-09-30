<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
      <el-form-item label="批次号" prop="batchNo">
        <el-input
          v-model="queryParams.batchNo"
          placeholder="请输入批次号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="短信状态" prop="smsStatus">
        <el-select v-model="queryParams.smsStatus" placeholder="请选择短信状态" clearable style="width: 200px;">
          <el-option
            v-for="dict in sms_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户标签" prop="tags">
        <el-select v-model="queryParams.tags" placeholder="请选择客户标签" clearable style="width: 200px" multiple collapse-tags>
          <el-option v-for="tag in allTags" :key="tag.value" :label="tag.label" :value="tag.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="消费金额" prop="consumptionAmount">
        <el-input
          v-model="queryParams.consumptionAmount"
          placeholder="请输入消费金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="所属用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入所属用户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="所属集团用户ID" prop="groupUserId">
        <el-input
          v-model="queryParams.groupUserId"
          placeholder="请输入所属集团用户ID"
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
          v-hasPermi="['system:customer:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:customer:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:customer:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:customer:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Download"
          @click="handleDownloadTemplate"
          v-hasPermi="['system:customer:import']"
        >下载模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['system:customer:import']"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Message"
          :disabled="multiple"
          @click="handleBatchSms"
          v-hasPermi="['system:task:add', 'system:taskCustomerRelation:add']"
        >批量短信</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Phone"
          :disabled="multiple"
          @click="handleBatchCall"
          v-hasPermi="['system:task:add', 'system:taskCustomerRelation:add']"
        >批量电话</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="showAddTagDialog"
          v-hasPermi="['system:customer:edit']"
        >管理标签</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="客户ID" align="center" prop="id" /> -->
      <el-table-column label="客户名称" align="center" prop="customerName" sortable="custom" />
      <el-table-column label="手机号" align="center" prop="phone" sortable="custom" />
      <el-table-column label="批次号" align="center" prop="batchNo" sortable="custom" />
      <el-table-column label="标签" align="center" prop="tags" sortable="custom">
        <template #default="scope">
          <el-tag v-for="tag in parseTags(scope.row.tags)" :key="tag" size="small" type="info" style="margin-right: 5px;">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="短信状态" align="center" prop="smsStatus" sortable="custom">
        <template #default="scope">
          <dict-tag :options="sms_status" :value="scope.row.smsStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="消费金额" align="center" prop="consumptionAmount" sortable="custom" />
      <!-- <el-table-column label="所属用户ID" align="center" prop="userId" />
      <el-table-column label="所属集团用户ID" align="center" prop="groupUserId" /> -->
      <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:customer:edit']">修改</el-button>
          <el-button link type="primary" icon="Document" @click="handleFollowUp(scope.row)" v-hasPermi="['system:customerFollowUp:list', 'system:customerFollowUp:add']">跟进记录</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:customer:remove']">删除</el-button>
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

    <!-- 添加或修改客户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="form.batchNo" placeholder="请输入批次号" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="form.tags" placeholder="请选择客户标签" multiple collapse-tags style="width: 100%;">
            <el-option v-for="tag in allTags" :key="tag.value" :label="tag.label" :value="tag.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="短信状态" prop="smsStatus">
          <el-select v-model="form.smsStatus" placeholder="请选择短信状态">
            <el-option
              v-for="dict in sms_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消费金额" prop="consumptionAmount">
          <el-input v-model="form.consumptionAmount" placeholder="请输入消费金额" />
        </el-form-item>
        <!-- <el-form-item label="所属用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入所属用户ID" />
        </el-form-item>
        <el-form-item label="所属集团用户ID" prop="groupUserId">
          <el-input v-model="form.groupUserId" placeholder="请输入所属集团用户ID" />
        </el-form-item> -->
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

    <!-- 客户跟进记录对话框 -->
    <follow-up-dialog 
      v-model="followUpDialogVisible"
      :customer="currentCustomer"
    />

    <!-- 标签管理弹窗 -->
    <el-dialog title="管理我的标签" v-model="showTagDialog" width="400px" append-to-body>
      <div class="tag-management">
        <div class="tag-section">
          <h4>系统默认标签（电话状态）</h4>
          <div class="tag-list">
            <el-tag v-for="dict in phoneStatusList" :key="dict.value" size="small" type="info" style="margin: 5px;">{{ dict.label }}</el-tag>
          </div>
        </div>
        <div class="tag-section">
          <h4>我的自定义标签</h4>
          <div class="tag-list">
            <el-tag v-for="tag in userDefinedTags" :key="tag.id" size="small" type="primary" closable :disable-transitions="false" @close="handleDeleteTag(tag.id)">
              {{ tag.tagName }}
            </el-tag>
          </div>
        </div>
        <div class="tag-input-section">
          <el-input v-model="newTagName" placeholder="输入新标签名称" style="width: 200px; margin-right: 10px;"></el-input>
          <el-button type="primary" @click="handleAddTag">添加标签</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog title="导入客户" v-model="importDialogVisible" width="400px" append-to-body>
      <div class="import-section">
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="{ 'Content-Type': 'multipart/form-data' }"
          :action="importUrl"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
          :auto-upload="false"
          :show-file-list="true"
          class="upload-demo"
        >
          <el-button type="primary" @click="$refs.upload.submit()">上传文件</el-button>
          <template #tip>
            <div class="el-upload__tip text-center">
              <span>支持 .xlsx, .xls 格式</span>
              <el-button type="text" @click="handleDownloadTemplate">下载模板</el-button>
            </div>
          </template>
        </el-upload>
        <div class="import-tips">
          <h4>导入说明：</h4>
          <ul>
            <li>1. 导入字段：客户名称、手机号码、批次号、消费金额</li>
            <li>2. 客户名称和手机号码为必填项</li>
            <li>3. 请严格按照模板格式填写数据</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Customer">
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer, exportTemplate } from "@/api/system/customer"
import { addTask } from "@/api/system/task"
import { addTaskCustomerRelation } from "@/api/system/taskCustomerRelation"
import { getTagsByUser, addUserDefinedTag, delUserDefinedTag } from '@/api/system/userDefinedTag'
import FollowUpDialog from './components/FollowUpDialog.vue'

const { proxy } = getCurrentInstance()
// 正确的字典使用方式 - 使用解构赋值
const { sms_status, phone_status } = proxy.useDict('sms_status', 'phone_status')

// 电话状态列表，用于标签管理弹窗显示
const phoneStatusList = ref([])

// 初始化标签数据
function loadUserDefinedTags() {
  getTagsByUser().then(res => {
    userDefinedTags.value = res.data || []
    // 显示字典数据以便调试
    console.log('sms_status:', sms_status)
    console.log('phone_status:', phone_status)
    // 确保phone_status是数组
    const phoneStatusTags = phone_status.value
    console.log('phoneStatusTags:', phoneStatusTags)
    // 更新电话状态列表用于标签管理弹窗
    phoneStatusList.value = phoneStatusTags
    // 合并系统标签和用户自定义标签
    allTags.value = [...phoneStatusTags.map(item => ({ value: item.label, label: item.label })), ...userDefinedTags.value.map(tag => ({ value: tag.tagName, label: tag.tagName }))]
  })
}

// 解析标签字符串为数组
function parseTags(tags) {
  if (!tags) return []
  return tags.split(',')
}

// 显示标签管理弹窗
function showAddTagDialog() {
  showTagDialog.value = true
  // 重新加载标签列表
  loadUserDefinedTags()
}

// 添加自定义标签
function handleAddTag() {
  if (!newTagName.value.trim()) {
    proxy.$modal.msgWarning('标签名称不能为空')
    return
  }

  // 检查是否已存在相同名称的标签
  const exists = userDefinedTags.value.some(tag => tag.tagName === newTagName.value.trim())
  // 确保phone_status是数组再使用
  const phoneStatusTags = Array.isArray(phone_status) ? phone_status : []
  const systemExists = phoneStatusTags.some(dict => dict.label === newTagName.value.trim())
  
  if (exists || systemExists) {
    proxy.$modal.msgWarning('该标签名称已存在')
    return
  }

  addUserDefinedTag({ tagName: newTagName.value.trim() }).then(res => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess('标签添加成功')
      newTagName.value = ''
      loadUserDefinedTags()
    } else {
      proxy.$modal.msgError(res.msg || '标签添加失败')
    }
  })
}

// 删除自定义标签
function handleDeleteTag(id) {
  proxy.$modal.confirm('确定要删除该标签吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delUserDefinedTag(id).then(res => {
      if (res.code === 200) {
        proxy.$modal.msgSuccess('标签删除成功')
        loadUserDefinedTags()
      } else {
        proxy.$modal.msgError(res.msg || '标签删除失败')
      }
    })
  })
}

const customerList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const followUpDialogVisible = ref(false)
const currentCustomer = ref(null)
const showTagDialog = ref(false)
const userDefinedTags = ref([])
const allTags = ref([])
const newTagName = ref('')
const importDialogVisible = ref(false)
const importUrl = ref('')

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: null,
    phone: null,
    batchNo: null,
    tags: null,
    smsStatus: null,
    consumptionAmount: null,
    userId: null,
    groupUserId: null,
    // 排序字段
    orderByColumn: null,
    // 排序方式（asc或desc）
    isAsc: null
  },
  rules: {
    customerName: [
      { required: true, message: "客户名称不能为空", trigger: "blur" }
    ],
    phone: [
      { required: true, message: "手机号不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询客户列表 */
function getList() {
  loading.value = true
  listCustomer(queryParams.value).then(response => {
    customerList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 处理排序变化 */
function handleSortChange(column) {
  if (column.order) {
    queryParams.value.orderByColumn = column.prop;
    queryParams.value.isAsc = column.order === 'ascending' ? 'asc' : 'desc';
  } else {
    queryParams.value.orderByColumn = null;
    queryParams.value.isAsc = null;
  }
  getList();
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
    customerName: null,
    phone: null,
    batchNo: null,
    tags: [], // 修改为数组
    smsStatus: '0', // 默认值为0（未发送）
    consumptionAmount: null,
    userId: null,
    groupUserId: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("customerRef")
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
  // 初始化标签数据
  loadUserDefinedTags()
  open.value = true
  title.value = "添加客户"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  // 初始化标签数据
  loadUserDefinedTags()
  const _id = row.id || ids.value
  getCustomer(_id).then(response => {
    form.value = response.data
    // 处理标签数据
    if (form.value.tags) {
      form.value.tags = form.value.tags.split(',')
    }
    open.value = true
    title.value = "修改客户"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerRef"].validate(valid => {
    if (valid) {
      // 处理标签数据
      if (form.value.tags && Array.isArray(form.value.tags)) {
        form.value.tags = form.value.tags.join(',')
      }
      
      if (form.value.id != null) {
        updateCustomer(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCustomer(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 批量短信按钮操作 */
function handleBatchSms() {
  proxy.$modal.confirm('是否确认为选中的' + ids.value.length + '个客户创建批量短信任务？').then(function() {
    // 创建任务并直接包含客户ID列表和任务类型
    const task = {
      taskName: `批量短信任务_${new Date().getTime()}`,
      taskStatus: '0', // 0待处理
      randomInterval: 2, // 随机间隔10秒
      remark: `批量发送短信给${ids.value.length}个客户`,
      customerIds: ids.value, // 客户ID列表
      type: '2' // 2=短信任务类型
    }
    return addTask(task)
  }).then(() => {
    proxy.$modal.msgSuccess(`批量短信任务创建成功，已为${ids.value.length}个客户建立任务关联`)
  }).catch(error => {
    console.error('批量短信任务创建失败:', error)
    proxy.$modal.msgError('批量短信任务创建失败，请重试')
  })
}

/** 批量电话按钮操作 */
function handleBatchCall() {
  proxy.$modal.confirm('是否确认为选中的' + ids.value.length + '个客户创建批量电话任务？').then(function() {
    // 创建任务并直接包含客户ID列表和任务类型
    const task = {
      taskName: `批量电话任务_${new Date().getTime()}`,
      taskStatus: '0', // 0待处理
      randomInterval: 10, // 随机间隔20秒
      remark: `批量拨打电话给${ids.value.length}个客户`,
      customerIds: ids.value, // 客户ID列表
      type: '1' // 1=电话任务类型
    }
    return addTask(task)
  }).then(() => {
    proxy.$modal.msgSuccess(`批量电话任务创建成功，已为${ids.value.length}个客户建立任务关联`)
  }).catch(error => {
    console.error('批量电话任务创建失败:', error)
    proxy.$modal.msgError('批量电话任务创建失败，请重试')
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除客户编号为"' + _ids + '"的数据项？').then(function() {
    return delCustomer(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(error => {
    console.error('删除失败:', error)
    proxy.$modal.msgError('删除失败，请重试')
  })
}

/** 跟进记录按钮操作 */
function handleFollowUp(row) {
  currentCustomer.value = row
  followUpDialogVisible.value = true
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/customer/export', {
    ...queryParams.value
  }, `customer_${new Date().getTime()}.xlsx`)
}

/** 下载模板按钮操作 */
function handleDownloadTemplate() {
  exportTemplate().then(response => {
    // 创建一个Blob对象
    const blob = new Blob([response], { type: 'application/vnd.ms-excel' })
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customer_import_template_${new Date().getTime()}.xlsx`
    // 触发下载
    document.body.appendChild(link)
    link.click()
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }).catch(error => {
    console.error('下载模板失败:', error)
    proxy.$modal.msgError('下载模板失败，请重试')
  })
}

/** 导入按钮操作 */
function handleImport() {
  // 设置导入API URL - 使用相对路径
  importUrl.value = '/system/customer/import'
  // 显示导入对话框
  importDialogVisible.value = true
  // 重置上传组件
  if (proxy.$refs.upload) {
    proxy.$refs.upload.clearFiles()
  }
}

/** 导入成功处理 */
function handleImportSuccess(response) {
  if (response.code === 200) {
    proxy.$modal.msgSuccess('导入成功')
    importDialogVisible.value = false
    getList() // 重新加载客户列表
  } else {
    proxy.$modal.msgError(response.msg || '导入失败')
  }
}

/** 导入失败处理 */
function handleImportError(error) {
  console.error('导入失败:', error)
  proxy.$modal.msgError('导入失败，请检查文件格式是否正确')
}

// 初始化标签数据
loadUserDefinedTags()
// 加载客户列表
getList()

</script>

<style scoped>
.tag-management {
  padding: 10px 0;
}

.tag-section {
  margin-bottom: 20px;
}

.tag-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-input-section {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

/* 优化标签样式 */
.el-tag {
  transition: all 0.3s ease;
}

.el-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 标签管理按钮样式 */
.el-button[icon="Plus"] {
  margin-right: 5px;
}

/* 优化表格中标签的显示 */
.el-table-column:nth-child(5) .el-tag {
  margin-right: 6px;
}

/* 优化多选下拉框样式 */
.el-select {
  width: 100%;
}

/* 优化标签弹窗样式 */
.el-dialog {
  border-radius: 8px;
}

.el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
}

.el-dialog__footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

/* 导入对话框样式 */
.import-section {
  padding: 10px 0;
}

.import-tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.import-tips h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.import-tips ul {
  margin: 0;
  padding-left: 20px;
}

.import-tips li {
  font-size: 13px;
  color: #606266;
  line-height: 24px;
}
</style>

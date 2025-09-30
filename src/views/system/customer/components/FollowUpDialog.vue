<template>
  <el-dialog 
    :title="`${customer?.customerName || '客户'}跟进记录`" 
    v-model="visible" 
    width="800px" 
    append-to-body
  >
    <!-- 客户基本信息 -->
    <div v-if="customer" class="customer-info mb-4 p-3 bg-gray-50 rounded">
      <el-descriptions :column="3" :border="false">
        <el-descriptions-item label="客户名称">{{ customer.customerName }}</el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ customer.phone }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ customer.batchNo }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 新增跟进记录按钮 -->
    <el-row :gutter="10" class="mb-4">
      <el-col :span="2">
        <el-button 
          type="primary" 
          icon="Plus" 
          @click="handleAddFollowUp" 
          v-hasPermi="['system:customerFollowUp:add']"
        >新增记录</el-button>
      </el-col>
    </el-row>

    <!-- 跟进记录列表 -->
    <el-table 
      v-loading="loading" 
      :data="followUpList" 
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="跟进内容" align="center" prop="followContent" width="300" />
      <el-table-column label="下次联系时间" align="center" prop="nextContactTime">
        <template #default="scope">
          {{ formatDate(scope.row.nextContactTime) }}
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button 
            link 
            type="primary" 
            icon="Edit" 
            @click="handleEditFollowUp(scope.row)" 
            v-hasPermi="['system:customerFollowUp:edit']"
          >修改</el-button>
          <el-button 
            link 
            type="danger" 
            icon="Delete" 
            @click="handleDeleteFollowUp(scope.row.id)" 
            v-hasPermi="['system:customerFollowUp:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改跟进记录对话框 -->
    <el-dialog 
      :title="followUpTitle" 
      v-model="followUpOpen" 
      width="500px" 
      append-to-body
    >
      <el-form 
        ref="followUpRef" 
        :model="followUpForm" 
        :rules="followUpRules" 
        label-width="120px"
      >
        <el-form-item label="跟进内容" prop="followContent">
          <el-input 
            v-model="followUpForm.followContent" 
            type="textarea" 
            placeholder="请输入跟进内容" 
            rows="4"
          />
        </el-form-item>
        <el-form-item label="下次联系时间" prop="nextContactTime">
          <el-date-picker
            v-model="followUpForm.nextContactTime"
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFollowUpForm">确 定</el-button>
          <el-button @click="cancelFollowUp">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup name="FollowUpDialog">
import { ref, reactive, watch, computed } from 'vue'
import { listCustomerFollowUp, getCustomerFollowUp, delCustomerFollowUp, addCustomerFollowUp, updateCustomerFollowUp } from '@/api/system/customerFollowUp'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

// 对话框显示状态
const visible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

// 跟进记录相关状态
const followUpList = ref([])
const loading = ref(true)
const total = ref(0)
const followUpIds = ref([])
const followUpOpen = ref(false)
const followUpTitle = ref('')
const followUpRef = ref(null)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerId: null
})

// 跟进记录表单数据
const followUpForm = reactive({
  id: null,
  customerId: null,
  followContent: null,
  nextContactTime: null
})

// 表单验证规则
const followUpRules = {
  followContent: [
    { required: true, message: '跟进内容不能为空', trigger: 'blur' },
    { max: 200, message: '跟进内容不能超过200个字符', trigger: 'blur' }
  ],
  nextContactTime: [
    { required: true, message: '下次联系时间不能为空', trigger: 'blur' }
  ]
}

// 监听客户变化，重新加载跟进记录
watch(() => props.customer, (newCustomer) => {
  if (newCustomer && newCustomer.id) {
    queryParams.customerId = newCustomer.id
    if (visible.value) {
      getList()
    }
  }
}, { immediate: true, deep: true })

// 监听对话框显示状态，加载数据
watch(visible, (newVisible) => {
  if (newVisible && props.customer && props.customer.id) {
    queryParams.customerId = props.customer.id
    getList()
  }
})

// 查询跟进记录列表
function getList() {
  loading.value = true
  // 确保查询参数中包含customerId
  if (props.customer && props.customer.id) {
    queryParams.customerId = props.customer.id
  }
  listCustomerFollowUp(queryParams).then(response => {
    // 对返回的数据进行日期格式化处理
    const formattedData = response.rows.map(item => {
      const formattedItem = { ...item }
      // 格式化nextContactTime
      if (formattedItem.nextContactTime) {
        try {
          const date = new Date(formattedItem.nextContactTime)
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            formattedItem.nextContactTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
          }
        } catch (error) {
          console.error('列表数据日期格式化错误:', error)
        }
      }
      // 格式化createTime
      if (formattedItem.createTime) {
        try {
          const date = new Date(formattedItem.createTime)
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            formattedItem.createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
          }
        } catch (error) {
          console.error('列表数据创建时间格式化错误:', error)
        }
      }
      return formattedItem
    })
    followUpList.value = formattedData
    total.value = response.total
    loading.value = false
  })
}

// 多选框选中数据
function handleSelectionChange(selection) {
  followUpIds.value = selection.map(item => item.id)
}

// 新增跟进记录
function handleAddFollowUp() {
  resetFollowUpForm()
  // 设置当前客户ID
  if (props.customer && props.customer.id) {
    followUpForm.customerId = props.customer.id
  }
  followUpTitle.value = '新增跟进记录'
  followUpOpen.value = true
}

// 修改跟进记录
function handleEditFollowUp(row) {
  resetFollowUpForm()
  getCustomerFollowUp(row.id).then(response => {
    followUpForm.id = response.data.id
    followUpForm.customerId = response.data.customerId
    followUpForm.followContent = response.data.followContent
    // 对日期进行格式化处理，确保符合组件要求的格式
    if (response.data.nextContactTime) {
      // 尝试将后端返回的日期字符串格式化为标准格式
      try {
        const date = new Date(response.data.nextContactTime)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          followUpForm.nextContactTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        } else {
          // 如果解析失败，仍然使用原始值
          followUpForm.nextContactTime = response.data.nextContactTime
        }
      } catch (error) {
        console.error('日期格式化错误:', error)
        followUpForm.nextContactTime = response.data.nextContactTime
      }
    } else {
      followUpForm.nextContactTime = null
    }
    followUpTitle.value = '修改跟进记录'
    followUpOpen.value = true
  })
}

// 删除跟进记录
function handleDeleteFollowUp(id) {
  proxy.$modal.confirm('是否确认删除该跟进记录？').then(function() {
    return delCustomerFollowUp(id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(error => {
    console.error('删除失败:', error)
    proxy.$modal.msgError('删除失败，请重试')
  })
}

// 提交跟进记录表单
function submitFollowUpForm() {
  followUpRef.value.validate(valid => {
    if (valid) {
      if (followUpForm.id != null) {
        updateCustomerFollowUp(followUpForm).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          followUpOpen.value = false
          getList()
        }).catch(error => {
          console.error('修改失败:', error)
          proxy.$modal.msgError('修改失败，请重试')
        })
      } else {
        addCustomerFollowUp(followUpForm).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          followUpOpen.value = false
          getList()
        }).catch(error => {
          console.error('新增失败:', error)
          proxy.$modal.msgError('新增失败，请重试')
        })
      }
    }
  })
}

// 取消跟进记录操作
function cancelFollowUp() {
  followUpOpen.value = false
  resetFollowUpForm()
}

// 重置跟进记录表单
function resetFollowUpForm() {
  followUpForm.id = null
  followUpForm.customerId = props.customer?.id || null
  followUpForm.followContent = null
  followUpForm.nextContactTime = null
  if (followUpRef.value) {
    followUpRef.value.resetFields()
  }
}

// 格式化日期时间
function formatDate(dateString) {
  if (!dateString) return ''
  
  // 尝试解析日期字符串
  let date;
  try {
    // 先检查是否为ISO格式或标准格式
    if (typeof dateString === 'string') {
      // 处理各种可能的日期格式
      if (dateString.includes('-') && !dateString.includes('T')) {
        // 尝试不同的格式解析
        const formats = ['yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd', 'MM-dd-yyyy', 'yyyy/MM/dd'];
        let parsed = false;
        
        // 直接尝试创建Date对象
        date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          parsed = true;
        }
        
        // 如果直接解析失败，尝试处理特殊格式
        if (!parsed) {
          // 处理类似 "yyyy-09-Mo" 这样的格式
          const specialPattern = /^(\d{4})-(\d{2})-(\w{2})/;
          const match = dateString.match(specialPattern);
          if (match) {
            const [, year, month] = match;
            // 简单处理，将Mo等替换为01
            date = new Date(`${year}-${month}-01`);
            parsed = true;
          }
        }
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    // 处理无效日期
    if (isNaN(date.getTime())) {
      console.warn('无效的日期格式:', dateString);
      return '无效日期';
    }
  } catch (error) {
    console.error('日期解析错误:', error);
    return '日期格式错误';
  }
  
  // 格式化日期时间
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取当前实例的proxy
const { proxy } = getCurrentInstance()
</script>

<style scoped>
.customer-info {
  margin-bottom: 20px;
}
</style>
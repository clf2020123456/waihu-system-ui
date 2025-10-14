<template>
  <div class="app-container">
          <!-- 一键拨号/短信操作区 -->
          <el-col :span="12">
        <div class="instant-action-group" style="margin-bottom: 10px;">
          <span class="action-label">快速操作：</span>
          <el-input
            v-model="instantPhone"
            placeholder="请输入手机号"
            clearable
            style="width: 180px;"
            @keyup.enter="handleInstantCall"
          />
          <el-button
            type="success"
            plain
            icon="Phone"
            @click="handleInstantCall"
            v-hasPermi="['system:customer:edit']"
          >一键拨号</el-button>
          <el-button
            type="warning"
            plain
            icon="Message"
            @click="handleInstantSms"
            v-hasPermi="['system:customer:edit']"
          >一键短信</el-button>
        </div>
      </el-col>
      
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
        <el-select v-model="queryParams.tags" placeholder="请选择客户标签" clearable style="width: 200px">
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
      <!-- 用户筛选 - 所有用户都显示，根据角色显示不同选项 -->
      <el-form-item label="业务员" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请选择业务员" clearable filterable style="width: 200px">
          <el-option
            v-for="user in userFilterList"
            :key="user.userId"
            :label="user.nickName || user.userName"
            :value="user.userId"
          />
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
          v-if="!selectAllPages"
          type="info"
          plain
          icon="Check"
          @click="handleSelectAllPages"
        >勾选全部页</el-button>
        <el-button
          v-else
          type="warning"
          plain
          icon="Close"
          @click="handleCancelSelectAll"
        >取消全选 (已选{{ allPageIds.length }}条)</el-button>
      </el-col>
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
        >下载模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Upload"
          @click="handleImport"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Message"
          :disabled="multiple"
          @click="handleBatchSms"
        >批量短信</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Phone"
          :disabled="multiple"
          @click="handleBatchCall"
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
      <el-table-column label="业务员" align="center" prop="userId" width="120" sortable="custom">
        <template #default="scope">
          {{ getUserName(scope.row.userId) }}
        </template>
      </el-table-column>
      <el-table-column label="批次号" align="center" prop="batchNo" sortable="custom" />
      <el-table-column label="客户名称" align="center" prop="customerName" sortable="custom" />
      <el-table-column label="手机号" align="center" prop="phone" sortable="custom" />
      <el-table-column label="客户标签" align="center" prop="tags" sortable="custom">
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
      <el-table-column label="备注" align="center" prop="remark" sortable="custom" />
      <el-table-column label="默认短信" align="center" prop="defaultSmsContent" :show-overflow-tooltip="true" />
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
        <el-form-item label="默认短信" prop="defaultSmsContent">
          <el-input v-model="form.defaultSmsContent" type="textarea" :rows="3" placeholder="请输入默认短信内容" maxlength="500" show-word-limit />
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
            <el-tag v-for="tag in phoneStatusList.length > 0 ? phoneStatusList : DEFAULT_TAGS" :key="tag.value || tag.label" size="small" type="info" style="margin: 5px;">{{ tag.label || tag.value }}</el-tag>
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

    <!-- 短信内容输入对话框 -->
    <el-dialog title="批量短信" v-model="smsDialogVisible" width="500px" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="短信类型">
          <el-radio-group v-model="smsType">
            <el-radio label="default">使用默认短信</el-radio>
            <el-radio label="custom">自定义短信</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="短信内容" v-if="smsType === 'custom'">
          <el-input
            v-model="smsContent"
            type="textarea"
            :rows="5"
            placeholder="请输入短信内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="说明" v-if="smsType === 'default'">
          <el-alert
            title="将使用每个客户的默认短信内容进行发送"
            type="info"
            :closable="false"
            show-icon
          />
        </el-form-item>
        <el-form-item label="发送对象">
          <el-tag type="info">已选择 {{ ids.length }} 个客户</el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="smsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmBatchSms">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 一键短信内容输入对话框 -->
    <el-dialog title="一键短信" v-model="instantSmsDialogVisible" width="500px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="手机号" required>
          <el-input v-model="instantPhone" placeholder="请输入要发送的手机号" disabled />
        </el-form-item>
        <el-form-item label="短信内容" required>
          <el-input
            v-model="instantSmsContent"
            type="textarea"
            :rows="5"
            placeholder="请输入短信内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="instantSmsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmInstantSms">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog title="导入客户" v-model="importDialogVisible" width="400px" append-to-body>
      <div class="import-section">
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :action="importUrl"
          :headers="uploadHeaders"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
          :auto-upload="false"
          :show-file-list="true"
          :on-change="handleFileChange"
          class="upload-demo"
        >
          <el-button type="primary">选择文件</el-button>
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
          <el-button @click="importDialogVisible = false" :disabled="importLoading">取 消</el-button>
          <el-button type="primary" @click="submitImport" :disabled="!hasFileSelected || importLoading" :loading="importLoading">
            {{ importLoading ? '导入中...' : '确 认' }}
          </el-button>
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
import { addInstantRequest } from '@/api/system/instantRequest'
import { listUser } from '@/api/system/user'
import { getToken } from '@/utils/auth'
import FollowUpDialog from './components/FollowUpDialog.vue'
import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()

// 正确的字典使用方式 - 使用解构赋值
const { sms_status, phone_status } = proxy.useDict('sms_status', 'phone_status')

// 电话状态列表，用于标签管理弹窗显示
const phoneStatusList = ref([])

// 默认标签配置
const DEFAULT_TAGS = [
  { value: '未拨号', label: '未拨号' },
  { value: '已拨号', label: '已拨号' },
  { value: '已接通', label: '已接通' },
  { value: '占线', label: '占线' },
  { value: '无人接听', label: '无人接听' },
  { value: '已挂断', label: '已挂断' },
  { value: '空号', label: '空号' },
  { value: '关机', label: '关机' }
]

// 初始化标签数据
function loadUserDefinedTags() {
  // 先获取用户自定义标签
  getTagsByUser().then(res => {
    userDefinedTags.value = res.data || []
    
    // 确保phone_status是正确的数组格式
    let phoneStatusTags = []
    if (phone_status && phone_status.value && Array.isArray(phone_status.value)) {
      phoneStatusTags = phone_status.value
    } else if (Array.isArray(phone_status)) {
      phoneStatusTags = phone_status
    }
    
    // 显示字典数据以便调试
    console.log('sms_status:', sms_status)
    console.log('phone_status:', phone_status)
    console.log('phoneStatusTags:', phoneStatusTags)
    
    // 更新电话状态列表用于标签管理弹窗
    phoneStatusList.value = phoneStatusTags
    
    // 创建系统默认标签数组
    const systemTags = phoneStatusTags.map(item => ({
      value: item.label || item.value,
      label: item.label || item.value
    }))
    
    // 创建用户自定义标签数组
    const customTags = userDefinedTags.value.map(tag => ({
      value: tag.tagName,
      label: tag.tagName
    }))
    
    // 合并系统标签和用户自定义标签，如果系统标签为空则使用默认标签
    if (systemTags.length > 0) {
      allTags.value = [...systemTags, ...customTags]
    } else {
      // 如果系统没有配置字典，使用默认标签
      allTags.value = [...DEFAULT_TAGS, ...customTags]
    }
    
    // 确保标签数组不为空，如果仍然为空则使用默认标签
    if (allTags.value.length === 0) {
      allTags.value = [...DEFAULT_TAGS]
    }
  }).catch(error => {
    console.error('加载标签失败:', error)
    // 出错时也提供默认标签
    allTags.value = [...DEFAULT_TAGS]
  })
}

// 解析标签字符串为数组
function parseTags(tags) {
  if (!tags) return []
  return tags.split(',')
}

// 根据userId获取用户名称
function getUserName(userId) {
  if (!userId) return '-'
  // 先从缓存的用户映射表中查找
  const userInfo = allUsersMap.value.get(userId)
  if (userInfo) {
    return userInfo.nickName || userInfo.userName
  }
  // 如果缓存中没有，从筛选列表中查找
  const user = userFilterList.value.find(u => u.userId === userId)
  if (user) {
    return user.nickName || user.userName
  }
  // 都找不到，返回加载中提示
  return '加载中...'
}

// 初始化用户权限和筛选列表
async function initUserFilter() {
  try {
    // 获取当前用户的角色
    const roles = userStore.roles
    const currentUserId = userStore.id
    console.log('当前用户角色:', roles)
    
    // 判断用户角色
    const isAdmin = roles.includes('admin') // 超级管理员
    const isCompanyManager = roles.some(role => role.includes('company') || role.includes('公司')) // 公司管理员（roleId=102）
    const isMinister = roles.some(role => role.includes('minister') || role.includes('部长')) // 部长（roleId=101）
    
    if (isAdmin) {
      // 超级管理员：可以查看所有用户
      currentUserRole.value = 'admin'
      
      // 加载所有用户
      const res = await listUser({ pageSize: 1000 })
      userFilterList.value = res.rows || []
    } else if (isCompanyManager) {
      // 公司管理员：可以查看整个公司的员工
      currentUserRole.value = 'companyManager'
      
      // 加载公司下所有用户（包括部长和业务员）
      const res = await listUser({ companyUserId: currentUserId, pageSize: 1000 })
      userFilterList.value = res.rows || []
    } else if (isMinister) {
      // 部长：可以查看自己和下属业务员
      currentUserRole.value = 'minister'
      
      // 加载自己和下属业务员
      const res = await listUser({ parentUserId: currentUserId, pageSize: 1000 })
      
      // 将自己也加入列表
      const subordinates = res.rows || []
      userFilterList.value = [
        {
          userId: currentUserId,
          userName: userStore.name,
          nickName: userStore.nickName
        },
        ...subordinates
      ]
    } else {
      // 业务员：只能查看自己的数据
      currentUserRole.value = 'salesman'
      
      // 业务员的筛选列表只有自己
      userFilterList.value = [
        {
          userId: currentUserId,
          userName: userStore.name,
          nickName: userStore.nickName
        }
      ]
    }
    
    // 将筛选列表中的用户信息加入映射表（用于快速查找显示）
    userFilterList.value.forEach(user => {
      if (user.userId) {
        allUsersMap.value.set(user.userId, {
          userId: user.userId,
          userName: user.userName,
          nickName: user.nickName
        })
      }
    })
    
    // 同时加载所有用户信息到映射表（为了显示不在筛选列表中的业务员）
    // 这样即使客户属于其他业务员，也能正确显示名称
    if (isAdmin || isCompanyManager) {
      // 管理员类角色已经加载了相关的所有用户
      // 不需要额外加载
    } else {
      // 非管理员角色，额外加载所有用户信息用于显示
      try {
        const allUsersRes = await listUser({ pageSize: 1000 })
        if (allUsersRes.rows) {
          allUsersRes.rows.forEach(user => {
            if (user.userId && !allUsersMap.value.has(user.userId)) {
              allUsersMap.value.set(user.userId, {
                userId: user.userId,
                userName: user.userName,
                nickName: user.nickName
              })
            }
          })
        }
      } catch (error) {
        console.error('加载所有用户信息失败:', error)
      }
    }
    
    // 设置默认筛选为当前用户
    queryParams.value.userId = currentUserId
    
    console.log('用户筛选列表:', userFilterList.value)
    console.log('用户映射表大小:', allUsersMap.value.size)
    console.log('默认筛选用户ID:', queryParams.value.userId)
  } catch (error) {
    console.error('初始化用户筛选失败:', error)
    // 出错时也设置为当前用户
    queryParams.value.userId = userStore.id
  }
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
  // 检查是否与默认标签重复
  const defaultExists = DEFAULT_TAGS.some(tag => tag.label === newTagName.value.trim())
  
  if (exists || systemExists || defaultExists) {
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
const hasFileSelected = ref(false)
const importLoading = ref(false) // 导入加载状态
const smsDialogVisible = ref(false)
const smsContent = ref('')
const smsType = ref('default') // 短信类型：default-默认短信，custom-自定义短信
const instantPhone = ref('') // 一键操作统一使用的手机号
const instantSmsDialogVisible = ref(false)
const instantSmsContent = ref('')

// 用户筛选相关
const userFilterList = ref([]) // 用户筛选列表
const currentUserRole = ref('') // 当前用户角色
const allUsersMap = ref(new Map()) // 所有用户信息映射表，用于显示业务员名称

// 全选全部页相关
const selectAllPages = ref(false) // 是否选中全部页
const allPageIds = ref([]) // 所有页的ID列表

// 上传文件的请求头
const uploadHeaders = ref({
  Authorization: 'Bearer ' + getToken()
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: null,
    phone: null,
    batchNo: null,
    tags: null, // 修改为单个值，支持单选
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
  // 添加调试日志
  console.log('查询参数:', queryParams.value)
  listCustomer(queryParams.value).then(response => {
    customerList.value = response.rows
    total.value = response.total
    loading.value = false
    
    // 提取所有的userId并加载用户信息
    loadUserInfoForCustomers(response.rows)
  })
}

/** 加载客户列表中涉及的用户信息 */
async function loadUserInfoForCustomers(customers) {
  // 提取所有唯一的userId
  const userIds = [...new Set(customers.map(c => c.userId).filter(id => id))]
  
  // 过滤出还没有缓存的userId
  const uncachedUserIds = userIds.filter(id => !allUsersMap.value.has(id))
  
  if (uncachedUserIds.length === 0) {
    return // 所有用户信息都已缓存
  }
  
  try {
    // 批量获取用户信息
    const res = await listUser({ 
      pageSize: 1000, // 获取足够多的用户
    })
    
    // 将获取到的用户信息加入映射表
    if (res.rows && res.rows.length > 0) {
      res.rows.forEach(user => {
        if (user.userId && uncachedUserIds.includes(user.userId)) {
          allUsersMap.value.set(user.userId, {
            userId: user.userId,
            userName: user.userName,
            nickName: user.nickName
          })
        }
      })
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
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
  // 搜索时取消全选状态
  if (selectAllPages.value) {
    selectAllPages.value = false
    allPageIds.value = []
    ids.value = []
  }
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  // 重置时取消全选状态
  if (selectAllPages.value) {
    selectAllPages.value = false
    allPageIds.value = []
    ids.value = []
  }
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  // 如果是全选模式，不更新ids
  if (!selectAllPages.value) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
}

/** 勾选全部页 */
function handleSelectAllPages() {
  proxy.$modal.confirm('确定要选中所有页的数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 获取所有数据的ID（不分页）
    const allQuery = { ...queryParams.value }
    delete allQuery.pageNum
    delete allQuery.pageSize
    allQuery.pageSize=2000
    loading.value = true
    listCustomer(allQuery).then(response => {
      allPageIds.value = response.rows.map(item => item.id)
      ids.value = allPageIds.value
      selectAllPages.value = true
      single.value = allPageIds.value.length != 1
      multiple.value = !allPageIds.value.length
      loading.value = false
      proxy.$modal.msgSuccess(`已选中全部 ${allPageIds.value.length} 条数据`)
    }).catch(() => {
      loading.value = false
      proxy.$modal.msgError('获取全部数据失败')
    })
  })
}

/** 取消全选 */
function handleCancelSelectAll() {
  selectAllPages.value = false
  allPageIds.value = []
  ids.value = []
  single.value = true
  multiple.value = true
  proxy.$modal.msgSuccess('已取消全选')
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
  // 显示短信内容输入对话框
  smsContent.value = ''
  smsType.value = 'default' // 默认选择使用默认短信
  smsDialogVisible.value = true
}

/** 确认发送批量短信 */
function confirmBatchSms() {
  // 如果是自定义短信，需要验证短信内容
  if (smsType.value === 'custom' && (!smsContent.value || smsContent.value.trim() === '')) {
    proxy.$modal.msgWarning('请输入短信内容')
    return
  }
  
  // 创建任务并直接包含客户ID列表和任务类型
  const task = {
    taskName: `批量短信任务_${new Date().getTime()}`,
    taskStatus: '0', // 0待处理
    randomInterval: 2, // 随机间隔2秒
    remark: smsType.value === 'default' 
      ? `批量发送默认短信给${ids.value.length}个客户` 
      : `批量发送自定义短信给${ids.value.length}个客户`,
    customerIds: ids.value, // 客户ID列表
    type: '2', // 2=短信任务类型
    useDefaultSms: smsType.value === 'default' ? '1' : '0', // 是否使用默认短信
    smsContent: smsType.value === 'custom' ? smsContent.value.trim() : '' // 自定义短信内容
  }
  
  addTask(task).then(() => {
    const msg = smsType.value === 'default' 
      ? `批量短信任务创建成功，将使用客户默认短信发送给${ids.value.length}个客户` 
      : `批量短信任务创建成功，已为${ids.value.length}个客户建立任务关联`
    proxy.$modal.msgSuccess(msg)
    smsDialogVisible.value = false
    smsContent.value = ''
    smsType.value = 'default'
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
      taskName: `批量电话任务_${Math.floor(Math.random() * 900000 + 100000)}`, // 生成随机6位数字
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
  importUrl.value = '/dev-api/system/customer/import'
  // 更新上传请求头，确保token是最新的
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getToken()
  }
  // 重置加载状态
  importLoading.value = false
  // 显示导入对话框
  importDialogVisible.value = true
  // 重置上传组件和文件选择状态
  if (proxy.$refs.upload) {
    proxy.$refs.upload.clearFiles()
  }
  hasFileSelected.value = false
}

/** 文件选择变化处理 */
function handleFileChange(file, fileList) {
  hasFileSelected.value = fileList.length > 0
}

/** 提交导入 */
function submitImport() {
  if (proxy.$refs.upload) {
    // 设置加载状态
    importLoading.value = true
    
    // 提交上传
    proxy.$refs.upload.submit()
    
    // 延迟关闭对话框并显示提示，给用户视觉反馈
    setTimeout(() => {
      if (importLoading.value) { // 如果还在加载中（说明没有立即完成）
        importDialogVisible.value = false
        proxy.$notify({
          title: '正在导入',
          message: '客户数据正在后台导入，请稍候...',
          type: 'info',
          duration: 3000
        })
      }
    }, 500)
  }
}

/** 导入成功处理 */
function handleImportSuccess(response) {
  // 重置加载状态
  importLoading.value = false
  // 关闭导入对话框（如果还开着）
  importDialogVisible.value = false
  
  if (response.code === 200) {
    // 使用通知方式显示成功信息，更醒目
    proxy.$notify({
      title: '导入成功',
      message: response.msg || '客户数据已成功导入',
      type: 'success',
      duration: 4000
    })
    // 重新加载客户列表
    getList()
  } else {
    proxy.$notify({
      title: '导入失败',
      message: response.msg || '导入失败，请检查数据格式',
      type: 'error',
      duration: 5000
    })
  }
}

/** 导入失败处理 */
function handleImportError(error) {
  // 重置加载状态
  importLoading.value = false
  // 关闭导入对话框（如果还开着）
  importDialogVisible.value = false
  
  console.error('导入失败:', error)
  proxy.$notify({
    title: '导入失败',
    message: '导入过程中发生错误，请检查文件格式是否正确或重新登录后重试',
    type: 'error',
    duration: 5000
  })
}

/** 一键拨号操作 */
function handleInstantCall() {
  if (!instantPhone.value || instantPhone.value.trim() === '') {
    proxy.$modal.msgWarning('请输入手机号')
    return
  }
  
  // 简单验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(instantPhone.value.trim())) {
    proxy.$modal.msgWarning('请输入正确的手机号格式')
    return
  }
  
  const request = {
    phone: instantPhone.value.trim(),
    requestType: '1', // 1=拨号
    remark: '一键拨号'
  }
  
  addInstantRequest(request).then(() => {
    proxy.$modal.msgSuccess('拨号请求已发送，请在手机端查看')
    instantPhone.value = ''
  }).catch(error => {
    console.error('一键拨号请求创建失败:', error)
    proxy.$modal.msgError('拨号请求创建失败，请重试')
  })
}

/** 一键短信操作 */
function handleInstantSms() {
  if (!instantPhone.value || instantPhone.value.trim() === '') {
    proxy.$modal.msgWarning('请输入手机号')
    return
  }
  
  // 简单验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(instantPhone.value.trim())) {
    proxy.$modal.msgWarning('请输入正确的手机号格式')
    return
  }
  
  // 打开对话框输入短信内容
  instantSmsContent.value = ''
  instantSmsDialogVisible.value = true
}

/** 确认发送一键短信 */
function confirmInstantSms() {
  if (!instantSmsContent.value || instantSmsContent.value.trim() === '') {
    proxy.$modal.msgWarning('请输入短信内容')
    return
  }
  
  const request = {
    phone: instantPhone.value.trim(),
    requestType: '2', // 2=短信
    smsContent: instantSmsContent.value.trim(),
    remark: '一键短信'
  }
  
  addInstantRequest(request).then(() => {
    proxy.$modal.msgSuccess('短信请求已发送，请在手机端查看')
    instantSmsDialogVisible.value = false
    instantPhone.value = ''
    instantSmsContent.value = ''
  }).catch(error => {
    console.error('一键短信请求创建失败:', error)
    proxy.$modal.msgError('短信请求创建失败，请重试')
  })
}

// 页面加载时立即初始化标签数据
// 先设置默认标签，确保界面立即有选项
allTags.value = [...DEFAULT_TAGS]

// 然后异步加载用户自定义标签和系统字典
loadUserDefinedTags()

// 初始化用户筛选并加载客户列表
// 必须等待用户筛选初始化完成（设置默认userId）后再加载列表
initUserFilter().then(() => {
  // 加载客户列表
  getList()
})

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

/* 快速操作分组样式 */
.instant-action-group {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8edf3 100%);
  border: 2px solid #409eff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  white-space: nowrap;
  margin-right: 5px;
}
</style>

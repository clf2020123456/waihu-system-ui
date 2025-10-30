<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="appStore.device === 'mobile'" class="default-theme">
        <!--部门数据-->
        <!-- <pane size="16">
          <el-col>
            <div class="head-container">
              <el-input v-model="deptName" placeholder="请输入部门名称" clearable prefix-icon="Search" style="margin-bottom: 20px" />
            </div>
            <div class="head-container">
              <el-tree :data="deptOptions" :props="{ label: 'label', children: 'children' }" :expand-on-click-node="false" :filter-node-method="filterNode" ref="deptTreeRef" node-key="id" highlight-current default-expand-all @node-click="handleNodeClick" />
            </div>
          </el-col>
        </pane> -->
        <!--用户数据-->
        <pane size="84">
          <el-col>
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
              <el-form-item label="账号" prop="userName">
                <el-input v-model="queryParams.userName" placeholder="请输入账号" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="用户昵称" prop="nickName">
                <el-input v-model="queryParams.nickName" placeholder="请输入用户昵称" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="手机号码" prop="phonenumber">
                <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px">
                  <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="角色" prop="roleId">
                <el-select v-model="queryParams.roleId" placeholder="请选择角色" clearable style="width: 240px">
                  <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="子管理员" prop="subAdminUserId" v-if="isAdmin">
                <el-select v-model="queryParams.subAdminUserId" placeholder="请选择子管理员" clearable style="width: 240px">
                  <el-option v-for="item in subAdminList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="公司管理员" prop="companyUserId">
                <el-select v-model="queryParams.companyUserId" placeholder="请选择公司管理员" clearable style="width: 240px">
                  <el-option v-for="item in companyList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                </el-select>
              </el-form-item> -->
              <el-form-item label="所属上级" prop="parentUserId">
                <el-select v-model="queryParams.parentUserId" filterable placeholder="请选择所属上级" clearable style="width: 240px">
                  <el-option v-for="item in parentUserListForFilter" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="queryParams.remark" placeholder="请输入备注" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="创建时间" style="width: 308px">
                <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:user:add']">新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:user:edit']">修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:user:remove']">删除</el-button>
              </el-col>
              <!-- <el-col :span="1.5">
                <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['system:user:import']">导入</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:user:export']">导出</el-button>
              </el-col> -->
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="50" align="center" />
              <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
              <el-table-column label="账号" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
              <el-table-column label="用户昵称" align="center" key="nickName" prop="nickName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
              <el-table-column label="角色" align="center" key="roleName" prop="roleName" v-if="columns[3].visible" :show-overflow-tooltip="true" />
              <!-- <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber" v-if="columns[4].visible" width="120" /> -->
              <el-table-column label="状态" align="center" key="status" v-if="columns[5].visible">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    active-value="0"
                    inactive-value="1"
                    @change="handleStatusChange(scope.row)"
                  ></el-switch>
                </template>
              </el-table-column>
              <!-- <el-table-column label="公司管理员" align="center" key="companyUserName" prop="companyUserName" v-if="columns[6].visible" :show-overflow-tooltip="true" /> -->
              <el-table-column label="上级" align="center" key="parentUserName" prop="parentUserName" v-if="columns[6].visible" :show-overflow-tooltip="true" />
              <el-table-column label="106短信" align="center" key="smsEnable" prop="smsEnable" v-if="columns[7].visible && canConfigSms" width="100">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.smsEnable"
                    active-value="Y"
                    inactive-value="N"
                    @change="handleSmsEnableChange(scope.row)"
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="106短信" align="center" key="smsEnable" prop="smsEnable" v-if="columns[7].visible && !canConfigSms" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.smsEnable === 'Y' ? 'success' : 'info'">
                    {{ scope.row.smsEnable === 'Y' ? '开启' : '关闭' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="短信配置" align="center" width="120" v-if="canConfigSms">
                <template #default="scope">
                  <el-button link type="primary" icon="Setting" @click="handleSmsConfig(scope.row)" v-hasPermi="['system:user:edit']">配置</el-button>
                </template>
              </el-table-column>
              <el-table-column label="备注" align="center" key="remark" prop="remark" v-if="columns[8].visible" :show-overflow-tooltip="true" />
              <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[9].visible" width="160">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-tooltip content="修改" placement="top" v-if="scope.row.userId !== 1">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top" v-if="scope.row.userId !== 1">
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
                  </el-tooltip>
                  <el-tooltip content="重置密码" placement="top" v-if="scope.row.userId !== 1">
                    <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
                  </el-tooltip>
                  <el-tooltip content="分配角色" placement="top" v-if="scope.row.userId !== 1">
                    <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
          </el-col>
        </pane>
      </splitpanes>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="角色" prop="roleIds">
              <el-select v-model="form.roleIds" placeholder="请选择" @change="handleRoleChange">
                <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId" :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 归属部门已注释 - 用户不需要选择部门 -->
        <!-- <el-row>
          <el-col :span="24">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="enabledDeptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                placeholder="请选择归属部门"
                check-strictly
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="登录账号" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入登录账号" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <!-- <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 统一的上级选择 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="上级" prop="parentUserId">
              <el-select v-model="form.parentUserId" placeholder="请选择上级" clearable filterable>
                <el-option v-for="item in parentUserList" :key="item.userId" :label="item.nickName + ' (' + item.roleName + ')'" :value="item.userId"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 使用人数：公司管理员和子管理员都需要 -->
        <el-row v-if="needMaxUserCount">
          <el-col :span="12">
            <el-form-item label="使用人数" prop="maxUserCount">
              <el-input-number v-model="form.maxUserCount" :min="1" :max="10000" :disabled="isEditingSelf" placeholder="请输入使用人数" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <!-- 到期时间：只有公司管理员需要 -->
          <el-col :span="12" v-if="isCompanyManagerRole">
            <el-form-item label="到期时间" prop="expiryDate">
              <el-date-picker v-model="form.expiryDate" type="datetime" :disabled="isEditingSelf" placeholder="请选择到期时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 106短信配置对话框 -->
    <el-dialog title="106短信配置" v-model="smsConfigOpen" width="600px" append-to-body>
      <el-form :model="smsConfigForm" label-width="140px">
        <el-form-item label="用户账号">
          <el-input v-model="smsConfigForm.userName" disabled />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="smsConfigForm.nickName" disabled />
        </el-form-item>
        <el-divider />
        <el-form-item label="拨打前短信">
          <el-radio-group v-model="smsConfigForm.preCallEnabled">
            <el-radio label="Y">开启</el-radio>
            <el-radio label="N">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="拨打前短信模板" v-if="smsConfigForm.preCallEnabled === 'Y'">
          <el-select v-model="smsConfigForm.preCallTemplateId" placeholder="请选择模板" clearable style="width: 100%">
            <el-option v-for="template in smsTemplateList" :key="template.templateId" :label="`${template.templateId} - ${template.title}`" :value="template.templateId"></el-option>
          </el-select>
        </el-form-item>
        <el-divider />
        <el-form-item label="拨打后短信">
          <el-radio-group v-model="smsConfigForm.postCallEnabled">
            <el-radio label="Y">开启</el-radio>
            <el-radio label="N">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="拨打后短信模板" v-if="smsConfigForm.postCallEnabled === 'Y'">
          <el-select v-model="smsConfigForm.postCallTemplateId" placeholder="请选择模板" clearable style="width: 100%">
            <el-option v-for="template in smsTemplateList" :key="template.templateId" :label="`${template.templateId} - ${template.title}`" :value="template.templateId"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitSmsConfig">确 定</el-button>
          <el-button @click="smsConfigOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers" :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading" :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth"
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect, getCompanyList as fetchCompanyList, getCompanyUserList as fetchCompanyUserList, getSubAdminList as fetchSubAdminList } from "@/api/system/user"
import { getSms106ConfigByUserId, saveSms106Config } from "@/api/system/sms106Config"
import { listSmsTemplate } from "@/api/system/smsTemplate"
import { Splitpanes, Pane } from "splitpanes"
import "splitpanes/dist/splitpanes.css"

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex")

const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const deptName = ref("")
const deptOptions = ref(undefined)
const enabledDeptOptions = ref(undefined)
const initPassword = ref(undefined)
const roleOptions = ref([])
const companyList = ref([])
const subAdminList = ref([])
const parentUserList = ref([])
const parentUserListForFilter = ref([])
const currentUserRoleId = ref(null) // 当前用户的角色ID
const smsConfigOpen = ref(false)
const smsConfigForm = ref({})
const smsTemplateList = ref([])

/** 判断当前用户是否是超级管理员 */
const isAdmin = computed(() => {
  return userStore.roles && userStore.roles.includes('admin')
})

/** 判断是否可以配置106短信（超级管理员、子管理员、公司管理员） */
const canConfigSms = computed(() => {
  return isAdmin.value || currentUserRoleId.value === 103 || currentUserRoleId.value === 102
})

/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
})
// 列显隐信息
const columns = ref([
  { key: 0, label: `用户编号`, visible: true },
  { key: 1, label: `账号`, visible: true },
  { key: 2, label: `用户昵称`, visible: true },
  { key: 3, label: `角色`, visible: true },
  { key: 4, label: `手机号码`, visible: true },
  { key: 5, label: `状态`, visible: true },
  { key: 6, label: `上级`, visible: true },
  { key: 7, label: `106短信`, visible: canConfigSms },
  { key: 8, label: `备注`, visible: true },
  { key: 9, label: `创建时间`, visible: true }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    nickName: undefined,
    phonenumber: undefined,
    status: undefined,
    roleId: undefined,
    subAdminUserId: undefined,
    companyUserId: undefined,
    parentUserId: undefined,
    remark: undefined,
    deptId: undefined
  },
  rules: {
    roleIds: [{ required: true, message: "角色不能为空", trigger: "change" }],
    userName: [{ required: true, message: "账号不能为空", trigger: "blur" }, { min: 2, max: 20, message: "账号长度必须介于 2 和 20 之间", trigger: "blur" }],
    nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
    password: [{ required: true, message: "用户密码不能为空", trigger: "blur" }, { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" }, { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }],
    email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
    // parentUserId 为可选字段
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 判断是否是公司管理员角色（需要设置使用人数和到期时间） */
const isCompanyManagerRole = computed(() => {
  return form.value.roleIds === 102
})

/** 判断是否需要设置使用人数限制（公司管理员和子管理员） */
const needMaxUserCount = computed(() => {
  return form.value.roleIds === 102 || form.value.roleIds === 103
})

/** 判断当前编辑的用户是否是自己 */
const isEditingSelf = computed(() => {
  return form.value.userId && form.value.userId === userStore.id
})

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}

/** 根据名称筛选部门树 */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val)
})

/** 查询用户列表 */
function getList() {
  loading.value = true
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false
    userList.value = res.rows
    total.value = res.total
  })
}

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data
    enabledDeptOptions.value = filterDisabledDept(JSON.parse(JSON.stringify(response.data)))
  })
}

/** 过滤禁用的部门 */
function filterDisabledDept(deptList) {
  return deptList.filter(dept => {
    if (dept.disabled) {
      return false
    }
    if (dept.children && dept.children.length) {
      dept.children = filterDisabledDept(dept.children)
    }
    return true
  })
}

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id
  handleQuery()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  queryParams.value.deptId = undefined
  proxy.$refs.deptTreeRef.setCurrentKey(null)
  handleQuery()
}

/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value
  proxy.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？').then(function () {
    return delUser(userIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  },`user_${new Date().getTime()}.xlsx`)
}

/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用"
  proxy.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗?').then(function () {
    return changeUserStatus(row.userId, row.status)
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功")
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0"
  })
}

/** 106短信开关修改 */
function handleSmsEnableChange(row) {
  let text = row.smsEnable === "Y" ? "开启" : "关闭"
  proxy.$modal.confirm('确认要"' + text + '""' + row.userName + '"的106短信吗?').then(function () {
    // 先获取完整的用户信息，然后更新 smsEnable 字段
    return getUser(row.userId).then(response => {
      const userData = response.data
      userData.smsEnable = row.smsEnable
      return updateUser(userData)
    })
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功")
  }).catch(function () {
    row.smsEnable = row.smsEnable === "Y" ? "N" : "Y"
  })
}

/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row)
      break
    case "handleAuthRole":
      handleAuthRole(row)
      break
    default:
      break
  }
}

/** 跳转角色分配 */
function handleAuthRole(row) {
  const userId = row.userId
  router.push("/system/user-auth/role/" + userId)
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
    inputValidator: (value) => {
      if (/<|>|"|'|\||\\/.test(value)) {
        return "不能包含非法字符：< > \" ' \\\ |"
      }
    },
  }).then(({ value }) => {
    resetUserPwd(row.userId, value).then(response => {
      proxy.$modal.msgSuccess("修改成功，新密码是：" + value)
    })
  }).catch(() => {})
}

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入"
  upload.open = true
}

/** 下载模板操作 */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`)
}

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true
}

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false
  upload.isUploading = false
  proxy.$refs["uploadRef"].handleRemove(file)
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true })
  getList()
}

/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit()
}

/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    roleIds: undefined,
    companyUserId: undefined,
    parentUserId: undefined,
    maxUserCount: undefined,
    expiryDate: undefined,
    smsEnable: "N"
  }
  proxy.resetForm("userRef")
}

/** 106短信配置 */
function handleSmsConfig(row) {
  // 加载短信模板列表
  listSmsTemplate({ isEnabled: 'Y' }).then(res => {
    smsTemplateList.value = res.rows || res.data || []
  })
  
  // 先获取用户的配置
  getSms106ConfigByUserId(row.userId).then(response => {
    if (response.data) {
      smsConfigForm.value = {
        userId: row.userId,
        userName: row.userName,
        nickName: row.nickName,
        preCallEnabled: response.data.preCallEnabled || "N",
        preCallTemplateId: response.data.preCallTemplateId,
        postCallEnabled: response.data.postCallEnabled || "N",
        postCallTemplateId: response.data.postCallTemplateId,
        id: response.data.id
      }
    } else {
      smsConfigForm.value = {
        userId: row.userId,
        userName: row.userName,
        nickName: row.nickName,
        preCallEnabled: "N",
        preCallTemplateId: null,
        postCallEnabled: "N",
        postCallTemplateId: null
      }
    }
    smsConfigOpen.value = true
  }).catch(() => {
    // 如果没有配置，创建空配置
    smsConfigForm.value = {
      userId: row.userId,
      userName: row.userName,
      nickName: row.nickName,
      preCallEnabled: "N",
      preCallTemplateId: null,
      postCallEnabled: "N",
      postCallTemplateId: null
    }
    smsConfigOpen.value = true
  })
}

/** 提交106短信配置 */
function submitSmsConfig() {
  saveSms106Config(smsConfigForm.value).then(response => {
    proxy.$modal.msgSuccess("配置成功")
    smsConfigOpen.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 获取公司列表 */
function getCompanyList() {
  fetchCompanyList().then(response => {
    companyList.value = response.data
  })
}

/** 获取子管理员列表（仅超级管理员可用） */
function getSubAdminList() {
  if (isAdmin.value) {
    fetchSubAdminList().then(response => {
      subAdminList.value = response.data
    }).catch(() => {
      subAdminList.value = []
    })
  }
}

/** 获取上级用户列表供筛选使用 */
function getParentUserListForFilter() {
  // 获取所有公司管理员和部长用户作为筛选选项
  // 注意：业务员不能作为上级，所以不包含在列表中
  listUser({ roleId: 102, pageSize: 1000 }).then(response => {
    const companyManagerList = response.rows || []
    listUser({ roleId: 101, pageSize: 1000 }).then(response => {
      const ministerList = response.rows || []
      parentUserListForFilter.value = [...companyManagerList, ...ministerList]
    })
  })
}

/** 根据当前用户角色和选择的角色动态获取上级用户列表 */
function getParentUserList(selectedRoleId) {
  parentUserList.value = []
  
  if (!selectedRoleId) {
    return
  }
  
  // 获取当前登录用户信息
  const currentUserId = userStore.id  // 注意：userStore中用户ID的属性名是 id
  const currentUserName = userStore.nickName || userStore.name
  const isCurrentAdmin = isAdmin.value // 超级管理员
  
  // 构建需要查询的角色列表
  let roleIdsToQuery = []
  let includeCurrentUser = false
  let currentUserRoleName = ''
  
  // 超级管理员（admin）
  if (isCurrentAdmin) {
    includeCurrentUser = true
    currentUserRoleName = '超级管理员'
    
    // 新增子管理员：上级可以是超级管理员自己
    if (selectedRoleId === 103) {
      parentUserList.value = [{
        userId: currentUserId,
        nickName: currentUserName,
        roleName: '超级管理员'
      }]
      return
    }
    // 新增公司管理员：上级可以是超级管理员、子管理员
    else if (selectedRoleId === 102) {
      roleIdsToQuery = [103] // 子管理员
    }
    // 新增部长：上级可以是超级管理员、子管理员、公司管理员
    else if (selectedRoleId === 101) {
      roleIdsToQuery = [103, 102] // 子管理员、公司管理员
    }
    // 新增业务员：上级可以是超级管理员、子管理员、公司管理员、部长
    else if (selectedRoleId === 2) {
      roleIdsToQuery = [103, 102, 101] // 子管理员、公司管理员、部长
    }
  }
  // 如果是子管理员
  else if (currentUserRoleId.value === 103) {
    includeCurrentUser = true
    currentUserRoleName = '子管理员'
    
    // 新增公司管理员：上级可以是子管理员自己
    if (selectedRoleId === 102) {
      // 只显示当前子管理员自己
      parentUserList.value = [{
        userId: currentUserId,
        nickName: currentUserName,
        roleName: '子管理员'
      }]
      return
    }
    // 新增部长：上级可以是子管理员、公司管理员
    else if (selectedRoleId === 101) {
      roleIdsToQuery = [103, 102] // 子管理员、公司管理员
    }
    // 新增业务员：上级可以是子管理员、公司管理员、部长
    else if (selectedRoleId === 2) {
      roleIdsToQuery = [103, 102, 101] // 子管理员、公司管理员、部长
    }
  }
  // 如果是公司管理员
  else if (currentUserRoleId.value === 102) {
    includeCurrentUser = true
    currentUserRoleName = '公司管理员'
    
    // 新增部长：上级可以是公司管理员自己
    if (selectedRoleId === 101) {
      // 只显示当前公司管理员自己
      parentUserList.value = [{
        userId: currentUserId,
        nickName: currentUserName,
        roleName: '公司管理员'
      }]
      return
    }
    // 新增业务员：上级可以是公司管理员自己、部长
    else if (selectedRoleId === 2) {
      // 查询当前公司下的所有部长
      listUser({ roleId: 101, companyUserId: currentUserId, pageSize: 1000 }).then(response => {
        const ministerList = response.rows || []
        // 将公司管理员自己添加到列表开头
        parentUserList.value = [
          {
            userId: currentUserId,
            nickName: currentUserName,
            roleName: '公司管理员'
          },
          ...ministerList
        ]
      })
      return
    }
  }
  // 如果是部长
  else if (currentUserRoleId.value === 101) {
    // 新增业务员：上级只能是部长自己
    if (selectedRoleId === 2) {
      parentUserList.value = [{
        userId: currentUserId,
        nickName: currentUserName,
        roleName: '部长'
      }]
      return
    }
  }
  
  // 查询用户列表
  if (roleIdsToQuery.length > 0) {
    const promises = roleIdsToQuery.map(roleId => {
      return listUser({ roleId: roleId, pageSize: 1000 }).then(response => response.rows || [])
    })
    
    Promise.all(promises).then(results => {
      // 合并所有结果
      let allUsers = []
      results.forEach(users => {
        allUsers = allUsers.concat(users)
      })
      
      // 过滤掉非当前用户的超级管理员（roleId=1）和所有业务员（roleId=2）
      // 业务员不能作为任何人的上级
      allUsers = allUsers.filter(user => {
        // 检查用户的角色
        let isSuperAdmin = false
        let isSalesman = false
        
        if (user.roles && user.roles.length > 0) {
          isSuperAdmin = user.roles[0].roleId === 1
          isSalesman = user.roles[0].roleId === 2
        } else if (user.roleName === '超级管理员' || user.roleName === 'admin') {
          isSuperAdmin = true
        } else if (user.roleName === '业务员') {
          isSalesman = true
        }
        
        // 业务员永远不能作为上级
        if (isSalesman) {
          return false
        }
        
        // 如果是超级管理员，只保留当前登录用户本人
        if (isSuperAdmin) {
          return user.userId === currentUserId
        }
        return true
      })
      
      // 对于子管理员，需要过滤出可选的用户
      if (!isCurrentAdmin && currentUserRoleId.value === 103) {
        // 如果是新增公司管理员、部长或业务员，需要根据数据权限过滤
        if (selectedRoleId === 101 || selectedRoleId === 2) {
          // 过滤出当前用户管理范围内的用户
          allUsers = allUsers.filter(user => user.subAdminUserId === currentUserId || user.userId === currentUserId)
        }
      }
      
      // 如果需要包含当前用户，添加到列表开头
      if (includeCurrentUser) {
        const currentUser = {
          userId: currentUserId,
          nickName: currentUserName,
          roleName: currentUserRoleName
        }
        // 检查当前用户是否已在列表中
        const existsInList = allUsers.some(user => user.userId === currentUserId)
        if (!existsInList) {
          allUsers.unshift(currentUser)
        }
      }
      if(allUsers[0]&&allUsers[0].roleName=='超级管理员'){
        allUsers[0].userId=1
      }
      parentUserList.value = allUsers
    })
  }
}

/** 角色改变时的处理 */
function handleRoleChange(roleId) {
  // 清空上级选择
  form.value.parentUserId = undefined
  parentUserList.value = []
  
  // 根据选择的角色加载对应的上级用户列表
  getParentUserList(roleId)
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  
  // 确保当前用户角色ID已加载
  if (!currentUserRoleId.value && userStore.id) {
    getUser(userStore.id).then(response => {
      if (response.data && response.data.roles && response.data.roles.length > 0) {
        currentUserRoleId.value = response.data.roles[0].roleId
      }
    })
  }
  
  getUser().then(response => {
    roleOptions.value = response.roles
    open.value = true
    title.value = "添加用户"
    form.value.password = initPassword.value
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const userId = row.userId || ids.value
  getUser(userId).then(response => {
    form.value = response.data
    roleOptions.value = response.roles
    // 将数组转换为单个值（取第一个角色）
    form.value.roleIds = response.roleIds && response.roleIds.length > 0 ? response.roleIds[0] : undefined
    open.value = true
    title.value = "修改用户"
    form.password = ""
    
    // 保存当前的parentUserId和parentUserName
    const currentParentUserId = form.value.parentUserId
    const currentParentUserName = form.value.parentUserName
      
    // 根据角色加载上级用户列表
    if (form.value.roleIds) {
      getParentUserList(form.value.roleIds)
      
      // 如果当前有上级用户，且上级不在列表中，需要添加进去
      // 使用 setTimeout 延迟执行，确保异步加载完成
      setTimeout(() => {
        if (currentParentUserId && currentParentUserName) {
          // 使用宽松相等比较，因为可能存在类型不一致的问题
          const exists = parentUserList.value.some(user => user.userId == currentParentUserId)
          if (!exists) {
            // 如果上级是超级管理员（userId=1）或其他不在列表中的用户，添加到列表
            // 确保userId类型一致（保持为数字类型）
            const userIdNum = Number(currentParentUserId)
            parentUserList.value.unshift({
              userId: userIdNum,
              nickName: currentParentUserName,
              roleName: userIdNum === 1 ? '超级管理员' : form.value.parentUserRoleName || '未知'
            })
          }
          // 确保form.parentUserId是数字类型
          form.value.parentUserId = Number(currentParentUserId)
        }
      }, 300)
    }
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      // 将单个角色ID转换为数组格式发送给后端
      const submitData = {
        ...form.value,
        roleIds: form.value.roleIds ? [form.value.roleIds] : []
      }
      
      if (form.value.userId != undefined) {
        updateUser(submitData).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addUser(submitData).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 获取当前用户的角色ID */
function getCurrentUserRoleId() {
  // 如果当前用户ID不存在，延迟一次重试
  if (!userStore.id) {
    setTimeout(() => {
      if (userStore.id) {
        getUser(userStore.id).then(response => {
          if (response.data && response.data.roles && response.data.roles.length > 0) {
            currentUserRoleId.value = response.data.roles[0].roleId
          }
        })
      }
    }, 500)
    return
  }
  
  // 通过API获取当前用户信息
  getUser(userStore.id).then(response => {
    if (response.data && response.data.roles && response.data.roles.length > 0) {
      currentUserRoleId.value = response.data.roles[0].roleId
    }
  })
}

onMounted(() => {
  getDeptTree()
  getList()
  proxy.getConfigKey("sys.user.initPassword").then(response => {
    initPassword.value = response.msg
  })
  // 获取角色列表供查询使用
  getUser().then(response => {
    roleOptions.value = response.roles
  })
  // 获取公司列表供查询使用
  getCompanyList()
  // 获取子管理员列表供查询使用（仅超级管理员）
  getSubAdminList()
  // 获取上级用户列表供筛选使用
  getParentUserListForFilter()
  // 获取当前用户的角色ID
  getCurrentUserRoleId()
})
</script>

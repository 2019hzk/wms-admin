<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="24">
            <el-form-item label="用户名">
              <el-input style="width: 100%" v-model="searchObj.username" placeholder="用户名"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="fetchData()">查询</el-button>
        <el-button type="default" size="mini" @click="resetData()">清空</el-button>
      </el-form>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="add" >添 加</el-button>
    </el-card>

    <!-- banner列表 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column
        label="序号"
        width="70"
        align="center">
        <template slot-scope="scope">
          {{ (page - 1) * limit + scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="username" label="用户名" width="110"/>
      <el-table-column prop="name" label="姓名" width="110"/>
      <el-table-column prop="phone" label="手机" width="140"/>
      <el-table-column prop="roleName" label="所属角色" width="180"/>
      <el-table-column prop="warehouseName" label="分配仓库" width="130"/>
      <el-table-column prop="createName" label="创建人" />
      <el-table-column prop="createTime" label="创建时间" width="160"/>

      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="edit(scope.row.id)">修改</el-button>
          <el-button type="text" size="mini" @click="removeDataById(scope.row.id)" :disabled="$hasBP('btn.User.remove')  === false">删除</el-button>
          <el-button type="text" size="mini" @click="showAssignRole(scope.row)" :disabled="$hasBP('btn.User.assgin')  === false">分配角色</el-button>
          <el-button type="text" size="mini" @click="showAssignWarehouse(scope.row)" :disabled="$hasBP('btn.User.assginWarehouse')  === false">分配仓库</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="page"
      :total="total"
      :page-size="limit"
      :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
      style="padding: 30px 0; text-align: center;"
      layout="sizes, prev, pager, next, jumper, ->, total, slot"
      @current-change="fetchData"
      @size-change="changeSize"
    />

    <el-dialog title="添加/修改" :visible.sync="dialogVisible" width="40%" >
      <el-form ref="dataForm" :model="admin" :rules="validateRules"  label-width="150px" size="small" style="padding-right: 40px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="admin.username"/>
        </el-form-item>
        <el-form-item v-if="!admin.id" label="密码" prop="password">
          <el-input v-model="admin.password" type="password"/>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="admin.name"/>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="admin.phone"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small" :disabled="$hasBP('btn.User.add')  === false || $hasBP('btn.User.update')  === false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分配角色" :visible.sync="dialogRoleVisible">
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input disabled :value="admin.username"></el-input>
        </el-form-item>

        <el-form-item label="角色列表">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="userRoleIds" @change="handleCheckedChange">
            <el-checkbox v-for="role in allRoles" :key="role.id" :label="role.id">{{role.roleName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="assignRole" size="small">保存</el-button>
        <el-button @click="dialogRoleVisible = false" size="small">取消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="分配仓库" :visible.sync="dialogWarehouseVisible">
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input disabled :value="admin.username"></el-input>
        </el-form-item>
        <el-form-item label="仓库">
          <el-select
            v-model="admin.warehouseId"
            placeholder="请选择仓库"
            style="width: 50%;">
            <el-option
              v-for="item in warehouseInfoList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button :loading="loading" type="primary" @click="doAssignWarehouse" size="small">保存</el-button>
        <el-button @click="dialogWarehouseVisible = false" size="small">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/acl/admin'
import warehouseInfoApi from '@/api/base/warehouseInfo'
const defaultForm = {
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  wareId: ''
}
export default {
  data() {
    return {
      listLoading: true, // 数据是否正在加载
      list: null, // banner列表
      total: 0, // 数据库中的总记录数
      page: 1, // 默认页码
      limit: 10, // 每页记录数
      searchObj: {}, // 查询表单对象

      dialogVisible: false,
      admin: defaultForm,
      saveBtnDisabled: false,
      validateRules: {
        username: [{ required: true, trigger: 'blur', message: '必须输入' }],
        password: [{ required: true, trigger: 'blur', message: '必须输入' }],
        name: [{ required: true, trigger: 'blur', message: '必须输入' }],
        phone: [{ required: true, trigger: 'blur', message: '必须输入' }]
      },

      dialogRoleVisible: false,
      allRoles: [], // 所有角色列表
      userRoleIds: [], // 用户的角色ID的列表
      isIndeterminate: false, // 是否是不确定的
      checkAll: false, // 是否全选

      dialogWarehouseVisible: false,
      warehouseInfoList: []
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()

    warehouseInfoApi.findAll().then(response => {
      this.warehouseInfoList = response.data
    })
  },

  // 生命周期函数：内存准备完毕，页面渲染成功
  mounted() {
    console.log('list mounted......')
  },

  methods: {

    // 当页码发生改变的时候
    changeSize(size) {
      console.log(size)
      this.limit = size
      this.fetchData(1)
    },

    // 加载banner列表数据
    fetchData(page = 1) {
      console.log('翻页。。。' + page)
      // 异步获取远程数据（ajax）
      this.page = page

      api.getPageList(this.page, this.limit, this.searchObj).then(
        response => {
          this.list = response.data.records
          this.total = response.data.total

          // 数据加载并绑定成功
          this.listLoading = false
        }
      )
    },

    // 重置查询表单
    resetData() {
      console.log('重置查询表单')
      this.searchObj = {}
      this.fetchData()
    },

    // 根据id删除数据
    removeDataById(id) {
      // debugger
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => { // promise
        // 点击确定，远程调用ajax
        return api.removeById(id)
      }).then((response) => {
        this.fetchData(this.page)
        if (response.code) {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // -------------
    add(){
      this.dialogVisible = true
      this.admin = Object.assign({}, defaultForm)
    },

    edit(id) {
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    fetchDataById(id) {
      api.getById(id).then(response => {
        this.admin = response.data
      })
    },

    saveOrUpdate() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.saveBtnDisabled = true // 防止表单重复提交
          if (!this.admin.id) {
            this.saveData()
          } else {
            this.updateData()
          }
        }
      })
    },

    // 新增
    saveData() {
      api.save(this.admin).then(response => {
        if (response.code) {
          this.$message({
            type: 'success',
            message: response.message
          })
          this.dialogVisible = false
          this.fetchData(this.page)
        }
      })
    },

    // 根据id更新记录
    updateData() {
      api.updateById(this.admin).then(response => {
        if (response.code) {
          this.$message({
            type: 'success',
            message: response.message
          })
          this.dialogVisible = false
          this.fetchData(this.page)
        }
      })
    },

    //------
    showAssignRole (row) {
      this.admin = row
      this.dialogRoleVisible = true
      this.getRoles()
    },

    getRoles () {
      api.getRoles(this.admin.id).then(response => {
        const {allRolesList, assignRoles} = response.data
        this.allRoles = allRolesList
        this.userRoleIds = assignRoles.map(item => item.id)
        this.checkAll = allRolesList.length===assignRoles.length
        this.isIndeterminate = assignRoles.length>0 && assignRoles.length<allRolesList.length
      })
    },

    /*
    全选勾选状态发生改变的监听
    */
    handleCheckAllChange (value) {// value 当前勾选状态true/false
      // 如果当前全选, userRoleIds就是所有角色id的数组, 否则是空数组
      this.userRoleIds = value ? this.allRoles.map(item => item.id) : []
      // 如果当前不是全选也不全不选时, 指定为false
      this.isIndeterminate = false
    },

    /*
    角色列表选中项发生改变的监听
    */
    handleCheckedChange (value) {
      const {userRoleIds, allRoles} = this
      this.checkAll = userRoleIds.length === allRoles.length && allRoles.length>0
      this.isIndeterminate = userRoleIds.length>0 && userRoleIds.length<allRoles.length
    },

    assignRole () {
      const userId = this.admin.id
      const roleIds = this.userRoleIds.join(',')
      api.assignRoles(userId, roleIds).then(response => {
        this.$message.success(response.message || '分配角色成功')
        this.dialogRoleVisible = false
        this.fetchData(this.page)
      })
    },

    //------
    showAssignWarehouse(row) {
      this.admin = row
      this.dialogWarehouseVisible = true
    },

    doAssignWarehouse () {
      const adminId = this.admin.id
      const warehouseId = this.admin.warehouseId
      api.doAssignWarehouse(adminId, warehouseId).then(response => {
        this.$message.success(response.message || '分配成功')
        this.dialogWarehouseVisible = false
        this.fetchData(this.page)
      })
    },
  }
}
</script>


<template>
  <div class="app-container">

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="add">添 加</el-button>
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

      <el-table-column prop="name" label="名称" width="130"/>
      <el-table-column prop="type" label="仓库类型" width="120">
        <template slot-scope="scope">
          {{ scope.row.type == 1 ? '中心仓库' : '区域仓库' }}
        </template>
      </el-table-column>
      <el-table-column prop="address" label="仓库地址" width="180">
        <template slot-scope="scope">
          {{ scope.row.provinceName }}{{ scope.row.cityName }}{{ scope.row.areaName }}
        </template>
      </el-table-column>
      <el-table-column prop="builtArea" label="面积(平方米)" width="120"/>
      <el-table-column prop="manageName" label="管理人" />
      <el-table-column prop="managePhone" label="管理手机" width="140"/>
      <el-table-column prop="storeareaCount" label="库区个数" />
      <el-table-column prop="storeshelfCount" label="货架个数" />
      <el-table-column prop="storehouseCount" label="库位个数" />
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          {{ scope.row.status == 1 ? '启用' : '停用' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="edit(scope.row.id)">修改</el-button>
          <el-button type="text" size="mini" @click="removeDataById(scope.row.id)" :disabled="$hasBP('btn.warehouseInfo.remove')  === false">删除</el-button>
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

    <el-dialog title="添加/修改" :visible.sync="dialogVisible" width="80%" >
      <el-form ref="dataForm" :model="warehouseInfo" :rules="validateRules" label-width="150px" size="small" style="padding-right: 40px;">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="warehouseInfo.name"/>
            </el-form-item>

            <el-form-item label="请选择省市区" prop="areaId">
              <el-select
                v-model="warehouseInfo.provinceId"
                placeholder="请选择省"
                @change="provinceChanged" style="width: 32%;margin-right: 5px;">
                <el-option
                  v-for="item in provinceList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
              <el-select
                v-model="warehouseInfo.cityId"
                placeholder="请选择市"
                @change="cityChanged" style="width: 32%;margin-right: 5px;">
                <el-option
                  v-for="item in cityList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
              <el-select
                v-model="warehouseInfo.areaId"
                placeholder="请选择区" style="width: 32%;">
                <el-option
                  v-for="item in areaList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="面积(平方米)">
              <el-input v-model="warehouseInfo.builtArea"/>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="warehouseInfo.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓库类型">
              <el-radio-group v-model="warehouseInfo.type">
                <el-radio :label="1">中心仓库</el-radio>
                <el-radio :label="2">区域仓库</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="详细地址">
              <el-input v-model="warehouseInfo.address"/>
            </el-form-item>
            <el-form-item label="管理人" prop="manageId">
              <el-autocomplete
                v-model="warehouseInfo.manageName"
                :fetch-suggestions="querySearch"
                :trigger-on-focus="false"
                @select="handleSelect"
                class="inline-input"
                placeholder="管理人名称"
                value-key="name"
                style="width: 100%;"
              />
              <span class="el-input__suffix">
                <span class="el-input__suffix-inner"><i class="el-input__icon el-icon-search"></i></span>
              </span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small" :disabled="$hasBP('btn.warehouseInfo.add')  === false || $hasBP('btn.warehouseInfo.update')  === false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/base/warehouseInfo'
import dictApi from '@/api/base/dict'
const defaultForm = {
  id: '',
  name: '',
  type: 1,
  provinceId: '',
  cityId: '',
  areaId: '',
  address: '',
  builtArea: '',
  manageId: '',
  manageName: '',
  managePhone: '',
  status: 1
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
      warehouseInfo: defaultForm,
      saveBtnDisabled: false,
      validateRules: {
        name: [{ required: true, trigger: 'blur', message: '必须输入' }],
        areaId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        manageId: [{ required: true, trigger: 'blur', message: '必须选择' }],
      },

      provinceList: [],
      cityList: [],
      areaList: []
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()

    dictApi.findByDictCode('Province').then(response => {
      this.provinceList = response.data
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
      this.warehouseInfo = Object.assign({}, defaultForm)
    },

    edit(id) {
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    fetchDataById(id) {
      api.getById(id).then(response => {
        this.warehouseInfo = response.data
      })
    },

    saveOrUpdate() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.saveBtnDisabled = true // 防止表单重复提交
          if (!this.warehouseInfo.id) {
            this.saveData()
          } else {
            this.updateData()
          }
        }
      })
    },

    // 新增
    saveData() {
      api.save(this.warehouseInfo).then(response => {
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
      api.updateById(this.warehouseInfo).then(response => {
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

    // 根据id查询记录
    fetchDataById(id) {
      api.getById(id).then(response => {
        this.warehouseInfo = response.data
      })
    },

    provinceChanged() {
      debugger
      this.cityList = []
      this.warehouseInfo.cityId = null
      this.areaList = []
      this.warehouseInfo.areaId = null
      dictApi.findByParentId(this.warehouseInfo.provinceId).then(response => {
        this.cityList = response.data
      })
    },

    cityChanged() {
      this.areaList = []
      this.warehouseInfo.areaId = null
      dictApi.findByParentId(this.warehouseInfo.cityId).then(response => {
        this.areaList = response.data
      })
    },

    querySearch(queryString, cb) {
      debugger
      console.log(queryString)
      console.log(cb)

      this.$API.user.findByKeyword(queryString).then(response => {
        // 调用 callback 返回建议列表的数据
        cb(response.data)
      })
    },
    handleSelect(item) {
      debugger
      this.warehouseInfo.manageId = item.id
      this.warehouseInfo.manageName = item.name
      this.warehouseInfo.managePhone = item.phone
    }
  }
}
</script>


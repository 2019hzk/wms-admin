<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="关键字">
              <el-input type="text" placeholder="姓名/手机号码" v-model="searchObj.keyword" style="width: 90%;"/>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="地址">
              <el-select
                v-model="searchObj.provinceId"
                placeholder="请选择省"
                @change="provinceSearchChanged"
                style="margin-right: 5px;">
                <el-option
                  v-for="item in provinceList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
              <el-select
                v-model="searchObj.cityId"
                placeholder="请选择市"
                @change="citySearchChanged"
                style="margin-right: 5px;">
                <el-option
                  v-for="item in cityList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
              <el-select
                v-model="searchObj.areaId"
                placeholder="请选择区">
                <el-option
                  v-for="item in areaList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="fetchData()">查询</el-button>
        <el-button type="default" size="mini" @click="resetData">清空</el-button>
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
        type="selection"
        width="55" />

      <el-table-column
        label="序号"
        width="70"
        align="center">
        <template slot-scope="scope">
          {{ (page - 1) * limit + scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="name" label="名称" />
      <el-table-column prop="phone" label="手机号码" width="150"/>
      <el-table-column prop="provinceName" label="省" />
      <el-table-column prop="cityName" label="市" />
      <el-table-column prop="areaName" label="区" />
      <el-table-column prop="address" label="详细地址" width="200" />

      <el-table-column label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="edit(scope.row.id)">修改</el-button>
          <el-button type="text" size="mini" @click="removeDataById(scope.row.id)" :disabled="$hasBP('btn.shipperInfo.remove')  === false">删除</el-button>
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
      <el-form ref="flashPromotionForm" label-width="150px" size="small" style="padding-right: 40px;">
        <el-form-item label="名称">
          <el-input v-model="shipperInfo.name"/>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="shipperInfo.phone"/>
        </el-form-item>

        <el-form-item label="省">
          <el-select
            v-model="shipperInfo.provinceId"
            placeholder="请选择省"
            @change="provinceChanged">
            <el-option
              v-for="item in provinceList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="市">
          <el-select
            v-model="shipperInfo.cityId"
            placeholder="请选择市"
            @change="cityChanged">
            <el-option
              v-for="item in cityList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="区">
          <el-select
            v-model="shipperInfo.areaId"
            placeholder="请选择区">
            <el-option
              v-for="item in areaList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="详细地址">
          <el-input v-model="shipperInfo.address"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="shipperInfo.remark"/>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small" :disabled="$hasBP('btn.shipperInfo.add')  === false || $hasBP('btn.shipperInfo.update')  === false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/base/shipperInfo'
import dictApi from '@/api/base/dict'
const defaultForm = {
  id: '',
  name: '',
  phone: '',
  provinceId: '',
  cityId: '',
  areaId: '',
  address: '',
  remark: '',
  status: '1'
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
     shipperInfo: defaultForm,
     saveBtnDisabled: false,

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
      this.shipperInfo = Object.assign({}, defaultForm)
    },

    edit(id) {
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    fetchDataById(id) {
      api.getById(id).then(response => {
        this.shipperInfo = response.data
      })
    },

    saveOrUpdate() {
      this.saveBtnDisabled = true // 防止表单重复提交
      if (!this.shipperInfo.id) {
        this.saveData()
      } else {
        this.updateData()
      }
    },

    // 新增
    saveData() {
      api.save(this.shipperInfo).then(response => {
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
      api.updateById(this.shipperInfo).then(response => {
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
        this.shipperInfo = response.data
      })
    },

    provinceChanged() {
      debugger
      this.cityList = []
      this.shipperInfo.cityId = null
      this.areaList = []
      this.shipperInfo.areaId = null
      dictApi.findByParentId(this.shipperInfo.provinceId).then(response => {
        this.cityList = response.data
      })
    },

    cityChanged() {
      this.areaList = []
      this.shipperInfo.areaId = null
      dictApi.findByParentId(this.shipperInfo.cityId).then(response => {
        this.areaList = response.data
      })
    },

    provinceSearchChanged() {
      debugger
      this.cityList = []
      this.searchObj.cityId = null
      this.areaList = []
      this.searchObj.areaId = null
      dictApi.findByParentId(this.searchObj.provinceId).then(response => {
        this.cityList = response.data
      })
    },

    citySearchChanged() {
      this.areaList = []
      this.searchObj.areaId = null
      dictApi.findByParentId(this.searchObj.cityId).then(response => {
        this.areaList = response.data
      })
    }
  }
}
</script>


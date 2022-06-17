<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="24">
            <el-form-item label="指定仓库">
              <el-select
                v-model="searchObj.warehouseId"
                placeholder="请选择仓库"
                @change="warehouseSearchChanged" style="width: 49%;margin-right: 5px;">
                <el-option
                  v-for="item in warehouseInfoList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
              <el-select
                v-model="searchObj.storeareaId"
                placeholder="请选择库区" style="width: 50%;">
                <el-option
                  v-for="item in storeareaInfoList"
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

      <el-table-column prop="warehouseName" label="仓库" width="130"/>
      <el-table-column prop="storeareaName" label="库区" width="120"/>
      <el-table-column prop="name" label="名称" width="120"/>
      <el-table-column prop="houseTypeName" label="货架类型" width="130"/>
      <el-table-column prop="builtArea" label="面积(平方米)" width="120"/>
      <el-table-column prop="temperatureTypeName" label="温度类型" width="130"/>
      <el-table-column prop="manageName" label="管理人" />
      <el-table-column prop="managePhone" label="管理手机" width="130"/>
      <el-table-column prop="storehouseCount" label="库位个数" />
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          {{ scope.row.status == 1 ? '启用' : '停用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="edit(scope.row.id)">修改</el-button>
          <el-button type="text" size="mini" @click="removeDataById(scope.row.id)" :disabled="$hasBP('btn.storeshelfInfo.remove')  === false">删除</el-button>
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
        <el-form-item label="仓库">
          <el-select
            v-model="storeshelfInfo.warehouseId"
            placeholder="请选择仓库"
            @change="warehouseChanged"  style="width: 49%;margin-right: 5px;">
            <el-option
              v-for="item in warehouseInfoList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
          <el-select
            v-model="storeshelfInfo.storeareaId"
            placeholder="请选择库区" style="width: 49%;">
            <el-option
              v-for="item in storeareaInfoList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="storeshelfInfo.name"/>
        </el-form-item>
        <el-form-item label="货架类型">
          <el-select
            v-model="storeshelfInfo.houseTypeId"
            placeholder="请选择库区" style="width: 49%;">
            <el-option
              v-for="item in houseTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="面积(平方米)">
          <el-input v-model="storeshelfInfo.builtArea"/>
        </el-form-item>
        <el-form-item label="温度类型">
          <el-select
            v-model="storeshelfInfo.temperatureTypeId"
            placeholder="请选择库区" style="width: 49%;">
            <el-option
              v-for="item in temperatureTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="管理人">
          <el-autocomplete
            v-model="storeshelfInfo.manageName"
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
        <el-form-item label="状态">
          <el-radio-group v-model="storeshelfInfo.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small" :disabled="$hasBP('btn.storeshelfInfo.add')  === false || $hasBP('btn.storeshelfInfo.update')  === false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/base/storeshelfInfo'
import warehouseInfoApi from '@/api/base/warehouseInfo'
import storeareaInfoApi from '@/api/base/storeareaInfo'
import dictApi from '@/api/base/dict'
const defaultForm = {
  id: '',
  warehouseId: '',
  storeareaId: '',
  name: '',
  houseTypeId: '',
  builtArea: '',
  temperatureTypeId: '',
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
      searchObj: {
        warehouseId: null,
        storeareaId: null
      }, // 查询表单对象

      dialogVisible: false,
      storeshelfInfo: defaultForm,
      saveBtnDisabled: false,

      warehouseInfoList: [],
      storeareaInfoList: [],
      houseTypeList: [],
      temperatureType: []
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()

    warehouseInfoApi.findAll().then(response => {
      this.warehouseInfoList = response.data
    })

    dictApi.findByDictCode('HouseType').then(response => {
      this.houseTypeList = response.data
    })
    dictApi.findByDictCode('TemperatureType').then(response => {
      this.temperatureTypeList = response.data
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
      this.storeshelfInfo = Object.assign({}, defaultForm)
    },

    edit(id) {
      debugger
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    fetchDataById(id) {
      api.getById(id).then(response => {
        this.storeshelfInfo = response.data

        storeareaInfoApi.findByWarehouseId(this.storeshelfInfo.warehouseId).then(response => {
          this.storeareaInfoList = response.data
        })
      })
    },

    saveOrUpdate() {
      this.saveBtnDisabled = true // 防止表单重复提交
      if (!this.storeshelfInfo.id) {
        this.saveData()
      } else {
        this.updateData()
      }
    },

    // 新增
    saveData() {
      api.save(this.storeshelfInfo).then(response => {
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
      api.updateById(this.storeshelfInfo).then(response => {
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

    warehouseChanged() {
      debugger
      this.storeareaInfoList = []
      this.storeshelfInfo.storeareaId = null
      storeareaInfoApi.findByWarehouseId(this.storeshelfInfo.warehouseId).then(response => {
        this.storeareaInfoList = response.data
      })
    },

    warehouseSearchChanged() {
      this.storeareaInfoList = []
      this.searchObj.storeareaId = null
      storeareaInfoApi.findByWarehouseId(this.searchObj.warehouseId).then(response => {
        this.storeareaInfoList = response.data
      })
    },

    querySearch(queryString, cb) {
      console.log(queryString)
      console.log(cb)

      this.$API.user.findByKeyword(queryString).then(response => {
        // 调用 callback 返回建议列表的数据
        cb(response.data)
      })
    },
    handleSelect(item) {
      debugger
      this.storeshelfInfo.manageId = item.id
      this.storeshelfInfo.manageName = item.name
      this.storeshelfInfo.managePhone = item.phone
    }
  }
}
</script>


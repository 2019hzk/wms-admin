<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="相关单号">
              <el-input type="text" placeholder="入库单号/货主订单号" v-model="searchObj.no" style="width: 90%;"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预计到达">
              <el-date-picker
                v-model="estimatedArrivalTimes"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="margin-right: 10px;width: 90%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="指定仓库">
              <el-select
                v-model="searchObj.warehouseId"
                placeholder="请选择仓库"
                style="width: 90%;">
                <el-option
                  v-for="item in warehouseInfoList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8" >
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="createTimes"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="margin-right: 10px;width: 90%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-select
                v-model="searchObj.status"
                placeholder="请选择状态"
                style="width: 90%;">
                <el-option
                  v-for="item in statusList"
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

      <el-table-column prop="inOrderNo" label="入库单号" width="150px"/>
      <el-table-column prop="shipperOrderNo" label="货主订单号" width="150px"/>
      <el-table-column prop="shipperName" label="货主名称" width="100px"/>
      <el-table-column prop="estimatedArrivalTime" label="预计到达日" width="160px"/>
      <el-table-column prop="warehouseName" label="仓库" width="150px"/>
      <el-table-column prop="driver" label="司机" width="100px"/>
      <el-table-column prop="driverPhone" label="司机电话" width="130px"/>
      <el-table-column prop="expectCount" label="预期到货数量" width="150px"/>
      <el-table-column prop="statusName" label="状态" width="80px"/>
      <el-table-column prop="createTime" label="创建时间" width="160px"/>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status == 'CREATE' || scope.row.status == 'REJECT'" size="mini" @click="edit(scope.row.id)">修改</el-button>
          <el-button type="text" v-if="scope.row.status == 'CREATE' || scope.row.status == 'REJECT'" size="mini" @click="removeDataById(scope.row.id)" :disabled="$hasBP('btn.inOrder.remove')  === false">删除</el-button>
          <el-button type="text" v-if="scope.row.status == 'CREATE' || scope.row.status == 'REJECT'" size="mini" @click="submitApprove(scope.row.id)" :disabled="$hasBP('btn.inOrder.approve')  === false">提交审批</el-button>
          <router-link :to="'/inbound/inOrder/show/'+scope.row.id">
            <el-button type="text" size="mini">详情</el-button>
          </router-link>
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

    <el-dialog title="添加/修改" :visible.sync="dialogVisible" width="90%" >
      <div style="padding-bottom: 10px;">基本信息</div>
      <el-card class="operate-container" shadow="never">
        <el-form ref="dataForm" :model="inOrder" :rules="validateRules" label-width="120px" size="small" style="padding-right: 40px;">
          <el-row>
            <el-col :span="12">
              <el-form-item label="货主名称" prop="shipperId">
                <el-autocomplete
                  v-model="inOrder.shipperName"
                  :fetch-suggestions="querySearch"
                  :trigger-on-focus="false"
                  @select="handleSelect"
                  class="inline-input"
                  placeholder="搜索货主名称"
                  value-key="name"
                  style="width: 100%;"
                />
                <span class="el-input__suffix">
                  <span class="el-input__suffix-inner"><i class="el-input__icon el-icon-search"></i></span>
                </span>
              </el-form-item>
              <el-form-item label="预计到达日" prop="estimatedArrivalTime">
                <el-date-picker style="width: 100%;"
                  v-model="inOrder.estimatedArrivalTime"
                  type="datetime"
                  placeholder="选择下单开始日期"
                  value-format="yyyy-MM-dd HH:mm:ss" />
              </el-form-item>
              <el-form-item label="司机" prop="driver">
                <el-input v-model="inOrder.driver"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="货主订单号" prop="shipperOrderNo">
                <el-input v-model="inOrder.shipperOrderNo"/>
              </el-form-item>
              <el-form-item label="指定仓库" prop="warehouseId">
                <el-select
                  v-model="inOrder.warehouseId"
                  placeholder="请选择仓库"
                  style="width: 100%;">
                  <el-option
                    v-for="item in warehouseInfoList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="司机电话">
                <el-input v-model="inOrder.driverPhone"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card class="operate-container" shadow="never">
        <i class="el-icon-tickets" style="margin-top: 5px"></i>
        <span style="margin-top: 5px">货品列表</span>
        <el-button class="btn-add" size="mini" @click="addGoods">添加货品</el-button>
      </el-card>
      <el-table
        v-loading="listLoading"
        :data="inOrder.inOrderItemList"
        stripe
        border
        style="width: 100%;margin-top: 10px;"
        @cell-click="cellclick">

        <el-table-column prop="name" label="名称" width="190px">
          <template slot-scope="scope">
            <el-autocomplete
              v-if="scope.row.isOK"
              v-model="scope.row.goodsName"
              :fetch-suggestions="queryGoods"
              :trigger-on-focus="false"
              @select="selectGoods"
              class="inline-input"
              placeholder="搜索货品名称"
              value-key="name"
              style="width: 100%;"
            />
            <span v-if="scope.row.isOK" class="el-input__suffix">
                <span class="el-input__suffix-inner"><i class="el-input__icon el-icon-search"></i></span>
              </span>
            <span size="mini" v-else>{{scope.row.goodsName}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="商品编码" />
        <el-table-column prop="barcode" label="商品条码" />
        <el-table-column prop="temperatureTypeName" label="温度类型" />
        <el-table-column label="到货数量">
          <template slot-scope="scope">
            <el-input v-model="scope.row.expectCount"/>
          </template>
        </el-table-column>
        <el-table-column prop="unitName" label="单位" />
        <el-table-column prop="baseCount" label="拆零数量" >
          <template slot-scope="scope">
            {{ scope.row.baseCount * scope.row.expectCount }}{{ scope.row.baseUnitName }}
          </template>
        </el-table-column>
        <el-table-column label="拆零单价(元)">
          <template slot-scope="scope">
            <el-input v-model="scope.row.price"/>
          </template>
        </el-table-column>
        <el-table-column label="总价(元)">
          <template slot-scope="scope">
            {{ scope.row.price * scope.row.expectCount * scope.row.baseCount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="removeGoodsById(scope.row.goodsId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small" :disabled="$hasBP('btn.inOrder.add')  === false || $hasBP('btn.inOrder.update')  === false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/inbound/inOrder'
import goodsInfoApi from '@/api/base/goodsInfo'
import shipperInfoApi from '@/api/base/shipperInfo'
import warehouseInfoApi from '@/api/base/warehouseInfo'
import inApproveTaskApi from '@/api/inbound/inApproveTask'

const defaultForm = {
  id: '',
  inOrderNo: '',
  shipperOrderNo: '',
  shipperId: '',
  shipperName: '',
  estimatedArrivalTime: '',
  warehouseId: '',
  driver: '',
  driverPhone: '',
  expectCount: '',
  status: '0',
  inOrderItemList: []
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

      estimatedArrivalTimes: [],
      createTimes: [],
      statusList: [
        {id: 0, name: '新建'},
        {id: 1, name: '审批中'},
        {id: 2, name: '收货中'},
        {id: 3, name: '上架中'},
        {id: 4, name: '库存同步中'},
        {id: 5, name: '完成'},
        {id: -1, name: '审批驳回'}
      ],

      dialogVisible: false,
      inOrder: defaultForm,
      saveBtnDisabled: false,
      validateRules: {
        shipperId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        estimatedArrivalTime: [{ required: true, trigger: 'blur', message: '必须选择' }],
        shipperOrderNo: [{ required: true, trigger: 'blur', message: '必须输入' }],
        warehouseId: [{ required: true, trigger: 'blur', message: '必须选择' }]
      },

      warehouseInfoList: [],

      currentRow: null,
      currentColumn: null
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

      if(this.estimatedArrivalTimes && this.estimatedArrivalTimes.length ==2) {
        this.searchObj.estimatedArrivalTimeBegin = this.estimatedArrivalTimes[0]
        this.searchObj.estimatedArrivalTimeEnd = this.estimatedArrivalTimes[1]
      }
      if(this.createTimes && this.createTimes.length ==2) {
        this.searchObj.createTimeBegin = this.createTimes[0]
        this.searchObj.createTimeEnd = this.createTimes[1]
      }

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
      this.estimatedArrivalTimes = []
      this.createTimes = []
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
      this.inOrder = Object.assign({}, defaultForm)
    },

    edit(id) {
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    fetchDataById(id) {
      api.getById(id).then(response => {
        this.inOrder = response.data
      })
    },

    saveOrUpdate() {
      var that = this
      this.$refs.dataForm.validate(valid => {
        if (valid) {

          debugger
          var count = 0
          if(that.inOrder.inOrderItemList.length == 0) {
            that.$message.error('请添加货品')
            return
          }
          that.inOrder.inOrderItemList.forEach(function(item) {
            if(item.code == '') {
              that.$message.error('货品信息不完整')
              count = 1
              return
            }
          })
          if(count == 1) return

          that.saveBtnDisabled = true // 防止表单重复提交
          if (!that.inOrder.id) {
            that.saveData()
          } else {
            that.updateData()
          }
        }
      })
    },

    // 新增
    saveData() {
      api.save(this.inOrder).then(response => {
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
      api.updateById(this.inOrder).then(response => {
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
        this.inOrder = response.data
        this.inOrder.inOrderItemList.forEach(function(row) {
          row.goodsId = row.goodsId
          row.goodsName = row.goodsInfo.name
          row.code = row.goodsInfo.code
          row.barcode = row.goodsInfo.barcode
          row.shipperName = row.goodsInfo.shipperName
          row.temperatureTypeName = row.goodsInfo.temperatureTypeName
          // row.unitName = item.unitName
          // row.baseUnitName = item.baseUnitName
        })

      })
    },

    querySearch(queryString, cb) {
      console.log(queryString)
      console.log(cb)

      shipperInfoApi.findByKeyword(queryString).then(response => {
        // 调用 callback 返回建议列表的数据
        cb(response.data)
      })
    },
    handleSelect(item) {
      debugger
      this.inOrder.shipperId = item.id
      this.inOrder.shipperName = item.name
    },

    addGoods() {
      this.inOrder.inOrderItemList.push({
        goodsId: new Date().getTime(),
        goodsName: '',
        shipperName: '',
        code: '',
        barcode: '',
        temperatureTypeName: '',
        baseCount: '',
        unitName: '',
        baseUnitName: '',
        expectCount: 100,
        price: 0,
        isOK: true
      })
    },

    cellclick(row, column, cell, event){
      this.currentRow = row
      this.currentColumn = column
      //debugger
      if(column.label === '名称'){
        this.$set(row, 'isOK', true)
      }

      this.$nextTick(() => {
        this.$refs.gain.focus()
      })
    },
    queryGoods(queryString, cb) {
      console.log(queryString)
      console.log(cb)

      goodsInfoApi.findByKeyword(queryString).then(response => {
        // 调用 callback 返回建议列表的数据
        cb(response.data)
      })
    },
    selectGoods(item) {
      var that = this
      debugger
      var count = 0
      this.inOrder.inOrderItemList.forEach(function(row, index) {
        if(row.goodsId == item.id) {
          alert('该货品已添加，请重新选择')
          count = 1
        } else {
          if(count == 0 && row.goodsId === that.currentRow.goodsId) {
            row.goodsId = item.id
            row.goodsName = item.name
            row.code = item.code
            row.barcode = item.barcode
            row.shipperName = item.shipperName
            row.temperatureTypeName = item.temperatureTypeName
            row.baseCount = item.baseCount
            row.unitName = item.unitName
            row.baseUnitName = item.baseUnitName
            row.isOK = false
          }
        }
      })
    },

    removeGoodsById(goodsId) {
      var that = this
      this.inOrder.inOrderItemList.forEach(function(row, index) {
        debugger
        if(row.goodsId === goodsId) {
          that.inOrder.inOrderItemList.splice(index, 1)
          return
        }
      })
    },

    submitApprove(id) {
      this.$confirm('确认提交审批吗, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => { // promise
        // 点击确定，远程调用ajax
        return inApproveTaskApi.submitApprove(id)
      }).then((response) => {
        this.fetchData(this.page)
        if (response.code) {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消提交审批'
        })
      })
    }
  }
}
</script>


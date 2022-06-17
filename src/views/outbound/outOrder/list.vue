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
            <el-form-item label="关键字">
              <el-input type="text" placeholder="收货人姓名/手机号码" v-model="searchObj.keyword" style="width: 90%;"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="地址">
              <el-select
                v-model="searchObj.provinceId"
                placeholder="请选择省"
                @change="provinceChanged"
                style="margin-right: 5px;width: 30%;">
                <el-option
                  v-for="item in provinceList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
              <el-select
                v-model="searchObj.cityId"
                placeholder="请选择市"
                @change="cityChanged"
                style="margin-right: 5px;width: 30%;">
                <el-option
                  v-for="item in cityList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
              <el-select
                v-model="searchObj.areaId"
                placeholder="请选择区"
                style="width: 30%;">
                <el-option
                  v-for="item in areaList"
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
        <el-button type="primary" size="mini" icon="el-icon-search" @click="fetchData()">查询</el-button>
        <el-button type="default" size="mini" @click="resetData">清空</el-button>
      </el-form>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
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

      <el-table-column prop="outOrderNo" label="出库单号" width="140"/>
      <el-table-column prop="orderNo" label="订单号" width="140"/>
      <el-table-column prop="consignee" label="收货人" />
      <el-table-column prop="consigneeTel" label="收件人电话" width="130"/>
      <el-table-column prop="deliveryAddress" label="送货地址" width="220"/>
      <el-table-column prop="warehouseName" label="仓库" width="120"/>
      <el-table-column prop="statusName" label="状态" width="120"/>
      <el-table-column prop="createTime" label="创建时间" width="160"/>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template slot-scope="scope">
          <router-link :to="'/outbound/outOrder/show/'+scope.row.id">
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

    <el-dialog title="订单详情" :visible.sync="dialogVisible" width="40%" >

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/outbound/outOrder'
import dictApi from '@/api/base/dict'
import warehouseInfoApi from '@/api/base/warehouseInfo'
export default {
  data() {
    return {
      listLoading: true, // 数据是否正在加载
      list: null, // banner列表
      total: 0, // 数据库中的总记录数
      page: 1, // 默认页码
      limit: 10, // 每页记录数
      searchObj: {}, // 查询表单对象

      createTimes:[],
      provinceList: [],
      cityList: [],
      areaList: [],
      warehouseInfoList: [],
      statusList: [
        {id: 0, name: '待拣货'},
        {id: 1, name: '拣货中'},
        {id: 2, name: '待发货'},
        {id: 3, name: '已发货'},
        {id: 4, name: '完成'}
      ],

      dialogVisible: false,
      outOrder: {},
      saveBtnDisabled: false
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()

    dictApi.findByDictCode('Province').then(response => {
      this.provinceList = response.data
    })
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
      this.fetchData()
    },

    // -------------
    add(){
      this.dialogVisible = true
      this.outOrder = Object.assign({}, defaultForm)
    },

    // 根据id查询记录
    fetchDataById(id) {
      api.getById(id).then(response => {
        this.outOrder = response.data
      })
    },

    provinceChanged() {
      debugger
      this.cityList = []
      this.searchObj.cityId = null
      this.areaList = []
      this.searchObj.areaId = null
      dictApi.findByParentId(this.searchObj.provinceId).then(response => {
        this.cityList = response.data
      })
    },

    cityChanged() {
      this.areaList = []
      this.searchObj.areaId = null
      dictApi.findByParentId(this.searchObj.cityId).then(response => {
        this.areaList = response.data
      })
    },
  }
}
</script>


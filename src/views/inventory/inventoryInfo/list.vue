<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="关键字">
              <el-input type="text" placeholder="货品名称/编码/条码" v-model="searchObj.keyword" style="width: 90%;"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品类型">
              <el-cascader
                v-model="goodsTypeIds"
                :options="goodsTypeList"
                style="width: 90%;"></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="温度类型">
              <el-select
                v-model="searchObj.temperatureTypeId"
                placeholder="请选择检验类型"
                style="width: 90%;">
                <el-option
                  v-for="item in temperatureTypeList"
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
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
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

      <el-table-column prop="name" label="名称"  width="280"/>
      <el-table-column prop="skuId" label="关联SKU" width="90"/>
      <el-table-column prop="code" label="商品编码" width="120"/>
      <el-table-column prop="barcode" label="商品条码" width="120"/>
      <el-table-column prop="brandName" label="品牌" />
      <el-table-column prop="goodsTypeName" label="商品类型" width="110"/>
      <el-table-column prop="saleAttr" label="货品的销售属性" width="160"/>
      <el-table-column prop="inspectTypeName" label="检验类型" width="110"/>
      <el-table-column prop="temperatureTypeName" label="温度类型" width="110"/>
      <el-table-column prop="totalCount" label="总库存" fixed="right"/>
      <el-table-column prop="lockCount" label="锁定库存" fixed="right"/>
      <el-table-column prop="availableCount" label="可用库存" fixed="right"/>
      <el-table-column prop="pickingCount" label="已拣未发货数量" width="120" fixed="right"/>
      <el-table-column prop="warningCount" label="预警数量" fixed="right"/>
      <el-table-column prop="saleCount" label="历史销量" fixed="right"/>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="show(scope.row)" size="small">库存详情</el-button>
          <el-button type="text" @click="showLog(scope.row.id)" size="small">库存日志</el-button>
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

    <el-dialog title="库存详情" :visible.sync="dialogVisible" width="80%" >
      <el-table
        v-loading="listLoading"
        :data="inventoryInfoList"
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
        <el-table-column prop="warehouseName" label="仓库"/>
        <el-table-column prop="storehouseName" label="库位" width="130"/>
        <el-table-column prop="totalCount" label="总库存" width="90"/>
        <el-table-column prop="lockCount" label="锁定库存" width="90"/>
        <el-table-column prop="availableCount" label="可用库存" width="90"/>
        <el-table-column prop="pickingCount" label="已拣未发货数量" width="120"/>
        <el-table-column prop="warningCount" label="预警数量"width="90"/>
        <el-table-column prop="saleCount" label="历史销量" width="90"/>
        <el-table-column label="操作" width="130" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="updateInventoryShow(scope.row)" size="small">手动上架库存</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
      </span>
    </el-dialog>

    <el-dialog title="库存日志" :visible.sync="dialogLogVisible" width="70%" >
      <el-table
        v-loading="listLoading"
        :data="logList"
        stripe
        border
        style="width: 100%;margin-top: 10px;">
        <el-table-column
          label="序号"
          width="70"
          align="center">
          <template slot-scope="scope">
            {{ (logPage - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="操作仓库" width="130"/>
        <el-table-column prop="logTypeName" label="日志类型" width="100"/>
        <el-table-column prop="alterationCount" label="操作库存" width="110"/>
        <el-table-column prop="createTime" label="操作时间" width="160"/>
        <el-table-column prop="remarks" label="备注" />
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
        :current-page="logPage"
        :total="logTotal"
        :page-size="limit"
        :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
        style="padding: 30px 0; text-align: center;"
        layout="sizes, prev, pager, next, jumper, ->, total, slot"
        @current-change="logFetchData"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogLogVisible = false" size="small">取 消</el-button>
      </span>
    </el-dialog>

    <el-dialog title="手动上架库存" :visible.sync="dialogInventoryVisible" width="50%" >
      <el-form ref="dataForm"  label-width="150px" size="small" style="padding-right: 40px;">
        <el-form-item label="上架仓库" prop="code">
          <el-input v-model="inventoryFormVo.warehouseName" disabled="true"/>
        </el-form-item>
        <el-form-item label="上架个数" prop="code">
          <el-input v-model="inventoryFormVo.count"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogInventoryVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="updateInventory()" size="small" :disabled="$hasBP('btn.inventoryInfo.updateInventory')  === false">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import api from '@/api/inventory/inventoryInfo'
import invLogApi from '@/api/inventory/invLog'
import goodsTypeApi from '@/api/base/goodsType'
import dictApi from '@/api/base/dict'
export default {
  data() {
    return {
      listLoading: true, // 数据是否正在加载
      list: null, // banner列表
      total: 0, // 数据库中的总记录数
      page: 1, // 默认页码
      limit: 10, // 每页记录数
      searchObj: {}, // 查询表单对象

      goodsTypeIds: [],

      goodsTypeList: [],
      inspectTypeList: [],
      temperatureTypeList: [],

      dialogVisible: false,
      inventoryInfoList: [],

      logList: null, // banner列表
      logTotal: 0, // 数据库中的总记录数
      logPage: 1, // 默认页码
      logSearchObj: {},

      dialogLogVisible: false,
      saveBtnDisabled: false,

      dialogInventoryVisible: false,
      inventoryFormVo: {
        warehouseName: '',
        warehouseId: 1,
        goodsId: 1,
        count : 1
      }
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()

    goodsTypeApi.findNodes().then(response => {
      this.goodsTypeList = response.data
    })
    dictApi.findByDictCode('InspectType').then(response => {
      this.inspectTypeList = response.data
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
      if(this.goodsTypeIds != null && this.goodsTypeIds.length == 3) {
        this.searchObj.goodsTypeId = this.goodsTypeIds[2]
      }

      api.getPageList(this.page, this.limit, this.searchObj).then(
        response => {
          this.list = response.data.records
          this.total = response.data.total

          this.list.forEach(function(item) {
            item.totalCount = 0;
            item.lockCount = 0;
            item.availableCount = 0;
            item.warningCount = 0;
            item.saleCount = 0;
            item.pickingCount = 0;
            item.inventoryInfoList.forEach(function(row) {
              item.totalCount += row.totalCount;
              item.lockCount += row.lockCount;
              item.availableCount += row.availableCount;
              item.warningCount = row.warningCount;
              item.saleCount += row.saleCount;
              item.pickingCount += row.pickingCount;
            })
          })
          // 数据加载并绑定成功
          this.listLoading = false
        }
      )
    },

    // 重置查询表单
    resetData() {
      console.log('重置查询表单')
      this.searchObj = {}
      this.goodsTypeIds = []
      this.fetchData()
    },

    show(row) {
      this.dialogVisible = true
      this.inventoryInfoList = []
      this.inventoryInfoList = row.inventoryInfoList
    },

    // -------------
    showLog(id){
      this.dialogLogVisible = true
      this.logSearchObj.goodsId = id
      this.logFetchData(1)
    },

    logFetchData(page = 1) {
      console.log('翻页。。。' + page)
      // 异步获取远程数据（ajax）
      this.logPage = page

      invLogApi.getPageList(this.logPage, this.limit, this.logSearchObj).then(
        response => {
          this.logList = response.data.records
          this.logTotal = response.data.total

          // 数据加载并绑定成功
          this.listLoading = false
        }
      )
    },

    updateInventoryShow(row) {
      this.dialogInventoryVisible = true
      this.inventoryFormVo.warehouseName = row.warehouseName
      this.inventoryFormVo.warehouseId = row.warehouseId
      this.inventoryFormVo.goodsId = row.goodsId
      this.inventoryFormVo.count = 1
      debugger
    },

    updateInventory() {
      api.updateInventory(this.inventoryFormVo).then(response => {
        this.dialogInventoryVisible = false
        this.$message.success('操作成功')
      })
    }
  }
}
</script>


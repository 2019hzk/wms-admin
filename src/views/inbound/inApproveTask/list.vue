<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="相关单号">
              <el-input type="text" placeholder="任务单号/入库单号/货主订单号" v-model="searchObj.no" style="width: 90%;"/>
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

      <el-table-column prop="taskNo" label="任务编号" width="150px"/>
      <el-table-column prop="inOrderNo" label="入库单号" width="150px"/>
      <el-table-column prop="shipperOrderNo" label="货主订单号" width="150px"/>
      <el-table-column prop="shipperName" label="货主名称" width="100px"/>
      <el-table-column prop="driver" label="司机" width="100px"/>
      <el-table-column prop="driverPhone" label="司机电话" width="130px"/>
      <el-table-column prop="expectCount" label="预期到货数量" width="150px"/>
      <el-table-column prop="statusName" label="状态" />
      <el-table-column prop="createTime" label="创建时间" width="160px"/>
      <el-table-column label="操作" width="90" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status == 'PENDING_APPROVEL'" size="mini" @click="approve(scope.row)">审批</el-button>
          <router-link :to="'/inbound/inOrder/show/'+scope.row.inOrderId">
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

    <el-dialog title="审批" :visible.sync="dialogVisible" width="90%" >
      <div style="padding-bottom: 10px;font-weight:bold;">基本信息</div>
      <el-card class="operate-container" shadow="never">
        <el-form ref="flashPromotionForm" label-width="100px" size="small">
          <el-row>
            <el-col :span="8">
              <el-form-item label="货主">
                {{ inOrder.shipperName }}
              </el-form-item>
              <el-form-item label="司机">
                {{ inOrder.driver }}
              </el-form-item>
              <el-form-item label="指定仓库">
                {{ inOrder.warehouseName }}
              </el-form-item>
              <el-form-item label="创建时间">
                {{ inOrder.createTime }}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="货主订单号">
                {{ inOrder.shipperOrderNo }}
              </el-form-item>
              <el-form-item label="司机电话">
                {{ inOrder.driverPhone }}
              </el-form-item>
              <el-form-item label="预期到货数量">
                {{ inOrder.expectCount }}
              </el-form-item>
              <el-form-item label="创建人">
                {{ inOrder.createName }}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="入库单号">
                {{ inOrder.inOrderNo }}
              </el-form-item>
              <el-form-item label="预计到达日">
                {{ inOrder.estimatedArrivalTime }}
              </el-form-item>
              <el-form-item label="状态">
                {{ inOrder.statusName }}
              </el-form-item>
              <el-form-item label="最近时间">
                {{ inOrder.updateTime }}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <div style="font-weight:bold;">货品列表</div>
      <el-table
        v-loading="listLoading"
        :data="inOrder.inOrderItemList"
        stripe
        border
        style="width: 100%;margin-top: 10px;">

        <el-table-column prop="goodsInfo.name" label="名称" width="200px"/>
        <el-table-column prop="goodsInfo.barcode" label="商品条码" />
        <el-table-column prop="goodsInfo.temperatureTypeName" label="温度类型" />
        <el-table-column prop="expectCount" label="预期数量"/>
        <el-table-column prop="unitName" label="单位" />
        <el-table-column prop="baseCount" label="拆零数量" >
          <template slot-scope="scope">
            {{ scope.row.baseCount }}{{ scope.row.baseUnitName }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="拆零单价(元)"/>
        <el-table-column label="总价(元)">
          <template slot-scope="scope">
            {{ scope.row.price * scope.row.expectCount * scope.row.baseCount }}
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 20px;margin-bottom:10px;font-weight:bold;">审批信息</div>
      <el-card class="operate-container" shadow="never">
        <el-form ref="flashPromotionForm" size="small" style="padding-right: 40px;">
          <el-form-item label="审批">
            <el-radio v-model="inApproveFormVo.status" label="1">通过</el-radio>
            <el-radio v-model="inApproveFormVo.status" label="0">不通过</el-radio>
          </el-form-item>
          <el-form-item label="审批备注">
            <el-input v-model="inApproveFormVo.remarks"/>
          </el-form-item>
        </el-form>
      </el-card>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="submitSave()" :disabled="$hasBP('btn.inApproveTask.approve')  === false" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/inbound/inApproveTask'
import inOrderApi from '@/api/inbound/inOrder'
export default {
  data() {
    return {
      listLoading: true, // 数据是否正在加载
      list: null, // banner列表
      total: 0, // 数据库中的总记录数
      page: 1, // 默认页码
      limit: 10, // 每页记录数
      searchObj: {}, // 查询表单对象

      createTimes: [],
      statusList: [
        {id: 0, name: '待审批'},
        {id: 1, name: '完成'},
        {id: -1, name: '审批驳回'}
      ],

      dialogVisible: false,
      saveBtnDisabled: false,

      inOrder: {},
      inApproveFormVo: {
        id: null,
        status: '1',
        remarks: ''
      }
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()
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
    approve(row){
      this.dialogVisible = true
      this.inApproveFormVo .id = row.id

      inOrderApi.getById(row.inOrderId).then(response => {
        this.inOrder = response.data
      })
    },
    submitSave() {
      api.approve(this.inApproveFormVo).then(response => {
        this.$message.success('操作成功')
        this.dialogVisible = false
        this.fetchData(this.page)
      })
    }
  }
}
</script>


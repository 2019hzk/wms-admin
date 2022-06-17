<template>
  <div class="app-container">

    <div style="padding-bottom: 10px;font-weight:bold;">基本信息</div>
    <el-card class="operate-container" shadow="never">
      <el-form ref="flashPromotionForm" label-width="100px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="出库单号">
              {{ outOrder.outOrderNo }}
            </el-form-item>
            <el-form-item label="收货人">
              {{ outOrder.consignee }}
            </el-form-item>
            <el-form-item label="订单备注">
              {{ outOrder.orderComment }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单号">
              {{ outOrder.orderNo }}
            </el-form-item>
            <el-form-item label="收货人电话">
              {{ outOrder.consigneeTel }}
            </el-form-item>
            <el-form-item label="指定仓库">
              {{ outOrder.warehouseName }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间">
              {{ outOrder.createTime }}
            </el-form-item>
            <el-form-item label="收货人地址">
              {{ outOrder.deliveryAddress }}
            </el-form-item>
            <el-form-item label="状态">
              {{ outOrder.statusName }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <div style="font-weight:bold;">货品列表</div>
    <el-table
      v-loading="listLoading"
      :data="outOrder.outOrderItemList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="goodsName" label="货品名称" width="200"/>
      <el-table-column prop="barcode" label="货品条码" width="130"/>
      <el-table-column prop="buyCount" label="购买个数" />
      <el-table-column prop="weight" label="重量"/>
      <el-table-column prop="volume" label="体积" />
      <el-table-column prop="warehouseName" label="仓库" width="130"/>
      <el-table-column prop="storehouseName" label="库位" width="180"/>
      <el-table-column prop="statusName" label="状态"/>
    </el-table>

    <div v-if="outPickingTaskList != null && outPickingTaskList.length > 0" style="margin-top: 20px;font-weight:bold;">拣货记录</div>
    <el-table
      v-if="outPickingTaskList != null && outPickingTaskList.length > 0"
      v-loading="listLoading"
      :data="outPickingTaskList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="taskNo" label="任务编号" width="180"/>
      <el-table-column prop="warehouseName" label="仓库" width="140"/>
      <el-table-column prop="storeshelfName" label="货架号"/>
      <el-table-column prop="pickingUser" label="拣货人" width="120"/>
      <el-table-column prop="pickingTime" label="拣货时间" width="160"/>
      <el-table-column prop="pickingCount" label="拣货数量"/>
      <el-table-column prop="statusName" label="状态" />
    </el-table>

    <div v-if="outDeliverTaskList != null && outDeliverTaskList.length > 0" style="margin-top: 20px;font-weight:bold;">发货记录</div>
    <el-table
      v-if="outDeliverTaskList != null && outDeliverTaskList.length > 0"
      v-loading="listLoading"
      :data="outDeliverTaskList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="taskNo" label="任务编号" width="160"/>
      <el-table-column prop="deliverUser" label="发货人" width="130"/>
      <el-table-column prop="deliverTime" label="发货时间" width="160"/>
      <el-table-column prop="deliverCount" label="发货数量" width="140"/>
      <el-table-column prop="trackingNo" label="物流单号" width="140"/>
      <el-table-column prop="trackingCompany" label="物流公司" />
      <el-table-column prop="statusName" label="状态" />
    </el-table>

    <br/>
    <span slot="footer" class="dialog-footer">
        <el-button @click="back" size="small">返回</el-button>
      </span>
  </div>
</template>

<script>
import api from '@/api/outbound/outOrder'
import warehouseInfoApi from '@/api/base/warehouseInfo'
export default {
  data() {
    return {
      outOrder: {},
      outPickingTaskList: [],
      outDeliverTaskList: [],

      wareList: []
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()

    // warehouseInfoApi.findNodes().then(response => {
    //   this.wareList = response.data
    // })
  },

  // 生命周期函数：内存准备完毕，页面渲染成功
  mounted() {
    console.log('list mounted......')
  },

  methods: {
    fetchData() {
      api.show(this.$route.params.id).then(response => {
        this.outOrder = response.data.outOrder
        this.outPickingTaskList = response.data.outPickingTaskList
        this.outDeliverTaskList = response.data.outDeliverTaskList
      })
    },

    back() {
      window.history.back(-1)
    }
  }
}
</script>
<style scoped>
  .el-form-item {
     margin-bottom: 0px;
  }
</style>

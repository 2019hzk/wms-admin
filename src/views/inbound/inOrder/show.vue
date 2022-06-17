<template>
  <div class="app-container">

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
      <el-table-column prop="goodsInfo.code" label="商品编码" />
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

    <div v-if="inApproveTaskList != null && inApproveTaskList.length > 0" style="margin-top: 20px;font-weight:bold;">审批记录</div>
    <el-table
      v-if="inApproveTaskList != null && inApproveTaskList.length > 0"
      v-loading="listLoading"
      :data="inApproveTaskList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="approveUser" label="审批人"/>
      <el-table-column prop="approveTime" label="审批时间" />
      <el-table-column prop="statusName" label="审批状态"/>
      <el-table-column prop="remarks" label="审批记录" />
    </el-table>

    <div v-if="inReceivingTaskList != null && inReceivingTaskList.length > 0" style="margin-top: 20px;font-weight:bold;">收货记录</div>
    <el-table
      v-if="inReceivingTaskList != null && inReceivingTaskList.length > 0"
      v-loading="listLoading"
      :data="inReceivingTaskList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="receivingUser" label="收货人"/>
      <el-table-column prop="receivingTime" label="收货时间" />
      <el-table-column prop="expectCount" label="预期到货数量" />
      <el-table-column prop="actualCount" label="实际到货数量" />
      <el-table-column prop="statusName" label="收货状态"/>
      <el-table-column prop="remarks" label="收货备注" />
    </el-table>

    <div v-if="inPutawayTaskList != null && inPutawayTaskList.length > 0" style="margin-top: 20px;font-weight:bold;">上架记录</div>
    <el-table
      v-if="inPutawayTaskList != null && inPutawayTaskList.length > 0"
      v-loading="listLoading"
      :data="inPutawayTaskList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="putawayUser" label="上架人"/>
      <el-table-column prop="putawayTime" label="上架时间" width="160"/>
      <el-table-column prop="expectCount" label="预期到货数量" />
      <el-table-column prop="actualCount" label="实际到货数量" />
      <el-table-column prop="unqualifiedCount" label="不合格数量" />
      <el-table-column prop="putawayCount" label="上架数量" />
      <el-table-column prop="statusName" label="上架状态"/>
      <el-table-column prop="remarks" label="上架备注" />
    </el-table>
    <div v-if="inPutawayTaskList != null && inPutawayTaskList.length > 0" style="margin-top: 20px;font-weight:bold;">上架明细</div>
    <el-table
      v-if="inPutawayTaskList != null && inPutawayTaskList.length > 0"
      v-loading="listLoading"
      :data="inOrder.inOrderItemList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="goodsInfo.name" label="名称" width="200px"/>
      <el-table-column prop="goodsInfo.code" label="商品编码" />
      <el-table-column prop="expectCount" label="预期数量"/>
      <el-table-column prop="unitName" label="单位" />
      <el-table-column prop="baseCount" label="拆零数量" >
        <template slot-scope="scope">
          {{ scope.row.baseCount }}{{ scope.row.baseUnitName }}
        </template>
      </el-table-column>
      <el-table-column prop="actualCount" label="实际数量"/>
      <el-table-column prop="unqualifiedCount" label="不合格数量" />
      <el-table-column prop="putawayCount" label="上架数量" />
      <el-table-column label="指定库位" width="280px;">
        <template slot-scope="scope">
          <el-cascader
            disabled="true"
            v-model="scope.row.wareIds"
            :options="wareList"
            style="width: 100%;"></el-cascader>
        </template>
      </el-table-column>
    </el-table>
    <br/>
    <span slot="footer" class="dialog-footer">
        <el-button @click="back" size="small">返回</el-button>
      </span>
  </div>
</template>

<script>
import api from '@/api/inbound/inOrder'
import warehouseInfoApi from '@/api/base/warehouseInfo'
export default {
  data() {
    return {
      inOrder: {},
      inApproveTaskList: [],
      inReceivingTaskList: [],
      inPutawayTaskList: [],

      wareList: []
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()

    warehouseInfoApi.findNodes().then(response => {
      this.wareList = response.data
    })
  },

  // 生命周期函数：内存准备完毕，页面渲染成功
  mounted() {
    console.log('list mounted......')
  },

  methods: {
    fetchData() {
      api.show(this.$route.params.id).then(response => {
        this.inOrder = response.data.inOrder
        this.inApproveTaskList = response.data.inApproveTaskList
        this.inReceivingTaskList = response.data.inReceivingTaskList
        this.inPutawayTaskList = response.data.inPutawayTaskList

        this.inOrder.inOrderItemList.forEach(function(row) {
          row.wareIds = [row.warehouseId, row.storeareaId, row.storeshelfId, row.storehouseId]
        })
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

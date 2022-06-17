<template>
  <div class="app-container">

    <div style="padding-bottom: 10px;font-weight:bold;">基本信息</div>
    <el-card class="operate-container" shadow="never">
      <el-form ref="flashPromotionForm" label-width="100px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="移动原因">
              {{ invMove.reasonName }}
            </el-form-item>
            <el-form-item label="创建人">
              {{ invMove.createName }}
            </el-form-item>
            <el-form-item label="备注">
              {{ invMove.remarks }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划移动时间">
              {{ invMove.planMoveTime }}
            </el-form-item>
            <el-form-item label="创建时间">
              {{ invMove.createTime }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="库位">
              {{ invMove.warehouseName }} {{ invMove.storehouseName }}
            </el-form-item>
            <el-form-item label="状态">
              {{ invMove.statusName }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <div>货品列表</div>
    <el-table
      ref="table"
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
          {{scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="goodsInfo.name" label="货品名称" width="220"/>
      <el-table-column prop="goodsInfo.code" label="商品编码" width="120"/>
      <el-table-column prop="goodsInfo.barcode" label="商品条码" width="120"/>
      <el-table-column prop="goodsInfo.goodsTypeName" label="商品类型" width="120px"/>
      <el-table-column prop="totalCount" label="总库存"/>
      <el-table-column prop="moveTotalCount" label="实际库存"/>
      <el-table-column prop="pickingCount" label="已拣未发货数量"/>
      <el-table-column prop="differenceCount" label="差异库存"/>
      <el-table-column prop="storehouseName" label="转移库位" width="130px;"/>
    </el-table>

    <div v-if="invMoveTaskList != null && invMoveTaskList.length > 0" style="margin-top: 20px;font-weight:bold;">移动记录</div>
    <el-table
      v-if="invMoveTaskList != null && invMoveTaskList.length > 0"
      v-loading="listLoading"
      :data="invMoveTaskList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="moveUser" label="移动人"/>
      <el-table-column prop="moveCompleteTime" label="移动完成时间" />
      <el-table-column prop="statusName" label="状态" />
      <el-table-column prop="remarks" label="备注" />
    </el-table>
    <br/>
    <span slot="footer" class="dialog-footer">
        <el-button @click="back" size="small">返回</el-button>
      </span>
  </div>
</template>

<script>
import invMoveApi from '@/api/inventory/invMove'
export default {
  data() {
    return {
      invMove: {},
      inventoryInfoList: [],
      invMoveTaskList: []
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
    // 加载banner列表数据
    fetchData() {
      var that = this

      invMoveApi.show(this.$route.params.id).then(response => {
        that.invMove = response.data.invMove
        that.inventoryInfoList = response.data.inventoryInfoList
        that.invMoveTaskList = response.data.invMoveTaskList

        that.inventoryInfoList.forEach(function(row) {
          that.invMove.invMoveItemList.forEach(function(item) {
            if(row.goodsId == item.goodsId) {
              row.totalCount = item.totalCount
              row.moveTotalCount = item.moveTotalCount
              row.differenceCount = item.differenceCount
              row.storehouseName = item.storehouseName
            }
          })
        })
      })
    },

    back() {
      window.history.back(-1)
    }
  }
}
</script>


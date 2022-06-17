<template>
  <div class="app-container">

    <div style="padding-bottom: 10px;font-weight:bold;">基本信息</div>
    <el-card class="operate-container" shadow="never">
      <el-form ref="flashPromotionForm" label-width="100px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="盘点原因">
              {{ invCounting.reasonName }}
            </el-form-item>
            <el-form-item label="创建人">
              {{ invCounting.createName }}
            </el-form-item>
            <el-form-item label="备注">
              {{ invCounting.remarks }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划盘点时间">
              {{ invCounting.planCountingTime }}
            </el-form-item>
            <el-form-item label="创建时间">
              {{ invCounting.createTime }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="库位">
              {{ invCounting.warehouseName }} {{ invCounting.storehouseName }}
            </el-form-item>
            <el-form-item label="状态">
              {{ invCounting.statusName }}
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
      <el-table-column prop="goodsInfo.code" label="商品编码" width="110"/>
      <el-table-column prop="goodsInfo.barcode" label="商品条码" width="110"/>
      <el-table-column prop="goodsInfo.goodsTypeName" label="商品类型" width="110px"/>
      <el-table-column prop="totalCount" label="总库存"/>
      <el-table-column prop="actualCount" label="实际库存"/>
      <el-table-column prop="pickingCount" label="已拣未发货数量"/>
      <el-table-column prop="differenceCount" label="差异库存"/>
    </el-table>

    <div v-if="invCountingTaskList != null && invCountingTaskList.length > 0" style="margin-top: 20px;font-weight:bold;">盘点记录</div>
    <el-table
      v-if="invCountingTaskList != null && invCountingTaskList.length > 0"
      v-loading="listLoading"
      :data="invCountingTaskList"
      stripe
      border
      style="width: 100%;margin-top: 10px;">

      <el-table-column prop="countingUser" label="盘点人"/>
      <el-table-column prop="countingCompleteTime" label="盘点完成时间" />
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
import invCountingApi from '@/api/inventory/invCounting'
export default {
  data() {
    return {
      invCounting: {},
      inventoryInfoList: [],
      invCountingTaskList: []
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

      invCountingApi.show(this.$route.params.id).then(response => {
        that.invCounting = response.data.invCounting
        that.inventoryInfoList = response.data.inventoryInfoList
        that.invCountingTaskList = response.data.invCountingTaskList

        that.inventoryInfoList.forEach(function(row) {
          that.invCounting.invCountingItemList.forEach(function(item) {
            if(row.goodsId == item.goodsId) {
              row.totalCount = item.totalCount
              row.actualCount = item.actualCount
              row.differenceCount = item.differenceCount
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


<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="相关单号">
              <el-input type="text" placeholder="任务单号/移动单号" v-model="searchObj.no" style="width: 90%;"/>
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

      <el-table-column prop="taskNo" label="任务编号" width="140"/>
      <el-table-column prop="invMoveNo" label="移动单号"width="140" />
      <el-table-column prop="moveUser" label="任务执行人" width="110"/>
      <el-table-column prop="moveCompleteTime" label="操作完成时间" width="160"/>
      <el-table-column prop="statusName" label="状态" width="90"/>
      <el-table-column prop="createName" label="创建人" />
      <el-table-column prop="createTime" label="创建时间" width="160"/>
      <el-table-column label="操作" width="140" align="center">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status == 'PENDING_DEAL'" size="mini" @click="edit(scope.row)">完成</el-button>
<!--          <el-button type="text" v-if="scope.row.status == 'PENDING_INVENTORY'" size="mini" @click="syncInventory(scope.row.id)" :disabled="$hasBP('btn.invMoveTask.sync')  === false">同步库存</el-button>-->
          <router-link :to="'/inventory/invMove/show/'+scope.row.invMoveId">
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

    <el-dialog title="更新数据" :visible.sync="dialogVisible" width="90%" >
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
                {{ invMove.planCountingTime }}
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
            {{ (page - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>

        <el-table-column prop="goodsInfo.name" label="货品名称" width="220"/>
        <el-table-column prop="goodsInfo.code" label="商品编码" width="90"/>
        <el-table-column prop="goodsInfo.barcode" label="商品条码" width="90"/>
        <el-table-column prop="goodsInfo.goodsTypeName" label="商品类型" width="100px"/>
        <el-table-column prop="totalCount" label="总库存"/>
        <el-table-column label="移库总库存" width="120">
          <template slot-scope="scope">
            <el-input v-model="scope.row.moveTotalCount"/>
          </template>
        </el-table-column>
        <el-table-column prop="pickingCount" label="已拣未发货数量"/>
        <el-table-column label="差异量" >
          <template slot-scope="scope">
            {{ scope.row.totalCount - scope.row.moveTotalCount }}
          </template>
        </el-table-column>
        <el-table-column label="指定库位" width="350px;">
          <template slot-scope="scope">
            <el-cascader
              v-model="scope.row.wareIds"
              :options="wareList"
              style="width: 100%;"></el-cascader>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="updateData()" size="small" :disabled="$hasBP('btn.invMoveTask.update')  === false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/inventory/invMoveTask'
import invMoveApi from '@/api/inventory/invMove'
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

      createTimes: [],
      statusList: [
        {id: 0, name: '待处理'},
        {id: 1, name: '完成'}
      ],

      dialogVisible: false,
      invMove: {},
      inventoryInfoList: [],
      wareList: [],
      saveBtnDisabled: false
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
    edit(row) {
      debugger
      this.dialogVisible = true
      this.fetchDataById(row.invMoveId)
    },

    fetchDataById(invMoveId) {
      var that = this
      debugger
      invMoveApi.show(invMoveId).then(response => {
        that.invMove = response.data.invMove
        that.inventoryInfoList = response.data.inventoryInfoList

        that.inventoryInfoList.forEach(function(row) {
          that.invMove.invMoveItemList.forEach(function(item) {
            if(row.goodsId == item.goodsId) {
              row.wareIds = [item.moveWarehouseId, item.moveStoreareaId, item.moveStoreshelfId, item.moveStorehouseId]
              //row.totalCount = row.totalCount
              //row.moveTotalCount = row.totalCount
              //row.differenceCount = row.totalCount - row.moveTotalCount
            }
          })
        })
      })
    },

    // 根据id更新记录
    updateData() {
      var that = this
      var count = 0
      that.inventoryInfoList.forEach(function(row) {

        var r = /^\+?[1-9][0-9]*$/;
        if(r.test(row.moveTotalCount)) {
          that.invMove.invMoveItemList.forEach(function(item) {
            if(row.goodsId == item.goodsId) {
              item.totalCount = row.totalCount
              item.moveTotalCount = row.moveTotalCount
              item.differenceCount = row.totalCount - row.moveTotalCount

              item.moveWarehouseId = row.wareIds[0]
              item.moveStoreareaId = row.wareIds[1]
              item.moveStoreshelfId = row.wareIds[2]
              item.moveStorehouseId = row.wareIds[3]
            }
          })
        } else {
          count++
        }
      })
      if(count > 0) {
        that.$message.error('请补充数据')
        return
      }

      api.update(this.invMove.invMoveItemList).then(response => {
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

    syncInventory(id) {
      this.$confirm('确定同步库存吗, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => { // promise
        // 点击确定，远程调用ajax
        return api.syncInventory(id)
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
          message: '已取消同步'
        })
      })
    }
  }
}
</script>


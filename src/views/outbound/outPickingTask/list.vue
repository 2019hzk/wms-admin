<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="任务单号">
              <el-input type="text" placeholder="任务单号" v-model="searchObj.taskNo" style="width: 90%;"/>
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

      <el-table-column prop="taskNo" label="拣货任务编号" width="160"/>
      <el-table-column prop="warehouseName" label="仓库" width="140"/>
      <el-table-column prop="storeshelfName" label="货架号" width="140"/>
      <el-table-column prop="pickingCount" label="拣货数量" width="100"/>
      <el-table-column prop="pickingUser" label="拣货人" width="100"/>
      <el-table-column prop="pickingTime" label="拣货时间" width="160"/>
      <el-table-column prop="statusName" label="状态" />
      <el-table-column prop="createTime" label="创建时间" width="160"/>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="show(scope.row.id)">查看</el-button>
          <el-button type="text" v-if="scope.row.status == 'PENDING_PICKING'" size="mini" @click="finish(scope.row.id)" :disabled="$hasBP('btn.outPickingTask.finish')  === false">完成拣货</el-button>
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

    <el-dialog title="拣货详情" :visible.sync="dialogVisible" width="90%" >
      <div style="padding-bottom: 10px;font-weight:bold;">基本信息</div>
      <el-card class="operate-container" shadow="never">
        <el-form ref="flashPromotionForm" label-width="100px" size="small">
          <el-row>
            <el-col :span="8">
              <el-form-item label="拣货任务单号">
                {{ outPickingTask.taskNo }}
              </el-form-item>
              <el-form-item label="创建时间">
                {{ outPickingTask.createTime }}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="仓库">
                {{ outPickingTask.warehouseName }}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态">
                {{ outPickingTask.statusName }}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <div style="font-weight:bold;">货品列表</div>
      <el-table
        v-loading="listLoading"
        :data="outPickingTask.outPickingItemList"
        stripe
        border
        style="width: 100%;margin-top: 10px;">

        <el-table-column prop="goodsName" label="货物名称" width="300"/>
        <el-table-column prop="barcode" label="货物条码" width="110"/>
        <el-table-column prop="pickingCount" label="拣货个数" />
        <el-table-column prop="weight" label="重量" />
        <el-table-column prop="volume" label="体积" />
        <el-table-column prop="warehouseName" label="仓库" width="130"/>
        <el-table-column prop="storehouseName" label="库位" width="150"/>
        <el-table-column prop="statusName" label="状态" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/outbound/outPickingTask'

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
      statusList: [
        {id: 0, name: '待拣货'},
        {id: 1, name: '完成'}
      ],

      dialogVisible: false,
      outPickingTask: {},
      saveBtnDisabled: false
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

    // -------------
    show(id){
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    fetchDataById(id) {
      api.getById(id).then(response => {
        this.outPickingTask = response.data
      })
    },

    finish(id) {
      this.$confirm('确认完成拣货吗, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => { // promise
        // 点击确定，远程调用ajax
        return api.finish(id)
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
          message: '已取消操作'
        })
      })
    }
  }
}
</script>


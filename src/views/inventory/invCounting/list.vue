<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="盘点单号">
              <el-input type="text" placeholder="盘点单号" v-model="searchObj.invCountingNo" style="width: 90%;"/>
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
            <el-form-item label="盘点时间">
              <el-date-picker
                v-model="planCountingTimes"
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

      <el-table-column prop="invCountingNo" label="盘点单号" width="140"/>
      <el-table-column prop="reasonName" label="盘点原因" width="120"/>
      <el-table-column prop="planCountingTime" label="计划盘点时间" width="160"/>
      <el-table-column prop="warehouseName" label="仓库" width="120"/>
      <el-table-column prop="storehouseName" label="库位" width="160"/>
      <el-table-column prop="statusName" label="状态" />
      <el-table-column prop="createTime" label="创建时间" width="160"/>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status == 'CREATE'" size="mini" @click="edit(scope.row.id)">修改</el-button>
          <el-button type="text" v-if="scope.row.status == 'CREATE'" size="mini" @click="removeDataById(scope.row.id)" :disabled="$hasBP('btn.invCounting.remove')  === false">删除</el-button>
          <el-button type="text" v-if="scope.row.status == 'CREATE'" size="mini" @click="assignUser(scope.row.id)">分配任务</el-button>
          <router-link :to="'/inventory/invCounting/show/'+scope.row.id">
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
      <el-card class="operate-container" shadow="never">
        <el-form ref="dataForm" :model="invCounting" :rules="validateRules" label-width="110px" size="small" style="padding-right: 40px;">
          <el-row>
            <el-col :span="12">
              <el-form-item label="盘点原因" prop="reasonId">
                <el-select
                  v-model="invCounting.reasonId"
                  placeholder="请选择盘点原因" style="width: 90%;">
                  <el-option
                    v-for="item in reasonList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="选择库位" prop="wareIds">
                <el-cascader
                  v-model="invCounting.wareIds"
                  :options="wareList"
                  @change="queryDate"
                  style="width: 90%;"></el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划盘点时间" prop="planCountingTime">
                <el-date-picker style="width: 90%;"
                    v-model="invCounting.planCountingTime"
                    type="datetime"
                    placeholder="选择计划盘点时间"
                    value-format="yyyy-MM-dd HH:mm:ss" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="invCounting.remarks" style="width: 90%;"/>
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
        style="width: 100%;margin-top: 10px;"
        @selection-change="handleSelectionChange">

        <el-table-column
          type="selection"
          width="55" />

        <el-table-column
          label="序号"
          width="70"
          align="center">
          <template slot-scope="scope">
            {{ (page - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>

        <el-table-column prop="goodsInfo.name" label="货品名称" width="220"/>
        <el-table-column prop="goodsInfo.code" label="商品编码" width="100"/>
        <el-table-column prop="goodsInfo.barcode" label="商品条码" width="100"/>
        <el-table-column prop="goodsInfo.goodsTypeName" label="商品类型" width="110px"/>
        <el-table-column prop="totalCount" label="总库存"/>
        <el-table-column prop="lockCount" label="锁定库存"/>
        <el-table-column prop="availableCount" label="可用库存"/>
        <el-table-column prop="pickingCount" label="已拣未发货数量"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small" :disabled="$hasBP('btn.invCounting.add')  === false || $hasBP('btn.invCounting.update')  === false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分配任务" :visible.sync="dialogUserVisible" width="40%" >
      <el-form ref="assignUserForm" label-width="120px" size="small" style="padding-right: 40px;">
        <el-form-item label="任务执行人">
          <el-autocomplete
            v-model="invCountingTaskFormVo.countingUser"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            @select="handleSelect"
            class="inline-input"
            placeholder="搜索任务执行人"
            value-key="name"
            style="width: 100%;"
          />
          <span class="el-input__suffix">
            <span class="el-input__suffix-inner"><i class="el-input__icon el-icon-search"></i></span>
          </span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogUserVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="assignUserSave()" size="small" :disabled="$hasBP('btn.invCounting.assign')  === false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/inventory/invCounting'
import warehouseInfoApi from '@/api/base/warehouseInfo'
import dictApi from '@/api/base/dict'
import shipperInfoApi from '@/api/base/shipperInfo'
import inventoryInfoApi from '@/api/inventory/inventoryInfo'
import invCountingTaskApi from '@/api/inventory/invCountingTask'
const defaultForm = {
  id: '',
  invCountingNo: '',
  reasonId: '',
  planCountingTime: '',
  warehouseId: '',
  storeareaId: '',
  storeshelfId: '',
  countingUserId: '',
  countingUser: '',
  countingCompleteTime: '',
  remarks: '',
  invCountingItemList: []
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

      planCountingTimes: [],
      statusList: [
        {id: 0, name: '新建'},
        {id: 1, name: '待盘点'},
        {id: 2, name: '完成'}
      ],

      dialogVisible: false,
      invCounting: defaultForm,
      saveBtnDisabled: false,
      validateRules: {
        reasonId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        planCountingTime: [{ required: true, trigger: 'blur', message: '必须选择' }],
        wareIds: [{ required: true, trigger: 'blur', message: '必须选择' }],
      },

      reasonList: [],
      countingTypeList: [],
      dimensionList: [],
      wareList: [],

      inventoryInfoList: [],
      multipleSelection: [], // 批量选择中选择的记录列表

      dialogUserVisible: false,
      invCountingName: '',
      invCountingTaskFormVo: {
        invCountingId: null,
        countingUser: '',
        countingUserId:''
      }
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()

    dictApi.findByDictCode('Reason').then(response => {
      this.reasonList = response.data
    })
    dictApi.findByDictCode('CountingType').then(response => {
      this.countingTypeList = response.data
    })
    dictApi.findByDictCode('Dimension').then(response => {
      this.dimensionList = response.data
    })
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

      if(this.planCountingTimes && this.planCountingTimes.length ==2) {
        this.searchObj.planCountingTimeBegin = this.planCountingTimes[0]
        this.searchObj.planCountingTimeEnd = this.planCountingTimes[1]
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
    add(){
      this.dialogVisible = true
      this.invCounting = Object.assign({}, defaultForm)
    },

    edit(id) {
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    handleSelectionChange(selection) {
      debugger
      console.log('handleSelectionChange......')
      console.log(selection)
      if (selection.length > 0) {
        this.multipleSelection = selection
      }
    },

    saveOrUpdate() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          if (this.multipleSelection.length === 0) {
            this.$message.error('请选择要盘点的记录')
            return
          }
          // 遍历selection，将id取出放入id列表
          this.multipleSelection.forEach(item => {
            this.invCounting.invCountingItemList.push({
              goodsId: item.goodsId
            })
          })

          this.saveBtnDisabled = true // 防止表单重复提交
          if (!this.invCounting.id) {
            this.saveData()
          } else {
            this.updateData()
          }
        }
      })
    },

    // 新增
    saveData() {
      api.save(this.invCounting).then(response => {
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
      api.updateById(this.invCounting).then(response => {
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
        this.invCounting = response.data

        this.invCounting.wareIds = [this.invCounting.warehouseId, this.invCounting.storeareaId, this.invCounting.storeshelfId, this.invCounting.storehouseId]

        this.queryDate()
      })
    },

    //-------------
    querySearch(queryString, cb) {
      console.log(queryString)
      console.log(cb)

      shipperInfoApi.findByKeyword(queryString).then(response => {
        // 调用 callback 返回建议列表的数据
        cb(response.data)
      })
    },


    queryDate() {
      var that = this
      //50101：货品  50102：库位
      debugger

      this.invCounting.warehouseId = this.invCounting.wareIds[0]
      this.invCounting.storeareaId = this.invCounting.wareIds[1]
      this.invCounting.storeshelfId = this.invCounting.wareIds[2]
      this.invCounting.storehouseId = this.invCounting.wareIds[3]
      inventoryInfoApi.findByStorehouseId(this.invCounting.storehouseId).then(response => {
        that.inventoryInfoList = response.data

        that.invCounting.invCountingItemList.forEach(item => {
          that.inventoryInfoList.forEach(it => {
            if(item.goodsId == it.goodsId) {
              //that.$refs.table.toggleRowSelection(it);
              that.$nextTick(function() {
                that.$refs.table.toggleRowSelection(it, true);
              })
            }
          })
        })
      })
    },

    //----------
    assignUser(id) {
      this.dialogUserVisible = true
      this.invCountingTaskFormVo.invCountingId = id
    },

    querySearch(queryString, cb) {
      debugger
      console.log(queryString)
      console.log(cb)

      this.$API.user.findByKeyword(queryString).then(response => {
        // 调用 callback 返回建议列表的数据
        cb(response.data)
      })
    },
    handleSelect(item) {
      debugger
      this.invCountingTaskFormVo.countingUserId = item.id
      this.invCountingTaskFormVo.countingUser = item.name
    },

    assignUserSave() {
      invCountingTaskApi.assign(this.invCountingTaskFormVo).then(response => {
        this.dialogUserVisible = false
        this.fetchData(this.page)
        this.$message.success('操作成功')
      })
    }
  }
}
</script>


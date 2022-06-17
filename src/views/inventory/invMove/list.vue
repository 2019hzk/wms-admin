<template>
  <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="移库单号">
              <el-input type="text" placeholder="移库单号" v-model="searchObj.invMoveNo" style="width: 90%;"/>
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
            <el-form-item label="移库时间">
              <el-date-picker
                v-model="planMoveTimes"
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

      <el-table-column prop="invMoveNo" label="移库单号" width="140"/>
      <el-table-column prop="reasonName" label="移库原因" width="120"/>
      <el-table-column prop="planMoveTime" label="计划移库时间" width="160"/>
      <el-table-column prop="warehouseName" label="仓库" width="120"/>
      <el-table-column prop="storehouseName" label="库位" width="160"/>
      <el-table-column prop="statusName" label="状态" width="110"/>
      <el-table-column prop="createTime" label="创建时间" width="160"/>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status == 'CREATE'" size="mini" @click="edit(scope.row.id)">修改</el-button>
          <el-button type="text" v-if="scope.row.status == 'CREATE'" size="mini" @click="removeDataById(scope.row.id)" :disabled="$hasBP('btn.invMove.remove')  === false">删除</el-button>
          <el-button type="text" v-if="scope.row.status == 'CREATE'" size="mini" @click="assignUser(scope.row.id)">分配任务</el-button>
          <router-link :to="'/inventory/invMove/show/'+scope.row.id">
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
        <el-form ref="dataForm" :model="invMove" :rules="validateRules" label-width="110px" size="small" style="padding-right: 40px;">
          <el-row>
            <el-col :span="12">
              <el-form-item label="移库原因" prop="reasonId">
                <el-select
                  v-model="invMove.reasonId"
                  placeholder="请选择移库原因" style="width: 90%;">
                  <el-option
                    v-for="item in reasonList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="选择库位" prop="wareIds">
                <el-cascader
                  v-model="invMove.wareIds"
                  :options="wareList"
                  @change="queryDate"
                  style="width: 90%;"></el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划移库时间" prop="planMoveTime">
                <el-date-picker style="width: 90%;"
                                v-model="invMove.planMoveTime"
                                type="datetime"
                                placeholder="选择计划移库时间"
                                value-format="yyyy-MM-dd HH:mm:ss" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="invMove.remarks" style="width: 90%;"/>
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
        @selection-change="handleSelectionChange"
        @cell-click="cellclick">

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
        <el-table-column prop="goodsInfo.goodsTypeName" label="商品类型" width="100px"/>
<!--        <el-table-column prop="storehouseName" label="库位" width="130px"/>-->
        <el-table-column prop="totalCount" label="总库存"/>
        <el-table-column prop="lockCount" label="锁定库存"/>
        <el-table-column prop="pickingCount" label="已拣未发货数量"/>
        <el-table-column label="指定库位" width="350px;">
          <template slot-scope="scope">
            <el-cascader
              v-if="scope.row.isOK"
              v-model="scope.row.wareIds"
              :options="wareList"
              style="width: 100%;"></el-cascader>
            <span size="mini" v-else>不移库，不需指定</span>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small" :disabled="$hasBP('btn.invMove.add')  === false || $hasBP('btn.invMove.update')  === false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分配任务" :visible.sync="dialogUserVisible" width="40%" >
      <el-form ref="assignUserForm" label-width="120px" size="small" style="padding-right: 40px;">
        <el-form-item label="任务执行人">
          <el-autocomplete
            v-model="invMoveTaskFormVo.countingUser"
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
        <el-button type="primary" @click="assignUserSave()" size="small" :disabled="$hasBP('btn.invMove.assign')  === false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/inventory/invMove'
import warehouseInfoApi from '@/api/base/warehouseInfo'
import dictApi from '@/api/base/dict'
import shipperInfoApi from '@/api/base/shipperInfo'
import inventoryInfoApi from '@/api/inventory/inventoryInfo'
import invMoveTaskApi from '@/api/inventory/invMoveTask'
const defaultForm = {
  id: '',
  invMoveNo: '',
  reasonId: '',
  planMoveTime: '',
  warehouseId: '',
  storeareaId: '',
  storeshelfId: '',
  storehouseId: '',
  moveUserId: '',
  moveUser: '',
  moveCompleteTime: '',
  remarks: '',
  invMoveItemList: []
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

      planMoveTimes: [],
      statusList: [
        {id: 0, name: '新建'},
        {id: 1, name: '待转移'},
        {id: 2, name: '完成'}
      ],

      dialogVisible: false,
      invMove: defaultForm,
      saveBtnDisabled: false,
      validateRules: {
        reasonId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        planMoveTime: [{ required: true, trigger: 'blur', message: '必须选择' }],
        wareIds: [{ required: true, trigger: 'blur', message: '必须选择' }],
      },

      reasonList: [],
      countingTypeList: [],
      dimensionList: [],
      wareList: [],

      inventoryInfoList: [],
      multipleSelection: [], // 批量选择中选择的记录列表

      dialogUserVisible: false,
      invMoveName: '',
      invMoveTaskFormVo: {
        invMoveId: null,
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

      if(this.planMoveTimes && this.planMoveTimes.length ==2) {
        this.searchObj.planMoveTimeBegin = this.planMoveTimes[0]
        this.searchObj.planMoveTimeEnd = this.planMoveTimes[1]
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
      this.invMove = Object.assign({}, defaultForm)
    },

    edit(id) {
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    handleSelectionChange(selection) {
      debugger
      console.log('handleSelectionChange......')
      console.log(selection)
      this.multipleSelection = selection

      this.inventoryInfoList.forEach(row => {
        var isSelect = false
        this.multipleSelection.forEach(item => {
          if(row.id == item.id) {
            isSelect = true
          }
        })
        if(isSelect) {
          row.isOK = true
        } else {
          row.isOK = false
        }
      })
    },

    saveOrUpdate() {
      var that = this
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          if (that.multipleSelection.length === 0) {
            that.$message.error('请选择要移库的记录')
            return
          }
          // 遍历selection，将id取出放入id列表
          that.invMove.invMoveItemList = []
          var count = 0
          that.multipleSelection.forEach(item => {
            if(!item.wareIds || item.wareIds.length != 4) {
              count++
            } else {
              that.invMove.invMoveItemList.push({
                goodsId: item.goodsId,
                moveWarehouseId: item.wareIds[0],
                moveStoreareaId: item.wareIds[1],
                moveStoreshelfId: item.wareIds[2],
                moveStorehouseId: item.wareIds[3]
              })
            }
          })
          if(count > 0) {
            that.$message.error('请选择要移库的库位')
            return
          }

          that.saveBtnDisabled = true // 防止表单重复提交
          if (!that.invMove.id) {
            that.saveData()
          } else {
            that.updateData()
          }
        }
      })
    },

    // 新增
    saveData() {
      api.save(this.invMove).then(response => {
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
      api.updateById(this.invMove).then(response => {
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
        this.invMove = response.data

        this.invMove.wareIds = [this.invMove.warehouseId, this.invMove.storeareaId, this.invMove.storeshelfId, this.invMove.storehouseId]

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

      this.invMove.warehouseId = this.invMove.wareIds[0]
      this.invMove.storeareaId = this.invMove.wareIds[1]
      this.invMove.storeshelfId = this.invMove.wareIds[2]
      this.invMove.storehouseId = this.invMove.wareIds[3]
      inventoryInfoApi.findByStorehouseId(this.invMove.storehouseId).then(response => {
        that.inventoryInfoList = response.data

        that.invMove.invMoveItemList.forEach(item => {
          that.inventoryInfoList.forEach(it => {
            if(item.goodsId == it.goodsId) {
              //that.$refs.table.toggleRowSelection(it);
              it.wareIds = [item.moveWarehouseId, item.moveStoreareaId, item.moveStoreshelfId, item.moveStorehouseId]
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
      this.invMoveTaskFormVo.invMoveId = id
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
      this.invMoveTaskFormVo.moveUserId = item.id
      this.invMoveTaskFormVo.moveUser = item.name
    },

    assignUserSave() {
      invMoveTaskApi.assign(this.invMoveTaskFormVo).then(response => {
        this.dialogUserVisible = false
        this.fetchData(this.page)
        this.$message.success('操作成功')
      })
    }
  }
}
</script>


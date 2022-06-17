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
        </el-row>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="fetchData()">查询</el-button>
        <el-button type="default" size="mini" @click="resetData">清空</el-button>
      </el-form>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="add" >添 加</el-button>
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

      <el-table-column prop="name" label="名称"  width="300"/>
      <el-table-column prop="skuId" label="关联SKU" width="90"/>
      <el-table-column prop="code" label="商品编码" width="110"/>
      <el-table-column prop="barcode" label="商品条码" width="110"/>
      <el-table-column prop="goodsTypeName" label="商品类型" width="110"/>
      <el-table-column prop="brandName" label="品牌" />
      <el-table-column prop="saleAttr" label="货品的销售属性" width="160"/>
      <el-table-column prop="inspectTypeName" label="检验类型" width="110"/>
      <el-table-column prop="temperatureTypeName" label="温度类型" />
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          {{ scope.row.status == 0 ? '新建' : scope.row.status == 1 ? '启用' : '下线' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160"/>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status !== 1" size="mini" @click="edit(scope.row.id)">修改</el-button>
          <el-button type="text" v-if="scope.row.status !== 1" size="mini" @click="removeDataById(scope.row.id)" :disabled="$hasBP('btn.goodsInfo.remove')  === false">删除</el-button>
          <el-button type="text" v-if="scope.row.status !== 1" size="mini" @click="updateStatus(scope.row.id, 1)">启用</el-button>
          <el-button type="text" v-if="scope.row.status == 1" size="mini" @click="updateStatus(scope.row.id, -1)">下线</el-button>
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
      <el-form ref="dataForm" :model="goodsInfo" :rules="validateRules"  label-width="150px" size="small" style="padding-right: 40px;">
        <el-row>
          <el-col :span="12">
            <el-form-item label="货品名称" prop="name">
              <el-input v-model="goodsInfo.name" style="width: 75%;margin-right: 10px;" :readonly="true" placeholder="请选择添加"/>
              <el-button type="primary" size="mini" @click="showSkuData()">选择SKU</el-button>
            </el-form-item>
            <el-form-item label="商品编码" prop="code">
              <el-input v-model="goodsInfo.code"/>
            </el-form-item>
            <el-form-item label="商品类型" prop="goodsTypeId">
              <el-cascader
                v-model="goodsInfo.goodsTypeId"
                :options="goodsTypeList"
                style="width: 100%;"></el-cascader>
            </el-form-item>
            <el-form-item label="温度类型" prop="temperatureTypeId">
              <el-select
                v-model="goodsInfo.temperatureTypeId"
                placeholder="请选择检验类型" style="width: 100%;">
                <el-option
                  v-for="item in temperatureTypeList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="体积">
              <el-input v-model="goodsInfo.volume"/>
            </el-form-item>
            <el-form-item label="单位" prop="unitId">
              <el-select
                v-model="goodsInfo.unitId"
                placeholder="请选择单位" style="width: 100%;">
                <el-option
                  v-for="item in unitList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="拆零数量" prop="baseCount">
              <el-input v-model="goodsInfo.baseCount"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="条码" prop="barcode">
              <el-input v-model="goodsInfo.barcode"/>
            </el-form-item>
            <el-form-item label="品牌" prop="brandName">
              <el-input v-model="goodsInfo.brandName"/>
            </el-form-item>
            <el-form-item label="检验类型" prop="inspectTypeId">
              <el-select
                v-model="goodsInfo.inspectTypeId"
                placeholder="请选择检验类型" style="width: 100%;">
                <el-option
                  v-for="item in inspectTypeList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="货品的销售属性">
              <el-input v-model="goodsInfo.saleAttr"/>
            </el-form-item>
            <el-form-item label="重量">
              <el-input v-model="goodsInfo.weight"/>
            </el-form-item>
            <el-form-item label="拆零最小单位" prop="baseUnitId">
              <el-select
                v-model="goodsInfo.baseUnitId"
                placeholder="请选择单位" style="width: 100%;">
                <el-option
                  v-for="item in unitList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdate()" size="small" :disabled="$hasBP('btn.goodsInfo.add')  === false || $hasBP('btn.goodsInfo.update')  === false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="关联SKU" :visible.sync="skuDialogVisible" width="60%" >
      <el-table
        v-loading="listLoading"
        :data="skuList"
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
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>

        <el-table-column prop="id" label="SKU_ID" width="100"/>
        <el-table-column prop="skuName" label="名称" />
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
        :current-page="skuPage"
        :total="skuTotal"
        :page-size="limit"
        style="padding: 30px 0; text-align: center;"
        layout="sizes, prev, pager, next, jumper, ->, total, slot"
        @current-change="fetchSkuData"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="skuDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="selectSku()" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/base/goodsInfo'
import dictApi from '@/api/base/dict'
import goodsTypeApi from '@/api/base/goodsType'
import wareConfigApi from '@/api/base/wareConfig'
import axios from 'axios'
const defaultForm = {
  id: '',
  name: '',
  code: '',
  barcode: '',
  goodsTypeId: '',
  brandName: '',
  saleAttr: '',
  inspectTypeId: '',
  temperatureTypeId: '',
  volume: '',
  weight: '',
  unitId: '',
  baseUnitId: '',
  baseCount: '',
  skuId: '',
  status: 0
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

      goodsTypeIds: [],
      statusList: [
        {id: 0, name: '新建'},
        {id: 1, name: '启用'},
        {id: -1, name: '下线'}
      ],

      dialogVisible: false,
      goodsInfo: defaultForm,
      saveBtnDisabled: false,
      validateRules: {
        name: [{ required: true, trigger: 'blur', message: '必须输入' }],
        code: [{ required: true, trigger: 'blur', message: '必须输入' }],
        barcode: [{ required: true, trigger: 'blur', message: '必须输入' }],
        goodsTypeId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        inspectTypeId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        temperatureTypeId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        brandName: [{ required: true, trigger: 'blur', message: '必须输入' }],
        unitId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        baseUnitId: [{ required: true, trigger: 'blur', message: '必须选择' }],
        baseCount: [{ required: true, trigger: 'blur', message: '必须选择' }],
      },

      inspectTypeList: [],
      temperatureTypeList: [],
      unitList: [],
      goodsTypeList: [],

      skuTotal: 0, // 数据库中的总记录数
      skuPage: 1, // 默认页码
      multipleSelection: [],
      skuDialogVisible: false,
      skuList: [],

      relationUrl: null,
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
    dictApi.findByDictCode('Unit').then(response => {
      this.unitList = response.data
    })
    wareConfigApi.get().then(response => {
      this.relationUrl = response.data.relationUrl
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
      this.goodsInfo = Object.assign({}, defaultForm)
    },

    edit(id) {
      this.dialogVisible = true
      this.fetchDataById(id)
    },

    fetchDataById(id) {
      var that = this
      api.getById(id).then(response => {
        that.goodsInfo = response.data
        //that.goodsInfo.goodsTypeId = ['3', '10016', '100086']
        api.findGoodsTypeIdList(that.goodsInfo.goodsTypeId).then(response => {
          that.goodsInfo.goodsTypeId = response.data
          console.log(that.goodsInfo.goodsTypeId)
        })
      })  
    },

    saveOrUpdate() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.saveBtnDisabled = true // 防止表单重复提交
          if (!this.goodsInfo.id) {
            this.saveData()
          } else {
            this.updateData()
          }
        }
      })
    },

    // 新增
    saveData() {
      if(this.goodsInfo.goodsTypeId == null || this.goodsInfo.goodsTypeId.length < 3) {
        this.$message.warning('货品分类必须选择')
        return
      }
      this.goodsInfo.goodsTypeId = this.goodsInfo.goodsTypeId[2]
      api.save(this.goodsInfo).then(response => {
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
      if(this.goodsInfo.goodsTypeId == null || this.goodsInfo.goodsTypeId.length < 3) {
        this.$message.warning('货品分类必须选择')
        return
      }
      this.goodsInfo.goodsTypeId = this.goodsInfo.goodsTypeId[2]
      api.updateById(this.goodsInfo).then(response => {
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

    //sku-------------
    handleSelectionChange(selection) {
      debugger
      console.log('handleSelectionChange......')
      console.log(selection)
      if (selection.length > 0) {
        this.multipleSelection = selection
      }
    },

    showSkuData(id) {
      this.skuDialogVisible = true
      this.fetchSkuData(1)
    },

    fetchSkuData(skuPage = 1) {
      var that = this
      // 异步获取远程数据（ajax）
      this.skuPage = skuPage
      that.listLoading = true

      const url = this.relationUrl.replace('{page}', this.skuPage).replace('{pageSize}', this.limit)
      axios.get(url).then(function (response) {
        debugger
        that.skuList = response.data.data.records
        that.skuTotal = response.data.data.total

        that.listLoading = false
      });
    },

    selectSku() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          type: 'warning',
          message: '请选择一条记录!'
        })
        return
      }
      this.goodsInfo.name = this.multipleSelection[0].skuName
      this.goodsInfo.skuId = this.multipleSelection[0].id
      var goodsTypeId = 100000 + this.multipleSelection[0].category3Id

      api.findGoodsTypeIdList(goodsTypeId).then(response => {
        this.goodsInfo.goodsTypeId = response.data
        console.log(this.goodsInfo.goodsTypeId)
      })

      debugger
      this.skuDialogVisible = false
    },

    updateStatus(id, status) {
      api.updateStatus(id, status).then(response => {
        this.fetchData(this.page)
      })
    }
  }
}
</script>


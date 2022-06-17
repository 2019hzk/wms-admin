<template>
  <div class="app-container">

    <div class="el-toolbar">
      <div class="el-toolbar-body" style="justify-content: flex-start;">
      </div>
    </div>

    <el-table
      :data="list"
      :load="getChildrens"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      style="width: 100%"
      row-key="id"
      border
      lazy>

      <el-table-column label="名称" style="width:33%" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import api from '@/api/base/goodsType'

export default {

  // 定义数据
  data() {
    return {
      list: []
    }
  },

  // 当页面加载时获取数据
  created() {
    this.fetchData()
  },

  methods: {
    // 调用api层获取数据库中的数据
    fetchData() {
      console.log('加载列表')
      api.findByParentId(0).then(response => {
        this.list = response.data
        console.log(this.list)
        this.listLoading = false
      })
    },

    getChildrens(tree, treeNode, resolve) {
      debugger
      api.findByParentId(tree.id).then(response => {
        resolve(response.data)
      })
    }
  }
}
</script>

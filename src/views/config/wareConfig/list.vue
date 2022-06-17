<template>
  <div class="app-container">
    <div style="padding-bottom: 10px;font-weight:bold;">波次配置</div>
    <el-card class="operate-container" shadow="never">
      <el-form ref="flashPromotionForm" label-width="180px" size="small" style="padding-right: 40px;">

        <el-form-item label="波次维度">
          <el-radio-group v-model="wareConfig.dimension">
            <el-radio label="STORESHELF">货架</el-radio>
            <el-radio label="STOREHOUSE">库位</el-radio>
            <el-radio label="GOODS">商品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="波次间隔时间（分钟）">
          <el-input v-model="wareConfig.intervalTime"/>
        </el-form-item>
      </el-form>
    </el-card>

<!--    <div style="padding-bottom: 10px;font-weight:bold;">解锁库存配置</div>-->
<!--    <el-card class="operate-container" shadow="never">-->
<!--      <el-form ref="flashPromotionForm" label-width="180px" size="small" style="padding-right: 40px;">-->

<!--        <el-form-item label="解锁库存时间（分钟）">-->
<!--          <el-input v-model="wareConfig.unlockTime"/>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-card>-->

    <div style="padding-bottom: 10px;font-weight:bold;">关联SKU配置</div>
    <el-card class="operate-container" shadow="never">
      <el-form ref="flashPromotionForm" label-width="180px" size="small" style="padding-right: 40px;">

        <el-form-item label="关联SKU分页列表URL">
          <el-input v-model="wareConfig.relationUrl"/>
          <br/>
          说明：<br/>
          <span style="margin-left: 20px">1、URL格式必须包含分页参数，如：http://[域名或IP:端口]/[路径]/{page}/{pageSize}</span><br/>
          <span style="margin-left: 20px">2、分页返回数据对象：Result.ok(com.baomidou.mybatisplus.core.metadata.IPage)</span>
        </el-form-item>
      </el-form>
    </el-card>
    <br/>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="saveData()" size="small" :disabled="$hasBP('bnt.wareConfig.update')  === false">确 定</el-button>
    </span>
  </div>
</template>

<script>
import api from '@/api/base/wareConfig'

const defaultForm = {
  id: '1',
  intervalTime: 60,
  dimension: 'STORESHELF',
  unlockTime: 30,
  relationUrl: ''
}
export default {
  data() {
    return {
      wareConfig: defaultForm
    }
  },

  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchDataById()
  },

  // 生命周期函数：内存准备完毕，页面渲染成功
  mounted() {
    console.log('list mounted......')
  },

  methods: {
    fetchDataById() {
      api.get().then(response => {
        this.wareConfig = response.data
      })
    },
    // 新增
    saveData() {
      api.updateById(this.wareConfig).then(response => {
        this.$message.success('操作成功')
      })
    }
  }
}
</script>


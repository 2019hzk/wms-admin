<template>
  <div class="dashboard-container">
    <div style="align-items: center;padding: 10px 0;">
      <div style="float: left;font-weight:bold;">入库/出库统计</div>
      <div style="float: right;">
        <el-button-group>
          <el-button :type="weekType" plain size="mini" @click="selectTab('week')">本周</el-button>
          <el-button :type="monthType" plain size="mini" @click="selectTab('month')">本月</el-button>
          <el-button :type="yearType" plain size="mini" @click="selectTab('year')">全年</el-button>
        </el-button-group>
      </div>
      <div style="clear:both"></div>
    </div>

    <el-card class="operate-container" shadow="never">
      <div id="week" ref="chart" class="chart" style="height:500px;width:100%"></div>
    </el-card>



  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@/api/inventory/invStatistics'
export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  },

  data() {
    return {
      weekType: 'primary',
      monthType: '',
      yearType: '',

      type: 'week',

      xDate: [],
      yDate1: [],
      yDate2: []
    }
  },

  created() {
    this.fetchData('week')
  },

  mounted() {

    // this.setChartData('month')
    // this.setChartData('year')
  },

  methods: {
    selectTab(type) {
      this.type = type
      console.log(type)
      this.weekType = ''
      this.monthType = ''
      this.yearType = ''
      if(type == 'week') {
        this.weekType = 'primary'
      }
      if(type == 'month') {
        this.monthType = 'primary'
      }
      if(type == 'year') {
        this.yearType = 'primary'
      }
      this.fetchData(type)
    },

    fetchData(type) {
      api.getCount(type).then(response => {
        debugger
        this.xDate = response.data.xDate
        this.yDate1 = response.data.yDate1
        this.yDate2 = response.data.yDate2

        this.setChartData('week')
      })
    },

    setChartData(id){
      var myChart = this.$echarts.init(document.getElementById(id));
      // 指定图表的配置项和数据
      var option = {
        xAxis: {
          type: 'category',
          data: this.xDate
        },
        yAxis: {
          type: 'value'
        },
        legend: {
          data: ['入库', '出库']
        },
        series: [
          {
            name: '入库',
            data: this.yDate1,
            type: 'bar'
          },
          {
            name: '出库',
            data: this.yDate2,
            type: 'bar'
          }
        ]
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>

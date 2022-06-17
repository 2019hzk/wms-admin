/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/*
常量路由
需要被静态注册, 不需要进行用户权限的检查
*/
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  }
]

/*
所有需要权限的异步路由
某个登陆用户可能需要从中过滤出其中一部分动态注册
router.addRoutes(routes)
*/
export const asyncRoutes = [
  // 课程分类管理
  {
    path: '/base',
    component: Layout,
    redirect: '/dict/list',
    name: 'Base',
    meta: {
      title: '基础数据' ,
      icon: 'el-icon-set-up'
    },
    children: [
      {
        path: 'dict/list',
        name: 'Dict',
        component: () => import('@/views/base/dict/list'),
        meta: { title: '数据字典' }
      },
      {
        path: 'shipperInfo/list',
        name: 'ShipperInfo',
        component: () => import('@/views/base/shipperInfo/list'),
        meta: { title: '货主管理' }
      },
      {
        path: 'goodsType/list',
        name: 'GoodsType',
        component: () => import('@/views/base/goodsType/list'),
        meta: { title: '货品分类' }
      },
      {
        path: 'goodsInfo/list',
        name: 'GoodsInfo',
        component: () => import('@/views/base/goodsInfo/list'),
        meta: { title: '货品管理' }
      }
    ]
  },

  {
    path: '/ware',
    component: Layout,
    redirect: '/warehouseInfo/list',
    name: 'Ware',
    meta: {
      title: '储位管理' ,
      icon: 'el-icon-set-up'
    },
    children: [
      {
        path: 'warehouseInfo/list',
        name: 'WarehouseInfo',
        component: () => import('@/views/ware/warehouseInfo/list'),
        meta: { title: '仓库管理' }
      },
      {
        path: 'storeareaInfo/list',
        name: 'StoreareaInfo',
        component: () => import('@/views/ware/storeareaInfo/list'),
        meta: { title: '库区管理' }
      },
      {
        path: 'storeshelfInfo/list',
        name: 'StoreshelfInfo',
        component: () => import('@/views/ware/storeshelfInfo/list'),
        meta: { title: '货架管理' }
      },
      {
        path: 'storehouseInfo/list',
        name: 'StorehouseInfo',
        component: () => import('@/views/ware/storehouseInfo/list'),
        meta: { title: '库位管理' }
      }
    ]
  },

  {
    path: '/inbound',
    component: Layout,
    redirect: '/inOrder/list',
    name: 'Inbound',
    meta: {
      title: '入库管理' ,
      icon: 'el-icon-set-up'
    },
    children: [
      {
        path: 'inOrder/list',
        name: 'InOrder',
        component: () => import('@/views/inbound/inOrder/list'),
        meta: { title: '入库预约' }
      },
      {
        path: 'inApproveTask/list',
        name: 'InApproveTask',
        component: () => import('@/views/inbound/inApproveTask/list'),
        meta: { title: '入库审批' }
      },
      {
        path: 'inReceivingTask/list',
        name: 'InReceivingTask',
        component: () => import('@/views/inbound/inReceivingTask/list'),
        meta: { title: '收货任务' }
      },
      {
        path: 'inPutawayTask/list',
        name: 'InPutawayTask',
        component: () => import('@/views/inbound/inPutawayTask/list'),
        meta: { title: '上架任务' }
      },
      {
        path: 'inOrder/show/:id',
        name: 'InOrderShow',
        component: () => import('@/views/inbound/inOrder/show'),
        meta: { title: '入库单详情', noCache: true },
        hidden: true
      }
    ]
  },

  {
    path: '/inventory',
    component: Layout,
    redirect: '/inventoryInfo/list',
    name: 'Inventory',
    meta: {
      title: '库内管理' ,
      icon: 'el-icon-set-up'
    },
    children: [
      {
        path: 'inventoryInfo/list',
        name: 'InventoryInfo',
        component: () => import('@/views/inventory/inventoryInfo/list'),
        meta: { title: '实时库存' }
      },
      {
        path: 'invCounting/list',
        name: 'InvCounting',
        component: () => import('@/views/inventory/invCounting/list'),
        meta: { title: '库内盘点' }
      },
      {
        path: 'invCountingTask/list',
        name: 'InvCountingTask',
        component: () => import('@/views/inventory/invCountingTask/list'),
        meta: { title: '盘点任务' }
      },
      {
        path: 'invCounting/show/:id',
        name: 'InvCountingShow',
        component: () => import('@/views/inventory/invCounting/show'),
        meta: { title: '盘点单详情', noCache: true },
        hidden: true
      },

      {
        path: 'invMove/list',
        name: 'InvMove',
        component: () => import('@/views/inventory/invMove/list'),
        meta: { title: '移库管理' }
      },
      {
        path: 'invMoveTask/list',
        name: 'InvMoveTask',
        component: () => import('@/views/inventory/invMoveTask/list'),
        meta: { title: '移库任务' }
      },
      {
        path: 'invMove/show/:id',
        name: 'InvMoveShow',
        component: () => import('@/views/inventory/invMove/show'),
        meta: { title: '移库详情', noCache: true },
        hidden: true
      }
    ]
  },

  {
    path: '/outbound',
    component: Layout,
    redirect: '/inOrder/list',
    name: 'Outbound',
    meta: {
      title: '出库管理' ,
      icon: 'el-icon-set-up'
    },
    children: [
      {
        path: 'outOrder/list',
        name: 'OutOrder',
        component: () => import('@/views/outbound/outOrder/list'),
        meta: { title: '出库单管理' }
      },
      {
        path: 'outOrder/show/:id',
        name: 'OutOrderShow',
        component: () => import('@/views/outbound/outOrder/show'),
        meta: { title: '出库单详情', noCache: true },
        hidden: true
      },
      {
        path: 'outPickingTask/list',
        name: 'OutPickingTask',
        component: () => import('@/views/outbound/outPickingTask/list'),
        meta: { title: '拣货任务' }
      },
      {
        path: 'outDeliverTask/list',
        name: 'OutDeliverTask',
        component: () => import('@/views/outbound/outDeliverTask/list'),
        meta: { title: '发货任务' }
      }
    ]
  },

  {
    path: '/config',
    component: Layout,
    redirect: '/wareConfig/list',
    name: 'Config',
    meta: {
      title: '配置管理' ,
      icon: 'el-icon-set-up'
    },
    alwaysShow: true,
    children: [
      {
        path: 'wareConfig/list',
        name: 'WareConfig',
        component: () => import('@/views/config/wareConfig/list'),
        meta: { title: '配置列表' }
      }
    ]
  },

  /* 权限管理 */
  {
    name: 'Acl',
    path: '/acl',
    component: Layout,
    redirect: '/acl/admin/list',
    meta: {
      title: '权限管理',
      icon: 'el-icon-lock'
    },
    children: [
      {
        name: 'User',
        path: 'admin/list',
        component: () => import('@/views/acl/admin/list'),
        meta: {
          title: '用户管理',
        },
      },
      {
        name: 'Role',
        path: 'role/list',
        component: () => import('@/views/acl/role/list'),
        meta: {
          title: '角色管理',
        },
      },
      {
        name: 'RoleAuth',
        path: 'role/auth/:id',
        component: () => import('@/views/acl/role/roleAuth'),
        meta: {
          activeMenu: '/acl/role/list',
          title: '角色授权',
        },
        hidden: true,
      },
      {
        name: 'Permission',
        path: 'permission/list',
        component: () => import('@/views/acl/permission/list'),
        meta: {
          title: '菜单管理',
        },
      },
    ]
  }
]

/*
必须在最后被动态注册
*/
export const anyRoute = { path: '*', redirect: '/404', hidden: true }

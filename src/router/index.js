import Vue from 'vue'
import Router from 'vue-router'
import Store from '@/store'
import Axios from 'axios'


import Dashboard from '@/components/Dashboard'
import Login from '@/components/Login'
import Employees from '@/components/Employees'
import Orders from '@/components/Orders'
import Products from '@/components/Products'
import MyAccount from '@/components/MyAccount' 
import Tools from '@/components/Tools'
import BulkImporter from '@/components/Tools/BulkImporter'

Vue.use(Router)

const router = new Router({
  // all require auth by default
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Dashboard
    },
    {
      path: '/Dashboard',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login,
      meta: {public: true}
    },
    {
      path: '/Employees',
      name: 'Employees',
      component: Employees,
    },
    {
      path: '/Orders',
      name: 'Orders',
      component: Orders,
    },
    {
      path: '/Products',
      name: 'Products',
      component: Products,
    },
    {
      path: '/MyAccount',
      name: 'MyAccount',
      component: MyAccount,
    },
    {
      path: '/Tools',
      name: 'Tools',
      component: Tools,
    },
    {
      path: '/Tools/BulkImporter',
      name: 'BulkImporter',
      component: BulkImporter,
    }
  ]
})

router.beforeEach( (to,from,next) => {
  if (to.matched.some( r => !r.meta.public)) {  // if the path is not specified as public
    const token = localStorage.getItem('jwt');
    if (token == null) {  // ensure that the user is logged in
      next({ path: '/login', params: {nextUrl: to.fullPath}})  // if they are not, forward them to the login page
    } else {
      // Validate jwt and store loggedInUser
      if (!Store.state.loggedInEmployee) {
        Axios.get(
          `/api/Employee/GetLoggedInEmployee`,{ headers: {Authorization: `Bearer ${token}`}})
        .then( res => {
          Store.commit("auth_success", res.data );
        })
        .catch( err => {
          Store.commit("clear_login");
          next({ path: '/login', params: {nextUrl: to.fullPath}})
        })
      }
      next();
    }
  } else {
    next();
  }
})

export default router;

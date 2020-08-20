// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Axios from 'axios'
import store from './store'
import '@progress/kendo-theme-bootstrap/dist/all.css'
import '@progress/kendo-ui'
import { Grid, GridInstaller } from '@progress/kendo-grid-vue-wrapper'
import { DropDownList, DropdownsInstaller } from '@progress/kendo-dropdowns-vue-wrapper'
import { NumericTextBox, InputsInstaller } from '@progress/kendo-inputs-vue-wrapper'
import { Dialog, DialogActionsBar } from '@progress/kendo-vue-dialogs';



Vue.prototype.$http = Axios;

Vue.config.productionTip = false;

Vue.component('k-dialog', Dialog);
Vue.component('dialog-actions-bar', DialogActionsBar);

Vue.use(GridInstaller);
Vue.use(DropdownsInstaller);
Vue.use(InputsInstaller);

new Vue({
  el: '#app',
  router,
  components: { 
    App, 
    Grid,
    DropDownList,
    NumericTextBox,
    Dialog },
  store,
  template: '<App />'
})

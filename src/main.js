// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Axios from 'axios'
import store from './store'
import '@progress/kendo-theme-bootstrap/dist/all.css'
import '@progress/kendo-ui'
import { Grid } from '@progress/kendo-vue-grid'
import { DropDownList, DropdownsInstaller } from '@progress/kendo-dropdowns-vue-wrapper'
import { NumericTextBox, InputsInstaller } from '@progress/kendo-inputs-vue-wrapper'
import { Dialog, DialogActionsBar } from '@progress/kendo-vue-dialogs';
import Vuelidate from 'vuelidate';
import { DataSource, DataSourceInstaller } from '@progress/kendo-datasource-vue-wrapper'
import { Button,
  ButtonsInstaller } from '@progress/kendo-buttons-vue-wrapper'
import notify from "@/Shared/notify"

Vue.prototype.$http = Axios;
Vue.prototype.kendo = window.kendo;

window.sb = {}
window.sb.notify = notify;

Vue.config.productionTip = false;

Vue.component('k-dialog', Dialog);
Vue.component('dialog-actions-bar', DialogActionsBar);
Vue.component('Grid', Grid);

Vue.use(Vuelidate);
Vue.use(DropdownsInstaller);
Vue.use(InputsInstaller);
Vue.use(DataSourceInstaller);
Vue.use(ButtonsInstaller)

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

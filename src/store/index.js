import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedInEmployee: null,
    employees: []
  },
  mutations: {
    auth_success(state, employee) {
      state.loggedInEmployee = employee;
      localStorage.setItem('jwt', employee.token)
      Axios.defaults.headers.common['Authorization'] = 'Bearer ' + employee.token; 
    },
    clear_login (state) {
      localStorage.removeItem('jwt');
      state.loggedInEmployee = null;
    },
    put_employees (state, employees) {
      state.employees = [...employees];
    }
  },
  actions: {
    login( {commit}, credentials) {
      return new Promise( (resolve, reject) => {
        Axios.post('/api/Employee/Authenticate', { Username: credentials.username, Password: credentials.password})
        .then( res => {
          const employee = res.data;
          commit("auth_success", employee )
          resolve( res )
        })
        .catch( () => {
          commit('clear_login')
          reject();
        })
      })
    },
    getEmployees ( {commit} ) {
      return new Promise( (resolve, reject) => {
        Axios.get('/api/Employee/GetEmployees')
        .then( res => {
          commit('put_employees',res.data);
          resolve();
        })
        .catch( () => {
          reject()
        })
      })
    }
  },
  modules: {
  }
})

import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedInEmployee: null,
    entities: {
      employees: {
        friendlyName: "Employees",
        data: [],
        lastUpdated: null,
        getAction: "getEmployees"
      },
      departments: {
        friendlyName: "Departments",
        data: [],
        lastUpdated: null,
        getAction: "getDepartments"
      },
      roles: {
        friendlyName: "Roles",
        data: [],
        lastUpdated: null,
        getAction: "getRoles"
      }
    },
    employees: [],
    modal: {
      show: false,
      settings: { callback: function() {return}}  // Defaults are set by close_modal onMount
    },
    entityExplorer: {show: false}
  },
  mutations: {
    auth_success(state, employee) {
      state.loggedInEmployee = employee;
      localStorage.setItem('jwt', employee.token)
      Axios.defaults.headers.common['Authorization'] = 'Bearer ' + employee.token; 
    },
    clear_login (state) {
      localStorage.removeItem('jwt');
      delete Axios.defaults.headers.common['Authorization']
      state.loggedInEmployee = null;
      for (let entity in state.entities) {
        state.entities[entity].data = [];
      }
    },
    put_employees (state, employees) {
      state.entities.employees.data = [...employees];
      state.entities.employees.lastUpdated = Date.now();
    },
    put_departments (state, departments) {
      state.entities.departments.data = [...departments];
      state.entities.departments.lastUpdated = Date.now();
    },
    put_roles (state, roles) {
      state.entities.roles.data = [...roles];
      state.entities.roles.lastUpdated = Date.now();
    },
    notify (state, settings) {
      
      const currentSettingsCopy = {...state.modal.settings}
      for ( var setting in settings) {
        currentSettingsCopy[setting] = settings[setting];
      }
      state.modal.settings = currentSettingsCopy;
      state.modal.show = true;
    },
    close_modal (state) {
        state.modal.show = false;
        
        // Make the callback before resetting the settings
        state.modal.settings.callback();

        const settings = {
        message: '',
        affirmText: 'OK',
        width: 800,
        headerText: '',
        callback: function() { return }
      }

      state.modal.settings = settings;
    },
    close_entity_explorer (state) {
      state.entityExplorer.show = false;
    },
    open_entity_explorer (state) {
      state.entityExplorer.show = true;
    }
  },
  actions: {
    login( {commit}, credentials) {
      return new Promise( (resolve, reject) => {
        Axios.post('/api/Employee/Authenticate', { Username: credentials.username, Password: credentials.password})
        .then( res => {
          const employee = res.data.data;
          commit("auth_success", employee )
          resolve( res )
        })
        .catch( err => {
          commit('clear_login')
          reject( err.response );
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
        .catch( (err) => {
          sb.notify.toast("There was an error fetching the Employees from the database.",2000,"F");
          reject();
        })
      })
    },
    getDepartments ( {commit} ) {
      return new Promise( (resolve, reject) => {
        Axios.get('/api/Employee/GetEmployeeDepartments')
        .then( res => {
          commit('put_departments',res.data);
          resolve();
        })
        .catch( () => {
          sb.notify.toast("There was an error fetching the Departments from the database.",2000,"F");
          reject()
        })
      })
    },
    getRoles ( {commit} ) {
      return new Promise( (resolve, reject) => {
        Axios.get('/api/Employee/GetEmployeeRoles')
        .then( res => {
          commit('put_roles',res.data);
          resolve();
        })
        .catch( () => {
          sb.notify.toast("There was an error fetching the Roles from the database.",2000,"F");
          reject()
        })
      })
    },
    upsertEmployees({ commit }, employees) {
      return new Promise((resolve, reject) => {
        Axios.post("/api/Employee/UpsertEmployees",employees)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err.response);
          })
      })
    },
    upsertRoles({ commit }, roles) {
      return new Promise((resolve, reject) => {
        Axios.post("/api/Employee/UpsertRoles",roles)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err.response);
          })
      })
    },
    upsertDepartments({ commit }, departments) {
      return new Promise((resolve, reject) => {
        Axios.post("/api/Employee/UpsertDepartments",departments)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err.response);
          })
      })
    }
  },
  modules: {
  }
})

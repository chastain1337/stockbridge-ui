import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedInEmployee: null,
    employees: [],
    modal: {
      show: false,
      settings: { callback: function() {return}}  // Defaults are set by close_modal onMount
    }
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
    },
    /**
     * Creates a modal of the type you specify in the settings section.
     * @param {Object} settings - The settings object. Will default to whatever the last modal called was.
     * @param {String} settings.message - Required: the message of the modal.
     * @param {String} settings.affirmText - Default: "OK" The button text to confirm / close the modal.
     * @param {Number} settings.width - Defaults to 800. Do not include 'px'
     * @param {String} settings.headerText - Default: none. Empty string results in no header at all.
     * @param {Function} settings.callback - Default: return. The function to be called after the modal is closed. Really should only use if you need to open another modal right after
     */
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

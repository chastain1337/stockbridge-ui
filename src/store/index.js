import Vue from "vue";
import Vuex from "vuex";
import Axios from "axios";
import sbHttp from "@/Shared/sbHttp";

class UpdateEntitiesSettings {
  /**
   * The payload passed in to the updateEntity mutation.
   * @param {String} _entityKey - The key of the entity. Used in store.state[key].*
   * @param {Array} _newEntities - The array of new entities to add/update the store.
   * @param {Boolean} _totalOverwrite - Default true. Setting to false will merge the two entites so that those in the newEntities array will overwrite those in the current state where the "id" field matches.
   */
  constructor(_entityKey, _newEntities, _totalOverwrite=true) {
    this.entityKey = _entityKey
    this.newEntities = _newEntities
    this.totalOverwrite = _totalOverwrite
  }
}

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loggedInEmployee: null,
    entities: {
      employees: {
        friendlyName: "Employees",
        data: [],
        lastUpdated: null,
        getAction: "getEmployees",
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
      settings: {
        callback: function() {
          return;
        }
      } // Defaults are set by close_modal onMount
    },
    entityExplorer: { show: false }
  },
  mutations: {
    auth_success(state, employee) {
      state.loggedInEmployee = employee;
      localStorage.setItem("jwt", employee.token);
      Axios.defaults.headers.common["Authorization"] =
        "Bearer " + employee.token;
    },
    clear_login(state) {
      localStorage.removeItem("jwt");
      delete Axios.defaults.headers.common["Authorization"];
      state.loggedInEmployee = null;
      for (let entity in state.entities) {
        state.entities[entity].data = [];
      }
    },
    updateEntity(state, {entityKey,newEntities,totalOverwrite}) {
      console.log(entityKey,newEntities,totalOverwrite)
      state.entities[entityKey].lastUpdated = Date.now();
      if (totalOverwrite) {
        state.entities[entityKey].data = [...newEntities];
      } else {
        state.entities[entityKey].data = _.unionBy(
          [...newEntities],
          [...state.entities[entityKey].data],
          "id"
        );
      }
    },
    put_departments(state, departments) {
      state.entities.departments.data = [...departments];
      state.entities.departments.lastUpdated = Date.now();
    },
    put_roles(state, roles) {
      state.entities.roles.data = [...roles];
      state.entities.roles.lastUpdated = Date.now();
    },
    notify(state, settings) {
      const currentSettingsCopy = { ...state.modal.settings };
      for (var setting in settings) {
        currentSettingsCopy[setting] = settings[setting];
      }
      state.modal.settings = currentSettingsCopy;
      state.modal.show = true;
    },
    close_modal(state) {
      state.modal.show = false;

      // Make the callback before resetting the settings
      state.modal.settings.callback();

      const settings = {
        message: "",
        affirmText: "OK",
        width: 800,
        headerText: "",
        callback: function() {
          return;
        }
      };

      state.modal.settings = settings;
    },
    close_entity_explorer(state) {
      state.entityExplorer.show = false;
    },
    open_entity_explorer(state) {
      state.entityExplorer.show = true;
    }
  },
  actions: {
    login({ commit }, credentials) {
      const data = {
        Username: credentials.username,
        Password: credentials.password
      };
      return new Promise(resolve => {
        sbHttp
          .post_notify("/api/Employee/Authenticate", data, null, "!errs!")
          .then(res => {
            if (res.success) {
              const employee = res.data;
              commit("auth_success", employee);
            } else {
              commit("clear_login");
            }
            resolve(res.success);
          });
      });
    },
    getEmployees({ commit }) {
      const totalOverwrite = this.state.entities.employees.lastUpdated
        ? false
        : true;
      const dateToSend = kendo.toString(
        new Date(this.state.entities.employees.lastUpdated),
        "s"
      );
      return new Promise(resolve => {
        sbHttp
          .get_notify(
            `/api/Employee/GetEmployees${
              totalOverwrite ? "" : "/?modifiedAfter=" + dateToSend
            }`,
            null,
            "There was an error fetching the Employees from the database."
          )
          .then(res => {
            if (res.success) {
              commit("updateEntity",new UpdateEntitiesSettings("employees",res.data,totalOverwrite));
            }
            resolve();
          });
      });
    },
    getDepartments({ commit }) {
      return new Promise(resolve => {
        sbHttp
          .get_notify(
            "/api/Employee/GetEmployeeDepartments",
            null,
            "There was an error fetching the Departments from the database."
          )
          .then(res => {
            if (res.success) {
              commit("put_departments", res.data);
            }
            resolve();
          });
      });
    },
    getRoles({ commit }) {
      return new Promise(resolve => {
        sbHttp
          .get_notify(
            "/api/Employee/GetEmployeeRoles",
            null,
            "There was an error fetching the Roles from the database."
          )
          .then(res => {
            if (res.success) {
              commit("put_roles", res.data);
            }
            resolve();
          });
      });
    },
    upsertEmployees({ commit }, employees) {
      return new Promise(resolve => {
        sbHttp
          .post_notify(
            "/api/Employee/UpsertEmployees",
            employees,
            "Employee(s) updated!"
          )
          .then(() => resolve());
      });
    },
    upsertRoles({ commit }, roles) {
      return new Promise(resolve => {
        sbHttp
          .post_notify("/api/Employee/UpsertRoles", roles, "Role(s) updated!")
          .then(resolve());
      });
    },
    upsertDepartments({ commit }, departments) {
      return new Promise(resolve => {
        sbHttp
          .post_notify(
            "/api/Employee/UpsertDepartments",
            departments,
            "Department(s) updated!"
          )
          .then(resolve());
      });
    }
  },
  modules: {}
});

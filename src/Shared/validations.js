import { required,
    minLength, 
    alpha,
    email,
    between,
    numeric,
    decimal,
    integer,
    minValue } from "vuelidate/lib/validators";

import store from "@/store"

const isBool = v => ["TRUE","FALSE"].includes(v.toUpperCase())

export default {
  employeeValidations: {
    firstName: {
        required,
        minLength: minLength(2),
        alpha
    },
    lastName: {
        required,
        minLength: minLength(2),
        alpha
    },
    userName: {
        required,
        minLength: minLength(3),
    },
    password: {
        required,
        minLength: minLength(5),
    },
    email: {
        required,
        email,
        minLength: minLength(19),
    },
    startDate: {
        required,
        withinRange: value => Date.parse(value) >= Date.parse("1920-08-06") && Date.parse(value) <= Date.now()
    },
    role: {
        required,
        validRole: value => store.state.entities.roles.data.findIndex( d => d.name === value) > -1
    },
    department: {
        required,
        validDepartment: value => store.state.entities.departments.data.findIndex( d => d.name === value) > -1
    },
    availableVacationHours: {
        integer, 
        between: between(0,120)},
    baseRate: {
        required,
        decimal,
        minValue: minValue(7.5)
    },
    terminated: {
        required,
        isBool
    }
  },
  roleValidations: {
      name: {
          isUnique: value => store.state.entities.roles.data.findIndex( r => r.name === value) === -1
      }
  },
  departmentValidations: {
    name: {
        isUnique: value => store.state.entities.departments.data.findIndex( d => d.name === value) === -1
    }
}
};

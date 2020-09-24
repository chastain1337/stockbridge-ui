import {
  required,
  minLength,
  alpha,
  email,
  between,
  numeric,
  decimal,
  integer,
  minValue,
  maxLength
} from "vuelidate/lib/validators";

import store from "@/store";

const isNullableBool = v => v === null || ["TRUE", "FALSE",""].includes(v.toUpperCase());
const isBool = v => ["TRUE", "FALSE"].includes(v.toUpperCase());
const validDepartment = v => v === null || v === "" || store.state.entities.departments.data.findIndex(d => d.name === v) > -1
const validRole = v => v === null || v === "" || store.state.entities.roles.data.findIndex(d => d.name === v) > -1
const validVendor = v => v === null || v === "" || store.state.entities.vendors.data.findIndex(d => d.code === v) > -1
const validOrderingMethod = v => v === null || v === "" || store.state.entities.orderingMethods.data.findIndex(d => d.methodName === v) > -1
const validLocation = v => v === null || v === "" || store.state.entities.locations.data.findIndex(d => d.name === v) > -1



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
      minLength: minLength(3)
    },
    password: {
      required,
      minLength: minLength(5)
    },
    email: {
      required,
      email,
      minLength: minLength(19)
    },
    startDate: {
      required,
      withinRange: value =>
        Date.parse(value) >= Date.parse("1920-08-06") &&
        Date.parse(value) <= Date.now()
    },
    role: {
      required,
      validRole
    },
    department: {
      required,
      validDepartment
    },
    availableVacationHours: {
      integer,
      between: between(0, 120)
    },
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
      isUnique: value =>
        store.state.entities.roles.data.findIndex(r => r.name === value) === -1
    }
  },
  departmentValidations: {
    name: {
      isUnique: value =>
        store.state.entities.departments.data.findIndex(
          d => d.name === value
        ) === -1
    }
  },
    productValidations: {
        sku: { maxLength: maxLength(15), required},
        description: { required },
        partNumber: { required },
        orderingPartNumber: { required },
        primaryVendor: {validVendor},
        secondaryVendor: {validVendor},
        lastUnitCost: { required },
        location: { required, validLocation },
        casePack: {required},
        length_IN: {decimal},
        width_IN: {decimal},
        height_IN: {decimal},
        weight_OZ: {decimal},
        minimum: {integer, required},
        maximum: {integer, required},
        shelfCount: {integer, required},
    },
    orderingMethodValidations: {
        methodName: { required },
    },
    locationValidations: {
        quickPick: { integer },
        aisle: { integer },
        section: {alpha, maxLength: maxLength(2) },
        shelf: {integer},
        name: {required},
        customName: {maxLength: maxLength(50)}
    },
    vendorValidations: {
        code: {maxLength: maxLength(5), required},
        name: {maxLength: maxLength(50)},
        orderingMin: {decimal},
        orderingMethod: { validOrderingMethod, required},
        email: {email},
        accountNumber: {},
        phoneNumber: {},
        willDropShipForUs: {isNullableBool},
        willChargeFreightForDropShip: {isNullableBool},
        willChargeFreightForOrders: {isNullableBool},
        leadTimeBusinessDays: {integer},
        useAutoOrdering: {required, isBool},
    }
};

import { required,
    minLength, 
    alpha,
    email,
    between,
    numeric,
    decimal,
    integer,
    minValue } from "vuelidate/lib/validators";

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
        required
    },
    availableVacationHours: {
        integer, 
        between: between(0,120)},
    baseRate: {
        required,
        decimal,
        minValue: minValue(7.5)
    }
  }
};

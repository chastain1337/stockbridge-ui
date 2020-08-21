import { required, minLength } from "vuelidate/lib/validators";

export default {
  employeeValidations: {
    firstName: {
        required,
        minLength: minLength(5)
    },
    lastName: {
        required
    },
    userName: {
        required
    },
    password: {
        required
    },
    email: {
        required
    },
    startDate: {
        required
    },
    role: {
        required
    },
    availableVacationHours: {},
    baseRate: {
        required
    }
  }
};

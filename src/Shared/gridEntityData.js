export default {

    employees: {
        fields: {
            id: { friendlyName: "ID"},
            firstName: { friendlyName: "First Name"},
            lastName: { friendlyName: "Last Name"},
            userName: { friendlyName: "Username"},
            password: { friendlyName: "Password"},
            email: { friendlyName: "Email"},
            startDate: { friendlyName: "Start Date"},
            availableVacationHours: { friendlyName: "Vacation Hours"},
            baseRate: { friendlyName: "Rate"},
            role: { friendlyName: "Role" },
            department: {friendlyName: "Department"},
            terminated: { friendlyName: "Terminated"}
        },
    },
    roles: {
        fields: {
            id: {friendlyName: "ID"},
            name: {friendlyName: "Role Name"}
        },
    },
    departments: {
        fields: {
            id: {friendlyName: "ID"},
            name: {friendlyName: "Department Name"},
        },
    }
}
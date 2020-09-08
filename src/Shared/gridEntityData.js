const employeeRoleEditor = `
<select>
    <option>Employee</option>
    <option>Manager</option>
    <option>Owner</option>
</select>
`

export default {

    employees: {
        id: { friendlyName: "ID"},
        firstName: { friendlyName: "First Name"},
        lastName: { friendlyName: "Last Name"},
        userName: { friendlyName: "Username"},
        password: { friendlyName: "Password"},
        email: { friendlyName: "Email"},
        startDate: { friendlyName: "Start Date"},
        role: { friendlyName: "Role", editor: employeeRoleEditor },
        availableVacationHours: { friendlyName: "Vacation Hours"},
        baseRate: { friendlyName: "Rate"},
    }
}

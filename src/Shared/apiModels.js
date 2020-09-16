import gridEntityData from "./gridEntityData.js";

const employeeFields = gridEntityData.employees.fields
const roleFields = gridEntityData.roles.fields
const departmentFields = gridEntityData.departments.fields

class UpsertEmployeeRequest {
    /**
     * @param {employeeFields} employee - Employee model from GridEntityData
     */
    constructor(employee) {
        this.ID = null
        this.DepartmentName = employee.department
        this.RoleName = employee.role
        this.Password = employee.password
        this.FirstName = employee.firstName
        this.LastName = employee.lastName
        this.UserName = employee.userName
        this.Email = employee.email
        this.StartDate = kendo.toString(new Date(Date.parse(employee.startDate)),"yyyy-MM-dd")
        this.AvailableVacationHours = Number(employee.availableVacationHours)
        this.BaseRate = Number(employee.baseRate)
        this.TerminatedFlag = employee.terminated.toUpperCase === "TRUE"
    }
}

class UpsertRoleRequest {
    /**
     * @param {roleFields} role
     */
    constructor(role) {
        this.ID = null
        this.name = role.name
    }
}

class UpsertDepartmentRequest {
    /**
     * @param {departmentFields} department 
     */
    constructor(department) {
        this.ID = null
        this.name = department.name
    }
}

export default {
    UpsertEmployeeRequest,
    UpsertRoleRequest,
    UpsertDepartmentRequest
}
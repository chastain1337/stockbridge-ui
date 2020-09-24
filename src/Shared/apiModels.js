import gridEntityData from "./gridEntityData.js";

const employeeFields = gridEntityData.employees.fields
const roleFields = gridEntityData.roles.fields
const departmentFields = gridEntityData.departments.fields
const locationFields = gridEntityData.locations.fields
const orderingMethodFields = gridEntityData.orderingMethods.fields
const vendorFields = gridEntityData.vendors.fields
const productFields = gridEntityData.products.fields
const genericCustomFieldFields = gridEntityData.genericCustomField.fields

function nullableBool(value) {

    return value === null || value === "" ? null : value.toUpperCase() === "TRUE"
}

function makeBool(value) {
    return value.toUpperCase() === "TRUE"
}

function nullableNumber(value) {
    return value === null || value === "" ? null : Number(value);
}

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
        this.TerminatedFlag = makeBool(employee.terminated)
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

class UpsertLocationRequest {
    /**
     * @param {locationFields} location
     */
    constructor(location) {
        this.ID = location.id
        this.QuickPick = nullableNumber(location.quickPick)
        this.Aisle = nullableNumber(location.aisle)
        this.Section = location.section
        this.Shelf = nullableNumber(location.shelf)
        this.Name = location.name
        this.CustomName = location.customName
    }
}

class UpsertOrderingMethodRequest {

    /**
     * @param {orderingMethodFields} orderingMethod
     */
    constructor(orderingMethod) {
        this.ID = orderingMethod.id
        this.MethodName = orderingMethod.methodName
    }
}

class UpsertVendorRequest {

    /**
     * 
     * @param {vendorFields} vendor 
     * * @param {[GenericCustomField]} customFields
     */
    constructor(vendor,customFields) {
        this.ID = vendor.id
        this.Code = vendor.code
        this.Name = vendor.name
        this.OrderingMin = Number(vendor.orderingMin)
        this.OrderingMethodName = vendor.orderingMethod
        this.Email = vendor.email
        this.AccountNumber = vendor.accountNumber
        this.PhoneNumber = vendor.phoneNumber
        this.WillDropShipForUs = nullableBool(vendor.willDropShipForUs)
        this.WillChargeFreightForDropShip = nullableBool(vendor.willChargeFreightForDropShip)
        this.WillChargeFreightForOrders = nullableBool(vendor.willChargeFreightForOrders)
        this.LeadTimeBusinessDays = nullableNumber(vendor.leadTimeBusinessDays)
        this.UseAutoOrdering = makeBool(vendor.useAutoOrdering)
        this.CustomFields = customFields
    }
}

class UpsertProductRequest {
    
    /**
     * 
     * @param {productFields} product 
     * @param {[GenericCustomField]} customFields
     */
    constructor(product,customFields) {
        this.ID = product.id
        this.SKU = product.sku
        this.Description = product.description
        this.PartNumber = product.partNumber
        this.OrderingPartNumber = product.orderingPartNumber
        this.PrimaryVendorCode = product.primaryVendor
        this.SecondaryVendorCode = product.secondaryVendor
        this.LastUnitCost = Number(product.lastUnitCost)
        this.LocationName = product.location
        this.CasePack = Number(product.casePack)
        this.Length_IN = nullableNumber(product.length_IN)
        this.Width_IN = nullableNumber(product.width_IN)
        this.Height_IN = nullableNumber(product.height_IN)
        this.Weight_OZ = nullableNumber(product.weight_OZ)
        this.Minimum = nullableNumber(product.minimum)
        this.Maximum = nullableNumber(product.maximum)
        this.ShelfCount = nullableNumber(product.shelfCount)
        this.CustomFields = customFields
    }
}

class GenericCustomField {

    /**
     * 
     * @param {genericCustomFieldFields} customField 
     */
    constructor(customField) {
        this.FriendlyName = customField.friendlyName
        this.Description = customField.description
        this.SystemName = customField.systemName
        this.Value = customField.value
    }
}

export default {
    UpsertEmployeeRequest,
    UpsertRoleRequest,
    UpsertDepartmentRequest,
    UpsertLocationRequest,
    UpsertOrderingMethodRequest,
    UpsertVendorRequest,
    UpsertProductRequest,
    GenericCustomField
}
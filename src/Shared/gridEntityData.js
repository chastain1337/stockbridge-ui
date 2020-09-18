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
    },
    products: {
        fields: {
            id: { friendlyName: "ID"},
            sku: { friendlyName: "SKU"},
            description: { friendlyName: "Description"},
            partNumber: { friendlyName: "Part Number"},
            orderingPartNumber: { friendlyName: "Ordering Part Number"},
            primaryVendor: { friendlyName: "Primary Vendor"},
            secondaryVendor: { friendlyName: "Secondary Vendor"},
            lastUnitCost: { friendlyName: "Last Unit Cost"},
            location: { friendlyName: "Location"},
            casePack: { friendlyName: "Case Pack"},
            length_IN: { friendlyName: "Length (IN.)"},
            width_IN: { friendlyName: "Width (IN.)"},
            height_IN: { friendlyName: "Height (IN.)"},
            weight_OZ: { friendlyName: "Weight (OZ.)"},
            minimum: { friendlyName: "Min."},
            maximum: { friendlyName: "Max"},
            shelfCount: { friendlyName: "Shelf Count"},
            pending: { friendlyName: "Pending"},
            onOrder: { friendlyName: "On Order"},
            available: { friendlyName: "Available"},
            toOrderQuantity: { friendlyName: "To Order Quantity"},
            toOrderAmount: { friendlyName: "To Order Amount"},

        }
    },
    orderingMethods: {
        fields: {
            id: { friendlyName: "ID"},
            methodName: { friendlyName: "Method Name"},
        }
    },
    locations: {
        fields: {
            id: { friendlyName: "ID"},
            quickPick: { friendlyName: "Quick Pick"},
            aisle: { friendlyName: "Aisle"},
            section: { friendlyName: "Section"},
            shelf: { friendlyName: "Shelf"},
            name: { friendlyName: "Name"},
            customName: { friendlyName: "Custom Name"},
        }
    },
    vendors: {
        fields: {
            id: { friendlyName: "ID"},
            code: { friendlyName: "Code"},
            name: { friendlyName: "Name"},
            orderingMin: { friendlyName: "Ordering Min."},
            orderingMethod: { friendlyName: "Ordering Method"},
            email: { friendlyName: "Email"},
            accountNumber: { friendlyName: "Account Number"},
            phoneNumber: { friendlyName: "Phone Number"},
            willDropForUs: { friendlyName: "Will Drop Ship For Us"},
            willChargeFreightForDropShip: { friendlyName: "Will Charge Freight For Drop Ship"},
            willChargeFreightForOrders: { friendlyName: "Will Charge Freight For Orders"},
            leadTimeBusinessDays: { friendlyName: "Lead Time (Business Days)"},
            useAutoOrdering: { friendlyName: "Use Auto Ordering"},
        }
    }
}
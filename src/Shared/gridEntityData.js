/*
    entityName: {
        fields: {
            (field name that matches (case insensitive) model from server): {
                friendlyName: String,
                hidden?: =false,
                readOnly?: =false,
                calculation? Can be used whether readOnly or not. Use row.* or row[*] to access value from other rows
            }
        },
        watch?: {
            Use this to calculate fields based on other fields. Triggered onBlur of contenteditable cell. These will NOT cascade indefinitely
            fieldToWatch: {
                fieldToEditWhenWatchedFieldIsChanged: function( rowObject ) { return newValue},
                youCanHaveMultipleFields: row => row.cost * row[quantity]
            }
        }

    }

    Example of valid calculations:
    fields: {
        quantity: {friendlyName: "Quantity"},
        cost: {friendlyName: "Cost"},
        totalCost: {friendlyName: "Total Cost", readOnly: true, calculation: "row.quantity+row['cost']"" }
    }

    Calculated fields must be read-only. For now.
*/

export default {
    exampleEntity: {
        fields: {
            id: { friendlyName: "ID", hidden: true},
            cost: {friendlyName: "Cost"},
            quantity: {friendlyName: "Quantity"},
            totalCost: {friendlyName: "Total", calculation: row => (row.cost || 0)*(row.quantity || 0)},
        },
        watch: {
            cost: {
                totalCost: row => (row.cost || 0)*(row.quantity || 0)
            },
            quantity: {
                totalCost: row => (row.cost || 0)*(row.quantity || 0)
            },
            totalCost: {
                cost: row => (row.totalCost || 0) / (row.quantity || 1)
            }
        }
    },
    employees: {
        fields: {
            id: { friendlyName: "ID", hidden: true},
            firstName: { friendlyName: "First Name"},
            lastName: { friendlyName: "Last Name"},
            userName: { friendlyName: "Username"},
            password: { friendlyName: "Password", readOnly: true},
            email: { friendlyName: "Email"},
            startDate: { friendlyName: "Start Date"},
            availableVacationHours: { friendlyName: "Vacation Hours"},
            baseRate: { friendlyName: "Rate"},
            role: { friendlyName: "Role" },
            department: {friendlyName: "Department"},
            terminated: { friendlyName: "Terminated"},
        },
    },
    roles: {
        fields: {
            id: {friendlyName: "ID", hidden: true},
            name: {friendlyName: "Role Name"}
        },
    },
    departments: {
        fields: {
            id: {friendlyName: "ID", hidden: true},
            name: {friendlyName: "Department Name"},
        },
    },
    products: {
        fields: {
            id: { friendlyName: "ID", hidden: true},
            sku: { friendlyName: "SKU"},
            description: { friendlyName: "Description"},
            partNumber: { friendlyName: "Part Number"},
            orderingPartNumber: { friendlyName: "Ordering Part Number"},
            primaryVendor: { friendlyName: "Primary Vendor"},
            secondaryVendor: { friendlyName: "Secondary Vendor"},
            lastUnitCost: { friendlyName: "Last Unit Cost"},
            location: { friendlyName: "Location ID"},
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
            id: { friendlyName: "ID", hidden: true},
            methodName: { friendlyName: "Method Name"},
        }
    },
    locations: {
        fields: {
            id: { friendlyName: "ID", hidden: true},
            quickPick: { friendlyName: "Quick Pick"},
            aisle: { friendlyName: "Aisle"},
            section: { friendlyName: "Section"},
            shelf: { friendlyName: "Shelf"},
            name: { friendlyName: "Name", readOnly: true, calculation: row => {
                if (row.aisle && row.section && row.shelf) return `${row.aisle}${row.section}${row.shelf}`
                return row.customName;
            }},
            customName: { friendlyName: "Custom Name"},
        }
    },
    vendors: {
        fields: {
            id: { friendlyName: "ID", hidden: true},
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
<template>
  <div class="container-fluid mt-2">
    <h1>Bulk Importer</h1>
    <div class="row mb-2">
      <div class="col-2">
        <kendo-dropdownlist
          :data-source="bulkImportOptions"
          optionLabel="Entity to Import"
          @select="handleDropdownChange"
          data-text-field="name"
          data-value-field="name"
          :value="dropdownValue"
        ></kendo-dropdownlist>
      </div>
      <div class="col-3">
        <button class="btn btn-outline-danger" @click="resetGrid" :disabled="!gridData">Reset</button>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <grid
          :enableBulkPaste="true"
          :data="gridData"
          :columns="gridColumns"
          :totalRows="totalRows"
          @dataChange="dataChange"
          :validations="entityValidations"
          :buttonsToInclude="['ALL']"
          :submitHandler="handleSubmit"
          :submitting="submitting"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gridEntityData from "@/Shared/gridEntityData";
import EditableGrid from "@/Shared/Components/EditableGrid";
import allValidations from "@/Shared/validations";
import apiModels from '@/Shared/apiModels';

export default {
  name: "BulkImporter",
  components: { grid: EditableGrid },
  data() {
    return {
      bulkImportOptions: [
        {
          name: "Employees",
          storeActions: {get: "getEmployees,getRoles,getDepartments", post: "upsertEmployees"}
        },
        {
          name: "Roles",
          storeActions: {get: "getRoles", post: "upsertRoles"}
        },
        {
          name: "Departments",
          storeActions: {get: "getDepartments", post: "upsertDepartments"}
        },
      ],
      selectedEntityActions: {get: "", post: ""},
      gridData: null,
      gridColumns: null,
      totalRows: 5,
      pastedText: "",
      modalVisible: false,
      pasteIntoRow: 1,
      entityValidations: null,
      dropdownValue: "",
      upsertRequestModel: null,
      submitting: false
    };
  },
  methods: {
    handleDropdownChange(e) {
      this.dropdownValue = e.dataItem.name;
      this.selectedEntityActions = {...e.dataItem.storeActions};
    },
    handleSubmit() {
      this.submitting = true
      const upsertModels = this.gridData.filter(e => Object.values(e).every(v => v != null && v != '')).map( r => new this.upsertRequestModel(r));
      console.log(upsertModels);
      this.$store.dispatch(this.selectedEntityActions.post,upsertModels)
      .then( res => {
        this.submitting = false
        sb.notify.toast(`${res.data.data.length} object(s) created successfully.`,2000,"S")
      })
      .catch( res => {
        this.submitting = false
        sb.notify.toast(`Error(s): ${res.data.errors.join("\n")}.`,2000+res.data.errors.length*2000,"F")
      })
    },
    dataChange(gridData) {
      this.totalRows = Math.max(gridData.length,this.totalRows)
      this.gridData = gridData;
    },
    openModal() {
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    resetGrid() {
      this.dropdownValue = "";
      this.gridData = null;
      this.gridColumns = null;
    },
    refreshGridAfterDataLoad() {
      // Does not update the store with new data
      let thisValidationObject;
      let sampleData = {};
      let columns = [];

      let firstRowOfData, entityData
      switch (this.selectedEntityActions.get) {
        // Define sampleData based on entity selected
        case "getEmployees,getRoles,getDepartments":
          firstRowOfData = { ...this.$store.state.entities.employees.data[0] };
          entityData = { ...gridEntityData.employees };
          this.upsertRequestModel = apiModels.UpsertEmployeeRequest
          thisValidationObject = allValidations.employeeValidations;
          break;
          
        case "getRoles":
          firstRowOfData = { ...this.$store.state.entities.roles.data[0] };
          entityData = { ...gridEntityData.roles };
          this.upsertRequestModel = apiModels.UpsertRoleRequest
          thisValidationObject = allValidations.roleValidations;
          break;

        case "getDepartments":
          firstRowOfData = { ...this.$store.state.entities.departments.data[0] };
          entityData = { ...gridEntityData.departments };
          this.upsertRequestModel = apiModels.UpsertDepartmentRequest
          thisValidationObject = allValidations.departmentValidations;
          break;
      }

      
      const entityDataFields = {...entityData.fields}
      delete entityDataFields.id; // no ID field on creation

      for (let field in entityDataFields) {
        if (firstRowOfData[field] != undefined ) {
          columns.push({
                field: field,
                title: entityDataFields[field].friendlyName,
              });
            sampleData[field] = null;
        }
      }
    
      this.entityValidations = thisValidationObject;
      this.gridColumns = columns;
      this.gridData = [];

    },
  },
  watch: {
    selectedEntityActions: async function (val) {
      if (val) {
        // Get data
        const actions = this.selectedEntityActions.get.split(",")
        for (let i = 0; i < actions.length; i++) {
          await this.$store.dispatch(actions[i]);
        }
        this.refreshGridAfterDataLoad();
      }
    },
  },
};
</script>

<style>
td.invalid-e {
  color: red;
  background-color: pink;
}
td.invalid-o {
  color: rgb(151, 0, 0);
  background-color: rgb(248, 135, 154);
}

.k-numerictextbox {
  width: 100px;
}
</style>

<template>
  <div class="container-fluid mt-2">
    <k-dialog
      v-if="modalVisible"
      :modal="true"
      @close="closeModal"
      :width="800"
    >
      <div class="container-fluid my-2">
        <div class="row">
          <div class="col text-center">
          <textarea
            style="width: 720px"
            v-model="pastedText"
            placeholder="Paste tab separated data here, including 'headers' row..."
          ></textarea>
          </div>
        </div>
      </div>
      <div class="row mx-2">
        <div class="col">Paste into / starting at column:</div>
        <div class="col">Paste into / starting at row:</div>
      </div>
      <div class="row mx-2">
        <div class="col">
          <kendo-dropdownlist
            :data-source="gridColumns"
            v-model="pasteIntoColumn"
            data-text-field="friendlyName"
            data-value-field="field"
          ></kendo-dropdownlist>
        </div>
        <div class="col">
          <kendo-numerictextbox
            v-model.number="pasteIntoRow"
            :max="1000"
            :min="1"
            :decimals="0"
            :format="'#'"
          ></kendo-numerictextbox>
        </div>
      </div>

      <dialog-actions-bar>
        <button class="k-button" style="background-color: #81AE9D" @click="handlePaste">Insert</button>
        <button class="k-button" style="background-color: #dddddd" @click="closeModal">Cancel</button>
      </dialog-actions-bar>
    </k-dialog>

    <h1>Bulk Importer</h1>
    <div class="row mb-4">
      <div class="col-3">
        <kendo-dropdownlist
          :data-source="bulkImportOptions"
          optionLabel="Entity to Import"
          v-model="selectedEntityStoreAction"
          data-text-field="name"
          data-value-field="storeAction"
        ></kendo-dropdownlist>
      </div>
      <div class="col-3">
        Blank Rows:
        <kendo-numerictextbox
          class="ml-2"
          v-model.number="blankRows"
          :max="500"
          :min="1"
          :decimals="0"
          :format="'#'"
          :disabled="!!gridData"
        ></kendo-numerictextbox>
      </div>
      <div class="col-2">
        <button class="btn btn-outline-danger" @click="resetGrid" :disabled="!gridData">Reset</button>
        <button
          class="btn btn-outline-success"
          type="button"
          :disabled="!gridData"
          @click="openModal"
        >Bulk Paste</button>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <kendo-grid
          v-if="gridData"
          :allow-copy="true"
          :editable="true"
          :height="900"
          :navigatable="true"
          :resizable="true"
          :selectable="'multiple, cell'"
          :data-source="gridData"
        >
          <kendo-grid-column
            v-for="columns in gridColumns"
            :key="columns.field"
            :title="columns.friendlyName"
            :field="columns.field"
            :encoded="false"
          ></kendo-grid-column>
        </kendo-grid>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BulkImporter",
  data() {
    return {
      bulkImportOptions: [
        {
          name: "Employees",
          url: "/api/Employee/GetEmployees",
          storeAction: "getEmployees",
        },
      ],
      selectedEntityStoreAction: "",
      gridData: null,
      gridColumns: null,
      blankRows: 5,
      pasteIntoColumn: "",
      pastedText: "",
      modalVisible: false,
      pasteIntoRow: 1,
    };
  },
  methods: {
    openModal() {
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    handlePaste() {
      this.closeModal();

      const pastedRows = this.pastedText
        .split("\n")
        .map((row) => row.split(/\t/));
      
      if (pastedRows.length === 1) {
        return this.$store.commit("notify",{ message: "You either pasted no data or no header row. Correct and try again.", callback: this.openModal })
      }

      const headers = [...pastedRows[0]];

      // Delete the headers row from the pastedRows
      
      const dataIsOneColumn = pastedRows.every( rw => rw.length === 1)
      const gridDataColumnStartIndex = this.columns.findIndex( c => c.field === this.pasteIntoColumn)
        
    
      
    },
    resetGrid() {
      this.selectedEntityStoreAction = "";
      this.gridData = null;
      this.gridColumns = null;
    },
    refreshGridAfterDataLoad() {
      // Does not update the store with new data

      let sampleData = {};
      let columns = [];
      switch (this.selectedEntityStoreAction) {
        // Define sampleData based on entity selected
        case "getEmployees":
          const firstRowOfData = { ...this.$store.state.employees[0] };
          const mapToFriendlyNames = {
            firstName: "First Name",
            lastName: "Last Name",
            userName: "Username",
            password: "Password",
            email: "Email",
            startDate: "Start Date",
            role: "Role",
            availableVacationHours: "Vacation Hours",
            baseRate: "Rate",
          };
          for (let field in firstRowOfData) {
            if (mapToFriendlyNames[field]) {
              columns.push({
                field: field,
                friendlyName: mapToFriendlyNames[field],
              });
              sampleData[field] = "";
            }
          }
      }

      let emptyRows = [];

      for (let i = 1; i <= this.blankRows; i++) {
        emptyRows.push(sampleData);
      }

      this.gridColumns = columns;
      this.gridData = emptyRows;
      this.pasteIntoColumn = columns[0].field;
    },
  },
  watch: {
    blankRows: function (val) {
      // If blankrows was updated while griddata was loaded
      if (this.gridData) {
        this.refreshGridAfterDataLoad();
      }
    },
    selectedEntityStoreAction: async function (val) {
      if (val) {
        // Get data
        await this.$store.dispatch(this.selectedEntityStoreAction);
        this.refreshGridAfterDataLoad();
      }
    },
  },
};
</script>
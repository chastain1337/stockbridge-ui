<template>
  <div class="container-fluid mt-2">
    <k-dialog v-if="modalVisible" :modal="true" @close="closeModal" :width="800">
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
        <div class="col">Paste into / starting at row:</div>
      </div>
      <div class="row mx-2">
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
        <button
          class="k-button"
          style="background-color: #81AE9D"
          @click="handlePaste"
          :disabled="this.pastedText.trim().length === 0"
        >Insert</button>
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
      <div class="col-5">
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
      <div class="col-3">
        <button class="btn btn-outline-danger" @click="resetGrid" :disabled="!gridData">Reset</button>
        <button
          class="btn btn-outline-success"
          type="button"
          :disabled="!gridData"
          @click="openModal"
        >Bulk Paste</button>
        <button
          class="btn btn-outline-warning"
          type="button"
          :diabled="!gridData"
          @click="validate"
        >Validate Grid</button>
        <button
          class="btn btn-success"
          type="button"
          :disabled="$v.gridData.$anyInvalid"
          @click="submit"
        >Import Data</button>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <EditableGrid 
        v-if="gridData"
        :columns="gridColumns"
        :emptyRows="blankRows"
        />
      </div>
      <!-- <div class="col" @keyup="keyPressed">
        <Grid
          ref="grid"
          v-if="gridData"
          :data-items="gridData"
          :style="{height: '900px'}"
          :columns="gridColumns"
          :edit-field="'inEdit'"
          @rowclick="rowClick"
          @itemchange="itemChange"
          @columnreorder="columnReorder"
          :reorderable="true"
          :resizable="true"
        ></Grid>
      </div>-->
    </div>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import entityValidations from "@/Shared/validations";
import gridEntityData from "@/Shared/gridEntityData";
import EditableGrid from "@/shared/Components/EditableGrid";

export default {
  name: "BulkImporter",
  components: { EditableGrid: EditableGrid },
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
      pastedText: "",
      modalVisible: false,
      pasteIntoRow: 1,
      editID: null,
      validateMode: false,
      roles: ["Employee", "Owner", "Manager"],
      selectedRole: "",
    };
  },
  methods: {
    // roleEditor: function (container, options) {
    //   let select = `<kendo-dropdownlist :data-source="roles" optionLabel="Role" v-model="selectedRole"></kendo-dropdownlist>`;
    //   select.appendTo(container);

    //   // use Vue.extend to make a component constructor, and new a component
    //   let qrcodeCapture = new (Vue.extend(QrcodeCapture))();
    //   qrcodeCapture.$on("decode", (decodedString) => {
    //     select.val(decodedString).trigger("change");
    //     // Trigger "change" element to tell kendo that you have change the data
    //   });
    //   qrcodeCapture.$mount();
    //   container.append(qrcodeCapture.$el);
    // },
    // submit() {
    //   switch (this.selectedEntityStoreAction) {
    //     case "getEmployees":
    //       return this.$store.dispatch("addEmployees", this.gridData);
    //   }
    // },
    // async validate() {
    //   const tableRows = this.$refs.grid.vs.table.rows;
    //   await this.closeEdit();
    //   for (let r = 0; r < tableRows.length; r++) {
    //     const tableCells = tableRows[r].cells;
    //     for (let c = 0; c < tableCells.length; c++) {
    //       const thisCell = tableCells[c];
    //       const columnName = this.gridColumns[c].field;
    //       if (this.$v.gridData.$each[r][columnName].$invalid) {
    //         const classAppend = r % 2 === 0 ? "-e" : "-o";
    //         thisCell.classList.add("invalid" + classAppend);
    //       }
    //     }
    //   }
    // },
    // // renderer(h, defaultRendering, props, listeners) {
    // //   console.log("re-rendered the grid");
    // //   return defaultRendering;
    // // },
    // keyPressed(e) {
    //   if (e.key === "Escape" || e.key === "Enter") {
    //     this.closeEdit();
    //   }
    // },
    // columnReorder: function (options) {
    //   this.gridColumns = options.columns;
    // },
    // rowClick: function (e) {
    //   this.gridData = this.gridData.map((d) => {
    //     d.inEdit = false;
    //     return d;
    //   });
    //   const invalidTds = document.querySelectorAll("[class^=invalid]");
    //   if (invalidTds.length > 0) {
    //     invalidTds.forEach((td) => {
    //       td.classList.remove("invalid-e");
    //       td.classList.remove("invalid-o");
    //     });
    //   }

    //   this.editID = e.dataItem.id;
    //   this.$set(e.dataItem, "inEdit", true);
    // },
    // closeEdit(e) {
    //   return new Promise((resolve) => {
    //     this.editID = null;
    //     this.gridData = this.gridData.map((d) => {
    //       d.inEdit = false;
    //       return d;
    //     });
    //     window.setTimeout(() => {
    //       resolve();
    //     }, 0); // hack to make sure the grid resets back to text and not inputboxes before proceeding
    //   });
    // },
    // itemChange: function (e) {
    //   const data = [...this.gridData];
    //   data[e.dataItem.id - 1] = {
    //     ...data[e.dataItem.id - 1],
    //     [e.field]: e.value,
    //   };
    //   this.gridData = data;
    //   this.$set(e.dataItem, e.field, e.value);
    //   this.$v.gridData.$touch();
    // },

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

      const pastedHeaders = [...pastedRows[0]];
      const pastedHeaderGridColumnIndexes = pastedHeaders.map((pHeader) =>
        this.gridColumns.findIndex((h) => h.title === pHeader)
      );
      if (
        pastedRows.length === 1 ||
        pastedHeaderGridColumnIndexes.every((idx) => idx < 0)
      ) {
        return this.$store.commit("notify", {
          message:
            "You either pasted no data, no header row, or all headers are invalid. Correct and try again.",
          callback: this.openModal,
        });
      }

      pastedRows.splice(0, 1); // remove header row and any entirely blank rows
      let i = 0;
      pastedRows.forEach((row) => {
        if (row.every((c) => c === "")) {
          pastedRows.splice(i, 1);
        }
        i++;
      });
      const blankRow = {};
      this.gridColumns.forEach((c) => (blankRow[c.field] = ""));
      const totalNewRows = pastedRows.length;
      const newRowsToAdd =
        totalNewRows - (this.blankRows - this.pasteIntoRow + 1);

      // Stretch grid data to fit the rows that we need
      let gridDataCopy = [...this.gridData];
      for (let i = 1; i <= newRowsToAdd; i++) {
        gridDataCopy.push(blankRow);
      }

      let currentRow = this.pasteIntoRow - 1; // zero based index

      pastedRows.forEach((pastedRow) => {
        const thisRow = { ...gridDataCopy[currentRow] };
        let i = 0;
        pastedRow.forEach((pastedCol) => {
          const thisHeaderIdx = pastedHeaderGridColumnIndexes[i];
          if (thisHeaderIdx >= 0) {
            // check if header is valid, add to error list if not
            thisRow[this.gridColumns[thisHeaderIdx].field] = pastedCol;
            i++;
          }
        });
        gridDataCopy[currentRow] = { ...thisRow };
        currentRow++;
      });

      this.blankRows = gridDataCopy.length;
      this.gridData = gridDataCopy;
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
          const entityData = { ...gridEntityData.employees };
          delete entityData.id; // no ID field on creation

          for (let field in firstRowOfData) {
            if (entityData[field]) {
              columns.push({
                field: field,
                title: entityData[field].friendlyName,
                editor: entityData[field].editor,
              });
              sampleData[field] = null;
            }
          }
      }

      let emptyRows = [];

      for (let i = 1; i <= this.blankRows; i++) {
        const thisDatum = { ...sampleData };
        thisDatum.id = i;
        thisDatum.inEdit = i === this.editID;
        emptyRows.push(thisDatum);
      }

      this.gridColumns = columns;
      this.gridData = emptyRows;
      // this.$v.gridData.touch();
    },
  },
  watch: {
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

<style>
td.invalid-e {
  color: red;
  background-color: pink;
}
td.invalid-o {
  color: rgb(151, 0, 0);
  background-color: rgb(248, 135, 154);
}
</style>

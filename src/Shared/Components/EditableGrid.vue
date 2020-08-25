Using this component:
  - Register it in the parent
  - Pass in the props as detailed below
  - In the parent you need to handle @dataChange:. 
    - This event passes in a new data array (includes blank rows as data)
    - You must at least:
      -Set your local totalRows field to max(data.length,current totalRows) 
      -Set local data = data parameter that was passed in.



<template>
  <div class="container-fluid">
    <div class="row text-center border-bottom pb-3 border-dark">
      <div class="col-2" v-if="buttonsToInclude.includes('ROWCOUNT') || buttonsToInclude.includes('ALL')">
        Total Rows:
        <kendo-numerictextbox
          class="ml-2"
          v-model.number="totalRowsLocal"
          :max="500"
          :min="1"
          :decimals="0"
          :format="'#'"
          :disabled="!!this.allData"
        ></kendo-numerictextbox>
      </div>
      <div class="col-1" v-if="buttonsToInclude.includes('SUBMIT') || buttonsToInclude.includes('ALL')">
        <button class="btn btn-success" @click="handleSubmit" :disabled="!this.allData">Submit</button>
      </div>
      <div class="col-1" v-if="buttonsToInclude.includes('VALIDATE') || buttonsToInclude.includes('ALL')" >
        <button class="btn btn-warning" @click="handleValidate" :disabled="!this.allData">Validate</button>
      </div>
      <div class="col-1" v-if="buttonsToInclude.includes('COPY') || buttonsToInclude.includes('ALL')" >
       <button class="btn btn-primary" @click="handleCopy" :disabled="!this.allData">Copy</button>
      </div>
      <div class="col-1" v-if="buttonsToInclude.includes('CLEAR') || buttonsToInclude.includes('ALL')">
        <button class="btn btn-danger" @click="handleClear" :disabled="!this.allData">Clear</button>
      </div>
    </div >
    <div class="row" v-if="!!this.allData">
      <table class="table table-bordered table-sm table-hover table-striped">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.field">{{ col.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row,rowIndex) in allData" :key="`rw-${rowIndex}`" :data-row-index="rowIndex">
            <td
              v-for="(col,colIndex) in columns"
              @paste="handlePaste"
              @blur="cellBlurred($event.target.textContent,rowIndex,col.field,colIndex,$event.target)"
              :key="`${rowIndex}-${col.field}-${allData[rowIndex][col.field]}`"
              :data-row-index="rowIndex"
              :data-col-index="colIndex"
              :data-cell-coordinates="`${rowIndex},${colIndex}`"
              :data-col-field="col.field"
              contenteditable="true"
            >
              <template v-if="allData[rowIndex][col.field]">{{allData[rowIndex][col.field]}}</template>
              <br v-else />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import gridEntityData from "@/Shared/gridEntityData";

export default {
  name: "EditableGrid",
  data() {
    return {
      allData: null,
      totalRowsLocal: this.totalRows,
    };
  },
  props: {
    columns: {required: true }, // title: string, field: string, editor?: defaults to text, can pass in HTML or Vue object
    data: { required: true }, // must pass in empty array if only blank rows
    totalRows: { type: Number, required: true }, // generates blank rows after data rows using the columns provided. Sets the initial value of the selector (see enableRowCountEdit)
    validations: Object, // vuelidate validations object, see /shared/validations.js for examples
    enableBulkPaste: { type: Boolean, default: false }, // whether paste events should be auto-parsed and spread across the grid
    buttonsToInclude: {type: Array, default: []} // toolbar buttons to include. Valid values are: "ROWCOUNT","SUBMIT","VALIDATE","COPY","CLEAR". Can also use "ALL" to enable all buttons
  },
  methods: {
    handleSubmit() {

    },
    handleCopy() {

    },
    handleValidate() {

    },
    handleClear() {
      this.updateParent(this.emptyRows(this.totalRowsLocal))
    },
    handlePaste(e) {
      if (!this.enableBulkPaste) return;
      e.stopPropagation();
      e.preventDefault();

      // Get pasted data via clipboard API
      const clipboardData = e.clipboardData || window.clipboardData;
      let pastedData = clipboardData
        .getData("Text")
        .split("\n")
        .map((row) => row.split(/\t/));
      const startingColField = e.target.getAttribute("data-col-field");
      const startingColIndex = Number(e.target.getAttribute("data-col-index"));
      const startingRow = Number(e.target.getAttribute("data-row-index"));

      // Remove any completely blank rows
      pastedData = pastedData.filter((row) => row.every((cell) => cell !== ""));

      // Make sure data fits in columns
      const remainingColumns = this.columns.length - startingColIndex;
      if (pastedData[0].length > remainingColumns) {
        return this.$store.commit("notify", {
          message: `You have pasted ${pastedData[0].length} columns in a space where only ${remainingColumns} can be filled.`,
        });
      }

      // Strech all data to fit rows
      const rowsToAdd =
        startingRow + pastedData.length - 1 - this.allData.length;
      let newData = [...this.allData];
      if (rowsToAdd > 0) {
        const emptyRows = this.emptyRows(rowsToAdd);
        newData = [...this.allData, ...emptyRows];
      }

      let currentRow = startingRow;
      pastedData.forEach((pastedRow) => {
        const thisRow = { ...newData[currentRow] };
        let i = 0;
        pastedRow.forEach((pastedCol) => {
          const colHeader = this.columns[startingColIndex + i].field;
          thisRow[colHeader] = pastedCol;
          i++;
        });

        newData[currentRow] = { ...thisRow };
        currentRow++;
      });

      this.totalRowsLocal = newData.length;
      this.updateParent(newData);
    },
    cellBlurred(newValue, rowIndex, colField, colIndex, e) {
      if (this.allData[rowIndex][colField] !== newValue && newValue !== "") {
        const thisRow = { ...this.allData[rowIndex] };
        const dataCopy = [...this.allData];
        thisRow[colField] = newValue;
        dataCopy[rowIndex] = thisRow;

        // emit event to change data in parent component

        this.updateParent(dataCopy);
      }
    },
    emptyRows(count = 1) {
      let emptyRow = {};
      this.columns.forEach((col) => (emptyRow[col.field] = null));
      return Array(count).fill({ ...emptyRow }); // I know, I know...
    },
    createAllData() {
      const emptyRows = this.emptyRows(this.totalRows - this.data.length);
      const dataCopy = [...this.data, ...emptyRows];
      this.allData = dataCopy;
    },
    updateParent(newData) {
      //const newestData = newData.filter( row => Object.values(row).some( cell => cell !== "" && cell !== null));
      this.$emit("dataChange", newData);
    },
  },
  mounted() {
    if (this.data) this.createAllData();
  },
  watch: {
    data() {
      if (this.data === null) return this.allData = null;
      this.createAllData();
    },
  },
  validations() {
    if (!this.validations) return {};
    return {
      data: {
        required,
        $each: this.validations,
      },
    };
  },
};
</script>

<style scoped>
td {
  line-height: 1;
}
</style>
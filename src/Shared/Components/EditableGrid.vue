<template>
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
          @blur="cellBlurred($event.target.textContent,rowIndex,col.field,colIndex)"
          :key="`rowIndex-${col.field}`"
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
</template>

<script>
import { required } from "vuelidate/lib/validators";
import entityValidations from "@/Shared/validations";
import gridEntityData from "@/Shared/gridEntityData";

export default {
  name: "EditableGrid",
  data() {
    return {
      allData: null,
    };
  },
  props: {
    columns: { type: Array, required: true }, // title: string, field: string, editor?: defaults to text, can pass in HTML or Vue object
    data: { type: Array, required: true }, // must pass in empty array if only blank rows
    totalRows: { type: Number, required: true }, // generates blank rows after data rows using the columns provided.
    validations: Object, // vuelidate validations object, see /shared/validations.js for examples
    enableBulkPaste: { type: Boolean, default: false }, // whether paste events should be auto-parsed
  },
  methods: {
    handlePaste(e) {
      if (!this.enableBulkPaste) return;
      e.stopPropagation();
      e.preventDefault();

      // Get pasted data via clipboard API
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedData = clipboardData
        .getData("Text")
        .split("\n")
        .map((row) => row.split(/\t/));
      console.log(e);
      const startingColField = e.target.getAttribute("data-col-field");
      const startingColIndex = Number(e.target.getAttribute("data-col-index"));
      const startingRow = Number(e.target.getAttribute("data-row-index"));

      console.log(pastedData);

      // Make sure data fits in columns
      const remainingColumns = this.columns.length - startingColIndex;
      if (pastedData[0].length > remainingColumns) {
        return this.$store.commit("notify", {
          message: `You have pasted ${pastedData[0].length} columns in a space where only ${remainingColumns} can be filled.`,
        });
      }

      // Strech all data to fit rows
      const rowsRemaining =
        this.allData.length - (pastedData.length + startingRow);
      let newData = [...this.allData];
      if (rowsRemaining < 0) {
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
      this.allData = [...newData];
      this.$emit("dataChange", newData);
    },
    cellBlurred(newValue, rowIndex, colField, colIndex) {
      if (this.allData[rowIndex][colField] !== newValue && newValue !== "") {
        const thisRow = { ...this.allData[rowIndex] };
        const dataCopy = [...this.allData];
        thisRow[colField] = newValue;
        dataCopy[rowIndex] = thisRow;

        console.log(rowIndex);
        console.log(dataCopy);
        // emit event to change data in parent component
        this.$emit("dataChange", dataCopy);
      }
    },
    emptyRows(count = 1) {
      let emptyRow = {};
      this.columns.forEach((col) => (emptyRow[col.field] = null));
      return Array(count).fill(emptyRow); // I know, I know...
    },
  },
  mounted() {
    const emptyRows = this.emptyRows(this.totalRows - this.data.length);
    const dataCopy = [...this.data, ...emptyRows];
    this.allData = dataCopy;
  },
  validations() {
    return {
      data: {
        required,
        $each: validations,
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
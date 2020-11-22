<template>
    <div
      :id="'card-' + field.field"
      ref="card"
      :class="editMode ? 'card transparent' : 'card'"
    >
      <div :id="'card-' + field.field + '-header'" class="card-header">
        {{ field.title }}
      </div>
      <div
        v-if="!entityLoading"
        class="card-body"
        :title="entityIsMissing ? 'Click to load entity.' : null"
        :class="entityIsMissing ? 'missing-entity' : null"
        @click="handleCardClick"
      >
        <table
          v-if="field.field === 'customFields'"
          class="cf-table table table-sm table-bordered table-striped table-hover"
        >
          <tr>
            <th class="p-0">Name</th>
            <th class="p-0">Desc</th>
            <th class="p-0">Value</th>
          </tr>
          <tr v-for="cf in field.value" :key="cf.systemName">
            <td class="p-1">{{ cf.friendlyName }}</td>
            <td class="p-1">{{ cf.description }}</td>
            <td class="p-1">{{ cf.value }}</td>
          </tr>
        </table>

        <div v-else-if="editingThisCard" class="input-group">
          <input
            v-if="editingThisCard"
            class="form-control"
            v-model="fieldValueLocal"
            @keypress.enter="confirmEdit"
            ref="editingInput"
            @focus="handleFocus"
            @keydown.esc="cancelEdit"
          />
          <div class="input-group-append">
            <kendo-button
              icon="check"
              type="button"
              @click="handleConfirmEditClick"
            ></kendo-button>
          </div>
          <div class="input-group-append">
            <kendo-button
              icon="close"
              type="button"
              @click="handleCancelEditClick"
            ></kendo-button>
          </div>
        </div>

        <div v-else>{{ value }}</div>
      </div>
      <div v-else class="card-body text-center">
        <div class="spinner-border" role="status"></div>
      </div>
    </div>
</template>

<script>
export default {
  props: {
    field: Object,
    editMode: Boolean,
    fieldIndex: Number,
  },
  name: "Card",
  data() {
    return {
      entityIsMissing: false,
      entityLoading: false,
      dispatchMethod: "",
      fieldValueLocal: "",
      editingThisCard: false,
      showCustomFieldsModal: false,
    };
  },
  methods: {
    logCoordinates() {
      const card = this.$refs.card;
      console.log(
        card.offsetWidth,
        card.offsetHeight,
        card.offsetLeft,
        card.offsetTop
      );
    },
    async fetchEntity(dispatchMethod) {
      this.entityLoading = true;
      await this.$store.dispatch(dispatchMethod);

      this.entityLoading = false;
    },
    handleFocus(e) {
      console.log(e.target.value);
      e.target.setSelectionRange(0, e.target.value.length);
    },
    handleCardClick(e) {
      if (this.editingThisCard) return;

      if (this.entityIsMissing) {
        return this.fetchEntityWrapper();
      }

      if (
        this.editMode &&
        !this.editingThisCard &&
        this.field.field === "customFields"
      ) {
        return this.$emit("customFieldEditClick")
      }

      if (this.editMode && !this.editingThisCard) {
        this.fieldValueLocal = this.value;
        this.editingThisCard = true;
        this.$nextTick(() => {
          this.$refs.editingInput.focus();
        });

        return;
      }
    },
    handleConfirmEditClick(e) {
      e.event.stopPropagation(); // bubbling = death

      this.confirmEdit();
    },
    handleCancelEditClick(e) {
      e.event.stopPropagation();
      this.cancelEdit();
    },
    confirmEdit() {
      if (this.$v.fieldValueLocal.$invalid) {
        sb.notify.toast(
          `${this.fieldValueLocal} is not a valid value for ${this.field.title}.`,
          3000,
          "F"
        );
      } else {
        this.$emit(
          "editCard",
          this.field.field,
          this.fieldIndex,
          this.fieldValueLocal
        );
        this.editingThisCard = false;
      }
    },
    cancelEdit() {
      this.editingThisCard = false;
    },
    fetchEntityWrapper() {
      if (this.dispatchMethod === "") return;
      this.fetchEntity(this.dispatchMethod);
    },
  },
  mounted() {
    const el = document.getElementById("card-" + this.field.field);
    //:style="`left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px`"
    el.style.left = this.field.x + "px";
    el.style.top = this.field.y + "px";
    el.style.width = this.field.width + "px";
    el.style.height = this.field.height + "px";
    dragElement(el);

    this.fieldValueLocal = this.value;

    function dragElement(elmnt) {
      var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
      document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = elmnt.offsetTop - pos2 + "px";
        elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  },
  validations() {
    return { fieldValueLocal: this.field.validation };
  },
  computed: {
    value() {
      if (this.field.value === null) return "";
      switch (this.field.field) {
        case "primaryVendor":
        case "secondaryVendor":
          if (this.$store.state.entities.vendors.data.length === 0) {
            this.entityIsMissing = true;
            this.dispatchMethod = "getVendors";
            return "Vendors not loaded.";
          }
          this.entityIsMissing = false;
          if (this.field.value > 0) {
            return this.$store.state.entities.vendors.data.find(
                (v) => v.id === this.field.value
            ).code;
          }
          return "Could not find vendor."
        case "location":
          if (this.$store.state.entities.locations.data.length === 0) {
            this.entityIsMissing = true;
            this.dispatchMethod = "getLocations";
            return "Locations not loaded.";
          }
          this.entityIsMissing = false;
          return this.$store.state.entities.locations.data.find(
            (v) => v.id === this.field.value
          ).name;
        case "customFields":
          return this.field.value.filter((cf) => !cf.deleteFlag);
        default:
          return this.field.value;
      }
    },
  },
};
</script>

<style scoped>
.transparent:hover {
  opacity: 1;
}

.transparent {
  opacity: 0.6;
  cursor: pointer;
}

.card {
  position: absolute;
  z-index: 9;
  resize: both;

  box-shadow: 6px 8px 15px -2px rgba(0, 0, 0, 0.47);
  overflow: auto;
  background-color: white;
  min-width: 125px;
  min-height: 85px;
}

.card-header {
  cursor: move;
  z-index: 10;
  background-color: bisque;
  padding: 0.25rem;
}

.card-body {
  padding: 0.25rem;
  background-color: #eeeeee;
}

.missing-entity {
  background-color: #f4ac90;
}

.missing-entity:hover {
  cursor: pointer;
  opacity: 0.8;
}

.cf-table {
  font-size: 10pt;
}
</style>
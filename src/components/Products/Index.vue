

<template>
  <div class="container-fluid">
    <div id="image-container-outer">
      <div id="image-container-inner"></div>
    </div>
    <div class="row mt-3 h-100">
      <div class="col-3 my-auto">
        <div v-if="!editMode" class="input-group">
          <input
            class="form-control"
            v-model="searchedSKU"
            placeholder="SKU..."
            @keypress.enter="loadProductData"
          />
          <div class="input-group-append">
            <kendo-button
              icon="search"
              type="button"
              @click="loadProductData"
            ></kendo-button>
          </div>
        </div>
        <div
          v-else
          class="text-center font-weight-bold"
          style="font-size: 12pt"
        >
          EDIT MODE: Select a card to edit it.
        </div>
      </div>
      <div class="col">
        <kendo-button
          class="mx-1"
          title="Field selector..."
          icon="file-add"
          @click="handleOpen"
        ></kendo-button>
        <kendo-button
          class="mx-1"
          title="Save field settings"
          icon="save"
          :disabled="editMode"
          @click="handleSaveSettings"
        ></kendo-button>
      </div>
      <div class="col d-flex justify-content-end">
        <kendo-button
          key="addproductbutton"
          v-if="!editMode"
          class="mx-1"
          title="Add a product..."
          icon="plus"
        ></kendo-button>
        <kendo-button
          key="savebutton"
          v-if="editMode"
          class="mx-1"
          title="Save changes to product"
          icon="save"
          :style="
            unsavedChanges
              ? 'background-color: lightgreen'
              : 'background-color: #e4e7eb'
          "
          @click="handleSaveProduct"
        ></kendo-button>
        <kendo-button
          key="editbutton"
          v-else
          class="mx-1"
          title="Enable edit mode"
          :disabled="loadedProduct === null || productIsLoading"
          icon="pencil"
          @click="handleEditModeClick"
        ></kendo-button>
        <kendo-button
          key="cancelEditButton"
          v-if="editMode"
          class="mx-1"
          title="Cancel changes"
          icon="cancel"
          @click="handleCancelChangesClick"
        ></kendo-button>
        <kendo-button
          key="deleteButton"
          class="mx-1"
          title="Delete this produt..."
          :disabled="loadedProduct === null || productIsLoading"
          icon="delete"
          @click="handleDeleteProduct"
        ></kendo-button>
        <router-link
          :to="'/Products/All'"
        >
        <kendo-button
          key="viewAllButton"
          v-if="!editMode"
          class="mx-1"
          title="View all products"
          icon="list-unordered"
        ></kendo-button></router-link>
      </div>
    </div>

    <div class="mt-3">
      <div v-if="fields">
        <card
          v-for="(field, i) in fields"
          v-show="field.visible"
          :data-field="field.field"
          :key="field.field"
          :field="field"
          :editMode="editMode"
          ref="fields"
          @editCard="handleEditCard"
          @customFieldEditClick="handleCustomFieldEditClick"
          :fieldIndex="i"
          :productIsLoading="productIsLoading"
        ></card>
      </div>
      <div v-else style="font-size: 14pt">
        <div
          style="width: 14pt; height: 14pt"
          class="spinner-border"
          role="status"
        ></div>
        Fetching default field settings...
      </div>
    </div>

    <k-dialog
      v-show="showFieldEditor"
      id="product-view-field-editor"
      :modal="true"
      @close="handleClose"
      :width="900"
      :height="500"
      title="Field Chooser"
    >
      <div>
        <table class="table table-bordered table-sm table-hover">
          <thead>
            <tr>
              <td>Field</td>
              <td>Show</td>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="field in fields"
              :key="field.field"
              @click="toggleFieldVisible(field)"
              :class="field.visible ? null : 'hidden-field'"
            >
              <td class="align-middle">{{ field.title }}</td>
              <td class="align-middle">{{ field.visible ? "Yes" : "No" }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <dialog-actions-bar>
        <button
          class="k-button"
          style="background-color: #dddddd"
          @click="handleClose"
        >
          Close
        </button>
      </dialog-actions-bar>
    </k-dialog>

    <CustomFieldsEditor
      v-if="showCustomFieldsModal"
      :customFields="loadedProduct.customFields"
      :friendlyIdentifier="loadedProduct.sku"
      :identifier="loadedProduct.id"
      identifierType="productID"
      :unsavedChangesInParent="unsavedChanges"
      @close="handleCustomFieldEditorClose"
    />
  </div>
</template>

<script>
import Card from "@/Components/Products/Card";
import sbHttp from "@/Shared/sbHttp";
import entityData from "@/Shared/gridEntityData";
import validations from "@/Shared/validations";
import CustomFieldsEditor from "@/Shared/Components/CustomFieldsEditor";

export default {
  name: "Products",
  components: { card: Card, CustomFieldsEditor },
  data() {
    return {
      searchedSKU: "",
      fields: null,
      showFieldEditor: false,
      editMode: false,
      loadedProduct: null,
      unsavedChanges: false,
      showCustomFieldsModal: false,
      productIsLoading: false
    };
  },
  methods: {
    handleCustomFieldEditorClose(savedChanges) {

      if (savedChanges) {
        this.loadProductData();
        this.unsavedChanges = false;
      }

      this.showCustomFieldsModal = false;
    },
    handleCancelChangesClick() {
      this.loadProductData();
      this.editMode = false;
    },
    async handleSaveProduct() {
      const loadedProduct = {...this.loadedProduct}
      //this is hell
      loadedProduct.primaryVendorCode = loadedProduct.primaryVendor === "" || loadedProduct.primaryVendor === 0 ? null : loadedProduct.primaryVendor
      loadedProduct.secondaryVendorCode = loadedProduct.secondaryVendor === "" || loadedProduct.secondaryVendor === 0 ? null : loadedProduct.secondaryVendor
      loadedProduct.locationName = loadedProduct.location === "" || loadedProduct.location === 0 ? null : loadedProduct.location
      
      await this.$store.dispatch("upsertProducts", [loadedProduct]);
      setTimeout( async () => {
        await this.$store.dispatch("getProducts");
        this.loadProductData();
        this.editMode = false;
      },500)

    },
    handleEditModeClick() {
      this.editMode = true;
    },
    async handleDeleteProduct() {
      const sku = this.loadedProduct.sku
      const answer = confirm(`Are you sure you want to delete ${sku}?`)
      if (answer) {
        this.fields = null;
        await this.$store.dispatch("deleteProducts",[this.loadedProduct.id]);
        sb.notify.toast(`${sku} deleted!`,1500,"S");
        this.searchedSKU = '';
        this.loadedProduct = null;
        await this.$store.dispatch("getProducts",true);
        this.resetCards();
      }
    },
    handleEditCard(fieldName, fieldIndex, newValue) {
      // it's ok that vendorCode is used in primary vendor rather than ID

      // field validated before emit

      // update local version; if this is first update, set unsavedChanges to true
      const product = { ...this.loadedProduct };
      const fullValue = isNaN(Number(newValue)) ? newValue : Number(newValue);

      product[fieldName] = fullValue;
      this.loadedProduct = product;
      this.fields[fieldIndex].value = fullValue;
      this.unsavedChanges = true;
    },
    async loadProductData() {
      const fields = [...this.fields];
      const productIdx = this.$store.state.entities.products.data.findIndex((p) => p.sku === this.searchedSKU)
      
      if (productIdx > -1) {
        this.productIsLoading = true;
        const product = {...this.$store.state.entities.products.data[productIdx]};
        this.loadedProduct = { ...product };
        for (let field of fields) {
          // Ensure that all missing entities are present, and pull the representative string for them rather than ID
          switch (field.field) {
            case "primaryVendor":
            case "secondaryVendor":
              if (product[field.field] === 0) {
                field.value = "";
                break;
              }
              if (this.$store.state.entities.vendors.data.length === 0) {
                await this.$store.dispatch("getVendors");
              }
              const vendor = this.$store.state.entities.vendors.data.find( v => v.id === product[field.field])
              if (vendor) {
                field.value = vendor.code;
                product[field.field] = vendor.code;
              } else {
                field.value = `Could not find vendor with ID ${product[field.field]}`
              }
              break;
            case "location":
              if (product[field.field] === 0) {
                field.value = "";
                break;
              }
              if (this.$store.state.entities.locations.data.length === 0) {
                await this.$store.dispatch("getLocations");
              }
              const location = this.$store.state.entities.locations.data.find( l => l.id === product[field.field]);
              if (location) {
                field.value = location.name
                product[field.field] = location.name
              } else {
                field.value = `Could not find location with ID ${product[field.field]}`;
              }
              break;
            default:
              field.value = product[field.field] ? product[field.field] : "";
          }
        };
        
        this.fields = fields;
        this.loadedProduct = product;
        this.productIsLoading = false;
      } else {
        return sb.notify.toast("No product found.", 1500, "F");
      }
    },
    toggleFieldVisible(field) {
      const idx = this.fields.findIndex((f) => f.field === field.field);
      const fields = [...this.fields];
      const thisField = { ...fields[idx] };
      if (thisField.visible) {
        thisField.visible = false;
      } else {
        thisField.visible = true;
      }
      fields[idx] = { ...thisField };
      this.fields = [...fields];
    },
    handleClose() {
      this.showFieldEditor = false;
    },
    handleOpen() {
      this.showFieldEditor = true;
    },
    handleCustomFieldEditClick() {
      this.showCustomFieldsModal = true;
    },

    async handleSaveSettings() {
      function pxToNum(val) {
        return Number(val.replace("px", ""));
      }
      console.log(this.$refs.fields);
      const cardStats = this.$refs.fields.map((r) => {
        return {
          field: r.$el.dataset.field,
          width: r.$el.style.width,
          height: r.$el.style.height,
          x: r.$el.style.left,
          y: r.$el.style.top,
        };
      });
      console.log("card stats:", cardStats);
      const upsertObject = this.fields.map((field) => {
        const thisStat =
          cardStats[cardStats.findIndex((stat) => stat.field === field.field)];
        return {
          Field: field.field,
          X: pxToNum(thisStat.x),
          Y: pxToNum(thisStat.y),
          Width: pxToNum(thisStat.width),
          Height: pxToNum(thisStat.height),
          Visible: field.visible,
        };
      });
      console.log(upsertObject);
      await sbHttp.post_notify(
        "api/Product/UpsertProductViewSettings",
        upsertObject,
        "Settings saved!"
      );
    },
    async resetCards() {
      const settingsRes = await sbHttp.get_notify(
      "api/Product/GetProductViewSettings",
      null,
      "Could not fetch default field settings for this account."
    );

    const productFields = entityData.products.fields;
    let fields = [];

    let width = 200,
      height = 100,
      x = 15 - width,
      y = 134 - height;
    for (let key in productFields) {
      // Set the pos/size of the card based on fetched settings or new create a new settings object
      const idxOfThisViewSetting = settingsRes.data
        ? settingsRes.data.findIndex((vs) => vs.field === key)
        : -1;
      let thisViewSetting = {};
      if (idxOfThisViewSetting > -1) {
        thisViewSetting = settingsRes.data[idxOfThisViewSetting];
      } else {
        thisViewSetting = {
          width: width,
          height: height,
          x: x + width,
          y: y + height,
          visible: true,
        };
        if (y + height + 15 > 450) {
          y = 134 - height;
          x += width + 15;
        } else {
          y += height + 15;
        }
      }

      fields.push({
        field: key,
        title: productFields[key].friendlyName,
        value: null,
        x: thisViewSetting.x,
        y: thisViewSetting.y,
        width: thisViewSetting.width,
        height: thisViewSetting.height,
        visible: thisViewSetting.visible,
        validation: validations.productValidations[key],
      });
    }

    this.fields = fields;
    }
  },
  async mounted() {
    //Fetch the default settings

    await this.$store.dispatch("getProducts");
    this.resetCards();
  },
  validations() {
    if (this.loadedProduct) {
      console.log(validations.productValidations);
      return { loadedProduct: { ...validations.productValidations } };
    } else {
      return {};
    }
  },
};
</script>

<style scoped>
tr:hover {
  cursor: pointer;
}

.hidden-field {
  color: darkgray;
}

#image-container-outer {
  background: url(~@/assets/school.png);
  background-size: cover;
  opacity: 0.15;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: -1;
  left: 0;
  top: 63px;
}
</style>
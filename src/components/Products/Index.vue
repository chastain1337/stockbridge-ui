

<template>
    
        <div class="container-fluid">
            <div id="image-container-outer">
                    <div id="image-container-inner"></div>
                </div>
            <div class="row mt-3 h-100">
                <div class="col-3 my-auto">
                    <div v-if="!editMode" class="input-group">
                        <input class="form-control" v-model="searchedSKU" placeholder="SKU..." @keypress="handleKeyPress" />
                        <div class="input-group-append">
                            <kendo-button icon="search" type="button" @click="loadProductData"></kendo-button>
                        </div>
                    </div>
                    <div v-else class="text-center font-weight-bold" style="font-size: 12pt">
                        EDIT MODE: Select a card to edit it.
                    </div>
                </div>
                <div class="col">
                    <kendo-button class="mx-1" title="Field selector..." icon="file-add" @click="handleOpen"></kendo-button>
                    <kendo-button class="mx-1" title="Save field settings" icon="save" :disabled="editMode" @click="handleSaveSettings"></kendo-button>
                </div>
                <div class="col d-flex justify-content-end">
                    <kendo-button class="mx-1" title="Add a product..." icon="plus"></kendo-button>
                    <kendo-button key="savebutton" v-if="editMode" class="mx-1" title="Save changes to product" icon="save" :style="unsavedChanges ? 'background-color: lightgreen' : null" @click="handleSaveProduct"></kendo-button>
                    <kendo-button key="editbutton" v-else class="mx-1" title="Enable edit mode" :disabled="!productIsLoaded" icon="pencil" @click="handleEditModeClick"></kendo-button>
                    <kendo-button class="mx-1" title="Delete this produt..." :disabled="!productIsLoaded" icon="delete"></kendo-button>
                    <kendo-button class="mx-1" title="View all products" icon="list-unordered"></kendo-button>
                </div>
                
            </div>
        
            
        <div class="mt-3">
            <div v-if="fields">
                <card v-for="(field,i) in fields" v-show="field.visible" :data-field="field.field" :key="field.field" :field="field" :editMode="editMode" ref="fields" @editCard="handleEditCard" :fieldIndex="i"></card>
            </div>
            <div v-else style="font-size: 14pt">
                <div style="width: 14pt; height: 14pt;" class="spinner-border" role="status"></div> 
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
                    <tr v-for="field in fields" :key="field.field" @click="toggleFieldVisible(field)" :class="field.visible ? null : 'hidden-field'">
                        <td class="align-middle">{{field.title}}</td>
                        <td class="align-middle">{{ field.visible ? "Yes" : "No" }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <dialog-actions-bar>
                <button class="k-button" style="background-color: #dddddd" @click="handleClose">Close</button>
            </dialog-actions-bar>
        </k-dialog>
        


        </div>
</template>

<script>
import Card from "@/Components/Products/Card"
import sbHttp from "@/Shared/sbHttp"
import entityData from "@/Shared/gridEntityData"
import validations from "@/Shared/validations"

export default {
    name: 'Products',
    components: {card: Card},
    data() {
        return {
            searchedSKU: "",
            fields: null,
            showFieldEditor: false,
            productIsLoaded: false,
            editMode: false,
            loadedProduct: null,
            unsavedChanges: false
        }
    },
    methods: {
        handleSaveProduct() {
            this.editMode = false;
            console.log(this.loadedProduct)
        },
        handleEditModeClick() {
            this.editMode = true;
        },
        handleEditCard(fieldName,fieldIndex,newValue) {
            // field validated before emit
            
            // update local version; if this is first update, set unsavedChanges to true
            const product = {...this.loadedProduct}
            const fullValue = isNaN(Number(newValue)) ? newValue : Number(newValue);

            product[fieldName] = fullValue;
            this.loadedProduct = product;
            this.fields[fieldIndex].value = fullValue;
            this.unsavedChanges = true;
            
        },
        loadProductData() {
            const product = this.$store.state.entities.products.data.filter( p => p.sku === this.searchedSKU)[0]
            if (product) {
                this.loadedProduct = {...product}
                const fields = [...this.fields]
                fields.forEach( field => {
                    field.value = product[field.field]
                });
                this.fields = fields;
                this.productIsLoaded = true;
            } else {
                return sb.notify.toast("No product found.",1500,"F");
            }
        },
        toggleFieldVisible(field) {
            const idx = this.fields.findIndex( f => f.field === field.field);
            const fields = [...this.fields];
            const thisField = {...fields[idx]}
            if (thisField.visible) {
                thisField.visible = false;
            } else {
                thisField.visible = true
            }
            fields[idx] = {...thisField}
            this.fields = [...fields];
        },
        handleClose() {
            this.showFieldEditor = false;
        },
        handleOpen() {
            this.showFieldEditor = true;
        },
        handleKeyPress(e) {
            if (e.key === "Enter") this.loadProductData();
        },
        async handleSaveSettings() {

            function pxToNum(val) {
                return Number(val.replace("px",""))
            }
            
                const cardStats = this.$refs.fields.map( r => {
                    return {
                        field: r.$el.dataset.field, 
                        width: r.$el.style.width, 
                        height: r.$el.style.height, 
                        x: r.$el.style.left, 
                        y: r.$el.style.top 
                    }
                });
                const upsertObject = this.fields.map( field => {
                    const thisStat = cardStats[cardStats.findIndex( stat => stat.field === field.field)]
                    return { Field: field.field, X: pxToNum(thisStat.x), Y: pxToNum(thisStat.y), Width: pxToNum(thisStat.width), Height: pxToNum(thisStat.height), Visible: field.visible }
                });
                console.log(upsertObject);
                await sbHttp.post_notify("api/Product/UpsertProductViewSettings",upsertObject,"Settings saved!")
            
        }
    },
    async mounted() {
        //Fetch the default settings
        
        await this.$store.dispatch("getProducts")
        const settingsRes = await sbHttp.get_notify("api/Product/GetProductViewSettings",null,"Could not fetch default field settings for this account.")
        
        const productFields = entityData.products.fields
        let fields = []

        let width = 200, height = 100, x = 15-width, y = 134-height
        for (let key in productFields) {
            const idxOfThisViewSetting = settingsRes.data ? settingsRes.data.findIndex( vs => vs.field === key) : -1;
            let thisViewSetting = {}
            if (idxOfThisViewSetting > -1) {
                thisViewSetting = settingsRes.data[idxOfThisViewSetting]
            } else {
                thisViewSetting = { width: width, height: height, x: x+width, y: y+height, visible: true}
                if (y + height + 15 > 450) {
                    y = 134-height
                    x += width + 15
                } else {
                    y += height + 15
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
                validation: validations.productValidations[key] });
            this.fields = fields


        }
        
        
    },
    validations() {
    if (this.loadedProduct) {
        console.log(validations.productValidations);
        return { loadedProduct: {...validations.productValidations},
        };
    } else {
        return {}
    }
  },

    
}
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
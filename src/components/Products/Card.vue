<template>

<div :id="'card-'+field.field" ref="card" class="card">
    <div :id="'card-'+field.field+'-header'" class="card-header">{{field.title}}</div>
    <div v-if="!entityLoading" class="card-body" :title="entityIsMissing ? 'Click to load entity.' : null" :class="entityIsMissing ? 'missing-entity' : null" @click="entityIsMissing ? cardClickMethod(dispatchMethod) : null">{{value}}</div>
    <div v-else class="card-body text-center"><div class="spinner-border" role="status"></div></div>
</div>


</template>

<script>
export default {
    props: {
        field: Object,
        loadedProduct: Object
    },
    name: "Card",
    data() {
        return {
            entityIsMissing: false,
            entityLoading: false,
            dispatchMethod: ""
        }
    },
    methods: {
        logCoordinates() {
            const card = this.$refs.card
            console.log(card.offsetWidth, card.offsetHeight, card.offsetLeft, card.offsetTop);
        },
        async fetchEntity(dispatchMethod) {
            this.entityLoading = true;
            await this.$store.dispatch(dispatchMethod);
            this.entityLoading = false;
            
        },
        cardClickMethod() {
            if (this.dispatchMethod === "") return;
            this.fetchEntity(this.dispatchMethod);
        }
    },
    mounted() {
        const el = document.getElementById("card-"+this.field.field) 
        //:style="`left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px`"
        el.style.left = this.field.x + 'px';
        el.style.top = this.field.y + 'px';
        el.style.width = this.field.width + 'px';
        el.style.height = this.field.height + 'px';
        dragElement(el);

        function dragElement(elmnt) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    },
    computed: {
        value() {
            if (this.field.value === null) return "";
            switch (this.field.field) {
                case "primaryVendor":
                case "secondaryVendor":
                    if (this.$store.state.entities.vendors.data.length === 0) {
                        this.entityIsMissing = true;
                        this.dispatchMethod = "getVendors"
                        return "Vendors not loaded.";
                    } 
                    this.entityIsMissing = false;
                    return this.$store.state.entities.vendors.data.find( v => v.id === this.field.value).code
                case "location":
                    if (this.$store.state.entities.locations.data.length === 0) {
                        this.entityIsMissing = true;
                        this.dispatchMethod = "getLocations"
                        return "Locations not loaded."
                    }
                    this.entityIsMissing = false;
                    return this.$store.state.entities.locations.data.find( v => v.id === this.field.value).name
                default:
                    return this.field.value;
            }
        }
    }
}
</script>

<style scoped>
    .card {
        position: absolute;
        z-index: 9;
        resize: both;
        
        box-shadow: 2px 2px 2px rgba(0,0,0,0.8);
        overflow: auto;
        background-color: white;
    }

    .card-header {
        cursor: move;
        z-index: 10;
        background-color: bisque;
        padding: .25rem;
    }

    .card-body {
        padding: .25rem;
    }

    .missing-entity {
        background-color: #F4AC90;
    }

    .missing-entity:hover {
        cursor: pointer;
        opacity: 0.8;
    }
</style>
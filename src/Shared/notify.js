import store from "@/store"

const toast = (message,delay=1000,header="") => {
    const id = Date.now()
    const newDiv = document.createElement('div');
    newDiv.setAttribute("class","toast");
    newDiv.setAttribute("role","alert");
    newDiv.setAttribute("id",`${id}`);
    newDiv.setAttribute("data-delay",`${delay}`);
    newDiv.style.backgroundColor = "#c4af9a"
    if (header != "") {
        newDiv.innerHTML = 
        `
        <div class="toast-header"><strong class="mr-auto">${header}</strong><button type="button" class="ml-2 mb-1 close" data-dismiss="toast"><span>&times;</span></button></div>
        `
    }
    
    
    newDiv.innerHTML = `
        ${newDiv.innerHTML}
      <div class="toast-body">
        ${message}
      </div>
    `
    document.getElementById("toast-holder").prepend(newDiv)
    
    $(`#${id}`).toast();
    $(`#${id}`).toast('show');
    window.setTimeout( () => {document.getElementById(`${id}`).remove()},delay+1000 )
}

/**
 * Creates a modal of the type you specify in the settings section.
 * @param {Object} settings - The settings object. Will default to whatever the last modal called was.
 * @param {String} settings.message - Required: the message of the modal.
 * @param {String} settings.affirmText - Default: "OK" The button text to confirm / close the modal.
 * @param {Number} settings.width - Defaults to 800. Do not include 'px'
 * @param {String} settings.headerText - Default: none. Empty string results in no header at all.
 * @param {Function} settings.callback - Default: return. The function to be called after the modal is closed. Really should only use if you need to open another modal right after
*/
const popup = settings => {
  store.commit("notify", settings )
}

export default {
    toast,
    popup
}
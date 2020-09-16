import store from "@/store"

/**
 * Creates a toast in the bottom right of the viewport.
 * @param {String} message - Required. The message to display.
 * @param {Number} delay - Default 1000. Milliseconds to display message.
 * @param {String} header - Default none. Leaving blank or null will render no header.
 * @param {String} type - Default "N" for neutral. Other valid values are "F" (failture), or "S" (success). Changes the background and text color
*/
const toast = (message,delay=1000,type="N",header="") => {
    const id = Date.now()
    const newDiv = document.createElement('div');
    newDiv.setAttribute("class","toast");
    newDiv.setAttribute("role","alert");
    newDiv.setAttribute("id",`${id}`);
    newDiv.setAttribute("data-delay",`${delay}`);
    let backgroundColor, textColor, headerBackgroundColor
    switch (type) {
      case "S":
        backgroundColor = "#21A179"
        headerBackgroundColor = "#136148"
        textColor = "#FFFFFF"
        break
      case "F":
        backgroundColor = "#F4AC90"
        headerBackgroundColor = "#cc6840"
        textColor = "#000000"
        break
      default:
        backgroundColor = "#1E1E24"
        headerBackgroundColor = "#0c0c18"
        textColor = "#FFFFFF"
    }

    if (header != "") {
        newDiv.innerHTML = 
        `
        <div class="toast-header" style="border-bottom: none; background-color: ${headerBackgroundColor}; color: ${textColor};"><strong class="mr-auto">${header}</strong><button type="button" class="ml-2 mb-1 close" data-dismiss="toast"><span>&times;</span></button></div>
        `
    }
    
    newDiv.innerHTML = `
        ${newDiv.innerHTML}
      <div class="toast-body" style="background-color: ${backgroundColor}; color: ${textColor};">
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
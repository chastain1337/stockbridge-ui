import Axios from "axios";

/**
 * @typedef {Object} DbResponse
 * @property {Object} data - Dynamic type. The data returned from a successful request
 * @property {Boolean} success - Whether the request was successful or not
 * @property {[String]} errors - Any errors that occured
 */

/**
 * Construct a DbReponse from an error, either returned from the server or JavaScript
 * @param {Exception} err
 * @returns {DbResponse}
 */
const _constructReturnObject = err => {
  if (err.response) {
    // This came from the server
    if (err.response.data.errors) {
      if (err.response.data.success != null) {
        //This is an intentional DbResponse that contains errors
        return err.response.data;
      } else {
        return { data: null, success: false, errors: [err.response.data.title]}
      }
    } else {
      // This is an error returned from a different issue
      return { data: null, success: false, errors: [err.data] };
    }
  } else {
    // This came form javascript
    return { data: null, success: false, errors: [`${err}`] };
  }
};

/**
 * Toast if failure based on the errors provided.
 * @param {DbResponse} returnObj 
 * @param {Exception} err 
 * @param {String} failMessage
 */
const _failToast = (returnObj, err,failMessage) => {
    const errMessages = returnObj.errors.join(" | ");
    console.error(errMessages);
    const toastMessage = failMessage.replace("!errs!", errMessages);
    const headerMessage = err.response
      ? `${err.response.status} - ${err.response.statusText}`
      : "Error - Unknown";
    sb.notify.toast(toastMessage, 7000, "F", headerMessage);
}


/**
 * Makes a POST request that optionally toasts with a notification on success or fail. Server return type must be DbReponse. Resolves in every path.
 * @param {String} url - Required. The URL to post to.
 * @param {Object|Array} data - Required. The data to send up.
 * @param {String} successMessage - Default = "Success". If null, no notification will be given.
 * @param {String} failMessage  - Default = "Error(s): {error message(s), | delminted}". If null, no notification will be given. Use '!errs!' in your string to include | delminited error messages.
 * @returns {DbResponse}
 */
const post_notify = (
  url,
  data,
  successMessage = "Success",
  failMessage = "Error(s): !errs!",
) => {
  return new Promise(resolve => {
    Axios.post(url, data)
      .then(res => {
        if (successMessage != null) {
          sb.notify.toast(successMessage, 5000, "S");
        }
        resolve(res.data);
      })
      .catch(err => {
        const returnObj = _constructReturnObject(err);
        if (failMessage != null) {
          _failToast(returnObj,err,failMessage)
        }
        resolve(returnObj);
      });
  });
};

/**
 * Makes a GET request that optionally toasts with a notification on success or fail. Server return type must be DbReponse. Resolves in every path.
 * @param {String} url - Required. The URL to post to.
 * @param {String} successMessage - Default = "Success". If null, no notification will be given.
 * @param {String} failMessage  - Default = "Error(s): {error message(s), | delminted}". If null, no notification will be given. Use '!errs!' in your string to include | delminited error messages.
 * @returns {DbResponse}
 */
const get_notify = (
  url,
  successMessage = "Success",
  failMessage = "Error(s): !errs!",
) => {
  return new Promise(resolve => {
    Axios.get(url)
      .then(res => {
        if (successMessage != null) {
          sb.notify.toast(successMessage, 5000, "S");
        }
        resolve(res.data);
      })
      .catch(err => {
        const returnObj = _constructReturnObject(err);
        if (failMessage != null) {
            _failToast(returnObj,err,failMessage);
        }
        resolve(returnObj);
      });
  });
};

export default {
  post_notify,
  get_notify
};

import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

function showToast(message, backgroundColor = "#333") {
    Toastify({
        text: message,
        duration: 3000, // Duration in milliseconds
        gravity: "bottom", // Position vertically: 'top' or 'bottom'
        position: "right", // Position horizontally: 'left', 'center', or 'right'
        backgroundColor, // Background color
        close: true, // Show close button
    }).showToast();
}

export function showErrorToast(message) {
    showToast(message, '#fe2424');
}

export function showSuccessToast(message) {
    showToast(message, '#50fe24');
}

export function showWarningToast(message) {
    showToast(message, '#fee524');
}
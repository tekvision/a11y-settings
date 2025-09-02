export let handleDialogAccessibility = (dialogElement, closeElement, overlayIcon) => {
    handleClosePopupClick(dialogElement, closeElement, overlayIcon);
    handleModalFocusTrapAndClose(dialogElement, closeElement, overlayIcon);
    handleOverlayIconClick(overlayIcon, dialogElement);
}

let handleClosePopupClick = (dialogElement, closeElement, overlayIcon) => {
    closeElement.addEventListener("click", (e) => {
        dialogElement.style.display = "none";
        overlayIcon.style.display = "block";
        overlayIcon.focus();
    });
}

let handleOverlayIconClick = (overlayIcon, dialogElement) => {
    overlayIcon.addEventListener("click", (e) =>{
        dialogElement.style.display = "block";
        overlayIcon.style.display = "none";
        document.getElementById("blackOnWhite").focus();
    });
    overlayIcon.addEventListener("keydown", (e) =>{
        if(e.keyCode === 13 || e.keyCode === 32 || e.which === 1){
            dialogElement.style.display = "block";
            overlayIcon.style.display = "none";
            document.getElementById("blackOnWhite").focus();
        }
    });
}

export let handleRevertAll = (revertAll) =>{
    revertAll.addEventListener("keydown", (e)=>{
        if(e.keyCode === 13 || e.keyCode === 32 || e.which === 1){
            revertAll.click();
        }
    });
    revertAll.addEventListener("click", (e) => {
        localStorage.removeItem("cc_enhancer");
        localStorage.removeItem("fontStyle");
        localStorage.removeItem("fontSize");
        localStorage.removeItem("sliderPosition");
        localStorage.removeItem("focusVisiblityToggle");
        localStorage.removeItem("textAlign");
        localStorage.removeItem("isHighlightLinkEnabled");
        window.location.reload(true);
    });
}

let getFocusableElements = (dialogElement) => {
    if (dialogElement) {
        let allFocusableElements = dialogElement.querySelectorAll('a, button, input:not([type="hidden"]), textarea, select, details,[tabindex]:not([tabindex="-1"])');
        if (allFocusableElements !== null) {
            let focusableElements = [];
            allFocusableElements.forEach((ele) => {
                ele.parentNode.style.display !== "none" && focusableElements.push(ele);
            });
            return focusableElements;
        }
    }
}

let handleModalFocusTrapAndClose = (dialogElement, closeIcon, dialogInvokerElement) => {
    let focusableElements = getFocusableElements(dialogElement);
    let firstFocusableElement = focusableElements[0];
    let lastFocusableElement = focusableElements[focusableElements.length - 1];

    $(dialogElement).keydown(function (e) {
        //Tab key and shift + tab key navigation inside modal
        if (e.keyCode === 9 && e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                e.preventDefault();
                lastFocusableElement.focus();
            }
        }
        else if (e.keyCode === 9) {
            if (document.activeElement === lastFocusableElement) {
                e.preventDefault();
                firstFocusableElement.focus();
            }
        }
        else if (e.keyCode === 27) {
            $(closeIcon).click();
            $(dialogInvokerElement).focus();
        }
    });
    $(closeIcon).on("keydown click", function (e) {
        if (e.keyCode === 13 || e.keyCode === 32 || e.which === 1) {
            e.preventDefault();
            $(closeIcon).click()
            $(dialogInvokerElement).focus();
        }
    });
}
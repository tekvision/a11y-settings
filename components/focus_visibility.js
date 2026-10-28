import $ from "jquery";
import { isNestedUnderParent } from "./global.js";

var body = document.querySelector("body");
let isOutlineToggled = false;
// Weakly keyed so elements removed from the DOM can be garbage-collected.
let defaultFocusBorder = new WeakMap();
let focusOutlineColor = new WeakMap();
let elementsWithFocusListeners = new WeakSet();
let focusObserver = null;

let getAllFocusableElements = () => {
    let allFocusableElements = document.querySelectorAll(`body a:not(.overlay-popup *):not(.context-menu-container *), 
        body button:not(.overlay-popup *):not(.context-menu-container *),
        body input:not(.overlay-popup *):not(.context-menu-container *):not([type='hidden']),
        body *[tabindex]:not(.overlay-popup *):not(.context-menu-container *),
        body select:not(.overlay-popup *):not(.context-menu-container *),
        body textarea:not(.overlay-popup *):not(.context-menu-container *),
        body summary:not(.overlay-popup *):not(.context-menu-container *)`);
    return allFocusableElements;
}

export let isFocusable = (ele) => {
    const focusableElements = ['a', 'audio', 'button', 'canvas', 'details', 'iframe', 'input', 'select', 'summary', 'textarea', 'video'];
    let tagName = ele.tagName.toLowerCase();
    if (focusableElements.includes(tagName) || ele.hasAttribute("accesskey") || ele.hasAttribute("contenteditable") || (ele.hasAttribute("tabindex")) || (tagName === "a" && ele.hasAttribute("href"))) {
        return true;
    }
    return false;
}

export let handleFocusVisibility = (button) => {
    handleFocusIndicatorStickiness();
    if (button) {
        button.addEventListener("click", function () {
            toggleFocusVisibility(button, getAllFocusableElements());
        });
        button.addEventListener("keydown", function(e){
            if (e.keyCode === 13 || e.keyCode === 32 || e.which === 1) {
                toggleFocusVisibility(button, getAllFocusableElements());
            }
        });
    }
}

let startObservingNodeChanges = () => {
    if (focusObserver) return;
    focusObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                handleUpdatedNodes(mutation.addedNodes);
            }
            else if (mutation.type === "attributes" && mutation.attributeName === "tabindex") {
                if (!localStorage.getItem("focusVisiblityToggle")) return;
                const element = mutation.target;
                saveOriginalStyles(element);
                checkDefaultColorAndApplyBorder(element);
            }
        });
    });
    focusObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["tabindex"] });
}

let stopObservingNodeChanges = () => {
    if (!focusObserver) return;
    focusObserver.disconnect();
    focusObserver = null;
}

function handleUpdatedNodes(addedNodes) {
    const elementsToTrack = [...addedNodes];
    while (elementsToTrack.length > 0) {
        const element = elementsToTrack.shift();
        if (element.nodeType === Node.ELEMENT_NODE && localStorage.getItem("focusVisiblityToggle")) {
            if (!isNestedUnderParent(element, "#ada-overlay-widget-container")) {
                saveOriginalStyles(element);
                isFocusable(element) ? checkDefaultColorAndApplyBorder(element) : "";
            }

            if (element.hasChildNodes()) {
                elementsToTrack.push(...element.childNodes);
            }
        }
    }
}

let handleFocusIndicatorStickiness = () => {
    if (localStorage.getItem("focusVisiblityToggle")) {
        let button = document.querySelector("#focusVisiblityToggle");
        isOutlineToggled = true;
        toggleFocusVisibility(button, getAllFocusableElements());
    }
}

let toggleFocusVisibility = (button, allFocusable) => {
    let overlayIcon = document.getElementById("overlay-icon");
    handlePressedState(button);
    allFocusable.forEach((ele) => {
        checkDefaultColorAndApplyBorder(ele);
    });
    //As overlay icon won't have any CC enhancement we need to handle it separately otherwise above code would work.
    checkDefaultColorAndApplyBorder(overlayIcon);
}

let checkDefaultColorAndApplyBorder = (element) => {
    if (localStorage.getItem("cc_enhancer")) {
        switch (localStorage.getItem("cc_enhancer")) {
            case "blackOnWhite": toggleBorder(element, "focusVisible-On_black"); break;
            case "whiteOnBlack": toggleBorder(element, "focusVisible-On_white"); break;
            case "yellowOnBlack": toggleBorder(element, "focusVisible-On_yellow"); break;
            case "blackOnYellow": toggleBorder(element, "focusVisible-On_black"); break;
            default: setOverlayDefaultBorder(element, "focusVisible-overlay-default"); break;
        }
    }
    else {
        setOverlayDefaultBorder(element, "focusVisible-overlay-default");
    }
}

let handlePressedState = (button) =>{
    if(button.getAttribute("aria-checked") === "false"){
        button.setAttribute("aria-checked", "true");
        button.classList.add("active");
        $(button).find("#visibilityStatus").text("On");
        isOutlineToggled = true;
        localStorage.setItem("focusVisiblityToggle", $(button).find("#visibilityStatus").text());
        startObservingNodeChanges();
    }
    else{
        button.setAttribute("aria-checked", "false");
        button.classList.remove("active");
        $(button).find("#visibilityStatus").text("Off");
        isOutlineToggled = false;
        localStorage.removeItem("focusVisiblityToggle", $(button).find("#visibilityStatus").text())
        stopObservingNodeChanges();
    }
}

// Listeners are attached once per element; later calls only update the outline color they apply.
let applyFocusOutline = (ele, outlineColor) => {
    if (!ele) return;
    focusOutlineColor.set(ele, outlineColor);
    if (elementsWithFocusListeners.has(ele)) return;
    elementsWithFocusListeners.add(ele);

    ele.addEventListener("focus", () => {
        if (isOutlineToggled) {
            let computedStyle = window.getComputedStyle(ele);
            if (computedStyle.getPropertyValue('outline')) {
                saveOriginalStyles(ele);
                updateFocusBorder(ele, focusOutlineColor.get(ele));
            }
        }
    });

    ele.addEventListener("blur", () => {
        ele.classList.remove("focusVisible-On_black", "focusVisible-On_white", "focusVisible-On_yellow", "focusVisible-overlay-default");
        ele.style.removeProperty('outline');
    });
}

export let toggleBorder = (ele, outlineColor) => {
    applyFocusOutline(ele, outlineColor);
}

export let setOverlayDefaultBorder = (ele, outlineColor) => {
    applyFocusOutline(ele, outlineColor);
}

let saveOriginalStyles = (ele) => {
    if (!defaultFocusBorder.has(ele)) {
        defaultFocusBorder.set(ele, {
            style: ele.getAttribute("style"),
            outline: ele.style.outline
        });
    }
}

let updateFocusBorder = (ele, outlineColor) => {
    ele.classList.remove("focusVisible-On_black", "focusVisible-On_white", "focusVisible-On_yellow", "focusVisible-overlay-default");
    ele.style.removeProperty('outline');
    ele.classList.add(outlineColor);
    switch (outlineColor) {
        case "focusVisible-On_black": setMandatoryOutline(ele, "solid black 2px"); break;
        case "focusVisible-On_white": setMandatoryOutline(ele, "solid white 2px"); break;
        case "focusVisible-On_yellow": setMandatoryOutline(ele, "solid yellow 2px"); break;
        case "focusVisible-On_black": setMandatoryOutline(ele, "solid black 2px"); break;
        default: setMandatoryOutline(ele, "solid rgba(0, 105, 164, 1) 3px"); break;
    }
}

let setMandatoryOutline = (ele, outline) => {
    ele.style.setProperty("outline", outline, "important");
}


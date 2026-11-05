import $ from "jquery";
import { isNestedUnderParent, isCustomOverlayTrigger } from "./global.js";

let textAlignmentToggled = false;
// Weakly keyed so elements removed from the DOM can be garbage-collected.
let defaultAlignment = new WeakMap();
let fontObserver = null;
const fontClasses = ['fontArial', 'fontCalibri', 'fontComicSans', 'fontVerdana', 'fontTahoma', 'fontCenturyGothic'];

export let handleFontStyles = (fontStyleInput, fontStyleList) => {
    handleFontStyleStickiness(fontStyleInput, fontStyleList);
    fontStyleList.querySelectorAll("[role='option']").forEach(option =>{
        option.addEventListener("click", (e) => {
            selectDyslexicFont(option.id === "font-system-default" ? null : option.textContent.trim());
            selectOption(fontStyleInput, fontStyleList, option);
        });
        option.addEventListener("keydown", (e)=>{
            if(e.keyCode === 13 || e.keyCode === 32 || e.which === 1){
                selectDyslexicFont(option.id === "font-system-default" ? null : option.textContent.trim());
                selectOption(fontStyleInput, fontStyleList, option);
            }
        })
    });

    document.querySelector(".revertFontStyle").addEventListener("click", function () {
        revertFontStyle(fontStyleList, fontStyleInput);
    });
    document.querySelector(".revertFontStyle").addEventListener("keydown", function (e) {
        if (e.keyCode === 13 || e.keyCode === 32 || e.which === 1) {
            revertFontStyle(fontStyleList, fontStyleInput);
        }
    });
}

// Shared by font style and text alignment; runs only while one of them is active.
function syncNodeObserver() {
    const isActive = localStorage.getItem("fontStyle") || localStorage.getItem("textAlign");
    if (isActive && !fontObserver) {
        fontObserver = new MutationObserver((mutations) => {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    handleUpdatedNodes(mutation.addedNodes);
                }
            });
        });
        fontObserver.observe(document.body, { childList: true, subtree: true });
    }
    else if (!isActive && fontObserver) {
        fontObserver.disconnect();
        fontObserver = null;
    }
}

function handleUpdatedNodes(addedNodes) {

    const elementsToTrack = [...addedNodes];
    while (elementsToTrack.length > 0) {
        const element = elementsToTrack.shift();
        if (element.nodeType === Node.ELEMENT_NODE) {
            if (isCustomOverlayTrigger(element)) continue;
            if (!isNestedUnderParent(element, "#ada-overlay-widget-container")) {
                if (localStorage.getItem("fontStyle")) {
                    let option = document.getElementById(localStorage.getItem("fontStyle"));
                    if (option) {
                        updateFontFamily(element, option.textContent.trim());
                    }
                }
                if (localStorage.getItem("textAlign")) {
                    let option = localStorage.getItem("textAlign");
                    saveOriginalAlignment(element);
                    updateAlignment(element, option);
                }
            }

            if (element.hasChildNodes()) {
                elementsToTrack.push(...element.childNodes);
            }
        }
    }
}

function handleFontStyleStickiness(fontStyleInput, fontStyleList) {
    if (localStorage.getItem("fontStyle")) {
        let option = fontStyleList.querySelector("#" + localStorage.getItem("fontStyle"));
        if (!option) {
            selectDyslexicFont(null);
            localStorage.removeItem("fontStyle");
            return;
        }
        selectDyslexicFont(option.id === "font-system-default" ? null : option.textContent.trim());
        selectOption(fontStyleInput, fontStyleList, option);
    }
}

export let enlargeFont = (size) =>
{
    let allElements = document.querySelectorAll("body, body *:not(.ada-overlay-widget-container *)");
    allElements.forEach((ele) =>{
        if (isCustomOverlayTrigger(ele)) return;
        ele.classList.remove('font12', 'font14', 'font16', 'font18', 'font20', 'font22', 'font24', 'font26', 'font28', 'font30');
        ele.classList.add(`font${size}`);
    });
}

export let handleTextAlignment = (alignmentOptions) => {
    handleTextAlignmentStickiness(alignmentOptions);
    alignmentOptions.forEach(option => {
        option.addEventListener("click", (e) => {
            if ((option.hasAttribute("style")) && (option.getAttribute("style").includes("text-align"))) {
                defaultStyle[option] = option.getAttribute("style");
                option.removeAttribute("style");
                handlePressedState(alignmentOptions, option);
            }
            else {
                handlePressedState(alignmentOptions, option);
            }
            
        });
        option.addEventListener("keydown", (e) =>{
            if(e.keyCode === 13 || e.keyCode === 32 || e.which === 1)
            {
                if ((option.hasAttribute("style")) && (option.getAttribute("style").includes("text-align"))) {
                    defaultStyle[option] = option.getAttribute("style");
                    option.removeAttribute("style");
                    handlePressedState(alignmentOptions, option);
                }
                else {
                    handlePressedState(alignmentOptions, option);
                }
            }
        });
    });
}

function handleTextAlignmentStickiness(alignmentOptions) {
    if (localStorage.getItem("textAlign")) {
        let option = document.querySelector("#" + localStorage.getItem("textAlign"));
        textAlignmentToggled = true;
        handlePressedState(alignmentOptions, option);
    }
}

/*Font Style Helpers */
let selectDyslexicFont = (fontFamily) =>
{
    var allElementsForFontStyle = document.querySelectorAll("body, body *:not(.ada-overlay-widget-container *):not(.fa):not([class*='fa'])");
    allElementsForFontStyle.forEach((ele) => {
        if (isCustomOverlayTrigger(ele)) return;
        updateFontFamily(ele, fontFamily);
    });
}

let selectOption = (fontStyleInput, fontStyleList, option) =>{
    $(fontStyleList).children().attr("aria-selected", "false").removeClass("active");
    option.setAttribute("aria-selected", "true");
    option.classList.add("active");
    $(fontStyleInput).find(".text").text(option.textContent.trim());
    $(fontStyleList).removeClass("showListbox");
    $(fontStyleInput).attr("aria-expanded", "false").focus();
    $(fontStyleList).children().attr("tabindex", "-1");
    if (option.id === "font-system-default") {
        localStorage.removeItem("fontStyle");
    }
    else {
        localStorage.setItem("fontStyle", option.id);
    }
    syncNodeObserver();
}

let updateFontFamily = (ele, fontFamily) => {
    const fontClass = fontFamily ? `font${fontFamily.replace(/\s/g, "")}` : null;
    if (fontClass && ele.classList.contains(fontClass)) return;
    const appliedClasses = fontClasses.filter(className => ele.classList.contains(className));
    if (appliedClasses.length) ele.classList.remove(...appliedClasses);
    if (!fontFamily) return;
    const currentFont = window.getComputedStyle(ele).getPropertyValue("font-family").split(",")[0].trim().replace(/["']/g, "");
    if (currentFont.toLowerCase() === fontFamily.toLowerCase()) return;
    ele.classList.add(fontClass);
}

/*Text alignment helpers */
let handleAlignmentChange = (option) => {
    var allElements = document.querySelectorAll("body, body *:not(.ada-overlay-widget-container *)");
    allElements.forEach((ele) => {
        if (isCustomOverlayTrigger(ele)) return;
        if (textAlignmentToggled) {
            let computedStyles = window.getComputedStyle(ele);
            if (computedStyles.getPropertyValue("text-align")) {
                saveOriginalAlignment(ele);
                updateAlignment(ele, option);
            }
            else {
                updateAlignment(ele, option);
            }
        }
        else {
            ele.classList.remove("textLeft", "textCenter", "textRight");
            revertAlignmentToDefault(ele);
        }
    });
}

let handlePressedState = (alignmentOptions, option) =>{
    if ($(option).attr("aria-pressed") === "false") {
        $(alignmentOptions).attr("aria-pressed", "false").removeClass("active");
        textAlignmentToggled = true;
        $(option).attr("aria-pressed", "true").addClass("active");
        handleAlignmentChange(option.id);
        localStorage.setItem("textAlign", option.id);
        syncNodeObserver();

    }
    else {
        $(alignmentOptions).attr("aria-pressed", "false").removeClass("active");
        textAlignmentToggled = false;
        $(option).attr("aria-pressed", "false").removeClass("active");
        handleAlignmentChange(option.id);
        localStorage.removeItem("textAlign");
        syncNodeObserver();
    }
}

let revertFontStyle = (fontStyleList, fontStyleInput) => {
    selectDyslexicFont(null);
    selectOption(fontStyleInput, fontStyleList, fontStyleList.querySelector("#font-system-default"));
    $("#overlay-announcement .announce").text("Font Style Reverted!");
    setTimeout(() => { $("#overlay-announcement .announce").text(""); }, 100);
}

let saveOriginalAlignment = (ele) => {
    if (!defaultAlignment.has(ele)) {
        defaultAlignment.set(ele, {
            style: ele.getAttribute("style"),
            textAlignment: window.getComputedStyle(ele).getPropertyValue('text-align')
        });
    }
}

let updateAlignment = (ele, option) => {
    ele.classList.remove("textLeft", "textCenter", "textRight");
    ele.style.removeProperty('text-align');
    ele.classList.add(option);
}

let revertAlignmentToDefault = (ele) => {
    if (ele.hasAttribute("style")) {
        let originalTextAlignment = defaultAlignment.get(ele)?.textAlignment;
        let originalStyle = defaultAlignment.get(ele)?.style;
        (originalTextAlignment && (originalStyle && originalStyle.includes("text-align"))) ? ele.style.textAlign = originalTextAlignment : ele.style.removeProperty("text-align");
    }
}
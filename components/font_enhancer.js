import { isNestedUnderParent } from "./global.js";

let textAlignmentToggled = false;
let isFontStyleToggled = false;
let defaultFontFamily = [];
let defaultAlignment = [];
let processedElementsForAlignments = new Set();
let processedElementsForFontFamily = new Set();

export let handleFontStyles = (fontStyleInput, fontStyleList) => {
    observeNodeChanges();
    handleFontStyleStickiness(fontStyleInput, fontStyleList);
    fontStyleList.querySelectorAll("[role='option']").forEach(option =>{
        option.addEventListener("click", (e) => {
            selectDyslexicFont(option.innerText.replace(" ", ""));
            selectOption(fontStyleInput, fontStyleList, option);
            isFontStyleToggled = true;
        });
        option.addEventListener("keydown", (e)=>{
            if(e.keyCode === 13 || e.keyCode === 32 || e.which === 1){
                selectDyslexicFont(option.innerText.replace(" ", ""));
                selectOption(fontStyleInput, fontStyleList, option);
                isFontStyleToggled = true;
            }
        })
    });

    document.querySelector(".revertFontStyle").addEventListener("click", function () {
        let allElements = document.querySelectorAll("body, body *:not(.ada-overlay-widget-container *)");
        allElements.forEach((ele) => {
            if (isFontStyleToggled) {
                revertFontStyle(ele, fontStyleList, fontStyleInput);
            }
        });
    });
    document.querySelector(".revertFontStyle").addEventListener("keydown", function (e) {
        if (e.keyCode === 13 || e.keyCode === 32 || e.which === 1) {
            let allElements = document.querySelectorAll("body, body *:not(.ada-overlay-widget-container *)");
            allElements.forEach((ele) => {
                if (isFontStyleToggled) {
                    revertFontStyle(ele, fontStyleList, fontStyleInput);
                }
            });
        }
    });
}

function observeNodeChanges() {
    let observer = new MutationObserver((mutations) => {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                handleUpdatedNodes(mutation.addedNodes);
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

function handleUpdatedNodes(addedNodes) {

    const elementsToTrack = [...addedNodes];
    while (elementsToTrack.length > 0) {
        const element = elementsToTrack.shift();
        if (element.nodeType === Node.ELEMENT_NODE) {
            if (!isNestedUnderParent(element, "#ada-overlay-widget-container")) {
                if (localStorage.getItem("fontStyle")) {
                    let option = fontStyleList.querySelector("#" + localStorage.getItem("fontStyle"));
                    saveOriginalFontFamily(element);
                    updateFontFamily(element, option.innerText.trim().replace(" ", ""));
                }
                else if (localStorage.getItem("textAlign")) {
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
        selectDyslexicFont(option.innerText.trim().replace(" ", ""));
        selectOption(fontStyleInput, fontStyleList, option);
        isFontStyleToggled = true;
    }
}

export let enlargeFont = (size) =>
{
    let allElements = document.querySelectorAll("body, body *:not(.ada-overlay-widget-container *)");
    allElements.forEach((ele) =>{
        ele.classList.remove('font12', 'font14', 'font16', 'font18', 'font20', 'font22', 'font24', 'font26', 'font28', 'font30');
        ele.classList.add(`font${size}`);
    });
}

export let handleTextAlignment = (alignmentOptions) => {
    observeNodeChanges();
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
        let computedStyles = window.getComputedStyle(ele);
        if (computedStyles.getPropertyValue("font-family")) {
            saveOriginalFontFamily(ele);
            updateFontFamily(ele, fontFamily);
        }
        else {
            updateFontFamily(ele, fontFamily);
        }
    });
}

let selectOption = (fontStyleInput, fontStyleList, option) =>{
    $(fontStyleList).children().attr("aria-selected", "false").removeClass("active");
    option.setAttribute("aria-selected", "true");
    option.classList.add("active");
    $(fontStyleInput).find(".text").text(option.innerText);
    $(fontStyleList).removeClass("showListbox");
    $(fontStyleInput).attr("aria-expanded", "false").focus();
    $(fontStyleList).children().attr("tabindex", "-1");
    localStorage.setItem("fontStyle", option.id);
}

let saveOriginalFontFamily = (ele) => {
    if (!processedElementsForFontFamily.has(ele)) {
        processedElementsForFontFamily.add(ele);
        defaultFontFamily.push({
            element: ele,
            style: ele.getAttribute("style"),
            fontFamily: window.getComputedStyle(ele).getPropertyValue('font-family')
        });
    }
}

let updateFontFamily = (ele, fontFamily) => {
    ele.classList.remove('fontArial', 'fontCalibri', 'fontComicSans', 'fontVerdana', 'fontTahoma', 'fontCenturyGothic');
    ele.classList.add(`font${fontFamily}`);
}

/*Text alignment helpers */
let handleAlignmentChange = (option) => {
    var allElements = document.querySelectorAll("body, body *:not(.ada-overlay-widget-container *)");
    allElements.forEach((ele) => {
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

    }
    else {
        $(alignmentOptions).attr("aria-pressed", "false").removeClass("active");
        textAlignmentToggled = false;
        $(option).attr("aria-pressed", "false").removeClass("active");
        handleAlignmentChange(option.id);
        localStorage.removeItem("textAlign");
    }
}

let revertFontStyle = (ele, fontStyleList, fontStyleInput) => {
    if (ele.hasAttribute("style")) {
        let originalFontFamily = defaultFontFamily.find(entry => entry.element === ele)?.fontFamily;
        let originalStyle = defaultFontFamily.find(entry => entry.element === ele)?.style;
        (originalFontFamily && (originalStyle && originalStyle.includes('font-family'))) ? ele.style.fontFamily = originalFontFamily : "";
        ele.classList.remove('fontArial', 'fontCalibri', 'fontComicSans', 'fontVerdana', 'fontTahoma', 'fontCenturyGothic');
        $(fontStyleList).children().attr("aria-selected", "false").removeClass("active");
        $(fontStyleInput).find(".text").text("Arial");
        $("#overlay-announcement .announce").text("Font Style Reverted!");
        setTimeout(() => { $("#overlay-announcement .announce").text(""); }, 100);
        localStorage.removeItem("fontStyle");
    }
    else {
        ele.classList.remove('fontArial', 'fontCalibri', 'fontComicSans', 'fontVerdana', 'fontTahoma', 'fontCenturyGothic');
        $(fontStyleList).children().attr("aria-selected", "false").removeClass("active");
        $(fontStyleInput).find(".text").text("Arial");
        $("#overlay-announcement .announce").text("Font Style Reverted!");
        setTimeout(() => { $("#overlay-announcement .announce").text(""); }, 100);
        localStorage.removeItem("fontStyle");
    }
}

let saveOriginalAlignment = (ele) => {
    if (!processedElementsForAlignments.has(ele)) {
        processedElementsForAlignments.add(ele);
        defaultAlignment.push({
            element: ele,
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
        let originalTextAlignment = defaultAlignment.find(entry => entry.element === ele)?.textAlignment;
        let originalStyle = defaultAlignment.find(entry => entry.element === ele)?.style;
        (originalTextAlignment && (originalStyle && originalStyle.includes("text-align"))) ? ele.style.textAlign = originalTextAlignment : ele.style.removeProperty("text-align");
    }
}
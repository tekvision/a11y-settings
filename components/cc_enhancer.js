import { isFocusable, setOverlayDefaultBorder, toggleBorder } from "./focus_visibility.js";
import { isNestedUnderParent } from "./global.js";

let isContrastEnabled = false;
let defaultStyle = [];
let processedElements = new Set(); //This will ensure that there is unique element entries while setting up the default styles.
let defaultSVGStyle = [];
let processedSVGElements = new Set(); //This will ensure that there is unique element entries while setting up the default styles.

export let handleColorContrastEnhancements = (colorOptions) => {
    observeNodeChanges();
    handleColorStickiness(colorOptions);
    colorOptions.forEach(option => {
        option.addEventListener("click", (e) => {
            handlePressedState(colorOptions, option);
        });
        option.addEventListener("keydown", (e) => {
            if (e.keyCode === 13 || e.keyCode === 32 || e.which === 1) {
                handlePressedState(colorOptions, option);
            }
        });
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
        if (element.nodeType === Node.ELEMENT_NODE && localStorage.getItem("cc_enhancer")) {
            if (!isNestedUnderParent(element, "#ada-overlay-widget-container") && !isNestedUnderParent(element, "#chart_container")) {
                saveOriginalStyles(element);
                updateColor(element, localStorage.getItem('cc_enhancer'));
                updateSVGs(element, localStorage.getItem('cc_enhancer'));
            }
            else {
                let tagName = element.tagName.toLowerCase();
                if (!tagName === "svg" || element.parentNode?.tagName === "svg" || tagName === "text") {
                    saveOriginalSVGStyles(element);
                    updateHighCharts(element, localStorage.getItem('cc_enhancer'));
                }
                else {
                    updateColor(element, localStorage.getItem("cc_enhancer"));
                }
            }

            if (element.hasChildNodes()) {
                elementsToTrack.push(...element.childNodes);
            }
        }
    }
}

let handleColorStickiness = (colorOptions) => {
    if (localStorage.getItem("cc_enhancer")) {
        let button = document.querySelector("#" + localStorage.getItem("cc_enhancer"));
        isContrastEnabled = true;
        handlePressedState(colorOptions, button);
    }
}

let handleColorChange = (colorCombination) => {
    let allElements = document.querySelectorAll("body, body *:not(#ada-overlay-widget-container *):not(svg):not(svg *)");
    let overlayIcon = document.getElementById("overlay-icon");
    allElements.forEach((ele) => {
        if (isContrastEnabled) {
            let computedStyles = window.getComputedStyle(ele);
            if (computedStyles.getPropertyValue('background-color') || computedStyles.getPropertyValue('color')) {
                saveOriginalStyles(ele);
                updateColor(ele, colorCombination);
            }
            else {
                updateColor(ele, colorCombination);
            }
        }
        else {
            ele.classList.remove("yellowOnBlack", "blackOnYellow", "whiteOnBlack", "blackOnWhite");
            setColorToDeafult(ele);
            setOverlayDefaultBorder(ele, "focusVisible-overlay-default");
            setOverlayDefaultBorder(overlayIcon, "focusVisible-overlay-default");
        }
    });
    let allGraphics = document.querySelectorAll("body svg:not(#radar-summary svg):not(#chart_container svg), body svg:not(#radar-summary svg):not(#chart_container svg) *");
    allGraphics.forEach((ele) => {
        if (isContrastEnabled) {
            let computedStyles = window.getComputedStyle(ele);
            if (computedStyles.getPropertyValue("fill") || computedStyles.getPropertyValue("stroke") || ele.hasAttribute("fill") || ele.hasAttribute("stroke")) {
                saveOriginalSVGStyles(ele);
                updateSVGs(ele, colorCombination);
            }
            else {
                updateSVGs(ele, colorCombination);
            }
        }
        else {
            setSVGColorsToDefault(ele);
            isFocusable(ele) && toggleBorder(ele, "focusVisible-overlay-default");
            setOverlayDefaultBorder(overlayIcon, "focusVisible-overlay-default");
        }
    });

    let highCharts = document.querySelectorAll("body #chart_container svg, body #chart_container svg > *, body #chart_container svg text");
    if (highCharts) {
        highCharts.forEach((ele) => {
            if (isContrastEnabled) {
                let computedStyles = window.getComputedStyle(ele);
                if (computedStyles.getPropertyValue("fill") || computedStyles.getPropertyValue("stroke") || ele.hasAttribute("fill") || ele.hasAttribute("stroke")) {
                    saveOriginalSVGStyles(ele);
                    updateHighCharts(ele, colorCombination);
                }
                else {
                    updateHighCharts(ele, colorCombination);
                }
            }
            else {
                setSVGColorsToDefault(ele);
                isFocusable(ele) && toggleBorder(ele, "focusVisible-overlay-default");
                setOverlayDefaultBorder(overlayIcon, "focusVisible-overlay-default");
            }
        });
    }

    let summaryRadar = document.querySelectorAll("body #radar-summary svg, body #radar-summary svg *");
    summaryRadar.forEach((ele) => {
        if (isContrastEnabled) {
            let computedStyles = window.getComputedStyle(ele);
            if (computedStyles.getPropertyValue("fill") || computedStyles.getPropertyValue("stroke") || ele.hasAttribute("fill") || ele.hasAttribute("stroke")) {
                saveOriginalSVGStyles(ele);
                updateSummaryRadar(ele, colorCombination);
            }
            else {
                updateSummaryRadar(ele, colorCombination);
            }
        }
        else {
            setSVGColorsToDefault(ele);
            isFocusable(ele) && toggleBorder(ele, "focusVisible-overlay-default");
            setOverlayDefaultBorder(overlayIcon, "focusVisible-overlay-default");
        }
    });
}

let setColorToDeafult = (ele) => {
    if (ele.hasAttribute("style")) {
        let defaultColor = defaultStyle.find(entry => entry.element === ele)?.color;
        let defaultBackgroundColor = defaultStyle.find(entry => entry.element === ele)?.backgroundColor;
        let defaultBackground = defaultStyle.find(entry => entry.element === ele)?.background;
        let defaultStyleAttr = defaultStyle.find(entry => entry.element === ele)?.style;
        (defaultColor && (defaultStyleAttr && defaultStyleAttr.includes("color"))) ? ele.style.color = defaultColor : ele.style.removeProperty("color");
        (defaultBackground && (defaultStyleAttr && defaultStyleAttr.includes("background"))) ? ele.style.setProperty('background', defaultBackground) : ele.style.removeProperty("background");
        (defaultBackgroundColor && (defaultStyleAttr && defaultStyleAttr.includes("background-color"))) ? ele.style.backgroundColor = defaultBackgroundColor : ele.style.removeProperty("background-color");
        //defaultStyleAttr !== null ? ele.setAttribute("style", defaultStyleAttr) : ele.removeAttribute("style");
    }
}

let setSVGColorsToDefault = (ele) => {
    if (ele.hasAttribute("style")) {
        let defaultFillStyle = defaultSVGStyle.find(entry => entry.element === ele)?.fillStyle;
        let defaultStrokeStyle = defaultSVGStyle.find(entry => entry.element === ele)?.strokeStyle;
        let defaultFillAttr = defaultSVGStyle.find(entry => entry.element === ele)?.fillAttr;
        let defaultStrokeAttr = defaultSVGStyle.find(entry => entry.element === ele)?.strokeAttr;
        let defaultStyleAttr = defaultSVGStyle.find(entry => entry.element === ele)?.style;
        /*defaultFillStyle !== null ? ele.style.fill = defaultFillStyle : "";
        defaultStrokeStyle !== null ? ele.style.stroke = defaultStrokeStyle : "";
        defaultStrokeAttr !== null ? ele.setAttribute("stroke", defaultStrokeAttr) : ele.removeAttribute("stroke");
        defaultFillAttr !== null ? ele.setAttribute("fill", defaultFillAttr) : ele.removeAttribute("fill");
        defaultStyleAttr !== null ? ele.setAttribute("style", defaultStyleAttr) : ele.removeAttribute("style");*/
        (defaultFillStyle && (defaultStyleAttr && defaultStyleAttr.includes("fill"))) ? ele.style.fill = defaultFillStyle : ele.style.removeProperty("fill");
        (defaultStrokeStyle && (defaultStyleAttr && defaultStyleAttr.includes("stroke"))) ? ele.style.stroke = defaultStrokeStyle : ele.style.removeProperty("stroke");
        defaultStrokeAttr ? ele.setAttribute("stroke", defaultStrokeAttr) : ele.removeAttribute("stroke");
        defaultFillAttr ? ele.setAttribute("fill", defaultFillAttr) : ele.removeAttribute("fill");
    }
}

let handlePressedState = (colorOptions, option) => {
    if ($(option).attr("aria-pressed") === "false") {
        $(colorOptions).attr("aria-pressed", "false").removeClass("active");
        isContrastEnabled = true;
        $(option).attr("aria-pressed", "true").addClass("active");
        handleColorChange(option.id);
        localStorage.setItem("cc_enhancer", option.id);
    }
    else {
        $(colorOptions).attr("aria-pressed", "false").removeClass("active");
        isContrastEnabled = false;
        $(option).attr("aria-pressed", "false").removeClass("active");
        handleColorChange(option.id);
        localStorage.removeItem("cc_enhancer", option.id);
    }
}

let saveOriginalStyles = (ele) => {
    if (!processedElements.has(ele)) {
        processedElements.add(ele);
        defaultStyle.push({
            element: ele,
            style: ele.getAttribute("style"),
            color: ele.style.color,
            backgroundColor: ele.style.backgroundColor,
            background: ele.style.background
        });
    }
}
let saveOriginalSVGStyles = (ele) => {
    if (!processedSVGElements.has(ele)) {
        processedSVGElements.add(ele);
        defaultSVGStyle.push({
            element: ele,
            style: ele.getAttribute("style"),
            fillStyle: window.getComputedStyle(ele).getPropertyValue("fill"),
            strokeStyle: window.getComputedStyle(ele).getPropertyValue("stroke"),
            fillAttr: ele.getAttribute("fill"),
            strokeAttr: ele.getAttribute("stroke")
        });
    }
}

let updateColor = (ele, colorCombination) => {
    ele.classList.remove("yellowOnBlack", "blackOnYellow", "whiteOnBlack", "blackOnWhite");
    ele.style.removeProperty('background-color');
    ele.style.removeProperty('background');
    ele.style.removeProperty("color");
    ele.classList.add(colorCombination);
    let overlayIcon = document.getElementById("overlay-icon");

    if (localStorage.getItem("focusVisiblityToggle") && isFocusable(ele)) {
        switch (colorCombination) {
            case "blackOnWhite": setColorCombination(ele, "black", "white"); toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
            case "whiteOnBlack": setColorCombination(ele, "white", "black"); toggleBorder(ele, "focusVisible-On_white"); toggleBorder(overlayIcon, "focusVisible-On_white"); break;
            case "yellowOnBlack": setColorCombination(ele, "yellow", "black"); toggleBorder(ele, "focusVisible-On_yellow"); toggleBorder(overlayIcon, "focusVisible-On_yellow"); break;
            case "blackOnYellow": setColorCombination(ele, "black", "yellow"); toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
            default: setOverlayDefaultBorder(overlayIcon, "focusVisible-overlay-default"); break;
        }
    }
    else {
        switch (colorCombination) {
            case "blackOnWhite": setColorCombination(ele, "black", "white"); break;
            case "whiteOnBlack": setColorCombination(ele, "white", "black"); break;
            case "yellowOnBlack": setColorCombination(ele, "yellow", "black"); break;
            case "blackOnYellow": setColorCombination(ele, "black", "yellow"); break;
            default: break;
        }
    }
}

let updateSVGs = (ele, colorCombination) => {
    let overlayIcon = document.getElementById("overlay-icon");
    let tagName = ele.tagName.toLowerCase();
    if (tagName === "text" || tagName === 'textpath') {
        if (ele.classList && ele.classList.contains("dim_font") || (ele.hasAttribute("xlink:href") && ele.getAttribute("xlink:href").includes("dimension_textPath"))) {
            switch (colorCombination) {
                case "blackOnWhite": setSVGTextStyle(ele, "white", "white"); break;
                case "whiteOnBlack": setSVGTextStyle(ele, "black", "black"); break;
                case "yellowOnBlack": setSVGTextStyle(ele, "black", "black"); break;
                case "blackOnYellow": setSVGTextStyle(ele, "yellow", "yellow"); break;
                default: break;
            }
        }
        else {
            switch (colorCombination) {
                case "blackOnWhite": setSVGTextStyle(ele, "black", "black"); break;
                case "whiteOnBlack": setSVGTextStyle(ele, "white", "white"); break;
                case "yellowOnBlack": setSVGTextStyle(ele, "yellow", "yellow"); break;
                case "blackOnYellow": setSVGTextStyle(ele, "black", "black"); break;
                default: break;
            }
        }
    }
    else if (ele.classList && ele.classList.contains("innerCircle")) {
        switch (colorCombination) {
            case "blackOnWhite": setSVGColors(ele, "white", "black"); break;
            case "whiteOnBlack": setSVGColors(ele, "black", "white"); break;
            case "yellowOnBlack": setSVGColors(ele, "black", "yellow"); break;
            case "blackOnYellow": setSVGColors(ele, "yellow", "black"); break;
            default: break;
        }
    }
    else {
        if (localStorage.getItem("focusVisiblityToggle") && isFocusable(ele)) {
            switch (colorCombination) {
                case "blackOnWhite": setSVGColors(ele, "black", "black"); toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                case "whiteOnBlack": setSVGColors(ele, "white", "white"); toggleBorder(ele, "focusVisible-On_white"); toggleBorder(overlayIcon, "focusVisible-On_white"); break;
                case "yellowOnBlack": setSVGColors(ele, "yellow", "yellow"); toggleBorder(ele, "focusVisible-On_yellow"); toggleBorder(overlayIcon, "focusVisible-On_yellow"); break;
                case "blackOnYellow": setSVGColors(ele, "black", "black"); toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                default: setOverlayDefaultBorder(overlayIcon, "focusVisible-overlay-default"); break;
            }
        }
        else {
            switch (colorCombination) {
                case "blackOnWhite": setSVGColors(ele, "black", "black"); break;
                case "whiteOnBlack": setSVGColors(ele, "white", "white"); break;
                case "yellowOnBlack": setSVGColors(ele, "yellow", "yellow"); break;
                case "blackOnYellow": setSVGColors(ele, "black", "black"); break;
                default: break;
            }
        }
    }
}

let updateHighCharts = (ele, colorCombination) => {
    let overlayIcon = document.getElementById("overlay-icon");
    let tagName = ele.tagName.toLowerCase();
    if (tagName === "text" || tagName === 'textpath') {
        switch (colorCombination) {
            case "blackOnWhite": setSVGTextStyle(ele, "black", "black"); break;
            case "whiteOnBlack": setSVGTextStyle(ele, "white", "white"); break;
            case "yellowOnBlack": setSVGTextStyle(ele, "yellow", "yellow"); break;
            case "blackOnYellow": setSVGTextStyle(ele, "black", "black"); break;
            default: break;
        }
    }
    else {
        if (localStorage.getItem("focusVisiblityToggle") && isFocusable(ele)) {
            switch (colorCombination) {
                case "blackOnWhite": setSVGColors(ele, "white", "white"); toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                case "whiteOnBlack": setSVGColors(ele, "black", "black"); toggleBorder(ele, "focusVisible-On_white"); toggleBorder(overlayIcon, "focusVisible-On_white"); break;
                case "yellowOnBlack": setSVGColors(ele, "black", "black"); toggleBorder(ele, "focusVisible-On_yellow"); toggleBorder(overlayIcon, "focusVisible-On_yellow"); break;
                case "blackOnYellow": setSVGColors(ele, "yellow", "yellow"); toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                default: break;
            }
        }
        else {
            switch (colorCombination) {
                case "blackOnWhite": setSVGColors(ele, "white", "white"); break;
                case "whiteOnBlack": setSVGColors(ele, "black", "black"); break;
                case "yellowOnBlack": setSVGColors(ele, "black", "black"); break;
                case "blackOnYellow": setSVGColors(ele, "yellow", "yellow"); break;
                default: break;
            }
        }
    }
}

let updateSummaryRadar = (ele, colorCombination) => {
    let overlayIcon = document.getElementById("overlay-icon");
    let tagName = ele.tagName.toLowerCase();
    if (tagName === "text" || tagName === 'textpath') {
        if (ele.classList && (ele.classList.contains("dim_font") || ele.classList.contains("fa_font")) || (ele.hasAttribute("xlink:href") && ele.getAttribute("xlink:href").includes("dim_textPath"))) {
            switch (colorCombination) {
                case "blackOnWhite": setSVGTextStyle(ele, "white", "white"); break;
                case "whiteOnBlack": setSVGTextStyle(ele, "black", "black"); break;
                case "yellowOnBlack": setSVGTextStyle(ele, "black", "black"); break;
                case "blackOnYellow": setSVGTextStyle(ele, "yellow", "yellow"); break;
                default: break;
            }
        }
        else {
            switch (colorCombination) {
                case "blackOnWhite": setSVGTextStyle(ele, "black", "black"); break;
                case "whiteOnBlack": setSVGTextStyle(ele, "white", "white"); break;
                case "yellowOnBlack": setSVGTextStyle(ele, "yellow", "yellow"); break;
                case "blackOnYellow": setSVGTextStyle(ele, "black", "black"); break;
                default: break;
            }
        }
    }
    else if (tagName === "path") {
        if ((ele.id && ele.id.includes("dimArc")) || (ele.classList && (ele.classList.contains("arc") || ele.classList.contains("subDimArc")))) {
            if (localStorage.getItem("focusVisiblityToggle") && isFocusable(ele)) {
                switch (colorCombination) {
                    case "blackOnWhite": setSVGColors(ele, "black", "white"); ele.setAttribute("stroke", "white"); ele.style.setProperty("stroke", "white", "important");
                        toggleBorder(ele, "focusVisible-On_white"); toggleBorder(overlayIcon, "focusVisible-On_white"); break;
                    case "whiteOnBlack": setSVGColors(ele, "white", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important");
                        toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                    case "yellowOnBlack": setSVGColors(ele, "yellow", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important");
                        toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                    case "blackOnYellow": setSVGColors(ele, "black", "yellow"); ele.setAttribute("stroke", "yellow"); ele.style.setProperty("stroke", "yellow", "important");
                        toggleBorder(ele, "focusVisible-On_yellow"); toggleBorder(overlayIcon, "focusVisible-On_yellow"); break;
                    default: break;
                }
            }
            else {
                switch (colorCombination) {
                    case "blackOnWhite": setSVGColors(ele, "black", "white"); ele.setAttribute("stroke", "white"); ele.style.setProperty("stroke", "white", "important"); break;
                    case "whiteOnBlack": setSVGColors(ele, "white", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important"); break;
                    case "yellowOnBlack": setSVGColors(ele, "yellow", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important"); break;
                    case "blackOnYellow": setSVGColors(ele, "black", "yellow"); ele.setAttribute("stroke", "yellow"); ele.style.setProperty("stroke", "yellow", "important"); break;
                    default: break;
                }
            }
        }

        else {
            if (localStorage.getItem("focusVisiblityToggle") && isFocusable(ele)) {
                switch (colorCombination) {
                    case "blackOnWhite": setSVGColors(ele, "white", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important");
                        toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                    case "whiteOnBlack": setSVGColors(ele, "black", "white"); ele.setAttribute("stroke", "white"); ele.style.setProperty("stroke", "white", "important");
                        toggleBorder(ele, "focusVisible-On_white"); toggleBorder(overlayIcon, "focusVisible-On_white");break;
                    case "yellowOnBlack": setSVGColors(ele, "black", "yellow"); ele.setAttribute("stroke", "yellow"); ele.style.setProperty("stroke", "yellow", "important");
                        toggleBorder(ele, "focusVisible-On_yellow"); toggleBorder(overlayIcon, "focusVisible-On_yellow"); break;
                    case "blackOnYellow": setSVGColors(ele, "yellow", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important");
                        toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                    default: break;
                }
            }
            else {
                switch (colorCombination) {
                    case "blackOnWhite": setSVGColors(ele, "white", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important"); break;
                    case "whiteOnBlack": setSVGColors(ele, "black", "white"); ele.setAttribute("stroke", "white"); ele.style.setProperty("stroke", "white", "important"); break;
                    case "yellowOnBlack": setSVGColors(ele, "black", "yellow"); ele.setAttribute("stroke", "yellow"); ele.style.setProperty("stroke", "yellow", "important"); break;
                    case "blackOnYellow": setSVGColors(ele, "yellow", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important"); break;
                    default: break;
                }
            }
        }
    }
    else {
        if (localStorage.getItem("focusVisiblityToggle") && isFocusable(ele)) {
            switch (colorCombination) {
                case "blackOnWhite": setSVGColors(ele, "white", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important");
                    toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                case "whiteOnBlack": setSVGColors(ele, "black", "white"); ele.setAttribute("stroke", "white"); ele.style.setProperty("stroke", "white", "important");
                    toggleBorder(ele, "focusVisible-On_white"); toggleBorder(overlayIcon, "focusVisible-On_white"); break;
                case "yellowOnBlack": setSVGColors(ele, "black", "yellow"); ele.setAttribute("stroke", "yellow"); ele.style.setProperty("stroke", "yellow", "important");
                    toggleBorder(ele, "focusVisible-On_yellow"); toggleBorder(overlayIcon, "focusVisible-On_yellow"); break;
                case "blackOnYellow": setSVGColors(ele, "yellow", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important");
                    toggleBorder(ele, "focusVisible-On_black"); toggleBorder(overlayIcon, "focusVisible-On_black"); break;
                default: break;
            }
        }
        else {
            switch (colorCombination) {
                case "blackOnWhite": setSVGColors(ele, "white", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important"); break;
                case "whiteOnBlack": setSVGColors(ele, "black", "white"); ele.setAttribute("stroke", "white"); ele.style.setProperty("stroke", "white", "important"); break;
                case "yellowOnBlack": setSVGColors(ele, "black", "yellow"); ele.setAttribute("stroke", "yellow"); ele.style.setProperty("stroke", "yellow", "important"); break;
                case "blackOnYellow": setSVGColors(ele, "yellow", "black"); ele.setAttribute("stroke", "black"); ele.style.setProperty("stroke", "black", "important"); break;
                default: break;
            }
        }
    }
}

let setColorCombination = (ele, foreground, background) => {
    ele.style.setProperty("background-color", background, "important");
    ele.style.setProperty("background", background, "important");
    ele.style.setProperty("color", foreground, "important");
}

let setSVGTextStyle = (ele, fill, stroke) => {
    ele.removeAttribute("fill");
    ele.style.removeProperty("fill");
    ele.removeAttribute("stroke");
    ele.style.removeProperty("stroke");
    ele.setAttribute("stroke", stroke);
    ele.style.setProperty("stroke", stroke, "important");
    ele.setAttribute("fill", fill);
    ele.style.setProperty("fill", fill, "important");
}

let setSVGColors = (ele, fill, stroke) => {
    if (ele.hasAttribute("fill") && ele.getAttribute("fill") !== "none") {
        ele.removeAttribute("fill");
        ele.style.removeProperty("fill");
        ele.setAttribute("fill", fill);
        ele.style.setProperty("fill", fill, "important");
    }
    else if (ele.hasAttribute("stroke") && ele.getAttribute("stroke") !== "none") {
        ele.removeAttribute("stroke");
        ele.style.removeProperty("stroke");
        ele.setAttribute("stroke", stroke);
        ele.style.setProperty("stroke", stroke, "important");
    }

    if (!ele.hasAttribute("fill") && window.getComputedStyle(ele).getPropertyValue("fill")) {
        ele.style.removeProperty("fill");
        ele.style.setProperty("fill", fill, "important");
    }
    else if (!ele.hasAttribute("stroke") && window.getComputedStyle(ele).getPropertyValue("stroke")) {
        ele.style.removeProperty("stroke");
        ele.style.setProperty("stroke", stroke, "important");
    }
}
import { isFocusable, setOverlayDefaultBorder, toggleBorder } from "./focus_visibility.js";
import { isNestedUnderParent } from "./global.js";

let isContrastEnabled = false;
let defaultStyle = [];
let processedElements = new Set(); //This will ensure that there is unique element entries while setting up the default styles.
let defaultSVGStyle = [];
let processedSVGElements = new Set(); //This will ensure that there is unique element entries while setting up the default styles.
const CONTRAST_CLASSES = ["yellowOnBlack", "blackOnYellow", "whiteOnBlack", "blackOnWhite"];
const CONTRAST_MODIFIED_ATTR = "data-ada-contrast-modified";
let contrastReapplyQueued = false;

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
    const scheduleContrastReapply = () => {
        if (contrastReapplyQueued) return;
        contrastReapplyQueued = true;

        requestAnimationFrame(() => {
            contrastReapplyQueued = false;
            const activeContrast = localStorage.getItem("cc_enhancer");
            if (!activeContrast) return;

            applyGlobalMuiIconVisibility(activeContrast);
            applyReportDatePickerVisibility(activeContrast);
            applyTableFilterVisibility(activeContrast);
            applyTableMenuVisibility(activeContrast);
            applyModalTreeSelectVisibility(activeContrast);
        });
    };

    let observer = new MutationObserver((mutations) => {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                handleUpdatedNodes(mutation.addedNodes);
            }

            if (mutation.type === 'attributes' && localStorage.getItem("cc_enhancer")) {
                const target = mutation.target;
                if (!(target instanceof Element)) return;

                if (
                    target.closest(".MuiModal-root, .MuiDialog-root, .MuiPopover-root, .MuiMenu-root") ||
                    target.matches(".MuiAutocomplete-popper, .base-Popper-root, .MuiPickersPopper-root")
                ) {
                    scheduleContrastReapply();
                }
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "aria-hidden", "aria-expanded", "open", "data-popper-placement"]
    });
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

    if (localStorage.getItem("cc_enhancer")) {
        applyGlobalMuiIconVisibility(localStorage.getItem("cc_enhancer"));
        applyReportDatePickerVisibility(localStorage.getItem("cc_enhancer"));
        applyTableFilterVisibility(localStorage.getItem("cc_enhancer"));
        applyTableMenuVisibility(localStorage.getItem("cc_enhancer"));
        applyModalTreeSelectVisibility(localStorage.getItem("cc_enhancer"));
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
    let allElements = document.querySelectorAll("body, body *:not(#ada-overlay-widget-container *):not(svg):not(svg *):not([data-rht-toaster])");
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
            ele.classList.remove(...CONTRAST_CLASSES);
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

    if (isContrastEnabled) {
        applyGlobalMuiIconVisibility(colorCombination);
        applyReportDatePickerVisibility(colorCombination);
        applyTableFilterVisibility(colorCombination);
        applyTableMenuVisibility(colorCombination);
        applyModalTreeSelectVisibility(colorCombination);
    }
    else {
        clearReportDatePickerVisibility();
        clearTableFilterVisibility();
        clearTableMenuVisibility();
        clearModalTreeSelectVisibility();
        clearContrastArtifacts();
    }
}

let markContrastModified = (ele) => {
    ele?.setAttribute?.(CONTRAST_MODIFIED_ATTR, "true");
}

let clearContrastArtifacts = () => {
    let touchedElements = document.querySelectorAll(
        `.yellowOnBlack, .blackOnYellow, .whiteOnBlack, .blackOnWhite, [${CONTRAST_MODIFIED_ATTR}="true"]`
    );

    touchedElements.forEach((ele) => {
        ele.classList?.remove(...CONTRAST_CLASSES);
        ele.style?.removeProperty("background");
        ele.style?.removeProperty("background-color");
        ele.style?.removeProperty("color");

        if (ele instanceof SVGElement || ele.closest?.("svg")) {
            ele.style?.removeProperty("fill");
            ele.style?.removeProperty("stroke");
        }

        ele.removeAttribute?.(CONTRAST_MODIFIED_ATTR);
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
    ele.classList.remove(...CONTRAST_CLASSES);
    ele.style.removeProperty("background");
    ele.style.removeProperty("background-color");
    ele.style.removeProperty("color");

    const defaults = defaultSVGStyle.find(entry => entry.element === ele);

    if (!defaults) {
        // If we never captured defaults for this node, only remove inline enhancer paint.
        // Keep authored attributes intact to avoid mutating non-overlay SVG definitions.
        ele.style.removeProperty("fill");
        ele.style.removeProperty("stroke");
        return;
    }

    const defaultFillStyle = defaults.fillStyle;
    const defaultStrokeStyle = defaults.strokeStyle;
    const defaultFillAttr = defaults.fillAttr;
    const defaultStrokeAttr = defaults.strokeAttr;
    const defaultStyleAttr = defaults.style;

    (defaultFillStyle && defaultStyleAttr && defaultStyleAttr.includes("fill"))
        ? ele.style.fill = defaultFillStyle
        : ele.style.removeProperty("fill");
    (defaultStrokeStyle && defaultStyleAttr && defaultStyleAttr.includes("stroke"))
        ? ele.style.stroke = defaultStrokeStyle
        : ele.style.removeProperty("stroke");

    (defaultStrokeAttr !== null && defaultStrokeAttr !== undefined)
        ? ele.setAttribute("stroke", defaultStrokeAttr)
        : ele.removeAttribute("stroke");
    (defaultFillAttr !== null && defaultFillAttr !== undefined)
        ? ele.setAttribute("fill", defaultFillAttr)
        : ele.removeAttribute("fill");
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

let getContrastForeground = (colorCombination) => {
    switch (colorCombination) {
        case "blackOnWhite": return "black";
        case "whiteOnBlack": return "white";
        case "yellowOnBlack": return "yellow";
        case "blackOnYellow": return "black";
        default: return "black";
    }
}

let getContrastBackground = (colorCombination) => {
    switch (colorCombination) {
        case "blackOnWhite": return "white";
        case "whiteOnBlack": return "black";
        case "yellowOnBlack": return "black";
        case "blackOnYellow": return "yellow";
        default: return "white";
    }
}

let applyGlobalMuiIconVisibility = (colorCombination) => {
    const foreground = getContrastForeground(colorCombination);
    const icons = document.querySelectorAll(".MuiSvgIcon-root");

    icons.forEach((icon) => {
        if (isInsideExcludedSvgZone(icon)) return;

        icon.style.setProperty("color", foreground, "important");
        icon.style.setProperty("background", "transparent", "important");
        icon.style.setProperty("background-color", "transparent", "important");

        icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
            shape.style.setProperty("fill", "currentColor", "important");
            shape.style.setProperty("stroke", "currentColor", "important");
        });
    });
}

let applyReportDatePickerVisibility = (colorCombination) => {
    const foreground = getContrastForeground(colorCombination);
    const background = getContrastBackground(colorCombination);
    const dateIcons = document.querySelectorAll('.MuiSvgIcon-root[data-testid="DateRangeIcon"]');

    dateIcons.forEach((icon) => {
        icon.style.setProperty("color", foreground, "important");
        icon.style.setProperty("background", "transparent", "important");
        icon.style.setProperty("background-color", "transparent", "important");

        icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
            shape.style.setProperty("fill", "currentColor", "important");
            shape.style.setProperty("stroke", "currentColor", "important");
        });

        const iconButton = icon.closest("button");
        if (iconButton) {
            iconButton.style.setProperty("color", foreground, "important");
            iconButton.style.setProperty("background", "transparent", "important");
            iconButton.style.setProperty("background-color", "transparent", "important");
        }

        const inputRoot = icon.closest('.MuiInputBase-root, .MuiOutlinedInput-root');
        if (inputRoot) {
            inputRoot.style.setProperty("background", background, "important");
            inputRoot.style.setProperty("background-color", background, "important");
            inputRoot.style.setProperty("color", foreground, "important");

            const outline = inputRoot.querySelector('.MuiOutlinedInput-notchedOutline');
            if (outline) {
                outline.style.setProperty("background", "transparent", "important");
                outline.style.setProperty("background-color", "transparent", "important");
                outline.style.setProperty("color", foreground, "important");
                outline.style.setProperty("border-color", foreground, "important");

                outline.querySelectorAll('legend, legend span').forEach((node) => {
                    node.style.setProperty("background", "transparent", "important");
                    node.style.setProperty("background-color", "transparent", "important");
                    node.style.setProperty("color", foreground, "important");
                });
            }

            const input = inputRoot.querySelector('input, textarea');
            if (input) {
                input.style.setProperty("color", foreground, "important");
                input.style.setProperty("-webkit-text-fill-color", foreground, "important");
                input.style.setProperty("caret-color", foreground, "important");
                input.style.setProperty("opacity", "1", "important");
                input.style.setProperty("background", background, "important");
                input.style.setProperty("background-color", background, "important");
            }
        }
    });

    applyOpenCalendarVisibility(colorCombination);
}

let clearReportDatePickerVisibility = () => {
    const dateIcons = document.querySelectorAll('.MuiSvgIcon-root[data-testid="DateRangeIcon"]');

    dateIcons.forEach((icon) => {
        icon.style.removeProperty("color");
        icon.style.removeProperty("background");
        icon.style.removeProperty("background-color");

        icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
            shape.style.removeProperty("fill");
            shape.style.removeProperty("stroke");
        });

        const iconButton = icon.closest("button");
        if (iconButton) {
            iconButton.style.removeProperty("color");
            iconButton.style.removeProperty("background");
            iconButton.style.removeProperty("background-color");
        }

        const inputRoot = icon.closest('.MuiInputBase-root, .MuiOutlinedInput-root');
        if (inputRoot) {
            inputRoot.style.removeProperty("background");
            inputRoot.style.removeProperty("background-color");
            inputRoot.style.removeProperty("color");

            const outline = inputRoot.querySelector('.MuiOutlinedInput-notchedOutline');
            if (outline) {
                outline.style.removeProperty("background");
                outline.style.removeProperty("background-color");
                outline.style.removeProperty("color");
                outline.style.removeProperty("border-color");

                outline.querySelectorAll('legend, legend span').forEach((node) => {
                    node.style.removeProperty("background");
                    node.style.removeProperty("background-color");
                    node.style.removeProperty("color");
                });
            }

            const input = inputRoot.querySelector('input, textarea');
            if (input) {
                input.style.removeProperty("color");
                input.style.removeProperty("-webkit-text-fill-color");
                input.style.removeProperty("caret-color");
                input.style.removeProperty("opacity");
                input.style.removeProperty("background");
                input.style.removeProperty("background-color");
            }
        }
    });

    clearOpenCalendarVisibility();
}

let applyOpenCalendarVisibility = (colorCombination) => {
    const foreground = getContrastForeground(colorCombination);
    const background = getContrastBackground(colorCombination);
    const popupRoots = document.querySelectorAll('.MuiPickersPopper-root, .MuiDialog-root .MuiPickersLayout-root, .MuiPickersLayout-root');

    popupRoots.forEach((root) => {
        root.style.setProperty("color", foreground, "important");
        root.style.setProperty("background", background, "important");
        root.style.setProperty("background-color", background, "important");

        root.querySelectorAll('.MuiPaper-root, .MuiPickersLayout-contentWrapper, .MuiDayCalendar-root, .MuiDateCalendar-root').forEach((node) => {
            node.style.setProperty("color", foreground, "important");
            node.style.setProperty("background", background, "important");
            node.style.setProperty("background-color", background, "important");
        });

        root.querySelectorAll('.MuiPickersCalendarHeader-label, .MuiPickersArrowSwitcher-button, .MuiDayCalendar-weekDayLabel, .MuiPickersYear-yearButton, .MuiPickersMonth-monthButton, .MuiPickersToolbar-root, .MuiPickersToolbar-content, .MuiPickersToolbarText-root').forEach((node) => {
            node.style.setProperty("color", foreground, "important");
            node.style.setProperty("background", "transparent", "important");
            node.style.setProperty("background-color", "transparent", "important");
        });

        root.querySelectorAll('.MuiPickersCalendarHeader-switchViewButton, .MuiPickersArrowSwitcher-button').forEach((btn) => {
            btn.style.setProperty("color", foreground, "important");
            btn.style.setProperty("background", "transparent", "important");
            btn.style.setProperty("background-color", "transparent", "important");
        });

        root.querySelectorAll('.MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root, .MuiPickersArrowSwitcher-button .MuiSvgIcon-root').forEach((icon) => {
            icon.style.setProperty("color", foreground, "important");
            icon.style.setProperty("background", "transparent", "important");
            icon.style.setProperty("background-color", "transparent", "important");

            icon.querySelectorAll('path, circle, rect, polygon, polyline, line, ellipse').forEach((shape) => {
                shape.style.setProperty("fill", "currentColor", "important");
                shape.style.setProperty("stroke", "currentColor", "important");
            });
        });

        root.querySelectorAll('.MuiPickersDay-root').forEach((day) => {
            const isSelected = day.classList.contains("Mui-selected");
            const isToday = day.classList.contains("MuiPickersDay-today");

            day.style.setProperty("opacity", "1", "important");
            day.style.setProperty("color", isSelected ? background : foreground, "important");
            day.style.setProperty("background", isSelected ? foreground : "transparent", "important");
            day.style.setProperty("background-color", isSelected ? foreground : "transparent", "important");
            day.style.setProperty("border-color", foreground, "important");

            if (isToday && !isSelected) {
                day.style.setProperty("border", `1px solid ${foreground}`, "important");
            }
        });

        root.querySelectorAll('.MuiPickersYear-yearButton.Mui-selected, .MuiPickersMonth-monthButton.Mui-selected').forEach((node) => {
            node.style.setProperty("color", background, "important");
            node.style.setProperty("background", foreground, "important");
            node.style.setProperty("background-color", foreground, "important");
            node.style.setProperty("border-color", foreground, "important");
        });
    });
}

let clearOpenCalendarVisibility = () => {
    const popupRoots = document.querySelectorAll('.MuiPickersPopper-root, .MuiDialog-root .MuiPickersLayout-root, .MuiPickersLayout-root');

    popupRoots.forEach((root) => {
        root.style.removeProperty("color");
        root.style.removeProperty("background");
        root.style.removeProperty("background-color");

        root.querySelectorAll('.MuiPaper-root, .MuiPickersLayout-contentWrapper, .MuiDayCalendar-root, .MuiDateCalendar-root, .MuiPickersCalendarHeader-label, .MuiPickersArrowSwitcher-button, .MuiPickersCalendarHeader-switchViewButton, .MuiDayCalendar-weekDayLabel, .MuiPickersYear-yearButton, .MuiPickersMonth-monthButton, .MuiPickersToolbar-root, .MuiPickersToolbar-content, .MuiPickersToolbarText-root, .MuiPickersDay-root, .MuiPickersArrowSwitcher-button .MuiSvgIcon-root, .MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root').forEach((node) => {
            node.style.removeProperty("color");
            node.style.removeProperty("background");
            node.style.removeProperty("background-color");
            node.style.removeProperty("border");
            node.style.removeProperty("border-color");
            node.style.removeProperty("opacity");
        });

        root.querySelectorAll('.MuiPickersArrowSwitcher-button .MuiSvgIcon-root path, .MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root path, .MuiPickersArrowSwitcher-button .MuiSvgIcon-root circle, .MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root circle, .MuiPickersArrowSwitcher-button .MuiSvgIcon-root rect, .MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root rect, .MuiPickersArrowSwitcher-button .MuiSvgIcon-root polygon, .MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root polygon, .MuiPickersArrowSwitcher-button .MuiSvgIcon-root polyline, .MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root polyline, .MuiPickersArrowSwitcher-button .MuiSvgIcon-root line, .MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root line, .MuiPickersArrowSwitcher-button .MuiSvgIcon-root ellipse, .MuiPickersCalendarHeader-switchViewButton .MuiSvgIcon-root ellipse').forEach((shape) => {
            shape.style.removeProperty("fill");
            shape.style.removeProperty("stroke");
        });
    });
}

let applyTableFilterVisibility = (colorCombination) => {
    const foreground = getContrastForeground(colorCombination);
    const background = getContrastBackground(colorCombination);
    const tableHead = document.querySelector(".MuiTableHead-root");
    if (tableHead) {
        tableHead.querySelectorAll("th, .MuiTableCell-root, .Mui-TableHeadCell-Content, .Mui-TableHeadCell-Content-Labels, .Mui-TableHeadCell-Content-Wrapper").forEach((node) => {
            node.style.setProperty("color", foreground, "important");
            node.style.setProperty("background", background, "important");
            node.style.setProperty("background-color", background, "important");
        });

        tableHead.querySelectorAll(".MuiInputBase-root, .MuiOutlinedInput-root, .MuiFormControl-root, .MuiTextField-root").forEach((root) => {
            root.style.setProperty("color", foreground, "important");
            root.style.setProperty("background", background, "important");
            root.style.setProperty("background-color", background, "important");
        });

        tableHead.querySelectorAll(".MuiInputBase-input, .MuiOutlinedInput-input, .MuiSelect-select, [role='combobox']").forEach((input) => {
            input.style.setProperty("color", foreground, "important");
            input.style.setProperty("-webkit-text-fill-color", foreground, "important");
            input.style.setProperty("caret-color", foreground, "important");
            input.style.setProperty("opacity", "1", "important");
            input.style.setProperty("background", "transparent", "important");
            input.style.setProperty("background-color", "transparent", "important");
        });

        tableHead.querySelectorAll(".MuiOutlinedInput-notchedOutline").forEach((outline) => {
            outline.style.setProperty("background", "transparent", "important");
            outline.style.setProperty("background-color", "transparent", "important");
            outline.style.setProperty("border-color", foreground, "important");
        });

        tableHead.querySelectorAll(".MuiInputAdornment-root").forEach((adornment) => {
            adornment.style.setProperty("color", foreground, "important");
            adornment.style.setProperty("background", "transparent", "important");
            adornment.style.setProperty("background-color", "transparent", "important");
        });

        tableHead.querySelectorAll(".MuiSvgIcon-root").forEach((icon) => {
            icon.style.setProperty("color", foreground, "important");
            icon.style.setProperty("background", "transparent", "important");
            icon.style.setProperty("background-color", "transparent", "important");

            icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
                shape.style.setProperty("fill", "currentColor", "important");
                shape.style.setProperty("stroke", "currentColor", "important");
            });
        });

        tableHead.querySelectorAll(".MuiButtonBase-root, .MuiTableSortLabel-root, .MuiIconButton-root").forEach((btn) => {
            btn.style.setProperty("color", foreground, "important");
            btn.style.setProperty("background", "transparent", "important");
            btn.style.setProperty("background-color", "transparent", "important");
        });
    }

    document.querySelectorAll("button[aria-label='Show filters on column headers'], button[aria-label='Hide filters from column headers']").forEach((btn) => {
        btn.style.setProperty("color", foreground, "important");
        btn.style.setProperty("background", "transparent", "important");
        btn.style.setProperty("background-color", "transparent", "important");

        btn.querySelectorAll(".MuiSvgIcon-root").forEach((icon) => {
            icon.style.setProperty("color", foreground, "important");
            icon.style.setProperty("background", "transparent", "important");
            icon.style.setProperty("background-color", "transparent", "important");

            icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
                shape.style.setProperty("fill", "currentColor", "important");
                shape.style.setProperty("stroke", "currentColor", "important");
            });
        });
    });
}

let clearTableFilterVisibility = () => {
    const tableHead = document.querySelector(".MuiTableHead-root");
    if (tableHead) {
        tableHead.querySelectorAll("th, .MuiTableCell-root, .Mui-TableHeadCell-Content, .Mui-TableHeadCell-Content-Labels, .Mui-TableHeadCell-Content-Wrapper, .MuiInputBase-root, .MuiOutlinedInput-root, .MuiFormControl-root, .MuiTextField-root, .MuiInputBase-input, .MuiOutlinedInput-input, .MuiSelect-select, [role='combobox'], .MuiOutlinedInput-notchedOutline, .MuiInputAdornment-root, .MuiSvgIcon-root, .MuiButtonBase-root, .MuiTableSortLabel-root, .MuiIconButton-root").forEach((node) => {
            node.style.removeProperty("color");
            node.style.removeProperty("background");
            node.style.removeProperty("background-color");
            node.style.removeProperty("-webkit-text-fill-color");
            node.style.removeProperty("caret-color");
            node.style.removeProperty("opacity");
            node.style.removeProperty("border-color");
        });

        tableHead.querySelectorAll(".MuiSvgIcon-root path, .MuiSvgIcon-root circle, .MuiSvgIcon-root rect, .MuiSvgIcon-root polygon, .MuiSvgIcon-root polyline, .MuiSvgIcon-root line, .MuiSvgIcon-root ellipse").forEach((shape) => {
            shape.style.removeProperty("fill");
            shape.style.removeProperty("stroke");
        });
    }

    document.querySelectorAll("button[aria-label='Show filters on column headers'], button[aria-label='Hide filters from column headers']").forEach((btn) => {
        btn.style.removeProperty("color");
        btn.style.removeProperty("background");
        btn.style.removeProperty("background-color");

        btn.querySelectorAll(".MuiSvgIcon-root").forEach((icon) => {
            icon.style.removeProperty("color");
            icon.style.removeProperty("background");
            icon.style.removeProperty("background-color");
        });

        btn.querySelectorAll(".MuiSvgIcon-root path, .MuiSvgIcon-root circle, .MuiSvgIcon-root rect, .MuiSvgIcon-root polygon, .MuiSvgIcon-root polyline, .MuiSvgIcon-root line, .MuiSvgIcon-root ellipse").forEach((shape) => {
            shape.style.removeProperty("fill");
            shape.style.removeProperty("stroke");
        });
    });
}

let applyTableMenuVisibility = (colorCombination) => {
    const foreground = getContrastForeground(colorCombination);
    const background = getContrastBackground(colorCombination);
    const menuRoots = document.querySelectorAll(".MuiMenu-paper, .MuiPopover-paper");

    menuRoots.forEach((menu) => {
        menu.style.setProperty("color", foreground, "important");
        menu.style.setProperty("background", background, "important");
        menu.style.setProperty("background-color", background, "important");

        menu.querySelectorAll(".MuiMenu-list, .MuiList-root, .MuiListItem-root, .MuiMenuItem-root, [role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']").forEach((node) => {
            node.style.setProperty("color", foreground, "important");
            node.style.setProperty("background", background, "important");
            node.style.setProperty("background-color", background, "important");
        });

        menu.querySelectorAll(".MuiListItemIcon-root, .MuiListItemText-root, .MuiTypography-root, .MuiFormControlLabel-label, .MuiCheckbox-root, .MuiRadio-root, .MuiSwitch-root").forEach((node) => {
            node.style.setProperty("color", foreground, "important");
            node.style.setProperty("background", "transparent", "important");
            node.style.setProperty("background-color", "transparent", "important");
        });

        menu.querySelectorAll(".MuiSwitch-track").forEach((track) => {
            track.style.setProperty("background-color", foreground, "important");
            track.style.setProperty("opacity", "0.35", "important");
            track.style.setProperty("border", `1px solid ${foreground}`, "important");
        });

        menu.querySelectorAll(".MuiSwitch-thumb").forEach((thumb) => {
            thumb.style.setProperty("background-color", foreground, "important");
            thumb.style.setProperty("color", background, "important");
            thumb.style.setProperty("border", `1px solid ${foreground}`, "important");
        });

        menu.querySelectorAll(".MuiSwitch-switchBase").forEach((base) => {
            base.style.setProperty("color", foreground, "important");
            base.style.setProperty("background", "transparent", "important");
            base.style.setProperty("background-color", "transparent", "important");
        });

        menu.querySelectorAll(".MuiSwitch-switchBase.Mui-checked").forEach((checked) => {
            checked.style.setProperty("color", foreground, "important");
        });

        menu.querySelectorAll(".MuiCheckbox-root .MuiSvgIcon-root, .MuiRadio-root .MuiSvgIcon-root").forEach((icon) => {
            icon.style.setProperty("color", foreground, "important");
            icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
                shape.style.setProperty("fill", "currentColor", "important");
                shape.style.setProperty("stroke", "currentColor", "important");
            });
        });

        menu.querySelectorAll(".MuiButtonBase-root, .MuiIconButton-root").forEach((btn) => {
            btn.style.setProperty("color", foreground, "important");
            btn.style.setProperty("background", "transparent", "important");
            btn.style.setProperty("background-color", "transparent", "important");
        });

        menu.querySelectorAll(".MuiSvgIcon-root").forEach((icon) => {
            icon.style.setProperty("color", foreground, "important");
            icon.style.setProperty("background", "transparent", "important");
            icon.style.setProperty("background-color", "transparent", "important");

            icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
                shape.style.setProperty("fill", "currentColor", "important");
                shape.style.setProperty("stroke", "currentColor", "important");
            });
        });
    });
}

let clearTableMenuVisibility = () => {
    const menuRoots = document.querySelectorAll(".MuiMenu-paper, .MuiPopover-paper");

    menuRoots.forEach((menu) => {
        menu.style.removeProperty("color");
        menu.style.removeProperty("background");
        menu.style.removeProperty("background-color");

        menu.querySelectorAll(".MuiMenu-list, .MuiList-root, .MuiListItem-root, .MuiMenuItem-root, [role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio'], .MuiListItemIcon-root, .MuiListItemText-root, .MuiTypography-root, .MuiFormControlLabel-label, .MuiCheckbox-root, .MuiRadio-root, .MuiSwitch-root, .MuiButtonBase-root, .MuiIconButton-root, .MuiSvgIcon-root").forEach((node) => {
            node.style.removeProperty("color");
            node.style.removeProperty("background");
            node.style.removeProperty("background-color");
        });

        menu.querySelectorAll(".MuiSwitch-track, .MuiSwitch-thumb, .MuiSwitch-switchBase, .MuiSwitch-switchBase.Mui-checked").forEach((node) => {
            node.style.removeProperty("color");
            node.style.removeProperty("background");
            node.style.removeProperty("background-color");
            node.style.removeProperty("opacity");
            node.style.removeProperty("border");
        });

        menu.querySelectorAll(".MuiSvgIcon-root path, .MuiSvgIcon-root circle, .MuiSvgIcon-root rect, .MuiSvgIcon-root polygon, .MuiSvgIcon-root polyline, .MuiSvgIcon-root line, .MuiSvgIcon-root ellipse").forEach((shape) => {
            shape.style.removeProperty("fill");
            shape.style.removeProperty("stroke");
        });
    });
}

let applyModalTreeSelectVisibility = (colorCombination) => {
    const foreground = getContrastForeground(colorCombination);
    const background = getContrastBackground(colorCombination);
    const treeSelectPoppers = document.querySelectorAll(".MuiAutocomplete-popper, .base-Popper-root.MuiAutocomplete-listbox, [role='tree'].MuiAutocomplete-listbox");

    treeSelectPoppers.forEach((popper) => {
        popper.style.setProperty("color", foreground, "important");
        popper.style.setProperty("background", background, "important");
        popper.style.setProperty("background-color", background, "important");

        popper.querySelectorAll(".MuiPaper-root, .MuiAutocomplete-listbox, [role='listbox'], [role='option'], [role='treeitem'], .MuiAutocomplete-option").forEach((node) => {
            node.style.setProperty("color", foreground, "important");
            node.style.setProperty("background", background, "important");
            node.style.setProperty("background-color", background, "important");
        });

        popper.querySelectorAll(".MuiTypography-root, label, span, li, .MuiBox-root").forEach((node) => {
            node.style.setProperty("color", foreground, "important");
        });

        popper.querySelectorAll(".MuiCheckbox-root, .MuiCheckbox-action, .MuiCheckbox-checkbox, .MuiFormControl-root").forEach((node) => {
            node.style.setProperty("color", foreground, "important");
            node.style.setProperty("background", "transparent", "important");
            node.style.setProperty("background-color", "transparent", "important");
        });

        popper.querySelectorAll(".MuiCheckbox-root").forEach((root) => {
            // Joy checkbox checkmark uses CSS vars; force a visible check color.
            root.style.setProperty("--Icon-color", background, "important");
        });

        popper.querySelectorAll(".MuiCheckbox-checkbox").forEach((box) => {
            box.style.setProperty("border", `1px solid ${foreground}`, "important");
            box.style.setProperty("box-shadow", `inset 0 0 0 1px ${foreground}`, "important");
        });

        popper.querySelectorAll(".MuiCheckbox-root.Mui-checked .MuiCheckbox-checkbox, .MuiCheckbox-root.MuiCheckbox-checked .MuiCheckbox-checkbox").forEach((box) => {
            box.style.setProperty("background", foreground, "important");
            box.style.setProperty("background-color", foreground, "important");
            box.style.setProperty("color", background, "important");
            box.style.setProperty("border", `1px solid ${foreground}`, "important");
        });

        popper.querySelectorAll(".MuiCheckbox-root.Mui-indeterminate .MuiCheckbox-checkbox, .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiCheckbox-checkbox").forEach((box) => {
            box.style.setProperty("background", foreground, "important");
            box.style.setProperty("background-color", foreground, "important");
            box.style.setProperty("color", background, "important");
            box.style.setProperty("border", `1px solid ${foreground}`, "important");
        });

        popper.querySelectorAll(".MuiCheckbox-root.Mui-checked .MuiCheckbox-action, .MuiCheckbox-root.MuiCheckbox-checked .MuiCheckbox-action, .MuiCheckbox-root.Mui-indeterminate .MuiCheckbox-action, .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiCheckbox-action").forEach((action) => {
            action.style.setProperty("color", background, "important");
        });

        popper.querySelectorAll(".MuiCheckbox-root .MuiSvgIcon-root, .MuiCheckbox-checkbox .MuiSvgIcon-root, .MuiIconButton-root .MuiSvgIcon-root, .MuiSvgIcon-root[data-testid='ChevronRightIcon'], .MuiSvgIcon-root[data-testid='ExpandMoreIcon']").forEach((icon) => {
            icon.style.setProperty("color", foreground, "important");
            icon.style.setProperty("background", "transparent", "important");
            icon.style.setProperty("background-color", "transparent", "important");

            icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
                shape.style.setProperty("fill", foreground, "important");
                shape.style.setProperty("stroke", foreground, "important");
            });
        });

        // Checked glyph must contrast against the checked checkbox fill.
        popper.querySelectorAll(".MuiSvgIcon-root[data-testid='CheckIcon'], .MuiSvgIcon-root[data-testid='RemoveIcon'], .MuiSvgIcon-root[data-testid='HorizontalRuleIcon']").forEach((icon) => {
            icon.style.setProperty("color", background, "important");
            icon.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
                shape.style.setProperty("fill", background, "important");
                shape.style.setProperty("stroke", background, "important");
            });
        });

        popper.querySelectorAll(".MuiCheckbox-root input[type='checkbox']").forEach((input) => {
            input.style.setProperty("accent-color", foreground, "important");
        });
    });
}

let clearModalTreeSelectVisibility = () => {
    const treeSelectPoppers = document.querySelectorAll(".MuiAutocomplete-popper, .base-Popper-root.MuiAutocomplete-listbox, [role='tree'].MuiAutocomplete-listbox");

    treeSelectPoppers.forEach((popper) => {
        popper.style.removeProperty("color");
        popper.style.removeProperty("background");
        popper.style.removeProperty("background-color");

        popper.querySelectorAll(".MuiPaper-root, .MuiAutocomplete-listbox, [role='listbox'], [role='option'], [role='treeitem'], .MuiAutocomplete-option, .MuiTypography-root, label, span, li, .MuiBox-root, .MuiCheckbox-root, .MuiCheckbox-action, .MuiCheckbox-checkbox, .MuiFormControl-root, .MuiCheckbox-root .MuiSvgIcon-root, .MuiCheckbox-checkbox .MuiSvgIcon-root, .MuiIconButton-root .MuiSvgIcon-root").forEach((node) => {
            node.style.removeProperty("color");
            node.style.removeProperty("background");
            node.style.removeProperty("background-color");
        });

        popper.querySelectorAll(".MuiCheckbox-checkbox").forEach((box) => {
            box.style.removeProperty("border");
            box.style.removeProperty("box-shadow");
        });

        popper.querySelectorAll(".MuiCheckbox-root, .MuiCheckbox-root.Mui-checked .MuiCheckbox-checkbox, .MuiCheckbox-root.MuiCheckbox-checked .MuiCheckbox-checkbox, .MuiCheckbox-root.Mui-indeterminate .MuiCheckbox-checkbox, .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiCheckbox-checkbox, .MuiCheckbox-root.Mui-checked .MuiCheckbox-action, .MuiCheckbox-root.MuiCheckbox-checked .MuiCheckbox-action, .MuiCheckbox-root.Mui-indeterminate .MuiCheckbox-action, .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiCheckbox-action").forEach((node) => {
            node.style.removeProperty("--Icon-color");
            node.style.removeProperty("border");
        });

        popper.querySelectorAll(".MuiCheckbox-root input[type='checkbox']").forEach((input) => {
            input.style.removeProperty("accent-color");
        });

        popper.querySelectorAll(".MuiCheckbox-root .MuiSvgIcon-root path, .MuiCheckbox-root .MuiSvgIcon-root circle, .MuiCheckbox-root .MuiSvgIcon-root rect, .MuiCheckbox-root .MuiSvgIcon-root polygon, .MuiCheckbox-root .MuiSvgIcon-root polyline, .MuiCheckbox-root .MuiSvgIcon-root line, .MuiCheckbox-root .MuiSvgIcon-root ellipse, .MuiCheckbox-checkbox .MuiSvgIcon-root path, .MuiCheckbox-checkbox .MuiSvgIcon-root circle, .MuiCheckbox-checkbox .MuiSvgIcon-root rect, .MuiCheckbox-checkbox .MuiSvgIcon-root polygon, .MuiCheckbox-checkbox .MuiSvgIcon-root polyline, .MuiCheckbox-checkbox .MuiSvgIcon-root line, .MuiCheckbox-checkbox .MuiSvgIcon-root ellipse, .MuiIconButton-root .MuiSvgIcon-root path, .MuiIconButton-root .MuiSvgIcon-root circle, .MuiIconButton-root .MuiSvgIcon-root rect, .MuiIconButton-root .MuiSvgIcon-root polygon, .MuiIconButton-root .MuiSvgIcon-root polyline, .MuiIconButton-root .MuiSvgIcon-root line, .MuiIconButton-root .MuiSvgIcon-root ellipse, .MuiSvgIcon-root[data-testid='CheckIcon'] path, .MuiSvgIcon-root[data-testid='RemoveIcon'] path, .MuiSvgIcon-root[data-testid='HorizontalRuleIcon'] path").forEach((shape) => {
            shape.style.removeProperty("fill");
            shape.style.removeProperty("stroke");
        });
    });
}

let isUiEffectElement = (ele) => {
    return !!(
        ele?.classList?.contains("MuiTouchRipple-root") ||
        ele?.closest?.(".MuiTouchRipple-root") ||
        ele?.classList?.contains("MuiBackdrop-root") ||
        ele?.classList?.contains("MuiBackdrop-invisible") ||
        ele?.classList?.contains("MuiModal-backdrop") ||
        ele?.closest?.(".MuiBackdrop-root") ||
        ele?.classList?.contains("MuiModal-root") ||
        ele?.classList?.contains("MuiPopover-root") ||
        ele?.classList?.contains("MuiMenu-root")
    );
}

let clearContrastStyles = (ele) => {
    if (!ele) return;
    ele.classList?.remove(...CONTRAST_CLASSES);
    ele.style?.removeProperty("background");
    ele.style?.removeProperty("background-color");
    ele.style?.removeProperty("color");
}

let isInsideExcludedSvgZone = (ele) => {
    return !!(
        ele?.closest?.("#chart_container") ||
        ele?.closest?.("#radar-summary") ||
        ele?.closest?.("#ada-overlay-widget-container")
    );
}

let isMuiSvgIconElement = (ele) => {
    if (!ele || !ele.closest || isInsideExcludedSvgZone(ele)) return false;
    return !!(ele.closest(".MuiSvgIcon-root") || ele.classList?.contains("MuiSvgIcon-root"));
}

let isSvgOrSvgChildElement = (ele) => {
    if (!ele) return false;
    return ele instanceof SVGElement || !!ele.closest?.("svg");
}

let applyMuiSvgIconContrast = (ele, colorCombination) => {
    const iconRoot = ele.classList?.contains("MuiSvgIcon-root") ? ele : ele.closest(".MuiSvgIcon-root");
    if (!iconRoot) return;

    iconRoot.classList.remove(...CONTRAST_CLASSES);
    iconRoot.classList.add(colorCombination);
    markContrastModified(iconRoot);
    iconRoot.style.removeProperty("background");
    iconRoot.style.removeProperty("background-color");

    const fg = getContrastForeground(colorCombination);
    iconRoot.style.setProperty("color", fg, "important");

    const shapes = iconRoot.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
    shapes.forEach((shape) => {
        shape.classList?.remove(...CONTRAST_CLASSES);
        markContrastModified(shape);
        shape.style.removeProperty("background");
        shape.style.removeProperty("background-color");

        const fillAttr = shape.getAttribute("fill");
        const strokeAttr = shape.getAttribute("stroke");
        const computed = window.getComputedStyle(shape);
        const computedFill = computed.getPropertyValue("fill");
        const computedStroke = computed.getPropertyValue("stroke");
        const hasVisibleFill = fillAttr && fillAttr !== "none";
        const hasVisibleStroke = strokeAttr && strokeAttr !== "none";
        const computedHasFill = computedFill && computedFill !== "none" && computedFill !== "rgba(0, 0, 0, 0)";
        const computedHasStroke = computedStroke && computedStroke !== "none" && computedStroke !== "rgba(0, 0, 0, 0)";

        if (hasVisibleFill || (!fillAttr && computedHasFill)) {
            shape.style.setProperty("fill", "currentColor", "important");
        }

        if (hasVisibleStroke || (!strokeAttr && computedHasStroke)) {
            shape.style.setProperty("stroke", "currentColor", "important");
        }

        // Fallback: keep icon visible if markup resolves to no paint channels.
        if (
            (fillAttr === "none" && (!strokeAttr || strokeAttr === "none")) ||
            (!fillAttr && !strokeAttr && !computedHasFill && !computedHasStroke)
        ) {
            shape.style.setProperty("stroke", "currentColor", "important");
        }

        if (!fillAttr && !strokeAttr && !computedHasFill && !computedHasStroke) {
            shape.style.setProperty("fill", "currentColor", "important");
        }
    });
}

let updateColor = (ele, colorCombination) => {
    if (isUiEffectElement(ele)) {
        // Keep UI effect layers (ripples/backdrops) transparent and unstyled.
        clearContrastStyles(ele);
        return;
    }

    // SVG nodes are handled by SVG-specific logic; never apply generic backgrounds here.
    if (isSvgOrSvgChildElement(ele)) {
        ele.classList?.remove(...CONTRAST_CLASSES);
        ele.style?.removeProperty("background");
        ele.style?.removeProperty("background-color");
        return;
    }

    ele.classList.remove(...CONTRAST_CLASSES);
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
    ele.style?.removeProperty("background");
    ele.style?.removeProperty("background-color");

    if (isMuiSvgIconElement(ele)) {
        applyMuiSvgIconContrast(ele, colorCombination);
        return;
    }

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
    markContrastModified(ele);
    ele.style.removeProperty("background");
    ele.style.removeProperty("background-color");
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
    markContrastModified(ele);
    ele.style.removeProperty("background");
    ele.style.removeProperty("background-color");

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
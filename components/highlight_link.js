import $ from "jquery";
import { isCustomOverlayTrigger } from "./global.js";
﻿let isHighlightLinksEnabled = false;
let defaultStyle = [];
let processedElements = new Set(); //This will ensure that there is unique element entries while setting up the default styles.
let interactiveElementSelector = 'a[href], a[tabindex="0"], button, input[type="submit"], input[type="button"], [role="button"], [role="link"]';
let highlightLinksObserver = null;

//This function will highlight links on page
export let handleHighlightLinks = (highlightSwitch) => {
    handleHighlightLinksStickiness(highlightSwitch);

    highlightSwitch.addEventListener("click", (e) => {
        handleCheckedState(highlightSwitch);
    });
    highlightSwitch.addEventListener("keydown", (e) => {
        if (e.keyCode === 13 || e.keyCode === 32 || e.which === 1) {
            highlightSwitch.click();
        }
    });
}

let startObservingHighlightLinks = () => {
    if (highlightLinksObserver) return;
    
    highlightLinksObserver = new MutationObserver((mutations) => {
        if (!isHighlightLinksEnabled) return;

        let addedElements = new Set();
        mutations.forEach(({ addedNodes, type, target }) => {
            // Handle added nodes
            if (type === 'childList') {
                addedNodes.forEach((node) => {
                    if (!(node instanceof Element) || isCustomOverlayTrigger(node) || node.closest("#ada-overlay-widget-container, svg")) return;

                    if (node.matches(interactiveElementSelector)) {
                        addedElements.add(node);
                    }
                    node.querySelectorAll(interactiveElementSelector).forEach((ele) => {
                        if (!isCustomOverlayTrigger(ele) && !ele.closest("#ada-overlay-widget-container, svg")) {
                            addedElements.add(ele);
                        }
                    });
                });
            }
            // Handle attribute changes (like disabled state)
            else if (type === 'attributes' && target instanceof Element) {
                if (!isCustomOverlayTrigger(target) && target.matches(interactiveElementSelector)) {
                    addedElements.add(target);
                }
            }
        });

        if (addedElements.size) {
            performLinksHighlighting(null, addedElements);
        }
    });
    
    highlightLinksObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
}

let stopObservingHighlightLinks = () => {
    if (!highlightLinksObserver) return;
    highlightLinksObserver.disconnect();
    highlightLinksObserver = null;
}

let handleCheckedState = (highlightSwitch) => {
    if ($(highlightSwitch).attr("aria-checked") === "false") {
        isHighlightLinksEnabled = true;
        highlightSwitch.querySelector(".text-wrapper-2").innerHTML = "On";
        $(highlightSwitch).attr("aria-checked", "true").addClass("active");
        localStorage.setItem("isHighlightLinkEnabled", true);
        performLinksHighlighting(highlightSwitch);
        startObservingHighlightLinks();
    }
    else {
        isHighlightLinksEnabled = false;
        highlightSwitch.querySelector(".text-wrapper-2").innerHTML = "Off";
        $(highlightSwitch).attr("aria-checked", "false").removeClass("active");
        localStorage.removeItem("isHighlightLinkEnabled");
        performLinksHighlighting(highlightSwitch);
        stopObservingHighlightLinks();
    }
}

let handleHighlightLinksStickiness = (highlightSwitch) => {
    if (localStorage.getItem("isHighlightLinkEnabled")) {
        handleCheckedState(highlightSwitch);
        isHighlightLinksEnabled = true;
        performLinksHighlighting(highlightSwitch);
        startObservingHighlightLinks();
    }
}

let saveOriginalStyles = (ele) => {
    if (!processedElements.has(ele)) {
        processedElements.add(ele);
        defaultStyle.push({
            element: ele,
            style: ele.getAttribute("style"),
            textDecoration: ele.style.textDecoration
        });
    }
}

let setHighlightingToDeafult = (ele) => {
    if (ele.hasAttribute("style")) {
        let defaultTextDecoration = defaultStyle.find(entry => entry.element === ele)?.textDecoration;
        let defaultStyleAttr = defaultStyle.find(entry => entry.element === ele)?.style;
        (defaultTextDecoration && (defaultStyleAttr && defaultStyleAttr.includes("text-decoration"))) ? ele.style.textDecoration = defaultTextDecoration : ele.style.removeProperty("text-decoration");
    }
}

let isButtonOrLink = (ele) => {
    let tagName = ele.tagName.toLowerCase();
    let type = ele.getAttribute("type");
    let role = ele.getAttribute("role");
    let href = ele.getAttribute('href');
    let tabindex = ele.getAttribute("tabindex");
    if (tagName || role) {
        if ((tagName === "a" && (href || tabindex === "0")) || tagName === "button" || tagName === "input" && (type === "submit" || type === "button") || role === "button" || role === "link") {
            return true;
        }
    }
}

function performLinksHighlighting(highlightSwitch, elements) {
    let allElements = elements || document.querySelectorAll("body, body *:not(#ada-overlay-widget-container *):not(svg):not(svg *)");
    allElements.forEach((ele) => {
        if (isCustomOverlayTrigger(ele)) return;
        if (isHighlightLinksEnabled) {
            let computedStyles = window.getComputedStyle(ele);
            if (computedStyles.getPropertyValue('text-decoration')) {
                saveOriginalStyles(ele)
                isButtonOrLink(ele) ? ele.classList.add("highlightLinks") : "";
            }
            else {
                isButtonOrLink(ele) ? ele.classList.add("highlightLinks") : "";
            }
        }
        else {
            ele.classList.remove("highlightLinks");
            setHighlightingToDeafult(ele);
        }
    });
}
import { isNestedUnderParent } from "./global.js";

let isFontSizeChanged = false;
let defaultStyles = [];
let processedElements = new Set();

export let handleSliderAccessibility = (sliderControl, increase, decrease) => {
    observeNodeChanges();
    handleFontSizeStickiness(sliderControl);
    handleSliderIncreaseDecrease(sliderControl, increase, decrease);
    handleSliderNavigation(sliderControl, increase, decrease);
    handleMouseEvents(sliderControl);
    handleRevert(document.querySelector(".revertFontSize"), sliderControl);
}

function observeNodeChanges() {
    let observer = new MutationObserver((mutations) => {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                handleUpdatedNodes(mutation.addedNodes);
                localStorage.getItem("fontSize") && removeFontSizeFromKendoIcons(localStorage.getItem("fontSize"));
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

function handleUpdatedNodes(addedNodes) {
    const elementsToTrack = [...addedNodes];
    while (elementsToTrack.length > 0) {
        const element = elementsToTrack.shift();
        if (element.nodeType === Node.ELEMENT_NODE && localStorage.getItem("fontSize")) {
            if (!isNestedUnderParent(element, "#ada-overlay-widget-container")) {
                saveOriginalStyles(element);
                let newSize = localStorage.getItem("fontSize");
                let currentFontSizeInPX = parseInt(window.getComputedStyle(element).getPropertyValue('font-size'), 10);
                let currentFontSizeInPT = currentFontSizeInPX * 0.75;
                checkAndUpdateFontSize(element, currentFontSizeInPT, newSize);
            }

            if (element.hasChildNodes()) {
                elementsToTrack.push(...element.childNodes);
            }
        }
    }
}

function handleFontSizeStickiness(sliderControl) {
    if (localStorage.getItem("fontSize") && localStorage.getItem("sliderPosition")) {
        let currentFontSize = localStorage.getItem("fontSize");
        let currentPosition = localStorage.getItem("sliderPosition");
        isFontSizeChanged = true;
        enlargeFont(currentFontSize);
        sliderControl.parentNode.style.left = currentPosition + "px";
        let sliderText = parseInt($(sliderControl).find(".span").text(), 10);
        $(sliderControl).find(".span").text(currentFontSize);
        $(sliderControl).attr("aria-valuenow", currentFontSize);
        $(sliderControl).attr("aria-valuetext", currentFontSize + "pt");
    }
}

function removeFontSizeFromKendoIcons(size) {
    let kendoIcons = document.querySelectorAll(".k-icon").childNodes;
    kendoIcons?.childNodes.forEach((icon) => {
        (icon.classList && Array.from(icon.classList).some(className => className.includes("font"))) && icon.classList.remove(`font${size}`);
    });
}

let handleSliderIncreaseDecrease = (sliderControl, increase, decrease) => {
    increase.addEventListener("click", () =>
    {
        let currentValue = parseInt(window.getComputedStyle(sliderControl.parentNode).getPropertyValue('left'), 10);
        identifyAndIncrease(currentValue, sliderControl);
        increase.setAttribute("aria-describedby", "sliderSizeDetails");
        isFontSizeChanged = true;
    });
    increase.addEventListener("keydown", (e) =>
    {
        if(e.keyCode === 13 || e.keyCode === 32 || e.which === 1)
        {
            let currentValue = parseInt(window.getComputedStyle(sliderControl.parentNode).getPropertyValue('left'), 10);
            identifyAndIncrease(currentValue, sliderControl);
            increase.setAttribute("aria-describedby", "sliderSizeDetails");
            isFontSizeChanged = true;
        }
    });
    decrease.addEventListener("click", () =>{
        let currentValue = parseInt(window.getComputedStyle(sliderControl.parentNode).getPropertyValue('left'), 10);
        identifyAndDecrease(currentValue, sliderControl);
        decrease.setAttribute("aria-describedby", "sliderSizeDetails");
        isFontSizeChanged = true;
    });
    decrease.addEventListener("keydown", (e) =>{
        if(e.keyCode === 13 || e.keyCode === 32 || e.which === 1){
            let currentValue = parseInt(window.getComputedStyle(sliderControl.parentNode).getPropertyValue('left'), 10);
            identifyAndDecrease(currentValue, sliderControl);
            decrease.setAttribute("aria-describedby", "sliderSizeDetails");
            isFontSizeChanged = true;
        }
    });
}

let enlargeFont = (size) =>
{
    var allElements = document.querySelectorAll("body, body *:not(#ada-overlay-widget-container):not(#ada-overlay-widget-container *):not(.k-icon):not(.k-icon *)");
    allElements.forEach((ele) => {
        if (ele && ele.nodeType === Node.ELEMENT_NODE) {
            let currentFontSizeInPX = parseInt(window.getComputedStyle(ele).getPropertyValue('font-size'), 10);
            let currentFontSizeInPT = currentFontSizeInPX * 0.75;
            saveOriginalStyles(ele);
            checkAndUpdateFontSize(ele, currentFontSizeInPT, size);
            localStorage.setItem("fontSize", size);
        } 
    });
}

function checkAndUpdateFontSize(ele, currentFontSizeInPT, newSize) {
    if ((!ele.classList) || (ele.classList && !ele.classList.contains("k-icon")) || (ele.tagName.toLowerCase() === "font" && !ele.closest(".k-icon"))) {
        //asked size is less than current && element do not have overlay font = keep same
        if ((newSize < currentFontSizeInPT) && (!hasOverlayFontAdded(ele))) { return; }
        //asked size is less than current && element have overlay font having greter size = set new size
        else if ((newSize < currentFontSizeInPT) && (hasOverlayFontAdded(ele))) {
            ele.classList.remove('font12', 'font14', 'font16', 'font18', 'font20', 'font22', 'font24', 'font26', 'font28', 'font30');
            ele.classList.add(`font${newSize}`);
            isFontSizeChanged = true;
        }
        //asked size is greater than current && element haver font having lower size = set new size
        else if (newSize > currentFontSizeInPT && hasOverlayFontAdded(ele)) {
            ele.classList.remove('font12', 'font14', 'font16', 'font18', 'font20', 'font22', 'font24', 'font26', 'font28', 'font30');
            ele.classList.add(`font${newSize}`);
            isFontSizeChanged = true;
        }
        else {
            ele.classList.remove('font12', 'font14', 'font16', 'font18', 'font20', 'font22', 'font24', 'font26', 'font28', 'font30');
            ele.classList.add(`font${newSize}`);
            isFontSizeChanged = true;
        }
    }
}

let hasOverlayFontAdded = (ele) => {
    const specificString = "font";
    let state = false;
    if (ele.classList) {
        const classList = Array.from(ele.classList);
        const hasSpecificString = classList.some(className => className.includes(specificString));
        return state = hasSpecificString ? true : false;
    }
    else {
        return false;
    }
}

let handleSliderNavigation = (sliderControl, increase, decrease) => {
    $(sliderControl).on("keydown", function(e)
    {
        switch(e.keyCode){
            case 35: endKeyNavigation(sliderControl); break;
            case 36: homeKeyNavigation(sliderControl); break;
            case 37: downAndLeftKeyNavigation(sliderControl); break;
            case 38: upAndRightKeyNavigation(sliderControl); break;
            case 39: upAndRightKeyNavigation(sliderControl); break;
            case 40: downAndLeftKeyNavigation(sliderControl); break;
            default: break;
        }
    });
}

let homeKeyNavigation = (sliderControl) =>{
   sliderControl.parentNode.style.left = "0px";
    $(sliderControl).find(".span").text(12);
    $(sliderControl).attr("aria-valuenow", 12);
    $(sliderControl).attr("aria-valuetext", 12+"pt");
    enlargeFont(12);
    localStorage.setItem("sliderPosition", 0);
}

let endKeyNavigation = (sliderControl) =>{
    sliderControl.parentNode.style.left = "230px";
    $(sliderControl).find(".span").text(30);
    $(sliderControl).attr("aria-valuenow", 30);
    $(sliderControl).attr("aria-valuetext", 30+"pt");
    enlargeFont(30);
    localStorage.setItem("sliderPosition", 230);
}

let upAndRightKeyNavigation = (sliderControl) =>{
    let currentPosition = parseInt(window.getComputedStyle(sliderControl.parentNode).getPropertyValue('left'), 10);
    identifyAndIncrease(currentPosition, sliderControl);
}

let downAndLeftKeyNavigation = (sliderControl) =>{
    let currentPosition = parseInt(window.getComputedStyle(sliderControl.parentNode).getPropertyValue('left'), 10);
    identifyAndDecrease(currentPosition, sliderControl);
}

let identifyAndIncrease = (currentPosition, sliderControl) => {
    if(currentPosition !== 230)
    {
        if(currentPosition < 205)
        {
            currentPosition += 25;
            sliderControl.parentNode.style.left = currentPosition +"px";
            let sliderText = parseInt($(sliderControl).find(".span").text(), 10);
            $(sliderControl).find(".span").text(sliderText + 2);
            $(sliderControl).attr("aria-valuenow", sliderText + 2);
            $(sliderControl).attr("aria-valuetext", sliderText + 2+"pt");
            enlargeFont(sliderText + 2);
            localStorage.setItem("sliderPosition", currentPosition);
        }
        else{
            sliderControl.parentNode.style.left = currentPosition + (230 - currentPosition)+"px";
            $(sliderControl).find(".span").text(30)
            $(sliderControl).attr("aria-valuenow", 30);
            $(sliderControl).attr("aria-valuetext", 30+"pt");
            enlargeFont(parseInt($(sliderControl).find(".span").text(), 10));
            localStorage.setItem("sliderPosition", currentPosition + (230 - currentPosition));
        }
    }
    return false;
}

let identifyAndDecrease = (currentPosition, sliderControl) =>{
    if(currentPosition !== 0)
    {
        if(currentPosition >= 25){
            currentPosition -= 25;
            sliderControl.parentNode.style.left = currentPosition +"px";
            let sliderText = parseInt($(sliderControl).find(".span").text(), 10);
            $(sliderControl).find(".span").text(sliderText - 2);
            $(sliderControl).attr("aria-valuenow", sliderText - 2);
            $(sliderControl).attr("aria-valuetext", sliderText - 2+"pt");
            enlargeFont(sliderText -2);
            localStorage.setItem("sliderPosition", currentPosition);
        }
        else{
            sliderControl.parentNode.style.left = (currentPosition - currentPosition)+"px";
            $(sliderControl).find(".span").text(12);
            $(sliderControl).attr("aria-valuenow", 12);
            $(sliderControl).attr("aria-valuetext", 12+"pt");
            enlargeFont(parseInt($(sliderControl).find(".span").text(), 10));
            localStorage.setItem("sliderPosition", (currentPosition - currentPosition));
        }
    }
    return false;
}

/*Mouse Interactivity */
let handleMouseEvents = (sliderControl) => {
    const slider = sliderControl.parentNode;
    const handle = sliderControl;
    const valueDisplay = document.querySelector("#sliderSizeDetails > .span");
    let isDragging = false;
    
    //Stop Increase and Decreae when handle is clicked
    sliderControl.addEventListener("click", function (e) {
        e.stopPropagation();
    })

    //Increase or decrease as clicked on Slider bar
    let sliderBar = $(sliderControl).parent().parent();
    $(sliderBar).click(function (e) {
        const sliderRect = slider.getBoundingClientRect();
        const clickX = e.clientX - sliderRect.left;
        const handleLeft = parseFloat(handle.style.left);
        if (clickX < 0) {
            let currentPosition = parseInt(window.getComputedStyle(sliderControl.parentNode).getPropertyValue('left'), 10);
            identifyAndDecrease(currentPosition, sliderControl);
        }
        else {
            let currentPosition = parseInt(window.getComputedStyle(sliderControl.parentNode).getPropertyValue('left'), 10);
            identifyAndIncrease(currentPosition, sliderControl);
        }
    });


    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        // Set the initial position of the mouse and the handle
        const initialMouseX = e.clientX;
        const initialHandleX = handle.parentNode.offsetLeft;

        // Set the max length allowed to drag
        const maxLeft = 260 - handle.parentNode.offsetWidth;

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                // Calculate the new position of the handle within the allowed range
                let newLeft = initialHandleX + e.clientX - initialMouseX;
                newLeft = Math.max(0, Math.min(maxLeft, newLeft));
                if (newLeft < 15 && newLeft == 0) {
                    moveSlider(newLeft, sliderControl, 12);
                }
                else if (newLeft > 15 && newLeft < 30) {
                    moveSlider(newLeft, sliderControl, 14);
                }
                else if (newLeft > 30 && newLeft < 60) {
                    moveSlider(newLeft, sliderControl, 16);
                }
                else if (newLeft > 60 && newLeft < 90) {
                    moveSlider(newLeft, sliderControl, 18);
                }
                else if (newLeft > 90 && newLeft < 120) {
                    moveSlider(newLeft, sliderControl, 20);
                }
                else if (newLeft > 120 && newLeft < 150) {
                    moveSlider(newLeft, sliderControl, 22);
                }
                else if (newLeft > 150 && newLeft < 180) {
                    moveSlider(newLeft, sliderControl, 24);
                }
                else if (newLeft > 180 && newLeft < 200) {
                    moveSlider(newLeft, sliderControl, 26);
                }
                else if (newLeft > 200 && newLeft < 210) {
                    moveSlider(newLeft, sliderControl, 28);
                }
                else if (newLeft > 210 && newLeft <= 230) {
                    moveSlider(newLeft, sliderControl, 30);
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            isDragging = false;
        });
    });
}

let moveSlider = (newPosition, sliderControl, fontSize) => {
    sliderControl.parentNode.style.left = newPosition + "px";
    let sliderText = parseInt($(sliderControl).find(".span").text(), 10);
    $(sliderControl).find(".span").text(fontSize);
    $(sliderControl).attr("aria-valuenow", fontSize);
    $(sliderControl).attr("aria-valuetext", fontSize+"pt");
    enlargeFont(fontSize);
    localStorage.setItem("sliderPosition", newPosition);
}

let handleRevert = (revertButton, sliderControl) => {
    revertButton.addEventListener("click", function () {
        var allElements = document.querySelectorAll("body, body *:not(#ada-overlay-widget-container):not(#ada-overlay-widget-container *)");
        allElements.forEach((ele) => {
            if (isFontSizeChanged) {
                revert(ele, sliderControl);
            }
        });
    });
    revertButton.addEventListener("keydown", function (e) {
        var allElements = document.querySelectorAll("body, body *:not(#ada-overlay-widget-container):not(#ada-overlay-widget-container *)");
        if (e.keyCode === 13 || e.keyCode === 32 || e.which === 1) {
            allElements.forEach((ele) => {
                if (isFontSizeChanged) {
                    revert(ele, sliderControl);
                }
            });
        }
    });
}

let revert = (ele, sliderControl) => {
    ele.classList.remove('font12', 'font14', 'font16', 'font18', 'font20', 'font22', 'font24', 'font26', 'font28', 'font30');
    sliderControl.parentNode.style.left = "0px";
    $(sliderControl).find(".span").text("12");
    $(sliderControl).attr("aria-valuenow", "12");
    $(sliderControl).attr("aria-valuetext", "12pt");
    revertFontSize(ele);
    $("#overlay-announcement .announce").text("Font Size Reverted!");
    setTimeout(() => { $("#overlay-announcement .announce").text(""); }, 100);
    localStorage.removeItem("fontSize");
    localStorage.removeItem("sliderPosition");
}

let saveOriginalStyles = (ele) => {
    let fontSize = window.getComputedStyle(ele).getPropertyValue('font-size');
    if (!processedElements.has(ele)) {
        processedElements.add(ele);
        defaultStyles.push({
            element: ele,
            style: ele.getAttribute("style"),
            fontSize: fontSize
        });
    }
}

let revertFontSize = (ele) => {
    if (ele.hasAttribute("style")) {
        let defaultFontSize = defaultStyles.find(entry => entry.element === ele)?.fontSize;
        let defaultStyle = defaultStyles.find(entry => entry.element === ele)?.style;
        (defaultFontSize && (defaultStyle && defaultStyle.includes("font-size"))) ? ele.style.setProperty('font-size', defaultFontSize) : "";
    }
}
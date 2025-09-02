import { handleColorContrastEnhancements } from './components/cc_enhancer.js';
import { handleFontStyles, handleTextAlignment } from './components/font_enhancer.js';
import toolUI from './components/overlay_ui.js';
import { bindSettingsMenu, enableDragAndDrop } from './components/settings-menu.js';
import { handleFocusVisibility } from './components/focus_visibility.js';
import { handleComboboxAccessibility } from './components/combobox.js';
import { handleSliderAccessibility } from './components/slider.js';
import { handleDialogAccessibility, handleRevertAll } from './components/dialog.js';
import { handleHighlightLinks } from './components/highlight_link.js';

document.addEventListener("readystatechange", (e) =>
{
    if(document.readyState === "complete")
    {
       //Load Add-on View
        let a11yToolContainer = document.createElement("div");
        a11yToolContainer.setAttribute("id", "ada-overlay-widget-container");
        a11yToolContainer.setAttribute("class", "ada-overlay-widget-container");
        document.getElementsByTagName("body")[0].prepend(a11yToolContainer);
        a11yToolContainer.innerHTML = toolUI;

        let overlayIcon = document.getElementById("overlay-icon");
        let addonDialog = document.querySelector("#overlay-popup");
        let contextMenuContainer = document.querySelector(".context-menu-container");

        //bind settings menu on addon button
        bindSettingsMenu(overlayIcon, contextMenuContainer);
        enableDragAndDrop(overlayIcon);

        //Addon Dialog Actions
        let closeModal = document.querySelector("#close-popup");
        let revertAll = document.querySelector("#revert-all");
        handleDialogAccessibility(addonDialog, closeModal, overlayIcon);
        handleRevertAll(revertAll);

        //Color contrast enhancer events
        handleColorContrastEnhancements(document.querySelectorAll("#ccEnhancer div[role='button']"));
        handleHighlightLinks(document.querySelector("#highlightLinkSwitch"));

        //Font Adjustment - dyslexic friendly fonts
        handleComboboxAccessibility(document.getElementById("fontStyleCombobox"), document.getElementById("fontStyleList"));
        handleFontStyles(document.getElementById("fontStyleCombobox"), document.getElementById("fontStyleList"));

        //Font Size adjustments
        handleSliderAccessibility(document.getElementById("fontSlider"), document.getElementById("fontIncrease"), document.getElementById("fontDecrease"));

        //Text Magnifier

        //Focus visibility toggle
        handleFocusVisibility(document.querySelector("#focusVisibility [role='switch']"));

        //Text Alignment
        handleTextAlignment(document.querySelectorAll("#textAlignment [role='button']"))
    }
});
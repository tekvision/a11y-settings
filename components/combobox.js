export let handleComboboxAccessibility = (inputElement, listbox) =>{
    handleComboboxExpandCollapse(inputElement, listbox);
    handleFocusInAndOut(inputElement, listbox);
    handleOptionsNavigation(inputElement, listbox);
}

let handleComboboxExpandCollapse = (fontStyleInput, fontStyleList) =>{
    fontStyleInput.addEventListener("click", (e) =>{
        e.stopPropagation();
        $(fontStyleList).toggleClass("showListbox");
        fontStyleInput.setAttribute("aria-expanded", "true");
    });
    $(fontStyleInput).on("keydown", function (e) {
        if (e.keyCode === 13 || e.keyCode === 32 || e.which === 1){
            $(fontStyleList).addClass("showListbox");
            $(this).attr("aria-expanded", "true");
        }
        else if(e.keyCode === 40 ) {
            $(fontStyleList).addClass("showListbox");
            $(fontStyleList).children().eq(0).focus();
            $(this).attr("aria-expanded", "true");
        }
        else if (e.keyCode === 38) {
            $(fontStyleList).addClass("showListbox");
            $(fontStyleList).children().last().focus();
            $(this).attr("aria-expanded", "true");
        }
        else if(e.keyCode ===27)
        {
            if(fontStyleList.classList.contains("showListbox"))
            {
                e.stopPropagation();
                handleCollapse(fontStyleInput, fontStyleList);
            }
            else{
                handleCollapse(fontStyleInput, fontStyleList);
            }
        }
    });
}

let handleOptionsNavigation = (fontStyleInput, fontStyleList) =>{
    //Navigate profile menu option using keyboard
    $(fontStyleList).children().on("keydown", function (e) {
        switch (e.keyCode) {
            case 27: e.stopPropagation(); handleCollapse(fontStyleInput, fontStyleList); break;
            case 38: upArrowInteraction($(this), e, fontStyleList); break;
            case 40: downArrowInteraction($(this), e, fontStyleList); break;
            default: break;
        }
    });
}

let handleCollapse = (fontStyleInput, fontStyleList) =>{
    $(fontStyleList).removeClass("showListbox");
    $(fontStyleInput).attr("aria-expanded", "false").focus();
    $(fontStyleList).children().attr("tabindex", "-1");
}

let handleFocusInAndOut = (fontStyleInput, fontStyleList) =>{
    //Close profile menu when focus is lost
    $(document).click(function(){
        if($(document.activeElement).attr("id") !== "fontStyleInput" && $(document.activeElement).parent().attr("id") !== "fontStyleList")
        {
            $(fontStyleList).removeClass("showListbox");
            $(fontStyleInput).attr("aria-expanded", "false");
            $(fontStyleList).children().attr("tabindex", "-1");
        }
    });
    $(document).on("focusin", function () {
        if($(document.activeElement).parent().attr("id") != "fontStyleList") {
            $(fontStyleList).removeClass("showListbox");
            $(fontStyleInput).attr("aria-expanded", "false");
            $(fontStyleList).children().attr("tabindex", "-1");
        }
    });
}

let upArrowInteraction = (elem, e, fontStyleList) =>    {
    e.preventDefault();
    var currentElementIndex = $(elem).index();
    if (currentElementIndex == 0) {
        $(fontStyleList).children().attr("tabindex", "-1");
        $(elem).parent().children().last().focus().attr("tabindex", "0");
    }
    else {
        $(fontStyleList).children().attr("tabindex", "-1");
        $(elem).prev().focus().attr("tabindex", "0");
    }
}
let downArrowInteraction = (elem, e, fontStyleList) => {
    e.preventDefault();
    var currentElementIndex = $(elem).index();
    var childrenCount = $(fontStyleList).children().length;
    if (currentElementIndex == childrenCount - 1) {
        $(fontStyleList).children().attr("tabindex", "-1");
        $(elem).parent().children().first().focus().attr("tabindex", "0");
    }
    else {
        $(fontStyleList).children().attr("tabindex", "-1");
        $(elem).next().focus().attr("tabindex", "0");
    }
}
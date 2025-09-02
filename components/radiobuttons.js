export let handleRadioButtonAccessibility = (radioGroup) => {
    let radioButtons = radioGroup.querySelectorAll("div[role='radio']");
    if (radioButtons) {
        radioButtons.forEach(radio => {
            radio.addEventListener("keydown", (e) => {
                switch (e.keyCode) {
                    case 37: handleBackwardNavigation(Array.from(radioButtons), radio); break;
                    case 38: handleBackwardNavigation(Array.from(radioButtons), radio); break;
                    case 39: handleForwardNavigation(Array.from(radioButtons), radio); break;
                    case 40: handleForwardNavigation(Array.from(radioButtons), radio); break;
                    default: break;
                }
            });
        })
    }
}

//Forward Nav
let handleForwardNavigation = (radioButtons, radio) => {
    let currentIndex = radioButtons.indexOf(radio);
    if (currentIndex < radioButtons.length - 1) {
        radioButtons[currentIndex + 1].focus();
        $(radioButtons).attr({ "tabindex": "-1", "aria-checked": "false" });
        $(radioButtons[currentIndex + 1]).attr({ "tabindex": "0", "aria-checked": "true" });
    }
}

//backward Nav
let handleBackwardNavigation = (radioButtons, radio) => {
    let currentIndex = radioButtons.indexOf(radio);
    if (currentIndex > 0) {
        radioButtons[currentIndex - 1].focus();
        $(radioButtons).attr({ "tabindex": "-1", "aria-checked": "false" });
        $(radioButtons[currentIndex - 1]).attr({ "tabindex": "0", "aria-checked": "true" });
    }
}
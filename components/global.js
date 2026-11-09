export function isNestedUnderParent(element, parentSelector) {
    const parentElement = document.querySelector(parentSelector);
    return element && element.closest(parentSelector) === parentElement;
}

export function isCustomOverlayTrigger(element) {
    return !!element?.closest?.("[data-ada-custom-trigger]");
}
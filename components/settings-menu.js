export let bindSettingsMenu = (overlayIcon, contextMenu) => {
    if (overlayIcon) {
        let positionContextMenuBelowOverlay = () => {
            const overlayRect = overlayIcon.getBoundingClientRect();
            const menuWidth = contextMenu.offsetWidth;
            const menuHeight = contextMenu.offsetHeight;
            const spacing = 6;
            const computedOverlayStyle = window.getComputedStyle(overlayIcon);
            const isRightAnchored = computedOverlayStyle.right !== "auto" && computedOverlayStyle.left === "auto";

            let menuLeft = isRightAnchored ? overlayRect.right - menuWidth : overlayRect.left;
            let menuTop = overlayRect.bottom + spacing;

            // Keep menu fully visible in viewport while anchoring it under the overlay icon.
            if (menuLeft + menuWidth > window.innerWidth) {
                menuLeft = window.innerWidth - menuWidth;
            }
            if (menuLeft < 0) {
                menuLeft = 0;
            }

            if (menuTop + menuHeight > window.innerHeight) {
                menuTop = overlayRect.top - menuHeight - spacing;
            }
            if (menuTop < 0) {
                menuTop = 0;
            }

            contextMenu.style.left = menuLeft + "px";
            contextMenu.style.top = menuTop + "px";
        };

        let repositionContextMenuIfOpen = () => {
            if (contextMenu.style.display === "block") {
                positionContextMenuBelowOverlay();

                const expandedMoveMenu = $(".move-menu[aria-expanded='true']");
                if (expandedMoveMenu.length > 0) {
                    positionContextSubmenu(contextMenu, expandedMoveMenu.parent());
                }
            }
        };

        overlayIcon.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showContextMenu(true, contextMenu, e);
            positionContextMenuBelowOverlay();
            $(".context-menu").children().first().children().focus();
        });

        window.addEventListener("resize", repositionContextMenuIfOpen);
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", repositionContextMenuIfOpen);
            window.visualViewport.addEventListener("scroll", repositionContextMenuIfOpen);
        }

        document.addEventListener("click", (e) => {
            const clickedMoveTrigger = $(e.target).closest(".move-menu");
            if (clickedMoveTrigger.length > 0) {
                e.preventDefault();
                rightArrowInteraction(clickedMoveTrigger, e);
            }
            else {
                closeAllMenus(false);
            }
        });

        $("ul.context-menu li a").keydown(function (e) {
            switch (e.keyCode) {
                case 37: leftArrowInteraction($(this)); break;
                case 38: upArrowInteraction($(this)); break;
                case 40: downArrowInteraction($(this), e); break;
                case 39: rightArrowInteraction($(this), e); break;
                case 27: escKeyInteraction($(this), e); break;
                case 13: activateMenu($(this), e); break;
                case 32: activateMenu($(this), e); break;
                default: break;
            }
        });

        $("ul.context-menu li a").click(function (e) {
            if ($(this).hasClass("move-menu") || $(this).children().hasClass("move-menu")) {
                e.stopPropagation();
                e.preventDefault();
                rightArrowInteraction($(".move-menu"), e);
            }
            else { activateMenu($(this), e); }
        })

        $("ul.context-menu li").on("mouseover", function () {
            positionContextSubmenu(contextMenu, $(this));
        });

        const moveSettingItem = contextMenu.querySelector(".move-setting");
        if (moveSettingItem) {
            moveSettingItem.addEventListener("focusout", (e) => {
                const nextFocusedElement = e.relatedTarget;
                if (!nextFocusedElement || !moveSettingItem.contains(nextFocusedElement)) {
                    closeMoveSubmenu(false);
                }
            });

            // Fallback for browsers/focus paths where relatedTarget is unreliable:
            // whenever focus lands outside Move group, collapse the submenu.
            document.addEventListener("focusin", (e) => {
                const target = e.target;
                const isMoveSubMenuOpen = $("#move-menu").css("display") === "block";

                if (!isMoveSubMenuOpen) {
                    return;
                }

                if (target instanceof Node && !moveSettingItem.contains(target)) {
                    closeMoveSubmenu(false);
                }
            }, true);
        }

        // If focus leaves the context menu entirely, close the whole menu.
        document.addEventListener("focusin", (e) => {
            const target = e.target;
            const isContextMenuOpen = contextMenu.style.display === "block";

            if (!isContextMenuOpen) {
                return;
            }

            if (target instanceof Node && !contextMenu.contains(target)) {
                closeAllMenus(false);
            }
        }, true);

        let showContextMenu = (show, contextMenu, e) => {
            show === true ? contextMenu.style.display = 'block' : contextMenu.style.display = 'none';
        }

        function closeMoveSubmenu(returnFocusToTrigger) {
            $(".context-sub-menu").css("display", "none");
            $(".context-sub-menu").find("a").attr("tabindex", "-1");
            $(".move-menu").attr("aria-expanded", "false");

            if (returnFocusToTrigger) {
                $(".move-menu").first().focus().attr("tabindex", "0");
            }
        }

        function closeAllMenus(returnFocusToOverlayIcon) {
            showContextMenu(false, contextMenu);
            closeMoveSubmenu(false);
            $(contextMenu).find("a").attr("tabindex", "-1");

            if (returnFocusToOverlayIcon) {
                $("#overlay-icon").focus();
            }
        }

        function leftArrowInteraction(elem) {
            if ($(elem).parent().parent().attr("class") === "context-sub-menu") {
                closeMoveSubmenu(true);
            }
        }

        function upArrowInteraction(elem) {
            var currentElementIndex = $(elem).parent().index();
            if (currentElementIndex == 0) {
                $(".context-menu a").attr("tabindex", "-1");
                $(elem).parent().parent().children().last().children("a").focus().attr("tabindex", "0");
            }
            else {
                $(".context-menu a").attr("tabindex", "-1");
                $(elem).parent().prev().children("a").focus().attr("tabindex", "0");
            }
        }
        function downArrowInteraction(elem, e) {
            var currentElementIndex = $(elem).parent().index();
            var childrenCount = $(".context-menu").children().length;
            var subMenuChildCount = $(".context-sub-menu").children().length;
            e.preventDefault();
            if (currentElementIndex == childrenCount - 1 || currentElementIndex == subMenuChildCount - 1) {
                $(".context-menu a").attr("tabindex", "-1");
                $(elem).parent().parent().children().first().children("a").focus().attr("tabindex", "0");
            }
            else
                $(".context-menu a").attr("tabindex", "-1");
            $(elem).parent().next("li").children("a").focus().attr("tabindex", "0");
        }
        function rightArrowInteraction(elem, e) {
            if ($(elem).hasClass("move-menu")) {
                e.preventDefault();
                positionContextSubmenu(contextMenu, $(elem).parent());
                $(elem).next().children().first().children().focus();
                $(elem).attr("aria-expanded", "true");
            }
            else {
                e.preventDefault();
            }
        }
        function escKeyInteraction(elem, e) {
            e.preventDefault();
            if ($(elem).parent().parent().attr("class") === "context-sub-menu") {
                closeMoveSubmenu(true);
            }
            else {
                closeAllMenus(true);
            }
        }

        function activateMenu(elem, e) {
            let dialog = document.querySelector(".overlay-popup");
            if ($(elem).parent().parent().attr("class") === "context-sub-menu") {
                switch ($(elem).text()) {
                    case "Top-Left":
                        overlayIcon.removeAttribute("style");
                        overlayIcon.style.left = "0px"
                        handlePositionChange(dialog, overlayIcon, "TopLeft", "b-r-Left");
                        setTimeout(() => { $(overlayIcon).focus(); }, 50); break;
                    case "Top-Right":
                        overlayIcon.removeAttribute("style");
                        overlayIcon.style.right = "0px"
                        handlePositionChange(dialog, overlayIcon, "TopRight", "b-r-Right");
                        setTimeout(() => { $(overlayIcon).focus(); }, 50); break;
                    case "Bottom-Left":
                        overlayIcon.removeAttribute("style");
                        overlayIcon.style.left = "0px";
                        overlayIcon.style.top = "auto";
                        overlayIcon.style.bottom = "8px";
                        handlePositionChange(dialog, overlayIcon, "TopLeft", "b-r-Left");
                        setTimeout(() => { $(overlayIcon).focus(); }, 50); break;
                    case "Bottom-Right":
                        overlayIcon.removeAttribute("style");
                        overlayIcon.style.right = "0px";
                        overlayIcon.style.top = "auto";
                        overlayIcon.style.bottom = "8px";
                        handlePositionChange(dialog, overlayIcon, "TopRight", "b-r-Right");
                        setTimeout(() => { $(overlayIcon).focus(); }, 50); break;
                    default: break;
                }
            }
        }
    }
}

function positionContextSubmenu(contextMenu, elem) {
    let contextSubMenu = document.querySelector(".context-sub-menu");
    const moveMenuTrigger = $(elem).children(".move-menu").get(0);

    if (moveMenuTrigger) {
        contextSubMenu.style.display = "block";
        contextSubMenu.style.visibility = "hidden";

        const triggerRect = moveMenuTrigger.getBoundingClientRect();
        const subMenuWidth = contextSubMenu.offsetWidth;
        const subMenuHeight = contextSubMenu.offsetHeight;
        const spacing = 4;
        const availableRight = window.innerWidth - (triggerRect.right + spacing);
        const availableLeft = triggerRect.left - spacing;
        const shouldOpenLeft = availableRight < subMenuWidth && availableLeft > availableRight;

        const preferredTop = triggerRect.top;
        const topIfBottomAligned = triggerRect.bottom - subMenuHeight;

        const preferredTopOverflow = Math.max(0, preferredTop + subMenuHeight - window.innerHeight);
        const bottomAlignedOverflow = Math.max(0, topIfBottomAligned + subMenuHeight - window.innerHeight) + Math.max(0, -topIfBottomAligned);

        let subMenuLeft = shouldOpenLeft
            ? triggerRect.left - subMenuWidth - spacing
            : triggerRect.right + spacing;
        let subMenuTop = bottomAlignedOverflow < preferredTopOverflow ? topIfBottomAligned : preferredTop;

        subMenuLeft = Math.max(0, Math.min(subMenuLeft, window.innerWidth - subMenuWidth));
        subMenuTop = Math.max(0, Math.min(subMenuTop, window.innerHeight - subMenuHeight));

        contextSubMenu.style.position = "fixed";
        contextSubMenu.style.left = subMenuLeft + "px";
        contextSubMenu.style.top = subMenuTop + "px";
        contextSubMenu.style.right = "auto";
        contextSubMenu.style.visibility = "visible";
    } else {
        $("#move-menu").css({ "display": "none" });
    }
}

export let enableDragAndDrop = (draggableButton) => {
    draggableButton.draggable = true;
    let viewportResizeBound = false;
    let lastViewportWidth = null;
    let lastViewportHeight = null;
    let anchoredSide = null;

    let getViewportSize = () => {
        if (window.visualViewport) {
            return {
                width: Math.round(window.visualViewport.width),
                height: Math.round(window.visualViewport.height)
            };
        }

        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    };

    let clampOverlayButtonWithinViewport = () => {
        const viewport = getViewportSize();
        const rect = draggableButton.getBoundingClientRect();
        const buttonWidth = rect.width || draggableButton.offsetWidth;
        const buttonHeight = rect.height || draggableButton.offsetHeight;

        const currentLeft = Number.isFinite(parseFloat(draggableButton.style.left))
            ? parseFloat(draggableButton.style.left)
            : rect.left;
        const currentTop = Number.isFinite(parseFloat(draggableButton.style.top))
            ? parseFloat(draggableButton.style.top)
            : rect.top;

        const clampedLeft = Math.max(0, Math.min(currentLeft, viewport.width - buttonWidth));
        const clampedTop = Math.max(0, Math.min(currentTop, viewport.height - buttonHeight));

        draggableButton.style.left = clampedLeft + "px";
        draggableButton.style.top = clampedTop + "px";
        draggableButton.style.right = "auto";
        draggableButton.style.bottom = "auto";
    };

    let snapOverlayButtonToSide = () => {
        const viewport = getViewportSize();
        const rect = draggableButton.getBoundingClientRect();
        const buttonWidth = rect.width || draggableButton.offsetWidth;

        if (anchoredSide === "right") {
            draggableButton.style.left = Math.max(0, viewport.width - buttonWidth) + "px";
        }
        else {
            draggableButton.style.left = "0px";
        }

        draggableButton.style.right = "auto";
        draggableButton.style.bottom = "auto";
    };

    let preserveRelativePositionOnViewportChange = () => {
        if (lastViewportWidth === null || lastViewportHeight === null) {
            return;
        }

        const rect = draggableButton.getBoundingClientRect();
        const buttonWidth = rect.width || draggableButton.offsetWidth;
        const buttonHeight = rect.height || draggableButton.offsetHeight;
        const viewport = getViewportSize();

        const oldHorizontalSpace = Math.max(1, lastViewportWidth - buttonWidth);
        const oldVerticalSpace = Math.max(1, lastViewportHeight - buttonHeight);
        const newHorizontalSpace = Math.max(0, viewport.width - buttonWidth);
        const newVerticalSpace = Math.max(0, viewport.height - buttonHeight);

        const currentLeft = Number.isFinite(parseFloat(draggableButton.style.left))
            ? parseFloat(draggableButton.style.left)
            : rect.left;
        const currentTop = Number.isFinite(parseFloat(draggableButton.style.top))
            ? parseFloat(draggableButton.style.top)
            : rect.top;

        const horizontalRatio = Math.max(0, Math.min(1, currentLeft / oldHorizontalSpace));
        const verticalRatio = Math.max(0, Math.min(1, currentTop / oldVerticalSpace));

        draggableButton.style.left = (horizontalRatio * newHorizontalSpace) + "px";
        draggableButton.style.top = (verticalRatio * newVerticalSpace) + "px";
        draggableButton.style.right = "auto";
        draggableButton.style.bottom = "auto";
    };

    let syncOverlayPositionOnViewportChange = () => {
        preserveRelativePositionOnViewportChange();
        clampOverlayButtonWithinViewport();
        snapOverlayButtonToSide();

        const iconRect = draggableButton.getBoundingClientRect();
        const iconCenterX = iconRect.left + (iconRect.width / 2);
        const viewportCenterX = getViewportSize().width / 2;
        let dialog = document.getElementById("overlay-popup");
        let overlayIcon = document.getElementById("overlay-icon");

        if (iconCenterX >= viewportCenterX) {
            handlePositionChange(dialog, overlayIcon, "TopRight", "b-r-Right");
        }
        else {
            handlePositionChange(dialog, overlayIcon, "TopLeft", "b-r-Left");
        }

        const viewport = getViewportSize();
        lastViewportWidth = viewport.width;
        lastViewportHeight = viewport.height;
    };

    document.body.addEventListener("dragover", (e) => { e.preventDefault(); })
    // Handle the start of the drag operation
    draggableButton.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("text/plain", ""); // Required for the drag to work in some browsers
        e.dataTransfer.effectAllowed = "move";
        $("#move-menu, .context-menu-container").css("display", "none");
    });

    // Handle the end of the drag operation
    draggableButton.addEventListener('dragend', (e) => {
        const viewport = getViewportSize();
        const centerX = viewport.width / 2;
        let dialog = document.getElementById("overlay-popup");
        let overlayIcon = document.getElementById("overlay-icon");

        let dropX = e.clientX - draggableButton.offsetWidth / 2;
        let dropY = e.clientY - draggableButton.offsetHeight / 2;

        // To keep button stays within the viewport
        dropX = Math.max(0, Math.min(dropX, viewport.width - draggableButton.offsetWidth));
        dropY = Math.max(0, Math.min(dropY, viewport.height - draggableButton.offsetHeight));

        draggableButton.style.left = dropX + 'px';
        draggableButton.style.top = dropY + 'px';
        draggableButton.style.right = 'auto';
        draggableButton.style.bottom = 'auto';

        // Handle positioning based on the horizontal center
        if (e.clientX > centerX) {
            // Keep right-opening dialog when icon is on viewport right side.
            anchoredSide = "right";
            handlePositionChange(dialog, overlayIcon, "TopRight", "b-r-Right");
        }
        else {
            // Keep left-opening dialog when icon is on viewport left side.
            anchoredSide = "left";
            handlePositionChange(dialog, overlayIcon, "TopLeft", "b-r-Left");
        }

        clampOverlayButtonWithinViewport();
        snapOverlayButtonToSide();
        lastViewportWidth = viewport.width;
        lastViewportHeight = viewport.height;

        if (!viewportResizeBound) {
            window.addEventListener("resize", syncOverlayPositionOnViewportChange);
            if (window.visualViewport) {
                window.visualViewport.addEventListener("resize", syncOverlayPositionOnViewportChange);
            }
            viewportResizeBound = true;
        }
    });
};


let handlePositionChange = (overlay, overlayIcon, position, border) => {
    overlayIcon.classList.remove("positionTopLeft", "positionTopRight", "positionBottomRight", "positionBottomLeft", "b-r-Left", "b-r-Right");
    overlay.classList.remove("popupPositionTopRight", "popupPositionTopLeft", "popupPositionBottomRight", "popupPositionBottomLeft");
    overlayIcon.classList.add(border);
    overlay.classList.add("popupPosition"+position);
} 
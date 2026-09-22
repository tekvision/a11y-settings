export let bindSettingsMenu = (overlayIcon, contextMenu) => {
    if (overlayIcon) {
        overlayIcon.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showContextMenu(true, contextMenu, e);
            /* Old Code
            let currentXPos = e.pageX + contextMenu.offsetWidth > window.innerWidth ? window.innerWidth - contextMenu.offsetWidth : e.pageX;
            let currentYPos = e.pageY + contextMenu.offsetHeight > window.innerHeight ? window.innerHeight - contextMenu.offsetHeight : e.pageY;
            contextMenu.style.left = currentXPos + "px";
            contextMenu.style.top = currentYPos + "px";
            */

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Position the context menu
            const menuWidth = contextMenu.offsetWidth;
            const menuHeight = contextMenu.offsetHeight;

            let menuX = mouseX;
            let menuY = mouseY;

            // Check if the menu goes beyond the right edge
            if (mouseX + menuWidth > window.innerWidth) {
                menuX = window.innerWidth - menuWidth;
            }

            // Check if the menu goes beyond the bottom edge
            if (mouseY + menuHeight > window.innerHeight) {
                menuY = window.innerHeight - menuHeight;
            }

            contextMenu.style.left = menuX + 'px';
            contextMenu.style.top = menuY + 'px';
            $(".context-menu").children().first().children().focus();
        });

        document.addEventListener("click", (e) => {
            if ($(document.activeElement).hasClass("move-menu") || $(e.target).children().hasClass("move-menu")) {
                e.preventDefault();
                rightArrowInteraction($(".move-menu"), e);
            }
            else {
                showContextMenu(false, contextMenu);
                $(".context-sub-menu").css("display", "none");
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

        let showContextMenu = (show, contextMenu, e) => {
            show === true ? contextMenu.style.display = 'block' : contextMenu.style.display = 'none';
        }

        function leftArrowInteraction(elem) {
            if ($(elem).parent().parent().attr("class") === "context-sub-menu") {
                $(".context-sub-menu").css("display", "none");
                $(".context-sub-menu").find("a").attr("tabindex", "-1");
                $(".context-sub-menu").prev().attr("aria-expanded", "false").focus();
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
                $(".context-sub-menu").css("display", "none");
                $(".context-sub-menu").find("a").attr("tabindex", "-1");
                $(".context-sub-menu").prev().attr("aria-expanded", "false").focus();
            }
            else {
                $(contextMenu).css("display", "none");
                $("#move-menu").css("display", "none");
                $(contextMenu).find("a").attr("tabindex", "-1");
                $("#overlay-icon").focus();
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
                        overlayIcon.style.top = "90%";
                        handlePositionChange(dialog, overlayIcon, "TopLeft", "b-r-Left");
                        setTimeout(() => { $(overlayIcon).focus(); }, 50); break;
                    case "Bottom-Right":
                        overlayIcon.removeAttribute("style");
                        overlayIcon.style.right = "0px";
                        overlayIcon.style.top = "90%";
                        handlePositionChange(dialog, overlayIcon, "TopRight", "b-r-Right");
                        setTimeout(() => { $(overlayIcon).focus(); }, 50); break;
                    default: break;
                }
            }
        }
    }
}

function positionContextSubmenu(contextMenu, elem) {
    let menuLeft = contextMenu.style.left;
    let menuTop = contextMenu.style.top;
    let contextSubMenu = document.querySelector(".context-sub-menu");

    //Menu at right side
    if ($(elem).children().attr("class") === "move-menu" && parseInt(menuLeft, 10) > 1000) {
        //and at top
        if (parseInt(menuTop, 10) < 550) {
            contextSubMenu.style.left = "-110px";
            contextSubMenu.style.right = "auto";
            contextSubMenu.style.top = "0px";
            $(elem).children().next().css({ "display": "block" });
        }
        //at bottom
        else if (parseInt(menuTop, 10) > 550) {
            contextSubMenu.style.left = "-110px";
            contextSubMenu.style.right = "auto";
            contextSubMenu.style.top = "-88px";
            $(elem).children().next().css({ "display": "block" });
        }
    }
    //Menu at left side
    else if ($(elem).children().attr("class") === "move-menu" && parseInt(menuLeft, 10) < 100) {
        //and at top
        if (parseInt(menuTop, 10) < 550) {
            contextSubMenu.style.right = "-110px";
            contextSubMenu.style.left = "auto";
            contextSubMenu.style.top = "0px";
            $(elem).children().next().css({ "display": "block" });
        }
        //at bottom
        else if (parseInt(menuTop, 10) > 550) {
            contextSubMenu.style.right = "-110px";
            contextSubMenu.style.left = "auto";
            contextSubMenu.style.top = "-88px";
            $(elem).children().next().css({ "display": "block" });
        }
    }
    else {
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
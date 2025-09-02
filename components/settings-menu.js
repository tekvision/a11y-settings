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
    document.body.addEventListener("dragover", (e) => { e.preventDefault(); })
    // Handle the start of the drag operation
    draggableButton.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("text/plain", ""); // Required for the drag to work in some browsers
        e.dataTransfer.effectAllowed = "move";
        $("#move-menu, .context-menu-container").css("display", "none");
    });

    // Handle the end of the drag operation
    draggableButton.addEventListener('dragend', (e) => {
        const centerX = window.innerWidth / 2;
        let dialog = document.getElementById("overlay-popup");
        let overlayIcon = document.getElementById("overlay-icon");

        let dropX = e.clientX - draggableButton.offsetWidth / 2;
        let dropY = e.clientY - draggableButton.offsetHeight / 2;

        // To keep button stays within the viewport
        dropX = Math.max(0, Math.min(dropX, window.innerWidth - draggableButton.offsetWidth));
        dropY = Math.max(0, Math.min(dropY, window.innerHeight - draggableButton.offsetHeight));

        draggableButton.style.left = dropX + 'px';
        draggableButton.style.top = dropY + 'px';

        // Handle positioning based on the horizontal center
        if (e.clientX > centerX) {
            // Position to the right of the screen
            handlePositionChange(dialog, overlayIcon, "TopRight", "b-r-Right");
            draggableButton.style.left = (window.innerWidth - draggableButton.offsetWidth - 15) + 'px';
        }
        else {
            //Position to the left of the scren
            handlePositionChange(dialog, overlayIcon, "TopLeft", "b-r-Left");
            draggableButton.style.left = '0';
        }
    });
};


let handlePositionChange = (overlay, overlayIcon, position, border) => {
    overlayIcon.classList.remove("positionTopLeft", "positionTopRight", "positionBottomRight", "positionBottomLeft", "b-r-Left", "b-r-Right");
    overlay.classList.remove("popupPositionTopRight", "popupPositionTopLeft", "popupPositionBottomRight", "popupPositionBottomLeft");
    overlayIcon.classList.add(border);
    overlay.classList.add("popupPosition"+position);
} 
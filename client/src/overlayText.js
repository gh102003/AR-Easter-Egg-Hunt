let overlayTextEl;
let hideOverlayTextHandle = null;

export const init = () => {
    overlayTextEl = document.createElement("div");
    document.body.appendChild(overlayTextEl);
    overlayTextEl.className = "overlay-text";
}

export const show = text => {
    overlayTextEl.innerHTML = text;
    overlayTextEl.classList.add("visible");
};

export const hide = timeDelay => {
    if (hideOverlayTextHandle) {
        clearTimeout(hideOverlayTextHandle); // cancel hiding
    }
    hideOverlayTextHandle = setTimeout(() => overlayTextEl.classList.remove("visible"), timeDelay);
};
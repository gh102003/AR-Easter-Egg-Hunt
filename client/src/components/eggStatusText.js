export const init = () => {

    AFRAME.registerComponent("new-egg-found-text", {
        init: function () {
            this.el.object3D.visible = false;
        },
        events: {
            "parentMarkerFound": function (event) {
                if (event.detail.isNewEgg) {
                    this.transformText();
                    this.el.object3D.visible = true;
                }
            },
            "parentMarkerLost": function () {
                this.el.object3D.visible = false;
            }
        },
        transformText: function () {
            // translate so text is centred, and rotate towards camera
            const geometry = this.el.getObject3D("mesh").geometry;
            geometry.computeBoundingBox();
            geometry.center();


            // rotate towards camera, but not vertically
            let cameraPos = new THREE.Vector3();
            const camera = document.querySelector("[camera]");
            if (camera === null) {
                return;
            }
            camera.object3D.getWorldPosition(cameraPos);

            this.el.object3D.lookAt(cameraPos);

            // 'flatten' so perpendicular to y axis
            this.el.object3D.rotation.x = 0;
            this.el.object3D.rotation.z = 0;
        }
    });

    // all eggs can share the same text

    const overlayTextEl = document.createElement("div");
    document.body.appendChild(overlayTextEl);
    overlayTextEl.className = "overlay-text";

    const showOverlayText = () => {
        overlayTextEl.classList.add("visible");
    };

    let hideOverlayTextHandle = null;
    const hideOverlayText = timeDelay => {
        if (hideOverlayTextHandle) {
            clearTimeout(hideOverlayTextHandle); // cancel hiding
        }
        hideOverlayTextHandle = setTimeout(() => overlayTextEl.classList.remove("visible"), timeDelay);
    };

    AFRAME.registerComponent("new-egg-found-text-overlay", {
        init: function () {
            // this.el.object3D.visible = false;
        },
        events: {
            "parentMarkerFound": function (event) {
                if (event.detail.isNewEgg) {
                    overlayTextEl.innerHTML = "New Egg Found!";
                    showOverlayText();
                    hideOverlayText(5000);
                }
            },
            "parentMarkerLost": function () {
                this.el.object3D.visible = false;
            }
        }
    });

};
export const init = () => {
  AFRAME.registerComponent("light-ring", {
    init: function () {
      const lightCount = 16;
      const egg = document.querySelector("#egg_entity");
      for (let i = 0; i < lightCount; i++) {
        const light = document.createElement("a-light");
        light.setAttribute("light", {
          type: "spot",
          target: egg,
          intensity: 0
        });
        light.setAttribute("animation", {
          property: "light.intensity",
          from: 0,
          to: 0.1,
          dur: 100,
          easing: "easeInOutCubic",
          startEvents: "light-ring-on"
        });

        // position is on a unit circle
        const pos = new THREE.Vector3(1.5, 0.05, 0);
        pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), i * 2 * Math.PI / lightCount);
        light.object3D.position.copy(pos);
        this.el.appendChild(light);
      }
    },
    events: {
      "parentMarkerFound": function () {
        let i = -2;
        this.handle = setInterval(() => {
          if (++i >= this.el.children.length) {
            clearInterval(this.handle);
            return;
          }
          if (i < 0) {
            return;
          }

          this.el.children[i].emit("light-ring-on", {}, false);
          // this.el.children[i].setAttribute("light", "intensity", 0.5);
        }, 100);
      },
      "parentMarkerLost": function () {
        const lightCount = this.el.children.length;
        clearInterval(this.handle);
        for (let i = 0; i < lightCount; i++) {
          this.el.children[i].setAttribute("light", "intensity", 0);
        }
      }
    }
  })
};
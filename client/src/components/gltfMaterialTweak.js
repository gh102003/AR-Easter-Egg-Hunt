export const init = () => {

  // The built-in 'opacity' component doesn't affect custom gltf models because they use their own materials
  // Therefore create a customer component that will change the opacity (and colour) of a material
  AFRAME.registerComponent("gltf-material-tweak", {
    schema: {
      material: { type: "string", default: "" },
      opacity: { type: "number", default: null },
      color: { type: "color", default: null }
    },
    init: function () {
      this.el.addEventListener('model-loaded', this.update.bind(this));
    },
    update: function () {
      const mesh = this.el.getObject3D("mesh");
      if (!mesh) {
        // console.error("no mesh");
        return;
      }

      if (!this.data.material) {
        console.error("no material name");
        return;
      }

      mesh.traverse(node => {
        if (node.material && node.material.name === this.data.material) {
          if (this.data.opacity !== null) {
            node.material.opacity = this.data.opacity;
            node.material.transparent = this.data.opacity < 1.0;
          }
          if (this.data.color !== null) {
            node.material.color.set(this.data.color);
          }
          node.material.needsUpdate = true;
        }
      });

    }
  });

  AFRAME.registerComponent("change-colors", {
    schema: {
      first: { type: "color" },
      second: { type: "color" }
    },
    init: function () {
      this.el.addEventListener('model-loaded', this.update.bind(this));
    },
    update: function () {
      const mesh = this.el.getObject3D("mesh");
      if (!mesh) {
        return;
      }

      mesh.traverse(node => {
        if (!node.material) {
          return;
        }
        if (node.material.name === "EggMaterial001" || node.material.name === "EggMaterial003") {
          if (this.data.first !== null) {
            node.material.color.set(this.data.first);
          }
          node.material.needsUpdate = true;
        } else if (node.material.name === "EggMaterial002" || node.material.name === "EggMaterial004") {
          if (this.data.second !== null) {
            node.material.color.set(this.data.second);
          }
        }
      });

    }
  });
};
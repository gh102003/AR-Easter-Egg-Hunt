export const init = () => {

  // The built-in 'opacity' component doesn't affect custom gltf models because they use their own materials
  // Therefore create a customer component that will change the opacity (and colour) of a material
  AFRAME.registerComponent("gltf-material-tweak", {
    schema: {
      material: { type: "string", default: "" },
      opacity: { type: "number", default: null },
      color: { type: "color", default: null }
    },
    multiple: true,
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
};
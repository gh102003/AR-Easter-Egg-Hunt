export const init = () => {
  AFRAME.registerComponent("confetti-particles", {
    init: function () {
      this.scale = new THREE.Vector3(1, 1, 1);
    },
    tick: function () {

      // initialise here in IIFE to save memory, since they can be reused every tick
      let matrix = new THREE.Matrix4();
      let pos = new THREE.Vector3()
      let rot = new THREE.Quaternion();
      let deltaRot = new THREE.Quaternion();

      return function (time, timeDelta) {
        if (!this.particleMesh) return;

        for (let i = 0; i < this.particleMesh.count; i++) {
          // get transformation matrix from InstancedMesh
          this.particleMesh.getMatrixAt(i, matrix);
          pos.setFromMatrixPosition(matrix);
          rot.setFromRotationMatrix(matrix);

          // stop if at ground
          if (pos.y < 0) {
            continue;
          }

          // modify position
          pos.y -= this.velocities[i] * timeDelta;

          // modify rotation
          deltaRot.setFromAxisAngle(this.rotationAxes[i], 0.001 * timeDelta);
          rot.multiply(deltaRot).normalize();

          // set transformation
          matrix.compose(pos, rot, this.scale);
          this.particleMesh.setMatrixAt(i, matrix);
        }
        this.particleMesh.instanceMatrix.needsUpdate = true;
      }
    }(),
    events: {
      parentMarkerFound: function () {
        console.log("create particles");
        // this.el.innerHTML = "";
        if (this.particleMesh) {
          this.particleMesh.dispose();
        }
        this.createParticles();
      }
    },
    createParticles: function () {
      const particleCount = 500;

      const geometry = new THREE.PlaneGeometry(0.1, 0.1);
      const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

      // use an InstancedMesh which uses same geometry and material
      // for every particle, but different colour and transformation (matrix)
      this.particleMesh = new THREE.InstancedMesh(geometry, material, particleCount);

      // #region individual properties for particles =================================

      this.rotationAxes = [];
      this.velocities = [];

      // random position (with repeated random for gaussian-like distribution)
      // above egg, out of sight of camera
      // (defined outside loop for performance)
      const randPos = () => {
        const x = THREE.Math.randFloatSpread(6) + THREE.Math.randFloatSpread(6) + THREE.Math.randFloatSpread(6);
        const y = 12 + THREE.Math.randFloatSpread(5) + THREE.Math.randFloatSpread(5);
        const z = THREE.Math.randFloatSpread(6) + THREE.Math.randFloatSpread(8) + THREE.Math.randFloatSpread(6);
        return new THREE.Vector3(x, y, z);
      };

      for (let i = 0; i < particleCount; i++) {
        // set random pastel colours ----------
        const colour = new THREE.Color().setHSL(Math.random(), 0.3, 0.55);
        this.particleMesh.setColorAt(i, colour);


        // transformation matrix --------------

        let pos;
        do {
          pos = randPos();
          // new pos if particle is directly above egg, as this would cause visual glitches
        } while (Math.pow(pos.x, 2) + Math.pow(pos.y, 2) < 2);

        // random initial rotation
        const r_x = THREE.Math.randFloatSpread(Math.PI);
        const r_y = THREE.Math.randFloatSpread(Math.PI);
        const r_z = THREE.Math.randFloatSpread(Math.PI);
        const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(r_x, r_y, r_z));

        const matrix = new THREE.Matrix4().compose(pos, rot, this.scale);

        this.particleMesh.setMatrixAt(i, matrix);

        // random axis to rotate around -------
        this.rotationAxes[i] = new THREE.Vector3().random().normalize();
        // random velocity
        this.velocities[i] = 0.001 + THREE.Math.randFloatSpread(0.0008);
      }
      // #endregion individual properties for particles ==============================

      // update instance colours after initial colour set
      // particleMesh.instanceColor.update();
      // set instance matrix to update every frame, due to movement
      // this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.particleMesh.instanceMatrix.needsUpdate = true;

      this.el.setObject3D("mesh", this.particleMesh);
    }
  });

};

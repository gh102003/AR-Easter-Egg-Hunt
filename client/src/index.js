import * as confettiParticles from "./components/confettiParticles.js";
import * as lightRing from "./components/lightRing.js";
import * as gltfMaterialTweak from "./components/gltfMaterialTweak.js";
import * as eggStatusText from "./components/eggStatusText.js";
import { Game } from "./game.js";
import * as messages from "./messages.js";
import * as overlayText from "./overlayText.js";

window.addEventListener("camera-init", (data) => {
  console.log("camera-init", data);
})

window.addEventListener("camera-error", (error) => {
  console.error("camera-error", error);
})

// init aframe components

AFRAME.registerComponent("registerevents", {
  init: function () {

    // remember whether the marker is currently found, or whether it has been briefly lost
    // - true when on screen or briefly lost
    // - false when not on screen and has been reset
    this.markerExists = false;

    const marker = this.el;

    marker.addEventListener("markerFound", function () {
      // skip if only briefly lost
      if (this.markerExists) {
        return;
      }

      this.markerExists = true;

      const markerId = marker.getAttribute("value");
      let isNewEgg = false;

      if (game) {
        if (!game.eggsFound.includes(markerId)) {
          isNewEgg = true;
        }

        game.findEgg(markerId);
      }

      // events on child markers
      for (const child of marker.children) {
        child.emit("parentMarkerFound", { markerId, isNewEgg }, false);
      }
    });
    marker.addEventListener("markerLost", function () {

      setTimeout(() => {
        // after properly lost, fire events to clean up and reset animations

        this.markerExists = false;
        // console.log("markerLost " + marker.id);
        // events on child markers
        for (const child of marker.children) {
          child.emit("parentMarkerLost", {}, false);
        }

      }, 800);

    });
  }
});


// Game.serverUrl = window.location.protocol + "//" + window.location.hostname + ":8081";
Game.serverUrl = "/api";
let game;

document.addEventListener("DOMContentLoaded", () => {
  confettiParticles.init();
  lightRing.init();
  gltfMaterialTweak.init();
  eggStatusText.init();

  // display messages on screen
  messages.init(Game.serverUrl);

  // overlay text for when an egg is found
  overlayText.init();

  // auto rejoin if username in localstorage
  const savedUsername = localStorage.getItem("easter_egg_hunt_username");
  const savedUuid = localStorage.getItem("easter_egg_hunt_uuid");
  if (savedUsername && savedUuid) {
    game = new Game(savedUsername, savedUuid);
    game.fetchEggsFound().then(() => {
      game.updatePointsDisplay();
      game.joinLocal();
      document.getElementById("welcome-dialog").classList.add("hide");
      document.getElementById("game-hud").classList.remove("hide");
    }).catch(err => {
      if (err.message === "no player with that uuid") {
        alert("Sorry! It looks like we couldn't recover your previous profile. Please enter a new name.");
        localStorage.removeItem("easter_egg_hunt_username");
        localStorage.removeItem("easter_egg_hunt_uuid");
      } else {
        console.error(err.message);
        alert("Oh no! It looks like we couldn't connect you to the game. Please check your internet connection and refresh the page to try again.");
      }
    });
  } else {
    localStorage.removeItem("easter_egg_hunt_username");
    localStorage.removeItem("easter_egg_hunt_uuid");
  }


  document.getElementById("start-form").addEventListener("submit", event => {

    const name = document.getElementById("start-form-name").value;

    game = new Game(name);
    game.joinOnServer()
      .then(() => {
        document.getElementById("welcome-dialog").classList.add("hide");
        document.getElementById("game-hud").classList.remove("hide");

        // save username and uuid to localstorage so can rejoin if page refreshed
        localStorage.setItem("easter_egg_hunt_username", name);
        localStorage.setItem("easter_egg_hunt_uuid", game.uuid);
      })
      .catch(error => {
        if (error.message.includes("name already taken")) {
          alert("Sorry! Someone else has already entered that name. Please try something else.")
        } else {
          alert("Could not join game: " + error);
        }
      });

  });
});

// document.addEventListener('gesturestart', function(e) {
//   e.preventDefault();
// });

// document.addEventListener('gesturechange', function(e) {
//   e.preventDefault();
// });

// document.addEventListener('gestureend', function(e) {
//   e.preventDefault();
// });


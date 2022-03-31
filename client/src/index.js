import * as confettiParticles from "./components/confettiParticles.js";
import * as lightRing from "./components/lightRing.js";
import * as gltfMaterialTweak from "./components/gltfMaterialTweak.js";
import * as eggStatusText from "./components/eggStatusText.js";
import { Game } from "./game.js";
import * as messages from "./messages.js";
import * as overlayText from "./overlayText.js";

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "firebase/auth";

const fbApp = initializeApp({
  apiKey: "AIzaSyC0Tt5PacDFlg6WuxD1BmUtnaAtj4X8dNg",
  authDomain: "ar-egghunt.firebaseapp.com",
  projectId: "ar-egghunt",
  storageBucket: "ar-egghunt.appspot.com",
  messagingSenderId: "926302276339",
  appId: "1:926302276339:web:b60e4a2d13e4b666660586"
});

// auth
const auth = getAuth();
const authProvider = new GoogleAuthProvider();
authProvider.setCustomParameters({
  // prompt: "select_account",
  hd: "thurstoncollege.org"
});

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


Game.serverUrl = "/api";
let game;

document.addEventListener("DOMContentLoaded", () => {
  confettiParticles.init();
  lightRing.init();
  gltfMaterialTweak.init();
  eggStatusText.init();

  // display messages on screen
  messages.init(fbApp);

  // overlay text for when an egg is found
  overlayText.init();

  if (navigator.userAgent) {
    if (navigator.userAgent.includes("SamsungBrowser")) {
      alert("Please open in Google Chrome for a better experience");
    } else if (navigator.userAgent.includes("wv")) {
      if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("Mac")) {
        alert("Please open in Safari for a better experience");
      } else {
        alert("Please open in Google Chrome for a better experience");
      }
    }
  }

  // sign in
  onAuthStateChanged(auth, user => {
    if (user) {
      game = new Game(user, fbApp);
      document.getElementById("user-text").innerHTML = user.displayName;
      document.getElementById("welcome-dialog").classList.add("hide");
      document.getElementById("game-hud").classList.remove("hide");
    } else {
      game = null;
      document.getElementById("welcome-dialog").classList.remove("hide");
      document.getElementById("game-hud").classList.add("hide");
    }
  });
  
  // register form event handler in case not logged in
  document.getElementById("start-form").addEventListener("submit", event => {
    signInWithRedirect(auth, authProvider);
  });
  
  // sign out
  document.getElementById("btn-sign-out").addEventListener("click", event => {
    signOut(auth);
    game = null;
    document.getElementById("welcome-dialog").classList.remove("hide");
    document.getElementById("game-hud").classList.add("hide");
  });
});

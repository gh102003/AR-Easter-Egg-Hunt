import * as overlayText from "./overlayText.js";
import { doc, getFirestore, updateDoc, arrayUnion, onSnapshot, setDoc, getDoc } from "firebase/firestore";

export class Game {

  static serverUrl;

  name;
  uid;
  eggsFound = [];
  dbRef;
  isGameRunning = false;

  constructor(user, fbApp) {
    this.name = user.displayName;
    this.uid = user.uid;

    const db = getFirestore(fbApp);
    this.dbRef = doc(db, "eggsFound", user.uid);

    // subscribe to changes in eggsFound in database and sync with local copy
    onSnapshot(this.dbRef, doc => {
      if (doc.data()) {
        this.eggsFound = doc.data().eggs;
      } else {
        setDoc(this.dbRef, { eggs: [], score: 0, displayName: user.displayName });
      }
      this.updatePointsDisplay();
    });

    this.settingsDbRef = doc(db, "gameSettings", "gameState");
    onSnapshot(this.settingsDbRef, doc => {
      if (doc.data() !== undefined) {
        this.isGameRunning = doc.data().running;
      }
    });
  }

  findEgg(markerId) {

    // skip if already found this egg or not joined properly
    if (this.eggsFound.includes(markerId)) {
      overlayText.show("You've already found this egg");
      overlayText.hide(5000);
      return;
    }

    // check if game is running
    if (!this.isGameRunning) {
      overlayText.show("Game is not running");
      overlayText.hide(5000);
      console.error("Game is not running");
      return;
    }

    console.log(`Egg ${markerId} has been found!`);
    overlayText.show("New Egg Found!");
    overlayText.hide(5000);

    // update database (will update cached client copy if offline, then server copy when back online)
    updateDoc(this.dbRef, {
      eggs: arrayUnion(markerId),
      score: this.eggsFound.length + 1
    }, { merge: true })
      .catch(err => {
        console.error("Error saving egg find on server");
        console.error(err);
      });
  }

  setupUI() {
    const userText = document.getElementById("user-text");
    // style TCC usernames
    const name = this.name;
    if (name[6] === "-") {
      userText.innerHTML = `<span class="username-faded">${name.slice(0, 6)}</span> ${name.slice(7)}`;
    } else {
      userText.innerHTML = name;
    }

    document.getElementById("welcome-dialog").classList.add("hide");
    document.getElementById("game-hud").classList.remove("hide");
  }

  updatePointsDisplay() {
    document.getElementById("points-text").innerHTML = this.eggsFound.length.toString();
  }
}
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

    // update database
    updateDoc(this.dbRef, {
      eggs: arrayUnion(markerId),
      score: this.eggsFound.length + 1
    }, { merge: true })
      .then(() => {
        console.log(`Egg ${markerId} has been found!`);
        overlayText.show("New Egg Found!");
        overlayText.hide(5000);

        this.updatePointsDisplay();
      })
      .catch(err => {
        // alert("Could not save egg find on server");
        overlayText.show("Error! Please check your internet connection and refresh if the problem persists");
        overlayText.hide(5000);
        console.error("Error saving egg find on server");
        console.error(err);
      });
  }

  updatePointsDisplay() {
    document.getElementById("points-text").innerHTML = this.eggsFound.length.toString();
  }
}
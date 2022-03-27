import { v4 as uuidv4 } from "uuid";
import * as overlayText from "./overlayText.js";

export class Game {

  static serverUrl;

  name;
  joinedGame = false;
  eggsFound = [];

  // controlled by server, updated on responses
  points = 0;

  constructor(name, uuid) {
    this.name = name;
    this.uuid = uuid || uuidv4();
  }

  joinOnServer() {
    return fetch(Game.serverUrl + "/new-player",
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          name: this.name,
          uuid: this.uuid
        })
      })
      .then(res =>
        res.json().then(data => {
          if (res.ok) {
            console.log("Successfully joined game on server");
            this.joinLocal();
          } else {
            throw new Error(data.message);
          }
        })
      );
  }

  joinLocal() {
    /**
     * Sets up client to be logged in
     */
    this.joinedGame = true;
    document.getElementById("user-text").innerHTML = this.name;
  }

  findEgg(markerId) {

    // skip if already found this egg or not joined properly
    if (this.eggsFound.includes(markerId) || !this.joinedGame) {
      overlayText.show("You've already found this egg");
      overlayText.hide(5000);
      return;
    }

    // tell server 
    fetch(Game.serverUrl + "/egg-found",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eggId: markerId,
          uuid: this.uuid
        })
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 403) {
            overlayText.show("Game is not running");
            overlayText.hide(5000);
            throw new Error("Game is not running");
          } else {
            overlayText.show("Error! Please check your internet connection and refresh if the problem persists");
            overlayText.hide(5000);
            throw new Error("Error saving egg find on server");
          }
        } else return res.json();
      })
      .then(res => {

        // update locally
        this.eggsFound.push(markerId);
        console.log(`Egg ${markerId} has been found!`);
        overlayText.show("New Egg Found!");
        overlayText.hide(5000);

        this.points = res.points;
        this.updatePointsDisplay();
      })
      .catch(err => {
        // alert("Could not save egg find on server");
        console.error(err);
      });
  }

  fetchEggsFound() {
    return fetch(Game.serverUrl + "/eggs-found?uuid=" + this.uuid)
      .then(res => Promise.all([res, res.json()]))
      .then(([res, data]) => {
        if (!res.ok) {
            throw new Error(data.message);
        } else {
          this.points = data.score;
          this.eggsFound = data.eggsFound;
        };
      })
  }

  updatePointsDisplay() {
    document.getElementById("points-text").innerHTML = this.points.toString();
  }
}
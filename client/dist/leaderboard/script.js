import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, limit, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const fbApp = initializeApp({
    apiKey: "AIzaSyC0Tt5PacDFlg6WuxD1BmUtnaAtj4X8dNg",
    authDomain: "ar-egghunt.firebaseapp.com",
    projectId: "ar-egghunt",
    storageBucket: "ar-egghunt.appspot.com",
    messagingSenderId: "926302276339",
    appId: "1:926302276339:web:7537ce173a3e8462660586"
});
const db = getFirestore(fbApp);

function updatePointsList(players) {
    const ordered = players.sort((a, b) => b.score - a.score);

    const pointsList = document.getElementById("points-list");
    pointsList.innerHTML = "";

    for (let player of ordered) {
        const wrapper = document.createElement("div");
        wrapper.className = "points-row";

        
        const spanUsername = document.createElement("span");
        spanUsername.className = "username";
        spanUsername.title = player.id;
        // style TCC usernames
        if (player.name[6] === "-") {
            spanUsername.innerHTML = `<span class="username-faded">${player.name.slice(0, 6)}</span> ${player.name.slice(7)}`;
        } else {
            spanUsername.innerHTML = player.name;
        }
        wrapper.appendChild(spanUsername);

        const spanScore = document.createElement("span");
        spanScore.className = "score";
        spanScore.innerHTML = player.score;
        wrapper.appendChild(spanScore);

        pointsList.appendChild(wrapper);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const colRef = collection(db, "eggsFound");
    onSnapshot(query(colRef, orderBy("score", "desc"), limit(30)), snapshot => {
        const players = [];
        snapshot.forEach(doc => {
            const id = doc.id;
            const data = doc.data();
            players.push({ id, score: data.eggs.length, name: data.displayName });
        });
        updatePointsList(players);
    });
});
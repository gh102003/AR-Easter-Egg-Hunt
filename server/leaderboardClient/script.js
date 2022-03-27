function updatePointsList(players) {
    const ordered = players.sort((a, b) => b.score - a.score);

    const pointsList = document.getElementById("points-list");
    pointsList.innerHTML = "";

    for (let player of ordered) {
        const wrapper = document.createElement("div");
        wrapper.className = "points-row";

        const spanUsername = document.createElement("span");
        spanUsername.className = "username";
        spanUsername.innerHTML = player.name;
        spanUsername.title= player.uuid;
        wrapper.appendChild(spanUsername);

        const spanScore = document.createElement("span");
        spanScore.className = "score";
        spanScore.innerHTML = player.score;
        wrapper.appendChild(spanScore);

        pointsList.appendChild(wrapper);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // update leaderboard every 5 seconds
    setInterval(() => {
        console.log("Updating leaderboard...");

        fetch("/players")
            .then(res => res.json())
            .then(res => {
                if (res.players) {
                    updatePointsList(res.players);
                    console.log("Updated leaderboard!");
                }
            });

    }, 5 * 1000);
});

// instructions for admin
console.log("%cTo set game running or not, type this:", "font-weight:bold");
console.log(`let r = fetch("/game-settings", {
    method:"PUT",
    headers:{"content-type": "application/json"},
    body:JSON.stringify({running: true})
});`);

console.log("%cTo update messages, type this:", "font-weight:bold");
console.log(`let r = fetch("/messages", {
    method:"PUT",
    headers:{"content-type": "application/json"},
    body:JSON.stringify({messages:[{text:"starting now", expiryTime: Date.now() + 1000000}]})
});`);
console.log("%cOr this:", "font-weight:bold");
console.log(`let r = fetch("/messages", {
    method:"PUT",
    headers:{"content-type": "application/json"},
    body:JSON.stringify({messages:[{text:"starting now", expiryTime: new Date("2022-03-19T12:05:05+0100")}]})
});`);
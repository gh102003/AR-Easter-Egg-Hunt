import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";

let clientMessages = [];

let messages, messageContainerEl;

export const init = fbApp => {

    // message container in DOM
    messageContainerEl = document.createElement("div");
    messageContainerEl.className = "messages";
    document.body.appendChild(messageContainerEl);

    // snapshot listener in Firestore
    const db = getFirestore();
    const colRef = collection(db, "messages");
    onSnapshot(query(colRef, where("expiryTime", ">", new Date())), snapshot => {
        const fetchedMessages = [];
        snapshot.forEach(doc => {
            const { expiryTime, text } = doc.data();
            fetchedMessages.push({ expiryTime: expiryTime.toDate(), text });
        });
        messages = fetchedMessages;
        updateDOM();
    });

    // update dom on a timer in case a message expires
    setInterval(updateDOM, 5000);



    // add a client message if offline
    window.addEventListener("offline", () => {
        console.log("You are offline");
        clientMessages.push({ text: `\u26a0 <span style="font-weight:bold">No internet connection.</span>\nYou can continue to find eggs, but the leaderboard won't be updated until you go back online. Keep AR Easter Egg Hunt open to prevent your eggs being lost.` });
    });
    window.addEventListener("online", () => {
        console.log("Back online");
        clientMessages.pop();
    });
};

const updateDOM = () => {

    // clear
    messageContainerEl.innerHTML = "";

    const now = new Date();

    if (!messages) {
        return;
    }

    // client messages (e.g. 'you are offline')
    for (let message of clientMessages) {
        const wrapper = document.createElement("div");

        wrapper.className = "message client-message";
        wrapper.innerHTML = message.text;

        messageContainerEl.appendChild(wrapper);
    }

    for (let message of messages.filter(m => m.expiryTime > now)) {
        const wrapper = document.createElement("div");

        wrapper.className = "message";
        wrapper.innerHTML = message.text;

        messageContainerEl.appendChild(wrapper);
    }
};
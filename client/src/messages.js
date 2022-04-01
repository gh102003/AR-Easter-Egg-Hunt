import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";

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
};

const updateDOM = () => {

    // clear
    messageContainerEl.innerHTML = "";

    const now = new Date();

    if (!messages) {
        return;
    }

    for (let message of messages.filter(m => m.expiryTime > now)) {
        const wrapper = document.createElement("div");

        wrapper.className = "message";
        wrapper.innerHTML = message.text;

        messageContainerEl.appendChild(wrapper);
    }
};
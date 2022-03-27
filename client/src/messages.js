let messages, messageContainerEl;

export const init = serverUrl => {

    // message container in DOM
    messageContainerEl = document.createElement("div");
    messageContainerEl.className = "messages";
    document.body.appendChild(messageContainerEl);

    // fetch from server every 30s
    setInterval(() => fetchFromServer(serverUrl), 30 * 1000);

    // fetch on page load
    fetchFromServer(serverUrl);
};

const fetchFromServer = serverUrl => {
    fetch(serverUrl + "/messages")
        .then(res => res.json())
        .then(res => {
            messages = res.messages;
            // console.log(messages);
            updateDOM();
        });
};

const updateDOM = () => {

    // clear
    messageContainerEl.innerHTML = "";

    const now = new Date();

    for (let message of messages.filter(m => new Date(m.expiryTime) >= now)) {
        const wrapper = document.createElement("div");

        wrapper.className = "message";
        wrapper.innerHTML = message.text;

        messageContainerEl.appendChild(wrapper);
    }
};
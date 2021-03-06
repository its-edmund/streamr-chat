let address = "";
const time = new Date().getTime();

const client = new StreamrClient({
  auth: {
    ethereum: window.ethereum,
  },
});

document.getElementById("message").addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("submitMessage").click();
  }
});

var client2 = {};

if (localStorage.getItem("privateKey") === null) {
  let stream;

  let user = StreamrClient.generateEthereumAccount();

  const getStream = async () => {
    stream = await client.getStream(
      "0x13327af521d2042f8bd603ee19a4f3a93daa790d/streamr-chat-messages"
    );

    if (stream.hasPermission("stream_publish", user.address) === null) {
      stream.grantPermission("stream_publish", user.address);
    }
    if (stream.hasPermission("stream_subscribe", user.address) === null) {
      stream.grantPermission("stream_subscribe", user.address);
    }
  };

  getStream();
  client2 = new StreamrClient({
    auth: {
      privateKey: user.privateKey,
    },
  });

  localStorage.setItem("privateKey", user.privateKey);
  localStorage.setItem("address", user.address);
  address = user.address;
} else {
  client2 = new StreamrClient({
    auth: {
      privateKey: localStorage.getItem("privateKey"),
    },
  });
  address = localStorage.getItem("address");
}

document
  .getElementById("welcome")
  .append(
    document.createTextNode(
      `welcome, ${address || "your account isn't connected"}.`
    )
  );

const handleSend = async () => {
  if (document.getElementById("message").value === "") {
    return;
  }

  await client2.publish(
    "0x13327af521d2042f8bd603ee19a4f3a93daa790d/streamr-chat-messages",
    {
      message: document.getElementById("message").value,
      sender: address,
    }
  );

  generateMessage(
    document.getElementById("message").value,
    new Date().getTime(),
    "sent"
  );
  document.getElementById("message").value = "";
};

client2.subscribe(
  {
    stream: "0x13327af521d2042f8bd603ee19a4f3a93daa790d/streamr-chat-messages",
    resend: {
      last: 20,
    },
  },
  (message, metadata) => {
    console.log(metadata);
    if (message.sender === address) {
      if (time > metadata.messageId.timestamp) {
        generateMessage(message.message, metadata.messageId.timestamp, "sent");
      }
      return;
    }

    generateMessage(message.message, metadata.messageId.timestamp, "received");
  }
);

const generateMessage = (message, time, type) => {
  const messageWrapper = document.createElement("div");
  const messageBubble = document.createElement("div");
  const words = document.createElement("p");
  const timestamp = document.createElement("h4");

  const dotw = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  let unix_timestamp = time;
  var date = new Date(unix_timestamp);
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();
  let day = date.getDay();

  var formattedTime =
    dotw[day] +
    " " +
    hours +
    ":" +
    minutes.substr(-2) +
    ":" +
    seconds.substr(-2);

  const node = document.createTextNode(message);

  timestamp.append(formattedTime);
  timestamp.classList.add("timestamp");
  messageBubble.classList.add(`${type}`);
  messageWrapper.classList.add(`wrapper-${type}`);
  words.append(node);
  messageBubble.appendChild(words);
  messageWrapper.appendChild(timestamp);
  messageWrapper.appendChild(messageBubble);
  document.getElementById("messages").appendChild(messageWrapper);
  document.getElementById("message").value = "";
};

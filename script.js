var stack = [];

let token = document.getElementById("token");
let container = document.getElementById("container");
let header = document.getElementById("header");
let payload = document.getElementById("payload");

let copyButton = document.getElementById("copy");
let copyPayloadButton = document.getElementById("copy_payload");
let copyHeaderButton = document.getElementById("copy_header");
let clearButton = document.getElementById("clear");
let decodeButton = document.getElementById("decode");

function get_data() {
  // Use default value color = 'red' and likesColor = true.
  console.info("loading from storage");
  chrome.storage.sync.get(
    {
      stack: "data",
    },
    function (items) {
      if (Array.isArray(items.stack)) {
        token.value = items.stack[0].token;
        header.textContent = items.stack[0].result.header;
        payload.textContent = items.stack[0].result.payload;
        toggleButtons();
        console.log("got data");
      }
    }
  );
}

function storeToken(stack) {
  chrome.storage.sync.set(
    {
      stack: stack,
    },
    function () {
      console.info("storing");
    }
  );
}

function decodeJWT() {
  stack.push({
    token: token.value,
    result: {
      header: (header.textContent = JSON.stringify(
        parseJwt(token.value, 0),
        null,
        2
      )),
      payload: (payload.textContent = JSON.stringify(
        parseJwt(token.value, 1),
        null,
        2
      )),
    },
  });

  storeToken(stack);
  toggleButtons();
}

function toggleButtons() {
  let payloadDisplay = payload.textContent.length > 0 ? "block" : "none";
  let headerDisplay = header.textContent.length > 0 ? "block" : "none";

  copyButton.style.display =
    payloadDisplay === "block" || headerDisplay === "block" ? "block" : "none";
  clearButton.style.display =
    payloadDisplay === "block" || headerDisplay === "block" ? "block" : "none";
  container.style.display =
    payloadDisplay === "block" || headerDisplay === "block" ? "block" : "none";
}

function parseJwt(token, part) {
  var body = token.split(".")[part].replace(/-/g, "+").replace(/_/g, "/");
  var payload = decode(body);
  return JSON.parse(payload);
}

function decode(data) {
  return decodeURIComponent(
    window
      .atob(data)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

function copyAll() {
  navigator.clipboard.writeText(
    header.textContent + "\n" + payload.textContent
  );
  copyButton.textContent = "Copied!";
  setTimeout(function () {
    copyButton.textContent = "Copy All";
  }, 750);
}

function copyHeader() {
  navigator.clipboard.writeText(header.textContent);
  copyHeaderButton.textContent = "Copied!";
  setTimeout(function () {
    copyHeaderButton.textContent = "Copy";
  }, 750);
}

function copyPayload() {
  navigator.clipboard.writeText(payload.textContent);
  copyPayloadButton.textContent = "Copied!";
  setTimeout(function () {
    copyPayloadButton.textContent = "Copy";
  }, 750);
}

function options() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
}

function clear() {
  header.textContent = "";
  payload.textContent = "";
  token.value = "";
  chrome.storage.sync.clear();
  toggleButtons();
}

//hide buttons until we have data
copyButton.style.display = "none";
clearButton.style.display = "none";

copyButton.addEventListener("click", copyAll);
copyPayloadButton.addEventListener("click", copyPayload);
copyHeaderButton.addEventListener("click", copyHeader);
decodeButton.addEventListener("click", decodeJWT);
clearButton.addEventListener("click", clear);

document.addEventListener("DOMContentLoaded", get_data);

toggleButtons();

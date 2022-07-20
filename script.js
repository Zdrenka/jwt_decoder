var stack = [];

let token = document.getElementById("token");
let decoded = document.getElementById("decoded");

let copyButton = document.getElementById("copy");
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
        decoded.textContent = items.stack[0].result;
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
    result: (decoded.textContent = JSON.stringify(
      parseJwt(token.value),
      null,
      2
    )),
  });
  storeToken(stack);
  toggleButtons();
}

function toggleButtons() {
  let display = decoded.textContent.length > 0 ? "block" : "none";
  copyButton.style.display = display;
  clearButton.style.display = display;
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function copyText() {
  navigator.clipboard.writeText(decoded.textContent);

  copyButton.textContent = "Copied!";
  setTimeout(function () {
    copyButton.textContent = "Copy";
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
  decoded.textContent = "";
  token.value = "";
  chrome.storage.sync.clear();
  toggleButtons();
}

//hide buttons until we have data
copyButton.style.display = "none";
clearButton.style.display = "none";

copyButton.addEventListener("click", copyText);
decodeButton.addEventListener("click", decodeJWT);
clearButton.addEventListener("click", clear);

document.addEventListener("DOMContentLoaded", get_data);

toggleButtons();

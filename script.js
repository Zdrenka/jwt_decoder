const stack = [];

const token = document.getElementById("token");
const container = document.getElementById("container");
const header = document.getElementById("header");
const payload = document.getElementById("payload");

const copyButton = document.getElementById("copy");
const copyPayloadButton = document.getElementById("copy_payload");
const copyHeaderButton = document.getElementById("copy_header");
const clearButton = document.getElementById("clear");
const decodeButton = document.getElementById("decode");
const toggleThemeButton = document.getElementById("toggle-theme");

const dark = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="svg-icon bi bi-lightbulb" viewBox="0 0 16 16">
  <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1/>"
</svg>`

const light = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="svg-icon bi bi-lightbulb" viewBox="0 0 16 16">
  <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5"
    fill="yellow" stroke="#dee2e6" stroke-width="0.4"/>
</svg>`

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

    chrome.storage.sync.get('theme', (data) => {
    if (data.theme) {
      document.body.classList.add(data.theme);
      updateSVG(data.theme);
    }
  });

  // Toggle theme
  toggleThemeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const theme = document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";
    
    // Save theme to storage
    chrome.storage.sync.set({ theme });
    updateSVG(theme);
  });
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

function updateSVG(theme) {
  if (theme === "dark-mode") {
    toggleThemeButton.innerHTML = dark;
  } else {
    toggleThemeButton.innerHTML = light;
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
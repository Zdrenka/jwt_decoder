async function decode() {
  var token = document.getElementById("token").value;
  var decoded = parseJwt(token);
  document.getElementById("decoded").textContent = JSON.stringify(
    decoded,
    null,
    2
  );
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

document.getElementById("go").addEventListener("click", decode);

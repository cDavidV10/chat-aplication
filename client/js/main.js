import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";

const socket = io();

const $form = document.getElementById("form");
const $input = document.getElementById("input");
const $messages = document.querySelector(".chat-container");
const $userActive = document.getElementById("userActive");
const $btnLogout = document.getElementById("btnLogout");

let userSave;
userSession();

$form.addEventListener("submit", (e) => {
  e.preventDefault();

  if ($input.value) {
    socket.emit("messages", $input.value, userSave);
    $input.value = "";
  }
});

socket.on("messages", (mgs, userSave) => {
  const item = `<li>${mgs}<small>${userSave}</small></li>
    
  `;
  $messages.insertAdjacentHTML("beforeend", item);

  $messages.scrollTop = $messages.scrollHeight;
});

async function userSession() {
  const response = await fetch("/user-session");

  const result = await response.json();

  if (response.ok) {
    userSave = result.username;
    $userActive.textContent = userSave;
  }
}

$btnLogout.addEventListener("click", async () => {
  console.log("entro");
  const response = await fetch("/logout");

  const result = await response.json();

  if (response.ok) {
    window.location.href = result.url;
    return;
  }
});

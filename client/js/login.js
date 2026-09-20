const $container = document.querySelector(".login-container");
const $btnIniciar = document.getElementById("btnIniciar");
const $btnCrear = document.getElementById("btnCrear");
const $formRegistro = document.getElementById("sing-in");
const $formCrear = document.getElementById("sing-up");
const $messageError = document.querySelectorAll(".message-error");

$btnCrear.addEventListener("click", () => {
  $container.classList.toggle("toggle");
  $formCrear.reset();
});

$btnIniciar.addEventListener("click", () => {
  $container.classList.toggle("toggle");
  $formRegistro.reset();
});

$formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData($formRegistro);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch("/sing-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = result.url;
      return;
    }

    $messageError[0].classList.add("active");

    cleanMessages($messageError[0]);
  } catch (error) {
    console.error(error);
  }
});

$formCrear.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData($formCrear);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch("/sing-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      changesMessages($messageError[1], "Usuario creado con exito");
      $messageError[1].classList.add("succes");
      return;
    }

    if (result.status) {
      changesMessages($messageError[1], "El Usuario ya existe");

      return;
    }

    if (result.messages == "vacio") {
      changesMessages($messageError[1], "Campos Vacios");
      return;
    }

    if (result.messages == "password") {
      changesMessages($messageError[1], "La contraseña no coincide");
      return;
    }
  } catch (error) {
    console.error(error);
  }
});

function cleanMessages(messages) {
  setTimeout(() => {
    messages.classList.remove("active");
  }, 3000);
}

function changesMessages(container, content) {
  container.textContent = content;
  container.classList.add("active");
  container.classList.remove("succes");

  cleanMessages(container);
}

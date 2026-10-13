// ===== Configuración =====
const API_URL = "http://localhost:3000/posts";
// Para probar con la API pública del enunciado, usa esta línea en su lugar:
// const API_URL = "https://jsonplaceholder.typicode.com/posts";

// ===== Referencias al DOM (se obtienen una sola vez) =====
const formulario = document.getElementById("formulario-publicacion");
const inputTitulo = document.getElementById("titulo");
const inputContenido = document.getElementById("contenido");
const botonPublicar = document.getElementById("btn-publicar");
const areaMensaje = document.getElementById("mensaje");
const seccionResultado = document.getElementById("resultado");
const resultadoId = document.getElementById("resultado-id");
const resultadoTitulo = document.getElementById("resultado-titulo");
const resultadoContenido = document.getElementById("resultado-contenido");
const resultadoEnlace = document.getElementById("resultado-enlace");

let enviando = false; // evita envíos repetidos

// ===== Funciones de interfaz =====
function mostrarMensaje(texto, tipo) {
  areaMensaje.textContent = texto; // textContent: seguro frente a inyección HTML
  areaMensaje.className = "mensaje " + tipo;
}

function mostrarResultado(publicacion) {
  resultadoId.textContent = publicacion.id;
  resultadoTitulo.textContent = publicacion.title;
  resultadoContenido.textContent = publicacion.body;

  // Enlace al registro creado: http://localhost:3000/posts/ID
  const urlRegistro = API_URL + "/" + publicacion.id;
  resultadoEnlace.href = urlRegistro;
  resultadoEnlace.textContent = urlRegistro;

  seccionResultado.hidden = false;
}

function ocultarResultado() {
  seccionResultado.hidden = true;
}

function establecerEstadoCarga(cargando) {
  enviando = cargando;
  botonPublicar.disabled = cargando;
  botonPublicar.textContent = cargando ? "Publicando..." : "Publicar";
}

// ===== Validación =====
function validarDatos(titulo, contenido) {
  if (titulo === "" && contenido === "") {
    return "El título y el contenido son obligatorios.";
  }
  if (titulo === "") {
    return "El título no puede estar vacío ni contener solo espacios.";
  }
  if (contenido === "") {
    return "El contenido no puede estar vacío ni contener solo espacios.";
  }
  return null;
}

// ===== Petición HTTP =====
async function enviarPublicacion(publicacion) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(publicacion),
  });

  // fetch NO rechaza la promesa ante 404/500: hay que comprobar response.ok
  if (!response.ok) {
    const error = new Error("Respuesta HTTP no satisfactoria");
    error.estado = response.status;
    throw error;
  }

  return await response.json();
}

// ===== Mensajes de error según la causa =====
function obtenerMensajeError(error) {
  if (error.estado) {
    return "Error del servidor (HTTP " + error.estado + "). Inténtalo nuevamente.";
  }
  if (error instanceof SyntaxError) {
    return "La respuesta del servidor no tiene un formato JSON válido.";
  }
  if (error instanceof TypeError) {
    return "No se pudo conectar con el servidor. Revisa tu conexión a internet.";
  }
  return "Ocurrió un error inesperado. Inténtalo nuevamente.";
}

// ===== Evento principal =====
async function manejarEnvio(event) {
  event.preventDefault(); // evita la recarga de la página

  if (enviando) return; // evita envíos duplicados

  const titulo = inputTitulo.value.trim();
  const contenido = inputContenido.value.trim();

  ocultarResultado();

  const errorValidacion = validarDatos(titulo, contenido);
  if (errorValidacion) {
    mostrarMensaje(errorValidacion, "error");
    return; // no se realiza la petición
  }

  const publicacion = {
    title: titulo,
    body: contenido,
    userId: 1,
  };

  establecerEstadoCarga(true);
  mostrarMensaje("Enviando publicación...", "cargando");

  try {
    const respuesta = await enviarPublicacion(publicacion);
    mostrarMensaje("Publicación enviada correctamente.", "exito");
    mostrarResultado(respuesta);
    formulario.reset();
  } catch (error) {
    console.error("Error al publicar:", error);
    mostrarMensaje(obtenerMensajeError(error), "error");
  } finally {
    // Se ejecuta siempre: éxito o error
    establecerEstadoCarga(false);
  }
}

formulario.addEventListener("submit", manejarEnvio);

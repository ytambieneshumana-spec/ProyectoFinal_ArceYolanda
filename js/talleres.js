
// talleres.js - gestión de inscripciones, agenda y cupos

const STATE = {
  talleres: [],
  inscripciones: []
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function mostrarToast(m) {
  Toastify({
    text: m,
    duration: 2500,
    gravity: "top",
    position: "right"
  }).showToast();
}

async function cargarTalleres() {
  try {
    const res = await fetch("./js/talleres.json");
    if (!res.ok) throw new Error("No se pudo cargar talleres.json");

    STATE.talleres = await res.json();

    const raw = localStorage.getItem("inscripciones_bonicha_v1");
    STATE.inscripciones = raw ? JSON.parse(raw) : [];

    renderSelect();
    renderTalleresDisponibles();
    renderAgenda();

  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los talleres.", "error");
  }
}

// -------------------- SELECT DE TALLERES --------------------

function renderSelect() {
  const sel = $("#selectTaller");
  sel.innerHTML = "";

  STATE.talleres.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.nombre} (${t.cupos} cupos)`;
    sel.appendChild(opt);
  });

  sel.addEventListener("change", onTallerChange);
  onTallerChange();
}

function onTallerChange() {
  const id = Number($("#selectTaller").value);
  const taller = STATE.talleres.find(t => t.id === id);
  const cont = $("#containerHorarios");

  cont.innerHTML = "";
  if (!taller) return;

  taller.horarios.forEach(h => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn";
    btn.style.marginRight = "6px";
    btn.dataset.hora = h;
    btn.textContent = h;

    btn.addEventListener("click", () => {
      $$("#containerHorarios button")
        .forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      $("#inputHora").value = h;
    });

    cont.appendChild(btn);
  });

  renderTalleresDisponibles();
}

// -------------------- CUPOS --------------------

function renderTalleresDisponibles() {
  STATE.talleres.forEach(t => {
    const inscritos = STATE.inscripciones.filter(i => i.tallerId === t.id).length;
    const restantes = t.cupos - inscritos;

    const opt = Array.from($("#selectTaller").options)
      .find(o => Number(o.value) === t.id);

    if (opt) {
      opt.textContent = `${t.nombre} (${restantes} / ${t.cupos} cupos)`;
    }

    if (restantes <= 0 && Number($("#selectTaller").value) === t.id) {
      mostrarToast("Este taller está completo. Elegí otro.");
    }
  });
}

// -------------------- FORMULARIO --------------------

function validarEmail(e) {
  return /\S+@\S+\.\S+/.test(e);
}

function limpiarFormulario() {
  $("#inputNombre").value = "";
  $("#inputEmail").value = "";
  $("#inputFecha").value = "";
  $("#inputHora").value = "";
  $$("#containerHorarios button")
    .forEach(b => b.classList.remove("selected"));
}

function agregarInscripcion(ev) {
  ev.preventDefault();

  const nombre = $("#inputNombre").value.trim();
  const email = $("#inputEmail").value.trim();
  const tallerId = Number($("#selectTaller").value);
  const fecha = $("#inputFecha").value;
  const hora = $("#inputHora").value;
  const nivel = $("#selectNivel").value;

  if (!nombre || !email || !tallerId || !fecha || !hora) {
    return Swal.fire("Faltan datos", "Completá todos los campos obligatorios.", "warning");
  }

  if (!validarEmail(email)) {
    return Swal.fire("Email inválido", "Ingresá un correo válido.", "warning");
  }

  const taller = STATE.talleres.find(t => t.id === tallerId);
  const inscritos = STATE.inscripciones.filter(i => i.tallerId === tallerId).length;

  if (inscritos >= taller.cupos) {
    return Swal.fire("Cupo completo", "Este taller ya no tiene cupos.", "error");
  }

  const choque = STATE.inscripciones.find(i =>
    i.tallerId === tallerId &&
    i.fecha === fecha &&
    i.hora === hora &&
    i.email === email
  );

  if (choque) {
    return Swal.fire("Ya estás inscripto", "Ya reservaste este taller en ese día y horario.", "info");
  }

  const nueva = {
    id: Date.now(),
    nombre,
    email,
    tallerId,
    tallerNombre: taller.nombre,
    fecha,
    hora,
    nivel
  };

  STATE.inscripciones.push(nueva);
  localStorage.setItem("inscripciones_bonicha_v1", JSON.stringify(STATE.inscripciones));

  renderAgenda();
  renderTalleresDisponibles();
  limpiarFormulario();

  mostrarToast("Inscripción registrada");
  Swal.fire("Listo", "Tu inscripción fue registrada exitosamente.", "success");
}

// -------------------- AGENDA --------------------

function renderAgenda() {
  const tbody = $("#agendaBody");
  tbody.innerHTML = "";

  if (STATE.inscripciones.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="small-muted">No hay inscripciones aún.</td></tr>`;
    return;
  }

  const sorted = STATE.inscripciones
    .slice()
    .sort((a, b) =>
      new Date(a.fecha) - new Date(b.fecha) || a.tallerId - b.tallerId
    );

  sorted.forEach(i => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i.nombre}</td>
      <td>${i.email}</td>
      <td>${i.tallerNombre}</td>
      <td>${i.fecha}</td>
      <td>${i.hora}</td>
      <td>${i.nivel}</td>
      <td>
        <button class="btn eliminar" data-id="${i.id}">Eliminar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  $$("#agendaBody .eliminar").forEach(btn => {
    btn.addEventListener("click", ev => {
      const id = Number(ev.currentTarget.dataset.id);

      Swal.fire({
        title: "Eliminar inscripción?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar"
      }).then(r => {
        if (r.isConfirmed) {
          STATE.inscripciones = STATE.inscripciones.filter(x => x.id !== id);
          localStorage.setItem("inscripciones_bonicha_v1", JSON.stringify(STATE.inscripciones));

          renderAgenda();
          renderTalleresDisponibles();

          mostrarToast("Inscripción eliminada");
          Swal.fire("Eliminado", "La inscripción fue eliminada.", "success");
        }
      });
    });
  });
}

// -------------------- INICIO --------------------

document.addEventListener("DOMContentLoaded", () => {
  $("#formTaller").addEventListener("submit", agregarInscripcion);
  $("#btnLimpiar").addEventListener("click", limpiarFormulario);
  cargarTalleres();
});



// simulador.js - Simulador de Cotización para Proyecto Final
// - Carga productos desde productos.json
// - Renderiza productos por categoría
// - Permite agregar al carrito, calcular total, aplicar descuento, guardar cotización en localStorage
// - Usa SweetAlert2 para confirmaciones y Toastify para notificaciones

class Producto {
  constructor({id,categoria,nombre,precio,stock}) {
    this.id = id;
    this.categoria = categoria;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock || 0;
  }
}

class Carrito {
  constructor() {
    // items: { producto: Producto, cantidad: number }
    this.items = [];
  }
  agregar(producto, cantidad = 1) {
    const existente = this.items.find(i => i.producto.id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.items.push({producto, cantidad});
    }
  }
  quitar(productoId) {
    this.items = this.items.filter(i => i.producto.id !== productoId);
  }
  actualizarCantidad(productoId, cantidad) {
    const it = this.items.find(i => i.producto.id === productoId);
    if (it) it.cantidad = cantidad;
    this.items = this.items.filter(i => i.cantidad > 0);
  }
  subtotal() {
    return this.items.reduce((acc, it) => acc + it.producto.precio * it.cantidad, 0);
  }
  aplicarDescuento(porcentaje) {
    const sub = this.subtotal();
    const descuento = Math.max(0, Math.min(100, porcentaje));
    return sub * (1 - descuento/100);
  }
  vaciar() {
    this.items = [];
  }
  toJSON() {
    return {
      items: this.items.map(i => ({id: i.producto.id, nombre: i.producto.nombre, precio: i.producto.precio, cantidad: i.cantidad}))
    };
  }
}

const estado = {
  productos: [],
  carrito: new Carrito()
};

function mostrarToast(mensaje, dur = 2500) {
  Toastify({
    text: mensaje,
    duration: dur,
    gravity: "top",
    position: "right",
  }).showToast();
}

async function cargarProductos() {
  try {
    const res = await fetch("js/productos.json");
    if (!res.ok) throw new Error("No se pudo cargar productos.json");
    const data = await res.json();
    estado.productos = data.map(p => new Producto(p));
    poblarCategorias();
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los productos.", "error");
  }
}

function categoriasUnicas() {
  const cats = [...new Set(estado.productos.map(p => p.categoria))];
  return cats;
}

function poblarCategorias() {
  const sel = document.getElementById("categoriaSelect");
  sel.innerHTML = "";
  const cats = categoriasUnicas();
  const optAll = document.createElement("option");
  optAll.value = "todas";
  optAll.textContent = "Todas";
  sel.appendChild(optAll);
  cats.forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c[0].toUpperCase() + c.slice(1);
    sel.appendChild(o);
  });
  sel.addEventListener("change", () => renderProductos(sel.value));
  // render inicial
  renderProductos("todas");
}

function renderProductos(categoria = "todas") {
  const cont = document.getElementById("productosContainer");
  cont.innerHTML = "";
  const list = categoria === "todas" ? estado.productos : estado.productos.filter(p => p.categoria === categoria);
  if (list.length === 0) {
    cont.innerHTML = "<p>No hay productos en esta categoría.</p>";
    return;
  }
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "prod-card";
    card.innerHTML = `
      <div class="prod-nombre">${p.nombre}</div>
      <div>Precio: $${p.precio.toLocaleString()}</div>
      <div>Stock: ${p.stock}</div>
      <div style="margin-top:8px;">
        <input type="number" min="1" max="${p.stock}" value="1" data-id="${p.id}" style="width:70px" />
        <button data-id="${p.id}" class="btnAgregar">Agregar</button>
      </div>
    `;
    cont.appendChild(card);
  });
  // listeners
  cont.querySelectorAll(".btnAgregar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = Number(btn.getAttribute("data-id"));
      const input = cont.querySelector(`input[data-id="${id}"]`);
      const cantidad = Math.max(1, Number(input.value || 1));
      const producto = estado.productos.find(x => x.id === id);
      if (!producto) return mostrarToast("Producto no encontrado");
      if (cantidad > producto.stock) return mostrarToast("Cantidad mayor al stock disponible");
      estado.carrito.agregar(producto, cantidad);
      mostrarToast("Producto agregado al carrito");
      renderCarrito();
    });
  });
}

function renderCarrito() {
  const cont = document.getElementById("carritoContainer");
  cont.innerHTML = "";
  if (estado.carrito.items.length === 0) {
    cont.innerHTML = "<p>El carrito está vacío.</p>";
    document.getElementById("resultado").textContent = "";
    return;
  }
  const table = document.createElement("div");
  table.className = "carrito-table";
  estado.carrito.items.forEach(it => {
    const row = document.createElement("div");
    row.className = "carrito-row";
    row.innerHTML = `
      <div style="flex:1">${it.producto.nombre}</div>
      <div style="width:90px;">
        <input type="number" min="1" value="${it.cantidad}" data-id="${it.producto.id}" style="width:60px"/>
      </div>
      <div style="width:120px;">$${(it.producto.precio * it.cantidad).toLocaleString()}</div>
      <div style="width:32px;"><button data-id="${it.producto.id}" class="btnQuitar">x</button></div>
    `;
    table.appendChild(row);
  });
  cont.appendChild(table);

  // listeners for qty change and remove
  cont.querySelectorAll("input[type='number']").forEach(inp => {
    inp.addEventListener("change", (e) => {
      const id = Number(inp.getAttribute("data-id"));
      const cantidad = Math.max(1, Number(inp.value || 1));
      estado.carrito.actualizarCantidad(id, cantidad);
      renderCarrito();
    });
  });
  cont.querySelectorAll(".btnQuitar").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      estado.carrito.quitar(id);
      renderCarrito();
      mostrarToast("Producto eliminado");
    });
  });
}

function calcularYMostrar() {
  const descuento = Number(document.getElementById("inputDescuento").value || 0);
  const total = estado.carrito.aplicarDescuento(descuento);
  const subtotal = estado.carrito.subtotal();
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `Subtotal: $${subtotal.toLocaleString()}<br/>Total (aplicando ${descuento}%): $${Math.round(total).toLocaleString()}`;
}

function guardarCotizacion() {
  if (estado.carrito.items.length === 0) {
    return Swal.fire("Atención", "El carrito está vacío. Agregá productos antes de guardar.", "warning");
  }
  const descuento = Number(document.getElementById("inputDescuento").value || 0);
  const total = Math.round(estado.carrito.aplicarDescuento(descuento));
  const cot = {
    fecha: new Date().toISOString(),
    carrito: estado.carrito.toJSON(),
    descuento,
    total
  };
  // Save in localStorage array 'cotizaciones'
  const key = "cotizaciones_bonicha_v1";
  const prev = JSON.parse(localStorage.getItem(key) || "[]");
  prev.unshift(cot);
  localStorage.setItem(key, JSON.stringify(prev));
  Swal.fire("Guardado", "Cotización guardada en el navegador.", "success");
  mostrarToast("Cotización guardada");
}

function inicializarUI() {
  document.getElementById("btnCotizar").addEventListener("click", (e) => {
    calcularYMostrar();
    Swal.fire("Cotización", "Se calculó la cotización correctamente.", "info");
  });
  document.getElementById("btnGuardar").addEventListener("click", (e) => {
    Swal.fire({
      title: '¿Guardar cotización?',
      text: "Se almacenará en el navegador (localStorage).",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        guardarCotizacion();
      }
    });
  });
  // allow pressing Enter on discount to calculate
  document.getElementById("inputDescuento").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      calcularYMostrar();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  inicializarUI();
  renderCarrito();
});

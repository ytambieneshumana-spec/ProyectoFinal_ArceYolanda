// carrito.js - Casa Bonicha
// Constructor de productos
function Producto(id, nombre, precio, imagen) {
  this.id = id;
  this.nombre = nombre;
  this.precio = precio;
  this.imagen = imagen;
}

// Catálogo base (puede ampliarse)
const productos = [
  new Producto(1, "Almohadones", 6500, "../assets/img/hogar/hogar1.png"),
  new Producto(2, "Mantas Playa", 9800, "../assets/img/hogar/hogar2.png"),
  new Producto(3, "Vajilla", 7200, "../assets/img/hogar/hogar3.png"),
  new Producto(4, "Kimono", 8900, "../assets/img/indumentaria/imageni1.jpg"),
  new Producto(5, "Pantalón Holgado", 9100, "../assets/img/indumentaria/imageni2.jpg"),
  new Producto(6, "Blusa", 7800, "../assets/img/indumentaria/imageni3.jpg"),
  new Producto(7, "Mesa de Noche", 12000, "../assets/img/muebles/mesita_de_noche.jpg"),
  new Producto(8, "Mecedora", 15000, "../assets/img/muebles/imagen2.jpg"),
  new Producto(9, "Banco", 11000, "../assets/img/muebles/muebles3.jpg"),
  new Producto(10, "Neceser", 4800, "../assets/img/accesorios/accesorios4.png"),
  new Producto(11, "Bolso de Mano", 5600, "../assets/img/accesorios/accesorios5.png"),
  new Producto(12, "Estuche Portátil", 6400, "../assets/img/accesorios/accesorios1.png")
];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Elementos del DOM
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const abrirCarritoBtn = document.getElementById("abrir-carrito");
const cerrarCarritoBtn = document.getElementById("cerrar-carrito");
const panelCarrito = document.getElementById("panel-carrito");
const finalizarCompraBtn = document.getElementById("finalizar-compra");
const mensajeFinal = document.getElementById("mensaje-final");

// Detectar clic en botones "Agregar al carrito"
document.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON" && e.target.textContent.trim() === "Agregar al carrito") {
    const card = e.target.closest(".producto-card");
    const nombre = card.querySelector("h3").textContent;
    const producto = productos.find(p => p.nombre === nombre);

    if (producto) {
      const item = carrito.find(p => p.id === producto.id);
      if (item) {
        item.cantidad++;
      } else {
        carrito.push({ ...producto, cantidad: 1 });
      }
      actualizarCarrito();
      guardarCarrito();
      abrirCarrito();
    }
  }
});

// Calcular total del carrito
function calcularTotal() {
  return carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
}

// Actualizar lista del carrito
function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  carrito.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto-item d-flex justify-content-between align-items-center mb-2";
    div.innerHTML = `
      <div>
        <img src="${prod.imagen}" alt="${prod.nombre}" width="40" class="me-2 rounded">
        ${prod.nombre} x${prod.cantidad}
      </div>
      <span>$${prod.precio * prod.cantidad}</span>
    `;
    listaCarrito.appendChild(div);
  });

  contadorCarrito.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  totalCarrito.textContent = "Total: $" + calcularTotal();
}

// Guardar en localStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Abrir / cerrar panel
function abrirCarrito() { panelCarrito.classList.add("activo"); }
function cerrarCarrito() { panelCarrito.classList.remove("activo"); }

if (abrirCarritoBtn) abrirCarritoBtn.addEventListener("click", abrirCarrito);
if (cerrarCarritoBtn) cerrarCarritoBtn.addEventListener("click", cerrarCarrito);

// Finalizar compra
if (finalizarCompraBtn) {
  finalizarCompraBtn.addEventListener("click", () => {
    const total = calcularTotal();
    if (total > 0) {
      mensajeFinal.textContent = `Gracias por tu compra en Bonicha. Total: $${total}`;

      // Esperar 2 segundos antes de limpiar el carrito
      setTimeout(() => {
        carrito = [];
        actualizarCarrito();
        guardarCarrito();
      }, 2000);
    } else {
      mensajeFinal.textContent = "Tu carrito está vacío.";
    }
  });
}

actualizarCarrito();
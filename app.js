// =========================
//   CARGA DE PRODUCTOS
// =========================

let productos = [];
let carrito = [];

const contenedorProductos = document.getElementById("productosContainer");
const contenedorCarrito = document.getElementById("carritoContainer");
const selectCategorias = document.getElementById("categoriaSelect");
const resultadoTotal = document.getElementById("resultado");

// Cargar JSON externo
async function cargarProductos() {
    try {
        const response = await fetch("js/productos.json");
        if (!response.ok) throw new Error("No se pudo cargar productos.json");

        const data = await response.json();
        productos = data;

        cargarCategorias();
        renderProductos("todas");
    } catch (error) {
        Swal.fire("Error", "No se pudieron cargar los productos.", "error");
        console.error(error);
    }
}

// =========================
//      CATEGORÍAS
// =========================

function cargarCategorias() {
    const categorias = [...new Set(productos.map(p => p.categoria))];

    selectCategorias.innerHTML = `
        <option value="todas">Todas</option>
        ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join("")}
    `;

    selectCategorias.addEventListener("change", () => {
        renderProductos(selectCategorias.value);
    });
}

// =========================
//   RENDER DE PRODUCTOS
// =========================

function renderProductos(categoria) {
    contenedorProductos.innerHTML = "";

    let filtrados =
        categoria === "todas"
            ? productos
            : productos.filter(p => p.categoria === categoria);

    filtrados.forEach(prod => {
        let card = document.createElement("div");
        card.className = "prod-card";

        card.innerHTML = `
            <h4>${prod.nombre}</h4>
            <p>Precio: $${prod.precio}</p>
            <p>Stock: ${prod.stock}</p>

            <input type="number" id="cant-${prod.id}" value="1" min="1" max="${prod.stock}" />
            <button onclick="agregarAlCarrito(${prod.id})">Agregar</button>
        `;

        contenedorProductos.appendChild(card);
    });
}

// =========================
//     CARRITO
// =========================

function agregarAlCarrito(idProducto) {
    const prod = productos.find(p => p.id === idProducto);
    const cantidad = parseInt(document.getElementById(`cant-${idProducto}`).value);

    if (cantidad > prod.stock) {
        return Toastify({ text: "No hay stock suficiente", duration: 2500 }).showToast();
    }

    const item = carrito.find(p => p.id === idProducto);

    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: prod.precio,
            cantidad
        });
    }

    Toastify({ text: "Producto agregado", duration: 2500 }).showToast();

    renderCarrito();
}

function renderCarrito() {
    contenedorCarrito.innerHTML = "";

    carrito.forEach(item => {
        let row = document.createElement("div");
        row.className = "carrito-row";

        row.innerHTML = `
            <span>${item.nombre}</span>
            <span>$${item.precio * item.cantidad}</span>
            <input type="number" value="${item.cantidad}" min="1" 
                onchange="actualizarCantidad(${item.id}, this.value)" />
            <button onclick="eliminarProducto(${item.id})">X</button>
        `;

        contenedorCarrito.appendChild(row);
    });
}

function actualizarCantidad(id, nuevaCantidad) {
    const item = carrito.find(p => p.id === id);
    item.cantidad = parseInt(nuevaCantidad);

    renderCarrito();
}

function eliminarProducto(id) {
    carrito = carrito.filter(p => p.id !== id);

    renderCarrito();
}

// =========================
//   COTIZAR Y GUARDAR
// =========================

document.getElementById("btnCotizar").addEventListener("click", () => {
    if (carrito.length === 0) {
        return Swal.fire("Carrito vacío", "Agrega productos antes de cotizar", "warning");
    }

    const descuento = parseInt(document.getElementById("inputDescuento").value) || 0;

    let subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    let totalFinal = subtotal * (1 - descuento / 100);

    resultadoTotal.innerHTML = `
        Subtotal: $${subtotal}<br>
        Descuento: ${descuento}%<br>
        <strong>Total final: $${Math.round(totalFinal)}</strong>
    `;
});

document.getElementById("btnGuardar").addEventListener("click", () => {

    if (carrito.length === 0) {
        return Swal.fire("Error", "No hay nada para guardar", "warning");
    }

    let guardado = {
        fecha: new Date().toLocaleString(),
        items: carrito,
        total: resultadoTotal.textContent
    };

    localStorage.setItem("ultimaCotizacion", JSON.stringify(guardado));

    Swal.fire("Guardado", "Cotización almacenada en el navegador", "success");
});

// =========================
//    INICIALIZACIÓN
// =========================

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

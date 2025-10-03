// --- Variables y arrays ---
const iva = 0.21; // IVA
let productos = [
  "Almohadones", "Mantas Playa", "Vajilla",         // Hogar
  "Kimono", "Pantalón Holgado", "Blusa",            // Indumentaria
  "Mesa de Noche", "Mecedora", "Banco",             // Muebles
  "Neceser", "Bolso de Mano", "Estuche Portátil"    // Accesorios
];

let precios = [
  5000, 12000, 8000, // Hogar
  30000, 25000, 18000, // Indumentaria
  35000, 60000, 28000, // Muebles
  8000, 15000, 12000 // Accesorios
];

let stock = [
  10, 8, 15, // Hogar
  5, 7, 9, // Indumentaria
  3, 2, 4, // Muebles
  12, 6, 10 // Accesorios
];

// --- Función 1: mostrar lista de productos ---
function mostrarProductos() {
  console.log("Productos disponibles en Casa Bonicha:");
  for (let i = 0; i < productos.length; i++) {
    console.log(`${i + 1}. ${productos[i]} - $${precios[i]} (Stock: ${stock[i]})`);
  }
}

// --- Función 2: seleccionar producto ---
function seleccionarProducto() {
  let lista = "";
  for (let i = 0; i < productos.length; i++) {
    lista += `${i + 1}. ${productos[i]} - $${precios[i]} (Stock: ${stock[i]})\n`;
  }
  let indice = prompt("Ingrese el número del producto que desea comprar:\n" + lista);
  indice = parseInt(indice) - 1;
  if (indice >= 0 && indice < productos.length) {
    return indice;
  } else {
    alert("Opción inválida. Se seleccionará el primero por defecto.");
    return 0;
  }
}

// --- Función 3: calcular total con IVA ---
function calcularTotal(indiceProducto, cantidad) {
  let subtotal = precios[indiceProducto] * cantidad;
  return subtotal * (1 + iva);
}

// --- Flujo del simulador ---
alert("Bienvenida a Casa Bonicha - Simulador de compra");

// acumulador para mostrar el total al final
let totalGeneral = 0;
let carrito = [];

let continuar = true;
while (continuar) {
  mostrarProductos();
  let indice = seleccionarProducto();
  let cantidad = prompt(`¿Cuántas unidades de ${productos[indice]} desea comprar?`);
  cantidad = parseInt(cantidad);

  if (cantidad > 0 && cantidad <= stock[indice]) {
    let total = calcularTotal(indice, cantidad);
    totalGeneral += total;
    stock[indice] -= cantidad; // actualizar stock
    carrito.push(`${cantidad} x ${productos[indice]} = $${total}`);
    alert(`Has agregado ${cantidad} ${productos[indice]}.\nSubtotal con IVA: $${total}`);
    console.log(`Stock restante de ${productos[indice]}: ${stock[indice]}`);
  } else {
    alert("Cantidad inválida o sin stock disponible.");
  }

  // preguntar si quiere seguir comprando
  continuar = confirm("¿Desea continuar comprando?");
}

// mostrar resumen final
let resumen = "Resumen de tu compra:\n";
for (let item of carrito) {
  resumen += item + "\n";
}
resumen += `\nTOTAL GENERAL: $${totalGeneral}`;
alert(resumen);
console.log(resumen);


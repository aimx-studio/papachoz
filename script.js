const WHATSAPP_NUMERO = "573212464514";

  const GOOGLE_FORM_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSceDSSbK3SHxqauxBlmUOwzFNan1qgRXxMUZRiJ8WDN0_dLVw/formResponse";
  const ENTRY_NOMBRE = "entry.2068822855";
  const ENTRY_TELEFONO = "entry.961528619";
  const ENTRY_PEDIDO = "entry.462100422";
  const ENTRY_ENTREGA = "entry.1826902620";
  const ENTRY_DIRECCION_MESA = "entry.14944038";
  const ENTRY_PAGO = "entry.638490607";
  const ENTRY_ESPECIFICACIONES = "entry.764372561";
  const ENTRY_TOTAL = "entry.1720380729";

  function obtenerPedidoTexto(){
    const lineas = [];
    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      const cantidad = item.querySelector(".cantidad")?.value || 0;
      if (Number(cantidad) <= 0) return;

      let linea = "- " + cb.value + " x" + cantidad;
      const saboresContainer = item.querySelector(".sabor-selects");
      if (saboresContainer){
        const sabores = Array.from(saboresContainer.querySelectorAll(".sabor")).map(s => s.value);
        if (sabores.length === 1){
          linea += " (Sabor: " + sabores[0] + ")";
        } else if (sabores.length > 1){
          linea += " (" + sabores.map((s, i) => "Unidad " + (i + 1) + ": " + s).join(", ") + ")";
        }
      }
      lineas.push(linea);
    });
    return lineas.join("\n");
  }

  const SABORES = ["Tradicional", "Rústico", "Picante", "Agridulce", "Argentino", "Tunjano"];

  function crearSaborSelect(valorSeleccionado){
    const select = document.createElement("select");
    select.className = "sabor";
    SABORES.forEach(sabor => {
      const opt = document.createElement("option");
      opt.value = sabor;
      opt.textContent = sabor;
      if (sabor === valorSeleccionado) opt.selected = true;
      select.appendChild(opt);
    });
    return select;
  }

  function actualizarSabores(item){
    if (!item) return;
    const container = item.querySelector(".sabor-selects");
    if (!container) return; // este plato no maneja sabores

    const cantidadInput = item.querySelector(".cantidad");
    const cantidad = Math.max(0, Number(cantidadInput?.value) || 0);

    // Conservar los sabores ya elegidos antes de regenerar los selectores
    const valoresActuales = Array.from(container.querySelectorAll(".sabor")).map(s => s.value);

    container.innerHTML = "";

    for (let i = 0; i < cantidad; i++){
      const fila = document.createElement("div");
      fila.className = "sabor-unidad";

      if (cantidad > 1){
        const etiqueta = document.createElement("span");
        etiqueta.className = "sabor-unidad-label";
        etiqueta.textContent = "Unidad " + (i + 1) + ":";
        fila.appendChild(etiqueta);
      }

      fila.appendChild(crearSaborSelect(valoresActuales[i] || SABORES[0]));
      container.appendChild(fila);
    }
  }

  function toggleMenu(titulo){
    const seccion = titulo.nextElementSibling;
    if (!seccion) return;
    seccion.style.display = seccion.style.display === "block" ? "none" : "block";
    titulo.classList.toggle("is-open", seccion.style.display === "block");
  }

  function toggleCantidad(checkbox){
    const item = checkbox.closest(".item");
    if (!item) return;
    const cantidad = item.querySelector(".cantidad");
    if (!cantidad) return;
    if (checkbox.checked){
      cantidad.disabled = false;
      if (Number(cantidad.value) === 0) cantidad.value = 1;
    } else {
      cantidad.value = 0;
      cantidad.disabled = true;
    }
    calcularTotal();
  }

  function toggleDescripcion(checkbox){
    const item = checkbox.closest(".item");
    if (!item) return;
    const desc = item.querySelector(".descripcion");
    if (!desc) return;
    desc.style.display = checkbox.checked ? "block" : "none";
  }

  function calcularTotal(){
    document.querySelectorAll(".item").forEach(item => actualizarSabores(item));

    let subtotal = 0;
    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      if (!item) return;
      const cantidad = Number(item.querySelector(".cantidad")?.value) || 0;
      if (cantidad <= 0) return;
      const precioSpan = item.querySelector(".item-linea > span:not(.nombre-plato)");
      const precio = precioSpan ? Number(precioSpan.textContent.replace(/[^0-9]/g, "")) : 0;
      subtotal += precio * cantidad;
    });

    // El domicilio se cuadra por WhatsApp: no se suma costo automático.
    // El empaque no aplica costo adicional para este menú.

    document.getElementById("total").innerText = "$" + subtotal.toLocaleString("es-CO");
    document.getElementById("totalPedido").value = subtotal;
  }

  // Mostrar/ocultar campos según tipo de entrega
  document.getElementById("tipoEntrega").addEventListener("change", function(){
    const val = this.value;
    const direccionField = document.getElementById("direccionField");
    const mesaField = document.getElementById("mesaField");
    const costoDom = document.getElementById("costoDomicilio");

    direccionField.style.display = "none";
    mesaField.style.display = "none";
    costoDom.style.display = "none";

    if (val === "A domicilio"){
      direccionField.style.display = "flex";
      costoDom.style.display = "block";
    } else if (val === "Comer dentro del local"){
      mesaField.style.display = "flex";
    }
  });

  // Mostrar/ocultar campos según tipo de pago
  document.getElementById("tipoPago").addEventListener("change", function(){
    const val = this.value;
    const efectivoField = document.getElementById("efectivoField");
    const infoPago = document.getElementById("infoPago");

    efectivoField.style.display = "none";
    infoPago.style.display = "none";

    if (val === "Efectivo"){
      efectivoField.style.display = "flex";
    }
  });

  function armarMensaje(){
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const tipoEntrega = document.getElementById("tipoEntrega").value;
    const direccion = document.getElementById("direccion").value;
    const numeroMesa = document.getElementById("numeroMesa").value;
    const tipoPago = document.getElementById("tipoPago").value;
    const efectivoCliente = document.getElementById("efectivoCliente").value;
    const especificaciones = document.getElementById("especificaciones").value;
    const total = document.getElementById("total").innerText;

    let mensaje = "🌭 *NUEVO PEDIDO - PAPACHOZ*\n\n";
    mensaje += "👤 Nombre: " + nombre + "\n";
    mensaje += "📞 Teléfono: " + telefono + "\n\n";
    mensaje += "🍽️ *Pedido:*\n";

    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      const cantidad = item.querySelector(".cantidad")?.value || 0;
      if (Number(cantidad) <= 0) return;

      mensaje += "• " + cb.value + " x" + cantidad + "\n";

      const saboresContainer = item.querySelector(".sabor-selects");
      if (saboresContainer){
        const sabores = Array.from(saboresContainer.querySelectorAll(".sabor")).map(s => s.value);
        if (sabores.length === 1){
          mensaje += "   - Sabor del chorizo: " + sabores[0] + "\n";
        } else if (sabores.length > 1){
          sabores.forEach((s, i) => {
            mensaje += "   - Unidad " + (i + 1) + ": " + s + "\n";
          });
        }
      }
    });

    mensaje += "\n📦 Entrega: " + tipoEntrega + "\n";
    if (tipoEntrega === "A domicilio") mensaje += "📍 Dirección: " + direccion + "\n";
    if (tipoEntrega === "Comer dentro del local") mensaje += "🔢 Mesa: " + numeroMesa + "\n";

    mensaje += "💰 Pago: " + tipoPago + "\n";
    if (tipoPago === "Efectivo" && efectivoCliente) mensaje += "💵 Paga con: $" + efectivoCliente + "\n";

    if (especificaciones) mensaje += "📒 Especificaciones: " + especificaciones + "\n";

    mensaje += "\n💸 *Total: " + total + "*";
    return mensaje;
  }

  document.getElementById("pedidoForm").addEventListener("submit", function(e){
    e.preventDefault();
    const btn = this.querySelector(".btn");
    if (btn.disabled) return;

    btn.disabled = true;
    const mensaje = armarMensaje();

    // ===== Registro en Google Sheets (silencioso, no bloquea el envío a WhatsApp) =====
    const formData = new FormData();
    formData.append(ENTRY_NOMBRE, document.getElementById("nombre").value);
    formData.append(ENTRY_TELEFONO, document.getElementById("telefono").value);
    formData.append(ENTRY_PEDIDO, obtenerPedidoTexto());
    formData.append(ENTRY_ENTREGA, document.getElementById("tipoEntrega").value);
    formData.append(ENTRY_DIRECCION_MESA, document.getElementById("direccion").value || document.getElementById("numeroMesa").value || "");
    formData.append(ENTRY_PAGO, document.getElementById("tipoPago").value);
    formData.append(ENTRY_ESPECIFICACIONES, document.getElementById("especificaciones").value || "");
    formData.append(ENTRY_TOTAL, document.getElementById("totalPedido").value);

    fetch(GOOGLE_FORM_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    window.location.href = "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(mensaje);

    setTimeout(() => { btn.disabled = false; }, 5000);
  });
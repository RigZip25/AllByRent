import type { AppMessages } from "../types";

export const faq: AppMessages["faq"] = {
  panel: {
    searchPlaceholder: "Buscar ayuda…",
    searchAria: "Buscar en las preguntas frecuentes",
    noMatchesTitle: "Sin resultados",
    noMatchesBody: (mascot) => `Prueba con otras palabras, o pregúntale directamente a ${mascot}.`,
    askAboutQuery: (mascot) => `Preguntar a ${mascot} sobre esto`,
    askDefault: (mascot) => `¿No encuentras la respuesta? Pregúntale a ${mascot}`,
  },
  sections: {
    gettingStarted: "Primeros pasos",
    navigation: "Navegación",
    hosting: "Anfitrión y anuncios",
    qrPickup: "QR y recogida",
    renting: "Alquilar",
    payments: "Pagos y seguridad",
    location: "Ubicación",
    account: "Cuenta",
  },
  items: {
    "why-name": {
      q: "¿Por qué se llama Evorios?",
      a: "Evorios es un nombre acuñado de evo- (evolve / evolution — evolucionar) más -rios, un final corto de sonido latino/romance que sugiere muchos hogares — varios en español. Se dice eh-VOR-ee-ohs (acento en VOR).\n\nLo elegimos porque el producto trata de evolución, no de meter “rent” o “sale” en la marca: (1) cómo piensan los hogares — lo del garaje se vuelve escaparate; (2) cómo consumen las personas — pedir prestado, comprar de segunda, o pasar cosas; (3) cómo se relacionan los vecinos — confianza en el porche en lugar de comercio anónimo. En una línea: evolve how your home shares.\n\nAl principio puede sonar poco familiar — es normal en marcas inventadas. Los nombres descriptivos son más fáciles el primer día, pero difíciles de poseer en todo el mundo y te encierran en un solo modo. Evorios es único al buscarlo, tenemos evorios.com, y con la historia y el acento en VOR se queda en la memoria.",
    },
    "what-is": {
      q: "¿Qué es Evorios?",
      a: "Evorios es un mercado de vecinos: cada casa es una célula de negocio — un escaparate en el garaje de tu calle. Los vecinos alquilan, venden o regalan (Vender a 0 €). Explora categorías en Inicio, o llena tu garaje con el botón verde +.",
    },
    "home-feed": {
      q: "¿Cómo funciona Inicio?",
      a: "Inicio abre el centro de exploración. Toca una etiqueta de categoría (Herramientas, Jardín, Fiestas…) o «Explorar la zona», y luego filtra Todo · Alquilar · Comprar en el feed. No hay lupa de búsqueda en el pie de página — las categorías están en Inicio. Toca el + central para publicar algo desde tu garaje.",
    },
    "categories-nav": {
      q: "¿Cómo exploro por categoría?",
      a: "Abre Inicio → usa las etiquetas de categoría en el centro de exploración, o la franja del feed bajo Alquilar/Comprar. Toca una categoría en Más → Cómo funciona Evorios (o la pantalla de introducción) para desplegar las subcategorías particulares y profesionales. Al publicar con +, elige las mismas categorías en el asistente. No hay lupa de búsqueda en el pie de página.",
    },
    "garage-tab": {
      q: "¿Qué es la pestaña Mi garaje?",
      a: "La pestaña Garaje es el escaparate de tu casa — anuncios activos, solicitudes de reserva y estadísticas. Ajustes (icono de engranaje) abre tu perfil. Publica artículos cuando quieras con el botón central +.",
    },
    "location-rent": {
      q: "¿Por qué tengo que fijar mi zona?",
      a: "Mostramos garajes y artículos en tu área (25 km por defecto). Fija tu zona durante el registro o toca la etiqueta de ubicación en Inicio. ¿Vives en un sitio con poca oferta? Toca Ampliar búsqueda para ver 50+ km.",
    },
    "install-pwa": {
      q: "¿Cómo instalo la app en mi móvil?",
      a: "Toca a Mr. Evorios en el menú inferior para ver consejos de instalación, o usa Añadir a pantalla de inicio. En iPhone: Compartir → Añadir a pantalla de inicio. En Android: usa el aviso de instalación del navegador cuando aparezca.",
    },
    "list-first": {
      q: "¿Cómo publico mi primer artículo?",
      a: "Toca el + verde en el pie de página (o Garaje → Nuevo), y sigue el asistente rápido: 1) fotos, 2) detalles y precio (Alquilar / Vender), 3) revisión y publicación. Para alquileres, después de publicar puedes configurar una pegatina QR. ¿Quieres regalar algo? Usa Vender con precio 0 €. Mr. Evorios te ayuda en cada paso.",
    },
    "photos-ai": {
      q: "¿Qué pasa después de añadir fotos?",
      a: "En el paso 1, al continuar, Mr. Evorios analiza tus fotos y sugiere título, categoría, estado, descripción y valor estimado. Puedes editarlo todo en el paso 2.",
    },
    "pricing-modes": {
      q: "¿Qué modos de precio debo elegir?",
      a: "En el paso 2 (Detalles y precio) elige Alquilar y/o Vender. Solo son obligatorios los campos de los modos que actives. Los anuncios solo de venta se saltan la pegatina QR de alquiler. Precio 0 € en Vender = regalo gratuito (todavía no hay un modo Regalar aparte).",
    },
    "replacement-value": {
      q: "¿Qué es el valor de reposición?",
      a: "Es el coste de comprar el artículo nuevo hoy en la moneda de tu mercado — contexto para fijar la fianza. La IA sugiere un valor desde tus fotos. El importe de la fianza lo pone siempre el anfitrión; el seguro para artículos caros llega después.",
    },
    "qr-sticker": {
      q: "¿Por qué necesito una pegatina QR?",
      a: "Para alquileres, el QR vincula el artículo físico con tu anuncio. No hace falta impresora para empezar — muestra el código desde el teléfono en la entrega. Imprime una pegatina después (o en lote desde Mi garaje) si quieres. No pedimos foto de la pegatina impresa.",
    },
    "pickup-delivery": {
      q: "¿Cómo funcionan la recogida y la entrega?",
      a: "Los anuncios nuevos empiezan con valores por defecto razonables para el barrio (horario entre semana en el porche). Después de publicar, abre el anuncio desde Mi garaje → Edición completa (o ediciones rápidas en la pantalla de detalle) para configurar recogida en persona / sin contacto y kilómetros y tarifas de entrega. La dirección exacta se comparte con el inquilino confirmado tras la reserva.",
    },
    "book-item": {
      q: "¿Cómo alquilo un artículo?",
      a: "Busca en Inicio o explora el Feed, abre un artículo y solicita una reserva. Autorizarás el pago del alquiler y, por separado, cualquier retención del depósito. Sigue tus alquileres activos desde el icono de reservas en Inicio.",
    },
    "post-request": {
      q: "No aparece nada en la búsqueda — ¿y ahora qué?",
      a: "Publica una solicitud desde el resultado de búsqueda vacío. Los vecinos que tengan lo que buscas pueden responder. Nada de números falsos — mostramos anuncios reales de tu zona a medida que se llenan los garajes.",
    },
    "notifications": {
      q: "¿Dónde están mis notificaciones?",
      a: "Toca la campana en Inicio. Las pestañas muestran Todo, Reservas y Mensajes.",
    },
    "payments": {
      q: "¿Cómo funcionan los pagos?",
      a: "Alquileres: pagas el total del alquiler y, aparte, una retención de protección del depósito si el anfitrión la configuró. Los pagos pasan por Stripe — Evorios no guarda tu tarjeta. Los anfitriones conectan Stripe para cobrar.",
    },
    "dispute": {
      q: "Algo salió mal con un alquiler — ¿qué hago?",
      a: "Documenta el problema con fotos y mensajes en la app. Para emergencias de seguridad, contacta primero con las autoridades locales. Mr. Evorios puede orientarte sobre los siguientes pasos dentro de la app, pero no puede resolver disputas por sí solo.",
    },
    "availability-step5": {
      q: "¿Cómo configuro la disponibilidad o pauso un anuncio?",
      a: "Abre Mi garaje → toca el anuncio:\\n• Pausar / Reanudar oculta o restaura el artículo en la exploración sin borrarlo.\\n• Edita los horarios de disponibilidad (entre semana / fin de semana) desde la edición rápida o la Edición completa.\\n• Eliminar borra el anuncio para siempre, tanto de tu garaje como del servidor.",
    },
    "skip-onboarding": {
      q: "¿Puedo saltarme el registro inicial?",
      a: "Sí — Saltar en las pantallas de introducción te lleva a fijar tu zona y luego directo a Inicio. Puedes terminar la ubicación más tarde desde la etiqueta de ubicación en Inicio.",
    },
    "bottom-nav": {
      q: "¿Qué hacen los botones del menú inferior?",
      a: "Explorar = garajes y categorías cerca. Mr. Evorios = ayuda (preguntas frecuentes + chat). El + verde = publicar un artículo nuevo. Garaje = tu escaparate y ganancias. Más = perfil, alquileres, favoritos y Cómo funciona Evorios. No hay lupa de búsqueda en el pie de página.",
    },
    "more-menu": {
      q: "¿Qué hay en el menú Más?",
      a: "Más incluye tu tarjeta de perfil, Alquileres, Mensajes (chat dentro de la app), Favoritos, Notificaciones, el acceso directo a Mi garaje, el panel de ganancias, la guía interactiva Cómo funciona Evorios y el chat con Mr. Evorios.",
    },
    "in-app-chat": {
      q: "¿Cómo escribo a un vecino dentro de la app?",
      a: "Abre Más → Mensajes para ver todos los hilos. Para un alquiler: Alquileres → abre la reserva → Mensaje. Para una compra: anuncio → icono de mensaje. Las respuestas pueden enviar una notificación push si la otra persona la tiene activada.",
    },
    "mre-tab": {
      q: "¿Cómo uso a Mr. Evorios?",
      a: "Toca su pestaña en el pie de página. Preguntas frecuentes = respuestas al instante (sin coste de IA). El chat consulta primero las preguntas frecuentes, y usa IA solo si hace falta (las respuestas se guardan en caché). La pestaña Instalar ayuda a añadir la app a tu pantalla de inicio.",
    },
    "profile-vs-garage": {
      q: "Perfil frente a Garaje — ¿cuál es la diferencia?",
      a: "Garaje es para ser anfitrión: tus anuncios, solicitudes y estadísticas. Perfil es tu identidad: nombre, foto, teléfono, configuración de cobros, preferencias de notificaciones y cierre de sesión.",
    },
    "zip-only": {
      q: "¿Necesito mi dirección exacta?",
      a: "No. Ciudad + código postal (por ejemplo, Madrid, 28013) es suficiente para explorar garajes cercanos. La dirección exacta solo se comparte con un inquilino confirmado en el momento de la entrega, cuando eliges ese modo de recogida.",
    },
    "arkansas-rural": {
      q: "Vivo en una zona rural — ¿por qué hay tan pocos anuncios?",
      a: "Las zonas nuevas se van llenando a medida que los vecinos abastecen sus garajes. Usa Ampliar búsqueda en Inicio (50+ km), publica una solicitud, o pon en alquiler tus propias cosas — los primeros anfitriones consiguen más visibilidad.",
    },
    "traveling-mode": {
      q: "Estoy de viaje — ¿cómo exploro otra zona?",
      a: "Durante el registro elige De viaje, o cambia la ubicación desde la etiqueta en Inicio. Elige la ciudad o el código postal de destino — te mostramos los garajes de allí, no los de tu zona habitual.",
    },
    "neighbor-garage": {
      q: "¿Cómo abro el garaje de un vecino?",
      a: "En Inicio cambia a la vista de Garajes, o toca la tarjeta de un anfitrión en el feed. Verás su escaparate y sus anuncios activos.",
    },
    "favorites": {
      q: "¿Cómo funcionan los favoritos guardados?",
      a: "Más → Favoritos guarda los anuncios que marcaste con el corazón. Toca cualquier favorito para abrir el artículo y reservarlo de nuevo.",
    },
    "active-rental": {
      q: "¿Dónde está mi alquiler activo?",
      a: "Más → Alquileres, o el icono de portapapeles en Inicio. Abre la reserva para ver la ventana de recogida, mensajes, confirmación de recogida con QR y los pasos de devolución.",
    },
    "extend-rental": {
      q: "¿Puedo alargar un alquiler?",
      a: "Si el anfitrión lo permite, abre el alquiler activo y solicita más días antes de la devolución. El anfitrión lo aprueba y el precio se actualiza en la app.",
    },
    "cancel-booking": {
      q: "¿Cómo cancelo una reserva?",
      a: "Abre el alquiler en Alquileres y elige Cancelar antes de la recogida. Solicitudes pendientes: cancela cuando quieras (se libera la autorización). Tras aceptar: 48+ h antes del inicio → reembolso completo; 24–48 h → 50%; menos de 24 h → sin reembolso del alquiler. Si cancela el anfitrión antes de la recogida, el inquilino recupera el 100%.",
    },
    "host-payouts": {
      q: "¿Cómo cobran los anfitriones?",
      a: "Conecta Stripe en Perfil → cobros en la cuenta dueña del garaje. Los ayudantes no reciben esos cobros. Los cobros del alquiler llegan tras una devolución exitosa; las comisiones de la plataforma se muestran antes de publicar.",
    },
    "deposit-release": {
      q: "¿Cuándo se libera mi depósito?",
      a: "Después de que el anfitrión confirme la devolución (o por liberación automática si no hay ninguna disputa). Las retenciones aparecen separadas del cargo del alquiler en el extracto de tu tarjeta.",
    },
    "passkey": {
      q: "¿Qué es una passkey?",
      a: "Las passkeys te permiten iniciar sesión con Face ID / huella en vez de escribir el código de correo cada vez. Después del primer inicio de sesión, la app puede ofrecerte configurarla — es opcional, pero más rápido. Los códigos de acceso siguen llegando por correo.",
    },
    "co-host": {
      q: "¿Puedo añadir un coanfitrión / ayudante?",
      a: "Sí. En la configuración del garaje o Perfil / Ajustes → Coanfitriones invita con el correo de cada persona. Les enviamos la invitación por email. Inician sesión por separado (código / Face ID), aceptan y pueden llenar tu estantería. Pueden conservar su propio garaje. Los cobros (Stripe) quedan con el dueño del garaje.",
    },
    "garage-switcher": {
      q: "Ayudo en otro garaje — ¿cómo cambio?",
      a: "Abre Mi garaje. Si perteneces a más de uno, usa Trabajando en arriba para elegir Mi garaje o el compartido. Las fotos y el + van al garaje seleccionado. Explorar siempre es con tu propio acceso.",
    },
    "own-and-help": {
      q: "Vivimos al lado y nos ayudamos — ¿compartimos un solo garaje?",
      a: "No es obligatorio. Cada casa puede tener su garaje y su Stripe. Invítense como ayudantes y cambien Trabajando en al stockear la estantería del otro. Igual para familia en una casa con un escaparate compartido, o vecinos con tiendas separadas.",
    },
    "stripe-garage-owner": {
      q: "¿A quién paga Stripe si los ayudantes llenan la estantería?",
      a: "El dinero va al dueño del garaje que conectó Stripe en ese escaparate. Los ayudantes pueden añadir anuncios; solo el dueño abre Live y cobra. Si abriste Live en tu teléfono con tu banco, ese es tu garaje — cambia Trabajando en antes de stockear el de otra persona.",
    },
    "browse-own-login": {
      q: "Si el teléfono de mamá está abierto, ¿papá puede explorar como él?",
      a: "No — Explorar y las reservas siguen a quien inició sesión en ese dispositivo. Papá usa su teléfono (o cierra sesión y entra con su correo / Face ID). Ayudar en un garaje compartido no cambia quién eres al explorar o alquilar.",
    },
    "pause-listing": {
      q: "¿Cómo pauso un anuncio?",
      a: "Mi garaje → abre el anuncio → Pausar anuncio. Desaparece de la exploración al instante. Toca Reanudar cuando estés listo otra vez. Usa Eliminar solo si quieres quitarlo para siempre.",
    },
    "edit-listing": {
      q: "¿Cómo edito un anuncio publicado?",
      a: "Garaje → toca el anuncio → usa las ediciones rápidas en la pantalla de detalle, o Edición completa para fotos y precios. Pausar y Eliminar están en la misma sección de Gestión.",
    },
    "boost-listing": {
      q: "¿Cómo consigo más visitas?",
      a: "Fotos claras, un precio justo y disponibilidad completa son lo que más ayuda. El impulso de pago (cuando esté disponible) destaca tu artículo en el feed de la zona.",
    },
    "report-issue": {
      q: "¿Cómo denuncio a un usuario o un anuncio?",
      a: "Abre el anuncio o el hilo del alquiler → Denunciar. En emergencias, llama primero a las autoridades locales. Para reclamaciones por daños, incluye fotos y fechas.",
    },
    "app-update": {
      q: "La app me pidió actualizar — ¿qué hago?",
      a: "Evorios descarga las actualizaciones en segundo plano y las instala por la noche, sobre las 2:00, en tu móvil (o la próxima vez que abras la app después de esa hora). También puedes abrir Notificaciones (campana) y tocar Actualizar si lo quieres antes. Si la pantalla se queda bloqueada tras la actualización, cierra y vuelve a abrir la app.",
    },
    "offline": {
      q: "¿Funciona Evorios sin conexión?",
      a: "Explorar páginas ya cargadas puede funcionar un momento, pero reservar, chatear y buscar de nuevo necesitan internet. Verás una pantalla de sin conexión cuando no haya red.",
    },
  },
};

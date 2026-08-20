import type { CategoryFactsOverlay } from "../types";

/** ES FactCard overlay — missing shelves inherit canonical EN via resolveCategoryFacts. */
export const categoryFactsEsOverlay: CategoryFactsOverlay = {
  expand: "Saber más",
  collapse: "Ocultar detalles",
  byCategory: {
    Vehicles: {
        title: "FAQ alquiler de coche ligero / turismo",
        summary: "Respuestas cortas para coches y camionetas bajo peso comercial.",
        qa: [
          {
            q: "¿Necesito CDL?",
            a: "No para coches de turismo bajo 26 001 lb GVWR, salvo que la ley local lo exija.",
          },
          {
            q: "¿Qué seguro necesito?",
            a: "Póliza personal válida que cubra este coche. Sube el comprobante en la app antes del PIN o las llaves.",
          },
          {
            q: "¿Cómo funciona la cancelación?",
            a: "Cancelación ≥24 h antes del inicio: reembolso total. Dentro de 24 h: 50%.",
          },
          {
            q: "¿Combustible y devolución tarde?",
            a: "Combustible lleno a lleno (+$20 si falta). Devolución tarde: 30 min de gracia, luego $20 + $15/h.",
          },
          {
            q: "¿Por qué GPS para el PIN?",
            a: "El PIN solo se abre en la recogida (o con el QR del coche)—no un código reenviado.",
          },
          {
            q: "¿Qué fotos son obligatorias?",
            a: "Inspección previa: carrocería + cuatro llantas antes del inicio; el mismo set al devolver.",
          },
        ],
      },
    VehiclesCommercial: {
        title: "FAQ transporte comercial (≥26 001 lb / semi)",
        summary: "Respuestas cortas para camiones comerciales pesados y semis.",
        qa: [
          {
            q: "¿Necesito CDL?",
            a: "Sí si el GVWR es 26 001 lb o más (o según la ley local).",
          },
          {
            q: "¿Qué peso debo indicar?",
            a: "GVWR en libras—no el valor en dólares.",
          },
          {
            q: "¿Cómo funciona la prueba de seguro?",
            a: "El agente del arrendatario envía la prueba al correo del dueño del anuncio antes del PIN o las llaves.",
          },
          {
            q: "¿Se exige daño físico (PD)?",
            a: "Sí. Los límites de PD siguen el GVWR (lb); la retención del depósito sigue el deducible / PD comercial.",
          },
          {
            q: "¿Qué inspección es obligatoria?",
            a: "Inspección comercial multi-llanta antes del inicio; el mismo set al devolver.",
          },
          {
            q: "¿Por qué GPS para el PIN?",
            a: "PIN o caja solo en la recogida o vía QR del vehículo—no un código reenviado.",
          },
        ],
      },
    "Heavy Equipment": {
          title: "FAQ de equipo pesado",
          summary: "Respuestas cortas para montacargas, excavadoras, grúas y equipo similar.",
          qa: [
            {
              q: "¿Quién puede alquilar?",
              a: "Profesionales por defecto. DIY solo si el anfitrión desactiva esa regla.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Sí cuando la subcategoría lo exige (montacargas/grúa/excavadora/general)—súbela antes de la entrega.",
            },
            {
              q: "¿Se requiere seguro?",
              a: "Sí—comprobante de daño físico antes del PIN/llaves. El depósito iguala el deducible.",
            },
            {
              q: "¿Qué inspección se exige?",
              a: "Fotos pre-viaje obligatorias; ambas partes confirman antes del inicio y al devolver.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Una retención del deducible—no el reemplazo total. El seguro es primario.",
            },
          ],
        },
    Construction: {
          title: "FAQ de construcción",
          summary: "Respuestas cortas para equipo de obra entre vecinos (no flota nacional).",
          qa: [
            {
              q: "¿Solo profesionales?",
              a: "Estantes motorizados/grúa requieren pro + COI estructurado. EPI blando puede ser más simple.",
            },
            {
              q: "¿Credencial de operador?",
              a: "Sí en grúa, excavadora y estantes pesados que lo pidan.",
            },
            {
              q: "¿Cómo funciona el combustible?",
              a: "Si el anfitrión define el tipo: devolución lleno a lleno.",
            },
            {
              q: "¿Tarifa mensual?",
              a: "Sí—se pueden publicar tarifas mensuales para trabajos largos.",
            },
            {
              q: "¿Qué fotos se exigen?",
              a: "La inspección previa bloquea el inicio; encofrado usa checklist de piezas al devolver.",
            },
          ],
        },
    "Boats & Water": {
          title: "FAQ de barcos y agua",
          summary: "Respuestas cortas para embarcaciones a motor, paddle y viajes con capitán.",
          qa: [
            {
              q: "¿Necesito ID del casco?",
              a: "Sí en motorizadas (HIN/CIN/registro local). Kayak/SUP/inflable sin motor no.",
            },
            {
              q: "¿Edad / licencia?",
              a: "Sin capitán: 25 + licencia si aplica. Con capitán: edad 18, sin licencia del huésped.",
            },
            {
              q: "¿Equipo de seguridad?",
              a: "A motor: kit USCG/local. Paddle: acuse de política PFD.",
            },
            {
              q: "¿Qué fotos?",
              a: "Recorrido del casco (proa, popa, babor, estribor, cubierta) al inicio y al devolver.",
            },
            {
              q: "¿Seguro?",
              a: "Sí—comprobante antes de la entrega. Depósito según deducible.",
            },
          ],
        },
    "Real Estate": {
          title: "FAQ de estancias y casas",
          summary: "Respuestas cortas sobre reglas de la casa, limpieza e ID en el check-in.",
          qa: [
            {
              q: "¿Reglas de la casa obligatorias?",
              a: "Sí en alquiler—horario, visitas, humo, mascotas, checkout.",
            },
            {
              q: "¿Tarifa de limpieza?",
              a: "Opcional—si existe, se muestra al reservar y queda en el acuerdo.",
            },
            {
              q: "¿Qué ID en el check-in?",
              a: "Selfie / subida de ID al inicio—mismo patrón que vehículos.",
            },
            {
              q: "¿Depósito?",
              a: "Por defecto hacia un mes de renta, salvo que el anfitrión indique otra cosa.",
            },
            {
              q: "¿Cuándo se desbloquea el acceso?",
              a: "Tras el ID de inicio en el sitio—no solo con una confirmación reenviada.",
            },
          ],
        },
    "Photo & Video": {
          title: "Photo & video rental FAQ",
          summary: "Short answers for kits, drones Remote ID, media, and deposit claims \u2014 no gear-insurance promo.",
          qa: [
            {
              q: "What is required on Photo & Video rentals?",
              a: "Brand, model, kit class, and a kit inventory. Drones also freeze weight class and Remote ID status.",
            },
            {
              q: "Who brings memory cards?",
              a: "Capture-media field freezes included, partial, renter brings, or internal-only.",
            },
            {
              q: "Do drones need Remote ID?",
              a: "Yes unless under-250g exempt \u2014 host marks built-in, add-on, or valid exempt. Mismatch blocks publish.",
            },
            {
              q: "What does the deposit cover?",
              a: "Body damage and missing kit pieces against the frozen list \u2014 not a production insurance policy.",
            },
            {
              q: "Partner promo?",
              a: "No camera-shop affiliate or lens-insurance hard-sell.",
            },
          ],
        },
    "Electronics & Tech": {
          title: "FAQ de electrónica y tech",
          summary: "Respuestas cortas sobre series, kits, borrado y depósito.",
          qa: [
            {
              q: "¿Serie + inventario?",
              a: "Sí en alquiler—lista cargadores, dongles, fundas y mandos.",
            },
            {
              q: "¿Wipe si hay almacenamiento?",
              a: "Sí—el anfitrión borra/desvincula antes de publicar; el huésped lo confirma al reservar.",
            },
            {
              q: "¿Seguro de socio?",
              a: "No. Confianza vecinal + depósito.",
            },
            {
              q: "¿Qué reviso en la entrega?",
              a: "Cuenta cada pieza del inventario.",
            },
            {
              q: "¿Falta algo?",
              a: "Inventario + serie sostienen el reclamo; el depósito cubre la diferencia.",
            },
          ],
        },
    "Gym & Fitness": {
          title: "FAQ de alquiler de gimnasio y fitness",
          summary: "Respuestas breves sobre renuncias, límites de peso, higiene y puertas por estantería.",
          qa: [
            {
              q: "¿Necesito una renuncia?",
                a: "Sí por defecto en alquileres de Gym & Fitness—renuncia de riesgo/responsabilidad al reservar, salvo que el anfitrión marque no requerida.",
            },
            {
              q: "¿Hay peso máximo de usuario?",
                a: "En Cardio, Commercial Treadmills y Weight Machines el anfitrión fija una banda—respétala.",
            },
            {
              q: "¿Qué cubre el depósito?",
                a: "Daños y piezas faltantes. La renuncia cubre riesgo de lesión de uso ordinario, no daño al equipo.",
            },
            {
              q: "¿Los bienes blandos tienen las mismas puertas que las máquinas?",
                a: "Yoga, bandas y recovery usan higiene e inventario; las máquinas añaden energía, huella y peso máximo.",
            },
            {
              q: "¿Incluye seguro de gimnasio?",
                a: "No. Solo depósito + renuncia + specs de estantería—sin promo de seguros de terceros.",
            },
          ],
        },
    "Sports & Recreation": {
          title: "FAQ de deportes y recreación",
          summary: "Respuestas cortas sobre waiver, PFD, DIN/casco, inventario y depósito.",
          qa: [
            {
              q: "¿Qué se exige en alquileres Sports?",
              a: "Talla/longitud y skill en cada anuncio. Nieve congela forma, DIN, casco y waiver. Agua/pro agua congela clase, PFD y waiver. Otros estantes tienen un campo de tipo.",
            },
            {
              q: "¿Cuándo hay waiver?",
              a: "Snow Sports, Water Sports y Pro Water Sports publican el campo de waiver.",
            },
            {
              q: "¿El PFD viene incluido?",
              a: "El anuncio congela incluido / lo aporta el arrendatario / N/A — no asumas chaleco.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Daños y piezas faltantes según inventario — no seguro de lesiones.",
            },
            {
              q: "¿Qué no incluye?",
              a: "Sin clases de estación, guía ni cobertura médica de Evorios.",
            },
          ],
        },
    "Outdoor & Camping": {
          title: "FAQ de outdoor y camping",
          summary: "Respuestas cortas sobre exención, higiene y piezas faltantes.",
          qa: [
            {
              q: "¿Cuándo hay exención?",
              a: "En estantes de expedición/supervivencia al reservar.",
            },
            {
              q: "¿Tiendas y sacos?",
              a: "El anfitrión atestigua limpieza/aireo; el huésped el checklist de higiene.",
            },
            {
              q: "¿Qué specs revisar?",
              a: "Capacidad y rating de temporada en el anuncio.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Varillas, doble techo, piezas de cocina y faltantes.",
            },
            {
              q: "¿Seguro de viaje?",
              a: "No—solo depósito + exención/higiene.",
            },
          ],
        },
    "Bikes & Scooters": {
          title: "FAQ de bicis y scooters",
          summary: "Respuestas cortas sobre casco, candado, e-power y niños.",
          qa: [
            {
              q: "¿Casco, candado y guardado nocturno?",
              a: "Sí—el anfitrión debe publicar los tres.",
            },
            {
              q: "¿E-bikes / e-scooters?",
              a: "Edad mínima + clase e-bike si el estante es E-Bikes o Electric = sí.",
            },
            {
              q: "¿Exención MTB / racing?",
              a: "Sí por defecto.",
            },
            {
              q: "¿Bicis infantiles?",
              a: "Atestación del tutor; el casco no puede ser «no requerido».",
            },
            {
              q: "¿Cargo / adaptive?",
              a: "Cargo: carga útil + política de niño. Adaptive: subtipo declarado.",
            },
          ],
        },
    "Party & Events": {
          title: "FAQ de alquiler para fiestas y eventos",
          summary: "Respuestas cortas sobre capacidad, tarifa de montaje, potencia, cancelación por clima y sanitización de catering.",
          qa: [
            {
              q: "¿Hay tarifa de montaje/desmontaje?",
              a: "AV / escenario / luces pro suelen publicarla—queda fijada en el acuerdo al reservar.",
            },
            {
              q: "¿Qué info de potencia se muestra?",
              a: "Amperios / circuitos en Escenario, Sonido, Luces, Photo Booths y Catering cuando el anfitrión los fija—revisa antes de reservar.",
            },
            {
              q: "¿Cómo funciona la cancelación por clima?",
              a: "Toldos/carpas outdoor y huellas outdoor publican una ventana (24 h / 12 h / discreción del anfitrión) para reembolso total.",
            },
            {
              q: "¿Mesas y decor necesitan cancelación por clima?",
              a: "No para decor suave indoor—las huellas outdoor sí publican ventana cuando aplica.",
            },
            {
              q: "¿Cuándo se exige sanitización de catering?",
              a: "Serving Equipment y Catering Equipment en alquiler requieren atestación de sanitización del anfitrión antes de la entrega.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Manchas, roturas, piezas faltantes y mal uso de potencia más allá del desgaste normal—no un seguro de fiesta.",
            },
          ],
        },
    "Tools & DIY": {
          title: "FAQ de herramientas y DIY",
          summary: "Respuestas cortas sobre EPI, briefing y depósito.",
          qa: [
            {
              q: "¿Cuándo hay briefing?",
              a: "Sierras, soldadoras y andamios—confirma EPI/briefing antes de la entrega.",
            },
            {
              q: "¿Qué EPI?",
              a: "Ojos, oídos y manos; EPI de soldadura si aplica.",
            },
            {
              q: "¿Taladros?",
              a: "La mayoría de herramientas de mano solo vecino + depósito.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Discos, baterías y accesorios—no seguro total de herramientas.",
            },
            {
              q: "¿Qué ayuda en reclamos?",
              a: "Fotos de entrega + acuse del briefing.",
            },
          ],
        },
    "Unique & Other": {
          title: "Unique & other FAQ",
          summary: "Respuestas cortas para one-off, fragilidad y depósito — sin promo de seguro specialty.",
          qa: [
            {
              q: "¿Qué es siempre obligatorio?",
              a: "Use case, tamaño de transporte y banda de fragilidad en alquileres Unique.",
            },
            {
              q: "¿Cuándo hace falta checklist?",
              a: "Hobby, Specialty, Props, Custom y Other congelan inventario.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Daño y piezas faltantes — no seguro de colección, arte o instrumento.",
            },
            {
              q: "¿Debo reubicar?",
              a: "Sí cuando cabe mejor una categoría con nombre (Music para instrumentos estándar, Party para kits de fiesta).",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de subastas, galerías o seguro specialty.",
            },
          ],
        },
    "Garden & Yard": {
          title: "FAQ de jardín y patio",
          summary: "Respuestas cortas sobre herramientas, plantas, riego y trituradoras de tocones.",
          qa: [
            {
              q: "¿Los sopladores necesitan seguro?",
              a: "No—las herramientas cotidianas usan confianza vecinal, especificaciones de estantería y depósito.",
            },
            {
              q: "¿Qué requieren las trituradoras de tocones?",
              a: "Capacidad, EPP, renuncia, prueba de seguro y briefing de seguridad antes de la entrega.",
            },
            {
              q: "¿Qué campos importan en plantas?",
              a: "Nombre común, altura, sol, contenedor, grado de salud, riego y política de trasplante/devolución en alquiler.",
            },
            {
              q: "¿Qué debo fotografiar?",
              a: "El estado en la entrega—cuchillas, bolsas, baterías, bidones y macetas suelen causar disputas.",
            },
            {
              q: "¿Evorios asegura trabajos de jardinería?",
              a: "No—la prueba del inquilino cuando aplica y el depósito son las capas.",
            },
          ],
        },
    "Home & Kitchen": {
          title: "FAQ de hogar y cocina",
          summary: "Respuestas cortas sobre electrodomésticos y sistemas de café comerciales.",
          qa: [
            {
              q: "¿Electrodomésticos cotidianos?",
              a: "Vecino + depósito, más capacidad y devolución limpia.",
            },
            {
              q: "¿Café comercial?",
              a: "Voltaje, estado NSF e instalación (agua/cableado) en el anuncio.",
            },
            {
              q: "¿Por qué el voltaje?",
              a: "Voltaje incorrecto o falta de agua arruina el evento—queda en el acuerdo.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Daños y accesorios faltantes.",
            },
            {
              q: "¿Evorios certifica NSF?",
              a: "No—el anfitrión declara el estado.",
            },
          ],
        },
    "Office & Business": {
          title: "Office & business rental FAQ",
          summary: "Short answers for furniture vs devices with storage, wipe plans, and deposit claims.",
          qa: [
            {
              q: "Do desks need a data wipe?",
              a: "No\u2014furniture stays neighbor + deposit. Devices that store jobs or accounts freeze storage status and a wipe plan.",
            },
            {
              q: "When is a wipe required?",
              a: "When the listing marks onboard storage\u2014especially POS, servers, copiers, and printers with jobs. Host wipe status + renter wipe ack at booking.",
            },
            {
              q: "Who handles cyber insurance?",
              a: "Neither party gets platform cyber cover\u2014wipe attestation is the privacy layer.",
            },
            {
              q: "What does the deposit cover?",
              a: "Physical damage and missing trays, cables, stands, or readers against the frozen kit list.",
            },
            {
              q: "What if data is left on the device?",
              a: "Follow the published wipe status and booking acknowledgment\u2014Evorios does not certify data erasure.",
            },
          ],
        },
    "Music & Audio": {
          title: "FAQ de alquiler de m\u00fasica y audio",
          summary: "Respuestas cortas sobre instrumentos, inventario PA, cables, estuches y dep\u00f3sito \u2014 sin promo de seguro de backline.",
          qa: [
            {
              q: "\u00bfQu\u00e9 es obligatorio en Music & Audio?",
              a: "Marca y modelo en cada anuncio. Los estantes con alimentaci\u00f3n congelan la clase de potencia. Los kits multipieza deben listar cables, soportes y estuches. PA Systems exige inventario de cables/soportes en la entrega.",
            },
            {
              q: "\u00bfNecesito n\u00famero de serie?",
              a: "S\u00ed en alquileres de Music & Audio \u2014 el serie o ID de equipo se congela con el anuncio para entrega y reclamaciones.",
            },
            {
              q: "\u00bfCu\u00e1ndo hace falta inventario de cables/soportes?",
              a: "Siempre en PA Systems. Otros estantes usan checklist de kit recomendado para reclamar XLR, soportes y pedales faltantes.",
            },
            {
              q: "\u00bfQu\u00e9 cubre el dep\u00f3sito?",
              a: "Rayones, hardware roto y accesorios faltantes seg\u00fan el inventario congelado \u2014 no es p\u00f3liza de backline ni plan Fat Llama.",
            },
            {
              q: "\u00bfEs Electronics Pro Audio?",
              a: "No. La captura de estudio en Electronics sigue en Pro Audio. Stacks en vivo e instrumentos siguen en Music & Audio.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin afiliado Sweetwater / Guitar Center, sin labor de stage tech y sin upsell de seguro de instrumentos de Evorios.",
            },
          ],
        },
    "Costume & Cosplay": {
          title: "FAQ de disfraces y cosplay",
          summary: "Respuestas cortas sobre devolución, limpieza e higiene.",
          qa: [
            {
              q: "¿Condición de devolución obligatoria?",
              a: "Sí—reglas (+ tarifa de limpieza opcional) quedan en el acuerdo.",
            },
            {
              q: "¿Sanitizar piezas de contacto?",
              a: "Sí en máscaras, maquillaje, pelucas e interiores de trajes cuando aplique.",
            },
            {
              q: "¿Cuándo hay inventario?",
              a: "Teatro, props de cine, maquillaje pro y trajes completos.",
            },
            {
              q: "¿Exención en trajes completos?",
              a: "Sí—más guía de calor/visibilidad. Animatrónicos también con exención.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Roturas y piezas faltantes más allá de la tarifa de limpieza publicada.",
            },
          ],
        },
    "Baby & Kids": {
          title: "FAQ de seguridad infantil",
          summary: "Respuestas cortas sobre sillas, cunas y juego comercial.",
          qa: [
            {
              q: "¿Silla vencida?",
              a: "No—caducidad y recall bloquean publicar y reservar.",
            },
            {
              q: "¿Cunas?",
              a: "Sin drop-side; estándar de sueño; colchón firme; sanitización.",
            },
            {
              q: "¿Juego comercial?",
              a: "Certificación, capacidad y exención de responsabilidad.",
            },
            {
              q: "¿Qué debe mostrar el anfitrión?",
              a: "Foto de etiqueta, recall y sanitización cuando aplique.",
            },
            {
              q: "¿Qué confirma el huésped?",
              a: "Atestaciones de seguridad al reservar antes del desbloqueo.",
            },
          ],
        },
  },
  bySubcategory: {
    "Unique & Other": {
        "Collectibles": {
          title: "Coleccionables — autenticidad + cuidado",
          summary: "Autenticidad, use case, transporte y fragilidad.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Autenticidad, use case, tamaño de transporte y fragilidad.",
            },
            {
              q: "¿Es real?",
              a: "El anfitrión marca documentado, desconocido o réplica ok — no es tasación.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre golpes y soportes faltantes — no seguro de colección.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de casas de subastas.",
            },
          ],
        },
        "Art & Sculpture": {
          title: "Arte — medio + cuidado",
          summary: "Medio, transporte y fragilidad para arte.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Medio, use case, transporte y fragilidad.",
            },
            {
              q: "¿Colgado?",
              a: "Declara soportes en las notas.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre daño superficial — no seguro de mercado de arte.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de galerías.",
            },
          ],
        },
        "Hobby Equipment": {
          title: "Hobby — clase + inventario",
          summary: "Clase hobby más checklist para sets.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase hobby, use case, transporte, fragilidad y checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre piezas faltantes según la lista.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de hobby store.",
            },
            {
              q: "¿Reubicar?",
              a: "Kits de fiesta pueden ir a Party — Unique es hobby one-off.",
            },
          ],
        },
        "Unusual Items": {
          title: "Inusual — clase + cuidado",
          summary: "Novedades y experiencias congelan la clase.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase inusual, use case, transporte y fragilidad.",
            },
            {
              q: "¿Qué tan raro está ok?",
              a: "Describe uso seguro — sin riesgos ocultos.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre daño y piezas faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de novelty shop.",
            },
          ],
        },
        "Seasonal Items": {
          title: "Estacional — clase + cuidado",
          summary: "Decoración y gear de temporada congelan la clase.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase estacional, use case, transporte y fragilidad.",
            },
            {
              q: "¿Embalaje al devolver?",
              a: "Declara expectativas de empaque.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre decoración rota y luces faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de holiday store.",
            },
          ],
        },
        "Specialty Equipment": {
          title: "Specialty — clase + inventario",
          summary: "Lab/trade specialty congela clase y checklist.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase specialty, use case, transporte, fragilidad y checklist.",
            },
            {
              q: "¿Entrenamiento?",
              a: "El anfitrión anota skill del operador.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre módulos faltantes — no seguro de responsabilidad profesional.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de vendors specialty.",
            },
          ],
        },
        "Industrial Oddities": {
          title: "Rarezas industriales — clase + cuidado",
          summary: "Máquinas/fixtures congelan clase y manejo.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase de rareza, use case, transporte y fragilidad.",
            },
            {
              q: "¿Energía / instalación?",
              a: "Declara en las notas.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre daño en tránsito — no seguro de obra.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de surplus dealers.",
            },
          ],
        },
        "Professional Props": {
          title: "Utilería — clase + inventario",
          summary: "Film/escenario/foto congelan clase y checklist.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase de utilería, use case, transporte, fragilidad y checklist.",
            },
            {
              q: "¿Reglas en set?",
              a: "Declara no-food / no-weather.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre rozaduras y piezas faltantes según la lista.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de prop house.",
            },
          ],
        },
        "Rare Instruments": {
          title: "Instrumentos raros — clase + cuidado",
          summary: "Congelan clase; lo estándar va a Music.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase de instrumento, use case, transporte y fragilidad.",
            },
            {
              q: "¿Por qué Unique?",
              a: "Cuando es raro/one-off — guitarras estándar a Music.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre estuche y arcos faltantes — no seguro de instrumento.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de seguro de instrumentos.",
            },
          ],
        },
        "Custom Builds": {
          title: "Custom builds — clase + inventario",
          summary: "Muebles/dispositivos custom congelan clase y checklist.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase custom, use case, transporte, fragilidad y checklist.",
            },
            {
              q: "¿Notas del maker?",
              a: "Declara tolerancias y ensamblaje.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre acabado y hardware faltante.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de maker marketplace.",
            },
          ],
        },
        "Other": {
          title: "Unique other — reubica si cabe un estante",
          summary: "Catch-all publica tipo y checklist.",
          qa: [
            {
              q: "¿Cuándo Other?",
              a: "Solo si no cabe un estante Unique con nombre.",
            },
            {
              q: "¿Qué puertas?",
              a: "uniqueOtherKind, use case, transporte, fragilidad y checklist.",
            },
            {
              q: "¿Reubicar?",
              a: "A Collectibles, Art, Hobby, Unusual, Seasonal, Specialty, Props, Instruments o Custom.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre piezas faltantes según el checklist.",
            },
          ],
        },
      },
    "Tools & DIY": {
        "Hand Tools": {
          title: "Manuales — clase + set",
          summary: "Dados y llaves congelan clase y single vs set.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase manual, fuente de energía y single vs set. Sets necesitan checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre dados faltantes y mangos dañados según la lista.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de tool store.",
            },
            {
              q: "¿Manual?",
              a: "Power source puede ser manual para no eléctricas.",
            },
          ],
        },
        "Power Drills": {
          title: "Taladros — clase + energía",
          summary: "Atornilladores y percutores congelan clase y energía.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase de taladro, energía y voltaje si es inalámbrico.",
            },
            {
              q: "¿Baterías?",
              a: "Lista baterías y cargadores en el checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre mandril dañado y baterías faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de plataformas de batería.",
            },
          ],
        },
        "Measuring Tools": {
          title: "Medición — clase",
          summary: "Cintas, niveles y escuadras congelan la clase.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase de medición y energía (manual para cintas).",
            },
            {
              q: "¿Precisión?",
              a: "Clase declarada por el anfitrión — no certificado de calibración.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre escuadras torcidas y estuches faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de metrología.",
            },
          ],
        },
        "Ladders": {
          title: "Escaleras — altura + duty",
          summary: "Altura y duty rating antes del alquiler.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Banda de altura, duty rating y energía (manual).",
            },
            {
              q: "¿Duty rating?",
              a: "Bandas tipo IAA–III — respeta la etiqueta.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre rieles torcidos — no seguro de caídas.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de seguro de escaleras.",
            },
          ],
        },
        "Painting Tools": {
          title: "Pintura — clase + set",
          summary: "Pulverizadores y rodillos congelan clase y single vs set.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase de pintura, energía y set. Sets necesitan inventario.",
            },
            {
              q: "¿Limpieza?",
              a: "Declara expectativas de devolución limpia.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre pulverizadores tapados y boquillas faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de marcas de pintura.",
            },
          ],
        },
        "Industrial Drills": {
          title: "Taladros industriales — clase + energía",
          summary: "Pro usan la misma puerta de clase.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase de taladro, energía y voltaje.",
            },
            {
              q: "¿PPE?",
              a: "Declara brocas y PPE en el checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre motor y baterías faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de distribuidores.",
            },
          ],
        },
        "Welding Equipment": {
          title: "Soldadura — proceso, amperios, PPE, briefing",
          summary: "Proceso, amperios, PPE y briefing de seguridad.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Proceso, banda de amperios, PPE y briefing listo.",
            },
            {
              q: "¿Quién trae PPE?",
              a: "El campo PPE fija casco/guantes incluidos vs renter.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre puntas y cables — no seguro de quemaduras.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de gases de soldadura.",
            },
          ],
        },
        "Scaffolding Systems": {
          title: "Andamios — altura, carga, briefing",
          summary: "Altura, carga y briefing.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Altura, carga y briefing listo.",
            },
            {
              q: "¿Montaje?",
              a: "El briefing cubre montaje/inspección.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre marcos torcidos — no seguro de caídas.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de casas de andamios.",
            },
          ],
        },
        "Laser Measuring": {
          title: "Láser — clase",
          summary: "Distancia, nivel y rotativos congelan la clase.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase láser y energía.",
            },
            {
              q: "¿Precisión?",
              a: "Clase del anfitrión — no certificación topográfica.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre ventanas rotas y trípodes faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de vendors láser.",
            },
          ],
        },
        "Power Saws": {
          title: "Sierras — clase + briefing",
          summary: "Clase de sierra y briefing de seguridad.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase de sierra, energía y briefing listo.",
            },
            {
              q: "¿Hojas?",
              a: "Lista hojas de repuesto en el checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre protectores dañados — no seguro de lesiones.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de marcas de sierra.",
            },
          ],
        },
        "Other": {
          title: "Tools other — reubica si cabe un estante",
          summary: "Catch-all publica tipo, set e inventario.",
          qa: [
            {
              q: "¿Cuándo Other?",
              a: "Solo si no cabe un estante Tools con nombre.",
            },
            {
              q: "¿Qué puertas?",
              a: "toolsOtherKind, set, energía y checklist.",
            },
            {
              q: "¿Reubicar?",
              a: "A Hand, Drill, Measure, Ladder, Paint, Weld, Scaffold, Saw o Laser.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre piezas faltantes según el checklist.",
            },
          ],
        },
      },
    "Sports & Recreation": {
        "Snow Sports": {
          title: "Nieve — forma, DIN, casco",
          summary: "Forma de esquí/tabla, banda DIN, casco y waiver antes del alquiler.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Forma de nieve, DIN, casco, talla, nivel y waiver.",
            },
            {
              q: "¿Qué es DIN?",
              a: "Banda de fijación publicada por el anfitrión — no certifica tus botas.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre cantos rotos y bastones faltantes — no lesiones. El waiver cubre riesgo ordinario.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de seguro de tienda de esquí.",
            },
          ],
        },
        "Water Sports": {
          title: "Agua — embarcación, PFD, waiver",
          summary: "Clase de equipo, PFD y waiver para tablas y paddle.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase acuática, PFD, talla, nivel y waiver.",
            },
            {
              q: "¿Quién lleva PFD?",
              a: "El campo fija incluido, lo trae el renter, o no aplica.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre abolladuras y quillas faltantes — no seguro de lesión en agua.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de seguro watersports.",
            },
          ],
        },
        "Pro Water Sports": {
          title: "Pro agua — embarcación, PFD, waiver",
          summary: "Estantes pro usan las mismas puertas craft/PFD/waiver.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase acuática, PFD, talla, nivel y waiver.",
            },
            {
              q: "¿Pro vs personal?",
              a: "Mismas puertas de seguridad — detalle el kit pro en el checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre cuerdas y tablas faltantes — no seguro de evento.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de sponsor de torneo.",
            },
          ],
        },
        "Racket Sports": {
          title: "Raquetas — tipo de deporte",
          summary: "Tenis a pickleball congelan el tipo más talla y nivel.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Tipo de raqueta, talla/largo y nivel.",
            },
            {
              q: "¿Cuerdas / tensión?",
              a: "Anota en el checklist si importa.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre marcos rotos y fundas faltantes — no garantía de cuerda.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de suscripción de raquetas.",
            },
          ],
        },
        "Skating": {
          title: "Patinaje — tipo, talla, nivel",
          summary: "Inline, hielo, quad y tablas congelan el tipo.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Tipo de patín, talla y nivel.",
            },
            {
              q: "¿Protecciones / casco?",
              a: "Declara en el checklist — no asumas inclusión.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre trucks rotos y ruedas faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de skate shop.",
            },
          ],
        },
        "Fishing Gear": {
          title: "Pesca — clase de caña",
          summary: "Clase de caña/carrete más talla y nivel.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Clase de caña/equipo, talla y nivel.",
            },
            {
              q: "¿Incluye señuelos?",
              a: "Lista señuelos y redes en el checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre cañas rotas y carretes faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de marca de pesca.",
            },
          ],
        },
        "Competition Gear": {
          title: "Competición — clase deportiva",
          summary: "Clase pista/campo/cancha congela la intención del estante.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Clase de competición, talla y nivel.",
            },
            {
              q: "¿Legal para la prueba?",
              a: "El anfitrión declara la clase — el renter confirma reglas aparte.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre implementos dañados y pesos faltantes.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de federación.",
            },
          ],
        },
        "Coaching Equipment": {
          title: "Entrenamiento — tipo de ayuda",
          summary: "Conos, carros y agility congelan el tipo.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Tipo de ayuda de coaching, conteo y nivel.",
            },
            {
              q: "¿Cuántas piezas?",
              a: "Pon conteos en el checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre conos faltantes y vallas dañadas.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de vendors de coaching.",
            },
          ],
        },
        "Timing Systems": {
          title: "Cronometraje — tipo de sistema",
          summary: "Relojes, chips y photo-finish congelan el tipo.",
          qa: [
            {
              q: "¿Qué puertas aplican?",
              a: "Tipo de cronometraje, notas de energía y nivel.",
            },
            {
              q: "¿Energía / setup?",
              a: "Declara en el checklist.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre sensores faltantes — no seguro de resultados.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de vendors de timing.",
            },
          ],
        },
        "Team Sports Gear": {
          title: "Equipo de equipo — banda + inventario",
          summary: "Balones, porterías y protección congelan banda e inventario.",
          qa: [
            {
              q: "¿Qué debe listarse?",
              a: "Banda de kit, talla, nivel y checklist de inventario.",
            },
            {
              q: "¿Por qué inventario?",
              a: "Las bolsas de equipo pierden piezas — congela antes del unlock.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre balones y redes faltantes según la lista.",
            },
            {
              q: "¿Promo partner?",
              a: "Sin hard-sell de team store.",
            },
          ],
        },
        "Other": {
          title: "Sports other — reubica si cabe un estante",
          summary: "Catch-all aún publica tipo e inventario.",
          qa: [
            {
              q: "¿Cuándo Other?",
              a: "Solo si no cabe un estante Sports con nombre.",
            },
            {
              q: "¿Qué puertas?",
              a: "sportsOtherKind más checklist, talla y nivel.",
            },
            {
              q: "¿Reubicar?",
              a: "A Snow, Water, Racket, Skating, Fishing, Team o estantes pro.",
            },
            {
              q: "¿Depósito?",
              a: "Cubre piezas faltantes según el checklist.",
            },
          ],
        },
      },
    "Photo & Video": {
        "Camera Kits": {
          title: "Camera kits \u2014 sensor, media, kit list",
          summary: "Bodies and kits freeze sensor/mount, media policy, and inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Model, kit class, sensor/mount, media include, and kit inventory items/checklist.",
            },
            {
              q: "Body only vs full kit?",
              a: "kitIncludes freezes body-only, kit lens, full kit, or accessories-only.",
            },
            {
              q: "Deposit?",
              a: "Covers drops and missing batteries/chargers/cards against the list.",
            },
            {
              q: "Partner promo?",
              a: "No retailer affiliate hard-sell.",
            },
          ],
        },
        "Action Cameras": {
          title: "Action cameras \u2014 mount, media, sensor",
          summary: "Action cams freeze sensor class, media, and mounts in the kit list.",
          qa: [
            {
              q: "What must be listed?",
              a: "Model, kit class, sensor/mount band, media policy, and inventory for mounts/batteries.",
            },
            {
              q: "Waterproof housing?",
              a: "Disclose in kit checklist \u2014 assume not included unless listed.",
            },
            {
              q: "Media?",
              a: "Hosts mark cards included, partial, renter brings, or internal-only.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked housings and missing mounts.",
            },
          ],
        },
        "Tripods & Mounts": {
          title: "Tripods \u2014 payload, head type",
          summary: "Supports freeze payload band and head type before rent.",
          qa: [
            {
              q: "What gates apply?",
              a: "Payload band, head type, kit class, and inventory for plates/spreaders.",
            },
            {
              q: "Will it hold my camera?",
              a: "Payload band is the host\u2019s rated class \u2014 not a lab certification.",
            },
            {
              q: "Head included?",
              a: "Hosts mark ball, pan-tilt, fluid, gimbal head, legs-only, or other.",
            },
            {
              q: "Deposit?",
              a: "Covers bent legs and missing plates.",
            },
          ],
        },
        "Basic Lighting": {
          title: "Basic lighting \u2014 class, power",
          summary: "LED/flash kits freeze lighting class and power source.",
          qa: [
            {
              q: "What must be listed?",
              a: "Lighting class, power source, kit class, and stands/modifiers in inventory.",
            },
            {
              q: "Battery or AC?",
              a: "Power source freezes AC, battery, both, or passive modifiers only.",
            },
            {
              q: "Deposit?",
              a: "Covers broken mounts and missing softboxes \u2014 not lamp life insurance.",
            },
            {
              q: "Partner promo?",
              a: "No lighting-vendor affiliate hard-sell.",
            },
          ],
        },
        "Drones": {
          title: "Drones \u2014 weight class, Remote ID",
          summary: "Drone rentals freeze FAA-style weight class and Remote ID hardware status.",
          qa: [
            {
              q: "What gates apply?",
              a: "Weight class and Remote ID (built-in, add-on, or under-250g exempt). Exempt requires under-250g weight.",
            },
            {
              q: "Pilot license?",
              a: "Follow local law \u2014 Evorios freezes Remote ID facts; it does not issue certificates.",
            },
            {
              q: "Kit?",
              a: "Batteries, props, and controllers belong on the kit inventory.",
            },
            {
              q: "Partner promo?",
              a: "No drone-insurance affiliate hard-sell.",
            },
          ],
        },
        "Cinema Cameras": {
          title: "Cinema cameras \u2014 sensor, media",
          summary: "Cinema bodies freeze sensor class and media policy plus kit inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Sensor/mount class, media include, kit class, and full inventory for cages/batteries.",
            },
            {
              q: "Who brings media?",
              a: "Media field freezes included vs renter-provided cinema media.",
            },
            {
              q: "Deposit?",
              a: "High-value deposit covers body and missing modules \u2014 not production insurance.",
            },
            {
              q: "Partner promo?",
              a: "No cinema-rental-house affiliate hard-sell.",
            },
          ],
        },
        "Professional Lenses": {
          title: "Lenses \u2014 mount, focal band",
          summary: "Lenses freeze mount and focal class before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Mount type, focal band, model, and caps/hoods in kit inventory.",
            },
            {
              q: "Will it fit my body?",
              a: "Mount field is the gate \u2014 adapters only if listed in the kit.",
            },
            {
              q: "Deposit?",
              a: "Covers glass damage and missing caps \u2014 fungus disclosure belongs in notes.",
            },
            {
              q: "Partner promo?",
              a: "No lens-subscription affiliate hard-sell.",
            },
          ],
        },
        "Studio Lighting": {
          title: "Studio lighting \u2014 class, power",
          summary: "Studio lights freeze class and power like basic lighting with heavier kits.",
          qa: [
            {
              q: "What gates apply?",
              a: "Lighting class, power source, kit class, and inventory for stands/c-stands.",
            },
            {
              q: "HMI / Fresnel?",
              a: "Class field includes HMI/Fresnel \u2014 confirm power needs before pickup.",
            },
            {
              q: "Deposit?",
              a: "Covers heads and modifiers; bulbs disclosed separately in notes.",
            },
            {
              q: "Partner promo?",
              a: "No studio-expendables affiliate hard-sell.",
            },
          ],
        },
        "Stabilizers & Rigs": {
          title: "Stabilizers \u2014 type, payload",
          summary: "Gimbals and rigs freeze type and payload band.",
          qa: [
            {
              q: "What must be listed?",
              a: "Stabilizer type, payload band, kit class, and batteries/cages in inventory.",
            },
            {
              q: "Payload?",
              a: "Payload band is host-rated \u2014 balance and tune at handoff.",
            },
            {
              q: "Deposit?",
              a: "Covers motors and missing batteries/chargers.",
            },
            {
              q: "Partner promo?",
              a: "No gimbal-brand affiliate hard-sell.",
            },
          ],
        },
        "Broadcast Gear": {
          title: "Broadcast \u2014 subtype, media",
          summary: "Switchers and encoders freeze subtype and media/capture policy.",
          qa: [
            {
              q: "What gates apply?",
              a: "Broadcast subtype, media include, kit class, and I/O cables in inventory.",
            },
            {
              q: "Switcher vs encoder?",
              a: "Subtype stops wrong-box bookings for livestream days.",
            },
            {
              q: "Deposit?",
              a: "Covers ports and missing SDI/HDMI kits.",
            },
            {
              q: "Partner promo?",
              a: "No broadcast-integrator affiliate hard-sell.",
            },
          ],
        },
        "Other": {
          title: "Photo other \u2014 re-shelf when named fits",
          summary: "Catch-all still publishes kind and kit inventory.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Photo shelf fits.",
            },
            {
              q: "What gates publish?",
              a: "Kind, model, kit class, and kit inventory checklist.",
            },
            {
              q: "Re-shelf?",
              a: "Move to Camera Kits, Action, Tripods, Lighting, Drones, Cinema, Lenses, Stabilizers, or Broadcast when those gates fit.",
            },
            {
              q: "Essays or promo?",
              a: "No vague essays and no gear-affiliate hard-sell.",
            },
          ],
        },
      },
    "Office & Business": {
        "Printers": {
          title: "Printers \u2014 tech, paper, ink, storage wipe",
          summary: "Office printers rent cleanly when tech, paper size, ink/toner, and storage/wipe are frozen.",
          qa: [
            {
              q: "What gates apply?",
              a: "Brand, model, printer tech, paper size, ink/toner include, storage status, and wipe plan when storage is present.",
            },
            {
              q: "Is ink included?",
              a: "Hosts mark ink/toner included, partial, renter provides, or unknown\u2014assume nothing ships full unless listed.",
            },
            {
              q: "Do printers need a wipe?",
              a: "Yes when the unit has onboard storage or accounts. Host declares wipe-before-list, wipe-at-handoff, or renter-responsible.",
            },
            {
              q: "Deposit?",
              a: "Covers jams beyond fair wear, missing trays/cables, and physical damage\u2014not print-quality insurance.",
            },
          ],
        },
        "Monitors & Displays": {
          title: "Monitors \u2014 size, panel, inputs",
          summary: "Displays need size, panel, and input/cable kit before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Size band, panel type, inputs/cables, storage status (usually no), and a kit checklist for stands/adapters.",
            },
            {
              q: "Are cables included?",
              a: "Input kit freezes HDMI-only through multi-input kits\u2014do not assume a dock ships.",
            },
            {
              q: "Wipe?",
              a: "Only if the display stores accounts or schedules; most panels are no_storage.",
            },
            {
              q: "Partner promo?",
              a: "No monitor-affiliate hard-sell.",
            },
          ],
        },
        "Webcams & Streaming": {
          title: "Webcams \u2014 resolution, mic, wipe",
          summary: "Streaming cams freeze resolution, mic include, and storage/wipe when accounts remain.",
          qa: [
            {
              q: "What gates apply?",
              a: "Resolution band, mic include, storage status, wipe when storage/accounts, and kit list for mounts/cables.",
            },
            {
              q: "Built-in mic?",
              a: "Hosts mark built-in, none, or external mic kit.",
            },
            {
              q: "Accounts?",
              a: "If the cam stays linked to a host account, mark storage and publish a wipe/unlink plan.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked housings and missing mounts\u2014not stream-quality guarantees.",
            },
          ],
        },
        "Office Furniture": {
          title: "Office furniture \u2014 type, size, condition",
          summary: "Desks and chairs skip device wipe; freeze type, size/seats, and condition.",
          qa: [
            {
              q: "What gates apply?",
              a: "Furniture type, size/seat band, and condition grade. No device storage wipe on this shelf.",
            },
            {
              q: "Assembly?",
              a: "Publish what ships assembled vs flat-pack in notes/kit list. Deposit covers missing hardware.",
            },
            {
              q: "Data wipe?",
              a: "Not required for furniture\u2014use Printers/POS/Servers for devices with storage.",
            },
            {
              q: "Partner promo?",
              a: "No office-furniture affiliate hard-sell.",
            },
          ],
        },
        "Presentation Gear": {
          title: "Presentation \u2014 device, lumens/size, cables",
          summary: "Projectors and screens freeze device type, brightness/size, and storage/wipe when networked.",
          qa: [
            {
              q: "What must be listed?",
              a: "Device type, lumens or screen size, storage status, wipe when applicable, and cable/remote kit.",
            },
            {
              q: "Lamp / bulb?",
              a: "Disclose remaining lamp life in notes when known. Deposit is not a free lamp replacement plan.",
            },
            {
              q: "Wipe?",
              a: "Networked conference displays with accounts need storage + wipe status.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked screens, missing remotes/cables, and drop damage.",
            },
          ],
        },
        "Large Format Printers": {
          title: "Large format \u2014 width, ink class, wipe",
          summary: "Plotters need max width, ink class, ink include, and wipe when jobs are stored.",
          qa: [
            {
              q: "What gates apply?",
              a: "Max media width, ink class, ink/toner include, storage + wipe, and kit inventory for stands/roll holders.",
            },
            {
              q: "Who brings media?",
              a: "Assume renter brings rolls unless the kit list says media is included.",
            },
            {
              q: "Wipe?",
              a: "Required when onboard storage holds jobs\u2014host wipe plan freezes before booking.",
            },
            {
              q: "Partner promo?",
              a: "No plotter-lease affiliate hard-sell.",
            },
          ],
        },
        "POS Systems": {
          title: "POS \u2014 terminal, payments, wipe",
          summary: "POS rentals freeze terminal type, payment readiness, and a wipe plan for stored credentials.",
          qa: [
            {
              q: "What must be listed?",
              a: "POS type, payment readiness, storage status, wipe plan, and kit list for drawers/readers/cables.",
            },
            {
              q: "Who provides the card reader?",
              a: "Reader included, software-only, renter brings reader, or cash-only kit.",
            },
            {
              q: "Wipe required?",
              a: "Yes when storage is present or unknown\u2014POS holds merchant credentials. Host wipe status is required.",
            },
            {
              q: "Cyber cover?",
              a: "Evorios does not sell cyber insurance\u2014wipe attestation is the privacy layer.",
            },
          ],
        },
        "Commercial Copiers": {
          title: "Copiers \u2014 duty, finishers, wipe",
          summary: "Commercial copiers freeze duty class, finishers, ink, and wipe for stored jobs.",
          qa: [
            {
              q: "What gates apply?",
              a: "Duty band, finishers, ink/toner include, storage + wipe, and move notes in the kit list.",
            },
            {
              q: "Finisher?",
              a: "Hosts mark stapler finisher, booklet, none, or unknown.",
            },
            {
              q: "Wipe?",
              a: "Copiers with hard disks need wipe-before-list, wipe-at-handoff, or renter-responsible.",
            },
            {
              q: "Deposit?",
              a: "Covers panels, trays, and finishers\u2014not print SLA insurance.",
            },
          ],
        },
        "Conference Systems": {
          title: "Conference \u2014 system, seats, wipe",
          summary: "Room kits freeze system type, seat band, and wipe when accounts remain linked.",
          qa: [
            {
              q: "What must be listed?",
              a: "System type, seat/room band, storage status, wipe when accounts exist, and mic/cam kit list.",
            },
            {
              q: "Room size fit?",
              a: "Seat band (huddle through hall) sets expectation\u2014do not book a huddle kit for a 20-person room.",
            },
            {
              q: "Accounts?",
              a: "Zoom/Teams room logins count as storage\u2014publish unlink/wipe status.",
            },
            {
              q: "Partner promo?",
              a: "No conference-vendor affiliate hard-sell.",
            },
          ],
        },
        "Server Equipment": {
          title: "Servers \u2014 form factor, wipe, rack notes",
          summary: "Servers and NAS always need a wipe plan plus form factor and rack/power notes.",
          qa: [
            {
              q: "What gates apply?",
              a: "Form factor, storage status, required wipe plan, and recommended rack/power notes plus kit inventory.",
            },
            {
              q: "Is wipe optional?",
              a: "No\u2014server shelves require wipe-before-list, wipe-at-handoff, or renter-responsible before publish.",
            },
            {
              q: "Rack rails?",
              a: "Publish rails/PDU/network needs in rack notes. Deposit is not a free install tech.",
            },
            {
              q: "Cyber cover?",
              a: "Platform does not insure data loss\u2014wipe attestation is mandatory.",
            },
          ],
        },
        "Other": {
          title: "Office other \u2014 re-shelf when named fits",
          summary: "Catch-all still publishes kind, storage/wipe when needed, and kit list.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Office shelf fits. Named shelves carry wipe, size, or duty gates renters expect.",
            },
            {
              q: "What still gates publish?",
              a: "Kind, model, storage/wipe for devices, and kit inventory (except pure furniture kinds).",
            },
            {
              q: "Re-shelf?",
              a: "Move to Printers, Monitors, Webcams, Furniture, Presentation, Large Format, POS, Copiers, Conference, or Servers when those gates fit.",
            },
            {
              q: "Essays or promo?",
              a: "No vague essays and no office-supply affiliate hard-sell.",
            },
          ],
        },
      },
    "Music & Audio": {
        "Guitars & Bass": {
          title: "Guitarras y bajos \u2014 tipo, estuche, cuerdas, cable",
          summary: "Las guitarras peer se alquilan bien con tipo, estuche, estado de cuerdas, cable y checklist congelados con serie y dep\u00f3sito.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Alquiler congela marca, modelo, serie, tipo, estuche, cuerdas, cable y checklist (correa, p\u00faas, capo).",
            },
            {
              q: "\u00bfEstuche duro o gig bag?",
              a: "El anfitri\u00f3n marca duro, blando, flight case, sin estuche o add-on. No asumas protecci\u00f3n.",
            },
            {
              q: "\u00bfQui\u00e9n lleva el cable?",
              a: "Incluido, no incluido, solo wireless, o preguntar en la entrega.",
            },
            {
              q: "\u00bfEstado de las cuerdas?",
              a: "Nuevas, buenas, gastadas o preguntar. No es servicio de cambio de cuerdas.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Cubre da\u00f1os al cuerpo, estuche/cable faltante y hardware roto. Evorios no vende seguro de guitarra.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Salvo listado: amp, pedales, cambio de cuerdas, clases y afiliado Guitar Center / Sweetwater.",
            },
          ],
        },
        "Keyboards": {
          title: "Teclados \u2014 tipo, teclas, soporte, potencia",
          summary: "Pianos digitales y synths necesitan tipo, n\u00famero de teclas, soporte/pedales, potencia, estuche y checklist.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, tipo, teclas, soporte/pedales, potencia, estuche y checklist.",
            },
            {
              q: "\u00bf88 teclas vs compacto?",
              a: "La franja de teclas (25\u201388) define el uso. Un controller no es un piano pesado.",
            },
            {
              q: "\u00bfSoporte y pedales incluidos?",
              a: "Ambos, solo soporte, solo pedales, ninguno, o consola integrada.",
            },
            {
              q: "\u00bfClase de potencia?",
              a: "Menos de 50 W hasta 1000 W+ o pasivo. Confirma enchufe antes del evento.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Pedales, soportes y fuentes faltantes van al dep\u00f3sito.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Banco salvo listado, licencia DAW, afiliado retail.",
            },
          ],
        },
        "Drums": {
          title: "Bater\u00edas \u2014 forma, piezas, herrajes",
          summary: "Kits ac\u00fasticos y e-kits necesitan forma, conteo, herrajes e inventario de platillos y stands.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, forma, piezas, herrajes y checklist de cada tambor, platillo y stand.",
            },
            {
              q: "\u00bfKit completo o pieza?",
              a: "Forma separa kit ac\u00fastico, e-kit, solo caja, pack de platillos, solo herrajes, percusi\u00f3n o otro.",
            },
            {
              q: "\u00bfHerrajes incluidos?",
              a: "Completos+trono+pedales, solo stands, solo pedales, ninguno o rack e-kit.",
            },
            {
              q: "\u00bfPor qu\u00e9 el checklist?",
              a: "Platillos y clamps se pierden tras bolos. Confirma al reservar; cuenta en entrega y devoluci\u00f3n.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Cascos rotos, platillos faltantes y stands doblados van al dep\u00f3sito.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin crew de cartage, sin afiliado practice-pad, sin suscripci\u00f3n de parches mesh.",
            },
          ],
        },
        "Portable Speakers": {
          title: "Altavoces port\u00e1tiles \u2014 forma, energ\u00eda, splash, carga",
          summary: "Bluetooth/party de consumo necesitan forma, energ\u00eda, franja outdoor/splash y regla de carga \u2014 no PA de escenario.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, forma, potencia, bater\u00eda vs AC, splash, carga al devolver y checklist.",
            },
            {
              q: "\u00bfEs PA Systems?",
              a: "No. Portable Speakers es consumo/fiesta. Stacks de escenario van en PA Systems.",
            },
            {
              q: "\u00bfBater\u00eda o AC?",
              a: "Solo bater\u00eda, solo AC, dual o pasivo. Reglas de carga aplican a bater\u00eda.",
            },
            {
              q: "\u00bfExterior / splash?",
              a: "Solo interior, patio cubierto OK, resistente a splash, o mantener seco.",
            },
            {
              q: "\u00bfVolumen a vecinos?",
              a: "El anfitri\u00f3n puede a\u00f1adir nota suave de horario. Evorios no certifica HOA.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin Geek Squad, sin upsell Fat Llama PA, sin wattage de estante PA.",
            },
          ],
        },
        "Microphones": {
          title: "Micr\u00f3fonos \u2014 tipo, phantom, cable, higiene",
          summary: "Los mics necesitan tipo, 48V, clip/cable, estuche, higiene de rejilla y serie.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, tipo, phantom, clip/cable, estuche, higiene y checklist.",
            },
            {
              q: "\u00bfNecesito phantom 48V?",
              a: "S\u00ed / no / opcional / mic a bater\u00eda / preguntar. Condensadores sin phantom no pasan audio.",
            },
            {
              q: "\u00bfCable y clip?",
              a: "XLR+clip, solo cable, solo clip, kit wireless, o los aporta el inquilino.",
            },
            {
              q: "\u00bfHigiene de rejilla?",
              a: "Limpiar antes de devolver, anfitri\u00f3n sanitiza, funda desechable, o sin contacto bucal.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Rejillas dobladas, clips/cables faltantes y humedad fuera de pol\u00edtica van al dep\u00f3sito.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin afiliado Sweetwater, sin coach vocal, sin coordinaci\u00f3n de frecuencias.",
            },
          ],
        },
        "Amplifiers": {
          title: "Amplificadores \u2014 forma, v\u00e1lvulas/SS, bafle, potencia",
          summary: "Combos y heads necesitan forma, v\u00e1lvulas vs SS, bafle, potencia y checklist de cables.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, forma, v\u00e1lvulas/SS/modeling, bafle, potencia y checklist.",
            },
            {
              q: "\u00bfCombo vs head/cab?",
              a: "Los campos dicen si viaja el bafle. Un head sin cab necesita el tuyo.",
            },
            {
              q: "\u00bfV\u00e1lvulas vs SS?",
              a: "Las v\u00e1lvulas necesitan calentamiento y traslado cuidadoso; modeling es digital.",
            },
            {
              q: "\u00bfClase de potencia?",
              a: "Ajusta al local y vecinos. Pasivo necesita ruta de altavoz externa.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Combos ca\u00eddos, footswitches faltantes y v\u00e1lvulas quemadas por mal uso van al dep\u00f3sito.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin ajuste de bias, sin suscripci\u00f3n de v\u00e1lvulas, sin afiliado Guitar Center.",
            },
          ],
        },
        "Mixing Consoles": {
          title: "Mesas de mezcla \u2014 canales, powered, phantom",
          summary: "Mezcladoras en vivo necesitan franja de canales, powered vs no, phantom, potencia y loom de cables.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, canales, powered/unpowered, phantom, potencia y checklist de snakes/XLR.",
            },
            {
              q: "\u00bfCu\u00e1ntos canales?",
              a: "Menos de 8 hasta 32+ o mezcladora digital de escenas.",
            },
            {
              q: "\u00bfMixer powered?",
              a: "Powered alimenta altavoces; unpowered necesita altavoces activos o amps.",
            },
            {
              q: "\u00bfPhantom?",
              a: "El campo cubre expectativas de 48V para condensadores.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Snakes y cables de corriente faltantes van al dep\u00f3sito.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin ingeniero FOH, sin dise\u00f1o Dante, sin afiliado Sweetwater install.",
            },
          ],
        },
        "Studio Monitors": {
          title: "Monitores de estudio \u2014 par, soportes, potencia",
          summary: "Nearfields necesitan estado de par, soportes/pads, potencia y checklist de cables.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, franja de par, soportes/pads, potencia y checklist.",
            },
            {
              q: "\u00bfUno o par?",
              a: "Uno, par emparejado, 2.1+sub, surround o preguntar.",
            },
            {
              q: "\u00bfSoportes incluidos?",
              a: "Soportes, solo pads de aislamiento, no incluidos, o nearfield de escritorio N/A.",
            },
            {
              q: "\u00bfClase de potencia?",
              a: "Activos necesitan enchufe; pasivos necesitan amplificaci\u00f3n.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Falta de la pareja, soportes o fuentes van al dep\u00f3sito.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin tratamiento ac\u00fastico, sin calibraci\u00f3n, sin afiliado retail.",
            },
          ],
        },
        "PA Systems": {
          title: "Sistemas PA \u2014 altavoces, mixer, cables, outdoor",
          summary: "PA de escenario necesita conteo de cajas, mixer, pol\u00edtica outdoor, potencia e inventario obligatorio de cables/soportes.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, potencia, conteo de cajas, mixer, outdoor e inventario obligatorio de cables/soportes.",
            },
            {
              q: "\u00bfPor qu\u00e9 inventario de cables/soportes?",
              a: "XLR, Speakon, soportes y distro se pierden tras eventos. Se congela al reservar y se cuenta en entrega/devoluci\u00f3n.",
            },
            {
              q: "\u00bfMixer incluido?",
              a: "S\u00ed, no, solo altavoces activos, o preguntar en la entrega.",
            },
            {
              q: "\u00bfUso outdoor?",
              a: "Solo interior, outdoor cubierto OK, outdoor completo (riesgo clima), o el anfitri\u00f3n lo define en la entrega.",
            },
            {
              q: "\u00bfPortable Speakers vs PA?",
              a: "Bluetooth de fiesta queda en Portable Speakers. Stacks con cables quedan aqu\u00ed.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin labor FOH, sin permiso de ruido, sin promo United Rentals / Fat Llama PA.",
            },
          ],
        },
        "Recording Gear": {
          title: "Equipo de grabaci\u00f3n \u2014 tipo, I/O, phantom, estuche",
          summary: "Interfaces y grabadoras necesitan tipo, I/O, phantom, estuche, potencia y loom \u2014 estante Music, no rename de Electronics Pro Audio.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Marca, modelo, serie, tipo, I/O, phantom, estuche, potencia y checklist.",
            },
            {
              q: "\u00bfInterface vs grabadora?",
              a: "Tipo separa interface, preamp, field recorder, controller MIDI/DAW, bundle mic+pre, FX outboard u otro.",
            },
            {
              q: "\u00bfCu\u00e1ntas entradas?",
              a: "Franja I/O (2\u00d72 a 8+) define el fit. Not-an-interface cubre controllers y FX.",
            },
            {
              q: "\u00bfPhantom y cables?",
              a: "Campo phantom m\u00e1s checklist USB/Thunderbolt/XLR. Loom faltante va al dep\u00f3sito.",
            },
            {
              q: "\u00bfElectronics Pro Audio?",
              a: "La captura de estudio tambi\u00e9n existe en Electronics. Mant\u00e9n Recording Gear en Music; no mezcles wattage PA.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin licencia DAW, sin afiliado Sweetwater, sin ingeniero de sesi\u00f3n.",
            },
          ],
        },
        "Other": {
          title: "Otros \u2014 elige primero un estante Music con nombre",
          summary: "Prefiere Guitars, Keyboards, Drums, Speakers, Mics, Amps, Mixers, Monitors, PA o Recording. Other igual exige kind, serie y kit multipieza.",
          qa: [
            {
              q: "\u00bfDebo usar Other?",
              a: "Reubica cuando un estante Music con nombre encaje para aplicar las puertas correctas de potencia, phantom, inventario PA o estuche.",
            },
            {
              q: "\u00bfQu\u00e9 significa kind?",
              a: "Instrumento, live sound, estudio, accesorio cable/soporte, kit mixto, o preferir estante con nombre.",
            },
            {
              q: "\u00bfSerie y kit?",
              a: "Serie es obligatoria en la categor\u00eda. Kits multipieza necesitan checklist.",
            },
            {
              q: "\u00bfClase de potencia?",
              a: "Si va con corriente, prefiere un estante con powerBand obligatorio \u2014 o decl\u00e1ralo en la descripci\u00f3n.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Fotos + inventario + serie sostienen reclamaciones.",
            },
            {
              q: "\u00bfQu\u00e9 no est\u00e1 incluido?",
              a: "Sin afiliado retail, sin seguro de backline, sin labor de stage tech.",
            },
          ],
        },
      },
    "Home & Kitchen": {
        "Coffee Makers": {
          title: "Cafeteras \u2014 tipo, tanque, filtros",
          summary: "Respuestas cortas para drip, espresso y c\u00e1psulas.",
          qa: [
            {
              q: "\u00bfQu\u00e9 debe listar el anfitri\u00f3n?",
              a: "Tipo, dep\u00f3sito, jarra/canasta, pol\u00edtica de filtros/c\u00e1psulas, capacidad y reglas de devoluci\u00f3n limpia. Los combos necesitan inventario.",
            },
            {
              q: "\u00bfQui\u00e9n lleva filtros o c\u00e1psulas?",
              a: "El anuncio fija filtros incluidos, reutilizable, del inquilino o c\u00e1psulas aparte.",
            },
            {
              q: "\u00bfQu\u00e9 tan limpio al devolver?",
              a: "Sigue la pol\u00edtica \u2014 lavar/secar, enjuagar, sanitiza el anfitri\u00f3n, o solo vaciar.",
            },
            {
              q: "\u00bfPromo de partner?",
              a: "No \u2014 sin hard-sell de clubes de caf\u00e9 o c\u00e1psulas.",
            },
          ],
        },
        "Baking Equipment": {
          title: "Horneado \u2014 piezas, temperatura, sanitizar",
          summary: "Respuestas cortas para bandejas, moldes y kits.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas aplican?",
              a: "Tipo de kit, piezas, temp. de horno, material, sanitizaci\u00f3n de contacto con alimentos y devoluci\u00f3n limpia. Kits multipieza necesitan inventario.",
            },
            {
              q: "\u00bfEs apto para horno?",
              a: "El anfitri\u00f3n publica la banda, incluso broiler-safe o no apto.",
            },
            {
              q: "\u00bfSanitizar?",
              a: "Superficies en contacto con alimentos deben estar atestiguadas antes de la entrega.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Cubre deformaci\u00f3n, piezas faltantes y da\u00f1o antiadherente m\u00e1s all\u00e1 del desgaste justo.",
            },
          ],
        },
        "Stand Mixers": {
          title: "Batidoras de pie \u2014 bowl, accesorios, potencia",
          summary: "Respuestas cortas para tilt-head y bowl-lift.",
          qa: [
            {
              q: "\u00bfQu\u00e9 listar?",
              a: "Capacidad del bowl, kit de accesorios, vatios, tilt vs bowl-lift, sanitizaci\u00f3n y devoluci\u00f3n limpia.",
            },
            {
              q: "\u00bfAccesorios incluidos?",
              a: "Desde solo batidor hasta kit completo \u2014 kits ricos necesitan checklist.",
            },
            {
              q: "\u00bfContacto con alimentos?",
              a: "El anfitri\u00f3n atestigua bowls y batidores sanitizados antes de la entrega.",
            },
            {
              q: "\u00bfPromo?",
              a: "Sin affiliate KitchenAid ni upsell de garant\u00eda.",
            },
          ],
        },
        "Blenders & Juicers": {
          title: "Licuadoras y exprimidores \u2014 jarra, cuchillas, vatios",
          summary: "Respuestas cortas para mesa, inmersi\u00f3n y jugos.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas?",
              a: "Tipo, material de jarra, kit de cuchillas/discos, potencia, sanitizaci\u00f3n y devoluci\u00f3n.",
            },
            {
              q: "\u00bfQui\u00e9n aporta discos?",
              a: "Cuchilla, cuchilla+discos, inquilino, o sellado \u2014 kits de discos necesitan inventario.",
            },
            {
              q: "\u00bfDevoluci\u00f3n limpia?",
              a: "Lavar/enjuagar seg\u00fan pol\u00edtica; sanitizaci\u00f3n atestiguada en la entrega.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Cubre jarras rotas, cuchillas/discos faltantes y abuso del motor.",
            },
          ],
        },
        "Cleaning Appliances": {
          title: "Limpieza \u2014 tipo, tanques, filtros",
          summary: "Respuestas cortas para aspiradoras, alfombras y vapor.",
          qa: [
            {
              q: "\u00bfQu\u00e9 listar?",
              a: "Tipo, energ\u00eda, bolsa/tanque, filtro, vaciado, capacidad y devoluci\u00f3n limpia.",
            },
            {
              q: "\u00bfDebo vaciar?",
              a: "La pol\u00edtica dice inquilino, anfitri\u00f3n, o no aplica.",
            },
            {
              q: "\u00bfFiltros?",
              a: "HEPA, est\u00e1ndar, lavable, o no incluido.",
            },
            {
              q: "\u00bfSanitizar alimentos?",
              a: "No aplica a limpieza \u2014 s\u00ed vaciar y devolver limpio.",
            },
          ],
        },
        "Commercial Coffee": {
          title: "Caf\u00e9 comercial \u2014 voltaje, NSF, instalaci\u00f3n",
          summary: "Respuestas cortas para sistemas de caf\u00e9 y eventos.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas P0?",
              a: "Voltaje, NSF, instalaci\u00f3n, tipo, ablandador, clase de servicio, inventario, capacidad y devoluci\u00f3n.",
            },
            {
              q: "\u00bfPor qu\u00e9 voltaje y agua?",
              a: "Voltaje incorrecto o falta de agua falla el servicio \u2014 queda en el acuerdo.",
            },
            {
              q: "\u00bfEvorios certifica NSF?",
              a: "No \u2014 el anfitri\u00f3n declara NSF; nosotros no certificamos.",
            },
            {
              q: "\u00bfPromo?",
              a: "Sin hard-sell de financiamiento de equipo de caf\u00e9.",
            },
          ],
        },
        "Catering Equipment": {
          title: "Catering en casa \u2014 invitados, calor, sanitizar",
          summary: "Respuestas cortas para chafers, cambros y servicio.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas?",
              a: "Tipo, capacidad de invitados, m\u00e9todo de calor, energ\u00eda, NSF, doble sanitizaci\u00f3n, inventario y devoluci\u00f3n.",
            },
            {
              q: "\u00bfSterno vs el\u00e9ctrico?",
              a: "El m\u00e9todo fija sterno, el\u00e9ctrico, aislado, fr\u00edo o mixto.",
            },
            {
              q: "\u00bfSanitizar?",
              a: "Contacto con alimentos y catering deben atestiguarse antes de la entrega.",
            },
            {
              q: "\u00bfParty vs Home?",
              a: "AV/decor de evento en Party; chafers/cambros aqu\u00ed cuando es catering de cocina.",
            },
          ],
        },
        "Industrial Mixers": {
          title: "Batidoras industriales \u2014 bowl, fase, NSF",
          summary: "Respuestas cortas para planetarias y espirales.",
          qa: [
            {
              q: "\u00bfQu\u00e9 listar?",
              a: "Cuartos del bowl, estilo, fase, voltaje, NSF, sanitizaci\u00f3n, inventario, capacidad, devoluci\u00f3n y notas de traslado.",
            },
            {
              q: "\u00bfMono vs trif\u00e1sica?",
              a: "Fase y voltaje deben coincidir con el sitio antes de la entrega.",
            },
            {
              q: "\u00bfTraslado?",
              a: "Publica peso/puerta/elevador \u2014 no es pickup de porche.",
            },
            {
              q: "\u00bfPromo?",
              a: "Sin affiliate de leasing de panader\u00eda.",
            },
          ],
        },
        "Food Processors Pro": {
          title: "Procesadores pro \u2014 bowl, alimentaci\u00f3n, discos",
          summary: "Respuestas cortas para batch y continuous-feed.",
          qa: [
            {
              q: "\u00bfQu\u00e9 puertas?",
              a: "Capacidad, tipo de alimentaci\u00f3n, kit de discos, voltaje, NSF, sanitizaci\u00f3n y devoluci\u00f3n. Sets de discos necesitan inventario.",
            },
            {
              q: "\u00bfQui\u00e9n aporta discos?",
              a: "Cuchilla b\u00e1sica, sets, o discos del inquilino.",
            },
            {
              q: "\u00bfSanitizar?",
              a: "Superficies de contacto atestiguadas antes de la entrega.",
            },
            {
              q: "\u00bfDep\u00f3sito?",
              a: "Cubre discos faltantes, bowls rotos y da\u00f1o del motor.",
            },
          ],
        },
        "Beverage Systems": {
          title: "Sistemas de bebidas \u2014 gas, plomer\u00eda, NSF",
          summary: "Respuestas cortas para kegerators, soda y torres.",
          qa: [
            {
              q: "\u00bfQu\u00e9 listar?",
              a: "Tipo, kit CO\u2082/jarabe, plomer\u00eda, voltaje, NSF, instalaci\u00f3n, sanitizaci\u00f3n, inventario, capacidad y devoluci\u00f3n.",
            },
            {
              q: "\u00bfNecesito agua y desag\u00fce?",
              a: "El estado fija aut\u00f3nomo, agua, desag\u00fce, o ambos.",
            },
            {
              q: "\u00bfGas/jarabe?",
              a: "CO\u2082, l\u00edneas de jarabe, ambos, inquilino, o no necesario.",
            },
            {
              q: "\u00bfPromo?",
              a: "Sin affiliate de proveedores de bebidas.",
            },
          ],
        },
        "Other": {
          title: "Home & kitchen otro \u2014 reubica si hay estante con nombre",
          summary: "El catch-all a\u00fan publica tipo, piezas, fotos y devoluci\u00f3n limpia.",
          qa: [
            {
              q: "\u00bfCu\u00e1ndo Other?",
              a: "Solo si no encaja un estante con nombre. Esos traen capacidad, sanitizaci\u00f3n, NSF o inventario.",
            },
            {
              q: "\u00bfQu\u00e9 a\u00fan bloquea publicar?",
              a: "Tipo, una/multipieza, checklist de fotos, capacidad, devoluci\u00f3n; multipieza necesita inventario.",
            },
            {
              q: "\u00bfReubicar?",
              a: "A Coffee, Baking, Mixers, Blenders, Cleaning, Commercial Coffee, Catering, Industrial Mixers, Processors o Beverage.",
            },
            {
              q: "\u00bfEnsayos o promo?",
              a: "Sin ensayos vagos ni hard-sell de afiliados.",
            },
          ],
        },
      },
    "Real Estate": {
        "Rooms & Spaces": {
          title: "Habitaciones y espacios — check-in, noche, baño, silencio",
          summary: "Habitaciones de corta estancia funcionan cuando check-in, pernocta, baño, horas de silencio, tamaño, ocupación, acceso y normas están congelados.",
          qa: [
            {
              q: "¿Qué requisitos hay antes de alquilar?",
              a: "El anuncio congela tamaño, ocupación máx., parking, Wi‑Fi, tipo de acceso, ventana de check-in, pernocta, baño, silencio, normas de la casa y limpieza opcional. Se exige selfie/ID al check-in.",
            },
            {
              q: "¿Se puede dormir la noche?",
              a: "El anfitrión marca noche OK, solo uso diurno, o con su aprobación. Uso diurno = sin dormir salvo acuerdo escrito.",
            },
            {
              q: "¿Hay baño incluido?",
              a: "Privado, compartido, solo medio baño, ninguno en sitio, o portátil cerca — aclara expectativas antes de reservar.",
            },
            {
              q: "¿Cuáles son las horas de silencio?",
              a: "Franja publicada (p. ej. 22:00 / 23:00 / medianoche) o normas del edificio. Las house rules añaden visitas, humo, mascotas y salida.",
            },
            {
              q: "¿Cuánto es el depósito?",
              a: "Por defecto hacia ~un mes de renta salvo que el anfitrión fije otro. La limpieza, si existe, se congela en el acuerdo.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin franquicia Airbnb Instant Book, sin producto hotelero de limpieza y sin seguro de alojamiento de Evorios.",
            },
          ],
        },
        "Garages & Storage": {
          title: "Garajes y trasteros — altura, puerta, clima, uso",
          summary: "Trasteros necesitan altura libre, ancho de puerta, clima, horario de acceso y política de uso más tamaño y normas.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela altura libre, ancho de puerta, clima, horario, política de almacenamiento, tamaño, ocupación, acceso y normas.",
            },
            {
              q: "¿Cabe mi vehículo o estanterías?",
              a: "Usa las franjas de altura y puerta. Furgones altos necesitan más altura — pregunta si es desconocida.",
            },
            {
              q: "¿Hay control climático?",
              a: "Climatizado, solo calefacción, solo frío, ambiente o desconocido. Bienes sensibles en ambiente son riesgo del inquilino.",
            },
            {
              q: "¿Qué puedo guardar?",
              a: "Puede permitir menaje, solo vehículo, sin hazmat, sin perecederos, o lista del anfitrión. Bienes prohibidos anulan reclamaciones.",
            },
            {
              q: "¿Depósito y acceso?",
              a: "Depósito ≈ un mes salvo otra cifra. El acceso se abre tras el ID de inicio — no solo con un reenvío.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin promo Neighbor/StorageMart, sin seguro de inventario de Evorios y sin vigilancia 24/7 salvo que se indique.",
            },
          ],
        },
        "Parking Spots": {
          title: "Plazas de parking — tipo, tamaño, EV, noche",
          summary: "Las plazas funcionan cuando tipo, tamaño de vehículo, carga EV, pernocta y horario se publican con las normas.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela tipo de plaza, tamaño de vehículo, EV, pernocta, horario, tamaño, tipo de acceso y normas.",
            },
            {
              q: "¿Cabe mi camioneta o van?",
              a: "Franjas: compacto → sedán/SUV → pickup → Sprinter → oversized (preguntar). Oversized necesita confirmación del anfitrión.",
            },
            {
              q: "¿Hay carga EV?",
              a: "Level 2 incluido, enchufe compartido, ninguno, o cable del inquilino. Los enchufes compartidos pueden tener normas del edificio.",
            },
            {
              q: "¿Pernocta?",
              a: "Noche OK, solo día, o aprobación del anfitrión. Las plazas diurnas deben liberarse según las normas.",
            },
            {
              q: "¿Depósito e ID?",
              a: "El depósito tiende a ~un mes de renta. Selfie/ID al inicio abre el acceso.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin affiliate SpotHero/ParkWhiz, sin defensa de multas y sin producto de facturación EV de Evorios.",
            },
          ],
        },
        "Shared Offices": {
          title: "Oficinas compartidas — escritorios, reuniones, horario, baño",
          summary: "Escritorios necesitan plazas, sala de reuniones, horario, baño y kit monitor/dock opcional con normas.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela plazas de escritorio, acceso a reuniones, horario, baño, Wi‑Fi, tamaño, ocupación, acceso, normas y kit monitor/dock recomendado.",
            },
            {
              q: "¿Cuántos escritorios?",
              a: "1, 2–4, 5–10, 11+ o hot-desk. La ocupación debe respetar el máximo publicado.",
            },
            {
              q: "¿Hay salas de reuniones?",
              a: "Incluidas, reservables con extra, ninguna, o solo open space — no asumas sala privada.",
            },
            {
              q: "¿Horario laboral vs 24/7?",
              a: "La franja fija 24/7, horario laboral, extendido, solo cita, o agenda del anfitrión.",
            },
            {
              q: "¿Depósito?",
              a: "Suele ser ~un mes de renta. Puede haber limpieza en suites privadas.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin membresía WeWork, sin SLA de IT y sin asesoría de arrendamiento comercial de Evorios.",
            },
          ],
        },
        "Backyard & Outdoor": {
          title: "Patio y exterior — luz/agua, ruido, clima, baño",
          summary: "Patios necesitan luz/agua, toque de queda de ruido, política de clima, baño, ocupación y horas de silencio con normas.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela luz/agua exterior, toque de queda, clima, baño, silencio, tamaño, ocupación, parking, acceso y normas.",
            },
            {
              q: "¿Hay luz o agua en sitio?",
              a: "Ambos, solo luz, solo agua, ninguno, o preguntar. Generador propio solo si las normas lo permiten.",
            },
            {
              q: "¿Se puede poner música?",
              a: "Puede permitir música hasta el toque, prohibir amplificación, solo reunión tranquila, normas HOA, o toque del anfitrión. Incumplir puede usar el depósito.",
            },
            {
              q: "¿Y si llueve?",
              a: "Llueva o truene, backup cubierto, cancelar/reprogramar, o decisión del anfitrión el mismo día.",
            },
            {
              q: "¿Depósito e ID?",
              a: "Depósito ≈ un mes. ID de inicio del huésped antes de desbloquear.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin upsell de seguro Peerspace, sin promo de catering y sin trámites de permiso de ruido por Evorios.",
            },
          ],
        },
        "Other": {
          title: "Inmuebles otros — declara el tipo de espacio",
          summary: "El catch-all debe declarar tipo, tamaño, ocupación, acceso y normas — usa una estantería con nombre cuando encaje.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela tipo de espacio, tamaño, ocupación máx., parking, Wi‑Fi, acceso y normas. Prefiere una estantería con nombre.",
            },
            {
              q: "¿Por qué el tipo de espacio?",
              a: "Indica si es habitación, parking/trastero, oficina, exterior, venue/estudio, almacén/retail o mixto — para no reservar el producto equivocado.",
            },
            {
              q: "¿Depósito y check-in?",
              a: "El depósito tiende a un mes. Selfie/ID al inicio antes de desbloquear.",
            },
            {
              q: "¿Tarifa de limpieza?",
              a: "Opcional; si se fija, aparece al reservar y se congela en el acuerdo.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin promo genérica tipo Airbnb y sin seguro de alojamiento de plataforma.",
            },
          ],
        },
        "Commercial Space": {
          title: "Espacio comercial — uso permitido, load-in, horario",
          summary: "Suites pro congelan uso permitido, load-in, horario, acceso a reuniones y normas con tamaño y ocupación.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela uso permitido, load-in, horario, reuniones, tamaño, ocupación, parking, Wi‑Fi, acceso y normas.",
            },
            {
              q: "¿Qué usos están permitidos?",
              a: "Oficina/admin, producción ligera, reuniones con clientes, pop-up suave, o usos listados por el anfitrión. El zoning queda en anfitrión e inquilino.",
            },
            {
              q: "¿Cómo se carga el equipo?",
              a: "Planta baja fácil, ascensor de carga, solo escaleras, muelle, o curbside — planifica el equipo antes.",
            },
            {
              q: "¿Depósito?",
              a: "Unos un mes de renta por defecto salvo otra cifra del anfitrión.",
            },
            {
              q: "¿ID del huésped?",
              a: "Sí — ID/selfie de inicio antes de desbloquear, igual que el resto de Real Estate.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin corretaje de arrendamiento comercial, sin partner de COI y sin franquicia Instant Book de oficinas.",
            },
          ],
        },
        "Event Venues": {
          title: "Venues — tipo de evento, alcohol, AV/cocina, ruido",
          summary: "Los venues necesitan tipo de evento, alcohol, AV/cocina, toque de ruido, silencio, load-in y ocupación con normas.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela tipo de evento, alcohol, AV/cocina, toque de ruido, silencio, load-in, tamaño, ocupación, parking, acceso y normas.",
            },
            {
              q: "¿Qué eventos se permiten?",
              a: "Solo reuniones, fiestas sociales, bodas/formal, film/foto, o mixto según reglas del anfitrión.",
            },
            {
              q: "¿Se permite alcohol?",
              a: "BYOB OK, solo caterer con licencia, sin alcohol, o aprobación del anfitrión. La ley local sigue aplicando.",
            },
            {
              q: "¿AV y cocina?",
              a: "Ambos, solo AV, solo cocina, sala vacía, o parcial — trae lo que falte.",
            },
            {
              q: "¿Depósito y limpieza?",
              a: "Depósito ≈ un mes. La limpieza suele aplicar tras eventos.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin affiliate Peerspace/The Knot, sin seguro de evento de Evorios y sin seguridad salvo que se liste.",
            },
          ],
        },
        "Studio Space": {
          title: "Estudio — tipo, potencia, sonido, cyc/grid",
          summary: "Estudios de contenido congelan tipo, franja de potencia, tratamiento de sonido y cyc/grid con acceso y normas.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela tipo de estudio, potencia, sonido, cyc/grid, tamaño, ocupación, Wi‑Fi, parking, acceso y normas.",
            },
            {
              q: "¿Foto, video, podcast o ensayo?",
              a: "El tipo fija expectativas. Las salas mixtas pueden no ser muy silenciosas — revisa el tratamiento de sonido.",
            },
            {
              q: "¿Qué potencia hay?",
              a: "Circuitos domésticos, 20A+ dedicados, trifásica, solo batería/generador, o pregunta la carga. Sobrecargar es riesgo del inquilino.",
            },
            {
              q: "¿Hay cyc o grid?",
              a: "Cyc y grid, solo cyc, solo pipes/grid, sala vacía, o fondo parcial.",
            },
            {
              q: "¿Depósito?",
              a: "Hacia ~un mes de renta. ID de inicio antes de desbloquear.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin promo Giggster/Peerspace, sin kit de gear salvo que se liste, y sin seguro de producción de Evorios.",
            },
          ],
        },
        "Warehouse & Storage": {
          title: "Almacén — altura, muelle, montacargas, clima",
          summary: "Los almacenes añaden muelle y política de montacargas sobre altura, puerta, clima, horario y load-in.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela altura, puerta, clima, muelle, montacargas, load-in, horario, tamaño, ocupación, acceso y normas.",
            },
            {
              q: "¿Muelle y montacargas?",
              a: "Muelle alto/bajo, drive-in, solo suelo, o muelle compartido. Montacargas puede ir con operador, solo con certificación del inquilino, ninguno, o solo traspaleta.",
            },
            {
              q: "¿Altura y puertas?",
              a: "Usa las franjas publicadas antes de traer box trucks o estanterías.",
            },
            {
              q: "¿Clima?",
              a: "Climatizado vs ambiente — protege inventario sensible.",
            },
            {
              q: "¿Depósito e ID?",
              a: "Depósito ≈ un mes. ID de inicio antes del acceso.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin affiliate Flexe, sin seguro de carga de Evorios y sin montacargas con personal salvo que se indique.",
            },
          ],
        },
        "Retail Space": {
          title: "Retail — escaparate, fixtures, load-in, horario",
          summary: "Suites retail congelan tipo de escaparate, fixtures, load-in, horario y normas con tamaño y ocupación.",
          qa: [
            {
              q: "¿Qué requisitos hay?",
              a: "El alquiler congela tipo de escaparate, fixtures, load-in, horario, tamaño, ocupación, parking, Wi‑Fi, acceso y normas.",
            },
            {
              q: "¿Qué tipo de escaparate?",
              a: "Calle, mall inline, kiosk/pop-up, suite interior, o puesto de mercado — el tráfico peatonal no está garantizado.",
            },
            {
              q: "¿Hay fixtures incluidos?",
              a: "Fixtures incluidos, solo estantería, vacío vanilla, o parcial. Cuenta lo que necesitas antes de mudarte.",
            },
            {
              q: "¿Horario?",
              a: "La franja fija cuándo puedes ocupar. Las normas del mall/edificio pueden prevalecer.",
            },
            {
              q: "¿Depósito?",
              a: "Unos un mes de renta por defecto salvo otra cifra.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin affiliate Storefront.com/Appear Here, sin promo POS y sin registro fiscal de Evorios.",
            },
          ],
        },
      },
    Vehicles: {
        "Cars & Trucks": {
          title: "FAQ alquiler de coche ligero / turismo",
          summary: "Respuestas cortas para coches y camionetas bajo peso comercial.",
          qa: [
            {
              q: "¿Necesito CDL?",
              a: "No para coches de turismo bajo 26 001 lb GVWR, salvo que la ley local lo exija.",
            },
            {
              q: "¿Qué seguro necesito?",
              a: "Póliza personal válida que cubra este coche. Sube el comprobante en la app antes del PIN o las llaves.",
            },
            {
              q: "¿Cómo funciona la cancelación?",
              a: "Cancelación ≥24 h antes del inicio: reembolso total. Dentro de 24 h: 50%.",
            },
            {
              q: "¿Combustible y devolución tarde?",
              a: "Combustible lleno a lleno (+$20 si falta). Devolución tarde: 30 min de gracia, luego $20 + $15/h.",
            },
            {
              q: "¿Por qué GPS para el PIN?",
              a: "El PIN solo se abre en la recogida (o con el QR del coche)—no un código reenviado.",
            },
            {
              q: "¿Qué fotos son obligatorias?",
              a: "Inspección previa: carrocería + cuatro llantas antes del inicio; el mismo set al devolver.",
            },
          ],
        },
        Motorcycles: {
          title: "FAQ alquiler de motos",
          summary: "Respuestas cortas para motocicletas.",
          qa: [
            {
              q: "¿Necesito endorsement de moto?",
              a: "Sí. Declara un endorsement de moto válido (o equivalente local) para el conductor nombrado.",
            },
            {
              q: "¿Basta la licencia de coche?",
              a: "No cuando este anuncio exige endorsement de moto.",
            },
            {
              q: "¿Qué seguro necesito?",
              a: "Comprobante que cubra esta moto, subido en la app antes del PIN o las llaves.",
            },
            {
              q: "¿Casco?",
              a: "Sigue la ley local y la política de casco del anuncio.",
            },
            {
              q: "¿Qué fotos son obligatorias?",
              a: "Fotos de carrocería y llantas antes del inicio; el mismo set al devolver.",
            },
          ],
        },
        ATVs: {
          title: "FAQ alquiler de ATV / OHV",
          summary: "Respuestas cortas para ATV y OHV.",
          qa: [
            {
              q: "¿Se exige exención de terreno?",
              a: "Sí por defecto—acepta el riesgo de terreno OHV / ATV al reservar antes del desbloqueo.",
            },
            {
              q: "¿Qué licencia necesito?",
              a: "Licencia o permiso válido según la ley OHV local y el anuncio.",
            },
            {
              q: "¿Qué seguro necesito?",
              a: "Comprobante que cubra este ATV, subido antes del PIN o las llaves.",
            },
            {
              q: "¿Casco / equipo?",
              a: "Sigue la ley local y las reglas de casco o equipo del anuncio.",
            },
            {
              q: "¿Qué fotos son obligatorias?",
              a: "Fotos de carrocería y llantas antes del inicio; el mismo set al devolver.",
            },
          ],
        },
        "Tow Vehicles": {
          title: "FAQ alquiler de vehículos de remolque",
          summary: "Respuestas cortas para grúas y tow vehicles.",
          qa: [
            {
              q: "¿Necesito CDL?",
              a: "Sí cuando el GVWR o el peso combinado es 26 001 lb o más (o según la ley local).",
            },
            {
              q: "¿Qué más se exige?",
              a: "Credenciales de remolque según el anuncio, más prueba de seguro comercial agente→dueño cuando este estante lo exige.",
            },
            {
              q: "¿Capacidad de remolque?",
              a: "Respeta la capacidad y clase de enganche publicadas en el anuncio.",
            },
            {
              q: "¿Qué inspección es obligatoria?",
              a: "Carrocería y multi-llanta antes del inicio; el mismo set al devolver.",
            },
            {
              q: "¿Por qué GPS para el PIN?",
              a: "PIN o caja solo en la recogida o vía QR del vehículo—no un código reenviado.",
            },
          ],
        },
        Trailers: {
          title: "FAQ alquiler de remolques",
          summary: "Respuestas cortas para remolques ligeros / utility bajo peso comercial.",
          qa: [
            {
              q: "¿Necesito CDL?",
              a: "Normalmente no bajo 26 001 lb GVWR—revisa la ley local, clase de enganche y frenos.",
            },
            {
              q: "¿Enganche y luces?",
              a: "Coincide la clase de hitch; confirma luces y frenos en la entrega.",
            },
            {
              q: "¿Qué seguro necesito?",
              a: "Cobertura del remolque según el anuncio; sube el comprobante antes de la entrega.",
            },
            {
              q: "¿Límites de carga?",
              a: "No superes el GVWR ni el payload publicados.",
            },
            {
              q: "¿Qué fotos son obligatorias?",
              a: "Chasis, enganche, llantas y luces en la inspección previa; el mismo set al devolver.",
            },
          ],
        },
        "Equipment Trailers": {
          title: "FAQ alquiler de remolques de equipo",
          summary: "Respuestas cortas para remolques comerciales / de equipo.",
          qa: [
            {
              q: "¿Necesito CDL?",
              a: "Sí cuando el GVWR o el peso combinado es 26 001 lb o más (o según el transporte comercial).",
            },
            {
              q: "¿Cómo funciona la prueba de seguro?",
              a: "El agente envía prueba comercial / PD al correo del dueño del anuncio antes del PIN o las llaves.",
            },
            {
              q: "¿Límites de carga?",
              a: "No superes el GVWR ni el payload publicados.",
            },
            {
              q: "¿Qué inspección es obligatoria?",
              a: "Fotos de chasis y multi-llanta antes del inicio; el mismo set al devolver.",
            },
            {
              q: "¿Por qué GPS para el PIN?",
              a: "PIN o caja solo en la recogida o vía QR del vehículo—no un código reenviado.",
            },
          ],
        },
        "Commercial Trucks": {
          title: "FAQ alquiler de camiones comerciales",
          summary: "Respuestas cortas para camiones comerciales y semis.",
          qa: [
            {
              q: "¿Necesito CDL?",
              a: "Sí si el GVWR es 26 001 lb o más (o según la ley local).",
            },
            {
              q: "¿Qué peso debo indicar?",
              a: "GVWR en libras—no el valor en dólares.",
            },
            {
              q: "¿Cómo funciona la prueba de seguro?",
              a: "El agente del arrendatario envía la prueba al correo del dueño del anuncio antes del PIN o las llaves.",
            },
            {
              q: "¿Se exige daño físico (PD)?",
              a: "Sí. Los límites de PD siguen el GVWR (lb); la retención del depósito sigue el deducible / PD comercial.",
            },
            {
              q: "¿Qué inspección es obligatoria?",
              a: "Inspección comercial multi-llanta antes del inicio; el mismo set al devolver.",
            },
          ],
        },
      
        "Cargo Vans": {
          title: "FAQ de furgonetas de carga",
          summary: "Respuestas cortas para furgones de carga y trabajo.",
          qa: [
            { q: "¿Necesito CDL?", a: "Normalmente no bajo 26,001 lb GVWR—confirma la ley local y la clase de peso del anuncio." },
            { q: "¿Qué seguro?", a: "Cobertura de esta furgoneta según el anuncio; sube el comprobante antes del PIN o llaves." },
            { q: "¿Límites de carga?", a: "Respeta el payload publicado y las reglas de sujeción." },
            { q: "¿Qué fotos?", a: "Carrocería, zona de carga y neumáticos en pre-trip; las mismas al devolver." },
            { q: "¿Por qué GPS para el PIN?", a: "PIN/lockbox solo en recogida o vía QR—no un código reenviado." },
          ],
        },
        "RVs & Campers": {
          title: "FAQ de autocaravanas",
          summary: "Respuestas cortas para RV, campers y sleepers.",
          qa: [
            { q: "¿Licencia especial?", a: "Sigue las reglas locales de RV/comercial y la nota del anuncio." },
            { q: "¿Qué seguro?", a: "Cobertura de este RV según el anuncio; sube el comprobante antes del desbloqueo." },
            { q: "¿Conexiones y dump?", a: "Confirma luz/agua/alcantarillado en el anuncio—el depósito no son tarifas de camping." },
            { q: "¿Qué fotos?", a: "Exterior, neumáticos y zona habitable en pre-trip; el mismo set al devolver." },
            { q: "¿Qué cubre el depósito?", a: "Daño interior y accesorios faltantes—no seguro de cancelación del viaje." },
          ],
        },
        "Special Vehicles": {
          title: "FAQ de vehículos especiales",
          summary: "Respuestas cortas para estanterías de vehículos poco comunes.",
          qa: [
            { q: "¿Qué credenciales?", a: "Sigue el anuncio—CDL, endorsement o permiso especial." },
            { q: "¿Qué seguro?", a: "Comprobante que cubra esta clase antes del PIN o llaves." },
            { q: "¿Estante comercial?", a: "Si es clase comercial, aplican seguro agent→owner y reglas PD." },
            { q: "¿Qué fotos?", a: "Carrocería y neumáticos en pre-trip; las mismas al devolver." },
            { q: "¿Estante con nombre?", a: "Reubica a Cars, Trucks, Trailers, ATVs, RVs o Tow cuando encaje." },
          ],
        },
        Other: {
          title: "Otros vehículos — elige un estante con nombre",
          summary: "Prefiere Cars, Motorcycles, Trailers, ATVs, RVs, Commercial, Cargo, Equipment, Tow o Special.",
          qa: [
            { q: "¿Usar Other?", a: "Reubica a un estante Vehicles con nombre cuando encaje." },
            { q: "¿Qué sigue aplicando?", a: "VIN, seguro e inspección fotográfica en alquileres Vehicles." },
            { q: "¿Comercial vs ligero?", a: "Si el GVWR o uso es comercial, prefiere Commercial / Equipment / Tow." },
            { q: "¿Qué fotos?", a: "Pre-trip de carrocería y neumáticos; las mismas al devolver." },
            { q: "¿Qué no incluye?", a: "Sin promo de seguro partner ni curso CDL de Evorios." },
          ],
        },
},
    Construction: {
        "Concrete Mixers": {
          title: "Hormigoneras — potencia + duty",
          summary: "Duty, potencia/combustible y seguro para hormigoneras.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Duty class, power band, fuel type y bandas de seguro." },
            { q: "¿Horas?", a: "Hours band es recomendado para conocer el desgaste antes del handoff." },
            { q: "¿Depósito?", a: "Coincide con el deducible — no seguro de obra de concreto." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de patio de equipos." },
          ],
        },
        "Safety Equipment": {
          title: "PPE — nivel + inspección",
          summary: "Nivel de riesgo PPE, talla, norma y estado de inspección.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "PPE risk tier (soft / fall / mixed), talla, norma e inspection status." },
            { q: "¿Fall protection?", a: "Kits fall o mixed exigen norma y inspected_current o tag_visible." },
            { q: "¿Soft PPE?", a: "Soft PPE puede usar not_required_soft_ppe — aún publica talla y tier." },
            { q: "¿Depósito?", a: "Cubre PPE faltante/dañado — no seguro de lesión." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de distribuidor PPE." },
          ],
        },
        "Site Lighting": {
          title: "Iluminación de obra — potencia + combustible",
          summary: "Duty, potencia/combustible y seguro para luces temporales.",
          qa: [
            { q: "¿Qué debe listarse?", a: "Duty class, power band, fuel type y seguro." },
            { q: "¿Depósito?", a: "Cubre daño de luces/torres — no seguro de retraso de obra." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de alquiler de iluminación." },
            { q: "¿Horas?", a: "Hours band es recomendado para generadores / light towers." },
          ],
        },
        "Hand Tools Pro": {
          title: "Herramientas pro — class + duty",
          summary: "Clase de herramientas de mano pro y duty con seguro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Hand-tools pro class, duty class y seguro." },
            { q: "¿Inventario?", a: "Lista sets multipieza en notas o checklist para reclamar faltantes." },
            { q: "¿Depósito?", a: "Cubre herramientas faltantes y daño — no seguro de lesión." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tool-truck." },
          ],
        },
        "Formwork Basic": {
          title: "Encofrado basic — piezas + checklist",
          summary: "Banda de piezas y checklist de kit.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Banda de piezas, checklist, duty class y seguro." },
            { q: "¿Devolución?", a: "Cuenta piezas contra el checklist congelado al handoff y retorno." },
            { q: "¿Depósito?", a: "Cubre paneles/puntales faltantes — no seguro de falla de vaciado." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de proveedor de encofrado." },
          ],
        },
        "Large Concrete Equipment": {
          title: "Concreto grande — potencia + duty",
          summary: "Potencia/combustible y duty para equipo grande de concreto.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Duty class, power band, fuel type y seguro." },
            { q: "¿Operador?", a: "Publica si el operador está incluido en notas cuando aplique." },
            { q: "¿Depósito?", a: "Coincide con el deducible — no seguro de retraso de proyecto." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de alquiler de concreto pesado." },
          ],
        },
        "Crane & Lifting": {
          title: "Grúa y izaje — capacidad + operador",
          summary: "Capacidad en toneladas y modo de operador con seguro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Banda de toneladas, operator mode, potencia/combustible, duty y seguro." },
            { q: "¿Operador incluido?", a: "Bare rental vs operator included/optional se congela antes de publicar." },
            { q: "¿Credenciales?", a: "Trabajos crane-class pueden exigir prueba de operador antes del handoff." },
            { q: "¿Depósito?", a: "Coincide con el deducible — no seguro de falla de izaje." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de broker de grúas." },
          ],
        },
        "Professional Formwork": {
          title: "Encofrado pro — piezas + checklist",
          summary: "Mismas puertas de formwork que basic a escala pro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Banda de piezas, checklist, duty class y seguro." },
            { q: "¿Devolución?", a: "Cuenta cada panel/puntal contra el checklist congelado." },
            { q: "¿Depósito?", a: "Cubre piezas faltantes según la lista." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de patio de encofrado." },
          ],
        },
        "Excavation Tools": {
          title: "Excavación — potencia + duty",
          summary: "Potencia/combustible y duty para herramientas de excavación.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Duty class, power band, fuel type y seguro." },
            { q: "¿Depósito?", a: "Coincide con el deducible — no seguro de golpe a utilidades." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de alquiler de excavación." },
            { q: "¿Horas?", a: "Hours band es recomendado para herramientas motorizadas." },
          ],
        },
        "Structural Equipment": {
          title: "Estructural — class + duty",
          summary: "Clase de equipo estructural y duty con seguro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Structural equipment class, duty class y seguro." },
            { q: "¿Depósito?", a: "Cubre daño y piezas faltantes — no seguro de falla estructural." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de proveedor de apuntalamiento." },
            { q: "¿Reubicar?", a: "Grúas reales van a Crane & Lifting; encofrado a Formwork." },
          ],
        },
        Other: {
          title: "Otro construction — elige estante con nombre",
          summary: "Prefiere Mixers, Safety, Lighting, Hand Tools, Formwork, Concrete, Crane, Excavation o Structural.",
          qa: [
            { q: "¿Debo usar Other?", a: "Reubica cuando un estante Construction con nombre encaje para aplicar PPE, formwork o grúa." },
            { q: "¿Qué sigue aplicando?", a: "Duty class, seguro y constructionOtherKind aún se congelan en rent." },
            { q: "¿Depósito?", a: "Coincide con el deducible — no seguro de obra." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de patio de equipos." },
          ],
        },
      },
    "Boats & Water": {
        "Kayaks & Canoes": {
          title: "Kayaks y canoas — PFD + eslora",
          summary: "Eslora, capacidad, motor y política PFD para paddle.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Banda de eslora, capacidad, motor, política PFD y bandas de seguro." },
            { q: "¿Se exige HIN?", a: "No en kayaks sin motor — HIN es obligatorio si motor es yes o electric_only." },
            { q: "¿PFD?", a: "El listing fija included, renter provides o not required — no asumas chalecos." },
            { q: "¿Depósito?", a: "Cubre daño de casco/equipo y PFD faltantes — no seguro de viaje." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de outfitter o seguro paddle." },
          ],
        },
        "SUP Boards": {
          title: "SUP — PFD + eslora",
          summary: "Eslora, capacidad y PFD para paddleboards.",
          qa: [
            { q: "¿Qué debe listarse?", a: "Eslora, capacidad, motor, PFD y seguro." },
            { q: "¿HIN?", a: "No obligatorio en SUP sin motor — sí si hay motor." },
            { q: "¿Depósito?", a: "Cubre daño de tabla/aleta y PFD faltantes." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tienda SUP." },
          ],
        },
        "Fishing Boats": {
          title: "Pesca — HIN + kit de seguridad",
          summary: "Embarcaciones de pesca a motor: HIN, kit USCG y seguro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Eslora, capacidad, motor, HIN, kit tipo USCG y seguro." },
            { q: "¿HIN obligatorio?", a: "Sí en Fishing Boats — ingresa HIN/CIN/registro local antes de publicar." },
            { q: "¿Fotos?", a: "Recorrido de casco (proa, popa, babor, estribor, cubierta) al inicio y al retorno." },
            { q: "¿Depósito?", a: "Coincide con la banda de deducible — no seguro de viaje de pesca." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de marina o seguro náutico." },
          ],
        },
        "Inflatable Boats": {
          title: "Inflatables — motor vs paddle",
          summary: "PFD sin motor; HIN si es motorizado.",
          qa: [
            { q: "¿HIN?", a: "Obligatorio si motor es yes o electric_only; opcional sin motor." },
            { q: "¿PFD?", a: "Inflatables sin motor congelan PFD included / renter provides / not required." },
            { q: "¿Depósito?", a: "Cubre pinchazos/daño y PFD faltantes." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tienda de inflables." },
          ],
        },
        "Jet Skis": {
          title: "Jet Skis — HIN + kit",
          summary: "PWC: HIN, kit USCG, edad/licencia y seguro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Eslora, capacidad, motor, HIN, kit USCG y seguro." },
            { q: "¿Edad / licencia?", a: "Bareboat: edad 25 + credencial boater/PWC cuando lo exija la ley y el listing." },
            { q: "¿Fotos?", a: "Recorrido de casco al inicio y al retorno." },
            { q: "¿Depósito?", a: "Coincide con el deducible — Evorios no vende seguro PWC." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de cadena de alquiler de jet ski." },
          ],
        },
        Motorboats: {
          title: "Lanchas — captain mode + HIN",
          summary: "HIN, kit USCG, captain vs bareboat y seguro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Eslora, capacidad, motor, HIN, kit USCG, captain mode y seguro." },
            { q: "¿Bareboat vs captain?", a: "Bareboat: edad/licencia. Captain included: huésped 18+ sin puerta de licencia del arrendatario." },
            { q: "¿Depósito?", a: "Coincide con la banda de deducible del listing." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de broker de charter." },
          ],
        },
        "Pontoon Boats": {
          title: "Pontones — captain mode + HIN",
          summary: "Mismas puertas motorizadas que motorboats.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Eslora, capacidad, motor, HIN, kit USCG, captain mode y seguro." },
            { q: "¿Captain included?", a: "Con captain_included aplica edad 18 del huésped y se apaga la puerta de licencia." },
            { q: "¿Depósito?", a: "Coincide con el deducible — no seguro de party boat." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de dealer de pontones." },
          ],
        },
        "Commercial Fishing": {
          title: "Pesca comercial — HIN + kit",
          summary: "Craft de pesca comercial a motor: HIN, kit USCG, seguro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Eslora, capacidad, motor, HIN, kit USCG y seguro." },
            { q: "¿Uso comercial?", a: "Publica capacidad real y estado del kit — el depósito no es seguro de captura." },
            { q: "¿Fotos?", a: "Recorrido de casco al inicio y al retorno." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de aseguradora de pesca comercial." },
          ],
        },
        "Dive Boats": {
          title: "Botes de buceo — HIN + kit",
          summary: "Apoyo de buceo a motor: HIN, kit USCG, seguro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Eslora, capacidad, motor, HIN, kit USCG y seguro." },
            { q: "¿Equipo de buceo incluido?", a: "Solo lo que diga el inventario — no se asumen tanques/reguladores." },
            { q: "¿Depósito?", a: "Coincide con el deducible — no seguro de accidente de buceo." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de dive shop o PADI." },
          ],
        },
        "Charter Vessels": {
          title: "Charter — captain + HIN",
          summary: "Captain mode, HIN, kit USCG y seguro para charter.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Eslora, capacidad, motor, HIN, kit USCG, captain mode y seguro." },
            { q: "¿Necesito licencia?", a: "Captain included: huésped 18+, sin puerta de licencia. Bareboat: edad 25 + credencial si aplica." },
            { q: "¿Depósito?", a: "Coincide con la banda de deducible del listing." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de marketplace de charter." },
          ],
        },
        Other: {
          title: "Otras embarcaciones — elige estante con nombre",
          summary: "Prefiere Kayak, SUP, Fishing, Inflatable, Jet Ski, Motorboat, Pontoon, Dive o Charter.",
          qa: [
            { q: "¿Debo usar Other?", a: "Reubica cuando un estante Boats con nombre encaje para aplicar HIN, PFD o captain." },
            { q: "¿Qué sigue aplicando?", a: "Eslora, capacidad, motor, seguro y boatsOtherKind aún se congelan en rent." },
            { q: "¿HIN?", a: "Obligatorio si es motorizado (motor yes / electric_only) o en estante motorizado." },
            { q: "¿Depósito?", a: "Coincide con el deducible — no seguro de viaje." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de marina." },
          ],
        },
      },
    "Bikes & Scooters": {
        "Mountain Bikes": {
          title: "MTB — waiver de trail + casco",
          summary: "Talla de cuadro, casco/candado/guarda y waiver MTB.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Banda de cuadro/rueda, casco, candado, guarda nocturna y waiver (required o not_required)." },
            { q: "¿Se exige waiver?", a: "El anfitrión debe publicar required o not_required en Mountain Bikes antes de publicar alquiler." },
            { q: "¿Casco / candado?", a: "Las políticas de casco y candado son obligatorias en todo alquiler Bikes." },
            { q: "¿Depósito?", a: "Cubre daño de cuadro/rueda y kit faltante — no seguro de lesión en trail." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tienda o seguro de trail." },
          ],
        },
        "Road Bikes": {
          title: "Ruta — ajuste + guarda",
          summary: "Talla de cuadro, casco/candado y guarda nocturna.",
          qa: [
            { q: "¿Qué debe listarse?", a: "Banda de cuadro/rueda, casco, candado y regla de guarda nocturna." },
            { q: "¿Ajuste?", a: "Usa la talla de cuadro y la banda de altura recomendada antes de reservar." },
            { q: "¿Depósito?", a: "Cubre daño por caída y casco/candado faltante — no seguro de carrera." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tienda de bicis." },
          ],
        },
        "E-Bikes": {
          title: "E-bikes — clase + edad mínima",
          summary: "Clase e-bike, edad mínima, batería/cargador y casco/candado.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Edad mínima, clase e-bike (1–3 o no clasificada), casco, candado, guarda y campos de batería/cargador." },
            { q: "¿Qué clase es?", a: "El anfitrión fija Class 1, 2, 3 o not classified — las reglas locales pueden diferir." },
            { q: "¿Depósito?", a: "Cubre daño de bici/batería y cargador faltante — no seguro e-bike." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de aseguradora o tienda e-bike." },
          ],
        },
        "Kids Bikes": {
          title: "Kids — tutor + casco",
          summary: "Tutor adulto obligatorio; casco requerido (not_required bloqueado).",
          qa: [
            { q: "¿Se exige tutor?", a: "Sí — un adulto debe atestiguar en la reserva antes del handoff." },
            { q: "¿Casco not required?", a: "No en Kids Bikes — not_required se bloquea al publicar." },
            { q: "¿Depósito?", a: "Cubre daño y kit faltante — no seguro de lesión infantil." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tienda kids." },
          ],
        },
        "Electric Scooters": {
          title: "E-scooters — clase + edad",
          summary: "Clase de scooter, edad mínima si electric, casco/candado/guarda.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Clase de scooter, casco, candado, guarda nocturna y edad mínima si Electric no es no." },
            { q: "¿Dónde puedo circular?", a: "Sigue la ley local de scooters y la regla de guarda publicada." },
            { q: "¿Depósito?", a: "Cubre daño de scooter/batería y cargador faltante." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de scooter-share o aseguradora." },
          ],
        },
        Cruisers: {
          title: "Cruisers — ajuste casual + guarda",
          summary: "Talla de cuadro, casco/candado y guarda nocturna.",
          qa: [
            { q: "¿Qué debe listarse?", a: "Banda de cuadro/rueda, casco, candado y guarda nocturna." },
            { q: "¿Depósito?", a: "Cubre daño y casco/candado faltante." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tienda de bicis." },
            { q: "¿Noche fuera?", a: "Guardar afuera puede anular el reclamo si el listing exige indoor o covered." },
          ],
        },
        "E-Bikes Pro": {
          title: "E-bikes pro — clase + edad",
          summary: "Mismas puertas e-power que E-Bikes en flota/pro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Edad mínima, clase e-bike, casco, candado, guarda y batería/cargador." },
            { q: "¿Flota vs personal?", a: "Publica la misma clase y banda de carga para conocer la asistencia en el handoff." },
            { q: "¿Depósito?", a: "Cubre daño de bici/batería y cargador faltante." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de seguro de flota." },
          ],
        },
        "Racing Bikes": {
          title: "Racing — waiver + ajuste",
          summary: "Talla de cuadro, casco/candado, guarda y waiver de carrera.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Banda de cuadro/rueda, casco, candado, guarda y waiver (required o not_required)." },
            { q: "¿Se exige waiver?", a: "El anfitrión debe publicar required o not_required en Racing Bikes antes de publicar." },
            { q: "¿Depósito?", a: "Cubre daño por caída y kit faltante — no seguro de carrera ni médico." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de inscripción o tienda." },
          ],
        },
        "Cargo Bikes": {
          title: "Cargo — carga + niños",
          summary: "Banda de carga y política de niños con casco/candado.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Banda de carga, política de niños, casco, candado y guarda nocturna." },
            { q: "¿Pueden ir niños?", a: "Solo si el listing permite child seat included o renter seat — adult_cargo_only lo bloquea." },
            { q: "¿Depósito?", a: "Cubre daño por sobrecarga y asientos/candados faltantes." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tienda cargo." },
          ],
        },
        "Professional Scooters": {
          title: "Scooters pro — clase + edad",
          summary: "Clase de scooter y edad e-power para flota/pro.",
          qa: [
            { q: "¿Qué puertas aplican?", a: "Clase de scooter, casco, candado, guarda y edad mínima si Electric no es no." },
            { q: "¿Depósito?", a: "Cubre daño de scooter/batería y cargador faltante." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de seguro de flota de scooters." },
            { q: "¿Reglas locales?", a: "Sigue la ley local y la guarda publicada." },
          ],
        },
        "Adaptive Bikes": {
          title: "Adaptativas — subtipo obligatorio",
          summary: "Subtipo adaptativo más casco/candado/guarda.",
          qa: [
            { q: "¿Qué subtipo se exige?", a: "Handcycle, tandem, trike, recumbent, wheelchair attach u other adaptive." },
            { q: "¿Qué más congela?", a: "Casco, candado y guarda nocturna en todo alquiler Bikes." },
            { q: "¿Depósito?", a: "Cubre daño y accesorios adaptativos faltantes." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de vendedor adaptativo." },
          ],
        },
        Other: {
          title: "Otras bicis — elige estante con nombre",
          summary: "Prefiere Mountain, Road, E-Bike, Kids, Scooter, Racing, Cargo o Adaptive.",
          qa: [
            { q: "¿Debo usar Other?", a: "Reubica cuando un estante Bikes con nombre encaje para aplicar edad, waiver, carga o adaptativo." },
            { q: "¿Qué sigue aplicando?", a: "Casco, candado, guarda nocturna y bikesOtherKind aún se congelan en rent." },
            { q: "¿Electric?", a: "Si Electric = yes, edad mínima y clase e-bike aplican en bici (no scooter)." },
            { q: "¿Depósito?", a: "Cubre daño y casco/candado faltante." },
            { q: "¿Promo de partner?", a: "Sin hard-sell de tienda de bicis." },
          ],
        },
      },
    "Electronics & Tech": {
        "Broadcast Equipment": {
            title: "FAQ de equipo de broadcast",
            summary: "Respuestas cortas para switchers, encoders y kits de livestream.",
            qa: [
              {
                q: "¿Qué subtipo listar?",
                a: "Switcher, encoder, recorder, teleprompter u similar—más marca/modelo.",
              },
              {
                q: "¿Qué I/O y energía?",
                a: "Cada ruta SDI/HDMI, cables/convertidores y power/battery plate.",
              },
              {
                q: "¿Incluye media?",
                a: "El anuncio dice si SD/CF/SSD va con el kit.",
              },
              {
                q: "¿Test de retorno?",
                a: "Sí si el anfitrión lo define—encendido/I/O al devolver.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Cables/media faltantes y test de retorno fallido más allá del uso.",
              },
            ],
          },
        "Display Systems": {
            title: "FAQ de sistemas de display",
            summary: "Respuestas cortas para paneles, LED walls, soportes y energía.",
            qa: [
              {
                q: "¿Tamaño y entradas?",
                a: "Banda de tamaño, resolución/HDR y cada entrada HDMI/DP/SDI.",
              },
              {
                q: "¿Interior o exterior?",
                a: "Sigue la calificación del anuncio—no uses paneles indoor afuera.",
              },
              {
                q: "¿Energía?",
                a: "Revisa amperios/circuitos publicados antes del montaje.",
              },
              {
                q: "¿Soportes / case?",
                a: "El anuncio indica stand/mount/flight-case.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Cristal roto, gabinetes doblados y cables/mandos/módulos faltantes.",
              },
            ],
          },
        "Gaming Gear": {
            title: "FAQ de gaming",
            summary: "Respuestas cortas sobre consolas, PC, VR, login y wipe.",
            qa: [
              {
                q: "¿Qué login?",
                a: "Prefiere guest/offline según el anuncio—no dejes cuentas personales.",
              },
              {
                q: "¿Cuántos mandos?",
                a: "El conteo y HDMI/cables están en el inventario.",
              },
              {
                q: "¿Wipe?",
                a: "Si hay almacenamiento—sigue wipe/unlink del anfitrión y el de retorno.",
              },
              {
                q: "¿Higiene VR?",
                a: "Limpia la espuma facial según las notas antes de devolver.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Mandos/cables faltantes y daños más allá de las notas de higiene.",
              },
            ],
          },
        "Laptops": {
            title: "FAQ de laptops",
            summary: "Respuestas cortas sobre desbloqueo, cargador, batería y wipe.",
            qa: [
              {
                q: "¿Incluye cargador?",
                a: "Sí si está listado—banda de vatios en el inventario.",
              },
              {
                q: "¿Cómo desbloqueo?",
                a: "Sigue las notas de OS/admin unlock y login demo.",
              },
              {
                q: "¿Qué wipe?",
                a: "Wipe del anfitrión al listar; profundidad al devolver; acuse al reservar.",
              },
              {
                q: "¿Batería?",
                a: "Respeta la banda publicada; foto del brick en la entrega.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Cargador/kit faltante y daño de pantalla/teclado más allá del grado.",
              },
            ],
          },
        "Network Gear": {
            title: "FAQ de red",
            summary: "Respuestas cortas sobre switches, AP, PoE y factory restore.",
            qa: [
              {
                q: "¿Subtipo y PoE?",
                a: "Router/switch/AP/firewall/mesh más presupuesto PoE y banda de puertos.",
              },
              {
                q: "¿Factory restore al devolver?",
                a: "Sí si el anuncio lo exige—limpia SSIDs y credenciales admin.",
              },
              {
                q: "¿Uso exterior?",
                a: "Solo si el rating outdoor lo permite.",
              },
              {
                q: "¿Qué piezas contar?",
                a: "Inyectores, antenas, SFP, rieles/orejas según inventario.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas faltantes y config contraria a la política de restore.",
              },
            ],
          },
        "Other": {
            title: "FAQ de otra electrónica",
            summary: "Respuestas cortas cuando no cabe un estante con nombre.",
            qa: [
              {
                q: "¿Usar Other?",
                a: "Prefiere un estante con nombre para que apliquen las reglas correctas.",
              },
              {
                q: "¿Qué debe declarar Other?",
                a: "Energía, almacenamiento sí/no, wipe si hay storage y fotos de condición.",
              },
              {
                q: "¿Kit multipieza?",
                a: "Lista cada pieza en el inventario.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas faltantes y daños con fotos + serie.",
              },
              {
                q: "¿Seguro de socio?",
                a: "No—solo depósito.",
              },
            ],
          },
        "Pro Audio": {
            title: "FAQ de pro audio",
            summary: "Respuestas cortas sobre interfaces, mics, phantom y loom.",
            qa: [
              {
                q: "¿Qué tipo de equipo?",
                a: "Interface, mixer, mic, monitor u similar—en el anuncio.",
              },
              {
                q: "¿Phantom 48V / DI?",
                a: "Revisa el anuncio—necesario para muchos condensadores y bajo.",
              },
              {
                q: "¿Cómo se cuentan cables?",
                a: "Cada XLR/TRS/USB/ADAT del loom—cuenta en la entrega.",
              },
              {
                q: "¿Test de retorno?",
                a: "Sí si está definido—encendido/I/O al devolver.",
              },
              {
                q: "¿Es PA de Music?",
                a: "No—estudio/captura bajo Electronics & Tech.",
              },
            ],
          },
        "Projectors": {
            title: "FAQ de proyectores",
            summary: "Respuestas cortas sobre lúmenes, throw, entradas y kit.",
            qa: [
              {
                q: "¿Qué brillo?",
                a: "Banda de lúmenes y resolución nativa publicadas.",
              },
              {
                q: "¿Qué distancia throw?",
                a: "Sigue las notas de throw/distancia.",
              },
              {
                q: "¿Qué entradas?",
                a: "Conteo HDMI y adaptadores en el inventario.",
              },
              {
                q: "¿Interior/exterior?",
                a: "Sigue el entorno publicado.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Mando/cables faltantes y abuso de lámpara/exterior más allá del anuncio.",
              },
            ],
          },
        "Servers & Workstations": {
            title: "FAQ de servidores y WS",
            summary: "Respuestas cortas sobre factor de forma, energía, BMC y wipe.",
            qa: [
              {
                q: "¿Forma y energía?",
                a: "Tower / rack U / laptop WS más PSU en el anuncio.",
              },
              {
                q: "¿Rieles incluidos?",
                a: "Solo si el anuncio lo dice—cuéntalos en la entrega.",
              },
              {
                q: "¿Profundidad de wipe?",
                a: "Secure erase, reinstalar OS o discos extraídos—según lo publicado.",
              },
              {
                q: "¿IPMI/iDRAC?",
                a: "Sigue la política BMC; no dejes credenciales abiertas.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Rieles/NIC faltantes y hardware—no seguro cibernético.",
              },
            ],
          },
        "Smart Home Devices": {
            title: "FAQ de smart home",
            summary: "Respuestas cortas sobre desvincular, hub y protocolo.",
            qa: [
              {
                q: "¿Debo desvincular la cuenta?",
                a: "Sí—según la política de retorno; no dejes al siguiente huésped vinculado.",
              },
              {
                q: "¿Se necesita hub?",
                a: "Solo si el protocolo del anuncio lo requiere.",
              },
              {
                q: "¿Qué protocolo?",
                a: "Banda Wi-Fi / Thread / Zigbee / Matter en el anuncio.",
              },
              {
                q: "¿Cámaras?",
                a: "Usa la cubierta de privacidad; sigue notas de instalación/retiro.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Hubs/sensores faltantes y daño de pared más allá de las notas.",
              },
            ],
          },
        "Speakers": {
            title: "FAQ de altavoces",
            summary: "Respuestas cortas para altavoces portátiles/fiesta (no PA de escenario).",
            qa: [
              {
                q: "¿Batería o AC?",
                a: "Según el tipo; con batería respeta la banda de carga al devolver.",
              },
              {
                q: "¿Exterior / splash?",
                a: "Solo dentro de la banda de clima publicada.",
              },
              {
                q: "¿Cables incluidos?",
                a: "Checklist con nombre—cuéntalos en la entrega.",
              },
              {
                q: "¿Volumen?",
                a: "Sigue las notas de vecinos / horas de silencio.",
              },
              {
                q: "¿Es PA de Music?",
                a: "No—consumo/portátil; el PA de escenario está en Music & Audio.",
              },
            ],
          },
      },
    "Garden & Yard": {
        "Garden Tools": {
          title: "Herramientas de jardín — set, superficie, desgaste, devolución limpia",
          summary: "Mostradores de alquiler y sets entre vecinos ganan cuando queda claro pieza única vs set, superficie, grado de desgaste y reglas de barro al devolver. El baseline ya exige marca y energía (manual es lo habitual).",
          qa: [
            {
              q: "¿Qué significa herramienta suelta vs set?",
              a: "Herramienta suelta es un solo artículo (una pala o un carretilla). Set es un kit de varias piezas — cada pieza debe figurar en el inventario y contarse en la entrega.",
            },
            {
              q: "¿Por qué listar cada pieza en un set?",
              a: "Rastrillos, horcas o piezas de carretilla faltantes impulsan la mayoría de reclamos de depósito. Un checklist numerado al publicar y al devolver evita discusiones tras un fin de semana de trabajo.",
            },
            {
              q: "¿Qué es la superficie prevista?",
              a: "Tierra es para cavar y camas; césped para rastrillos y bordes aptos al turf; pavimento para patio, piedra y grava; mixto para trabajos generales de fin de semana. Elige según el trabajo para que las herramientas del anfitrión encajen.",
            },
            {
              q: "¿Por qué fuente de energía en herramientas de mano?",
              a: "La mayoría son manuales. Inalámbrico aparece en cultivadores, tijeras o pequeñas herramientas a batería — decláralo para carga y uso seguro.",
            },
            {
              q: "¿Qué cubre el grado de condición?",
              a: "Desgaste honesto en mangos, cabezas, púas y bandejas o ruedas de carretilla — incluido óxido ligero que aún funciona. Congela la base para no confundir desgaste normal de tierra con daño nuevo al devolver.",
            },
            {
              q: "¿Qué tan limpias deben volver las herramientas?",
              a: "El anfitrión elige una regla suave: enjuagar y secar, barro seco ligero OK, desgaste justo por uso, o tarifa opcional de limpieza si queda mucha tierra. Sigue la política publicada — no es promo de un servicio de limpieza externo.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "No hay cuadrilla de paisajismo, entrega de tierra ni retiro de escombros salvo que el anfitrión lo indique. Evorios no vende seguro de patio ni cobertura afiliada Home Depot / Sunbelt / United Rentals — depósito y términos cubren daños y piezas faltantes.",
            },
          ],
        },
        "Houseplants & Seedlings": {
          title: "Plantas de interior — cuidado, mascotas",
          summary: "El alquiler indoor falla por luz, agua y sorpresas con mascotas. Cultivar, salud y devolución en maceta obligatorios; notas de cuidado indoor y toxicidad para mascotas recomendadas como en banco de vivero.",
          qa: [
            {
              q: "¿Por qué notas de cuidado indoor?",
              a: "Bandejas de humedad, nebulización, 'no replantar durante alquiler' y aclimatación del invernadero evitan caída de hojas y pudrición.",
            },
            {
              q: "¿Qué significa toxicidad para mascotas?",
              a: "Select soft-obligatorio. Inquilinos con gatos, perros o reglas de venue confirman si no es non_toxic.",
            },
            {
              q: "¿Cómo funciona devolver maceta en eventos?",
              a: "Event_rental_return_pot devuelve la planta en maceta original tras la fiesta — como alquiler profesional de plantas.",
            },
            {
              q: "¿Las plántulas difieren de plantas maduras?",
              a: "Mismo estante — anote heat mat y grow light en indoorCareNotes. Las plántulas se estresan más rápido.",
            },
            {
              q: "¿Qué plagas importan indoor?",
              a: "Ácaros, mosquitos de hongos, cochinilla — declare tratamiento o problema activo.",
            },
            {
              q: "¿Por qué zona en plantas indoor?",
              a: "Recomendada — indoor_only para interior. Tropicales de patio necesitan banda real.",
            },
            {
              q: "¿Qué NO está incluido?",
              a: "Evorios no vende seguro, entrega ni riego semanal.",
            },
            {
              q: "¿Cómo funciona el depósito?",
              a: "Salud y maceta son la base. Cerámica rota o plaga más allá de notas declaradas puede usar depósito.",
            },
          ],
        },
        "Irrigation Systems": {
          title: "Riego — tipo, cobertura, instalación",
          summary: "El alquiler profesional de riego debe declarar tipo de sistema, banda de cobertura, controlador incluido, nivel de instalación, inventario completo y notas suaves de invernado antes de la entrega.",
          qa: [
            {
              q: "¿Qué significa el tipo de sistema de riego?",
              a: "Elige drip para kits de goteo/tubería, sprinkler_zones para manifolds de aspersores pop-up o rotores, smart_controller cuando el alquiler principal es un hub Wi‑Fi/temporizador, o pump cuando el kit gira en torno a una bomba de refuerzo o transferencia. En kits combinados elige el tipo más cercano y lista el resto en el inventario.",
            },
            {
              q: "¿Cómo usar la banda de área de cobertura?",
              a: "Elige los pies cuadrados aproximados que el kit puede regar — no toda la propiedad salvo que el anuncio lo diga. Variable/custom layout significa camas o hileras sin un rectángulo simple; revisa el checklist para conteo de cabezas y longitud de tubería.",
            },
            {
              q: "¿Qué cubre controller included?",
              a: "Basic timer included significa que un temporizador de manguera o zona viene en el kit. Smart controller included significa que un temporizador Wi‑Fi/app forma parte del alquiler.",
            },
            {
              q: "¿Qué significan las opciones de install complexity?",
              a: "Renter DIY espera que coloques tubería, cabezas y conexión a una boca de manguera existente — sin garantía de zanja. Host installs significa que el anfitrión monta antes o en la entrega dentro del área listada.",
            },
            {
              q: "¿Qué va en el inventario del kit?",
              a: "Lista cada cabeza, emisor, válvula, backflow o regulador, rollo de tubería, estacas, accesorios, herramientas, controlador, bomba y carretes. Arrendatario y anfitrión confirman conteos en reserva y devolución — piezas faltantes siguen inventario y fotos, no garantía retail.",
            },
            {
              q: "¿Para qué sirven las notas de invernado?",
              a: "Solo guía estacional suave: drenar líneas, soplar si se ofrece, guardar en interior antes de heladas. No son seguro contra congelación ni prometen servicio de invernado salvo que el anuncio lo diga explícitamente.",
            },
            {
              q: "¿Cómo suelen funcionar depósito y reclamos?",
              a: "Tubería cortada, cabezas perdidas, manifold agrietado o controlador inteligente faltante suelen salir del depósito cuando inventario y fotos de entrega lo respaldan. Desgaste normal de estacas puede ser aceptable si el anuncio lo indica — disputas según checklist y términos del alquiler.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Factura de agua, permisos de fontanería permanente, acceso garantizado a línea principal, certificación de prueba de backflow y mano de obra pro salvo que install complexity diga host installs. Evorios no vende seguro de jardín ni servicios de alquiler de herramientas asociados — consíguelos aparte si los necesitas.",
            },
          ],
        },
        "Landscape Equipment": {
          title: "Maquinaria de jardinería — tipo, kit, transporte",
          summary: "Las pistas pro etiquetan aireadores, desespolvadores, cortadoras de césped en rollo, spreaders y carretillas con marca, modelo, energía, combustible si es gasolina, inventario completo y notas de carga — congelado en el acuerdo.",
          qa: [
            {
              q: "¿Qué va en Maquinaria de jardinería vs otras subcategorías?",
              a: "Usa esta estantería para aireadores, desespolvadores eléctricos, cortadoras de sod, spreaders, carretillas pesadas, rodillos y bordes de paisaje — no cortadoras, cultivadores, trituradoras de tocón ni rastrillos manuales. Elige el subtipo más cercano para que el arrendatario sepa qué reserva.",
            },
            {
              q: "¿Por qué importan marca, modelo y subtipo?",
              a: "El subtipo define el trabajo (airear vs desespolvilar vs sod vs esparcir). Marca y modelo congelan la máquina exacta — unidades Ryan, BlueBird y Husqvarna difieren en peso, púas y tolva.",
            },
            {
              q: "¿Qué va en el checklist de inventario?",
              a: "Lista cada pieza incluida: tambores o cassettes de púas, tolva, aceite, rampa, llaves, repuestos y cables o baterías. Semilla, fertilizante y sal no van incluidos salvo que lo indiques.",
            },
            {
              q: "¿Qué deben cubrir las notas de transporte?",
              a: "Indica recogida vs entrega, peso aproximado, si hace falta remolque o rampa, puntos de amarre y si se necesitan dos personas. Las cortadoras de sod y aireadores de núcleo son pesadas — notas de carga poco claras causan la mayoría de disputas el día de recogida.",
            },
            {
              q: "¿Tipo de combustible y devolución de gasolina?",
              a: "Con motor a gasolina declara el tipo (gasolina, diésel, propano). Indica si el arrendatario devuelve tanque lleno, mismo nivel o repone — la política del anfitrión queda congelada.",
            },
            {
              q: "¿EPP en equipos motorizados?",
              a: "En gasolina, cable o batería usa protección ocular y auditiva y guantes resistentes; botas con punta ayudan en walk-behinds pesados. El anfitrión puede indicar EPP incluido; si no, trae el tuyo — es orientación, no certificación OSHA.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Material (semilla, sod, fertilizante), preparación del sitio, eliminación, capacitación más allá del anuncio y productos de alquiler o seguro de terceros no están incluidos. El depósito cubre daños o piezas faltantes según el checklist congelado y fotos.",
            },
          ],
        },
        "Lawn Mowers": {
          title: "Cortacéspedes — cubierta, cuchilla, devolución",
          summary: "Mostradores de alquiler congelan ancho de corte, combustible y reglas de devolución limpia. Los anuncios entre vecinos ganan cuando modelo, ancho, modo de descarga, bolsa/kit mulching, estado de cuchilla, voltaje o combustible y políticas de devolución están en el acuerdo — solo un tip suave de EPP.",
          qa: [
            {
              q: "¿Por qué son obligatorios ancho de corte, modelo y fuente de energía?",
              a: "El ancho de la cubierta (menos de 16″ hasta 30″+) indica si encaja en tu jardín. Modelo más marca separa empuje manual vs autopropulsado y clase de año — marca y \"gasolina\" solos no bastan.",
            },
            {
              q: "¿Qué significan modo de descarga y bolsa/kit mulching?",
              a: "Descarga lateral, bolsa trasera, mulching o convertible 3-en-1 define cómo sale el césped. El campo bolsa/mulching indica si incluye bolsa, marco o tapón mulching — piezas faltantes son la disputa #1 en préstamos entre vecinos.",
            },
            {
              q: "¿Cómo se maneja el estado de la cuchilla?",
              a: "El anfitrión elige filosa lista, afilada reciente, desafilada (declarada) o desconocida. El inquilino espera la calidad de corte publicada; daño por piedras o bordillos no es desgaste normal y puede usar depósito según términos.",
            },
            {
              q: "¿Cuáles son las reglas de combustible y devolución limpia en gasolina?",
              a: "Anuncios a gas requieren tipo de combustible y regla de devolución: lleno a lleno, tanque inicial del anfitrión, o gas comprado por inquilino. La política de devolución limpia indica si debes raspar/enjuagar la cubierta, pagar tarifa fija del anfitrión, o devolver con hierba ligera — confirma ambas al reservar.",
            },
            {
              q: "¿Qué pasa con el voltaje de batería inalámbrica?",
              a: "Cortacéspedes inalámbricos requieren banda de voltaje (18–20 V, 40 V, 60 V+) para autonomía y compatibilidad del cargador. Confirma cuántas baterías y si hay cargador en fotos o mensajes — inventario estructurado de baterías es mejora futura.",
            },
            {
              q: "¿Se exige EPP o seguro como en trituradoras de tocón?",
              a: "No. Cortacéspedes usa solo un tip suave de EPP — protección ocular, auditiva y calzado cerrado resistente.",
            },
            {
              q: "¿Si algo sale mal después del alquiler?",
              a: "Políticas publicadas de devolución y combustible más specs de cuchilla/descarga quedan congeladas en el acuerdo. Cubiertas empapadas fuera de política, tanque vacío contra lleno a lleno, o daño de cuchilla por mal uso se resuelven con depósito y mensajes — Evorios no vende seguro de cortacésped ni servicios de alquiler de herramientas asociados.",
            },
          ],
        },
        "Leaf Blowers": {
          title: "Sopladores — forma, flujo, devolución",
          summary: "Los mostradores de alquiler indican forma, franja CFM y kit vac/mulch en la ficha. Añadimos modelo, tipo de combustible o voltaje a batería, notas suaves de ruido/horario y reglas de devolución limpia — congeladas en el acuerdo. Confianza entre vecinos + depósito; no somos aseguradora de jardinería.",
          qa: [
            {
              q: "¿Por qué importan la forma y la franja de flujo?",
              a: "Los de mano sirven para patios pequeños; mochila y walk-behind mueven más volumen en parcelas grandes. La franja CFM es una clase de potencia suave para que no reserves un a batería ligero para una hectárea de robles.",
            },
            {
              q: "¿Qué significa el kit mulch/vac?",
              a: "Muchos son solo sopladores; otros incluyen bolsa de vacío, tubos o kit mulch completo. El anuncio declara qué va incluido para que no asumas modo aspirador o bolsa que el anfitrión no entrega.",
            },
            {
              q: "Tipo de combustible — ¿qué debo saber?",
              a: "Con fuente gas, el anfitrión declara gasolina 4 tiempos, premix 2 tiempos u otro. Respeta la mezcla y la regla del tanque en la entrega; devuelve según lo acordado (a menudo mismo nivel o lleno).",
            },
            {
              q: "Sin cable — ¿por qué la franja de voltaje?",
              a: "Las plataformas 18–20V, 40V y 60V+ no son intercambiables. La franja ayuda a emparejar baterías de repuesto y expectativas de autonomía.",
            },
            {
              q: "¿Ruido y horarios con vecinos?",
              a: "El anfitrión puede anotar horas silenciosas de la comunidad, límites de fin de semana o protección auditiva. Son notas de cortesía, no asesoría legal — revisa las normas locales antes de usar temprano o en domingo.",
            },
            {
              q: "¿Cómo debe volver el sopladora?",
              a: "Sigue las notas de devolución limpia: sacudir hojas húmedas, vaciar la bolsa, limpiar la carcasa y no devolver filtro obstruido. Empaste fuerte por encima del uso normal puede afectar el depósito.",
            },
            {
              q: "¿Protección ocular y auditiva?",
              a: "Los sopladores lanzan debris y son ruidosos. Gafas y protección auditiva se recomiendan.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Combustible, aceite premix, extensiones, baterías extra y bolsas de residuo verde suelen ser del inquilino salvo que el inventario diga lo contrario. El depósito cubre daños y accesorios listados faltantes — no seguro de equipo de terceros.",
            },
          ],
        },
        "Nursery Stock": {
          title: "Material de vivero — ficha técnica, B&B",
          summary: "Las etiquetas mayoristas guían trabajos pro. Cultivar, clase ANSI, zona, salud y política de trasplante/devolución obligatorios congelan expectativas para B&B y material de campo.",
          qa: [
            {
              q: "¿Para quién es el estante profesional de vivero?",
              a: "Cuadrillas paisajistas y diseñadores que alquilan liners, árboles B&B o material temporal de obra — no plantas de interior de consumo.",
            },
            {
              q: "¿Por qué cultivar obligatorio?",
              a: "Los planos exigen variedades exactas. 'Arce rojo' no basta cuando el spec dice October Glory.",
            },
            {
              q: "¿Cómo funciona la clase de contenedor B&B?",
              a: "Formatos ANSI — ball_burlap y field_grown fijan peso, pala e riego. Tamaño mal etiquetado causa disputas de grúa y remolque.",
            },
            {
              q: "¿Qué política de trasplante en obra?",
              a: "Keep_planted_no_return para instalar. Return_in_container cuando el material vuelve al yard.",
            },
            {
              q: "¿Qué divulgar sobre plagas?",
              a: "Tratamiento reciente o 'material limpio'. Anote phyto cuando apliquen reglas interestatales — Evorios no tramita certificados.",
            },
            {
              q: "¿Por qué zona en material mayorista?",
              a: "Obligatoria — los pros plantan a escala; una zona incorrecta mata márgenes.",
            },
            {
              q: "¿Qué NO está incluido?",
              a: "Sin equipo yard Sunbelt/United Rentals, plantadoras ni seguro de vivero de Evorios.",
            },
            {
              q: "¿Cómo funcionan depósitos y reclamos?",
              a: "Salud e integridad del bola de raíz son la base. B&B roto o raíces secas usan fotos vs depósito.",
            },
          ],
        },
        "Other": {
          title: "Otros — primero la estantería correcta",
          summary: "Prefiera una estantería con nombre de Garden & Yard para que apliquen las puertas correctas. Si se queda en Otros, indique equipo vs planta vs mixto, alimentación en motorizado, checklist de fotos de estado e inventario de piezas si el set es multipieza.",
          qa: [
            {
              q: "¿Debo usar Otros o una estantería con nombre?",
              a: "Reclasifique siempre que encaje una estantería específica — cortadoras, desbrozadoras, sopladores, herramientas de jardín, aspersores, cortadoras ride-on, cultivadores, trituradoras de tocón, riego, equipo paisajístico, árboles, arbustos, perennes, flores de temporada, plantas de interior y plántulas, o stock de vivero. Las estanterías con nombre traen las puertas de alimentación, planta o seguridad correctas; Otros solo cuando el artículo no encaja en ninguna.",
            },
            {
              q: "¿Qué significa equipo vs planta vs mixto?",
              a: "Equipo son herramientas y motorizado (cortadoras, sopladores, carros, bombas). Planta es material vivo en maceta.",
            },
            {
              q: "¿Cuándo es obligatoria la fuente de energía?",
              a: "En listados de equipo o mixto, indique fuente de energía (inalámbrico, cable, gasolina, manual, ride-on) y marca cuando aplique. Los anuncios solo de planta omiten alimentación — si el artículo necesita combustible o batería, probablemente pertenece a una estantería de equipo con nombre.",
            },
            {
              q: "¿Qué pasa con plantas en Otros?",
              a: "Prefiera una estantería de planta con nombre para altura, sol, maceta y riego. Si se queda en Otros solo planta, añada sol, tamaño de maceta y riego cuando pueda — los renters necesitan lo básico del cuidado antes de reservar.",
            },
            {
              q: "¿Necesito inventario de piezas?",
              a: "Un solo artículo basta con los campos estructurados. Sets multipieza — kits de herramientas, grupos de patio, lotes de macetas — exigen un inventario breve en texto con cada pieza incluida para entrega y devolución.",
            },
            {
              q: "¿Qué fotos de estado debo confirmar?",
              a: "Confirme que las fotos del anuncio muestran el artículo en general, cables/cuchillas/macetas según corresponda, desgaste o daño visible y todas las piezas si es multipieza. Es un attest suave — no verificamos la subida — pero las fotos son la primera capa en disputas por piezas faltantes o daños.",
            },
            {
              q: "¿Qué no está incluido ni prometido?",
              a: "Evorios no vende seguro de jardín de terceros, planes tipo Home Depot ni garantías de entrega de vivero. Combustible, sustrato, estacas y EPP los declara usted en el anuncio; waiver y prueba de seguro de trituradora de tocón aplican solo en la estantería Stump Grinders.",
            },
            {
              q: "¿Cómo funcionan las reclamaciones en Otros?",
              a: "Use fotos de estado, inventario, fuente de energía y depósito para baterías faltantes, cuchillas rotas o macetas dañadas. Prefiera una estantería con nombre la próxima vez para que las puertas especializadas queden congeladas en el acuerdo desde el inicio.",
            },
          ],
        },
        "Perennials": {
          title: "Perennes — floración, agua, zona",
          summary: "Las etiquetas de vivero listan cultivar, ventana de flor y banda de agua. El alquiler entre vecinos gana cuando esos campos más salud, zona, devolución y notas de plaga/suelo son obligatorios en el acuerdo.",
          qa: [
            {
              q: "¿Por qué son obligatorias floración y agua?",
              a: "Las perennes viven años — mal timing arruina bordes de evento y la banda de agua incorrecta mata plantas. Son básicos de etiqueta de vivero.",
            },
            {
              q: "¿Qué detalle de cultivar incluir?",
              a: "Nombre y variedad — p. ej.",
            },
            {
              q: "¿Cómo funciona la devolución de evento?",
              a: "Event_rental_return_pot devuelve plantas de borde en macetas de vivero. Keep_planted_no_return es instalación estilo venta.",
            },
            {
              q: "¿Por qué zona de rusticidad?",
              a: "Las perennes deben sobrevivir el invierno. La banda USDA filtra antes de plantar.",
            },
            {
              q: "¿Qué va en notas de plaga?",
              a: "Babosas, oídio o 'tratado y limpio'. En repeat_bloom indique si se espera deadheading al devolver.",
            },
            {
              q: "¿Qué NO está incluido?",
              a: "Evorios no entrega mulch, fertilizante ni diseño paisajístico.",
            },
            {
              q: "¿Cómo funciona el depósito?",
              a: "Contenedor y salud son la base. Coronas aplastadas o plugs secos usan fotos vs depósito.",
            },
          ],
        },
        "Ride-On Mowers": {
          title: "Cortadoras ride-on — cubierta, combustible, transporte",
          summary: "Las cortadoras grandes necesitan ancho de corte, combustible, horas, cuchillas/descarga y transporte congelados antes de reservar — más un briefing ligero, no ruta CDL.",
          qa: [
            {
              q: "¿Qué debe publicar el anfitrión antes de activar el alquiler?",
              a: "Marca, modelo, banda de ancho de corte, tipo de combustible, banda del horómetro, estado de cuchillas, configuración de descarga/recogida y notas de transporte (remolque, pickup o entrega). Indica si se requiere briefing en la entrega.",
            },
            {
              q: "¿Por qué ancho de corte y horómetro?",
              a: "Las pistas de alquiler indican ambos para que el inquilino acierte tamaño de césped y desgaste. Una banda congelada en el anuncio evita sorpresas de cubierta pequeña o motor cansado a mitad del trabajo.",
            },
            {
              q: "¿Cómo funciona el transporte?",
              a: "La mayoría necesitan remolque o camioneta — dilo en las notas. Indica si entregas, si el inquilino trae rampas y el peso/ancho aproximado para planificar la recogida.",
            },
            {
              q: "¿Y el combustible?",
              a: "Trátalo como equipo de obra: lleno a lleno cuando aplique gasolina o diésel. En las notas del briefing indica la tapa del depósito y si incluyes bidón.",
            },
            {
              q: "¿Es un alquiler de vehículo con CDL?",
              a: "No. Es equipo de jardín — banda de edad del operador suave y briefing opcional en la entrega, no puerta de licencia de conducir ni CDL.",
            },
            {
              q: "¿Consejo de seguridad antes del primer corte?",
              a: "Retira piedras y restos, mantén niños y mascotas alejados, usa protección ocular y auditiva y evita pendientes pronunciadas o césped mojado. Para las cuchillas antes de bajarte — el briefing cubre los mandos de tu unidad.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Evorios no vende seguro de jardín ni es afiliado de mostradores de alquiler retail. El depósito cubre daño de cuchillas, cubierta y piezas faltantes del recolector — no una póliza de reemplazo.",
            },
            {
              q: "¿Si algo sale mal?",
              a: "Fotos en la entrega de cubierta, cuchillas y horómetro apoyan reclamaciones. Cuchillas desafiladas o dañadas más allá de la banda publicada, golpes en la cubierta o piezas faltantes del recolector pueden ir al depósito según los términos.",
            },
          ],
        },
        "Seasonal Flowers": {
          title: "Flores estacionales — color, devolver macetas",
          summary: "El alquiler para eventos depende del pico de color y reglas de devolución en maceta. Cultivar, floración, agua, salud, zona y política de trasplante obligatorios congelan expectativas de banco de vivero.",
          qa: [
            {
              q: "¿Por qué floración y agua obligatorias?",
              a: "Ventana corta — crisantemos en otoño, pensamientos en primavera. La estación y la banda de agua fijan el pico de color y riego durante el alquiler.",
            },
            {
              q: "¿Qué es event_rental_return_pot?",
              a: "Estándar para bodas y mercados: el inquilino devuelve cada maceta tras el evento. Macetas faltantes o rotas son el reclamo #1.",
            },
            {
              q: "¿Cómo nombrar anuncios estacionales?",
              a: "Cultivar y color — p. ej.",
            },
            {
              q: "¿Por qué zona en flores estacionales?",
              a: "Flores de temporada fría toleran heladas; bowls tropicales no. La banda evita heladas en plantas tiernas.",
            },
            {
              q: "¿Qué notas de plaga importan?",
              a: "Pulgones, botrytis en crisantemos densos, mosquitas — declare tratamiento o 'limpio en entrega'.",
            },
            {
              q: "¿Qué NO está incluido?",
              a: "Sin riego diario, entrega ni manta antihielo de Evorios salvo que su anuncio lo añada.",
            },
            {
              q: "¿Cómo funciona el depósito?",
              a: "Salud y conteo de macetas son la base. Flats marchitos vs muertos y macetas faltantes usan fotos vs depósito.",
            },
            {
              q: "¿Puede el inquilino plantar y quedarse las flores?",
              a: "Solo con keep_planted_no_return; si no, espere macetas de vuelta en la fecha acordada.",
            },
          ],
        },
        "Shrubs & Bushes": {
          title: "Arbustos — cultivar, floración, devolución",
          summary: "Viveros y alquileres para eventos etiquetan cultivar, ventana de floración y maceta. Los anuncios entre vecinos ganan con nombre, altura, sol, perennifolio/caducifolio, estación de flor, salud, zona, reglas de devolución y notas de plaga/suelo.",
          qa: [
            {
              q: "¿Por qué nombrar el cultivar del arbusto?",
              a: "Hortensia, boj y altea difieren en tamaño y floración. El cultivar permite al inquilino acertar color y altura antes de reservar.",
            },
            {
              q: "¿Qué tan importante es la estación de floración?",
              a: "Recomendada siempre y soft-obligatoria en alquiler — el pico de flor marca bodas y terrazas. Foliage_only vale para verdes de fondo.",
            },
            {
              q: "¿Qué significa la política de trasplante para setos?",
              a: "Keep_planted_no_return para instalación estilo venta. Event_rental_return_pot exige devolver cada arbusto en su maceta de vivero.",
            },
            {
              q: "¿Qué incluir en notas de plaga?",
              a: "Pulgones, manchas, roedores u tratamiento reciente. En perennifolios declare quemadura invernal en grado de salud.",
            },
            {
              q: "¿Por qué zona y notas de suelo?",
              a: "Arbustos fuera de zona o en agua estancada declinan rápido. Banda de zona más drenaje evita el arrepentimiento más común.",
            },
            {
              q: "¿Qué NO está incluido?",
              a: "Evorios no ofrece seguro de vivero, poda profesional ni programas de herbicidas.",
            },
            {
              q: "¿Cómo funcionan los reclamos?",
              a: "Grado de salud y contenedor son la base. Ramas rotas, raíces secas o piezas faltantes en sets de evento usan fotos + inventario vs depósito.",
            },
          ],
        },
        "Sprinklers": {
          title: "Aspersores — cobertura, conexión, piezas",
          summary: "Los alquileres entre vecinos ganan cuando la franja de cobertura, tipo de conexión, timer incluido, inventario multi-cabeza y notas de drenaje quedan congelados en el acuerdo.",
          qa: [
            {
              q: "¿Qué significa la franja de área de cobertura?",
              a: "Indica cuánto césped o cantero debe regar el equipo — parche pequeño, césped mediano, césped grande o kit multizona. Elige la franja que coincida con las cabezas o el goteo en las fotos, no solo el tamaño total del jardín.",
            },
            {
              q: "¿Qué es el tipo de conexión y por qué importa?",
              a: "Indica cómo se conecta al agua: rosca de manguera estándar, a través de un timer de manguera, tubería de goteo o acoples rápidos. Un tipo incorrecto significa que el inquilino llega sin el adaptador o cuerpo de timer adecuado.",
            },
            {
              q: "¿Cómo funcionan juntos timer incluido y fuente de energía?",
              a: "Timer incluido dice si un timer de manguera viene con las cabezas o si el anuncio es solo el timer. La fuente de energía es manual en aspersores pasivos y normalmente inalámbrica (batería) en timers — ambos quedan congelados en el acuerdo para que el inquilino sepa qué traer.",
            },
            {
              q: "¿Cuándo es obligatorio el inventario de piezas?",
              a: "Los sets multi-cabeza (dos o más), manifolds de cuatro o más cabezas y kits de líneas de goteo deben listar cada estaca, cabeza, splitter, acople rápido y adaptador de timer. El inquilino confirma la lista al reservar y cuenta piezas en la entrega y devolución.",
            },
            {
              q: "¿Qué son las notas de drenaje e invernalización?",
              a: "Indicaciones suaves — no un servicio de tienda — sobre vaciar el timer, drenar mangueras y enrollar líneas de goteo antes de devolver. Reducen disputas por manifolds agrietados y agua estancada en devoluciones de otoño.",
            },
            {
              q: "¿Qué no está incluido en un alquiler de aspersor?",
              a: "Salvo que el anfitrión lo indique: manguera de jardín, grifo exterior, factura de agua, hardware antirreflux, riego enterrado y seguro de jardín de terceros. Evorios no vende seguro de paisajismo ni es socio de mostradores de alquiler de grandes tiendas.",
            },
            {
              q: "¿Cómo funcionan depósito y reclamaciones?",
              a: "Cabezas, estacas, cuerpos de timer o manifolds de acople rápido faltantes o agrietados se revisan contra el inventario congelado y fotos de entrega. El desgaste normal del patrón de riego es esperado; daños más allá de las notas publicadas pueden usar el depósito según los términos.",
            },
            {
              q: "¿Qué se bloquea al reservar?",
              a: "Franja de cobertura, tipo de conexión, flag de timer, fuente de energía, franja de conteo de cabezas, checklist de piezas cuando aplica y notas de drenaje — más tu confirmación de inventario en kits multi-cabeza. Esos campos permanecen en el acuerdo hasta la devolución.",
            },
          ],
        },
        "Stump Grinders": {
          title: "Trituradoras de tocones — capacidad, EPP, briefing",
          summary: "Equipo de jardín cercano a construcción: diámetro de tocón, EPP, exención, prueba de seguro, factor de forma, combustible, viruta y briefing operativo antes de la entrega.",
          qa: [
            {
              q: "¿Por qué las trituradoras de tocones están restringidas?",
              a: "Los escombros voladores y el alto torque las acercan al riesgo de construcción ligera más que a un soplador. Capacidad, EPP, exención, prueba de seguro y briefing de seguridad bloquean la reserva hasta completarse.",
            },
            {
              q: "¿Qué significa la banda de capacidad de tocón?",
              a: "Es el diámetro máximo de tocón para el que está calificada la máquina — menos de 8 in, 8–16, 16–24 o 24 in+. No exceda la banda; molienda más profunda o madera dura puede requerir una unidad mayor.",
            },
            {
              q: "¿Qué EPP se espera?",
              a: "El anfitrión declara si incluye guía de ojos / oídos / guantes, EPP parcial, o si el arrendatario aporta todo el EPP. El arrendatario debe confirmar EPP al reservar y usarlo durante el uso.",
            },
            {
              q: "¿Qué prueba de seguro se requiere?",
              a: "El anfitrión fija bandas mínimas de responsabilidad y máximas de deducible. El arrendatario sube prueba que cumpla esas bandas antes de desbloquear la recogida.",
            },
            {
              q: "¿Qué es el briefing de seguridad?",
              a: "Cuando es obligatorio, el anfitrión marca el briefing listo y cubre arranque seguro, proyección de viruta, servicios públicos y transporte. El arrendatario confirma que completará el briefing en la entrega antes de operar.",
            },
            {
              q: "¿Qué cubren factor de forma, transporte y notas de viruta?",
              a: "El factor de forma es a pie, remolcable o autopropulsada. Las notas de transporte cubren remolque, peso y acceso por portón.",
            },
            {
              q: "¿Cómo funciona el combustible?",
              a: "Indique gasolina, diésel, eléctrico, propano u otro según aplique. En unidades de gasolina o diésel, espere full-to-full salvo que el anfitrión indique lo contrario en la entrega.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Evorios no asegura trabajo de jardín, no vende seguros ni asocia promos de Home Depot, Sunbelt, United Rentals o seguros de jardín tipo Progressive. La retención del depósito y la prueba del arrendatario son las capas principales.",
            },
          ],
        },
        "Tillers & Cultivators": {
          title: "Motocultores y cultivadores — ancho, profundidad, tines, transporte",
          summary: "Los motocultores pro necesitan ancho de trabajo, banda de profundidad, estado de tines, modelo, combustible si es gasolina o batería si es inalámbrico, y notas de transporte congeladas antes de la entrega.",
          qa: [
            {
              q: "¿Qué significan las bandas de ancho y profundidad?",
              a: "El ancho es el surco por pasada — mini cultivadores suelen ser bajo 12 in; motocultores traseros 18–24 in+. La profundidad es el corte real; suelo nuevo pide 8–10 in+, preparación ligera puede ser bajo 6 in.",
            },
            {
              q: "¿Por qué declarar el estado de los tines?",
              a: "Tines desafilados o doblados se atascan en arcilla y generan disputas de depósito. Marque nuevos/afilados, buen desgaste, desgastados o dañados — y fotografíe daños antes de la entrega.",
            },
            {
              q: "¿Qué pasa con el tipo de combustible?",
              a: "Si es gasolina, indique 4 tiempos vs mezcla 2 tiempos — combustible incorrecto puede gripan el motor. La devolución suele ser full-to-full en la entrega cuando hay fuelType; faltar combustible puede seguir la tarifa estándar del acuerdo.",
            },
            {
              q: "¿Y si el motocultor es inalámbrico?",
              a: "Diga cuántas baterías incluye, si hay cargador y si el arrendatario debe traer pack compatible. Cuente baterías y cargador al recoger y devolver — packs faltantes son la disputa de kit más común.",
            },
            {
              q: "¿Qué va en las notas de transporte?",
              a: "Motocultores traseros pueden superar 200 lb — indique si hace falta remolque, rampa o segunda persona, si los mangos se pliegan y si se necesita pickup. Sorpresas al recoger arruinan la ventana de siembra.",
            },
            {
              q: "¿Necesito EPI especial?",
              a: "Consejo suave: protección ocular, botas resistentes y guantes — los tines lanzan piedras y terrones. Evorios no suministra EPI ni seguro de trabajo de jardín; el anfitrión puede añadir detalles en el anuncio.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin operador, sin análisis de suelo, sin producto de seguro de jardín de terceros y sin garantía de calidad del labrado — el arrendatario opera según manual y normas locales (llame antes de cavar).",
            },
            {
              q: "¿Cómo funcionan depósito y reclamaciones?",
              a: "Dimensione el depósito al motor, tines y baterías. Tines doblados, cajas agrietadas o baterías faltantes siguen los términos y fotos de entrega — no un upsell de seguro afiliado.",
            },
          ],
        },
        "Trees": {
          title: "Árboles — nombre, salud, política de trasplante",
          summary: "Los viveros locales etiquetan especie, zona y formato de raíz. Ganamos con anuncios entre vecinos cuando nombre común/cultivar, altura, sol, perennifolio/caducifolio, clase de contenedor, zona de rusticidad, grado de salud, reglas de trasplante/devolución y notas de plaga/suelo quedan congelados en el acuerdo.",
          qa: [
            {
              q: "¿Por qué es obligatorio el nombre común o cultivar?",
              a: "Especie y cultivar fijan tamaño, color e interés otoñal — un 'árbol de sombra' genérico genera desajustes. Nombra la planta como en la etiqueta del vivero.",
            },
            {
              q: "¿Qué significa el grado de salud de la planta?",
              a: "Excellent/good/fair/stressed_disclosed refleja bandas de vivero. Stressed_disclosed significa problemas visibles (muerte regresiva, plagas, B&B suelto) declarados de antemano.",
            },
            {
              q: "¿Cómo funciona la política de trasplante/devolución en alquiler?",
              a: "Keep_planted_no_return implica plantación estilo venta. Return_in_container y event_rental_return_pot exigen devolver el árbol en la maceta o B&B original — elige según tu modo de anuncio y tarifa.",
            },
            {
              q: "¿Por qué listar zona de rusticidad y notas de suelo/drenaje?",
              a: "Los árboles exteriores fallan fuera de zona o en arcilla húmeda. Bandas USDA y una nota breve de drenaje evitan el arrepentimiento #1 post-alquiler.",
            },
            {
              q: "¿Qué deben cubrir las notas de plaga y enfermedad?",
              a: "Declara cochinilla, barrenadores, manchas fúngicas o tratamiento reciente. 'Nada observado esta temporada' es válido.",
            },
            {
              q: "¿Qué NO incluye el alquiler de un árbol?",
              a: "Evorios no vende seguro de vivero, servicios de plantación ni trámites municipales. Entrega, tutorado e riego post-entrega son entre anfitrión e inquilino salvo que el anuncio diga lo contrario.",
            },
            {
              q: "¿Cómo funcionan depósitos y reclamos?",
              a: "El grado de salud y la clase de contenedor publicados son la línea base. Daño más allá del estrés declarado ( líderes rotos, bola de raíz rasgada, sequía) puede usar depósito según términos.",
            },
          ],
        },
        "Trimmers": {
          title: "Desbrozadoras — cabeza, combustible, línea",
          summary: "Mostradores de alquiler congelan ancho de corte, hilo vs cuchilla, arnés, mezcla o plataforma de batería y desgaste de bobina en el ticket. En anuncios entre vecinos igual — depósito y ack del kit, sin promo de seguro de jardín.",
          qa: [
            {
              q: "¿Qué significan las puertas del anuncio?",
              a: "Marca, modelo, fuente de energía, ancho de corte, tipo de cabeza, arnés, combustible o franja de batería, estado de línea/cuchilla y checklist del kit quedan congelados en el acuerdo antes de reservar. Reflejan la entrega de mostrador para evitar sorpresas con bobina, cuchilla o cargador faltante.",
            },
            {
              q: "¿Por qué importa hilo vs cuchilla metálica?",
              a: "Las cabezas de hilo recortan césped y maleza ligera; las cuchillas en desbrozadoras cortan matorral denso y arrojan desechos más lejos. La reserva muestra el tipo de cabeza para acertar el trabajo y saber cuándo aplican reglas de seguridad con cuchilla.",
            },
            {
              q: "¿Necesito protección ocular y auditiva?",
              a: "Los desechos voladores y el ruido del motor hacen estándar gafas y protección auditiva en desbrozadoras. El anuncio puede indicar si las traes tú o el anfitrión incluye gafas básicas — consejo suave de seguridad, no seguro ni waiver de fresadora de tocón.",
            },
            {
              q: "¿Gasolina — tipo de combustible y mezcla?",
              a: "La mayoría usa mezcla 2 tiempos; algunas solo gasolina 4 tiempos. El anuncio indica tipo de combustible y notas de mezcla opcionales (proporción, quién aporta aceite).",
            },
            {
              q: "¿Inalámbrica — plataforma de batería y cargador?",
              a: "La familia de voltaje (18V/20V, 40V, 60V+) debe coincidir con la batería y cargador del checklist. La plataforma equivocada impide terminar el trabajo — confirma número de baterías y cargador en la entrega.",
            },
            {
              q: "¿Arnés en unidades pesadas?",
              a: "Ejes rectos y desbrozadoras con cuchilla suelen necesitar arnés de hombro para trabajar con seguridad más de unos minutos. El anuncio indica si hay arnés completo, solo correa o ninguno — para no sostener solo una unidad pesada.",
            },
            {
              q: "¿Estado de línea, bobina y cuchilla al devolver?",
              a: "El desgaste normal de línea se espera; bobina vacía o cuchilla mellada más allá de la franja publicada puede generar tarifa de recarga o afilado del depósito. Fotografía cabeza y bobina al recoger y devolver si el estado es límite.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Evorios no vende seguro de trabajo de jardín, planes de alquiler de mostrador ni waivers de terceros. El depósito cubre bobinas, cuchillas, cargadores faltantes o daño más allá del desgaste normal; el riesgo de lesión queda en uso seguro y tu EPI.",
            },
          ],
        },
      },
    "Gym & Fitness": {
        "Boxing Equipment": {
          title: "Boxeo — tipo, talla, higiene, uso",
          summary: "Los kits de fin de semana ganan cuando tipo de equipo, peso del saco, talla de guantes, wipe/liner, inventario de par, soporte/anclaje y política bag-only vs sparring quedan congelados con la exención.",
          qa: [
            {
              q: "¿Qué significa el tipo de equipo?",
                a: "Divide el anuncio en saco, guantes, pads/mitts, material de esquina de ring o kit mixto. Eso activa talla de guantes, soporte/anclaje y la profundidad del inventario.",
            },
            {
              q: "¿Cómo funcionan la banda de peso y la talla de guantes?",
                a: "La banda de peso es la masa del saco lleno (o equipo ligero bajo 10 lb). La talla de guantes es youth a XXL o pares mixtos — obligatoria en guantes y mix para que la entrega coincida con la ficha.",
            },
            {
              q: "¿Cuál es la política de higiene / wipe o liner?",
                a: "El anfitrión indica wipe antes de devolver, liner o vendas obligatorias, sanitización entre alquileres, guantes propios del arrendatario, o sin contacto con piel. Notas suaves pueden añadir spray — no promo de lavandería.",
            },
            {
              q: "¿Por qué es obligatorio el inventario de par / set?",
                a: "Guantes izquierdo/derecho, vendas, pads, cadenas y piezas de esquina se pierden tras el fin de semana. El arrendatario confirma el inventario al reservar y cuenta piezas en entrega y devolución.",
            },
            {
              q: "¿Se incluye soporte o anclaje?",
                a: "En saco, mix y esquina de ring se declara soporte, anclaje de techo/pared incluido, anclaje no incluido, base freestanding o N/A. El arrendatario debe saber si necesita montaje propio.",
            },
            {
              q: "¿Qué es la política bag-only vs sparring?",
                a: "El anfitrión fija solo saco, solo pads, sparring bajo reglas del anfitrión, o solo demo. Evorios no certifica coaches ni sanciona sparring — rige la regla publicada del anfitrión.",
            },
            {
              q: "¿Cómo funciona la exención de responsabilidad?",
                a: "Los alquileres de Gym & Fitness suelen exigir exención al reservar salvo que el anfitrión marque not required. La exención cubre riesgo ordinario de lesión; el depósito cubre daño y piezas faltantes — no un seguro de gimnasio.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "Salvo que conste: coaching, protector bucal, casco, membresía de gym, kits Title Boxing y cualquier seguro deportivo de terceros. Evorios no vende seguro de boxeo ni es socio de tiendas fight.",
            },
          ],
        },
        "Cardio Equipment": {
          title: "Equipo cardio — tipo, peso, limpieza",
          summary: "Bicis, elípticas, remos y stair climbers de casa se alquilan bien cuando marca, modelo, peso máx. de usuario, energía, plegado/huella, escaleras, política de limpieza, waiver y nota de que la garantía no está incluida quedan en el acuerdo — garantía no es seguro.",
          qa: [
            {
              q: "¿Qué puertas aplican antes de alquilar cardio?",
                a: "Los anuncios de alquiler congelan marca, modelo, tipo de cardio, plegado, energía (enchufe vs batería), banda de peso del equipo, peso máx. de usuario, divulgación de escaleras, política de limpieza, nota de garantía no incluida y estado del waiver. Tips suaves cubren protección del piso y huella.",
            },
            {
              q: "¿Bici, elíptica, remo — o cinta comercial?",
                a: "Este estante personal es para bicis upright/spin/reclinadas, elípticas, remos, stair climbers y otro cardio de casa. Cintas comerciales de tamaño completo van en Commercial Treadmills para puertas pro de mudanza y capacidad.",
            },
            {
              q: "¿Por qué peso máx. de usuario y banda de peso del equipo?",
                a: "El peso máx. de usuario es un límite de seguridad. La banda de peso del equipo ayuda a planear carga y escaleras. Respete el máximo publicado; excederlo puede dañar el marco y usar el depósito según términos.",
            },
            {
              q: "¿Qué pasa con energía, plegado, pisos y escaleras?",
                a: "La energía indica enchufe, batería, dual o ninguna/manual. Plegado y huella definen si cabe en el apartamento. Escaleras es una nota suave de entrega — dos personas, ascensor o solo entrega del anfitrión — no una mudanza contratada.",
            },
            {
              q: "¿Cuál es la regla de limpieza / wipe?",
                a: "El anfitrión define limpiar antes de devolver, limpieza del anfitrión con tarifa fija, toallitas incluidas, o sudor ligero OK como recibido. Confirme al reservar; residuo fuera de política puede afectar el depósito.",
            },
            {
              q: "Waiver vs lesión — ¿qué acepto?",
                a: "Gym & Fitness por defecto exige waiver de responsabilidad / asunción de riesgo al reservar salvo que el anfitrión marque not required. El waiver cubre riesgo de lesión de uso ordinario entre vecinos; es aparte del depósito, que cubre daño al equipo.",
            },
            {
              q: "¿Incluye garantía del fabricante o seguro de gimnasio?",
                a: "No. Alquileres entre vecinos son as-is con nota suave de garantía no incluida. Evorios no vende seguro de gym, suscripciones de fitness conectado ni planes afiliados de Planet Fitness / Peloton / Mirror / Tonal.",
            },
            {
              q: "¿Si algo sale mal después del alquiler?",
                a: "La política de limpieza, límites de peso y specs de la máquina quedan congelados en el acuerdo. Daño por mal uso, baterías faltantes contra la energía listada o devolución sucia fuera de política se resuelven con depósito y mensajes — no con upsell de seguro.",
            },
          ],
        },
        "Commercial Treadmills": {
          title: "Cintas comerciales — potencia, peso, mudanza",
          summary: "Las cintas comerciales necesitan marca/modelo, HP del motor, límite de peso de usuario, deck/inclinación, 110/220, acceso de entrega, sanitización y responsabilidad clara de mudanza/instalación.",
          qa: [
            {
              q: "¿Por qué las cintas comerciales están restringidas?",
                a: "Motores pesados, altas cargas de usuario y límites de energía/acceso hacen costosas las entregas fallidas. Specs, sanitización, exención y responsabilidad de mudanza bloquean la reserva hasta completarse.",
            },
            {
              q: "¿Qué significan HP del motor y clase de uso comercial?",
                a: "La banda de HP es la potencia continua cuando se conoce. La clase de uso declara commercial-rated, light-commercial o home-use honesto — divulgación suave de deber, no un certificado de seguro.",
            },
            {
              q: "¿Qué es el peso máximo de usuario?",
                a: "La banda de peso nominal del anfitrión (hasta 200 / 250 / 300 lb, 300 lb+ o no calificado). No la exceda; arriesga banda, deck y disputas por lesión.",
            },
            {
              q: "¿Qué hay de energía, amperaje y notas de entrega?",
                a: "Indique 110/120 vs 208/220 (o dual / cableado fijo). La banda suave de amperios marca circuitos 15A vs 20A+. Las notas de entrega cubren escaleras, ascensor, ancho de paso y quién carga.",
            },
            {
              q: "¿Quién mueve e instala?",
                a: "El anfitrión declara si entrega e instala, solo entrega, el arrendatario recoge, se usa un mudancero tercero, o se encuentra en la acera. El mudancero tercero es divulgación — no una reserva de socio de Evorios.",
            },
            {
              q: "¿Qué significan sanitización y horas de uso?",
                a: "El anfitrión atestigua que barandas, consola y superficies de contacto de la banda se limpiaron antes del anuncio o la entrega. La banda suave de horas es un proxy de desgaste, no un odómetro garantizado.",
            },
            {
              q: "¿Cómo interactúan exención y depósito?",
                a: "La exención cubre la asunción de riesgo de lesión en uso ordinario. El depósito cubre daño al equipo y piezas faltantes. Son capas separadas.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "Evorios no asegura lesiones de gimnasio, no vende seguro gym ni asocia dealers Life Fitness, Peloton, Planet Fitness o promos de seguro. Exención + depósito + divulgaciones del anfitrión son las capas principales.",
            },
          ],
        },
        "Competition Gear": {
          title: "Material de competición — disciplina, discos, kit",
          summary: "Los préstamos para meets ganan cuando disciplina, notas suaves de federación, discos calibrados vs entrenamiento, inventario y notas de barra declaradas por el anfitrión quedan congelados con la exención — sin sello IWF de la plataforma.",
          qa: [
            {
              q: "¿Qué significa la banda de disciplina?",
                a: "Etiqueta el anuncio como powerlifting, weightlifting, CrossFit-style, strongman u other. Enmarca expectativas de discos y notas de federación / meet.",
            },
            {
              q: "¿Qué son las notas suaves de federación o reglas?",
                a: "Texto del anfitrión sobre un meet local, estándar de club o estilo federativo. No es una asociación oficial ni significa que Evorios certifique el material.",
            },
            {
              q: "¿Qué es la divulgación calibrados vs entrenamiento?",
                a: "El anfitrión debe decir si los discos son de competición calibrados, de entrenamiento/bumper, mixtos, implementos sin discos, o ask-host. Etiquetar mal “comp plates” es la disputa nº 1.",
            },
            {
              q: "¿Qué significa el texto suave de certificación de barra?",
                a: "Notas opcionales del anfitrión (afirmación del fabricante, uso previo en meet). Evorios no emite aprobación IWF, IPF ni ningún sello de plataforma.",
            },
            {
              q: "¿Por qué es obligatorio el inventario del kit?",
                a: "Barras, discos por denominación, collares, change plates, bloques y correas se pierden tras el meet. El arrendatario confirma la lista al reservar y cuenta piezas en entrega y devolución.",
            },
            {
              q: "¿Cómo aplica la banda de peso aquí?",
                a: "Úsala para la carga total del kit / set de discos (o adjustable en sets parciales). No es un max-user-weight de máquina — esa puerta no está en este estante.",
            },
            {
              q: "¿Cómo funcionan exención, depósito y reclamaciones?",
                a: "La exención cubre riesgo ordinario de lesión cuando es requerida. El depósito cubre barras dobladas, discos faltantes y collares dañados según el inventario. Evorios no vende seguro de competición.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "Salvo que conste: inscripción al meet, jueces, magnesio fuera del kit, packs Rogue retail y cualquier seguro deportivo de terceros. Nunca se implica sello IWF/IPF de la plataforma.",
            },
          ],
        },
        "Free Weights": {
          title: "Pesas libres — pares, piso, reglas de drop",
          summary: "Mancuernas, kettlebells y kits de discos se alquilan bien cuando banda de peso, par vs set, lista de piezas, rack, recubrimiento, protección de piso, política de drop y waiver están en el acuerdo — el depósito cubre daño al equipo, no seguro de gym.",
          qa: [
            {
              q: "¿Qué puertas aplican antes de alquilar pesas libres?",
                a: "Los anuncios de alquiler congelan banda de peso, forma par/unidad/set, banda de piezas, inclusión de rack/stand, tipo de recubrimiento, regla de protección de piso, política de drop y estado del waiver. Sets multipieza también exigen un checklist breve de cada pieza.",
            },
            {
              q: "Par vs set — ¿por qué importa el conteo?",
                a: "Un par son dos piezas; un kit puede incluir muchas mancuernas, discos, collares y abrazaderas. El checklist congela qué debe devolverse — discos o collares faltantes son la disputa #1.",
            },
            {
              q: "¿Incluye rack o stand?",
                a: "El anfitrión indica incluido, no incluido, complemento opcional o no aplica. No asuma un árbol de mancuernas salvo que el campo diga incluido.",
            },
            {
              q: "¿Goma vs hierro — y protección de piso?",
                a: "El recubrimiento (goma, uretano, hierro desnudo, cromo, mixto) afecta riesgo de piso y ruido. La protección puede ser tapete obligatorio, recomendado, bumper OK en piso desnudo, o tapete del anfitrión — confirme al reservar.",
            },
            {
              q: "¿Cuál es la política de drop?",
                a: "Sin drop, solo apoyar controlado, bumper drop OK, solo exterior, o anfitrión define en entrega. Tirar hierro desnudo contra no-drop puede dañar piso y equipo y usar el depósito.",
            },
            {
              q: "Waiver vs lesión — ¿qué acepto?",
                a: "Gym & Fitness por defecto exige waiver de responsabilidad / asunción de riesgo al reservar salvo que el anfitrión marque not required. El waiver cubre riesgo de lesión de uso ordinario; el depósito cubre pesas dañadas o faltantes — son aparte.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "Transferencia de garantía del fabricante, membresías de gym, spotting y seguro de terceros no están incluidos. Evorios no vende planes Planet Fitness ni productos afiliados de seguro.",
            },
            {
              q: "¿Si algo sale mal después del alquiler?",
                a: "La lista de kit, política de drop y reglas de recubrimiento/piso quedan congeladas en el acuerdo. Piezas faltantes, daño de piso contra mat-required o drops contra no-drop se resuelven con depósito y mensajes.",
            },
          ],
        },
        "Other": {
          title: "Otros — primero la estantería de gym correcta",
          summary: "Prefiera una estantería con nombre de Gym & Fitness para que apliquen las puertas correctas. Si se queda en Otros, declare tipo (cardio/pesas/yoga/recuperación/boxeo/competición/entrenamiento/mixto), mantenga banda de peso y waiver, atestigüe fotos de estado e inventarie cada pieza si es multipieza.",
          qa: [
            {
              q: "¿Debo usar Otros o una estantería con nombre?",
                a: "Reclasifique siempre que encaje una estantería específica — Yoga & Pilates, Cardio Equipment, Free Weights, Resistance Bands, Recovery Tools (personal), o Commercial Treadmills, Weight Machines, Boxing Equipment, Competition Gear, Training Systems (profesional). Las estanterías con nombre traen las puertas de energía, drop, higiene o capacidad correctas; Otros solo cuando el artículo no encaja en ninguna.",
            },
            {
              q: "¿Qué significa el discriminador de tipo?",
                a: "Cardio, pesas, yoga, recuperación, boxeo, competición, entrenamiento o mixto indica qué esperar y qué estantería con nombre debería usar. Mixto es un paquete que cruza tipos — declárelo con honestidad.",
            },
            {
              q: "¿Por qué siguen siendo obligatorios banda de peso y waiver?",
                a: "Gym & Fitness exige banda de peso/resistencia en toda la categoría y estado de waiver en alquiler. Otros no omite ese piso — incluso el catch-all congela qué tan pesado es el equipo y si el waiver es obligatorio al reservar.",
            },
            {
              q: "¿Necesito peso máx. de usuario en Otros?",
                a: "Las puertas duras de peso máx. de usuario están en Cardio Equipment, Commercial Treadmills y Weight Machines. Si su Otros es tipo cardio, añada peso máx. cuando pueda — o reclasifique para que aplique la puerta dura.",
            },
            {
              q: "¿Necesito inventario de piezas?",
                a: "Un solo artículo basta con los campos estructurados. Kits multipieza — packs de bandas, guantes+vendas, paquetes de recuperación — exigen un inventario breve en texto con cada pieza para entrega y devolución.",
            },
            {
              q: "¿Qué fotos de estado debo confirmar?",
                a: "Confirme que las fotos muestran el artículo en general, agarres/almohadillas/cables según corresponda, desgaste o daño visible y todas las piezas si es multipieza. Es un attest suave — no verificamos la subida — pero las fotos son la primera capa en disputas por piezas faltantes o daños.",
            },
            {
              q: "¿Waiver vs lesión — y qué no está incluido?",
                a: "El waiver (cuando es obligatorio) cubre riesgo de lesión de uso ordinario entre vecinos; el depósito cubre equipo dañado o faltante. Evorios no vende seguro de gym, suscripciones Peloton/Mirror/Tonal ni planes afiliados Planet Fitness — la transferencia de garantía no se implica en Otros.",
            },
            {
              q: "¿Cómo funcionan las reclamaciones en Otros?",
                a: "Use fotos de estado, inventario, banda de peso y depósito para piezas faltantes o daños. Prefiera una estantería con nombre la próxima vez para que las puertas especializadas (limpieza, drop, peso máx., energía) queden congeladas en el acuerdo desde el inicio.",
            },
          ],
        },
        "Recovery Tools": {
          title: "Herramientas de recuperación — tipo, autonomía, limpieza, exención",
          summary: "Rodillos y pistolas de masaje entre vecinos ganan cuando tipo, batería/autonomía, higiene, intensidad/velocidad, notas suaves de ruido y la exención quedan claros en el acuerdo.",
          qa: [
            {
              q: "¿Qué tipos de herramientas hay en esta estantería?",
                a: "Rodillos de espuma, pistolas de masaje, otros dispositivos de percusión, packs de hielo/calor, kits de pelotas de masaje, o kits mixtos. Elige el tipo según lo que usarás para que autonomía e intensidad apliquen bien.",
            },
            {
              q: "¿Por qué batería o autonomía en herramientas con motor?",
                a: "Pistolas y percusión necesitan carga o cable. El anuncio muestra menos de 30 min, 30–60 min, 60+ min, CA con cable, o desconocido — planifica la carga antes de una sesión larga. Rodillos y packs suelen no tener motor.",
            },
            {
              q: "¿Qué es la atestación de limpieza/higiene?",
                a: "El anfitrión indica limpio en la entrega, el inquilino limpia antes/después, funda obligatoria, o sellado sanitizado. Sigue la regla — estas herramientas tocan la piel y el siguiente inquilino depende de una devolución limpia.",
            },
            {
              q: "¿Qué significa intensidad o velocidad en una pistola?",
                a: "Baja, media, alta, multi-velocidad, o desconocida/variable. Empieza bajo en dispositivos desconocidos. La intensidad no es consejo médico — detente si el dolor es agudo y sigue la guía de uso ordinario del anfitrión.",
            },
            {
              q: "¿Por qué notas suaves de ruido?",
                a: "Las pistolas de percusión pueden molestar a vecinos en apartamentos. El anfitrión puede anotar horas tranquilas o ruido típico. Son expectativas suaves, no un certificado de dB medidos.",
            },
            {
              q: "¿Exención vs depósito — qué cubre cada uno?",
                a: "El depósito cubre rodillos rotos, cabezales perdidos, baterías más allá del uso justo y packs faltantes. La exención cubre el riesgo de lesión en uso ordinario. Son distintos — uno no sustituye al otro.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "No hay cita de fisioterapia, diagnóstico clínico ni membresía de gimnasio salvo que el anfitrión lo diga. Evorios no vende seguro de gimnasio ni cobertura afiliada de marcas de percusión — depósito y términos cubren daños y piezas faltantes.",
            },
          ],
        },
        "Resistance Bands": {
          title: "Bandas de resistencia — nivel, piezas, desgaste, exención",
          summary: "Kits de bandas entre vecinos ganan cuando nivel de resistencia, inventario, látex vs tela, anclaje, grado de desgaste/rotura y la exención quedan claros en el acuerdo.",
          qa: [
            {
              q: "¿Qué significa la banda de nivel de resistencia?",
                a: "Ligera a extra pesada describe el esfuerzo de una banda o un par. Set progresivo mixto significa varias fuerzas en un kit — revisa el inventario por color o etiqueta.",
            },
            {
              q: "¿Por qué listar cada pieza en un set?",
                a: "Asas, anclajes de puerta y loops pequeños se pierden tras entrenar en casa. Un checklist numerado al publicar y al devolver evita discusiones cuando está en juego el depósito.",
            },
            {
              q: "¿Látex vs tela — por qué importa el material?",
                a: "Loops y tubos de látex pueden romperse o disparar alergias; las bandas de tela se estiran distinto y rara vez fallan igual. Elige el material según tu piel y estilo de ejercicio.",
            },
            {
              q: "¿Incluye anclaje de puerta?",
                a: "El anuncio dice incluido, solo anclaje de puerta, no incluido, o lo entrega el anfitrión. Si no está incluido, planea movimientos a peso corporal o trae un anclaje seguro — no improvises en puertas frágiles.",
            },
            {
              q: "¿Qué es la revelación de desgaste/rotura?",
                a: "El anfitrión califica desde como nuevo hasta muescas visibles o reemplazar pronto. Inspecciona en la entrega; el látex gastado puede fallar bajo carga. El grado congela la base para no confundir marcas normales de estiramiento con daño nuevo.",
            },
            {
              q: "¿Exención vs depósito — qué cubre cada uno?",
                a: "El depósito cubre bandas rotas, asas faltantes y anclajes perdidos. La exención cubre el riesgo de lesión en uso ordinario (incluido el latigazo). Son distintos — uno no sustituye al otro.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "No hay entrenador personal, acceso a gimnasio ni membresía salvo que el anfitrión lo diga. Evorios no vende seguro de gimnasio ni cobertura afiliada de deportes — depósito y términos cubren daños y piezas faltantes.",
            },
          ],
        },
        "Training Systems": {
          title: "Sistemas de entrenamiento — tipo, instalación, wipe",
          summary: "Los pop-ups de estudio ganan cuando tipo de sistema, anclaje/instalación, banda de resistencia, máx. usuarios, inventario, altura libre y higiene wipe quedan congelados con la exención — sin promo Mirror, Tonal o TRX.",
          qa: [
            {
              q: "¿Qué significa el tipo de sistema?",
                a: "Divide el anuncio en suspensión (estilo correas), functional trainer / columna de cables, rack con accesorios, unidad smart guided tipo espejo, u other. Las etiquetas son genéricas — Evorios no promociona Mirror, Tonal ni TRX.",
            },
            {
              q: "¿Qué son los requisitos de anclaje e instalación?",
                a: "El anfitrión declara anclaje de puerta, montaje de techo o pared, freestanding, rack atornillado/con peso, anclaje del arrendatario, o instalación in situ. Notas suaves cubren grosor de puerta o huella.",
            },
            {
              q: "¿Cómo funcionan la banda de peso y el máx. de usuarios?",
                a: "La banda de peso es stack máx., resistencia, solo peso corporal o adjustable. Máx. usuarios es personas concurrentes (uno, dos, grupo pequeño, clase o not rated) — no es max-user-weight de máquina.",
            },
            {
              q: "¿Por qué importan las notas de altura / clearance?",
                a: "Correas de suspensión, racks y trainers de cable necesitan altura de techo y espacio de balanceo. El arrendatario confirma el espacio antes de la recogida; sin clearance hay techos dañados e instalaciones fallidas.",
            },
            {
              q: "¿Cuál es la política de higiene wipe?",
                a: "El anfitrión fija wipe de agarres tras cada uso, wipe antes de devolver, sanitiza el anfitrión, wipe de pantalla y agarres, o N/A solo exterior. Notas suaves pueden listar limpiadores aprobados.",
            },
            {
              q: "¿Por qué es obligatorio el inventario del kit?",
                a: "Asas, correas, mosquetones, anclajes de puerta, pasadores, cables, mandos y mats se pierden tras pop-ups. El arrendatario confirma la lista al reservar y cuenta piezas en entrega y devolución.",
            },
            {
              q: "¿Cómo funcionan exención, depósito y reclamaciones?",
                a: "La exención cubre riesgo ordinario de lesión cuando es requerida. El depósito cubre accesorios faltantes y daños más allá de las notas de wipe. Evorios no vende seguro de gimnasio.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "Salvo que conste: mano de obra de anclaje a pared, ingeniería estructural, Wi-Fi, coaching de clase, suscripciones Mirror/Tonal, kits TRX retail y cualquier seguro de gym de terceros. No hay enlaces de promo de marca en la reserva.",
            },
          ],
        },
        "Weight Machines": {
          title: "Máquinas de pesas — tipo, stack, huella",
          summary: "Máquinas selectorized, de cable, Smith y funcionales necesitan tipo, banda de stack o plate-loaded, peso máx. de usuario, huella, pin/selector, estado de montaje y sanitización.",
          qa: [
            {
              q: "¿Por qué las máquinas de pesas están restringidas?",
                a: "Stacks pesados, puntos de pellizco de cable y huellas incorrectas provocan entregas fallidas. Tipo, carga, huella, pin/selector, montaje, sanitización y la exención de categoría bloquean la reserva.",
            },
            {
              q: "¿Qué significa el tipo de máquina?",
                a: "Etiqueta cable crossover, stack selectorized, Smith, functional trainer, estación plate-loaded, multi-gym u otra — para que el arrendatario conozca el patrón de movimiento antes de reservar.",
            },
            {
              q: "¿Qué es la banda de resistencia / stack?",
                a: "Es el rango del weight stack, dual-stack, plate-loaded o desconocido. En plate-loaded use pin not-applicable. Respete la banda de peso máx. de usuario en pads y plataformas.",
            },
            {
              q: "¿Qué hay de huella, pin y montaje?",
                a: "La huella encaja el tamaño de la sala. La inclusión de pin/selector evita disputas por imanes faltantes. El estado de montaje dice armado, parcial, flat-pack, anfitrión instala, o instalación pro declarada.",
            },
            {
              q: "¿Qué es la divulgación de desgaste de cables?",
                a: "Un campo suave para máquinas de cable: cables OK, desgaste menor declarado, reemplazados recientemente, no es máquina de cable, o desconocido. Es divulgación — no una certificación.",
            },
            {
              q: "¿Qué sanitización se espera?",
                a: "El anfitrión atestigua que pads, agarres y pines se limpiaron antes del anuncio o la entrega. El arrendatario confirma higiene al reservar y devuelve superficies de contacto razonablemente limpias.",
            },
            {
              q: "¿Cómo interactúan exención y depósito?",
                a: "La exención cubre la asunción de riesgo de lesión en uso ordinario. El depósito cubre daño al equipo, pines faltantes y abuso de cables más allá del desgaste declarado. Son capas separadas.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "Evorios no asegura lesiones de gimnasio, no vende seguro gym ni asocia dealers Life Fitness, afiliados Rogue o promos de seguro. Exención + depósito + divulgaciones del anfitrión son las capas principales.",
            },
          ],
        },
        "Yoga & Pilates": {
          title: "Yoga y Pilates — esterilla, kit, limpieza, exención",
          summary: "Esterillas y kits entre vecinos ganan cuando grosor, superficie, inventario de bloques/correas, talla, reglas de limpieza y la exención quedan claros en el acuerdo.",
          qa: [
            {
              q: "¿Qué datos de la esterilla revisar antes de reservar?",
                a: "Grosor (viaje fino vs estándar vs acolchado grueso), tipo de superficie (PVC, TPE, caucho, corcho) y largo/talla. Definen comodidad, agarre y si cabe a tu altura o en la bolsa de viaje.",
            },
            {
              q: "¿Qué significan la banda del kit y el inventario?",
                a: "Solo esterilla es una pieza. Kits con bloques, correas, aros o pelotas deben listar cada pieza. Cuéntalas en la entrega — los props faltantes impulsan la mayoría de reclamos de depósito.",
            },
            {
              q: "¿Qué es la política de limpieza/higiene?",
                a: "El anfitrión elige limpiar antes y después, solo después, sanitizado en la entrega, o funda/toalla obligatoria. Sigue la regla publicada para que el equipo de contacto con la piel quede limpio para el siguiente.",
            },
            {
              q: "¿Por qué hay exención de responsabilidad en yoga?",
                a: "Yoga y Pilates aún pueden forzar articulaciones o provocar caídas. Si el anfitrión marca la exención como requerida, al reservar reconoces el riesgo de uso ordinario — alquilas a un vecino, no a una cadena de estudios.",
            },
            {
              q: "¿Qué significa weightBand en una esterilla?",
                a: "Es la banda de peso/sensación del equipo (a menudo bajo 10 lb o solo peso corporal), no tu límite de peso corporal. Esta estantería no usa peso máximo de usuario — esa puerta es para máquinas y cardio.",
            },
            {
              q: "¿Qué cubre el depósito vs la exención?",
                a: "El depósito cubre daños, manchas y bloques o correas faltantes. La exención cubre el riesgo de lesión en uso ordinario. Son distintos — uno no sustituye al otro.",
            },
            {
              q: "¿Qué no está incluido?",
                a: "No hay clase de estudio, instructor ni membresía de gimnasio salvo que el anfitrión lo diga. Evorios no vende seguro de gimnasio ni cobertura afiliada Planet Fitness / estudios — depósito y términos cubren daños y piezas faltantes.",
            },
          ],
        },
      },
    "Costume & Cosplay": {
        "Halloween Costumes": {
            title: "FAQ de disfraces de Halloween",
            summary: "Respuestas cortas sobre talla, piezas, glitter y limpieza.",
            qa: [
              {
                q: "¿Talla / audiencia?",
                a: "Según size/fits y banda kids/teen/adult/family.",
              },
              {
                q: "¿Qué piezas?",
                a: "Lista completa (máscara, guantes, props)—cuenta en la entrega.",
              },
              {
                q: "¿Glitter/maquillaje al devolver?",
                a: "Según notas; puede aplicar tarifa de limpieza.",
              },
              {
                q: "¿Humo/fog?",
                a: "Solo si la política lo permite.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Roturas y piezas faltantes más allá de la tarifa.",
              },
            ],
          },
        "Character Costumes": {
            title: "FAQ de disfraces de personaje",
            summary: "Respuestas cortas sobre personaje, set y ajuste.",
            qa: [
              {
                q: "¿Qué personaje?",
                a: "El anuncio nombra el personaje y set completo/parcial.",
              },
              {
                q: "¿Qué piezas?",
                a: "Cada pieza inventariada—revisa fotos al recoger.",
              },
              {
                q: "¿Prueba de talla?",
                a: "Sigue las notas de try-on/fit.",
              },
              {
                q: "¿IP / licencias?",
                a: "El anfitrión maneja uso IP-safe; Evorios no limpia licencias.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas faltantes y roturas más allá de la tarifa de limpieza.",
              },
            ],
          },
        "Wigs & Accessories": {
            title: "FAQ de pelucas y accesorios",
            summary: "Respuestas cortas sobre sanitización, fibra y reset de estilo.",
            qa: [
              {
                q: "¿Está sanitizada?",
                a: "El anfitrión lo atestigua entre huéspedes—higiene al reservar.",
              },
              {
                q: "¿Fibra y talla de gorra?",
                a: "Tipo de fibra y banda de gorra en el anuncio—calor según fibra.",
              },
              {
                q: "¿Puedo peinar de nuevo?",
                a: "Solo dentro de la política de style-reset/return.",
              },
              {
                q: "¿Tarifa de limpieza?",
                a: "Solo si está publicada.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Fibra derretida, encaje cortado y clips faltantes.",
              },
            ],
          },
        "Period Costumes": {
            title: "FAQ de trajes de época",
            summary: "Respuestas cortas sobre era, devolución delicada y sin alteraciones.",
            qa: [
              {
                q: "¿Qué era?",
                a: "La banda de era está en el anuncio—confirma antes de reservar.",
              },
              {
                q: "¿Puedo alterar o doblar?",
                a: "No—política de no alteraciones.",
              },
              {
                q: "¿Cómo devolver?",
                a: "Dry-clean-friendly / devolución publicada + tarifa opcional.",
              },
              {
                q: "¿Qué piezas?",
                a: "Inventario multipieza incluyendo capas inferiores si están listadas.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Roturas delicadas, manchas, piezas faltantes y alteraciones no autorizadas.",
              },
            ],
          },
        "Masks & Makeup": {
            title: "FAQ de máscaras y maquillaje",
            summary: "Respuestas cortas sobre sanitización, sellado y contacto con la piel.",
            qa: [
              {
                q: "¿Está sanitizado?",
                a: "Sí entre huéspedes—higiene al reservar.",
              },
              {
                q: "¿Sellado o abierto?",
                a: "El anuncio lo declara; prefiere sellado.",
              },
              {
                q: "¿Qué toca la piel?",
                a: "Tipo máscara/espuma/pintura publicado.",
              },
              {
                q: "¿Alergias?",
                a: "Solo notas suaves—no consejo médico.",
              },
              {
                q: "¿Cosméticos contaminados?",
                a: "No relistes—reemplaza primero.",
              },
            ],
          },
        "Other": {
            title: "FAQ de otros disfraces",
            summary: "Respuestas cortas cuando no cabe un estante con nombre.",
            qa: [
              {
                q: "¿Usar Other?",
                a: "Prefiere un estante con nombre para las reglas correctas.",
              },
              {
                q: "¿Qué declarar?",
                a: "Material, devolución/limpieza, fotos de condición e inventario si es multipieza.",
              },
              {
                q: "¿Tarifa de limpieza?",
                a: "Solo si el anfitrión la publica.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Manchas, roturas y piezas faltantes tras la tarifa.",
              },
              {
                q: "¿Tintorería socia?",
                a: "No—tú o el huésped organizan la limpieza.",
              },
            ],
          },
        "Theater Costumes": {
            title: "FAQ de vestuario teatral",
            summary: "Respuestas cortas sobre inventario, ventana de función y sin alteraciones.",
            qa: [
              {
                q: "¿Qué piezas?",
                a: "Cada pieza de vestuario—cuenta en entrega y devolución.",
              },
              {
                q: "¿Puedo alterar?",
                a: "No—sin alteraciones salvo que el anuncio diga lo contrario.",
              },
              {
                q: "¿Ventana de función?",
                a: "Fechas de show/run en el anuncio.",
              },
              {
                q: "¿Tarifa de limpieza?",
                a: "Si existe, queda en el acuerdo.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas faltantes y cortes/dobladillos no autorizados.",
              },
            ],
          },
        "Film & TV Props": {
            title: "FAQ de props de cine/TV",
            summary: "Respuestas cortas sobre hero vs background, frágil y looksafe.",
            qa: [
              {
                q: "¿Hero o background?",
                a: "El grado de rol está en el anuncio—hero requiere más cuidado.",
              },
              {
                q: "¿Cómo se rastrean?",
                a: "Inventario completo en entrega y devolución.",
              },
              {
                q: "¿Armas reales?",
                a: "No—solo réplicas looksafe.",
              },
              {
                q: "¿Manejo frágil?",
                a: "Sigue la banda frágil y tags de continuidad.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas hero faltantes/rotas y daño superficial.",
              },
            ],
          },
        "Professional Makeup Kits": {
            title: "FAQ de kits de maquillaje pro",
            summary: "Respuestas cortas sobre sanitización, refill sellado e inventario de brochas.",
            qa: [
              {
                q: "¿Kit sanitizado?",
                a: "Sí entre artistas.",
              },
              {
                q: "¿Sellado vs abierto?",
                a: "Según la política sealed/refill.",
              },
              {
                q: "¿Cuántas brochas?",
                a: "Banda de brochas + inventario—cuenta al devolver.",
              },
              {
                q: "¿Claims médicos?",
                a: "Solo notas skin-safe suaves.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Brochas/paletas faltantes; reemplaza productos abiertos contaminados.",
              },
            ],
          },
        "Animatronic Props": {
            title: "FAQ de animatrónicos",
            summary: "Respuestas cortas sobre energía, runtime, exención y demo.",
            qa: [
              {
                q: "¿Energía y runtime?",
                a: "Battery/AC/air/static y banda de runtime en el anuncio.",
              },
              {
                q: "¿Exención?",
                a: "Sí al reservar.",
              },
              {
                q: "¿Demo?",
                a: "El anfitrión muestra start/stop y zonas keep-clear en la entrega.",
              },
              {
                q: "¿Interior/exterior?",
                a: "Sigue los límites del entorno.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Daño mecánico y mandos faltantes.",
              },
            ],
          },
        "Full Character Suits": {
            title: "FAQ de trajes completos",
            summary: "Respuestas cortas sobre calor, higiene, ciclos de uso y spotter.",
            qa: [
              {
                q: "¿Calor y visibilidad?",
                a: "El anfitrión atestigua la guía—confirma antes de reservar.",
              },
              {
                q: "¿Interior sanitizado?",
                a: "Sí entre huéspedes.",
              },
              {
                q: "¿Cuánto tiempo continuo?",
                a: "Respeta el máximo de minutos continuos; toma pausas.",
              },
              {
                q: "¿Spotter?",
                a: "Según la política de handler/spotter.",
              },
              {
                q: "¿Exención?",
                a: "Sí. Las notas de uso no son consejo médico.",
              },
            ],
          },
      },
    "Baby & Kids": {
        "Car Seats": {
            title: "FAQ de sillas de auto",
            summary: "Respuestas cortas sobre caducidad, estándar y sanitización.",
            qa: [
              {
                q: "¿Vencida / recall?",
                a: "No—publicar y reservar se bloquean.",
              },
              {
                q: "¿Qué estándar?",
                a: "El anfitrión declara FMVSS (US) o ECE R129/R44 (EU) de la etiqueta.",
              },
              {
                q: "¿Sanitización?",
                a: "Sí entre huéspedes—confirma al reservar.",
              },
              {
                q: "¿Qué foto?",
                a: "Foto clara de la etiqueta en el anuncio.",
              },
              {
                q: "¿Tras un choque?",
                a: "Nunca relistar—no entregues.",
              },
            ],
          },
        "Cribs & Beds": {
            title: "FAQ de cunas",
            summary: "Respuestas cortas sobre estándar de sueño, drop-side y colchón.",
            qa: [
              {
                q: "¿Drop-side?",
                a: "No.",
              },
              {
                q: "¿Qué estándar de sueño?",
                a: "CPSC, EN 716 u otro regional de la etiqueta.",
              },
              {
                q: "¿Colchón?",
                a: "Firme según el anuncio; sanitiza la superficie de sueño.",
              },
              {
                q: "¿Protectores / mantas sueltas?",
                a: "No las uses.",
              },
              {
                q: "¿Qué confirma el huésped?",
                a: "Estándar de sueño, recall, colchón y sanitización al reservar.",
              },
            ],
          },
        "Strollers": {
            title: "FAQ de cochecitos",
            summary: "Respuestas cortas sobre tipo, peso e higiene.",
            qa: [
              {
                q: "¿Qué tipo?",
                a: "Travel, jogger, double u otro—en el anuncio.",
              },
              {
                q: "¿Edad/peso?",
                a: "Respeta los límites.",
              },
              {
                q: "¿Sanitización?",
                a: "Sí entre huéspedes.",
              },
              {
                q: "¿Adaptadores de silla?",
                a: "Solo si están listados—faltantes = inventario.",
              },
              {
                q: "¿Qué revisar al recoger?",
                a: "Frenos/ruedas y recall.",
              },
            ],
          },
        "Baby Carriers": {
            title: "FAQ de portabebés",
            summary: "Respuestas cortas sobre peso, higiene y ajuste.",
            qa: [
              {
                q: "¿Edad/peso?",
                a: "Respeta la banda (newborn vs toddler si aplica).",
              },
              {
                q: "¿Tela sanitizada?",
                a: "Sí entre huéspedes.",
              },
              {
                q: "¿Recall?",
                a: "Obligatorio antes de alquilar.",
              },
              {
                q: "¿Ajuste?",
                a: "Según la guía del fabricante—sin claims médicos de Evorios.",
              },
              {
                q: "¿Hebillas dañadas?",
                a: "No alquiles—detén la entrega.",
              },
            ],
          },
        "Toys & Games": {
            title: "FAQ de juguetes",
            summary: "Respuestas cortas sobre edad, piezas pequeñas y conteo.",
            qa: [
              {
                q: "¿Edad / hazard?",
                a: "Mantén etiquetas 0+/3+/8+ (o las listadas)—no las quites.",
              },
              {
                q: "¿Sanitización?",
                a: "Sí entre huéspedes.",
              },
              {
                q: "¿Piezas pequeñas?",
                a: "Sigue la banda de hazard para evitar atragantamiento.",
              },
              {
                q: "¿Cómo rastrear piezas?",
                a: "Cuenta al recoger y al devolver.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas faltantes.",
              },
            ],
          },
        "Other": {
            title: "FAQ de otro baby gear",
            summary: "Respuestas cortas cuando no cabe un estante con nombre.",
            qa: [
              {
                q: "¿Usar Other?",
                a: "Prefiere Car Seats, Cribs, Strollers o Carriers en lo crítico.",
              },
              {
                q: "¿Básicos?",
                a: "Edad/peso si toca al niño + depósito y términos.",
              },
              {
                q: "¿Higiene?",
                a: "Sanitiza superficies de alto contacto también en Other.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Condición documentada en la entrega.",
              },
              {
                q: "¿Faltan reglas especializadas?",
                a: "Reubica al estante correcto.",
              },
            ],
          },
        "Commercial Play Equipment": {
            title: "FAQ de juego comercial",
            summary: "Respuestas cortas sobre certificación, capacidad y exención.",
            qa: [
              {
                q: "¿Qué certificación?",
                a: "ASTM F1487 / CPSC / EN 1176 (o listada)—el anfitrión declara.",
              },
              {
                q: "¿Capacidad?",
                a: "No excedas la publicada.",
              },
              {
                q: "¿Exención?",
                a: "Sí al reservar.",
              },
              {
                q: "¿Sanitizar entre grupos?",
                a: "Sí.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Montaje en la entrega; sobrecapacidad es riesgo compartido.",
              },
            ],
          },
        "Group Activity Gear": {
            title: "FAQ de actividad grupal",
            summary: "Respuestas cortas sobre higiene compartida e inventario.",
            qa: [
              {
                q: "¿Sanitizar entre grupos?",
                a: "Sí—más recall.",
              },
              {
                q: "¿Banda de edad?",
                a: "Respeta la publicada.",
              },
              {
                q: "¿Inventario?",
                a: "Cuenta al recoger y al devolver.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas faltantes.",
              },
              {
                q: "¿Por qué higiene?",
                a: "Equipo infantil compartido = gérmenes y piezas perdidas.",
              },
            ],
          },
        "Educational Tools": {
            title: "FAQ de herramientas educativas",
            summary: "Respuestas cortas sobre edad, limpieza y cargadores.",
            qa: [
              {
                q: "¿Banda de edad?",
                a: "Solo dentro del rango publicado.",
              },
              {
                q: "¿Sanitización?",
                a: "Sí—superficies de contacto entre huéspedes.",
              },
              {
                q: "¿Electrónica con baterías?",
                a: "Recall-check; cargadores en inventario.",
              },
              {
                q: "¿Qué revisar en la entrega?",
                a: "Encendido y presencia del cargador.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Cargadores faltantes y piezas dañadas.",
              },
            ],
          },
        "Safety Systems": {
            title: "FAQ de sistemas de seguridad",
            summary: "Respuestas cortas sobre barreras, monitores e instalación.",
            qa: [
              {
                q: "¿Cómo se instala?",
                a: "Según la ruta: documented / renter with guide / pro.",
              },
              {
                q: "¿Barreras a presión en escaleras?",
                a: "No en la cima—solo montaje con hardware si se requiere.",
              },
              {
                q: "¿Hardware incluido?",
                a: "Cuenta soportes en entrega y devolución.",
              },
              {
                q: "¿Qué confirma el huésped?",
                a: "Ruta de instalación antes del desbloqueo.",
              },
              {
                q: "¿Soportes faltantes?",
                a: "Reclamo de inventario contra el depósito.",
              },
            ],
          },
        "Childcare Equipment": {
            title: "FAQ de equipo de childcare",
            summary: "Respuestas cortas sobre tronas, columpios y bouncers.",
            qa: [
              {
                q: "¿Edad/peso?",
                a: "Respeta los límites.",
              },
              {
                q: "¿Qué sanitizar?",
                a: "Bandejas, arneses y superficies de alto contacto.",
              },
              {
                q: "¿Recall?",
                a: "Obligatorio antes de alquilar.",
              },
              {
                q: "¿Arnés roto?",
                a: "No alquiles—detén la entrega.",
              },
              {
                q: "¿Qué confirma el huésped?",
                a: "Higiene y recall al reservar.",
              },
            ],
          },
      },
    "Heavy Equipment": {
        "Generators": {
          title: "Generadores — fase, arranque, autonomía, ruido",
          summary: "Los generadores portátiles y de respaldo se alquilan bien cuando fase, arranque, autonomía, interruptor de transferencia, ruido, potencia/combustible, seguro e inventario de cables/aceite quedan fijados.",
          qa: [
            {
              q: "¿Qué requisitos hay antes de alquilar un generador?",
              a: "El alquiler fija marca, potencia, combustible, fase, arranque, autonomía, transferencia, ruido, bandas de seguro y un checklist corto (cables, aceite, embudo). Solo profesionales sigue activo salvo que el anfitrión lo apague.",
            },
            {
              q: "¿Monofásico, split o trifásico?",
              a: "La fase indica qué cargas puedes alimentar. Inversor portátil es para electrónica sensible — no para una planta trifásica de obra.",
            },
            {
              q: "¿Incluye interruptor de transferencia?",
              a: "El anfitrión marca incluido / no / lo aporta el arrendatario / N/A portátil. Un panel mal hecho no lo cubre el depósito.",
            },
            {
              q: "¿Combustible, aceite y devolución?",
              a: "El tipo de combustible está en el anuncio. Devuelve según las notas — suele ser como se recibió. Combustible incorrecto = riesgo de depósito.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Generadores personales no. Generadores industriales sí — prueba general de operador antes de la entrega.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Prueba de daño físico antes del PIN/llaves. La retención ≈ deducible; el seguro es primario. Cables faltantes van al depósito.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin electricista, sin interconexión a red, sin promo de flota nacional. Evorios no vende seguros de generador.",
            },
          ],
        },
        "Air Compressors": {
          title: "Compresores — CFM, tanque, PSI, manguera",
          summary: "Los compresores de vecindario necesitan CFM, tamaño de tanque, PSI máx., tipo de accionamiento, kit de manguera, potencia/combustible, seguro e inventario.",
          qa: [
            {
              q: "¿Qué requisitos aplican?",
              a: "El alquiler fija marca, potencia/combustible, CFM, tanque, PSI, accionamiento, kit de manguera, seguro e inventario.",
            },
            {
              q: "¿Cómo van juntos CFM y PSI?",
              a: "CFM es caudal para herramientas; PSI es presión. CFM bajo frena clavadoras — respeta las bandas.",
            },
            {
              q: "¿Incluye manguera y acoples?",
              a: "Kit completo / parcial / solo acoples / lo aporta el arrendatario. Cuenta en la entrega.",
            },
            {
              q: "¿Eléctrico vs gasolina?",
              a: "El accionamiento fija toma vs combustible. Gasolina al aire libre; eléctrico según el circuito publicado.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Prueba de daño físico antes del inicio; depósito ≈ deducible. Mangueras faltantes al depósito.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin suscripción de aceite, sin afiliado de flota, sin upsell de seguro.",
            },
          ],
        },
        "Pressure Washers": {
          title: "Hidrolavadoras — PSI, GPM, lanza, superficies",
          summary: "Las hidrolavadoras se alquilan con PSI, GPM, fuente de energía, kit de lanza/boquillas, política de superficies, seguro e inventario.",
          qa: [
            {
              q: "¿Qué requisitos aplican?",
              a: "PSI, GPM, fuente, kit de lanza, política de superficies, potencia/combustible, seguro e inventario.",
            },
            {
              q: "¿Puedo lavar fachada blanda o vehículos?",
              a: "Solo si la política de superficies lo permite. Solo hardscape = no fachada blanda.",
            },
            {
              q: "¿Qué boquillas y lanzas vienen?",
              a: "Kit completo / parcial / solo lanza / nada — cuenta en la entrega.",
            },
            {
              q: "¿Agua caliente vs fría?",
              a: "Fuente: eléctrica, gasolina o diésel de agua caliente si está listado.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Prueba de daño + depósito ≈ deducible. Daño fuera de política al depósito.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin jabón por suscripción, sin promo de detailing, sin seguro de hidrolavadora de Evorios.",
            },
          ],
        },
        "Winches": {
          title: "Cabrestantes — capacidad, montaje, cable, mando",
          summary: "Los cabrestantes necesitan capacidad, montaje, tipo de cable, mando, polea, credencial de operador, seguro e inventario.",
          qa: [
            {
              q: "¿Qué requisitos aplican?",
              a: "Capacidad, montaje, cable, mando, polea, potencia/combustible, seguro, inventario + credencial heavy general.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Sí — los cabrestantes van por la vía de credencial heavy general.",
            },
            {
              q: "¿Cable de acero vs sintético?",
              a: "El tipo de línea queda fijo. No sustituyas. Daños frente a fotos = base de reclamación.",
            },
            {
              q: "¿Incluye polea o mando?",
              a: "El anfitrión marca incluido / no / N/A. Cuenta en la entrega.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Prueba de daño físico; depósito ≈ deducible.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin equipo de rescate, sin promo Warn, sin upsell de seguro off-road.",
            },
          ],
        },
        "Pumps": {
          title: "Bombas — tipo, caudal, racores, sólidos",
          summary: "Bombas de trasiego y basura necesitan tipo, caudal, tamaño de entrada/salida, manejo de sólidos, mangueras, seguro e inventario.",
          qa: [
            {
              q: "¿Qué requisitos aplican?",
              a: "Tipo, GPM, entrada/salida, sólidos, mangueras, potencia/combustible, seguro e inventario.",
            },
            {
              q: "¿Agua limpia vs sólidos de basura?",
              a: "La banda de sólidos dice qué puedes pasar. Forzar basura en bomba de agua limpia destruye el impulsor.",
            },
            {
              q: "¿Incluye mangueras de succión y descarga?",
              a: "Ambas / solo succión / solo descarga / parcial / ninguna.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Pumps personales no. Heavy Pumps sí.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Prueba de daño; depósito ≈ deducible.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin fontanero a demanda, sin promo de remediación por inundación.",
            },
          ],
        },
        "Industrial Generators": {
          title: "Generadores industriales — régimen, montaje, puesta a tierra",
          summary: "Plantas de obra y standby añaden régimen, forma de montaje y notas de puesta a tierra encima de fase, autonomía y credencial de operador.",
          qa: [
            {
              q: "¿Qué hay de más vs generadores personales?",
              a: "Régimen (standby/prime/continuous/flota), montaje (skid/remolque/contenedor/pad) y notas de bonding/tierra + credencial heavy general.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Sí.",
            },
            {
              q: "¿Qué deben cubrir las notas de tierra?",
              a: "El anfitrión indica la expectativa de bonding/tierra y quién verifica antes de energizar.",
            },
            {
              q: "¿Remolque vs skid?",
              a: "El montaje fija transporte. Remolcar puede exigir otro anuncio de vehículo de tiro.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "COI / daño físico; depósito ≈ deducible.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin permiso de interconexión, sin promo de flota nacional.",
            },
          ],
        },
        "Forklifts": {
          title: "Montacargas — clase, capacidad, mástil",
          summary: "Los montacargas fijan clase, capacidad, altura de mástil, neumáticos, combustible/batería, manual, horas, seguro y credencial de montacargas.",
          qa: [
            {
              q: "¿Qué requisitos aplican?",
              a: "Clase, capacidad, mástil, neumáticos, combustible/batería, manual, potencia/horas, seguro + credencial de montacargas.",
            },
            {
              q: "¿Necesito credencial de montacargas?",
              a: "Sí — antes de reservar/iniciar.",
            },
            {
              q: "¿Clases 1–5?",
              a: "Eléctrico sentado, pasillo estrecho, traspaleta, cushion o neumático — según piso y trabajo.",
            },
            {
              q: "¿Capacidad y mástil?",
              a: "Respeta los límites publicados. Sobrecarga = mal uso contra el depósito.",
            },
            {
              q: "¿GLP vs batería?",
              a: "La banda fija quién aporta combustible o baterías cargadas y el estado al devolver.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Prueba de daño físico; depósito ≈ deducible — no reposición total.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin curso OSHA a la venta, sin promo de concesionario, sin seguro de montacargas de Evorios.",
            },
          ],
        },
        "Industrial Compressors": {
          title: "Compresores industriales — régimen, secador, CFM",
          summary: "Los de planta añaden régimen y secador de aire encima de CFM, tanque, PSI y credencial de operador.",
          qa: [
            {
              q: "¿Qué hay de más vs compresores personales?",
              a: "Régimen (intermitente/continuo/planta) y secador incluido/no/N/A + credencial heavy general.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Sí.",
            },
            {
              q: "¿Por qué el régimen?",
              a: "Continuo/planta espera otro ciclo que un compresor de clavadora de fin de semana.",
            },
            {
              q: "¿Incluye secador de aire?",
              a: "Incluido / no / N/A. El aire húmedo daña herramientas.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Daño físico; depósito ≈ deducible.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin despacho de contratista, sin afiliado de flota.",
            },
          ],
        },
        "Hydraulic Equipment": {
          title: "Hidráulica — función, PSI, caudal, acoples",
          summary: "Unidades, cilindros, martillos y separadores necesitan función, presión, caudal, tipo de acople, kit de latiguillos, credencial y seguro.",
          qa: [
            {
              q: "¿Qué requisitos aplican?",
              a: "Función, PSI, GPM, acoples, kit de latiguillos, potencia/combustible, seguro, inventario + credencial heavy general.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Sí.",
            },
            {
              q: "¿ISO-A vs flat-face?",
              a: "El tipo de acople debe coincidir con tus herramientas. Forzar emparejamientos pierde aceite.",
            },
            {
              q: "¿Incluye kit de latiguillos?",
              a: "Incluido / parcial / no — cuenta en la entrega.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Prueba de daño; depósito ≈ deducible.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin taller hidráulico, sin promo Enerpac.",
            },
          ],
        },
        "Heavy Pumps": {
          title: "Bombas pesadas — tipo, caudal, cebado",
          summary: "Las bombas pro añaden método de cebado encima de tipo, caudal, racores, sólidos y credencial de operador.",
          qa: [
            {
              q: "¿Qué hay de más vs bombas personales?",
              a: "Método de cebado + credencial heavy general.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Sí.",
            },
            {
              q: "¿Quién ceba?",
              a: "Autocebado / manual / sumergible N/A. Correr en seco destruye sellos.",
            },
            {
              q: "¿Sólidos y químicos?",
              a: "Respeta la banda publicada.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Daño físico; depósito ≈ deducible.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin cuadrilla municipal de bypass, sin promo de flota.",
            },
          ],
        },
        "Other": {
          title: "Heavy otros — tipo, piezas, fotos",
          summary: "El cajón de sastre debe declarar tipo, número de piezas, profundidad de fotos y suelos de la categoría — reclasifica cuando quepa un estante con nombre.",
          qa: [
            {
              q: "¿Cuándo usar Other?",
              a: "Solo cuando no quepan Generadores, compresores, hidrolavadoras, cabrestantes, bombas, montacargas o hidráulica.",
            },
            {
              q: "¿Qué requisitos siguen?",
              a: "Tipo, piezas, checklist de fotos, potencia/combustible, seguro. Multi-pieza necesita inventario.",
            },
            {
              q: "¿Necesito credencial de operador?",
              a: "Si el tipo es montacargas/cabrestante/hidráulica/generador industrial — reclasifica al estante correcto.",
            },
            {
              q: "¿Checklist de fotos?",
              a: "Generales / generales + defectos / todas las piezas + defectos — base de reclamación.",
            },
            {
              q: "¿Seguro y depósito?",
              a: "Misma vía comercial: prueba de daño; depósito ≈ deducible.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin ensayos “como hablamos”, sin promo de flota.",
            },
          ],
        },
      },
    "Party & Events": {
        "Tables & Chairs": {
          title: "Mesas y sillas — cantidad, capacidad, montaje",
          summary: "Los sets se alquilan bien cuando cantidad, capacidad de invitados, huella y tarifa opcional de montaje quedan fijados en el acuerdo.",
          qa: [
            {
              q: "¿Qué banda de cantidad es obligatoria?",
              a: "El anfitrión publica cuántas mesas/sillas hay (1–4 hasta 50+). Confirma el conteo en entrega y devolución — las sillas faltantes van contra el depósito.",
            },
            {
              q: "¿Qué significa la capacidad de invitados?",
              a: "La banda de asientos que el set soporta (1–4 hasta 100+). Es guía de planificación, no certificado de aforo del local.",
            },
            {
              q: "¿El montaje / desmontaje está incluido?",
              a: "La tarifa opcional aparece si el anfitrión la publica. Si no, asume que monta el arrendatario.",
            },
            {
              q: "¿Las mesas necesitan cancelación por clima?",
              a: "Solo con huella exterior (patio / outdoor grande). Sets de salón suelen marcar not_outdoor.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Manchas, patas rotas y piezas faltantes más allá del uso normal — no un seguro de fiesta.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Salvo listado: manteles, centros, entrega extra y promociones de seguros o alquileres de grandes cadenas.",
            },
          ],
        },
        "Tents & Canopies": {
          title: "Carpas y toldos — tamaño, clima, anclaje",
          summary: "Las carpas outdoor necesitan banda de tamaño, ventana de cancelación por clima y notas claras de estacas/pesos.",
          qa: [
            {
              q: "¿Qué bandas de tamaño hay?",
              a: "El anfitrión elige 10×10, 10×20, 20×20, 20×40, mayor u otro pop-up. Ajusta la banda a invitados y reglas del venue.",
            },
            {
              q: "¿Es obligatoria la cancelación por clima?",
              a: "Sí en carpas/toldos outdoor — reembolso total 24 h, 12 h, discreción del anfitrión, o not_outdoor. La ventana se congela en el acuerdo.",
            },
            {
              q: "¿Quién clava y lastra el toldo?",
              a: "Según huella y tarifa de montaje. Suele aportar estacas/pesos el arrendatario salvo que el anfitrión instale.",
            },
            {
              q: "¿Y la electricidad bajo la carpa?",
              a: "Las carpas personales no exigen banda de potencia; añade notas si hay luces. Iluminación/sonido pro llevan sus puertas de potencia.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Paneles rotos, marcos torcidos, postes/estacas faltantes — no un seguro de viento de Evorios.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Permisos, electricista y afiliados tipo Party City / Sunbelt no forman parte de la reserva.",
            },
          ],
        },
        "Party Decor": {
          title: "Decoración de fiesta — capacidad, color, cuidado",
          summary: "Globos, backdrops y decor suave quedan en vecino + depósito cuando capacidad, color y limpieza de devolución están claros.",
          qa: [
            {
              q: "¿Qué campos importan más?",
              a: "Capacidad de invitados, color recomendado y huella. La decor suave no exige sanitización de catering ni potencia pro.",
            },
            {
              q: "¿Necesito cancelación por clima?",
              a: "Solo si la decor es solo exterior y el anfitrión publica ventana. La decor interior suele omitirla.",
            },
            {
              q: "¿Glitter, humo o llama abierta?",
              a: "Sigue reglas del venue y notas del anfitrión. Daño por glitter/humo no declarado puede usar el depósito.",
            },
            {
              q: "¿Y la tarifa de montaje?",
              a: "Opcional — se publica si el anfitrión instala arcos/backdrops. Si no, monta el arrendatario.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Tela rota, piezas de backdrop faltantes y manchas más allá del uso normal.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin floristería, sin garantía de helio, sin promo de seguro de decoración.",
            },
          ],
        },
        "Games & Activities": {
          title: "Juegos y actividades — capacidad, huella, piezas",
          summary: "Juegos de jardín necesitan capacidad, huella y checklist de piezas para que vuelvan bolsas y paletas.",
          qa: [
            {
              q: "¿Qué debe publicar el anfitrión?",
              a: "Capacidad de invitados, huella (sobremesa a outdoor grande) y tarifa opcional si instala el anfitrión.",
            },
            {
              q: "¿Cómo evitar piezas faltantes?",
              a: "Cuenta bolsas, paletas y pelotas en la entrega. Foto del kit — el depósito cubre piezas de juego faltantes.",
            },
            {
              q: "¿Interior vs exterior?",
              a: "Huella más cancelación por clima si la actividad es solo outdoor. Noches de juegos indoor suelen omitir clima.",
            },
            {
              q: "¿Se requiere potencia?",
              a: "No en este estante personal. Arcade electrónico puede ir a Electronics o Sound Systems.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Piezas perdidas y tableros rotos más allá del juego normal — no seguro de lesiones.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Operarios de feria, inventario de premios y afiliados de seguro de juegos de fiesta.",
            },
          ],
        },
        "Serving Equipment": {
          title: "Equipo de servicio — sanitizar, capacidad, devolución",
          summary: "Chafers, dispensadores y kits de servicio exigen atestación de sanitización en alquiler más capacidad de invitados.",
          qa: [
            {
              q: "¿Por qué se atestigua la sanitización?",
              a: "Piezas en contacto con comida deben estar limpias según el anfitrión antes del anuncio/entrega. El arrendatario confirma devolución limpia al reservar.",
            },
            {
              q: "¿Qué significa la banda de capacidad?",
              a: "Guía de cuántos invitados cubre el set — no un certificado sanitario de Evorios.",
            },
            {
              q: "¿Necesito cancelación por clima?",
              a: "Solo en servicio outdoor. Buffets indoor suelen marcar not_outdoor.",
            },
            {
              q: "¿Combustible / sterno?",
              a: "Sigue notas del anfitrión. El gel suele aportarlo el arrendatario; mal uso puede usar el depósito.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Abolladuras, tapas/cucharones faltantes y devolución sucia más allá de la política.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin personal de catering, sin certificación NSF de Evorios, sin promo de suministros de restaurante.",
            },
          ],
        },
        "Other": {
          title: "Party otros — reubica si cabe un estante con nombre",
          summary: "El catch-all aún publica capacidad y huella; mueve a Mesas, Carpas, Decor, Juegos, Servicio, Escenario, Sonido, Luces, Photo Booth o Catering cuando aplican esas puertas.",
          qa: [
            {
              q: "¿Cuándo usar Other?",
              a: "Solo si ningún estante Party con nombre encaja. Esos llevan tamaño de carpa, conteo, potencia o sanitización.",
            },
            {
              q: "¿Qué sigue aplicando?",
              a: "Capacidad de invitados, huella/color recomendados, tarifa opcional de montaje y cancelación por clima outdoor.",
            },
            {
              q: "¿AV pro vs decor suave?",
              a: "Escenario, sonido, luces, photo booths y catering van a estantes profesionales por potencia y sanitización.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Daño y accesorios faltantes según fotos y checklist.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin ensayos vagos “como hablamos”, sin promo Party City / seguros afiliados.",
            },
          ],
        },
        "Stage & Risers": {
          title: "Escenario y risers — potencia, capacidad, montaje",
          summary: "Escenarios pro publican capacidad, potencia, huella y tarifa opcional de montaje/desmontaje antes de la entrega.",
          qa: [
            {
              q: "¿Qué opciones de potencia hay?",
              a: "Ninguna/batería, 120 V estándar, 20 A dedicados, 240 V/generador, o aporta el anfitrión. Circuito incorrecto falla el load-in.",
            },
            {
              q: "¿Es común la tarifa de montaje?",
              a: "Sí en escenarios pro — si se publica, se congela en el acuerdo con quién instala.",
            },
            {
              q: "¿Escenarios outdoor y clima?",
              a: "Huellas outdoor exigen ventana de cancelación (24 h / 12 h / discreción / not_outdoor).",
            },
            {
              q: "¿Y la carga estructural?",
              a: "La capacidad de invitados es planificación. Carga de baile/banda según notas del anfitrión — Evorios no certifica ingeniería.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Marcos torcidos, faldones/patas faltantes y daño de superficie más allá del uso de evento.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin stagehands salvo listado, sin permisos de venue, sin promo de seguro de producción.",
            },
          ],
        },
        "Sound Systems": {
          title: "Sonido de evento — potencia, capacidad, montaje",
          summary: "PA de evento necesita potencia, capacidad, huella y tarifa opcional — no estantes de boombox de consumo.",
          qa: [
            {
              q: "¿Qué puerta de potencia aplica?",
              a: "El anfitrión fija batería, 120 V, 20 A, 240 V/generador o aporta el anfitrión. Los amperios importan con subwoofers.",
            },
            {
              q: "¿Es lo mismo que Music & Audio?",
              a: "Event Sound Systems es AV Party pro. Altavoces portátiles van a Music & Audio → Portable Speakers.",
            },
            {
              q: "¿Cables y trípodes?",
              a: "Cuenta micros, trípodes y mangueras en la entrega. Accesorios faltantes van al depósito.",
            },
            {
              q: "¿Ruido / vecinos?",
              a: "Sigue venue y horarios locales. Notas soft pueden fijar volumen máx — no un permiso municipal.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Altavoces quemados por mal uso, amps/cables faltantes y daño cosmético.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin DJ salvo listado, sin afiliado Sweetwater, sin upsell de seguro de evento.",
            },
          ],
        },
        "Event Lighting": {
          title: "Iluminación de evento — potencia, huella, montaje",
          summary: "Uplights y wash se alquilan limpio cuando potencia, capacidad, huella y tarifa de montaje están en el acuerdo.",
          qa: [
            {
              q: "¿Qué potencia se requiere?",
              a: "Misma banda pro que otro AV Party — 120 V, 20 A, 240 V/generador, batería o aporta el anfitrión.",
            },
            {
              q: "¿Quién cuelga y enfoca?",
              a: "Tarifa opcional si instala el anfitrión. Si no, cuelga el arrendatario según reglas del venue.",
            },
            {
              q: "¿Clima en torres outdoor?",
              a: "Huellas outdoor necesitan política de cancelación. Salones indoor suelen not_outdoor.",
            },
            {
              q: "¿DMX / consola incluida?",
              a: "Solo si está listado. Cuenta controladores, cables y clamps en la entrega.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Fixtures quemados por voltaje incorrecto, clamps/geles faltantes y daño por caída.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin diseñador de luces salvo listado, sin afiliado ADJ/Chauvet, sin promo de seguro de producción.",
            },
          ],
        },
        "Photo Booths": {
          title: "Photo booths — potencia, capacidad, props",
          summary: "Los booths congelan potencia, capacidad, huella y tarifa opcional; cuenta props e impresora en la entrega.",
          qa: [
            {
              q: "¿Qué potencia necesita un booth?",
              a: "El anfitrión publica la banda pro. La mayoría quiere un circuito indoor dedicado — confirma antes del evento.",
            },
            {
              q: "¿El montaje está incluido?",
              a: "Si hay tarifa de montaje/desmontaje, la instalación del anfitrión se congela en el acuerdo. Si no, arma el arrendatario.",
            },
            {
              q: "¿Props, álbum, impresiones?",
              a: "Cuenta backdrop, props, papel e impresora en la entrega. Kits faltantes usan el depósito.",
            },
            {
              q: "¿Booths outdoor?",
              a: "Huellas outdoor exigen cancelación por clima. Muchos marcan not_outdoor por la electrónica.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Impresoras dañadas, iPads/cámaras listadas faltantes y backdrops rotos.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin azafato salvo listado, sin promo Smilebooth, sin afiliado de seguro de evento.",
            },
          ],
        },
        "Catering Equipment": {
          title: "Equipo de catering — sanitizar, potencia, capacidad",
          summary: "El catering pro exige atestación de sanitización, banda de potencia y capacidad de invitados antes de la entrega.",
          qa: [
            {
              q: "¿Por qué sanitizar + potencia juntos?",
              a: "Superficies en contacto con comida necesitan atestación; calentadores y pozos fríos el circuito correcto (120 V / 20 A / 240 V / anfitrión).",
            },
            {
              q: "¿En qué difiere de Serving Equipment?",
              a: "Catering Equipment es el estante pro — potencia más sanitización. Serving personal se centra en sanitizar y capacidad sin potencia pro.",
            },
            {
              q: "¿NSF o permisos sanitarios?",
              a: "El anfitrión puede notar NSF en soft. Evorios no certifica permisos — siguen venue y ley local.",
            },
            {
              q: "¿Clima en catering outdoor?",
              a: "Huellas outdoor necesitan ventana de cancelación por clima.",
            },
            {
              q: "¿Qué cubre el depósito?",
              a: "Devolución sucia, bandejas/tapas faltantes y daño más allá del servicio normal.",
            },
            {
              q: "¿Qué no está incluido?",
              a: "Sin personal de chef, sin afiliados de suministros, sin producto de seguro alimentario de Evorios.",
            },
          ],
        },
      },
    "Outdoor & Camping": {
          Tents: {
            title: "Tiendas — capacidad, temporada, higiene",
            summary: "El alquiler peer de tiendas funciona cuando capacidad, temporada, peso empaquetado y atestación limpia/aireada quedan congelados.",
            qa: [
              {
                q: "¿Qué puertas aplican antes de alquilar una tienda?",
                a: "El alquiler congela capacidad, temporada y checklist de higiene. El anfitrión debe atestar sanitizado/aireado; tú reconoces devolverla limpia y seca.",
              },
              {
                q: "¿Qué significan capacidad y temporada?",
                a: "Capacidad es para cuántas personas. Temporada (1–4) fija la exposición esperada — no garantiza tormentas.",
              },
              {
                q: "¿Por qué el peso empaquetado?",
                a: "Ayuda a decidir mochila vs camping en auto. Recomendación suave — confírmalo antes de cargarla.",
              },
              {
                q: "¿Cuál es la regla de higiene?",
                a: "Refugios de sueño compartidos necesitan atestación del anfitrión. La reserva se bloquea hasta attested; tú confirmas devolución limpia y seca.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Varillas, fly, estacas y tela en entrega y devolución — varillas faltantes y fly rasgado impulsan reclamos.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Varillas, estacas, guías faltantes y daño más allá del uso normal — no seguro de clima ni cancelación.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin membresía REI, sin montaje de tienda ni seguro outdoor de Evorios.",
              },
            ],
          },
          "Sleeping Bags": {
            title: "Sacos de dormir — temperatura, higiene",
            summary: "Los sacos se alquilan limpios cuando banda de temperatura y atestación sanitaria están en el acuerdo.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "Sacos requieren banda de temperatura más el checklist de higiene Outdoor. El anfitrión atesta limpio/aireado; la reserva queda bloqueada hasta entonces.",
              },
              {
                q: "¿Cómo leer la banda de temperatura?",
                a: "Es la clase de confort publicada (sobre 50°F hasta bajo 0°F). Mantente dentro — el riesgo de frío es del arrendatario, no del depósito.",
              },
              {
                q: "¿Sigue siendo obligatoria la capacidad?",
                a: "Sí — capacidad y temporada Outdoor dan contexto de tamaño/temporada del saco.",
              },
              {
                q: "¿Regla de higiene?",
                a: "Equipo de sueño compartido: atestación del anfitrión y tu ack al reservar de devolver el saco limpio y seco.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Cremalleras, baffles y manchas en recogida y devolución. Fundas faltantes o daño de forro pueden usar el depósito.",
              },
              {
                q: "¿Waiver vs depósito?",
                a: "La higiene es la capa de confianza. El depósito cubre piezas faltantes y suciedad fuera de política — no hipotermia ni seguro de viaje.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin promo de lavandería de sacos ni seguro médico outdoor de Evorios.",
              },
            ],
          },
          Backpacks: {
            title: "Mochilas — capacidad, peso, ajuste",
            summary: "Las mochilas se alquilan cuando capacidad, temporada y peso empaquetado son honestos para el ajuste y la carga.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "El alquiler Outdoor sigue exigiendo capacidad y temporada. El peso empaquetado se recomienda en packs overnight.",
              },
              {
                q: "¿Cómo leer la capacidad en una mochila?",
                a: "La banda como clase de carga (día vs varios días). Confirma torso/ajuste en la descripción antes de reservar.",
              },
              {
                q: "¿Hay checklist de higiene?",
                a: "No por defecto en Mochilas. Notas suaves de devolución limpia igual ayudan.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Cinturón, correas, cremalleras y funda de lluvia. Fundas faltantes y cinturones rotos son reclamos comunes.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Tapas, fundas faltantes y daño de armazón más allá del uso normal — no objetos personales dentro.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin guía outfitter, sin membresía REI ni seguro outdoor de Evorios.",
              },
            ],
          },
          "Camp Cooking": {
            title: "Cocina de campamento — combustible, piezas, fuego",
            summary: "Las estufas necesitan tipo de combustible congelado con contexto de capacidad/temporada para llevar cartuchos correctos y devolver cada pieza.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "Camp Cooking exige tipo de combustible (isobutano, white gas, propano, alcohol, madera, eléctrico o multi-fuel) más capacidad/temporada Outdoor.",
              },
              {
                q: "¿Por qué importa el combustible?",
                a: "El combustible incorrecto puede destruir la estufa y es reclamo de depósito. Iguala cartuchos/botellas al tipo publicado.",
              },
              {
                q: "¿Ollas y combustible incluidos?",
                a: "Solo lo que diga el inventario. Cuenta quemadores, pantallas, bombas y ollas en la entrega.",
              },
              {
                q: "¿Fuego y leave-no-trace?",
                a: "Sigue prohibiciones locales y notas suaves del anfitrión. Prohibiciones y riesgo de incendio quedan fuera del depósito.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Patas, adaptador, bomba y menaje. Bombas faltantes y pantallas rotas impulsan reclamos.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas de estufa faltantes y daño de menaje — no el combustible consumido ni comida quemada.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin suscripción de cartuchos ni seguro de cocina de campamento de Evorios.",
              },
            ],
          },
          "Navigation & GPS": {
            title: "Navegación y GPS — energía, mapas, devolución",
            summary: "GPS de mano se alquilan cuando hay contexto de capacidad/temporada y expectativas claras de energía y mapas.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "Siguen publicándose capacidad y temporada Outdoor. Confirma batería y notas de mapas antes de usarlo off-grid.",
              },
              {
                q: "¿Mapas y suscripciones incluidos?",
                a: "Solo si están listados. Mapas offline y satélite los declara el anfitrión — no es afiliado Garmin/onX.",
              },
              {
                q: "¿Energía y carga al devolver?",
                a: "Devuelve según notas (normalmente carga similar). Cargadores faltantes van al depósito.",
              },
              {
                q: "¿Hace falta waiver?",
                a: "No por defecto en Navegación & GPS personal. Survival / expedición tienen puertas de waiver aparte.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Unidad, antena/soporte y cargador. Pantallas rotas y cunas faltantes son reclamos comunes.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin suscripción de rescate, sin promo de mapas ni seguro de navegación de Evorios.",
              },
            ],
          },
          Other: {
            title: "Outdoor otros — reubica si puedes",
            summary: "Prefiere un estante Outdoor con nombre para higiene, combustible o waiver. Other igual congela capacidad y temporada.",
            qa: [
              {
                q: "¿Debo quedarme en Other?",
                a: "Reubica a Tiendas, Sacos, Mochilas, Camp Cooking, Navegación, Expedición, Survival, Group Shelters, Navegación pro o Base Camp cuando encaje.",
              },
              {
                q: "¿Qué aplica igual en Other?",
                a: "Capacidad y temporada siguen obligatorias. El peso empaquetado se recomienda al cargar.",
              },
              {
                q: "¿Aplican higiene o waiver?",
                a: "Solo si el anfitrión marca required, o el ítem es claramente tienda/sueño o survival/expedición. Los estantes con nombre lo exigen solos.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Estado general y cada accesorio. Kits Other vagos sin fotos de piezas generan peleas de depósito.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Accesorios faltantes y daño más allá del uso outdoor normal según el anuncio.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin seguro outdoor genérico ni promo de big-box de Evorios.",
              },
            ],
          },
          "Expedition Tents": {
            title: "Tiendas de expedición — temporada, higiene, waiver",
            summary: "Refugios alpinos/expedición congelan capacidad, temporada, atestación de higiene y waiver de responsabilidad antes de reservar.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "Expedition Tents exigen capacidad, temporada, checklist de higiene con atestación y estado del waiver de responsabilidad.",
              },
              {
                q: "¿Por qué un waiver?",
                a: "Uso de refugio de montaña de alto riesgo. Reconoces riesgo de lesión de uso ordinario al reservar salvo que el anfitrión marque not required — alquilas a un vecino, no a un servicio de guías.",
              },
              {
                q: "¿Higiene vs tiendas base?",
                a: "Misma regla de refugio de sueño: el anfitrión atesta limpio/aireado; tú devuelves razonablemente limpia y seca.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Varillas, fly, estacas de nieve y kits de guías. El hardware de expedición desaparece tras fines de semana.",
              },
              {
                q: "¿Depósito vs waiver?",
                a: "El waiver cubre riesgo ordinario de lesión entre pares; el depósito cubre varillas/estacas faltantes y daño de tela.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin expedición guiada, sin cobertura de rescate alpino ni afiliado de seguro outdoor de Evorios.",
              },
            ],
          },
          "Survival Gear": {
            title: "Survival gear — waiver, capacidad, reclamos",
            summary: "Kits de supervivencia congelan capacidad/temporada y waiver de responsabilidad para que el riesgo quede en el uso ordinario entre pares.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "Survival Gear exige estado del waiver de responsabilidad más capacidad y temporada Outdoor.",
              },
              {
                q: "¿Por qué un waiver?",
                a: "El entrenamiento survival y el uso remoto conllevan riesgo de lesión. Reconoce asunción de riesgo al reservar salvo not required.",
              },
              {
                q: "¿Hace falta higiene?",
                a: "No por defecto salvo que el kit incluya sueño compartido — entonces el anfitrión puede marcar higiene. Prefiere Sacos / Tiendas para sueño.",
              },
              {
                q: "¿Qué inventariar?",
                a: "Cuchillos, iniciadores de fuego, señales y botiquín. Cuenta cada pieza en la entrega.",
              },
              {
                q: "¿Depósito vs waiver?",
                a: "El waiver cubre riesgo ordinario de lesión; el depósito cubre piezas faltantes o dañadas — no costos médicos ni de rescate.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin certificado de curso, sin suscripción SAR ni seguro médico outdoor de Evorios.",
              },
            ],
          },
          "Group Shelters": {
            title: "Refugios grupales — capacidad, temporada, piezas",
            summary: "Refugios grupales se alquilan cuando capacidad (a menudo group_shelter) y temporada coinciden con el evento.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "Capacidad y temporada son obligatorias. Usa group_shelter cuando el tamaño es de evento, no de tienda de mochila.",
              },
              {
                q: "¿Hace falta higiene?",
                a: "No por defecto salvo que el anfitrión lo marque. Notas suaves de devolución limpia/seca igual reducen reclamos de moho.",
              },
              {
                q: "¿Clima y estacas?",
                a: "La temporada no garantiza viento. Confirma kit de estacas/pesos y el clima local antes de montar.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Marco, tela, estacas y pesos. Pesos faltantes tras viento son reclamos comunes.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Varillas, estacas, pesos faltantes y roturas más allá del uso normal — no seguro de cancelación por clima.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin personal de evento, sin seguro weather-cancel ni promo de rentals de fiesta de Evorios.",
              },
            ],
          },
          "Professional Navigation": {
            title: "Navegación pro — kit, energía, mapas",
            summary: "Kits GPS / survey pro necesitan contexto de capacidad/temporada y energía, soportes y mapas claros antes del campo.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "Siguen publicándose capacidad y temporada Outdoor. Confirma batería, soporte y antena en el anuncio antes del trabajo remoto.",
              },
              {
                q: "¿Mapas y software?",
                a: "Solo paquetes o licencias declarados por el anfitrión. Evorios no revende Garmin, Trimble u onX.",
              },
              {
                q: "¿Hace falta waiver?",
                a: "No por defecto en este estante. Survival y Expedition Tents tienen puertas duras de waiver.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "Receptor, antena, postes/soportes y cargadores. Postes y cunas faltantes impulsan el depósito.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Accesorios faltantes y daño de hardware — no datos de campo perdidos ni renovaciones de suscripción.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin cuadrilla de survey, sin promo de seats de software ni seguro de navegación de Evorios.",
              },
            ],
          },
          "Base Camp Equipment": {
            title: "Base camp — capacidad, temporada, inventario",
            summary: "Mesas, cocinas y kits de base camp se alquilan cuando capacidad/temporada coinciden y cada pieza está listada.",
            qa: [
              {
                q: "¿Qué puertas aplican?",
                a: "Capacidad y temporada son obligatorias. El peso empaquetado ayuda cuando el gear se carga al campamento.",
              },
              {
                q: "¿Higiene o waiver?",
                a: "No por defecto. Si el kit incluye tiendas o sueño, reubica esas piezas para que apliquen higiene/waiver.",
              },
              {
                q: "¿Por qué el inventario?",
                a: "Los kits de base camp pierden sillas, linternas y mesas. Publica lista y cuenta en entrega/devolución.",
              },
              {
                q: "¿Qué fotografiar?",
                a: "El kit completo en recogida y devolución. Taburetes y linternas faltantes son reclamos típicos.",
              },
              {
                q: "¿Qué cubre el depósito?",
                a: "Piezas faltantes y daño más allá del uso normal — no comida, combustible ni seguro de viaje.",
              },
              {
                q: "¿Qué no está incluido?",
                a: "Sin personal de campamento, sin seguro outfitter ni promo REI / flota de Evorios.",
              },
            ],
          },
        },
  },
};

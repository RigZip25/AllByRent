import type { CategoryFactsOverlay } from "../types";

/** ES FactCard overlay — missing shelves inherit canonical EN via resolveCategoryFacts.
 *  Only Vehicles (+ commercial) host translations kept; other shelves deleted so cleaned EN shows through.
 */
export const categoryFactsEsOverlay: CategoryFactsOverlay = {
  expand: "Saber más",
  collapse: "Ocultar detalles",
  byCategory: {
    Vehicles: {
      title: "FAQ alquiler de coche ligero / turismo",
      summary: "Respuestas cortas para coches y camionetas bajo peso comercial.",
      qa: [
        { q: "¿Necesito CDL?", a: "No para coches de turismo bajo 26 001 lb GVWR, salvo que la ley local lo exija." },
        { q: "¿Qué seguro necesito?", a: "Póliza personal válida que cubra este coche. Sube el comprobante en la app antes del PIN o las llaves." },
        { q: "¿Cómo funciona la cancelación?", a: "Cancelación ≥24 h antes del inicio: reembolso total. Dentro de 24 h: 50%." },
        { q: "¿Combustible y devolución tarde?", a: "Combustible lleno a lleno (+$20 si falta). Devolución tarde: 30 min de gracia, luego $20 + $15/h." },
        { q: "¿Por qué GPS para el PIN?", a: "El PIN solo se abre en la recogida (o con el QR del coche)—no un código reenviado." },
        { q: "¿Qué fotos son obligatorias?", a: "Inspección previa: carrocería + cuatro llantas antes del inicio; el mismo set al devolver." },
      ],
    },
    VehiclesCommercial: {
      title: "FAQ transporte comercial (≥26 001 lb / semi)",
      summary: "Respuestas cortas para camiones comerciales pesados y semis.",
      qa: [
        { q: "¿Necesito CDL?", a: "Sí si el GVWR es 26 001 lb o más (o según la ley local)." },
        { q: "¿Qué peso debo indicar?", a: "GVWR en libras—no el valor en dólares." },
        { q: "¿Cómo funciona la prueba de seguro?", a: "El agente del arrendatario envía la prueba al correo del dueño del anuncio antes del PIN o las llaves." },
        { q: "¿Se exige daño físico (PD)?", a: "Sí. Los límites de PD siguen el GVWR (lb); la retención del depósito sigue el deducible / PD comercial." },
        { q: "¿Qué inspección es obligatoria?", a: "Inspección comercial multi-llanta antes del inicio; el mismo set al devolver." },
        { q: "¿Por qué GPS para el PIN?", a: "PIN o caja solo en la recogida o vía QR del vehículo—no un código reenviado." },
      ],
    },
  },
  bySubcategory: {
    Vehicles: {
      "Cars & Trucks": {
        title: "FAQ alquiler de coche ligero / turismo",
        summary: "Respuestas cortas para coches y camionetas bajo peso comercial.",
        qa: [
          { q: "¿Necesito CDL?", a: "No para coches de turismo bajo 26 001 lb GVWR, salvo que la ley local lo exija." },
          { q: "¿Qué seguro necesito?", a: "Póliza personal válida que cubra este coche. Sube el comprobante en la app antes del PIN o las llaves." },
          { q: "¿Cómo funciona la cancelación?", a: "Cancelación ≥24 h antes del inicio: reembolso total. Dentro de 24 h: 50%." },
          { q: "¿Combustible y devolución tarde?", a: "Combustible lleno a lleno (+$20 si falta). Devolución tarde: 30 min de gracia, luego $20 + $15/h." },
          { q: "¿Por qué GPS para el PIN?", a: "El PIN solo se abre en la recogida (o con el QR del coche)—no un código reenviado." },
          { q: "¿Qué fotos son obligatorias?", a: "Inspección previa: carrocería + cuatro llantas antes del inicio; el mismo set al devolver." },
        ],
      },
      Motorcycles: {
        title: "FAQ alquiler de motos",
        summary: "Respuestas cortas para motocicletas.",
        qa: [
          { q: "¿Necesito endorsement de moto?", a: "Sí. Declara un endorsement de moto válido (o equivalente local) para el conductor nombrado." },
          { q: "¿Basta la licencia de coche?", a: "No cuando este anuncio exige endorsement de moto." },
          { q: "¿Qué seguro necesito?", a: "Comprobante que cubra esta moto, subido en la app antes del PIN o las llaves." },
          { q: "¿Casco?", a: "Sigue la ley local y la política de casco del anuncio." },
          { q: "¿Qué fotos son obligatorias?", a: "Fotos de carrocería y llantas antes del inicio; el mismo set al devolver." },
        ],
      },
      ATVs: {
        title: "FAQ alquiler de ATV / OHV",
        summary: "Respuestas cortas para ATV y OHV.",
        qa: [
          { q: "¿Se exige exención de terreno?", a: "Sí por defecto—acepta el riesgo de terreno OHV / ATV al reservar antes del desbloqueo." },
          { q: "¿Qué licencia necesito?", a: "Licencia o permiso válido según la ley OHV local y el anuncio." },
          { q: "¿Qué seguro necesito?", a: "Comprobante que cubra este ATV, subido antes del PIN o las llaves." },
          { q: "¿Casco / equipo?", a: "Sigue la ley local y las reglas de casco o equipo del anuncio." },
          { q: "¿Qué fotos son obligatorias?", a: "Fotos de carrocería y llantas antes del inicio; el mismo set al devolver." },
        ],
      },
      "Tow Vehicles": {
        title: "FAQ alquiler de vehículos de remolque",
        summary: "Respuestas cortas para grúas y tow vehicles.",
        qa: [
          { q: "¿Necesito CDL?", a: "Sí cuando el GVWR o el peso combinado es 26 001 lb o más (o según la ley local)." },
          { q: "¿Qué más se exige?", a: "Credenciales de remolque según el anuncio, más prueba de seguro comercial agente→dueño cuando este estante lo exige." },
          { q: "¿Capacidad de remolque?", a: "Respeta la capacidad y clase de enganche publicadas en el anuncio." },
          { q: "¿Qué inspección es obligatoria?", a: "Carrocería y multi-llanta antes del inicio; el mismo set al devolver." },
          { q: "¿Por qué GPS para el PIN?", a: "PIN o caja solo en la recogida o vía QR del vehículo—no un código reenviado." },
        ],
      },
      Trailers: {
        title: "FAQ alquiler de remolques",
        summary: "Respuestas cortas para remolques ligeros / utility bajo peso comercial.",
        qa: [
          { q: "¿Necesito CDL?", a: "Normalmente no bajo 26 001 lb GVWR—revisa la ley local, clase de enganche y frenos." },
          { q: "¿Enganche y luces?", a: "Coincide la clase de hitch; confirma luces y frenos en la entrega." },
          { q: "¿Qué seguro necesito?", a: "Cobertura del remolque según el anuncio; sube el comprobante antes de la entrega." },
          { q: "¿Límites de carga?", a: "No superes el GVWR ni el payload publicados." },
          { q: "¿Qué fotos son obligatorias?", a: "Chasis, enganche, llantas y luces en la inspección previa; el mismo set al devolver." },
        ],
      },
      "Equipment Trailers": {
        title: "FAQ alquiler de remolques de equipo",
        summary: "Respuestas cortas para remolques comerciales / de equipo.",
        qa: [
          { q: "¿Necesito CDL?", a: "Sí cuando el GVWR o el peso combinado es 26 001 lb o más (o según el transporte comercial)." },
          { q: "¿Cómo funciona la prueba de seguro?", a: "El agente envía prueba comercial / PD al correo del dueño del anuncio antes del PIN o las llaves." },
          { q: "¿Límites de carga?", a: "No superes el GVWR ni el payload publicados." },
          { q: "¿Qué inspección es obligatoria?", a: "Fotos de chasis y multi-llanta antes del inicio; el mismo set al devolver." },
          { q: "¿Por qué GPS para el PIN?", a: "PIN o caja solo en la recogida o vía QR del vehículo—no un código reenviado." },
        ],
      },
      "Commercial Trucks": {
        title: "FAQ alquiler de camiones comerciales",
        summary: "Respuestas cortas para camiones comerciales y semis.",
        qa: [
          { q: "¿Necesito CDL?", a: "Sí si el GVWR es 26 001 lb o más (o según la ley local)." },
          { q: "¿Qué peso debo indicar?", a: "GVWR en libras—no el valor en dólares." },
          { q: "¿Cómo funciona la prueba de seguro?", a: "El agente del arrendatario envía la prueba al correo del dueño del anuncio antes del PIN o las llaves." },
          { q: "¿Se exige daño físico (PD)?", a: "Sí. Los límites de PD siguen el GVWR (lb); la retención del depósito sigue el deducible / PD comercial." },
          { q: "¿Qué inspección es obligatoria?", a: "Inspección comercial multi-llanta antes del inicio; el mismo set al devolver." },
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
  },
};

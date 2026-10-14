// Fuente única de los Términos y Condiciones: la leen /terminos-y-condiciones y
// TerminosCuerpo.astro. Si cambia el texto, cambia `lastUpdated` y se vuelve a cotejar
// con `node scripts/cotejo-legal.mjs terminos`.
export const lastUpdated = '13 de octubre de 2026';

// Índice de anclas: mismo orden y numeración que el PDF de octubre (25 cláusulas).
export const indice: [string, string][] = [
  ['identificacion', '1. Identificación del prestador'],
  ['objeto', '2. Objeto'],
  ['definiciones', '3. Definiciones'],
  ['naturaleza-alcance', '4. Naturaleza y alcance del servicio'],
  ['alcance-informe', '5. Alcance y limitaciones del Informe'],
  ['decision-compra', '6. Decisión de compra'],
  ['autorizacion-acceso', '7. Autorización y acceso al vehículo'],
  ['fotografias', '8. Fotografías y documentación técnica'],
  ['agendamiento', '9. Agendamiento y confirmación'],
  ['precios-pago', '10. Precios y forma de pago'],
  ['retracto', '11. Derecho legal de retracto'],
  ['cancelacion', '12. Política de cancelación y reprogramación'],
  ['obligaciones-cliente', '13. Obligaciones del cliente'],
  ['responsabilidad', '14. Responsabilidad de SmartCheck'],
  ['uso-informe', '15. Uso y titularidad del Informe'],
  ['informes-preexistentes', '16. Informes Preexistentes'],
  ['fuentes-externas', '17. Fuentes externas'],
  ['datos-personales', '18. Protección de datos personales'],
  ['propiedad-intelectual', '19. Propiedad intelectual del sitio y sus contenidos'],
  ['canales-digitales', '20. Uso de los canales digitales'],
  ['comunicaciones', '21. Comunicaciones'],
  ['consultas-reclamos', '22. Consultas y reclamos'],
  ['modificaciones', '23. Modificaciones'],
  ['validez-parcial', '24. Validez parcial'],
  ['legislacion', '25. Legislación aplicable y aceptación electrónica'],
];

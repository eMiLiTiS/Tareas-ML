import type { ChecklistTemplate } from '../types'

export const defaultChecklistTemplates: ChecklistTemplate[] = [
  // APERTURA — Instalaciones
  { id: 'chk-a-001', tipo: 'apertura', categoria: 'Instalaciones', titulo: 'Encender luces generales', orden: 1, activa: true },
  { id: 'chk-a-002', tipo: 'apertura', categoria: 'Instalaciones', titulo: 'Encender música', orden: 2, activa: true },
  { id: 'chk-a-003', tipo: 'apertura', categoria: 'Instalaciones', titulo: 'Encender televisión', orden: 3, activa: true },
  { id: 'chk-a-004', tipo: 'apertura', categoria: 'Instalaciones', titulo: 'Encender luces de las salas', orden: 4, activa: true },
  { id: 'chk-a-005', tipo: 'apertura', categoria: 'Instalaciones', titulo: 'Comprobar enchufes de las máquinas', orden: 5, activa: true },
  { id: 'chk-a-006', tipo: 'apertura', categoria: 'Instalaciones', titulo: 'Subir persiana', orden: 6, activa: true },
  { id: 'chk-a-007', tipo: 'apertura', categoria: 'Instalaciones', titulo: 'Revisar luz de la escalera (carga)', orden: 7, activa: true },

  // APERTURA — Salas y orden
  { id: 'chk-a-008', tipo: 'apertura', categoria: 'Salas y orden', titulo: 'Preparación de salas', orden: 8, activa: true },
  { id: 'chk-a-009', tipo: 'apertura', categoria: 'Salas y orden', titulo: 'Revisar duplicidades en salas/aparatología', orden: 9, activa: true },
  { id: 'chk-a-010', tipo: 'apertura', categoria: 'Salas y orden', titulo: 'Revisar agenda del día y del día siguiente', orden: 10, activa: true },
  { id: 'chk-a-011', tipo: 'apertura', categoria: 'Salas y orden', titulo: 'Repasar papeleras', orden: 11, activa: true },

  // APERTURA — Zona cliente
  { id: 'chk-a-012', tipo: 'apertura', categoria: 'Zona cliente', titulo: 'Revisar mueble de café y agua', orden: 12, activa: true },

  // APERTURA — Operativa
  { id: 'chk-a-013', tipo: 'apertura', categoria: 'Operativa', titulo: 'Poner lavadoras y secadoras en marcha', orden: 13, activa: true },
  { id: 'chk-a-014', tipo: 'apertura', categoria: 'Operativa', titulo: 'Comprobar batería de móvil y tablets', orden: 14, activa: true },
  { id: 'chk-a-015', tipo: 'apertura', categoria: 'Operativa', titulo: 'Anotar efectivo inicial de caja', orden: 15, activa: true },

  // APERTURA — Limpieza
  { id: 'chk-a-016', tipo: 'apertura', categoria: 'Limpieza', titulo: 'Aspirar (pelusas)', orden: 16, activa: true },
  { id: 'chk-a-017', tipo: 'apertura', categoria: 'Limpieza', titulo: 'Revisar suelo del baño', orden: 17, activa: true },
  { id: 'chk-a-018', tipo: 'apertura', categoria: 'Limpieza', titulo: 'Limpiar espejo del baño', orden: 18, activa: true },
  { id: 'chk-a-019', tipo: 'apertura', categoria: 'Limpieza', titulo: 'Limpieza de espejos', orden: 19, activa: true },
  { id: 'chk-a-020', tipo: 'apertura', categoria: 'Limpieza', titulo: 'Quitar polvo', orden: 20, activa: true },
  { id: 'chk-a-021', tipo: 'apertura', categoria: 'Limpieza', titulo: 'Limpieza de carros y máquinas', orden: 21, activa: true },
  { id: 'chk-a-022', tipo: 'apertura', categoria: 'Limpieza', titulo: 'Limpieza de picaportes', orden: 22, activa: true },
  { id: 'chk-a-023', tipo: 'apertura', categoria: 'Limpieza', titulo: 'Mantener orden del almacén', orden: 23, activa: true },

  // APERTURA — Comunicación
  { id: 'chk-a-024', tipo: 'apertura', categoria: 'Comunicación', titulo: 'Responder llamadas (máx. 1-2 horas)', orden: 24, activa: true },
  { id: 'chk-a-025', tipo: 'apertura', categoria: 'Comunicación', titulo: 'Responder WhatsApp (máx. 1-2 horas)', orden: 25, activa: true },
  { id: 'chk-a-026', tipo: 'apertura', categoria: 'Comunicación', titulo: 'Responder emails IONOS (máx. 24 horas)', orden: 26, activa: true },
  { id: 'chk-a-027', tipo: 'apertura', categoria: 'Comunicación', titulo: 'Responder mensajes de Instagram (máx. 12 horas)', orden: 27, activa: true },

  // DURANTE EL DÍA — Gestión
  { id: 'chk-d-001', tipo: 'durante_dia', categoria: 'Gestión', titulo: 'Registrar notas de clientes (KOIBOX)', orden: 1, activa: true },
  { id: 'chk-d-002', tipo: 'durante_dia', categoria: 'Gestión', titulo: 'Programas realizados y enviados', orden: 2, activa: true },
  { id: 'chk-d-003', tipo: 'durante_dia', categoria: 'Gestión', titulo: 'Comprobar respuestas de programas', orden: 3, activa: true },
  { id: 'chk-d-004', tipo: 'durante_dia', categoria: 'Gestión', titulo: 'Revisar agenda', orden: 4, activa: true },
  { id: 'chk-d-005', tipo: 'durante_dia', categoria: 'Gestión', titulo: 'Avisar falta de stock o equipos (Elipse / Adipologie)', orden: 5, activa: true },
  { id: 'chk-d-006', tipo: 'durante_dia', categoria: 'Gestión', titulo: 'Solicitar reseñas', orden: 6, activa: true },
  { id: 'chk-d-007', tipo: 'durante_dia', categoria: 'Gestión', titulo: 'Organizar fotos', orden: 7, activa: true },
  { id: 'chk-d-008', tipo: 'durante_dia', categoria: 'Gestión', titulo: 'Anotar número de consentimientos firmados', orden: 8, activa: true },

  // DURANTE EL DÍA — Formación
  { id: 'chk-d-009', tipo: 'durante_dia', categoria: 'Formación', titulo: 'Estudio de productos', orden: 9, activa: true },
  { id: 'chk-d-010', tipo: 'durante_dia', categoria: 'Formación', titulo: 'Mejorar discurso comercial', orden: 10, activa: true },

  // DURANTE EL DÍA — Presencia
  { id: 'chk-d-011', tipo: 'durante_dia', categoria: 'Presencia', titulo: 'Uniforme correcto', orden: 11, activa: true },
  { id: 'chk-d-012', tipo: 'durante_dia', categoria: 'Presencia', titulo: 'Maquillaje suave', orden: 12, activa: true },
  { id: 'chk-d-013', tipo: 'durante_dia', categoria: 'Presencia', titulo: 'Pelo recogido', orden: 13, activa: true },

  // DURANTE EL DÍA — Actitud
  { id: 'chk-d-014', tipo: 'durante_dia', categoria: 'Actitud', titulo: 'Amabilidad', orden: 14, activa: true },
  { id: 'chk-d-015', tipo: 'durante_dia', categoria: 'Actitud', titulo: 'Resolver dudas', orden: 15, activa: true },
  { id: 'chk-d-016', tipo: 'durante_dia', categoria: 'Actitud', titulo: 'Trabajo en equipo', orden: 16, activa: true },
  { id: 'chk-d-017', tipo: 'durante_dia', categoria: 'Actitud', titulo: 'Mejorar comunicación', orden: 17, activa: true },

  // CIERRE — Instalaciones
  { id: 'chk-c-001', tipo: 'cierre', categoria: 'Instalaciones', titulo: 'Bajar persianas', orden: 1, activa: true },
  { id: 'chk-c-002', tipo: 'cierre', categoria: 'Instalaciones', titulo: 'Apagar música', orden: 2, activa: true },
  { id: 'chk-c-003', tipo: 'cierre', categoria: 'Instalaciones', titulo: 'Apagar aire/ventilación', orden: 3, activa: true },
  { id: 'chk-c-004', tipo: 'cierre', categoria: 'Instalaciones', titulo: 'Cerrar ventanas', orden: 4, activa: true },
  { id: 'chk-c-005', tipo: 'cierre', categoria: 'Instalaciones', titulo: 'Apagar luces', orden: 5, activa: true },
  { id: 'chk-c-006', tipo: 'cierre', categoria: 'Instalaciones', titulo: 'Apagar regletas', orden: 6, activa: true },
  { id: 'chk-c-007', tipo: 'cierre', categoria: 'Instalaciones', titulo: 'Guardar lamparita', orden: 7, activa: true },

  // CIERRE — Salas y orden
  { id: 'chk-c-008', tipo: 'cierre', categoria: 'Salas y orden', titulo: 'Cabinas ordenadas', orden: 8, activa: true },
  { id: 'chk-c-009', tipo: 'cierre', categoria: 'Salas y orden', titulo: 'Papeleras vacías', orden: 9, activa: true },

  // CIERRE — Operativa
  { id: 'chk-c-010', tipo: 'cierre', categoria: 'Operativa', titulo: 'Apagar lavadora y secadora', orden: 10, activa: true },
  { id: 'chk-c-011', tipo: 'cierre', categoria: 'Operativa', titulo: 'Cerrar caja', orden: 11, activa: true },
  { id: 'chk-c-012', tipo: 'cierre', categoria: 'Operativa', titulo: 'Anotar incidencias', orden: 12, activa: true },

  // CIERRE — Limpieza
  { id: 'chk-c-013', tipo: 'cierre', categoria: 'Limpieza', titulo: 'Tirar basura', orden: 13, activa: true },
  { id: 'chk-c-014', tipo: 'cierre', categoria: 'Limpieza', titulo: 'Fregar lavabo', orden: 14, activa: true },

  // SEMANAL
  { id: 'chk-s-001', tipo: 'semanal', categoria: 'Revisión semanal', titulo: 'Número de programas enviados', orden: 1, activa: true },
  { id: 'chk-s-002', tipo: 'semanal', categoria: 'Revisión semanal', titulo: 'Número de programas aceptados', orden: 2, activa: true },
  { id: 'chk-s-003', tipo: 'semanal', categoria: 'Revisión semanal', titulo: 'Propuestas de productos', orden: 3, activa: true },
  { id: 'chk-s-004', tipo: 'semanal', categoria: 'Revisión semanal', titulo: 'Ventas realizadas', orden: 4, activa: true },
  { id: 'chk-s-005', tipo: 'semanal', categoria: 'Revisión semanal', titulo: 'Logros del equipo', orden: 5, activa: true },
  { id: 'chk-s-006', tipo: 'semanal', categoria: 'Revisión semanal', titulo: 'Incidencias y soluciones', orden: 6, activa: true },
]

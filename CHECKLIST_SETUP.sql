-- ============================================================
-- CHECKLIST OPERATIVO — Schema + RLS + Seed
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. TEMPLATES (global, static — seeded below)
CREATE TABLE IF NOT EXISTS checklist_templates (
  id          TEXT        PRIMARY KEY,
  tipo        TEXT        NOT NULL CHECK (tipo IN ('apertura', 'durante_dia', 'cierre', 'semanal')),
  categoria   TEXT        NOT NULL,
  titulo      TEXT        NOT NULL,
  orden       INTEGER     NOT NULL DEFAULT 0,
  activa      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COMPLETIONS (per clinic, per date or week)
CREATE TABLE IF NOT EXISTS checklist_completions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID        NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  template_id     TEXT        NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  fecha           DATE,                          -- for apertura / durante_dia / cierre
  semana          INTEGER,                       -- ISO week number, for semanal
  año             INTEGER,                       -- year, for semanal
  completado_por  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  completado_en   TIMESTAMPTZ,
  notas           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraints via partial indexes (NULL-safe)
CREATE UNIQUE INDEX IF NOT EXISTS uq_checklist_completions_daily
  ON checklist_completions(clinic_id, template_id, fecha)
  WHERE fecha IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_checklist_completions_weekly
  ON checklist_completions(clinic_id, template_id, semana, año)
  WHERE semana IS NOT NULL AND año IS NOT NULL;

-- Query indexes
CREATE INDEX IF NOT EXISTS idx_checklist_completions_fecha
  ON checklist_completions(clinic_id, fecha);

CREATE INDEX IF NOT EXISTS idx_checklist_completions_semana
  ON checklist_completions(clinic_id, año, semana);

-- 3. ROW-LEVEL SECURITY
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read checklist_templates"
  ON checklist_templates FOR SELECT TO authenticated USING (true);

ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access checklist_completions"
  ON checklist_completions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 4. SEED — checklist templates
INSERT INTO checklist_templates (id, tipo, categoria, titulo, orden) VALUES
  -- APERTURA — Instalaciones
  ('chk-a-001','apertura','Instalaciones','Encender luces generales',1),
  ('chk-a-002','apertura','Instalaciones','Encender música',2),
  ('chk-a-003','apertura','Instalaciones','Encender televisión',3),
  ('chk-a-004','apertura','Instalaciones','Encender luces de las salas',4),
  ('chk-a-005','apertura','Instalaciones','Comprobar enchufes de las máquinas',5),
  ('chk-a-006','apertura','Instalaciones','Subir persiana',6),
  ('chk-a-007','apertura','Instalaciones','Revisar luz de la escalera (carga)',7),
  -- APERTURA — Salas y orden
  ('chk-a-008','apertura','Salas y orden','Preparación de salas',8),
  ('chk-a-009','apertura','Salas y orden','Revisar duplicidades en salas/aparatología',9),
  ('chk-a-010','apertura','Salas y orden','Revisar agenda del día y del día siguiente',10),
  ('chk-a-011','apertura','Salas y orden','Repasar papeleras',11),
  -- APERTURA — Zona cliente
  ('chk-a-012','apertura','Zona cliente','Revisar mueble de café y agua',12),
  -- APERTURA — Operativa
  ('chk-a-013','apertura','Operativa','Poner lavadoras y secadoras en marcha',13),
  ('chk-a-014','apertura','Operativa','Comprobar batería de móvil y tablets',14),
  ('chk-a-015','apertura','Operativa','Anotar efectivo inicial de caja',15),
  -- APERTURA — Limpieza
  ('chk-a-016','apertura','Limpieza','Aspirar (pelusas)',16),
  ('chk-a-017','apertura','Limpieza','Revisar suelo del baño',17),
  ('chk-a-018','apertura','Limpieza','Limpiar espejo del baño',18),
  ('chk-a-019','apertura','Limpieza','Limpieza de espejos',19),
  ('chk-a-020','apertura','Limpieza','Quitar polvo',20),
  ('chk-a-021','apertura','Limpieza','Limpieza de carros y máquinas',21),
  ('chk-a-022','apertura','Limpieza','Limpieza de picaportes',22),
  ('chk-a-023','apertura','Limpieza','Mantener orden del almacén',23),
  -- APERTURA — Comunicación
  ('chk-a-024','apertura','Comunicación','Responder llamadas (máx. 1-2 horas)',24),
  ('chk-a-025','apertura','Comunicación','Responder WhatsApp (máx. 1-2 horas)',25),
  ('chk-a-026','apertura','Comunicación','Responder emails IONOS (máx. 24 horas)',26),
  ('chk-a-027','apertura','Comunicación','Responder mensajes de Instagram (máx. 12 horas)',27),
  -- DURANTE EL DÍA — Gestión
  ('chk-d-001','durante_dia','Gestión','Registrar notas de clientes (KOIBOX)',1),
  ('chk-d-002','durante_dia','Gestión','Programas realizados y enviados',2),
  ('chk-d-003','durante_dia','Gestión','Comprobar respuestas de programas',3),
  ('chk-d-004','durante_dia','Gestión','Revisar agenda',4),
  ('chk-d-005','durante_dia','Gestión','Avisar falta de stock o equipos (Elipse / Adipologie)',5),
  ('chk-d-006','durante_dia','Gestión','Solicitar reseñas',6),
  ('chk-d-007','durante_dia','Gestión','Organizar fotos',7),
  ('chk-d-008','durante_dia','Gestión','Anotar número de consentimientos firmados',8),
  -- DURANTE EL DÍA — Formación
  ('chk-d-009','durante_dia','Formación','Estudio de productos',9),
  ('chk-d-010','durante_dia','Formación','Mejorar discurso comercial',10),
  -- DURANTE EL DÍA — Presencia
  ('chk-d-011','durante_dia','Presencia','Uniforme correcto',11),
  ('chk-d-012','durante_dia','Presencia','Maquillaje suave',12),
  ('chk-d-013','durante_dia','Presencia','Pelo recogido',13),
  -- DURANTE EL DÍA — Actitud
  ('chk-d-014','durante_dia','Actitud','Amabilidad',14),
  ('chk-d-015','durante_dia','Actitud','Resolver dudas',15),
  ('chk-d-016','durante_dia','Actitud','Trabajo en equipo',16),
  ('chk-d-017','durante_dia','Actitud','Mejorar comunicación',17),
  -- CIERRE — Instalaciones
  ('chk-c-001','cierre','Instalaciones','Bajar persianas',1),
  ('chk-c-002','cierre','Instalaciones','Apagar música',2),
  ('chk-c-003','cierre','Instalaciones','Apagar aire/ventilación',3),
  ('chk-c-004','cierre','Instalaciones','Cerrar ventanas',4),
  ('chk-c-005','cierre','Instalaciones','Apagar luces',5),
  ('chk-c-006','cierre','Instalaciones','Apagar regletas',6),
  ('chk-c-007','cierre','Instalaciones','Guardar lamparita',7),
  -- CIERRE — Salas y orden
  ('chk-c-008','cierre','Salas y orden','Cabinas ordenadas',8),
  ('chk-c-009','cierre','Salas y orden','Papeleras vacías',9),
  -- CIERRE — Operativa
  ('chk-c-010','cierre','Operativa','Apagar lavadora y secadora',10),
  ('chk-c-011','cierre','Operativa','Cerrar caja',11),
  ('chk-c-012','cierre','Operativa','Anotar incidencias',12),
  -- CIERRE — Limpieza
  ('chk-c-013','cierre','Limpieza','Tirar basura',13),
  ('chk-c-014','cierre','Limpieza','Fregar lavabo',14),
  -- SEMANAL
  ('chk-s-001','semanal','Revisión semanal','Número de programas enviados',1),
  ('chk-s-002','semanal','Revisión semanal','Número de programas aceptados',2),
  ('chk-s-003','semanal','Revisión semanal','Propuestas de productos',3),
  ('chk-s-004','semanal','Revisión semanal','Ventas realizadas',4),
  ('chk-s-005','semanal','Revisión semanal','Logros del equipo',5),
  ('chk-s-006','semanal','Revisión semanal','Incidencias y soluciones',6)
ON CONFLICT (id) DO NOTHING;

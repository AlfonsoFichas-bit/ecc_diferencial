# Tasks

## 1. Setup

- [x] 1.1 Scaffoldear Fresh 2.3.3 en directorio temporal y copiar estructura al
      repo (sin sobrescribir docs/ ni openspec/) — verificar `deno task dev`
      arranca
- [x] 1.2 Crear `lib/model.ts` con f, exact, heun, rk4, errores y métricas —
      verificar con `deno check lib/model.ts`
- [x] 1.3 Agregar symlink de gh CLI a `~/.local/bin/gh` y autenticar — verificar
      `gh --version`

## 2. Core Implementation

- [x] 2.1 Crear island `Simulator.tsx` con estado de inputs y cálculo —
      verificar que ejecuta simulación al presionar botón
- [x] 2.2 Crear componentes `InputField`, `ResultsTable`, `Interpretation` —
      verificar renderizado en dev
- [x] 2.3 Implementar tabla comparativa por iteración con errores — verificar
      columnas y filas
- [x] 2.4 Implementar gráfica de concentración (Chart.js) — verificar 3 curvas
      visibles
- [x] 2.5 Implementar gráfica de error absoluto — verificar 2 series visibles
- [x] 2.6 Implementar resumen de comparación de dos pasos — verificar métricas
      para h₁ y h₂
- [x] 2.7 Implementar validación de entradas y unidades — verificar mensajes de
      error
- [x] 2.8 Implementar interpretación dinámica — verificar texto generado

## 3. Page and Layout

- [x] 3.1 Crear `routes/index.tsx` con explicación del problema y ensamblaje —
      verificar página completa en dev
- [x] 3.2 Ajustar `routes/_app.tsx` (título, meta, estilos) — verificar HTML
      base
- [x] 3.3 Crear `README.md` con instrucciones y descripción del modelo —
      verificar comandos documentados

## 4. Documentation

- [x] 4.1 Escribir `docs/a_problema.md` a `docs/f_interpretacion.md` (secciones
      obligatorias) — verificar archivos presentes
- [x] 4.2 Declarar parámetros hipotéticos en UI y README — verificar texto
      visible

## 5. Verification

- [x] 5.1 Ejecutar `deno task build` y `deno task start` — verificar app en
      localhost:8000
- [x] 5.2 Revisar cálculos con un caso conocido (C₀=150, E=0, k=0.1, T=24) —
      verificar t*≈10.99 h

## 6. Deploy

- [x] 6.1 Inicializar git, commit y crear repo GitHub, push - verificar repo
      remoto
- [ ] 6.2 Conectar a Deno Deploy y obtener URL pública — verificar URL funcional
- [ ] 6.3 Grabar video de 1 minuto — verificar archivo de video

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.

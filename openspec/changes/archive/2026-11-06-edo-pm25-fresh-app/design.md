# Design

## Context

Repositorio inicialmente vacío salvo `docs/` y `openspec/`. Se requiere una app
web pública sin instalación. Ver `proposal.md` para motivación.

## Goals / Non-Goals

**Goals:**

- App web interactiva en Deno Fresh 2.3.3 con cálculo cliente-side.
- Funciones puras de modelo en `lib/model.ts`.
- Gráficas con Chart.js dentro de un island.
- Deploy en Deno Deploy.

**Non-Goals:**

- No se conecta a APIs reales de calidad del aire (datos hipotéticos).
- No se implementa persistencia ni autenticación.
- No se implementa Euler (solo Heun y RK4, según spec).

## Decisions

1. **Fresh 2.3.3 + Tailwind 4 (scaffolding oficial).** Alternativa: HTML
   estático. Se eligió Fresh por SSR + islands y deploy nativo en Deno Deploy.
2. **Cálculo en el cliente (island).** Alternativa: endpoints servidor. Se
   eligió cliente para interactividad inmediata y menor complejidad.
3. **Chart.js 4 vía npm specifier.** Alternativa: Canvas manual. Se eligió
   Chart.js por rapidez de implementación; se instancia solo en `useEffect` para
   evitar SSR.
4. **Funciones puras en `lib/model.ts`.** Alternativa: lógica en el island. Se
   eligió separar para testabilidad y claridad.
5. **Dos pasos de comparación (h₁, h₂).** Alternativa: un solo h. Se eligió para
   cumplir "al menos dos tamaños de paso".

## Risks / Trade-offs

- [Chart.js en SSR] → instanciar solo en `useEffect`.
- [Deno Deploy build] → verificar `deno task build` antes de conectar.
- [Parámetros hipotéticos] → declararlos en UI y README.
- [Tiempo de entrega] → priorizar funcionalidad mínima viable.

## Migration Plan

1. Scaffoldear Fresh en directorio temporal y copiar estructura.
2. Crear `lib/model.ts`, componentes e island.
3. Verificar en dev y build.
4. Commit, push a GitHub, conectar Deno Deploy.

## Open Questions

- Valores por defecto de parámetros (sugeridos en el plan, confirmar con el
  estudiante).

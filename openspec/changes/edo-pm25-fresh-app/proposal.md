# Proposal

## Why

La calidad del aire en La Paz (PM2.5) afecta la salud de grupos sensibles y el municipio ya publica datos en tiempo real. El desafío de Métodos Numéricos exige modelar una situación comunitaria con una EDO de primer orden, resolverla analíticamente y comparar Heun (RK2) y RK4. Hace falta una aplicación web pública que permita ajustar parámetros, ejecutar los métodos, visualizar la solución analítica, tablas, gráficas y errores, e interpretar resultados.

## What Changes

- Nueva aplicación web en Deno Fresh 2.3.3 (SSR + islands) con una página principal interactiva.
- Implementación de la EDO `dC/dt = E − k·C`, `C(0)=C₀` y su solución analítica `C(t)=E/k+(C₀−E/k)e^(−kt)`.
- Implementación de Heun (RK2) y RK4 clásico con los mismos parámetros, condición inicial, intervalo y paso `h`.
- Tabla comparativa por iteración, gráfica de concentración, gráfica de error absoluto y resumen de comparación de al menos dos tamaños de paso.
- Validación básica de entradas, identificación de unidades y explicación breve del problema estudiado.
- Documentación en `README.md` y en `docs/a..f.md` (secciones obligatorias).
- Despliegue en Deno Deploy y repositorio en GitHub.

## Capabilities

### New Capabilities
- `pm25-air-quality-simulator`: simulador web de la evolución de PM2.5 mediante una EDO de primer orden, con solución analítica, métodos numéricos Heun y RK4, comparación, visualización de errores y interpretación.

### Modified Capabilities
- (ninguna)

## Impact

- Código nuevo en el repositorio (`lib/`, `islands/`, `routes/`, `components/`).
- Dependencias: Deno, Fresh 2.3.3, Tailwind CSS 4, Chart.js 4.
- Despliegue: Deno Deploy (URL pública) y GitHub (código fuente).
- Sin cambios en código existente (repositorio inicialmente vacío salvo docs/openspec).
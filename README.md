# Modelado numérico de la concentración de PM2.5 en La Paz

Aplicación web (Deno Fresh 2.3.3) para simular la evolución de PM2.5 mediante la
EDO de primer orden:

\[ \frac{dC}{dt}=E-k\,C(t),\qquad C(0)=C_0 \]

con solución analítica \(C(t)=E/k+(C_0-E/k)e^{-kt}\), y métodos numéricos Heun
(RK2) y RK4.

## Requisitos

- Deno 2.x

## Ejecución

```bash
deno task dev    # desarrollo (http://localhost:5173 o el puerto que indique Vite)
deno task build  # build de producción
deno task start  # sirve _fresh/server.js en http://localhost:8000
```

## Descripción del modelo

- C(t): concentración de PM2.5 (µg/m³).
- t: tiempo (h).
- E: tasa de emisión (µg/(m³·h)) — hipotético.
- k: coeficiente de eliminación (h⁻¹) — hipotético.
- C0: concentración inicial (µg/m³).
- Umbral: nivel de alerta (µg/m³) — hipotético.

Los parámetros son hipotéticos y no constituyen predicciones comprobadas. La app
incluye validación básica de entradas, identificación de unidades y explicación
del problema.

## Despliegue

- Repositorio: https://github.com/AlfonsoFichas-bit/ecc_diferencial
- App (Cloudflare Workers): https://ecc-diferencial.alfonsofichas.workers.dev

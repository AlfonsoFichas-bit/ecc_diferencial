# Guion de video (1 minuto)

**0–10 s — Problema y comunidad**
Pantalla: página principal (hero + explicación).
Voz: Este desafío modela la concentración de PM2.5 en La Paz para apoyar la prevención sanitaria en grupos sensibles: niños, adultos mayores y personas con asma.

**10–20 s — EDO y condición inicial**
Pantalla: sección del modelo (EDO).
Voz: La EDO de primer orden es dC/dt = E − k·C(t), con C(0)=C₀, donde C está en µg/m³, t en horas, E en µg/(m³·h) y k en h⁻¹.

**20–30 s — Métodos**
Pantalla: fórmulas o tabla.
Voz: La solución analítica es C(t)=E/k+(C₀−E/k)e^(−kt). Para comparar, implementé Heun (RK2) y RK4 clásico con los mismos parámetros, condición inicial, intervalo y paso h.

**30–45 s — Demostración de la app**
Pantalla: ajustar parámetros → “Ejecutar simulación” → gráficas y tabla.
Voz: La app permite ajustar parámetros, ejecutar Heun y RK4, y muestra la solución analítica, tabla comparativa, gráficas de concentración y error, más la interpretación.

**45–60 s — Resultados y conclusiones**
Pantalla: resumen de dos pasos + interpretación.
Voz: Con los parámetros hipotéticos, RK4 presentó menor error que Heun frente a la solución analítica. El modelo estima si se supera el umbral de calidad y orienta recomendaciones preventivas. Parámetros hipotéticos, no predicciones comprobadas.

Cierre: Ronald Choque Sillo — Métodos Numéricos (INF-373).

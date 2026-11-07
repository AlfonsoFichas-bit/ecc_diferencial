## Propuesta recomendada

**Título:** *Modelo de evolución y predicción de PM2.5 en La Paz mediante ecuaciones diferenciales y métodos numéricos.*

**Problema:** La concentración de PM2.5 cambia por emisiones (vehículos, industria, quemas), dispersión atmosférica, lluvia y condiciones geográficas. Un modelo permite anticipar horas o días de mala calidad del aire y apoyar decisiones preventivas, como limitar actividad física al aire libre para grupos sensibles. [sim.lapaz](https://sim.lapaz.bo/ambiental/home/sensoresIca)

**Ecuación diferencial base:**

\[
\frac{dC}{dt} = E(t) - kC(t)
\]

donde:

- \(C(t)\): concentración de PM2.5 en \(\mu g/m^3\).
- \(E(t)\): tasa de emisión o entrada de contaminantes.
- \(k\): coeficiente de eliminación por dispersión, deposición y lavado por lluvia.

Si \(E(t)\) es constante, la solución analítica es:

\[
C(t) = C_0e^{-kt} + \frac{E}{k}\left(1-e^{-kt}\right)
\]

En la práctica, \(E(t)\) varía con el tráfico y la hora; por eso conviene usar una EDO no lineal o con coeficientes variables:

\[
\frac{dC}{dt} = \alpha T(t) - kC(t)
\]

donde \(T(t)\) puede representar tráfico, horas pico o actividad urbana.

## Aplicación en La Paz

Puedes usar los datos públicos del sistema municipal de calidad del aire, que calcula el ICA principalmente a partir de PM2.5 y muestra series temporales en varios puntos de la ciudad.  También existen estaciones con datos históricos y acceso por API, por ejemplo en Alto San Pedro y Achocalla, útiles para comparar zonas. [sim.lapaz](https://sim.lapaz.bo/ambiental/home/sensoresIca)

**Zonas sugeridas para comparar:**

| Zona | Justificación | Variable a modelar |
|---|---|---|
| Centro / Plaza Murillo | Alto tráfico y densidad urbana | PM2.5 horario |
| Alto San Pedro | Zona con estación de monitoreo disponible | PM2.5 horario |
| Achocalla | Permite comparar un área menos céntrica | PM2.5 horario |
| El Alto / zonas altas | Diferencias de viento, temperatura y actividad | PM2.5 horario |

La meta no es “predecir el clima”, sino construir un modelo razonable que ajuste los datos observados y estime la evolución futura bajo escenarios.

## Métodos numéricos a aplicar

Esta propuesta encaja muy bien con los temas típicos de la asignatura:

- **Método de Euler:** solución básica de la EDO y línea base.
- **Runge-Kutta de orden 4 (RK4):** método principal para mayor precisión.
- **Método de Euler mejorado / Heun:** comparación de precisión y costo computacional.
- **Ajuste de parámetros:** estimar \(E\) y \(k\) minimizando el error entre simulación y datos reales.
- **Interpolación:** completar o suavizar valores faltantes en la serie temporal.
- **Regresión / mínimos cuadrados:** relacionar PM2.5 con hora del día, tráfico estimado, temperatura o lluvia.
- **Análisis de error:** comparar Euler, Heun y RK4 frente a la solución analítica o datos observados.

Un entregable fuerte sería implementar RK4 en Python y comparar gráficamente:

\[
C_{\text{modelo}}(t) \quad \text{vs.} \quad C_{\text{observado}}(t)
\]

usando error cuadrático medio:

\[
RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(C_{\text{obs},i}-C_{\text{modelo},i})^2}
\]

## Producto final

Puedes entregar un sistema sencillo llamado, por ejemplo, **“AirePaz”**, con estos componentes:

- Recolección y limpieza de datos horarios de PM2.5.
- Ajuste del modelo EDO con datos de una semana o mes.
- Simulación de las próximas 24 o 48 horas.
- Alerta cuando se proyecte ICA mayor a 100, que corresponde a calidad “regular” y precaución para grupos de riesgo; a partir de 151 el municipio clasifica la situación como “muy mala” y de alerta sanitaria. [sim.lapaz](https://sim.lapaz.bo/ambiental/home/sensoresIca)
- Panel o notebook con gráficos, tabla de errores y recomendaciones por zona.

**Ejemplo de resultado esperable:** “Entre 7:00 y 9:00, el modelo proyecta un incremento de PM2.5 asociado al tráfico; se recomienda restringir actividad física intensa al aire libre para personas con asma, adultos mayores y niños.”

## Alternativas igualmente viables

Si prefieres otro eje, estas opciones también permiten usar EDOs de forma natural:

| Tema | Problema | EDO posible |
|---|---|---|
| Bienestar animal | Dinámica de adopciones y abandono de mascotas | \(\frac{dA}{dt}=r-\alpha A\), donde \(A\) son animales sin hogar |
| Salud preventiva | Propagación de gripe o dengue en un campus/barrio | Modelo SIR |
| Huertos urbanos | Crecimiento de cultivos con agua y nutrientes limitados | \(\frac{dP}{dt}=rP(1-P/K)\) |
| Ahorro comunitario | Crecimiento de un fondo con aportes e intereses | \(\frac{dS}{dt}=a+rS\) |
| Reciclaje | Acumulación y recuperación de residuos reciclables | \(\frac{dR}{dt}=G-\beta R\) |
| Energía | Carga y descarga de baterías solares comunitarias | \(\frac{dQ}{dt}=P_{sol}-P_{dem}-\lambda Q\) |

Para **bienestar animal**, La Paz tiene un contexto real muy aprovechable: el municipio mantiene un proceso de adopción mediante su plataforma ALAX y la Casa de la Mascota, y realiza ferias de adopción responsable.  Podrías modelar el número de animales disponibles para adopción: [lapaz](https://lapaz.bo/ciudadprotectoradeanimales/)

\[
\frac{dN}{dt} = I(t) - \alpha N(t)
\]

donde \(I(t)\) representa ingresos de animales rescatados y \(\alpha\) la tasa efectiva de adopción. Sin embargo, conseguir datos suficientemente completos puede ser más difícil que con calidad del aire.

## Mi recomendación

Elige **calidad del aire y PM2.5**. Es el tema con mejor equilibrio entre:

- Relevancia real para La Paz.
- Disponibilidad de datos públicos. [sim.lapaz](https://sim.lapaz.bo/ambiental/home/sensoresIca)
- Aplicación directa de EDOs y métodos numéricos.
- Posibilidad de generar un producto útil: alertas, visualizaciones y recomendaciones.
- Facilidad para justificar el modelo ante tu docente.

**Título final sugerido:**  
*“Modelación numérica de la concentración de PM2.5 en La Paz mediante ecuaciones diferenciales y el método de Runge-Kutta para la prevención de riesgos sanitarios.”*

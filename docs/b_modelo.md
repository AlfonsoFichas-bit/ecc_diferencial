# b) Modelo matemático

**Variable dependiente:** C(t) — concentración de PM2.5 (µg/m³).

**Variable independiente:** t — tiempo (h).

**Parámetros (con unidades):**

- C₀: concentración inicial (µg/m³).
- E: tasa de emisión/entrada (µg/(m³·h)) — hipotético.
- k: coeficiente de eliminación (h⁻¹) — dispersión, deposición, lavado por
  lluvia.
- T: tiempo de simulación (h).
- h: tamaño de paso (h).
- Umbral: nivel de alerta (µg/m³) — hipotético.

**EDO y condición inicial:** \[ \frac{dC}{dt}=E-k\,C(t),\qquad C(0)=C_0 \]

**Justificación:** el término E representa la entrada constante de
contaminantes; el término -kC representa la eliminación proporcional a la
concentración (primer orden).

**Supuestos explícitos:**

- E y k constantes en el intervalo.
- Mezcla homogénea del aire en la zona modelada.
- No se consideran fuentes puntuales adicionales ni cambios meteorológicos
  abruptos.
- Parámetros hipotéticos (no predicciones comprobadas).

**Intervalo de simulación:** [0, T] horas.

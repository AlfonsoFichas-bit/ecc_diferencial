# f) Interpretación y conclusiones

**Significado en lenguaje sencillo:** El modelo estima cómo cambia la
concentración de PM2.5 con el tiempo bajo emisiones y eliminación constantes.
Permite anticipar si se superará un umbral de calidad del aire y recomendar
restricciones temporales de actividad física al aire libre para grupos
sensibles.

**Respuesta a la pregunta del desafío:** Una EDO de primer orden resume el
balance entre entrada y eliminación de contaminantes; Heun y RK4 permiten
aproximar su solución cuando se requiere discretización. En las pruebas, RK4
obtuvo el menor error frente a la solución analítica.

**Limitaciones del modelo:** parámetros hipotéticos, E y k constantes, sin datos
meteorológicos reales ni fuentes puntuales; no es una predicción comprobada.

**Método con menor error:** RK4 (en general), seguido de Heun.

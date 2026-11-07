# 📋 Especificación: Desafío EDO de primer orden (Métodos Numéricos)

**Fecha límite:** viernes 6 de noviembre de 2026 (hoy). Actividad individual.

## 1. Qué hay que modelar

- Un problema **real o verosímil** que aporte al bienestar de una comunidad, planteado como una **EDO ordinaria de primer orden con condición inicial** `y(0) = y₀`.
- Debe responder una **pregunta concreta** con una **meta cuantificable** (no basta describir un tema).
- Temas sugeridos: bienestar animal (reencuentro/adopción de mascotas), salud preventiva, educación, huertos urbanos, emprendimientos, ahorro comunitario, deporte, reciclaje, cultura, energía, conectividad o iniciativas propias.

## 2. Contenido obligatorio del desarrollo (secciones a–f)

| Sección | Requisitos |
|---|---|
| **a) Problema y contexto** | Nombre del desafío, comunidad beneficiaria, problema específico, relevancia y la pregunta a responder. |
| **b) Modelo matemático** | Variable dependiente; variable independiente = **tiempo**; parámetros **con unidades**; formulación y justificación de la EDO y de `y(0)=y₀`; supuestos explícitos; intervalo de simulación. |
| **c) Solución analítica** | Resolver la EDO de forma exacta y **verificar por sustitución** que cumple la ecuación y la condición inicial. Elegir un modelo con solución analítica accesible. |
| **d) Soluciones numéricas** | Implementar **Heun (RK2)** y **RK4 clásico**, con los mismos parámetros, condición inicial, intervalo y paso `h`. |
| **e) Análisis comparativo** | Tabla por pasos/iteraciones; gráfica con analítica + Heun + RK4; **error absoluto** y **error relativo porcentual** frente a la solución analítica (cuando el valor exacto ≠ 0); comparar **al menos dos tamaños de paso**. |
| **f) Interpretación y conclusiones** | Significado en lenguaje sencillo para la comunidad; respuesta a la pregunta del desafío; limitaciones del modelo; qué método dio menor error. |

## 3. Requerimientos de la aplicación web (obligatoria)

Debe permitir:
- Ingresar o ajustar: **condición inicial, parámetros, tamaño de paso h y tiempo de simulación**.
- Ejecutar **Heun y RK4**.
- Mostrar: **solución analítica, tabla comparativa y gráfica**.
- **Visualizar los errores.**
- Ofrecer una **interpretación del resultado**.
- Incluir: **validación básica de entradas**, **identificación de unidades** y una **explicación breve del problema estudiado**.
- Publicarse en una **URL pública funcionando sin instalación**.

## 4. Entregables

1. **Enlace a la aplicación web** (URL pública, accesible sin instalación).
2. **Enlace al repositorio GitHub** con código fuente, instrucciones de ejecución y descripción del modelo.
3. **Video explicativo de 1 minuto**: presentar el problema que resuelve, la EDO y condición inicial, explicar brevemente el uso de Heun, RK4 y la solución analítica, mostrar la aplicación y cerrar con resultados y conclusiones.
4. **Envío** de los tres enlaces identificados con nombre completo, título del desafío y materia, hasta el 6 de noviembre de 2026.

## 5. Rúbrica (100 puntos)

| Criterio | Puntaje |
|---|---|
| Originalidad, relevancia y claridad del problema | 15 |
| EDO, variables, parámetros y condición inicial bien definidos | 20 |
| Solución analítica correcta y verificada | 15 |
| Implementación correcta de Heun y RK4 | 20 |
| Comparación, gráficos, errores y análisis de resultados | 15 |
| Aplicación web funcional, repositorio y video de 1 minuto | 15 |
| **TOTAL** | **100** |

## 6. Condiciones de calidad

- El desafío debe ser **propio y coherente**; los parámetros pueden ser hipotéticos pero deben **declararse como tales**.
- **No** presentar simulaciones como predicciones comprobadas sin datos reales.
- Los enlaces se revisarán por funcionamiento y correspondencia con el proyecto.
- El estudiante debe poder **justificar ecuaciones, decisiones de implementación, resultados y conclusiones**.

**Pregunta guía:** ¿Cómo puede una EDO de primer orden ayudarnos a comprender y mejorar una situación de nuestra comunidad, y qué tan precisas son las aproximaciones de Heun y RK4?


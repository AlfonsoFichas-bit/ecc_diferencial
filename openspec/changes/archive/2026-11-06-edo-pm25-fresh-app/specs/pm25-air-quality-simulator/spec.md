# Spec Delta

## Purpose

Permite a estudiantes y comunidad simular la evolución de PM2.5 en La Paz
mediante una EDO de primer orden, comparar métodos numéricos y visualizar
errores e interpretación.

## ADDED Requirements

### Requirement: Modelado de la EDO de PM2.5

El sistema SHALL modelar la concentración de PM2.5 con la EDO
`dC/dt = E − k·C(t)` y condición inicial `C(0)=C₀`, donde `C` está en μg/m³, `t`
en horas, `E` en μg/(m³·h) y `k` en h⁻¹.

#### Scenario: Parámetros válidos

- **WHEN** el usuario ingresa C₀, E, k, T y h válidos
- **THEN** el sistema calcula la evolución de C(t) en el intervalo [0, T]

### Requirement: Solución analítica exacta

El sistema SHALL calcular la solución analítica
`C(t) = E/k + (C₀ − E/k)·e^(−k t)` y verificar que cumple `C(0)=C₀` y la EDO.

#### Scenario: Condición inicial satisfecha

- **WHEN** se evalúa la solución analítica en t=0
- **THEN** el resultado es igual a C₀

### Requirement: Ejecución de Heun (RK2)

El sistema SHALL ejecutar el método de Heun con la misma f, C₀, E, k, T y h,
generando valores C_n en cada paso.

#### Scenario: Mismo número de pasos que RK4

- **WHEN** se ejecuta Heun con paso h
- **THEN** se generan floor(T/h)+1 valores alineados temporalmente con RK4

### Requirement: Ejecución de RK4 clásico

El sistema SHALL ejecutar el método RK4 clásico con la misma f, C₀, E, k, T y h.

#### Scenario: Comparabilidad

- **WHEN** se ejecutan Heun y RK4 con los mismos parámetros
- **THEN** ambos producen series temporales comparables paso a paso

### Requirement: Tabla comparativa por iteración

El sistema SHALL mostrar una tabla con columnas t, C_exacta, C_Heun, C_RK4,
error absoluto de Heun, error absoluto de RK4, error relativo porcentual de Heun
y de RK4.

#### Scenario: Valores por paso

- **WHEN** la simulación finaliza
- **THEN** la tabla contiene una fila por cada paso de tiempo

### Requirement: Visualización de errores

El sistema SHALL visualizar el error absoluto de Heun y RK4 frente a la solución
analítica, incluyendo una gráfica de error vs tiempo.

#### Scenario: Gráfica de errores disponible

- **WHEN** existen resultados numéricos
- **THEN** se muestra una gráfica con dos series de error absoluto

### Requirement: Comparación de al menos dos tamaños de paso

El sistema SHALL permitir ingresar dos tamaños de paso h₁ y h₂ y mostrar un
resumen comparativo de pasos, error máximo y RMSE para ambos.

#### Scenario: Resumen comparativo

- **WHEN** el usuario ingresa h₁ y h₂ válidos
- **THEN** se muestra un resumen con métricas para ambos pasos

### Requirement: Validación básica de entradas

El sistema SHALL validar que C₀≥0, E≥0, k>0, h₁>0, h₂>0, T>0 y umbral>0,
mostrando mensajes de error cuando no se cumplan.

#### Scenario: Parámetro inválido

- **WHEN** el usuario ingresa k=0
- **THEN** el sistema muestra un mensaje de error y no ejecuta la simulación

### Requirement: Identificación de unidades

El sistema SHALL identificar las unidades de cada parámetro y resultado (μg/m³,
h, μg/(m³·h), h⁻¹) en la interfaz.

#### Scenario: Unidades visibles

- **WHEN** se muestra un campo de entrada o resultado
- **THEN** se muestra su unidad junto al valor

### Requirement: Interpretación del resultado

El sistema SHALL ofrecer una interpretación en lenguaje sencillo que incluya la
concentración final, el tiempo para alcanzar el umbral de calidad y qué método
tuvo menor error.

#### Scenario: Interpretación generada

- **WHEN** la simulación finaliza
- **THEN** se muestra un texto de interpretación con la conclusión principal

### Requirement: Explicación del problema estudiado

El sistema SHALL incluir una explicación breve del problema modelado, la EDO,
supuestos y la naturaleza hipotética de los parámetros.

#### Scenario: Explicación visible

- **WHEN** se carga la página principal
- **THEN** se muestra la explicación del problema estudiado

# c) Solución analítica

La EDO lineal de primer orden \(\frac{dC}{dt}+kC=E\) tiene factor integrante
\(e^{kt}\):

\[ \frac{d}{dt}\left(C\,e^{kt}\right)=E\,e^{kt} \]

Integrando:

\[ C\,e^{kt}=\frac{E}{k}e^{kt}+A \;\Rightarrow\;
C(t)=\frac{E}{k}+\left(C_0-\frac{E}{k}\right)e^{-kt} \]

**Verificación por sustitución:**

- Condición inicial: \(C(0)=\frac{E}{k}+(C_0-\frac{E}{k})\cdot 1=C_0\). ✔
- Derivada: \(C'(t)=-k(C_0-\frac{E}{k})e^{-kt}=E-kC(t)\). ✔ Cumple la EDO.

Caso de verificación: \(C_0=150,\ E=0,\ k=0.1,\ T=24\) → tiempo para alcanzar 50
µg/m³ ≈ 10.99 h.

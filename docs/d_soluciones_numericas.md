# d) Soluciones numéricas

Se implementan Heun (RK2) y RK4 clásico con la misma \(f(C)=E-kC\), \(C_0\),
\(E\), \(k\), \(T\) y paso \(h\).

**Heun (RK2 mejorado):** \[ \begin{aligned} k_1 &= h\,f(C_n)\\ k_2 &=
h\,f(C_n+k_1)\\ C_{n+1} &= C_n+\frac{k_1+k_2}{2} \end{aligned} \]

**RK4 clásico:** \[ \begin{aligned} k_1 &= h\,f(C_n)\\ k_2 &=
h\,f(C_n+\tfrac{k_1}{2})\\ k_3 &= h\,f(C_n+\tfrac{k_2}{2})\\ k_4 &=
h\,f(C_n+k_3)\\ C_{n+1} &= C_n+\frac{k_1+2k_2+2k_3+k_4}{6} \end{aligned} \]

Ambos generan \( \lfloor T/h\rfloor+1 \) valores alineados temporalmente por
paso.

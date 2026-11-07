import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import Simulator from "../islands/Simulator.tsx";

export default define.page(function Home() {
  return (
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      <Head>
        <title>Simulador PM2.5 La Paz · EDO & Métodos Numéricos</title>
        <meta
          name="description"
          content="Plataforma de modelado numérico de concentración de PM2.5 en La Paz mediante EDO de primer orden, solución analítica, Heun (RK2) y RK4."
        />
        <meta name="page-type" content="software" />
        <meta name="site-kind" content="software" />
      </Head>

      {/* Top Technical Navigation Bar */}
      <header class="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <span class="font-mono font-bold text-slate-950 text-sm">PM</span>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-sm tracking-tight text-slate-100">
                AERO-EDO{" "}
                <span class="text-cyan-400 font-mono font-medium">La Paz</span>
              </span>
              <span class="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Modelado Numérico · Calidad del Aire
              </span>
            </div>
          </div>

          <nav class="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <a href="#simulador" class="hover:text-cyan-400 transition-colors">
              Simulador
            </a>
            <a
              href="#contexto-modelo"
              class="hover:text-cyan-400 transition-colors"
            >
              Problema & Modelo (a-b)
            </a>
            <a
              href="#solucion-metodos"
              class="hover:text-cyan-400 transition-colors"
            >
              Analítica & RK (c-d)
            </a>
            <a
              href="#analisis-conclusiones"
              class="hover:text-cyan-400 transition-colors"
            >
              Análisis & Impacto (e-f)
            </a>
          </nav>

          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse">
              </span>
              Live Workers
            </span>
            <a
              href="https://github.com/AlfonsoFichas-bit/ecc_diferencial"
              target="_blank"
              rel="noopener noreferrer"
              class="px-2.5 py-1 text-xs rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 btn-press"
            >
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <main class="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section class="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80 tech-grid">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col gap-6">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                MÉTODOS NUMÉRICOS · DESAFÍO EDO 1ER ORDEN
              </span>
              <span class="px-2.5 py-1 rounded-md text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
                La Paz, Bolivia · Altitud &gt;3.600 msnm
              </span>
            </div>

            <div class="max-w-4xl flex flex-col gap-3">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Modelado Numérico de la Concentración de{" "}
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  PM2.5 en La Paz
                </span>
              </h1>
              <p class="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
                Simulación temporal de dinámica atmosférica mediante la EDO de
                balance de masa{" "}
                <span class="font-mono text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-sm">
                  dC/dt = E - k·C(t)
                </span>
                . Contraste riguroso entre la solución analítica exacta, el
                método de Heun (RK2) y Runge-Kutta de 4to orden (RK4) para la
                prevención sanitaria comunitaria.
              </p>
            </div>

            {/* Quick Metrics Strip */}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span class="text-[11px] text-slate-400 font-mono block">
                  Ecuación Gobernativa
                </span>
                <span class="text-sm font-semibold font-mono text-cyan-300">
                  dC/dt + kC = E
                </span>
              </div>
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span class="text-[11px] text-slate-400 font-mono block">
                  Solución Exacta
                </span>
                <span class="text-sm font-semibold font-mono text-slate-100">
                  Factor Integrante e^(kt)
                </span>
              </div>
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span class="text-[11px] text-slate-400 font-mono block">
                  Métodos Discretos
                </span>
                <span class="text-sm font-semibold font-mono text-emerald-400">
                  Heun (RK2) & RK4
                </span>
              </div>
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span class="text-[11px] text-slate-400 font-mono block">
                  Umbral de Alerta ICA
                </span>
                <span class="text-sm font-semibold font-mono text-amber-400">
                  50 µg/m³ (Preventivo)
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2 flex-wrap">
              <a
                href="#simulador"
                class="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm shadow-md shadow-cyan-500/20 btn-press flex items-center gap-2"
              >
                <span>Acceder al Simulador Interactivo</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </a>
              <a
                href="#contexto-modelo"
                class="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-medium btn-press"
              >
                Fundamentos Teóricos (a–f)
              </a>
            </div>
          </div>
        </section>

        {/* SIMULATOR SECTION */}
        <section id="simulador" class="py-12 border-b border-slate-800/80">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded bg-cyan-400"></span>
                <h2 class="text-2xl font-bold tracking-tight text-white">
                  Laboratorio de Simulación Numérica
                </h2>
              </div>
              <p class="text-sm text-slate-400 max-w-2xl">
                Ajuste parámetros de entrada, seleccione escenarios de La Paz o
                compare la convergencia discretizando con dos pasos temporales
                distintos (h₁ y h₂).
              </p>
            </div>

            {/* The Island */}
            <div class="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/90 shadow-2xl backdrop-blur-sm">
              <Simulator />
            </div>
          </div>
        </section>

        {/* SECTION A & B: PROBLEMA Y MODELO */}
        <section
          id="contexto-modelo"
          class="py-14 border-b border-slate-800/80 bg-slate-950/50"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sección a */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    SECCIÓN a
                  </span>
                  <span class="text-xs text-slate-400 font-mono">
                    Problema & Contexto
                  </span>
                </div>
                <h3 class="text-lg font-bold text-white">
                  Calidad del Aire en la Cuenca de La Paz
                </h3>
                <div class="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    <strong class="text-slate-100">
                      Comunidad beneficiaria:
                    </strong>{" "}
                    Habitantes de la ciudad de La Paz (especialmente grupos de
                    alto riesgo: niños en edad escolar, adultos mayores y
                    pacientes con asma o patologías respiratorias crónicas) y
                    autoridades municipales de salud y medio ambiente.
                  </p>
                  <p>
                    <strong class="text-slate-100">Problema específico:</strong>
                    {" "}
                    La topografía de hoya de La Paz (&gt;3.600 msnm), combinada
                    con inversiones térmicas matutinas, tráfico denso y quemas
                    estacionales (chaqueos), genera episodios críticos de
                    concentración de material particulado fino (PM2.5).
                  </p>
                  <p class="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-cyan-300">
                    <strong>Pregunta del desafío:</strong>{" "}
                    ¿Cómo evoluciona la concentración de PM2.5 en un horizonte
                    de tiempo dado bajo parámetros hipotéticos, y qué tan
                    precisas son las aproximaciones de Heun (RK2) y RK4 frente a
                    la solución analítica exacta?
                  </p>
                </div>
              </div>

              {/* Sección b */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    SECCIÓN b
                  </span>
                  <span class="text-xs text-slate-400 font-mono">
                    Modelo Matemático
                  </span>
                </div>
                <h3 class="text-lg font-bold text-white">
                  Formulación de la EDO de Balance de Masa
                </h3>
                <div class="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    La variación neta de contaminante en el volumen de control
                    atmosférico se formula mediante la EDO de primer orden:
                  </p>
                  <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-sm text-emerald-300">
                    dC/dt = E - k·C(t), con condición inicial C(0) = C₀
                  </div>
                  <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <li class="bg-slate-950/70 p-2 rounded border border-slate-800">
                      <strong class="text-slate-100">C(t):</strong>{" "}
                      Concentración PM2.5 (µg/m³)
                    </li>
                    <li class="bg-slate-950/70 p-2 rounded border border-slate-800">
                      <strong class="text-slate-100">t:</strong>{" "}
                      Tiempo transcurrido (h)
                    </li>
                    <li class="bg-slate-950/70 p-2 rounded border border-slate-800">
                      <strong class="text-slate-100">E:</strong>{" "}
                      Tasa de emisión (µg/(m³·h))
                    </li>
                    <li class="bg-slate-950/70 p-2 rounded border border-slate-800">
                      <strong class="text-slate-100">k:</strong>{" "}
                      Tasa de remoción / lavado (h⁻¹)
                    </li>
                  </ul>
                  <p class="text-[11px] text-slate-400">
                    <strong class="text-slate-200">Supuestos:</strong>{" "}
                    E y k constantes en el intervalo [0, T], mezcla homogénea en
                    la atmósfera urbana y ausencia de fuentes puntuales
                    imprevistas. Declaración ética: Parámetros hipotéticos con
                    fines formativos y preventivos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION C & D: SOLUCIÓN ANALÍTICA Y MÉTODOS */}
        <section
          id="solucion-metodos"
          class="py-14 border-b border-slate-800/80"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sección c */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                    SECCIÓN c
                  </span>
                  <span class="text-xs text-slate-400 font-mono">
                    Solución Analítica
                  </span>
                </div>
                <h3 class="text-lg font-bold text-white">
                  Resolución Exacta y Verificación Formal
                </h3>
                <div class="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Reescribiendo en forma estándar lineal:{" "}
                    <span class="font-mono text-indigo-300">
                      C'(t) + k·C(t) = E
                    </span>. El factor integrante es{" "}
                    <span class="font-mono text-indigo-300">
                      μ(t) = e^(∫ k dt) = e^(kt)
                    </span>:
                  </p>
                  <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200">
                    d/dt [C(t)·e^(kt)] = E·e^(kt)
                    <br />
                    C(t)·e^(kt) = (E/k)·e^(kt) + A
                    <br />
                    <strong class="text-cyan-400 text-xs">
                      C(t) = E/k + (C₀ - E/k)·e^(-kt)
                    </strong>
                  </div>
                  <div class="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-1 text-[11px]">
                    <div class="text-slate-200 font-semibold">
                      Verificación por sustitución:
                    </div>
                    <div class="text-emerald-400 font-mono">
                      1. C(0) = E/k + (C₀ - E/k)·1 = C₀ ✔ (Cumple condición
                      inicial)
                    </div>
                    <div class="text-emerald-400 font-mono">
                      2. C'(t) = -k(C₀ - E/k)e^(-kt) = E - k·C(t) ✔ (Cumple la
                      EDO)
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-400">
                    Caso base de validación: C₀ = 150, E = 0, k = 0.1 → tiempo
                    para descender al umbral de 50 µg/m³: t = ln(150/50)/0.1 ≈
                    10.986 h.
                  </p>
                </div>
              </div>

              {/* Sección d */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50">
                    SECCIÓN d
                  </span>
                  <span class="text-xs text-slate-400 font-mono">
                    Métodos Numéricos
                  </span>
                </div>
                <h3 class="text-lg font-bold text-white">
                  Algoritmos de Runge-Kutta (Heun y RK4)
                </h3>
                <div class="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Para f(C) = E - kC con paso temporal h, se implementan
                    simultáneamente:
                  </p>
                  <div class="space-y-2">
                    <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      <span class="text-cyan-400 font-semibold block mb-1">
                        Heun (RK2 predictor-corrector):
                      </span>
                      k₁ = h·f(C_n)
                      <br />
                      k₂ = h·f(C_n + k₁)
                      <br />
                      C_(n+1) = C_n + (k₁ + k₂)/2
                    </div>

                    <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      <span class="text-emerald-400 font-semibold block mb-1">
                        Runge-Kutta 4 (RK4 Clásico):
                      </span>
                      k₁ = h·f(C_n), &nbsp; k₂ = h·f(C_n + k₁/2)
                      <br />
                      k₃ = h·f(C_n + k₂/2), &nbsp; k₄ = h·f(C_n + k₃)
                      <br />
                      C_(n+1) = C_n + (k₁ + 2k₂ + 2k₃ + k₄)/6
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-400">
                    Ambos esquemas marchan temporalmente en la misma grilla t_n
                    = n·h, permitiendo comparación directa de error local y
                    global.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION E & F: ANÁLISIS E INTERPRETACIÓN */}
        <section
          id="analisis-conclusiones"
          class="py-14 border-b border-slate-800/80 bg-slate-950/50"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sección e */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/50">
                    SECCIÓN e
                  </span>
                  <span class="text-xs text-slate-400 font-mono">
                    Análisis Comparativo
                  </span>
                </div>
                <h3 class="text-lg font-bold text-white">
                  Evaluación de Errores y Convergencia
                </h3>
                <div class="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Se evalúan el error absoluto{" "}
                    <span class="font-mono text-slate-100">
                      |C_num - C_exacta|
                    </span>{" "}
                    y el error relativo porcentual{" "}
                    <span class="font-mono text-slate-100">
                      |C_num - C_exacta| / |C_exacta| · 100%
                    </span>{" "}
                    en cada iteración.
                  </p>
                  <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
                    <div class="flex items-center justify-between text-slate-300">
                      <span>Heun (RK2)</span>
                      <span class="font-mono text-cyan-400">
                        Truncamiento global O(h²)
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-slate-300">
                      <span>RK4 Clásico</span>
                      <span class="font-mono text-emerald-400">
                        Truncamiento global O(h⁴)
                      </span>
                    </div>
                  </div>
                  <p class="text-slate-300">
                    <strong class="text-slate-100">
                      Comparación h₁ vs h₂:
                    </strong>{" "}
                    Al refinar el paso temporal a la mitad (ej. de 1.0 h a 0.5
                    h), RK4 exhibe una caída de error del orden de 2⁴ = 16
                    veces, mientras que Heun reduce su error en un factor de 2²
                    = 4 veces, validando empíricamente la cota teórica.
                  </p>
                </div>
              </div>

              {/* Sección f */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    SECCIÓN f
                  </span>
                  <span class="text-xs text-slate-400 font-mono">
                    Interpretación & Conclusiones
                  </span>
                </div>
                <h3 class="text-lg font-bold text-white">
                  Impacto Sanitario y Respuesta al Desafío
                </h3>
                <div class="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    <strong class="text-slate-100">
                      Respuesta a la pregunta guía:
                    </strong>{" "}
                    La EDO de primer orden modela fielmente la competencia entre
                    la entrada constante de polución y los mecanismos de
                    dispersión/limpieza. RK4 superó sistemáticamente a Heun en
                    precisión con diferencias de hasta varios órdenes de
                    magnitud para el mismo paso.
                  </p>
                  <p>
                    <strong class="text-slate-100">
                      Significado para la comunidad:
                    </strong>{" "}
                    Permite anticipar con horas de antelación si la atmósfera
                    paceña cruzará el umbral de alerta (50 µg/m³), posibilitando
                    avisos tempranos a unidades educativas y centros de salud
                    para suspender deportes al aire libre.
                  </p>
                  <p class="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                    <strong class="text-slate-200">Limitaciones:</strong>{" "}
                    El modelo asume tasa de emisión E y remoción k constantes y
                    atmósfera perfectamente mezclada. En condiciones reales
                    intervienen gradientes térmicos y vientos variables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer class="w-full border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span class="text-slate-300 font-medium">
              Simulador EDO PM2.5 · Métodos Numéricos
            </span>
            <span class="hidden sm:inline text-slate-700">|</span>
            <span>
              Parámetros hipotéticos con fines didácticos y de prevención
              sanitaria en La Paz.
            </span>
            <span class="hidden sm:inline text-slate-700">|</span>
            <span>Ronald Choque Sillo — Métodos Numéricos (INF-373)</span>
          </div>

          <div class="flex items-center gap-4 font-mono text-[11px]">
            <a
              href="https://github.com/AlfonsoFichas-bit/ecc_diferencial"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-cyan-400 transition-colors"
            >
              Repositorio GitHub
            </a>
            <span class="text-slate-700">·</span>
            <a
              href="https://ecc-diferencial.alfonsofichas.workers.dev"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-cyan-400 transition-colors"
            >
              Cloudflare Workers
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
});

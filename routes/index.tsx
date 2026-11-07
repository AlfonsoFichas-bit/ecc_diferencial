import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import Simulator from "../islands/Simulator.tsx";

export default define.page(function Home() {
  return (
    <div class="px-4 py-8 mx-auto min-h-screen bg-gray-50">
      <Head>
        <title>Modelado de PM2.5 en La Paz - Metodos Numericos</title>
        <meta
          name="description"
          content="Simulador de concentracion de PM2.5 mediante EDO de primer orden, solucion analitica, Heun y RK4."
        />
      </Head>
      <div class="max-w-6xl mx-auto flex flex-col gap-6">
        <header class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold text-gray-900">
            Modelado numerico de la concentracion de PM2.5 en La Paz
          </h1>
          <p class="text-gray-700">
            Desafio de Metodos Numericos: comprender y mejorar la calidad del
            aire comunitaria mediante una EDO de primer orden.
          </p>
        </header>

        <section class="bg-white rounded-lg shadow p-5 flex flex-col gap-3">
          <h2 class="text-xl font-semibold">
            Explicacion del problema estudiado
          </h2>
          <p class="text-sm text-gray-700">
            La concentracion de PM2.5 cambia por emisiones (vehiculos,
            industria, quemas), dispersion atmosferica, lluvia y condiciones
            geograficas. Se modela con la EDO de primer orden:
          </p>
          <p class="font-mono text-sm bg-gray-100 p-2 rounded">
            dC/dt = E - k*C(t), C(0) = C0
          </p>
          <ul class="text-sm text-gray-700 list-disc pl-5">
            <li>
              <b>C(t)</b>: concentracion de PM2.5 en µg/m³ (variable
              dependiente).
            </li>
            <li>
              <b>t</b>: tiempo en horas (variable independiente).
            </li>
            <li>
              <b>E</b>: tasa de emision/entrada en µg/(m³·h) (parametro
              hipotetico).
            </li>
            <li>
              <b>k</b>: coeficiente de eliminacion en h⁻¹ (dispersion,
              deposicion, lavado).
            </li>
            <li>
              <b>C0</b>: concentracion inicial en µg/m³.
            </li>
          </ul>
          <p class="text-sm text-gray-700">
            Solucion analitica: C(t) = E/k + (C0 - E/k)*e^(-k*t). Supuestos: E y
            k constantes en el intervalo, mezcla homogenea, sin fuentes
            puntuales adicionales. Los parametros son hipoteticos y no
            constituyen predicciones comprobadas. Unidades identificadas en cada
            campo.
          </p>
        </section>

        <section class="bg-white rounded-lg shadow p-5">
          <Simulator />
        </section>

        <footer class="text-xs text-gray-500 text-center">
          Aplicacion educativa - Metodos Numericos. Parametros hipoteticos.
        </footer>
      </div>
    </div>
  );
});

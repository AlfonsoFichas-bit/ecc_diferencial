import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="es" data-type="software" class="scroll-smooth">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="page-type" content="software" />
        <meta name="site-kind" content="software" />
        <meta
          name="description"
          content="Simulador numérico de dispersión de PM2.5 en La Paz mediante EDO de primer orden, solución analítica exacta, Heun (RK2) y Runge-Kutta 4."
        />
        <title>Simulador PM2.5 La Paz · EDO & Métodos Numéricos</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body class="bg-slate-950 text-slate-100 antialiased font-sans selection:bg-cyan-500/20 selection:text-cyan-200 min-h-screen">
        <Component />
      </body>
    </html>
  );
});

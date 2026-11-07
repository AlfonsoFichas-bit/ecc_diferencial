// Modelo de evolucion de PM2.5: dC/dt = E - k*C(t), C(0)=C0
// Funciones puras para testabilidad y uso en el cliente (island).

export interface SimulationResult {
  t: number[];
  exact: number[];
  heun: number[];
  rk4: number[];
}

export interface StepMetrics {
  h: number;
  steps: number;
  maxAbsErrorHeun: number;
  maxAbsErrorRk4: number;
  rmseHeun: number;
  rmseRk4: number;
  finalExact: number;
  finalHeun: number;
  finalRk4: number;
}

export function f(C: number, E: number, k: number): number {
  return E - k * C;
}

export function exact(t: number, c0: number, E: number, k: number): number {
  if (k === 0) {
    return c0 + E * t;
  }
  return E / k + (c0 - E / k) * Math.exp(-k * t);
}

export function simulate(
  c0: number,
  E: number,
  k: number,
  T: number,
  h: number,
): SimulationResult {
  const n = Math.max(0, Math.floor(T / h));
  const t: number[] = [];
  const ex: number[] = [];
  const he: number[] = [];
  const rk: number[] = [];

  let ch = c0;
  let cr = c0;

  for (let i = 0; i <= n; i++) {
    const ti = i * h;
    t.push(ti);
    ex.push(exact(ti, c0, E, k));
    he.push(ch);
    rk.push(cr);

    if (i < n) {
      // Heun (RK2 mejorado)
      const k1h = h * f(ch, E, k);
      const k2h = h * f(ch + k1h, E, k);
      ch = ch + (k1h + k2h) / 2;

      // RK4 clasico
      const k1 = h * f(cr, E, k);
      const k2 = h * f(cr + k1 / 2, E, k);
      const k3 = h * f(cr + k2 / 2, E, k);
      const k4 = h * f(cr + k3, E, k);
      cr = cr + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    }
  }

  return { t, exact: ex, heun: he, rk4: rk };
}

export function absError(a: number, b: number): number {
  return Math.abs(a - b);
}

export function relPercentError(
  value: number,
  exactValue: number,
): number | null {
  if (exactValue === 0) return null;
  return (Math.abs(value - exactValue) / Math.abs(exactValue)) * 100;
}

export function rmse(num: number[], ex: number[]): number {
  const n = Math.min(num.length, ex.length);
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const d = num[i] - ex[i];
    sum += d * d;
  }
  return Math.sqrt(sum / n);
}

export function maxAbsError(num: number[], ex: number[]): number {
  const n = Math.min(num.length, ex.length);
  let m = 0;
  for (let i = 0; i < n; i++) {
    m = Math.max(m, Math.abs(num[i] - ex[i]));
  }
  return m;
}

export function metrics(
  c0: number,
  E: number,
  k: number,
  T: number,
  h: number,
): StepMetrics {
  const res = simulate(c0, E, k, T, h);
  return {
    h,
    steps: res.t.length - 1,
    maxAbsErrorHeun: maxAbsError(res.heun, res.exact),
    maxAbsErrorRk4: maxAbsError(res.rk4, res.exact),
    rmseHeun: rmse(res.heun, res.exact),
    rmseRk4: rmse(res.rk4, res.exact),
    finalExact: res.exact[res.exact.length - 1],
    finalHeun: res.heun[res.heun.length - 1],
    finalRk4: res.rk4[res.rk4.length - 1],
  };
}

export function compareTwoSteps(
  c0: number,
  E: number,
  k: number,
  T: number,
  h1: number,
  h2: number,
): StepMetrics[] {
  return [metrics(c0, E, k, T, h1), metrics(c0, E, k, T, h2)];
}

export function timeToThreshold(
  t: number[],
  values: number[],
  threshold: number,
): number | null {
  if (values.length === 0) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (first >= threshold && last >= threshold) {
    // ya estaba por encima al inicio
    return 0;
  }
  if (first <= threshold && last >= threshold) {
    for (let i = 0; i < values.length; i++) {
      if (values[i] >= threshold) return t[i];
    }
  }
  if (first >= threshold && last <= threshold) {
    for (let i = 0; i < values.length; i++) {
      if (values[i] <= threshold) return t[i];
    }
  }
  return null;
}

export function validateInputs(
  c0: number,
  E: number,
  k: number,
  T: number,
  h1: number,
  h2: number,
  threshold: number,
): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(c0) || c0 < 0) errors.push("C0 debe ser >= 0 (µg/m³)");
  if (!Number.isFinite(E) || E < 0) errors.push("E debe ser >= 0 (µg/(m³·h))");
  if (!Number.isFinite(k) || k <= 0) errors.push("k debe ser > 0 (h⁻¹)");
  if (!Number.isFinite(T) || T <= 0) errors.push("T debe ser > 0 (h)");
  if (!Number.isFinite(h1) || h1 <= 0) errors.push("h1 debe ser > 0 (h)");
  if (!Number.isFinite(h2) || h2 <= 0) errors.push("h2 debe ser > 0 (h)");
  if (!Number.isFinite(threshold) || threshold <= 0) {
    errors.push("Umbral debe ser > 0 (µg/m³)");
  }
  return errors;
}

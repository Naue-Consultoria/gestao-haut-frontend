import { useEffect, useRef } from 'react';

/**
 * Executa `callback` após `delay` ms desde a última mudança em `deps`.
 * Cada nova mudança cancela o timer anterior (debounce clássico).
 * Também limpa o timer ao desmontar o componente.
 *
 * Uso:
 *   useDebouncedEffect(() => mapaAmbicaoService.upsert(dados, status), [dados], 2000);
 */
export function useDebouncedEffect(
  callback: () => void,
  deps: React.DependencyList,
  delay: number
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep the latest callback reference without re-triggering the effect.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

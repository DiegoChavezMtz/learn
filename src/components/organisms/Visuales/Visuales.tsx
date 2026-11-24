'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Visual as VisualTipo } from '@/types/lesson';
import { layerColor } from '@/utils/lesson';
import styles from './Visuales.module.css';

function Viaje() {
  return (
    <div className={styles.path}>
      <div className={styles.node}><i>💻</i>Tu PC</div><div className={styles.wire} />
      <div className={styles.node}><i>📡</i>Router</div><div className={styles.wire} />
      <div className={styles.node}><i>🖥️</i>Servidor</div>
    </div>
  );
}

function CableWifi() {
  const [wifi, setWifi] = useState(false);
  return (
    <>
      <div className={styles.cw}><span>{wifi ? '📶' : '🔌'}</span><span>→</span><span>🌐 navegador</span></div>
      <Button variant="ghost" className={styles.btn} onClick={() => setWifi(!wifi)}>{wifi ? 'Cambiar a cable' : 'Cambiar a Wi-Fi'}</Button>
    </>
  );
}

const PROBLEMAS = [
  ['Señal', '¿Cómo viajan los bits por el cable, la fibra o el aire?'],
  ['Otra red', '¿Cómo llega a una red al otro lado del mundo?'],
  ['Completo', '¿Cómo llega todo y en orden?'],
  ['¿Qué app?', '¿A qué programa se lo entrega el equipo?'],
] as const;

function Problemas() {
  const [k, setK] = useState<number | null>(null);
  return (
    <>
      <div className={styles.chips}>
        {PROBLEMAS.map((p, n) => <button key={p[0]} type="button" className={styles.chip} aria-pressed={k === n} onClick={() => setK(n)}>{p[0]}</button>)}
      </div>
      <div className={styles.detail}>{k === null ? 'Toca un problema.' : PROBLEMAS[k][1]}</div>
    </>
  );
}

const NIVELES = [['Carta', 'var(--l5)'], ['Sobre', 'var(--l4)'], ['Guía', 'var(--l3)'], ['Camión', 'var(--l2)']] as const;

function Paqueteria() {
  const [n, setN] = useState(1);
  let anidado: React.ReactNode = (
    <div className={styles.box} style={{ '--bc': NIVELES[0][1] } as React.CSSProperties}><span>✉️ {NIVELES[0][0]}</span></div>
  );
  for (let k = 1; k < n; k++) {
    anidado = <div className={styles.box} style={{ '--bc': NIVELES[k][1] } as React.CSSProperties}><span>{NIVELES[k][0]}</span>{anidado}</div>;
  }
  return (
    <>
      <div className={styles.nest}>{anidado}</div>
      <Button variant="ghost" className={styles.btn} onClick={() => setN(n < 4 ? n + 1 : 1)}>{n < 4 ? 'Siguiente nivel' : 'Volver a empezar'}</Button>
    </>
  );
}

const CAPAS = [
  [1, 'Física', 'Bits como señales: cable, fibra o radio. Sin direcciones.'],
  [2, 'Enlace de datos', 'Dentro de tu red local. Usa MAC. Tramas. Switch.'],
  [3, 'Red', 'Entre redes. Usa IP. Paquetes. Router.'],
  [4, 'Transporte', 'A qué programa va. Usa puertos. TCP y UDP.'],
  [5, 'Sesión', 'Abre, mantiene y cierra diálogos.'],
  [6, 'Presentación', 'Formato, compresión y cifrado de los datos.'],
  [7, 'Aplicación', 'Los protocolos que usan las apps: HTTP, DNS, SSH.'],
] as const;

function Torre() {
  const [sel, setSel] = useState<number | null>(null);
  const c = sel === null ? null : CAPAS[sel];
  return (
    <>
      <div className={styles.tower}>
        {CAPAS.map(([n, t], k) => (
          <button key={n} type="button" className={styles.layer} style={{ '--lc': layerColor(n) } as React.CSSProperties} aria-pressed={sel === k} onClick={() => setSel(k)}>
            <b>{n}</b>{t}
          </button>
        ))}
      </div>
      <div className={styles.detail}>{c ? <><strong>Capa {c[0]} · {c[1]}</strong><br />{c[2]}</> : 'Toca una capa.'}</div>
    </>
  );
}

const MAPA: Record<VisualTipo, () => React.ReactNode> = {
  viaje: Viaje, cablewifi: CableWifi, problemas: Problemas, paqueteria: Paqueteria, torre: Torre,
};

export function Visual({ tipo }: { tipo: VisualTipo }) {
  const V = MAPA[tipo];
  return <div className={styles.vis}><V /></div>;
}

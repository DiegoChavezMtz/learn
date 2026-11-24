'use client';
import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components/atoms/Screen';
import type { Libro } from '@/types/lesson';
import { etiqueta } from '@/utils/lesson';
import { renderLibro } from '@/utils/markdown';
import styles from './LibroView.module.css';

/** "Leer el tema completo": el Markdown de la Academia como referencia (contenido propio del repositorio, no de usuarios). */
export function LibroView({ libro }: { libro: Libro }) {
  const [k, setK] = useState(0);
  const s = libro.sesiones[k];
  const html = useMemo(
    () => renderLibro(s.md + (s.miniPrompt ? `\n\n**⏱️ Explícalo en 1 minuto:** ${s.miniPrompt}` : '')),
    [s],
  );
  return (
    <Screen>
      <div className={styles.book}>
        <Button variant="ghost" href={`/tema/${libro.tema}`}>← Volver al tema</Button>
        <h1 className={styles.h1}>El tema completo</h1>
        <p className={styles.muted}>Es la referencia: aquí está todo el material, incluidos ejercicios y laboratorio. Para estudiar, usa las sesiones del tema.</p>
        <select className={styles.select} aria-label="Sesión" value={k} onChange={(e) => setK(Number(e.target.value))}>
          {libro.sesiones.map((x, i) => <option key={x.id} value={i}>{etiqueta(x.id)} · {x.titulo}</option>)}
        </select>
        <div className={styles.md} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </Screen>
  );
}

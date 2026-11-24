'use client';
import { useRef, useState } from 'react';
import { progressStore } from '@/lib/progressStore';
import { clasificar, temaDeNombre } from '@/utils/importExport';
import { Button } from '@/components/atoms/Button';
import styles from '../AccesoCuenta/Seccion.module.css';

/** Migración C4: se eligen los archivos de Equipo/export/ (estado y registros). Se unen con lo que ya hay, sin pisarlo. */
export function ImportarProgreso() {
  const input = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const importar = async (files: FileList | null) => {
    if (!files?.length) return;
    setMsg(''); setError('');
    let estados = 0, registros = 0, ignorados = 0;
    for (const f of Array.from(files)) {
      try {
        const a = clasificar(JSON.parse(await f.text()));
        if (!a) { ignorados++; continue; }
        if (a.tipo === 'estado') {
          const tema = temaDeNombre(f.name);
          if (!tema) { ignorados++; continue; } // el estado no trae su tema: debe llamarse como "1.1.json"
          progressStore.unir(tema, a.datos); estados++;
        } else if (a.tipo === 'registro') { progressStore.guardarRegistro(a.registro); registros++; }
        else {
          Object.entries(a.estados).forEach(([tema, e]) => progressStore.unir(tema, e));
          estados += Object.keys(a.estados).length;
          a.registros.forEach((r) => progressStore.guardarRegistro(r)); registros += a.registros.length;
        }
      } catch { ignorados++; }
    }
    if (estados + registros === 0) setError(`Ningún archivo era válido (${ignorados}).`);
    else setMsg(`Importado: ${estados} de progreso y ${registros} registros${ignorados ? `; ${ignorados} ignorados` : ''}.`);
  };

  return (
    <section className={styles.sec}>
      <h2>Importar progreso</h2>
      <p className={styles.muted}>Para traer lo que ya estudiaste en el artefacto: elige los archivos de la carpeta de exportación (<code>estado/1.1.json</code> y <code>registro/*.json</code>). Se unen con lo que ya tienes.</p>
      <input ref={input} hidden type="file" accept="application/json,.json" multiple onChange={(e) => { void importar(e.target.files); e.target.value = ''; }} />
      <Button variant="ghost" small onClick={() => input.current?.click()}>Elegir archivos…</Button>
      {msg && <p className={styles.ok}>{msg}</p>}
      {error && <p className={styles.err}>{error}</p>}
    </section>
  );
}

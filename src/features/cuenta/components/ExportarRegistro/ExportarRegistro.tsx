'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { progressStore } from '@/lib/progressStore';
import { isoDay } from '@/utils/dates';
import { paqueteDeExportacion } from '@/utils/importExport';
import styles from '../AccesoCuenta/Seccion.module.css';

/** Respaldo manual del registro C3 y el progreso: sirve aunque no haya cuenta en la nube. */
export function ExportarRegistro() {
  const [msg, setMsg] = useState('');

  const exportar = async () => {
    const estados = progressStore.getSnapshot();
    if (!estados) return;
    const registros = progressStore.temas().flatMap((t) => Object.values(progressStore.registros(t)));
    const intentos = progressStore.temas().flatMap((t) => progressStore.intentos(t));
    const paquete = paqueteDeExportacion(estados, registros, intentos);
    const file = new File([JSON.stringify(paquete, null, 2)], `aprender-registro-${isoDay()}.json`, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Registro de Aprender' }); setMsg('Compartido.'); return; } catch { /* cancelado: se baja como archivo */ }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
    setMsg(`Descargado: ${file.name}`);
  };

  return (
    <section className={styles.sec}>
      <h2>Exportar mi registro</h2>
      <p className={styles.muted}>Un archivo con tu progreso, el registro de cada sesión (C3) y el historial de cada respuesta. Se lo puedes pasar al asesor cada semana.</p>
      <Button variant="ghost" small onClick={() => void exportar()}>Exportar</Button>
      {msg && <p className={styles.ok}>{msg}</p>}
    </section>
  );
}

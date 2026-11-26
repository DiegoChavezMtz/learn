'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { progressStore } from '@/lib/progressStore';
import { isoDay } from '@/utils/dates';
import { paqueteDeExportacion } from '@/utils/importExport';
import { reinicioService } from '../../services/reinicio.service';
import styles from '../AccesoCuenta/Seccion.module.css';

type Paso = 'inicio' | 'respaldado' | 'hecho';

/**
 * Reinicio seguro (D40): primero se descarga el respaldo completo de todos los datos; solo después, con confirmación,
 * se borra el tema en la nube y en este dispositivo. Si la nube falla, no se toca nada local.
 */
export function ReiniciarTema({ tema }: { tema: string }) {
  const [paso, setPaso] = useState<Paso>('inicio');
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const descargarRespaldo = () => {
    const estados = progressStore.getSnapshot() ?? {};
    const temas = progressStore.temas();
    const registros = temas.flatMap((t) => Object.values(progressStore.registros(t)));
    const intentos = temas.flatMap((t) => progressStore.intentos(t));
    const paquete = paqueteDeExportacion(estados, registros, intentos);
    const file = new File([JSON.stringify(paquete, null, 2)], `aprender-respaldo-antes-del-reinicio-${tema}-${isoDay()}.json`, { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
    setPaso('respaldado');
    setMsg(`Descargado: ${file.name}. Confirma el reinicio solo cuando lo tengas guardado.`);
  };

  const reiniciar = async () => {
    setOcupado(true); setMsg('');
    try {
      await reinicioService.borrarTemaEnNube(tema);
      progressStore.borrarTema(tema);
      setPaso('hecho');
      setMsg(`Tema ${tema} reiniciado a cero, en este dispositivo y en tu cuenta.`);
    } catch {
      setMsg('No se pudo borrar en tu cuenta. Tu progreso sigue igual; intenta de nuevo con buena conexión.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section className={styles.sec}>
      <h2>Reiniciar el tema {tema}</h2>
      {paso === 'inicio' && (
        <>
          <p className={styles.muted}>
            Borra tu avance de este tema (sesiones, repasos, registro e historial), en este dispositivo y en tu cuenta.
            Antes se descarga el respaldo completo de todos tus datos.
          </p>
          <Button variant="ghost" small onClick={descargarRespaldo}>1. Descargar respaldo</Button>
        </>
      )}
      {paso === 'respaldado' && (
        <>
          <p className={styles.muted}>Guarda el archivo en un lugar seguro. Después, confirma el reinicio.</p>
          <Button small disabled={ocupado} onClick={() => void reiniciar()}>{ocupado ? 'Reiniciando…' : '2. Ya guardé el respaldo: reiniciar'}</Button>
          <Button variant="ghost" small onClick={descargarRespaldo}>Descargar respaldo otra vez</Button>
        </>
      )}
      {paso === 'hecho' && <p className={styles.ok}>{msg}</p>}
      {paso !== 'hecho' && msg && <p className={paso === 'respaldado' ? styles.ok : styles.err}>{msg}</p>}
    </section>
  );
}

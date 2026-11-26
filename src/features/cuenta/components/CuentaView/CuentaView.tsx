'use client';
import { Button } from '@/components/atoms/Button';
import { Flame } from '@/components/atoms/Flame';
import { Ring } from '@/components/atoms/Ring';
import { Screen } from '@/components/atoms/Screen';
import { WeekStrip } from '@/components/molecules/WeekStrip';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { nivel } from '@/utils/xp';
import { AccesoCuenta } from '../AccesoCuenta';
import { ExportarRegistro } from '../ExportarRegistro';
import { ImportarProgreso } from '../ImportarProgreso';
import { ReiniciarTema } from '../ReiniciarTema';
import styles from './CuentaView.module.css';

export function CuentaView() {
  const { listo, dias, racha, hoy, xpHoy, xpTotal, meta } = useProgresoCurso();
  const nv = nivel(xpTotal);

  return (
    <Screen>
      <div className={styles.col}>
        <div className={styles.topNav}>
          <Button variant="ghost" href="/">← Volver al mapa</Button>
        </div>

        <div className={styles.header}>
          <h1 className={styles.h1}>Mi Perfil</h1>
          <p className={styles.sub}>Tu progreso diario, estadísticas de estudio y configuración de cuenta.</p>
        </div>

        {/* Sección de Gamificación: Nivel y Racha */}
        <section className={styles.gamificacion}>
          <div className={styles.nivelCard}>
            <div className={styles.nivelBadge}>
              <span className={styles.nivelNumero}>{nv.nivel}</span>
              <span className={styles.nivelEtq}>Nivel</span>
            </div>

            <div className={styles.nivelInfo}>
              <div className={styles.nivelTop}>
                <strong>Nivel {nv.nivel}</strong>
                <span className={styles.xpText}>{xpTotal} XP totales</span>
              </div>
              <div className={styles.barraTrack}>
                <div className={styles.barraFill} style={{ width: `${nv.pct}%` }} />
              </div>
              <span className={styles.faltanText}>{nv.faltan} XP para el nivel {nv.nivel + 1}</span>
            </div>
          </div>

          <div className={styles.rachaCard}>
            <div className={styles.rachaHeader}>
              <div className={styles.rachaBadge}>
                <Flame size={24} />
                <span className={styles.rachaNum}>{racha}</span>
              </div>
              <div className={styles.rachaTexto}>
                <strong>{racha === 1 ? '1 día de racha' : `${racha} días de racha`}</strong>
                <span>{racha > 0 ? '¡Mantén la constancia!' : 'Estudia hoy para encender tu racha'}</span>
              </div>
            </div>

            {/* Tira de la semana */}
            {listo && <WeekStrip dias={dias} hoy={hoy} />}
          </div>

          {/* Meta del día */}
          <div className={styles.metaCard}>
            <div className={styles.ringWrapper}>
              <Ring value={(xpHoy / meta) * 100}>
                <span className={styles.ringNum}>
                  {Math.min(xpHoy, meta)}
                  <small>/{meta}</small>
                </span>
              </Ring>
            </div>
            <div className={styles.metaTexto}>
              <strong>{xpHoy >= meta ? '¡Meta del día cumplida! 🎉' : 'Meta del día'}</strong>
              <p className={styles.metaP}>
                {xpHoy >= meta
                  ? 'Has alcanzado tu objetivo de hoy. Todo el estudio adicional sigue sumando XP.'
                  : `Te faltan ${meta - xpHoy} XP para tu meta diaria. Cada lección y repaso suma.`}
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Cuenta y Datos */}
        <div className={styles.cuentaSec}>
          <h2 className={styles.h2}>Configuración y sincronización</h2>
          <AccesoCuenta />
          <ImportarProgreso />
          <ExportarRegistro />
          <ReiniciarTema tema="1.1" />
        </div>
      </div>
    </Screen>
  );
}

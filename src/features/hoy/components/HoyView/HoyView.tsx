'use client';
import Link from 'next/link';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { Flame } from '@/components/atoms/Flame';
import { Ring } from '@/components/atoms/Ring';
import { Screen } from '@/components/atoms/Screen';
import { AccountLink } from '@/components/molecules/AccountLink';
import { SyncStatus } from '@/components/molecules/SyncStatus';
import { WeekStrip } from '@/components/molecules/WeekStrip';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { useOfflineWarm } from '@/hooks/useOfflineWarm';
import type { Curso } from '@/types/curso';
import { siguientePaso } from '@/utils/curso';
import { etiqueta } from '@/utils/lesson';
import { rutasOffline } from '@/utils/offline';
import { vencidos } from '@/utils/spacedRepetition';
import { nivel } from '@/utils/xp';
import styles from './HoyView.module.css';

/** "Hoy": una sola misión clara (repasos de todo el curso + la siguiente sesión), tu meta del día y los próximos pasos. */
export function HoyView({ curso }: { curso: Curso }) {
  const { listo, todos, dias, racha, hoy, xpHoy, xpTotal, meta } = useProgresoCurso();
  const paso = listo ? siguientePaso(curso, todos) : null;
  useOfflineWarm(rutasOffline(curso), []);

  if (!listo) {
    return (
      <Screen>
        <div className={styles.hoy}>
          <div className={styles.top}><span className={styles.brand}>Aprender</span></div>
          <p className={styles.muted}>Preparando tu misión…</p>
        </div>
      </Screen>
    );
  }

  const pendientes = Object.entries(todos).map(([tema, p]) => ({ tema, n: vencidos(p.repaso, hoy).length })).filter((x) => x.n > 0);
  const totalRep = pendientes.reduce((s, x) => s + x.n, 0);
  const temaRepaso = [...pendientes].sort((a, b) => b.n - a.n)[0]?.tema;
  const sesion = paso?.sesion;
  const minutos = Math.ceil(totalRep * 0.5) + (sesion?.minutos ?? 0);
  const vacio = totalRep === 0 && !paso;
  const nv = nivel(xpTotal);

  const hrefSesion = paso ? `/tema/${paso.tema.id}/sesion/${paso.sesion.id}` : '/curso';
  const hrefRepaso = temaRepaso ? `/tema/${temaRepaso}/repaso${paso && paso.tema.id === temaRepaso ? `?luego=${paso.sesion.id}` : ''}` : hrefSesion;
  // Los siguientes pasos de este tema: pocos, para que no abrume.
  const sesionesTema = paso?.tema.leccion?.sesiones ?? [];
  const proximos = sesionesTema.filter((s) => !todos[paso!.tema.id]?.sesiones[s.id]?.terminada).slice(0, 3);

  return (
    <Screen>
      <div className={styles.hoy}>
        <div className={styles.top}>
          <span className={styles.brand}>Aprender</span>
          <div className={styles.pills}>
            <span className={styles.pill} aria-label={`Nivel ${nv.nivel}`}>⚡ {nv.nivel}</span>
            <span className={styles.pill} aria-label="Racha"><Flame size={18} />{racha}</span>
            <AccountLink />
          </div>
        </div>

        <section className={styles.mision}>
          <span className={styles.etiqueta}>{vacio ? 'Todo al día' : totalRep > 0 ? 'Tu misión de hoy · repaso primero' : 'Tu misión de hoy'}</span>
          {vacio ? (
            <p className={styles.vacio}>Terminaste todo el contenido disponible. Cuando haya más aparece aquí; tus repasos volverán solos.</p>
          ) : (
            <>
              <h1 className={styles.titulo}>{totalRep > 0 && !sesion ? `${totalRep} ${totalRep === 1 ? 'repaso' : 'repasos'}` : sesion?.titulo}</h1>
              {paso && <p className={styles.tema}>Tema {paso.tema.id} · {paso.tema.titulo}</p>}
              <div className={styles.chips}>
                <span className={styles.chip}>⏱ {minutos} min</span>
                {totalRep > 0 && <span className={styles.chip}>🔁 {totalRep} {totalRep === 1 ? 'repaso' : 'repasos'}</span>}
                {sesion && <span className={styles.chip}>✨ nueva · {etiqueta(sesion.id)}</span>}
              </div>
              <div className={styles.cta}>
                <Button variant="light" href={totalRep > 0 ? hrefRepaso : hrefSesion}>{totalRep > 0 ? 'Empezar con el repaso' : 'Empezar'}</Button>
                {totalRep > 0 && paso && <Button variant="ghost" small href={`/tema/${temaRepaso}/repaso`}>Día difícil: solo repasar</Button>}
              </div>
            </>
          )}
        </section>

        <section className={styles.meta} aria-label="Meta diaria">
          <Ring value={(xpHoy / meta) * 100}><span className={styles.num}>{Math.min(xpHoy, meta)}<small>/{meta} XP</small></span></Ring>
          <div className={styles.txt}>
            <strong>{xpHoy >= meta ? '¡Meta cumplida! 🎉' : 'Meta del día'}</strong>
            <span className={`${styles.muted} ${styles.small}`}>{xpHoy >= meta ? 'Todo lo que sumes ya es de más.' : `Te faltan ${meta - xpHoy} XP: cada respuesta suma.`}</span>
            <span className={`${styles.muted} ${styles.small}`}>Nivel {nv.nivel} · {nv.faltan} XP para el {nv.nivel + 1}</span>
          </div>
        </section>

        <WeekStrip dias={dias} hoy={hoy} />

        {paso && proximos.length > 0 && (
          <section className={styles.camino}>
            <h2 className={styles.h2}>Tu camino</h2>
            {proximos.map((s, i) => (
              <Link key={s.id} href={`/tema/${paso.tema.id}/sesion/${s.id}`} className={clsx(styles.paso, i === 0 && styles.actual)}>
                <span className={styles.nodo}>{etiqueta(s.id)}</span>
                <span className={styles.tx}><strong>{s.titulo}</strong><span className={`${styles.muted} ${styles.small}`}>{s.paso} · {s.minutos} min</span></span>
              </Link>
            ))}
          </section>
        )}

        <SyncStatus />
      </div>
    </Screen>
  );
}

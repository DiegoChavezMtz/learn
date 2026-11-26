'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components/atoms/Screen';
import { useProgresoCurso } from '@/context/ProgresoContext';
import type { Curso, ModuloCurso, TemaCurso } from '@/types/curso';
import { debilesSinCatalogo } from '@/utils/repasar';
import { colorModulo } from '@/utils/curso';
import styles from './PracticaView.module.css';

export function PracticaView({ curso }: { curso: Curso }) {
  const { listo, todos } = useProgresoCurso();

  // Puntos débiles globales
  const nDebilesTotal = useMemo(() => {
    if (!listo) return 0;
    return Object.values(todos).reduce((s, p) => s + debilesSinCatalogo(p.repaso), 0);
  }, [listo, todos]);

  // Temas del curso que tienen lección desarrollada
  const temasPracticables = useMemo(() => {
    const lista: { tema: TemaCurso; modulo: ModuloCurso; tarjetasVistas: number; debiles: number }[] = [];

    curso.modulos.forEach((modulo) => {
      modulo.temas.forEach((tema) => {
        if (!tema.leccion) return;
        const p = todos[tema.id];
        const tarjetasVistas = p ? Object.keys(p.repaso).length : 0;
        const deb = p ? debilesSinCatalogo(p.repaso) : 0;

        lista.push({
          tema,
          modulo,
          tarjetasVistas,
          debiles: deb,
        });
      });
    });

    return lista;
  }, [curso.modulos, todos]);

  if (!listo) {
    return (
      <Screen>
        <div className={styles.col}>
          <h1 className={styles.h1}>Práctica Libre</h1>
          <p className={styles.muted}>Cargando catálogo de temas…</p>
        </div>
      </Screen>
    );
  }

  const primerTemaConDebiles = temasPracticables.find((item) => item.debiles > 0)?.tema.id;
  const primerTemaDisponible = temasPracticables[0]?.tema.id;

  return (
    <Screen>
      <div className={styles.col}>
        {/* Cabecera */}
        <div className={styles.header}>
          <span className={styles.kicker}>Entrenamiento voluntario</span>
          <h1 className={styles.h1}>Práctica Libre</h1>
          <p className={styles.sub}>
            Elige cualquier tema para ejercitar tarjetas y preguntas a tu propio ritmo. Esta práctica no altera tus fechas de repaso programadas.
          </p>
        </div>

        {/* Tarjeta de puntos débiles globales si existen */}
        {nDebilesTotal > 0 && (
          <div className={styles.cardDebiles}>
            <span className={styles.iconoDebiles}>🎯</span>
            <div className={styles.infoDebiles}>
              <h3>{nDebilesTotal} {nDebilesTotal === 1 ? 'punto débil detectado' : 'puntos débiles detectados'}</h3>
              <p>Preguntas en las que has tenido dificultad recientemente.</p>
              <div className={styles.btnRow}>
                <Button
                  small
                  href={`/tema/${primerTemaConDebiles ?? primerTemaDisponible}/repasar`}
                >
                  Practicar puntos débiles →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Catálogo de temas que se pueden practicar */}
        <section className={styles.sec}>
          <div className={styles.secHeader}>
            <h2 className={styles.h2}>Temas para practicar</h2>
            <p className={styles.muted}>
              Entrena tarjetas al azar de cualquier tema que esté listo en el curso.
            </p>
          </div>

          <div className={styles.temasLista}>
            {temasPracticables.length > 0 ? (
              temasPracticables.map(({ tema: t, modulo: m, tarjetasVistas, debiles }) => (
                <div key={t.id} className={styles.temaCard}>
                  <div className={styles.temaTop}>
                    <div className={styles.moduloKicker}>
                      <span
                        className={styles.dotModulo}
                        style={{ backgroundColor: colorModulo(m.n) }}
                      />
                      Módulo {m.n} · {m.titulo}
                    </div>
                    {debiles > 0 && (
                      <span className={styles.badgeDebil}>
                        🎯 {debiles} {debiles === 1 ? 'débil' : 'débiles'}
                      </span>
                    )}
                  </div>

                  <div className={styles.temaContenido}>
                    <div>
                      <span className={styles.temaId}>Tema {t.id}</span>
                      <h3 className={styles.temaTitulo}>{t.titulo}</h3>
                      {t.pregunta && <p className={styles.temaPregunta}>{t.pregunta}</p>}
                    </div>

                    <div className={styles.temaMetaRow}>
                      <span className={styles.metaInfo}>
                        {t.leccion?.sesiones.length ?? 0} sesiones · {tarjetasVistas > 0 ? `${tarjetasVistas} tarjetas vistas` : 'Listo para practicar'}
                      </span>

                      <div className={styles.accionesRow}>
                        <Button
                          href={`/tema/${t.id}/repasar`}
                          className={styles.btnPracticar}
                        >
                          Practicar tarjetas →
                        </Button>
                        <Link href={`/tema/${t.id}`} className={styles.linkTema}>
                          Ver tema
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.cardVacia}>
                <span className={styles.iconoVacio}>📚</span>
                <h3>Aún no hay temas con tarjetas disponibles</h3>
                <p>Avanza en el mapa para desbloquear tus primeros temas y preguntas de estudio.</p>
                <Button href="/" variant="light" small>
                  Ir al mapa del curso
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Screen>
  );
}

'use client';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import clsx from 'clsx';
import { Flame } from '@/components/atoms/Flame';
import { Screen } from '@/components/atoms/Screen';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { useOfflineWarm } from '@/hooks/useOfflineWarm';
import type { Curso, TemaCurso } from '@/types/curso';
import { colorModulo, moduloDeTema, repasosVencidos, siguientePaso } from '@/utils/curso';
import { rutasOffline } from '@/utils/offline';
import { nivel } from '@/utils/xp';
import { ModuloSelectorModal } from '../ModuloSelectorModal';
import { LeccionPopup, type PopupSeleccion } from '../LeccionPopup';
import {
  COLORES_TIPO_LECCION,
  calcularEstadoLeccion,
  colorDeTema,
  colorPorPaso,
  leccionesDeTema,
  type EstadoLeccion,
  type LeccionItem,
} from '../../utils/mapa';
import styles from './CursoView.module.css';

const SEP = 92;          // Separación vertical entre nodos
const BANNER_TEMA = 96;   // Espacio vertical para el encabezado de cada tema
const xPos = (i: number) => 50 + 26 * Math.sin(i * 1.15);

type ItemMapa =
  | { k: 'banner'; t: TemaCurso; indiceTema: number; y: number; bloqueado: boolean; nRepasos: number }
  | {
      k: 'repaso';
      t: TemaCurso;
      indiceTema: number;
      nRepasos: number;
      indiceNodo: number;
      x: number;
      y: number;
    }
  | {
      k: 'leccion';
      s: LeccionItem;
      t: TemaCurso;
      indiceTema: number;
      indiceLeccion: number;
      estado: EstadoLeccion;
      x: number;
      y: number;
    };

type NodoRuta = Extract<ItemMapa, { k: 'leccion' | 'repaso' }>;
type NodoLeccion = Extract<ItemMapa, { k: 'leccion' }>;
type NodoRepaso = Extract<ItemMapa, { k: 'repaso' }>;

export function CursoView({ curso }: { curso: Curso }) {
  const { todos, listo, xpTotal, racha, hoy } = useProgresoCurso();
  const [aviso, setAviso] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [popupSeleccion, setPopupSeleccion] = useState<PopupSeleccion | null>(null);
  const [moduloElegido, setModuloElegido] = useState<number | null>(null);
  const anclaRef = useRef<HTMLDivElement>(null);
  const primerRepasoRef = useRef<HTMLDivElement>(null);
  useOfflineWarm(rutasOffline(curso), []);

  const paso = listo ? siguientePaso(curso, todos) : null;
  const conContenido = curso.modulos.filter((m) => m.temas.some((t) => t.leccion));
  const nActual = paso ? moduloDeTema(paso.tema.id) : (conContenido[conContenido.length - 1]?.n ?? 1);

  // Módulo a mostrar: el seleccionado por el usuario o donde va
  const moduloSeleccionado = moduloElegido ?? nActual;

  const moduloActivo = useMemo(() => {
    return curso.modulos.find((m) => m.n === moduloSeleccionado) ?? curso.modulos[0];
  }, [curso.modulos, moduloSeleccionado]);

  const nv = nivel(xpTotal);

  // Repasos obligatorios pendientes en todo el curso
  const totalPendientes = useMemo(() => {
    if (!listo) return 0;
    return curso.modulos.flatMap((m) => m.temas).reduce((s, t) => s + repasosVencidos(t, todos[t.id]?.repaso ?? {}, hoy), 0);
  }, [listo, todos, hoy, curso.modulos]);

  // Construcción de los items del mapa para el módulo seleccionado
  const { items, nodosRuta, alto, indexAncla, nodoActual, nodoPrimerRepaso } = useMemo(() => {
    let y = 12;
    let j = 0;
    const lista: ItemMapa[] = [];
    const nodos: NodoRuta[] = [];
    let idxActual = -1;
    let idxUltimoHecho = -1;
    let nAct: NodoLeccion | null = null;
    let nPrimerRepaso: NodoRepaso | null = null;

    moduloActivo.temas.forEach((t, indiceTema) => {
      const lecciones = leccionesDeTema(t).map((s) => ({
        s,
        estado: calcularEstadoLeccion(s, t, moduloActivo, nActual, paso, todos[t.id]),
      }));
      const temaBloqueado = moduloActivo.n > nActual || !t.leccion;
      const nRepasos = listo ? repasosVencidos(t, todos[t.id]?.repaso ?? {}, hoy) : 0;

      lista.push({
        k: 'banner',
        t,
        indiceTema,
        y,
        bloqueado: temaBloqueado,
        nRepasos,
      });
      y += BANNER_TEMA;

      // Repaso obligatorio: solo existe mientras hay tarjetas vencidas, y va justo después de lo ya hecho,
      // donde toca en la ruta (no al principio del tema). Cuando ya no hay vencidas, desaparece.
      const mostrarRepaso = !!t.leccion && nRepasos > 0;
      const posRepaso = lecciones.reduce((acc, e, idx) => (e.estado === 'hecho' ? idx + 1 : acc), 0);
      const pintarRepaso = () => {
        const nodoRepaso: NodoRepaso = {
          k: 'repaso',
          t,
          indiceTema,
          nRepasos,
          indiceNodo: j,
          x: xPos(j),
          y: y + 36,
        };
        if (!nPrimerRepaso) nPrimerRepaso = nodoRepaso;
        lista.push(nodoRepaso);
        nodos.push(nodoRepaso);
        y += SEP;
        j++;
      };

      lecciones.forEach(({ s, estado }, idx) => {
        if (mostrarRepaso && idx === posRepaso) pintarRepaso();
        const nx = xPos(j);
        const ny = y + 36;
        const nodo: NodoLeccion = {
          k: 'leccion',
          s,
          t,
          indiceTema,
          indiceLeccion: j,
          estado,
          x: nx,
          y: ny,
        };

        if (estado === 'actual') {
          idxActual = j;
          nAct = nodo;
        }
        if (estado === 'hecho') idxUltimoHecho = j;

        lista.push(nodo);
        nodos.push(nodo);

        y += SEP;
        j++;
      });
      if (mostrarRepaso && posRepaso >= lecciones.length) pintarRepaso();
    });

    const altoTotal = y + 40;
    const ancla = idxActual >= 0 ? idxActual : idxUltimoHecho;

    return {
      items: lista,
      nodosRuta: nodos,
      alto: altoTotal,
      indexAncla: ancla,
      nodoActual: nAct as NodoLeccion | null,
      nodoPrimerRepaso: nPrimerRepaso as NodoRepaso | null,
    };
  }, [moduloActivo, nActual, paso, todos, listo, hoy]);

  // Curvas SVG conectando los nodos en el camino
  const tramos = useMemo(() => {
    const trazo = (a: NodoRuta, b: NodoRuta) => {
      const dy = (b.y - a.y) * 0.5;
      return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
    };

    return nodosRuta.slice(1).map((b, k) => {
      const a = nodosRuta[k];
      const aHecho = a.k === 'repaso' ? a.nRepasos === 0 : a.estado === 'hecho';
      const bHechoOActual = b.k === 'repaso' ? true : b.estado === 'hecho' || b.estado === 'actual';
      const hecho = aHecho && bHechoOActual;
      return { d: trazo(a, b), hecho };
    });
  }, [nodosRuta]);

  // Auto-scroll a la lección activa o repaso al abrir
  useEffect(() => {
    if (listo) {
      if (nodoPrimerRepaso && primerRepasoRef.current) {
        primerRepasoRef.current.scrollIntoView({ block: 'center' });
      } else {
        anclaRef.current?.scrollIntoView({ block: 'center' });
      }
    }
  }, [listo, moduloSeleccionado, nodoPrimerRepaso]);

  const dondeVoy = () => {
    if (anclaRef.current) {
      anclaRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (nodoActual && nodoActual.k === 'leccion') {
      const infoTipo = colorPorPaso(nodoActual.s.paso);
      setPopupSeleccion({
        tipo: 'leccion',
        s: nodoActual.s,
        t: nodoActual.t,
        estado: nodoActual.estado,
        color: {
          primario: infoTipo.color,
          fondo: infoTipo.fondo,
          borde: infoTipo.borde,
        },
        linkHref: !nodoActual.s.placeholder
          ? `/tema/${nodoActual.t.id}/sesion/${nodoActual.s.id}`
          : `/tema/${nodoActual.t.id}`,
        enProgreso: !!todos[nodoActual.t.id]?.sesiones[nodoActual.s.id],
      });
    }
  };

  const irAlPrimerRepaso = () => {
    if (primerRepasoRef.current) {
      primerRepasoRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    if (nodoPrimerRepaso) {
      const infoRepaso = COLORES_TIPO_LECCION.Repaso;
      setPopupSeleccion({
        tipo: 'repaso',
        t: nodoPrimerRepaso.t,
        nRepasos: nodoPrimerRepaso.nRepasos,
        color: {
          primario: infoRepaso.color,
          fondo: infoRepaso.fondo,
          borde: infoRepaso.borde,
        },
        linkHref: `/tema/${nodoPrimerRepaso.t.id}/repaso`,
      });
    }
  };

  const avisar = (msg: string) => {
    setAviso(msg);
    setTimeout(() => setAviso(''), 2500);
  };

  return (
    <Screen>
      <div className={styles.col}>
        {/* Barra superior de métricas */}
        <div className={styles.top}>
          <div className={styles.pills}>
            <span className={styles.pill} aria-label={`Nivel ${nv.nivel}`}>⚡ {nv.nivel}</span>
            <span className={styles.pill} aria-label="Racha"><Flame size={18} />{racha}</span>
            {totalPendientes > 0 && (
              <button
                type="button"
                className={styles.pillRepaso}
                onClick={irAlPrimerRepaso}
                aria-label={`${totalPendientes} repasos obligatorios pendientes`}
              >
                🔁 {totalPendientes} {totalPendientes === 1 ? 'repaso' : 'repasos'}
              </button>
            )}
          </div>
          <div className={styles.acciones}>
            <button type="button" className={styles.loc} onClick={dondeVoy}>
              📍 Dónde voy
            </button>
          </div>
        </div>

        {/* Cuadro selector del módulo activo */}
        <button
          type="button"
          className={styles.selectorModulo}
          style={{ '--mc': colorModulo(moduloActivo.n) } as CSSProperties}
          onClick={() => setModalAbierto(true)}
          aria-haspopup="dialog"
          aria-expanded={modalAbierto}
        >
          <div className={styles.moduloInfo}>
            <span className={styles.moduloKicker}>
              Módulo {moduloActivo.n} · Cambiar módulo ▾
            </span>
            <h1 className={styles.moduloTitulo}>{moduloActivo.titulo}</h1>
          </div>
          <span className={styles.moduloBadge}>{moduloActivo.n}</span>
        </button>

        {/* Leyenda visual de tipos de lección */}
        <div className={styles.leyenda} aria-label="Tipos de lección">
          <span className={styles.leyendaItem}>
            <i className={styles.leyendaDot} style={{ background: COLORES_TIPO_LECCION.Orientar.color }} />
            Exploración
          </span>
          <span className={styles.leyendaItem}>
            <i className={styles.leyendaDot} style={{ background: COLORES_TIPO_LECCION.Exponer.color }} />
            Contenido
          </span>
          <span className={styles.leyendaItem}>
            <i className={styles.leyendaDot} style={{ background: COLORES_TIPO_LECCION.Practicar.color }} />
            Práctica
          </span>
          <span className={styles.leyendaItem}>
            <i className={styles.leyendaDot} style={{ background: COLORES_TIPO_LECCION.Explicar.color }} />
            Explicar
          </span>
          <span className={styles.leyendaItem}>
            <i className={styles.leyendaDot} style={{ background: COLORES_TIPO_LECCION.Consolidar.color }} />
            Consolidar
          </span>
          <span className={styles.leyendaItem}>
            <i className={styles.leyendaDot} style={{ background: COLORES_TIPO_LECCION.Repaso.color }} />
            Repaso
          </span>
        </div>

        {/* Mapa con lecciones y temas */}
        <div className={styles.mapa} style={{ height: alto }}>
          <svg viewBox={`0 0 100 ${alto}`} preserveAspectRatio="none" aria-hidden="true">
            {tramos.filter((t) => !t.hecho).map((t, i) => (
              <path
                key={`p${i}`}
                d={t.d}
                fill="none"
                stroke="var(--line)"
                strokeWidth="5"
                strokeDasharray="2 10"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {tramos.filter((t) => t.hecho).map((t, i) => (
              <path
                key={`h${i}`}
                d={t.d}
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {items.map((it) => {
            if (it.k === 'banner') {
              const { t, indiceTema, y, bloqueado, nRepasos } = it;
              const colorTema = colorDeTema(indiceTema);

              return (
                <button
                  type="button"
                  key={`b-${t.id}`}
                  className={clsx(styles.temaBanner, bloqueado && styles.temaBloqueado)}
                  style={{
                    top: y,
                    '--tc': colorTema.primario,
                  } as CSSProperties}
                  onClick={() =>
                    setPopupSeleccion({
                      tipo: 'tema',
                      t,
                      bloqueado,
                      nRepasos,
                      color: colorTema,
                      linkHref: nRepasos > 0 ? `/tema/${t.id}/repaso` : `/tema/${t.id}`,
                    })
                  }
                  aria-label={`Tema ${t.id}: ${t.titulo}`}
                >
                  <div>
                    <span className={styles.k}>Tema {t.id}</span>
                    <h3>{t.titulo}</h3>
                  </div>
                  <span className={styles.ver}>
                    {nRepasos > 0 ? (
                      <span className={styles.tagRepasoBanner}>🔁 {nRepasos} pendientes</span>
                    ) : bloqueado ? (
                      '🔒 Bloqueado'
                    ) : (
                      `${t.leccion?.sesiones.length ?? 0} lecciones`
                    )}
                  </span>
                </button>
              );
            }

            if (it.k === 'repaso') {
              const { t, nRepasos, indiceNodo, x, y } = it;
              const infoRepaso = COLORES_TIPO_LECCION.Repaso;
              const pos = {
                left: `${x}%`,
                top: y,
                '--tc': infoRepaso.color,
              } as CSSProperties;
              const tienePendientes = nRepasos > 0;
              const cls = clsx(
                styles.nodo,
                tienePendientes ? styles.repasoNodo : styles.repasoAlDia,
                x >= 50 && styles.izq
              );

              const esPrimerRepaso = nodoPrimerRepaso?.t.id === t.id;

              return (
                <div key={`rep-${t.id}-${indiceNodo}`}>
                  {esPrimerRepaso && (
                    <div
                      ref={primerRepasoRef}
                      style={{ position: 'absolute', top: y, left: 0, width: 1, height: 1 }}
                    />
                  )}

                  <button
                    type="button"
                    className={cls}
                    style={pos}
                    onClick={() =>
                      setPopupSeleccion({
                        tipo: 'repaso',
                        t,
                        nRepasos,
                        color: {
                          primario: infoRepaso.color,
                          fondo: infoRepaso.fondo,
                          borde: infoRepaso.borde,
                        },
                        linkHref: `/tema/${t.id}/repaso`,
                      })
                    }
                    aria-label={`Repaso de Tema ${t.id}, ${tienePendientes ? `${nRepasos} pendientes` : 'al día'}`}
                  >
                    <span className={styles.circ}>
                      {tienePendientes ? '🔁' : '✓'}
                      {tienePendientes && <span className={styles.badgeContador}>{nRepasos}</span>}
                    </span>
                    <span className={styles.cap}>
                      <b>Repaso obligatorio</b>
                      <span style={{ color: infoRepaso.color }}>
                        {tienePendientes ? `🔁 ${nRepasos} tarjetas para hoy` : '✓ Tarjetas al día'}
                      </span>
                    </span>
                  </button>
                </div>
              );
            }

            const { s, t, indiceLeccion, estado, x, y } = it;
            const infoTipo = colorPorPaso(s.paso);
            const actual = estado === 'actual';
            const hecho = estado === 'hecho';
            const bloqueado = estado === 'bloqueado';
            const pos = {
              left: `${x}%`,
              top: y,
              '--tc': infoTipo.color,
            } as CSSProperties;
            const cls = clsx(
              styles.nodo,
              actual && styles.actual,
              hecho && styles.hecho,
              bloqueado && styles.bloqueado,
              x >= 50 && styles.izq
            );

            const contenidoNodo = (
              <>
                <span className={styles.circ}>
                  {actual ? '▶' : hecho ? '✓' : infoTipo.icono}
                </span>
                <span className={styles.cap}>
                  <b>{s.titulo}</b>
                  <span style={{ color: infoTipo.color }}>
                    {infoTipo.icono} {infoTipo.nombre} · {s.minutos} min
                  </span>
                </span>
              </>
            );

            const esAncla = indiceLeccion === indexAncla;
            const linkHref = !s.placeholder ? `/tema/${t.id}/sesion/${s.id}` : `/tema/${t.id}`;

            return (
              <div key={`lec-${t.id}-${s.id}-${indiceLeccion}`}>
                {esAncla && (
                  <div
                    ref={anclaRef}
                    style={{ position: 'absolute', top: y, left: 0, width: 1, height: 1 }}
                  />
                )}

                <button
                  type="button"
                  className={cls}
                  style={pos}
                  onClick={() =>
                    setPopupSeleccion({
                      tipo: 'leccion',
                      s,
                      t,
                      estado,
                      color: {
                        primario: infoTipo.color,
                        fondo: infoTipo.fondo,
                        borde: infoTipo.borde,
                      },
                      linkHref,
                      enProgreso: !!todos[t.id]?.sesiones[s.id],
                    })
                  }
                  aria-label={`${infoTipo.nombre}: ${s.titulo}, ${estado === 'hecho' ? 'completada' : estado === 'actual' ? 'en curso' : 'bloqueada'}`}
                >
                  {contenidoNodo}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal selector de los 12 módulos */}
      <ModuloSelectorModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        modulos={curso.modulos}
        moduloSeleccionado={moduloActivo.n}
        moduloActual={nActual}
        onSeleccionarModulo={(n) => setModuloElegido(n)}
        onModuloBloqueado={avisar}
        todos={todos}
      />

      {/* Popup de información de la lección / tema / repaso seleccionado */}
      <LeccionPopup
        seleccion={popupSeleccion}
        onCerrar={() => setPopupSeleccion(null)}
      />

      {/* Toast de aviso */}
      {aviso && (
        <div className={styles.aviso} role="status">
          {aviso}
        </div>
      )}
    </Screen>
  );
}

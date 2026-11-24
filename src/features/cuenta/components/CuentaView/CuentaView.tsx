import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components/atoms/Screen';
import { AccesoCuenta } from '../AccesoCuenta';
import { ExportarRegistro } from '../ExportarRegistro';
import { ImportarProgreso } from '../ImportarProgreso';
import styles from './CuentaView.module.css';

export function CuentaView() {
  return (
    <Screen>
      <div className={styles.col}>
        <Button variant="ghost" href="/">← Volver al mapa</Button>
        <h1 className={styles.h1}>Cuenta y datos</h1>
        <AccesoCuenta />
        <ImportarProgreso />
        <ExportarRegistro />
      </div>
    </Screen>
  );
}

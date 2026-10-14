import { useEffect, useState } from 'react';
import { listDrivers } from '../services/driverService';
import type { DriverEditState } from '../types/driver';

export function useDriverForEdit(driverId: string | undefined) {
  const [result, setResult] = useState<{ id: string | undefined; state: DriverEditState }>({
    id: driverId, state: { phase: 'loading' },
  });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    if (!driverId) return;

    // Reusa o contrato GET já disponível; a consulta individual ainda está pendente.
    listDrivers()
      .then(drivers => {
        if (!active) return;
        const driver = drivers.find(item => item.id === driverId);
        setResult({ id: driverId, state: driver ? { phase: 'ready', driver } : { phase: 'not-found' } });
      })
      .catch(() => {
        if (active) setResult({ id: driverId, state: { phase: 'error' } });
      });

    return () => { active = false; };
  }, [driverId, reload]);

  function retry() {
    setResult({ id: driverId, state: { phase: 'loading' } });
    setReload(value => value + 1);
  }

  // Evita mostrar dados do registro anterior ao navegar entre IDs.
  const state: DriverEditState = result.id === driverId ? result.state : { phase: 'loading' };
  return { state, retry };
}

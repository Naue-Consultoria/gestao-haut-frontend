import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { profilesService } from '../services/profiles.service';
import { parceriasService } from '../services/parcerias.service';
import { User, Parceria } from '../types';

export function useBrokerParceriaSelector() {
  const { user } = useAuth();
  const [brokers, setBrokers] = useState<User[]>([]);
  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [selectedId, setSelectedId] = useState('');

  const isGestor = user?.role === 'gestor';

  useEffect(() => {
    if (!isGestor) {
      if (user) setSelectedId(user.id);
      return;
    }
    Promise.all([
      profilesService.getBrokers(),
      parceriasService.getActive(),
    ]).then(([brokersData, parceriasData]) => {
      setBrokers(brokersData);
      setParcerias(parceriasData);
      if (parceriasData.length > 0) {
        setSelectedId(parceriasData[0].id);
      } else if (brokersData.length > 0) {
        setSelectedId(brokersData[0].id);
      }
    }).catch(console.error);
  }, [user, isGestor]);

  const brokersInParcerias = new Set(
    parcerias.flatMap(p => (p.parceria_membros || []).map(m => m.broker_id))
  );
  const soloBrokers = brokers.filter(b => !brokersInParcerias.has(b.id));

  const isParceriaSelected = parcerias.some(p => p.id === selectedId);

  const getEffectiveBrokerId = (): string => {
    if (!isGestor) return user?.id || '';
    if (isParceriaSelected) {
      const parceria = parcerias.find(p => p.id === selectedId);
      const membros = parceria?.parceria_membros || [];
      return membros.length > 0 ? membros[0].broker_id : '';
    }
    return selectedId;
  };

  const getListBrokerId = (): string => {
    if (!isGestor) return user?.id || '';
    if (isParceriaSelected) {
      const parceria = parcerias.find(p => p.id === selectedId);
      const membros = parceria?.parceria_membros || [];
      return membros.length > 0 ? membros[0].broker_id : '';
    }
    return selectedId;
  };

  return {
    isGestor,
    parcerias,
    soloBrokers,
    selectedId,
    setSelectedId,
    isParceriaSelected,
    getEffectiveBrokerId,
    getListBrokerId,
  };
}

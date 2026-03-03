import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { profilesService } from '../services/profiles.service';
import { User } from '../types';

export function useBrokerSelector() {
  const { user } = useAuth();
  const [brokers, setBrokers] = useState<User[]>([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('');

  useEffect(() => {
    profilesService.getBrokers().then(data => {
      setBrokers(data);
      if (user?.role === 'corretor') {
        setSelectedBrokerId(user.id);
      } else if (data.length > 0 && !selectedBrokerId) {
        setSelectedBrokerId(data[0].id);
      }
    });
  }, [user]);

  return { brokers, selectedBrokerId, setSelectedBrokerId };
}

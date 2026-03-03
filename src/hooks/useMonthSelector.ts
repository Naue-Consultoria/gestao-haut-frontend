import { useState } from 'react';

export function useMonthSelector(initial = 0) {
  const [month, setMonth] = useState(initial);
  return { month, setMonth };
}

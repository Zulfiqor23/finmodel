'use client';

import { useMemo } from 'react';
import { calculateAll } from '@/lib/engine';
import type { FactoryInputs, FactoryOutputs } from '@/lib/types';

/**
 * Memoized hook that runs the full engine calculation.
 * Re-computes only when any input changes.
 */
export function useFactoryCalculations(inputs: FactoryInputs): FactoryOutputs {
  return useMemo(() => calculateAll(inputs), [inputs]);
}

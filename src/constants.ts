export interface Neuron {
  id: string;
  layer: number;
  index: number;
  activation: number;
  error: number;
  prediction?: number;
}

export interface Link {
  source: string;
  target: string;
  weight: number;
}

export const NETWORK_LAYERS = [3, 4, 4, 2];

export const COLORS = {
  activation: '#059669', // Emerald 600 (slightly darker)
  error: '#dc2626',      // Red 600
  prediction: '#2563eb', // Blue 600
  neutral: '#64748b',    // Slate 500
  bg: '#0f172a',         // Slate 900
};

export const IMAGES = {
  ECG: {
    DEFAULT: '/placeholder-ecg.png',
    FALLBACK: '/placeholder-ecg.png'
  },
  SIGNATURE: {
    FALLBACK: '/placeholder-signature.png'
  }
} as const;

export const IMAGE_CONFIG = {
  LOAD_TIMEOUT: 5000, // 5 seconds
  RETRY_ATTEMPTS: 2,
  QUALITY: {
    DEFAULT: 80,
    HIGH: 90,
    LOW: 60
  },
  MAX_SIZE: {
    WIDTH: 1200,
    HEIGHT: 800
  }
} as const;
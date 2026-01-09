
/**
 * Triggers a short vibration for haptic feedback.
 * @param duration Duration in milliseconds or a vibration pattern.
 */
export const triggerHaptic = (duration: number | number[] = 10) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // Vibration might be blocked by browser settings or not supported
      console.debug('Haptics not supported or blocked', e);
    }
  }
};

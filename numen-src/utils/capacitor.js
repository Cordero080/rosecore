/**
 * NUMENEON Capacitor Utilities
 * Native device capabilities for camera, storage, and haptics
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

/**
 * Check if running on native platform (iOS/Android)
 */
export const isNative = () => Capacitor.isNativePlatform();

/**
 * Get current platform: 'ios', 'android', or 'web'
 */
export const getPlatform = () => Capacitor.getPlatform();

// ============================================
// CAMERA UTILITIES
// ============================================

/**
 * Take a photo using the device camera
 * Falls back to file input on web
 */
export const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      width: 1080,
      height: 1080,
    });
    
    return {
      success: true,
      webPath: image.webPath,
      format: image.format,
    };
  } catch (error) {
    console.error('Camera error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Pick photo from device gallery
 */
export const pickPhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    
    return {
      success: true,
      webPath: image.webPath,
      format: image.format,
    };
  } catch (error) {
    console.error('Photo picker error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Show camera options (camera or gallery)
 */
export const pickOrTakePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      promptLabelHeader: 'Add Photo',
      promptLabelPhoto: 'From Gallery',
      promptLabelPicture: 'Take Photo',
    });
    
    return {
      success: true,
      webPath: image.webPath,
      format: image.format,
    };
  } catch (error) {
    // User cancelled - not an error
    if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
      return { success: false, cancelled: true };
    }
    console.error('Photo error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// HAPTIC FEEDBACK
// ============================================

/**
 * Trigger light haptic feedback (for button taps)
 */
export const hapticLight = async () => {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    // Silently fail - haptics not critical
  }
};

/**
 * Trigger medium haptic feedback (for actions)
 */
export const hapticMedium = async () => {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    // Silently fail
  }
};

/**
 * Trigger heavy haptic feedback (for confirmations)
 */
export const hapticHeavy = async () => {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    // Silently fail
  }
};

/**
 * Trigger success haptic pattern
 */
export const hapticSuccess = async () => {
  if (!isNative()) return;
  try {
    await Haptics.notification({ type: 'success' });
  } catch (error) {
    // Silently fail
  }
};

/**
 * Trigger error haptic pattern
 */
export const hapticError = async () => {
  if (!isNative()) return;
  try {
    await Haptics.notification({ type: 'error' });
  } catch (error) {
    // Silently fail
  }
};

// ============================================
// LOCAL STORAGE (PERSISTENT)
// ============================================

/**
 * Store a value persistently (survives app restarts)
 */
export const storeValue = async (key, value) => {
  try {
    await Preferences.set({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    });
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

/**
 * Retrieve a stored value
 */
export const getValue = async (key, parseJson = true) => {
  try {
    const { value } = await Preferences.get({ key });
    if (value === null) return null;
    return parseJson ? JSON.parse(value) : value;
  } catch (error) {
    console.error('Storage retrieval error:', error);
    return null;
  }
};

/**
 * Remove a stored value
 */
export const removeValue = async (key) => {
  try {
    await Preferences.remove({ key });
    return true;
  } catch (error) {
    console.error('Storage removal error:', error);
    return false;
  }
};

/**
 * Clear all stored values
 */
export const clearStorage = async () => {
  try {
    await Preferences.clear();
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
};

export default {
  isNative,
  getPlatform,
  takePhoto,
  pickPhoto,
  pickOrTakePhoto,
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticError,
  storeValue,
  getValue,
  removeValue,
  clearStorage,
};

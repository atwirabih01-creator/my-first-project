// Page photos picked by a grown-up (homework photos AND add-lesson): every photo is resized to
// at most 1600px on the long side and saved as a JPEG at quality 0.7 (expo-image-manipulator),
// so it always fits the server's size limit. Homework photos: kept ON THIS
// DEVICE only until the child finishes the homework (or 30 days pass).
// The pictures are NOT kept inside the main saved state (it is saved after every change):
// - phone: one .jpg file per photo in the app's own private folder;
// - web: one storage entry per photo.
// A task only holds short "refs" to them (see HomeworkTask in types.ts).
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { loadJSON, removeKey, saveJSON } from './storage';

export type Photo = { uri: string; base64: string };

/** The server accepts photos up to ~2,000,000 base64 letters; stay a little below that. */
const MAX_B64 = 1_900_000;
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.7;
const KV = 'kv:';
const FILE = 'file:';

const stripPrefix = (b64: string) => b64.replace(/^data:image\/\w+;base64,/, '').replace(/\s+/g, '');
const isJpeg = (b64: string) => b64.startsWith('/9j/');

/** Resize to max 1600px on the long side + JPEG at quality 0.7. Null if it could not be done. */
async function toSmallJpeg(a: ImagePicker.ImagePickerAsset): Promise<string | null> {
  try {
    const ctx = ImageManipulator.manipulate(a.uri);
    const w = a.width || 0;
    const h = a.height || 0;
    if (Math.max(w, h) > MAX_SIDE) ctx.resize(w >= h ? { width: MAX_SIDE, height: null } : { width: null, height: MAX_SIDE });
    const ref = await ctx.renderAsync();
    const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY, base64: true });
    return out.base64 ? stripPrefix(out.base64) : null;
  } catch {
    return null;
  }
}

/** Web fallback: redraw the picture as a JPEG (any format in, max 1600px on the long side). */
async function webToJpeg(uri: string): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image'));
      el.src = uri;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#FFFFFF'; // transparent PNG areas become white, not black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return stripPrefix(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
  } catch {
    return null;
  }
}

export type PickResult = { photos: Photo[]; denied?: boolean; skipped?: number };

/**
 * Take a photo with the camera or choose up to `remaining` from the gallery.
 * Every photo comes back as a small JPEG (base64). Photos that are too big or not usable are
 * skipped (counted in `skipped`). `denied`: the grown-up did not allow the camera.
 */
export async function pickHomeworkPhotos(source: 'camera' | 'library', remaining: number): Promise<PickResult> {
  if (remaining <= 0) return { photos: [] };
  let res: ImagePicker.ImagePickerResult;
  try {
    if (source === 'camera') {
      if (Platform.OS !== 'web') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return { photos: [], denied: true };
      }
      res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
    } else {
      res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: remaining > 1,
        selectionLimit: remaining,
        quality: 1,
      });
    }
  } catch {
    return { photos: [] }; // picker unavailable
  }
  if (res.canceled) return { photos: [] };
  const photos: Photo[] = [];
  let skipped = 0;
  for (const a of res.assets.slice(0, remaining)) {
    let b64 = await toSmallJpeg(a);
    if (!b64 && Platform.OS === 'web') b64 = await webToJpeg(a.uri);
    if (!b64 || !isJpeg(b64) || b64.length > MAX_B64) {
      skipped++;
      continue;
    }
    photos.push({ uri: `data:image/jpeg;base64,${b64}`, base64: b64 });
  }
  return { photos, skipped };
}

// ---------- keeping the photos on the device ----------

function photoDir() {
  const dir = new Directory(Paths.document, 'homework-photos');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** Saves the photos of one task; returns their refs (in the same order). Throws if saving fails. */
export async function savePhotos(taskId: string, photos: Photo[]): Promise<string[]> {
  const refs: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    if (Platform.OS === 'web') {
      const key = `hwphoto:${taskId}:${i}`;
      if (!(await saveJSON(key, photos[i].base64))) {
        await deletePhotos(refs);
        throw new Error('storage full');
      }
      refs.push(KV + key);
    } else {
      const file = new File(photoDir(), `${taskId}-${i}.jpg`);
      if (file.exists) file.delete();
      file.create();
      await file.write(photos[i].base64, { encoding: 'base64' });
      refs.push(FILE + file.uri);
    }
  }
  return refs;
}

/** Loads one saved photo (JPEG base64 + something an <Image> can show), or null if it is gone. */
export async function loadPhoto(ref: string): Promise<Photo | null> {
  try {
    if (ref.startsWith(KV)) {
      const b64 = await loadJSON<string | null>(ref.slice(KV.length), null);
      return b64 ? { base64: b64, uri: `data:image/jpeg;base64,${b64}` } : null;
    }
    if (ref.startsWith(FILE)) {
      const file = new File(ref.slice(FILE.length));
      if (!file.exists) return null;
      return { base64: await file.base64(), uri: file.uri };
    }
  } catch {
    // missing or unreadable: treated as gone
  }
  return null;
}

/** Deletes saved photos for good (never throws). */
export async function deletePhotos(refs: string[]): Promise<void> {
  for (const ref of refs) {
    try {
      if (ref.startsWith(KV)) await removeKey(ref.slice(KV.length));
      else if (ref.startsWith(FILE)) {
          const file = new File(ref.slice(FILE.length));
        if (file.exists) file.delete();
      }
    } catch {
      // already gone
    }
  }
}

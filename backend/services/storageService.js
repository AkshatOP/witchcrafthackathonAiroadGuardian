import { supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload image buffer to Supabase Storage.
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<string>} Public URL
 */
export async function uploadImage(buffer, mimeType = 'image/jpeg') {
  const ext = mimeType.split('/')[1] || 'jpg';
  const filename = `${uuidv4()}.${ext}`;
  const path = `reports/${filename}`;

  const { error } = await supabaseAdmin.storage
    .from(env.supabase.storageBucket)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) throw Object.assign(new Error(error.message), { code: 'STORAGE_UPLOAD_ERROR' });

  const { data: urlData } = supabaseAdmin.storage
    .from(env.supabase.storageBucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

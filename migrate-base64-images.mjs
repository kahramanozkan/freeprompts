import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function decodeBase64ToBuffer(base64String) {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return { buffer: Buffer.from(u8arr), mime };
}

async function uploadImage(buffer, mime, fileName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = mime.split('/')[1] || 'jpg';
  const storagePath = `${timestamp}-${random}-${fileName}.${extension}`;

  const { data, error } = await supabase.storage
    .from('prompt-images')
    .upload(storagePath, buffer, {
      contentType: mime,
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('prompt-images')
    .getPublicUrl(storagePath);

  return publicUrl;
}

async function migrate() {
  console.log("Starting Base64 to Storage migration...\n");

  try {
    // 1. Migrate Prompts
    console.log("Fetching prompts with Base64 images...");
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, title, image')
      .like('image', 'data:image/%');

    if (promptsError) throw promptsError;

    console.log(`Found ${prompts?.length || 0} prompts to migrate.`);

    for (const prompt of prompts || []) {
      try {
        console.log(`Processing prompt: ${prompt.title} (ID: ${prompt.id})`);
        const { buffer, mime } = decodeBase64ToBuffer(prompt.image);
        
        console.log(`  Uploading to prompt-images bucket...`);
        const publicUrl = await uploadImage(buffer, mime, `prompt-${prompt.id}`);
        
        console.log(`  Updating database with new URL...`);
        await supabase
          .from('prompts')
          .update({ image: publicUrl })
          .eq('id', prompt.id);
          
        console.log(`  Successfully migrated prompt ${prompt.id}\n`);
      } catch (e) {
        console.error(`  ERROR migrating prompt ${prompt.id}:`, e.message, '\n');
      }
    }

    // 2. Migrate Lists
    console.log("Fetching lists with Base64 images...");
    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('id, name, image')
      .like('image', 'data:image/%');

    if (listsError) throw listsError;

    console.log(`Found ${lists?.length || 0} lists to migrate.`);

    for (const list of lists || []) {
      try {
        console.log(`Processing list: ${list.name} (ID: ${list.id})`);
        const { buffer, mime } = decodeBase64ToBuffer(list.image);
        
        console.log(`  Uploading to prompt-images bucket...`);
        const publicUrl = await uploadImage(buffer, mime, `list-${list.id}`);
        
        console.log(`  Updating database with new URL...`);
        await supabase
          .from('lists')
          .update({ image: publicUrl })
          .eq('id', list.id);
          
        console.log(`  Successfully migrated list ${list.id}\n`);
      } catch (e) {
        console.error(`  ERROR migrating list ${list.id}:`, e.message, '\n');
      }
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("FATAL ERROR during migration:", error);
  }
}

migrate();

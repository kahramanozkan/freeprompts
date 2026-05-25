import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// We must explicitly configure this API route to handle larger payloads if needed, 
// but by default Next.js route handlers handle typical json up to a few MBs fine.

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const authHeader = request.headers.get('x-api-key') || request.headers.get('authorization');
    const expectedKey = process.env.N8N_API_KEY;
    
    if (!expectedKey) {
      console.error('N8N_API_KEY is not defined in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check if the provided key matches (allow "Bearer <key>" or just "<key>")
    const providedKey = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload
    const body = await request.json();
    const { title, content, tags, category, theme, group, image_url } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields: title and content are required' }, { status: 400 });
    }

    let finalImageUrl = null;

    // 3. Image Handling (download and upload to Supabase if provided)
    if (image_url) {
      try {
        console.log(`Downloading external image from: ${image_url}`);
        const imageResponse = await fetch(image_url);
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image, status: ${imageResponse.status}`);
        }
        
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Determine file extension
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('webp')) ext = 'webp';
        else if (contentType.includes('gif')) ext = 'gif';
        
        // Generate a unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
        const filePath = `n8n-uploads/${filename}`;
        
        console.log(`Uploading to Supabase storage: ${filePath}`);
        const { data: uploadData, error: uploadError } = await supabaseServer
          .storage
          .from('prompts')
          .upload(filePath, buffer, {
            contentType: contentType,
            upsert: false
          });
          
        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          // Fallback to storing the external URL directly instead of failing completely
          finalImageUrl = image_url;
        } else {
          // Get the public URL
          const { data: { publicUrl } } = supabaseServer
            .storage
            .from('prompts')
            .getPublicUrl(filePath);
            
          finalImageUrl = publicUrl;
          console.log(`Successfully uploaded to: ${finalImageUrl}`);
        }
      } catch (imgError) {
        console.error('Image processing error:', imgError);
        // Fallback to the provided external URL if download/upload fails
        finalImageUrl = image_url;
      }
    }

    // 4. Database Insertion
    const userId = process.env.N8N_USER_ID; // Should be configured in env
    
    // Auto-generate a slug based on title if we don't have a specific utility ready here
    // In actual implementation, we might want to use the app's slug generator
    const slugBase = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;

    // Prepare tags ensuring it's an array
    let tagsArray = tags;
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(t => t.trim());
    } else if (!Array.isArray(tags)) {
      tagsArray = [];
    }

    if (!userId) {
      return NextResponse.json({ error: 'N8N_USER_ID is not defined in environment variables' }, { status: 500 });
    }

    const insertData = {
      title,
      content,
      tags: tagsArray,
      category: category || null,
      theme: theme || null,
      group: group || null,
      image: finalImageUrl,
      user_id: userId,
      likes: 0,
      views: 0
      // updated_at and created_at usually default to now()
    };

    const { data: promptData, error: dbError } = await supabaseServer
      .from('prompts')
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }

    const generatedSlug = promptData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 5. Success Response
    return NextResponse.json({
      success: true,
      message: 'Prompt successfully created',
      prompt: {
        id: promptData.id,
        title: promptData.title,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/prompt/${promptData.id}/${generatedSlug}`
      }
    });

  } catch (err: any) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

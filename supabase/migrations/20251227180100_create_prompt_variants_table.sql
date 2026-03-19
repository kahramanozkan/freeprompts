-- Create prompt_variants table for storing user-uploaded output images for prompts
CREATE TABLE IF NOT EXISTS prompt_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    file_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(prompt_id, user_id) -- each user can have only one variant per prompt
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prompt_variants_prompt_id ON prompt_variants(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_variants_user_id ON prompt_variants(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_variants_created_at ON prompt_variants(created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompt_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Anyone can view variants (but we'll filter by login status in application logic)
CREATE POLICY "Anyone can view prompt variants"
    ON prompt_variants FOR SELECT
    USING (true);

-- 2. Authenticated users can insert their own variant (one per prompt)
CREATE POLICY "Authenticated users can insert their own variant"
    ON prompt_variants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own variant
CREATE POLICY "Users can update their own variant"
    ON prompt_variants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own variant
CREATE POLICY "Users can delete their own variant"
    ON prompt_variants FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Prompt owners (users who created the prompt) can delete any variant for that prompt
-- We'll need a helper function to check if user is the prompt owner
CREATE OR REPLACE FUNCTION is_prompt_owner(prompt_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM prompts
        WHERE id = prompt_uuid AND user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Prompt owners can delete any variant for their prompt"
    ON prompt_variants FOR DELETE
    USING (is_prompt_owner(prompt_id, auth.uid()));

-- Create storage bucket for prompt variant images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
    'prompt-variants',
    'prompt-variants',
    true,
    false,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    file_size_limit = EXCLUDED.file_size_limit;

-- Storage policies for the bucket
-- Allow public read access
CREATE POLICY "Public can view prompt variant images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'prompt-variants');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload prompt variant images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'prompt-variants'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text -- users can only upload to their own folder
    );

-- Allow users to update their own files
CREATE POLICY "Users can update their own prompt variant images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'prompt-variants'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own prompt variant images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'prompt-variants'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prompt_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prompt_variants_updated_at
    BEFORE UPDATE ON prompt_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_prompt_variants_updated_at();

-- Add comment to table
COMMENT ON TABLE prompt_variants IS 'User-uploaded output images (variants) for prompts. Each user can upload at most one image per prompt.';
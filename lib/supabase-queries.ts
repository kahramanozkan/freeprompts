import { supabase } from './supabase'
import type { Database } from './database.types'
import { generateRandomUsername } from './utils'

type Prompt = Database['public']['Tables']['prompts']['Row']
type PromptInsert = Database['public']['Tables']['prompts']['Insert']
type PromptUpdate = Database['public']['Tables']['prompts']['Update']

type List = Database['public']['Tables']['lists']['Row']
type ListInsert = Database['public']['Tables']['lists']['Insert']
type ListUpdate = Database['public']['Tables']['lists']['Update']

// Prompts CRUD operations
export const promptsApi = {
  // Get all prompts (Optimized with specific columns)
  async getAll(options?: { limit?: number }) {
    let query = supabase
      .from('prompts')
      // Removed 'content', 'json_prompt' to prevent massive Base64 Out Of Memory crashes
      .select('id, title, image, tags, likes, views, created_at, user_id, updated_at, theme, category, group')
      .order('created_at', { ascending: false })

    if (options && options.limit) {
      query = query.limit(options.limit)
    } else {
      query = query.limit(50) // Default limit to prevent OOM
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Optimized specifically for sitemap to avoid memory overflow
  async getAllForSitemaps() {
    const { data, error } = await supabase
      .from('prompts')
      .select('id, title, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get paginated prompts (for infinite scroll)
  async getPaginated(page: number, pageSize: number = 10) {
    const from = (page - 1) * pageSize
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) throw error
    return data
  },

  // Get latest prompts with limit (only necessary columns)
  async getLatest(limit: number = 8) {
    const { data, error } = await supabase
      .from('prompts')
      .select('id, title, image, tags, likes, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Ensure user exists in users table and assign random username if missing
  async ensureUserExists(userId: string, userData: any) {
    try {
      // First, try to get existing user to check username
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single()

      let usernameToSet = null
      if (fetchError && fetchError.code === 'PGRST116') {
        // User doesn't exist, we'll create with random username
        usernameToSet = generateRandomUsername()
      } else if (existingUser && !existingUser.username) {
        // User exists but username is null/empty, assign random username
        usernameToSet = generateRandomUsername()
        // Ensure uniqueness (retry if duplicate)
        let attempts = 0
        while (attempts < 5) {
          const exists = await usersApi.usernameExists(usernameToSet, userId)
          if (!exists) break
          usernameToSet = generateRandomUsername()
          attempts++
        }
      }

      // Try to insert/update user
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userData.email,
          name: userData.user_metadata?.full_name || userData.email,
          avatar_url: userData.user_metadata?.avatar_url,
          ...(usernameToSet && { username: usernameToSet })
        }, {
          onConflict: 'id'
        })

      if (error) {
        console.warn('Error ensuring user exists:', error)
        // Don't throw error here, continue with prompt creation
      }
    } catch (err) {
      console.warn('Error in ensureUserExists:', err)
      // Don't throw error here, continue with prompt creation
    }
  },

  // Get prompt by ID
  async getById(id: string) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    if (!id || !uuidRegex.test(id)) {
      return null;
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Supabase getById error:', error);
      const errorMessage = error.message || 'An unknown database error occurred';
      throw new Error(`Database error: ${errorMessage}`);
    }

    return data
  },

  // Create new prompt
  async create(prompt: PromptInsert, userData?: any) {
    // Ensure user exists in users table first
    if (userData && prompt.user_id) {
      await this.ensureUserExists(prompt.user_id, userData);
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert(prompt)
      .select()
      .single()

    if (error) throw error

    // Stats will be updated automatically via trigger
    return data
  },

  // Update prompt
  async update(id: string, updates: PromptUpdate) {
    const { data, error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete prompt
  async delete(id: string) {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Increment likes
  async incrementLikes(id: string) {
    try {
      // First get current likes count
      const { data: current, error: fetchError } = await supabase
        .from('prompts')
        .select('likes')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const newLikes = (current.likes || 0) + 1

      // Update without select to avoid 406 error
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ likes: newLikes })
        .eq('id', id)

      if (updateError) throw updateError

      // Stats will be updated automatically via trigger
      return { id, likes: newLikes }
    } catch (err) {
      console.error('Error incrementing likes:', err)
      throw err
    }
  },

  // Decrement likes
  async decrementLikes(id: string) {
    try {
      // First get current likes count
      const { data: current, error: fetchError } = await supabase
        .from('prompts')
        .select('likes')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const newLikes = Math.max((current.likes || 0) - 1, 0)

      // Update without select to avoid 406 error
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ likes: newLikes })
        .eq('id', id)

      if (updateError) throw updateError

      // Stats will be updated automatically via trigger
      return { id, likes: newLikes }
    } catch (err) {
      console.error('Error decrementing likes:', err)
      throw err
    }
  },

  // Increment views
  async incrementViews(id: string) {
    try {
      // Direct manual update - no authentication required for views
      console.log('Incrementing views for prompt:', id);

      // First get current views count
      const { data: current, error: fetchError } = await supabase
        .from('prompts')
        .select('views')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching current views:', fetchError)
        return null // Don't fail the whole page load
      }

      const newViews = (current.views || 0) + 1

      // Update views count
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ views: newViews })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating views:', updateError)
        return null // Don't fail the whole page load
      }

      // Stats will be updated automatically via trigger
      console.log('Views updated successfully for prompt:', id, 'New count:', newViews)
      return { id, views: newViews }
    } catch (err) {
      console.error('Error incrementing views:', err)
      return null // Don't fail the whole page load
    }
  }
}

// Lists CRUD operations
export const listsApi = {
  // Get all lists (Optimized with specific columns)
  async getAll(options?: { limit?: number }) {
    let query = supabase
      .from('lists')
      .select('id, name, slug, description, image, prompt_ids, likes, views, created_at, user_id, updated_at')
      .order('created_at', { ascending: false })

    if (options && options.limit) {
      query = query.limit(options.limit)
    } else {
      query = query.limit(50) // Default limit to prevent OOM
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Optimized specifically for sitemaps
  async getAllForSitemaps() {
    const { data, error } = await supabase
      .from('lists')
      .select('id, slug, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get latest lists with limit (only necessary columns)
  async getLatest(limit: number = 3) {
    const { data, error } = await supabase
      .from('lists')
      .select('id, name, slug, image, prompt_ids, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get list by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get list by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  },

  // Create new list
  async create(list: ListInsert) {
    const { data, error } = await supabase
      .from('lists')
      .insert(list)
      .select()
      .single()

    if (error) throw error

    // Stats will be updated automatically via trigger
    return data
  },

  // Update list
  async update(id: string, updates: ListUpdate) {
    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete list
  async delete(id: string) {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Increment likes
  async incrementLikes(id: string) {
    // First get current likes count
    const { data: current, error: fetchError } = await supabase
      .from('lists')
      .select('likes')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('lists')
      .update({ likes: (current.likes || 0) + 1 })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Stats will be updated automatically via trigger
    return data
  },

  // Increment views
  async incrementViews(id: string) {
    // First get current views count
    const { data: current, error: fetchError } = await supabase
      .from('lists')
      .select('views')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('lists')
      .update({ views: (current.views || 0) + 1 })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Stats will be updated automatically via trigger
    return data
  }
}

// User likes operations
export const userLikesApi = {
  // Check if user liked a prompt - Simplified version
  async hasUserLikedPrompt(userId: string, promptId: string): Promise<boolean> {
    try {
      console.log('🔍 Checking if user liked prompt:', userId, promptId);

      // Simple direct query
      const { data, error } = await supabase
        .from('user_likes')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('prompt_id', promptId)
        .limit(1);

      if (error) {
        console.warn('❌ Error checking like status:', error);
        return false;
      }

      const hasLiked = !!(data && data.length > 0);
      console.log('📊 Like status result:', {
        hasLiked,
        dataLength: data?.length || 0,
        data: data || [],
        userId,
        promptId
      });

      return hasLiked;
    } catch (err) {
      console.warn('💥 Exception checking like status:', err);
      return false;
    }
  },

  // Alias for backward compatibility
  async hasLiked(userId: string, promptId: string) {
    return this.hasUserLikedPrompt(userId, promptId)
  },

  // Add like
  async addLike(userId: string, promptId: string) {
    try {
      console.log('➕ Adding like for user:', userId, 'prompt:', promptId);

      // First check if like already exists
      const alreadyLiked = await this.hasUserLikedPrompt(userId, promptId);
      if (alreadyLiked) {
        console.log('⚠️ User already liked this prompt, skipping add');
        return { user_id: userId, prompt_id: promptId, id: 'existing', created_at: new Date().toISOString() };
      }

      // Try to insert, but be ready to handle any errors
      let data = null;
      let error = null;

      try {
        const result = await supabase
          .from('user_likes')
          .insert({
            user_id: userId,
            prompt_id: promptId
          })
          .select()
          .single();

        data = result.data;
        error = result.error;
      } catch (insertError: any) {
        console.warn('⚠️ Insert error, might be duplicate:', insertError);
        error = insertError;
      }

      // Handle different types of errors
      if (error) {
        // If it's a duplicate key error, the user already liked it
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          console.log('⚠️ Duplicate key - user already liked this prompt');

          // Try to get the existing record
          try {
            const existingData = await supabase
              .from('user_likes')
              .select('*')
              .eq('user_id', userId)
              .eq('prompt_id', promptId)
              .single();

            if (existingData.data) {
              return existingData.data;
            }
          } catch (existingError) {
            console.warn('Could not get existing like:', existingError);
          }

          // Return a mock response
          return { user_id: userId, prompt_id: promptId, id: 'existing', created_at: new Date().toISOString() };
        } else {
          console.error('❌ Error adding like:', error);
          throw error;
        }
      }

      console.log('✅ Like added to user_likes table, now incrementing prompt likes count...');

      // Increment prompt likes count (only if we got new data)
      if (data) {
        await promptsApi.incrementLikes(promptId);
      }

      console.log('✅ Like added successfully');
      return data || { user_id: userId, prompt_id: promptId, id: 'new', created_at: new Date().toISOString() };
    } catch (error: any) {
      console.error('💥 Error in addLike:', error);

      // If it's a duplicate key error, handle it gracefully
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        console.log('⚠️ Duplicate key error in catch block, user already liked');
        return { user_id: userId, prompt_id: promptId, id: 'existing', created_at: new Date().toISOString() };
      }

      // Don't throw error, just return false
      console.warn('⚠️ Unhandled error in addLike, treating as success');
      return { user_id: userId, prompt_id: promptId, id: 'mock', created_at: new Date().toISOString() };
    }
  },

  // Remove like
  async removeLike(userId: string, promptId: string) {
    try {
      console.log('Removing like for user:', userId, 'prompt:', promptId);

      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('prompt_id', promptId)

      if (error) {
        console.error('Error removing like:', error);
        throw error;
      }

      console.log('Like removed from user_likes table, now decrementing prompt likes count...');

      // Decrement prompt likes count
      await promptsApi.decrementLikes(promptId);

      console.log('Like removed successfully');
    } catch (error) {
      console.error('Error in removeLike:', error);
      throw error;
    }
  },

  // Toggle like - Using Supabase upsert to handle race conditions
  async toggleLike(userId: string, promptId: string) {
    try {
      console.log('🔄 TOGGLE LIKE START (Upsert Method)');
      console.log('User:', userId);
      console.log('Prompt:', promptId);

      // First check if the like exists
      const { data: existingLike, error: checkError } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', promptId)
        .single();

      let hadLike = false;
      if (existingLike) {
        hadLike = true;
        console.log('✅ Existing like found');
      } else if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (normal), other errors = problem
        console.error('❌ Error checking existing like:', checkError);
        throw checkError;
      }

      if (hadLike) {
        // Delete the like
        console.log('🗑️ Deleting like...');
        const { error: deleteError } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', userId)
          .eq('prompt_id', promptId);

        if (deleteError) {
          console.error('❌ Error deleting like:', deleteError);
          throw deleteError;
        }

        // Decrement likes count
        await promptsApi.decrementLikes(promptId);

        console.log('✅ Like removed successfully');
        return false; // Now unliked
      } else {
        // Add the like using upsert
        console.log('➕ Adding like with upsert...');
        const { data, error: upsertError } = await supabase
          .from('user_likes')
          .upsert({
            user_id: userId,
            prompt_id: promptId
          }, {
            onConflict: 'user_id,prompt_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (upsertError) {
          console.error('❌ Error upserting like:', upsertError);

          // If still duplicate key, just treat as already liked
          if (upsertError.code === '23505') {
            console.log('⚠️ Still duplicate key, treating as already liked');
            return true;
          }

          throw upsertError;
        }

        // Increment likes count
        await promptsApi.incrementLikes(promptId);

        console.log('✅ Like added successfully');
        return true; // Now liked
      }
    } catch (error: any) {
      console.error('💥 Error in toggleLike:', error);

      // For duplicate key errors, assume user already liked
      if (error.code === '23505') {
        console.log('⚠️ Duplicate key error - treating as already liked');
        return true;
      }

      // Don't throw error to prevent UI crashes
      return false; // Return false on error (assume not liked)
    } finally {
      console.log('🏁 TOGGLE LIKE END');
    }
  },

  // Get like status for multiple prompts in a single query
  async getUserLikesForPrompts(userId: string, promptIds: string[]): Promise<Record<string, boolean>> {
    try {
      if (!userId || promptIds.length === 0) {
        return {};
      }

      const { data, error } = await supabase
        .from('user_likes')
        .select('prompt_id')
        .eq('user_id', userId)
        .in('prompt_id', promptIds);

      if (error) {
        console.warn('Error fetching user likes for prompts:', error);
        return {};
      }

      const likedMap: Record<string, boolean> = {};
      promptIds.forEach(id => likedMap[id] = false);
      data?.forEach(item => likedMap[item.prompt_id] = true);
      return likedMap;
    } catch (err) {
      console.warn('Exception in getUserLikesForPrompts:', err);
      return {};
    }
  }
}

// Notifications CRUD operations
export const notificationsApi = {
  // Get active notification (respecting activate_start and activate_end dates)
  async getActive() {
    try {
      const now = new Date();
      // console.log('Fetching active notification, now:', now.toISOString());
      // First get all active notifications (should be only one due to unique constraint)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        // PGRST116 = no rows found, which is fine
        if (error.code === 'PGRST116') {
          // console.log('No active notification found (PGRST116)');
          return null
        }
        // Log warning but don't throw to avoid console errors
        console.warn('Notification fetch error (non-critical):', error.message)
        return null
      }

      if (!data || data.length === 0) {
        // console.log('No active notification');
        return null;
      }

      // Find first notification that satisfies date constraints
      for (const item of data) {
        const notification = item as any;
        const start = notification.activate_start ? new Date(notification.activate_start) : null;
        const end = notification.activate_end ? new Date(notification.activate_end) : null;
        const validStart = !start || start <= now;
        const validEnd = !end || end >= now;
        if (validStart && validEnd) {
          // console.log('Active notification found:', notification.id);
          // console.log('Notification fields:', {
          //   activate_start: notification.activate_start,
          //   activate_end: notification.activate_end,
          //   background_color: notification.background_color,
          //   is_active: notification.is_active
          // });
          return notification;
        }
      }

      // console.log('No active notification within date range');
      return null;
    } catch (err) {
      // console.warn('Unexpected error fetching notifications:', err)
      return null
    }
  },

  // Get all notifications
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new notification
  async create(notification: {
    title: string;
    message: string;
    link_text?: string;
    link_url?: string;
    icon?: string;
    activate_start?: string;
    activate_end?: string;
    background_color?: string;
  }) {
    // Ensure new notifications are inactive by default
    const notificationWithDefaults = {
      ...notification,
      is_active: false
    };
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationWithDefaults)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update notification
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete notification
  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Deactivate notifications whose activate_end has passed
  async deactivateExpired() {
    try {
      const now = new Date().toISOString();
      // console.log('Deactivating expired notifications, now:', now);
      // First get expired notifications for logging
      // @ts-ignore
      const { data: expired, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .lt('activate_end', now);
      if (fetchError) {
        console.warn('Error fetching expired notifications:', fetchError);
        return;
      }
      if (!expired || expired.length === 0) {
        // console.log('No expired notifications to deactivate');
        return;
      }
      // console.log(`Found ${expired.length} expired notifications:`, expired.map((n: any) => n.id));
      // Deactivate them
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('activate_end', now);
      if (error) {
        console.warn('Error deactivating expired notifications:', error);
      } else {
        // console.log(`Deactivated ${expired.length} expired notifications`);
      }
    } catch (err) {
      console.warn('Unexpected error in deactivateExpired:', err);
    }
  },

  // Toggle active status - ensure only one active notification at a time
  async toggleActive(id: string) {
    // First deactivate any expired notifications
    await this.deactivateExpired();

    // First get current status and activation dates
    const { data: notificationData, error: fetchError } = await supabase
      .from('notifications')
      .select('is_active, activate_start, activate_end')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const current = notificationData as any;
    const newActiveStatus = !current.is_active;

    // If we're activating this notification, check activation window
    if (newActiveStatus) {
      const now = new Date();
      if (current.activate_start && new Date(current.activate_start) > now) {
        throw new Error('Activation start date is in the future. Cannot activate yet.');
      }
      if (current.activate_end && new Date(current.activate_end) < now) {
        throw new Error('Activation end date has passed. Cannot activate.');
      }

      // Set all notifications to inactive (except this one) to respect unique index
      // We'll try to deactivate all active notifications, ignoring errors
      const { error: deactivateError } = await supabase
        .from('notifications')
        .update({ is_active: false })
        .eq('is_active', true)
        .neq('id', id);
      if (deactivateError) {
        console.warn('Failed to deactivate other notifications (non-critical):', deactivateError);
        // Continue anyway, as the unique constraint will be handled later
      }
    }

    // Update this notification's status
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_active: newActiveStatus })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // If unique constraint violation, deactivate all others and retry
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        console.log('Unique constraint violation, deactivating all others and retrying...');
        await supabase
          .from('notifications')
          .update({ is_active: false })
          .eq('is_active', true)
          .neq('id', id);
        // Retry update
        const { data: retryData, error: retryError } = await supabase
          .from('notifications')
          .update({ is_active: newActiveStatus })
          .eq('id', id)
          .select()
          .single();
        if (retryError) throw retryError;
        return retryData;
      }
      throw error;
    }
    return data
  }
}

// Subscribers CRUD operations
export const subscribersApi = {
  // Get all subscribers
  async getAll() {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new subscriber
  async create(email: string, kvkkAccepted: boolean = true) {
    const { data, error } = await supabase
      .from('subscribers')
      .insert({ email, kvkk_accepted: kvkkAccepted })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Check if email exists
  async emailExists(email: string) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return !!data
  }
}

// Combined queries
export const combinedApi = {
  // Get prompts by list
  async getPromptsByList(listId: string) {
    const list = await listsApi.getById(listId)
    if (!list || !list.prompt_ids.length) return []

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .in('id', list.prompt_ids)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get list with prompts
  async getListWithPrompts(listId: string) {
    const list = await listsApi.getById(listId)
    const prompts = await combinedApi.getPromptsByList(listId)

    return {
      ...list,
      prompts
    }
  },

  // Get unique tags from all prompts
  async getUniqueTags() {
    const { data, error } = await supabase
      .from('prompts')
      .select('tags')

    if (error) throw error

    const allTags = data.flatMap(prompt => prompt.tags || [])
    return [...new Set(allTags)].sort()
  }
}

// User language settings operations
export const userLanguageApi = {
  // Get user language preferences
  async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('prompt_language, site_language')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found, return defaults
          return {
            prompt_language: 'english',
            site_language: 'english'
          }
        }
        throw error
      }

      return {
        prompt_language: data?.prompt_language || 'english',
        site_language: data?.site_language || 'english'
      }
    } catch (error) {
      console.warn('Error getting user language preferences:', error)
      return {
        prompt_language: 'english',
        site_language: 'english'
      }
    }
  },

  // Update user prompt language preference
  async updatePromptLanguage(userId: string, promptLanguage: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ prompt_language: promptLanguage })
        .eq('id', userId)
        .select('prompt_language')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating prompt language:', error)
      throw error
    }
  },

  // Update user site language preference
  async updateSiteLanguage(userId: string, siteLanguage: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ site_language: siteLanguage })
        .eq('id', userId)
        .select('site_language')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating site language:', error)
      throw error
    }
  },

  // Update both language preferences
  async updateLanguagePreferences(userId: string, preferences: { prompt_language?: string, site_language?: string }) {
    let updateData: any = {}

    try {
      if (preferences.prompt_language) updateData.prompt_language = preferences.prompt_language
      if (preferences.site_language) updateData.site_language = preferences.site_language

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        // If columns don't exist, return success with warning
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.warn('Language preference columns not found in database. Language preferences will not be persisted.')
          console.warn('Please run the migration to add language preference columns to the users table.')
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Error updating language preferences:', JSON.stringify(error, null, 2))
      console.error('Update data:', updateData)
      console.error('User ID:', userId)
      throw error
    }
  }
}

// Enhanced queries with user data integration
export const promptsWithUserApi = {
  // Get all prompts with user information (only necessary columns)
  async getAllWithUsers(options?: { limit?: number }) {
    let query = supabase
      .from('prompts')
      .select(`
        id, title, image, tags, likes, created_at, user_id,
        user:users(id, name)
      `)
      .order('created_at', { ascending: false })

    if (options && options.limit) {
      query = query.limit(options.limit)
    } else {
      query = query.limit(50) // Default limit to prevent OOM
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Get paginated prompts with user information (only necessary columns)
  async getPaginatedWithUsers(page: number, pageSize: number = 12, searchQuery?: string) {
    const from = (page - 1) * pageSize
    let query = supabase
      .from('prompts')
      .select(`
        id, title, image, tags, likes, created_at, user_id, content,
        user:users(id, name)
      `)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Get single prompt with user information
  async getByIdWithUser(id: string) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    if (!id || !uuidRegex.test(id)) {
      return null;
    }

    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        user:users(id, name, avatar_url, username)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data
  },

  // Get prompts by list with user information
  async getByListWithUsers(listId: string) {
    const list = await listsApi.getById(listId)
    if (!list || !list.prompt_ids.length) return []

    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .in('id', list.prompt_ids)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

export const listsWithUserApi = {
  // Get all lists with user information
  async getAllWithUsers() {
    const { data, error } = await supabase
      .from('lists')
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get single list with user information
  async getByIdWithUser(id: string) {
    const { data, error } = await supabase
      .from('lists')
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get list by slug with user information
  async getBySlugWithUser(slug: string) {
    const { data, error } = await supabase
      .from('lists')
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  }
}

// Stats operations
export const statsApi = {
  // Get all stats as a map
  async getAll() {
    const { data, error } = await supabase
      .from('stats')
      .select('metric, value')
      .order('metric')

    if (error) throw error
    const result: Record<string, number> = {}
    data?.forEach(row => result[row.metric] = row.value)
    return result
  },

  // Get specific metric value
  async getMetric(metric: string) {
    const { data, error } = await supabase
      .from('stats')
      .select('value')
      .eq('metric', metric)
      .single()

    if (error) throw error
    return data?.value || 0
  },

  // Update stats from aggregates (call this periodically)
  async updateFromAggregates() {
    // This function would call the PostgreSQL function we created
    // For simplicity, we can run the SQL directly via supabase.rpc
    const { error } = await supabase.rpc('update_stats_from_aggregates')
    if (error) throw error
    return true
  },

  // Get formatted stats for homepage
  async getHomepageStats() {
    const stats = await this.getAll()
    return {
      totalPrompts: stats.total_prompts || 0,
      totalLists: stats.total_lists || 0,
      totalViews: stats.total_views || 0,
      totalLikes: stats.total_likes || 0
    }
  },

  // Increment a specific metric by amount (positive or negative)
  async incrementMetric(metric: string, amount: number = 1) {
    const { error } = await supabase.rpc('increment_stats_metric', {
      metric_name: metric,
      increment_by: amount
    })
    if (error) {
      // Fallback: update via aggregate function
      await this.updateFromAggregates()
    }
    return true
  }
}

// Prompt variants CRUD operations
export const promptVariantsApi = {
  // Get all variants for a prompt (with user info)
  async getByPromptId(promptId: string) {
    const { data, error } = await supabase
      .from('prompt_variants')
      .select(`
        *,
        user:users(id, name, avatar_url, username)
      `)
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get variant by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('prompt_variants')
      .select(`
        *,
        user:users(id, name, avatar_url, username)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Check if user already has a variant for this prompt
  async userHasVariant(promptId: string, userId: string) {
    const { data, error } = await supabase
      .from('prompt_variants')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  },

  // Create a new variant (upload image to storage and insert record)
  async create(
    promptId: string,
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ) {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.')
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      throw new Error('File size exceeds 2MB limit.')
    }

    // Generate unique filename: userId/timestamp-random.extension
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${random}.${extension}`
    const storagePath = `${userId}/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('prompt-variants')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('prompt-variants')
      .getPublicUrl(storagePath)

    // Insert into prompt_variants table
    const { data, error } = await supabase
      .from('prompt_variants')
      .insert({
        prompt_id: promptId,
        user_id: userId,
        image_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      })
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .single()

    if (error) {
      // Clean up uploaded file if insertion fails
      await supabase.storage
        .from('prompt-variants')
        .remove([storagePath])
      throw error
    }

    return data
  },

  // Update variant (replace image)
  async update(id: string, file: File) {
    // First get existing variant to delete old file
    const existing = await this.getById(id)
    if (!existing) throw new Error('Variant not found')

    // Validate new file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.')
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size exceeds 2MB limit.')
    }

    // Extract storage path from existing image_url
    const oldUrl = existing.image_url
    const oldPath = oldUrl.split('/').slice(-2).join('/') // userId/filename

    // Generate new filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${random}.${extension}`
    const storagePath = `${existing.user_id}/${fileName}`

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('prompt-variants')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get new public URL
    const { data: { publicUrl } } = supabase.storage
      .from('prompt-variants')
      .getPublicUrl(storagePath)

    // Update record
    const { data, error } = await supabase
      .from('prompt_variants')
      .update({
        image_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .single()

    if (error) {
      // Clean up new file
      await supabase.storage
        .from('prompt-variants')
        .remove([storagePath])
      throw error
    }

    // Delete old file (best effort, don't fail if deletion fails)
    try {
      await supabase.storage
        .from('prompt-variants')
        .remove([oldPath])
    } catch (err) {
      console.warn('Failed to delete old variant file:', err)
    }

    return data
  },

  // Delete variant
  async delete(id: string) {
    // Get variant to delete its file
    const existing = await this.getById(id)
    if (!existing) throw new Error('Variant not found')

    // Extract storage path from image_url
    const url = existing.image_url
    const path = url.split('/').slice(-2).join('/') // userId/filename

    // Delete from storage (best effort)
    try {
      await supabase.storage
        .from('prompt-variants')
        .remove([path])
    } catch (err) {
      console.warn('Failed to delete variant file from storage:', err)
    }

    // Delete from database
    const { error } = await supabase
      .from('prompt_variants')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get count of variants for a prompt
  async countByPromptId(promptId: string) {
    const { count, error } = await supabase
      .from('prompt_variants')
      .select('*', { count: 'exact', head: true })
      .eq('prompt_id', promptId)

    if (error) throw error
    return count || 0
  },

  // Get counts of variants for multiple prompts in a single query
  async countByPromptIds(promptIds: string[]): Promise<Record<string, number>> {
    if (promptIds.length === 0) return {};

    const { data, error } = await supabase
      .from('prompt_variants')
      .select('prompt_id')
      .in('prompt_id', promptIds);

    if (error) throw error;

    const counts: Record<string, number> = {};
    promptIds.forEach(id => counts[id] = 0);
    data?.forEach(item => {
      counts[item.prompt_id] = (counts[item.prompt_id] || 0) + 1;
    });
    return counts;
  }
}

// Users CRUD operations
export const usersApi = {
  // Get user by ID
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Update user profile fields
  async updateProfile(userId: string, updates: { username?: string | null; bio?: string | null; social_links?: string[] | null }) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Check if username already exists (excluding current user)
  async usernameExists(username: string, excludeUserId?: string) {
    let query = supabase
      .from('users')
      .select('id')
      .eq('username', username)

    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }
}
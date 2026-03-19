# PromptBase - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

Follow these steps to get your PromptBase application running:

### Step 1: Install Dependencies

```bash
cd C:\Users\kahra\OneDrive\Desktop\Projects\promptbase
npm install
```

### Step 2: Install Supabase Package

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Step 3: Create Environment File

Create a `.env.local` file in the root directory:

```bash
copy .env.local.example .env.local
```

### Step 4: Configure Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Set Up Database

1. Go to your Supabase project
2. Click on "SQL Editor"
3. Copy and paste the SQL from README.md (Database Setup section)
4. Click "Run"

### Step 6: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/auth/callback`
6. Copy Client ID and Secret
7. Go to Supabase > Authentication > Providers > Google
8. Enable Google and add your credentials
9. Update `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 7: Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎉 You're Done!

Your PromptBase application is now running!

## 📝 Next Steps

### Optional: Configure Google Ads

1. Create a Google AdSense account
2. Get your Ad Client ID
3. Update `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID=ca-pub-xxxxxxxxxx
NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID=xxxxxxxxxx
```

4. Update `components/ui/AdSpace.tsx` with your ad code

### Deploy to Production

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

## 🆘 Troubleshooting

### Issue: Module not found '@supabase/supabase-js'
**Solution**: Run `npm install @supabase/supabase-js`

### Issue: Google OAuth not working
**Solution**: 
- Check redirect URIs in Google Console
- Verify credentials in Supabase
- Make sure Google+ API is enabled

### Issue: Database connection error
**Solution**:
- Verify Supabase URL and key in `.env.local`
- Check if database tables are created
- Ensure RLS policies are set up

### Issue: Styles not loading
**Solution**: 
- Clear `.next` folder: `rmdir /s /q .next`
- Restart dev server: `npm run dev`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

## 💡 Tips

1. **Development**: Use `npm run dev` for hot reload
2. **Production**: Always run `npm run build` before deploying
3. **Environment**: Never commit `.env.local` to version control
4. **Database**: Regularly backup your Supabase database
5. **Testing**: Test Google OAuth in incognito mode

## 🔒 Security Checklist

- [ ] Environment variables are set correctly
- [ ] `.env.local` is in `.gitignore`
- [ ] RLS policies are enabled on all tables
- [ ] Google OAuth redirect URIs are correct
- [ ] Supabase anon key is used (not service key)

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the full README.md
3. Check Supabase and Next.js documentation
4. Verify all environment variables are correct

---

Happy coding! 🚀
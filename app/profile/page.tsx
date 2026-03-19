"use client";

import { useAuth } from "@/components/ui/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSiteLanguage } from "@/contexts/SiteLanguageContext";
import { getTranslation } from "@/lib/translations";
import { usersApi } from "@/lib/supabase-queries";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { siteLanguage: globalSiteLanguage } = useSiteLanguage();
  const t = (key: string) => getTranslation(globalSiteLanguage, key);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedSocialLinks, setEditedSocialLinks] = useState<string[]>([]);
  const [newSocialLink, setNewSocialLink] = useState('');


useEffect(() => {
  if (!loading && !user) {
    router.push('/auth/signin');
  }
}, [user, loading, router]);

useEffect(() => {
  if (user) {
    const fetchUserData = async () => {
      try {
        const data = await usersApi.getById(user.id);
        setUserData(data);
        // Initialize edit states
        setEditedUsername(data?.username || '');
        setEditedBio(data?.bio || '');
        setEditedSocialLinks(data?.social_links || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingUserData(false);
      }
    };
    fetchUserData();
  }
}, [user]);

const handleEditToggle = async () => {
  if (isEditing) {
    // Save logic
    await handleSave();
  } else {
    // Enter edit mode
    setIsEditing(true);
  }
};

const handleSave = async () => {
  if (!user) return;

  // Validate username format (alphanumeric)
  const usernameRegex = /^[a-zA-Z0-9]*$/;
  if (editedUsername && !usernameRegex.test(editedUsername)) {
    alert('Username can only contain letters and numbers.');
    return;
  }

  // Check for duplicate username (if changed)
  if (editedUsername !== userData?.username) {
    try {
      const exists = await usersApi.usernameExists(editedUsername, user.id);
      if (exists) {
        alert('This username is already taken. Please choose a different one.');
        return;
      }
    } catch (error) {
      console.error('Error checking username:', error);
      alert('Error checking username availability. Please try again.');
      return;
    }
  }

  // Validate bio format (alphanumeric and spaces)
  const bioRegex = /^[a-zA-Z0-9 ]*$/;
  if (editedBio && !bioRegex.test(editedBio)) {
    alert('Bio can only contain letters, numbers, and spaces.');
    return;
  }

  // Prepare update data
  const updates: any = {};
  if (editedUsername !== userData?.username) updates.username = editedUsername || null;
  if (editedBio !== userData?.bio) updates.bio = editedBio || null;
  if (JSON.stringify(editedSocialLinks) !== JSON.stringify(userData?.social_links || [])) {
    updates.social_links = editedSocialLinks;
  }

  // If no changes, just exit edit mode
  if (Object.keys(updates).length === 0) {
    setIsEditing(false);
    return;
  }

  try {
    const updatedUser = await usersApi.updateProfile(user.id, updates);
    setUserData(updatedUser);
    setIsEditing(false);
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile. Please try again.');
  }
};

const handleCancelEdit = () => {
  // Reset to original data
  setEditedUsername(userData?.username || '');
  setEditedBio(userData?.bio || '');
  setEditedSocialLinks(userData?.social_links || []);
  setNewSocialLink('');
  setIsEditing(false);
};

const addSocialLink = () => {
  if (!newSocialLink.trim()) return;
  if (editedSocialLinks.length >= 5) {
    alert('Maximum 5 social links allowed');
    return;
  }
  setEditedSocialLinks([...editedSocialLinks, newSocialLink.trim()]);
  setNewSocialLink('');
};

const removeSocialLink = (index: number) => {
  setEditedSocialLinks(editedSocialLinks.filter((_, i) => i !== index));
};


if (loading || loadingUserData) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
    </div>
  );
}

if (!user) {
  return null;
}

const { signOut } = useAuth();

return (
  <div className="min-h-screen bg-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page title with Sign Out button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-black">{t('profile.title')}</h1>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Box - Left */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black">Personal</h2>
            <div className="flex items-center space-x-4">
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                {isEditing ? 'Save' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl font-medium">
                {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-medium text-black">
                  {user.user_metadata?.full_name || 'User'}
                </h3>
                <p className="text-gray-600">Profile Picture</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter username (letters and numbers only)"
                      maxLength={50}
                      pattern="[a-zA-Z0-9]*"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 50 characters, letters and numbers only.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                    {userData?.username || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'Not provided'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                  {user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Not provided'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <div>
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[80px]"
                      placeholder="Tell us about yourself"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 200 characters, letters and numbers only.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900 min-h-[80px]">
                    {userData?.bio || 'No bio provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Links
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {editedSocialLinks.map((link, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={link}
                            onChange={(e) => {
                              const newLinks = [...editedSocialLinks];
                              newLinks[index] = e.target.value;
                              setEditedSocialLinks(newLinks);
                            }}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="https://example.com/profile"
                          />
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    {editedSocialLinks.length < 5 && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newSocialLink}
                          onChange={(e) => setNewSocialLink(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Enter a social media link"
                        />
                        <button
                          type="button"
                          onClick={addSocialLink}
                          className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Maximum 5 links. You can add, edit, or remove links.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userData?.social_links && userData.social_links.length > 0 ? (
                      userData.social_links.map((link: string, index: number) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900 break-all">
                          {link}
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900 italic">
                        No social links added
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Box - Right */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-black mb-6">Settings</h2>
          <div className="text-gray-500 text-center py-12">
            <p className="mb-4">Settings area will be populated soon.</p>
            <p className="text-sm">Functionality to be added later.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
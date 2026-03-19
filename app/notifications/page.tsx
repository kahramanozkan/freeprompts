"use client";

import { useAuth } from "@/components/ui/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { notificationsApi } from "@/lib/supabase-queries";

type Notification = {
  id: string;
  title: string;
  message: string;
  link_text: string | null;
  link_url: string | null;
  icon: string | null;
  is_active: boolean;
  activate_start: string | null;
  activate_end: string | null;
  background_color: string | null;
  created_at: string;
  updated_at: string;
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} years ago`;
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  // Format as DD/MM/YYYY HH:MM
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Modal states
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    link_text: '',
    link_url: '',
    icon: '',
    activate_start: '',
    activate_end: '',
    background_color: '#3B82F6'
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }
    if (!loading && user && user.email !== 'kahramanozkan@gmail.com') {
      router.push('/404');
      return;
    }

    if (user && user.email === 'kahramanozkan@gmail.com') {
      loadNotifications();
    }
  }, [user, loading, router]);

  const loadNotifications = async () => {
    try {
      setLoadingData(true);
      // First deactivate any expired notifications
      await notificationsApi.deactivateExpired();
      const data = await notificationsApi.getAll();
      // Cast to Notification type (new fields may be null)
      setNotifications((data as Notification[]) || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      if (editingId) {
        // Update existing notification
        await notificationsApi.update(editingId, {
          title: formData.title,
          message: formData.message,
          link_text: formData.link_text || undefined,
          link_url: formData.link_url || undefined,
          icon: formData.icon || undefined,
          activate_start: formData.activate_start || undefined,
          activate_end: formData.activate_end || undefined,
          background_color: formData.background_color || undefined
        });
      } else {
        // Create new notification
        await notificationsApi.create({
          title: formData.title,
          message: formData.message,
          link_text: formData.link_text || undefined,
          link_url: formData.link_url || undefined,
          icon: formData.icon || undefined,
          activate_start: formData.activate_start || undefined,
          activate_end: formData.activate_end || undefined,
          background_color: formData.background_color || undefined
        });
      }

      setFormData({
        title: '',
        message: '',
        link_text: '',
        link_url: '',
        icon: '',
        activate_start: '',
        activate_end: '',
        background_color: '#3B82F6'
      });
      setEditingId(null);
      loadNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      setAlertMessage('Bildirim kaydedilirken hata oluştu.');
      setShowAlertModal(true);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await notificationsApi.toggleActive(id);
      loadNotifications();
    } catch (error: any) {
      console.error('Error toggling notification:', error);
      setAlertMessage(error.message || 'Bildirim durumu değiştirilirken hata oluştu.');
      setShowAlertModal(true);
    }
  };

  const editNotification = (notification: Notification) => {
    setEditingId(notification.id);
    setFormData({
      title: notification.title,
      message: notification.message,
      link_text: notification.link_text || '',
      link_url: notification.link_url || '',
      icon: notification.icon || '',
      activate_start: notification.activate_start ? notification.activate_start.slice(0, 16) : '',
      activate_end: notification.activate_end ? notification.activate_end.slice(0, 16) : '',
      background_color: notification.background_color || '#3B82F6'
    });
    // Scroll to form
    document.getElementById('notification-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      message: '',
      link_text: '',
      link_url: '',
      icon: '',
      activate_start: '',
      activate_end: '',
      background_color: '#3B82F6'
    });
  };

  const deleteNotification = async (id: string) => {
    setConfirmMessage('Bu bildirimi silmek istediğinizden emin misiniz?');
    setConfirmCallback(() => async () => {
      try {
        await notificationsApi.delete(id);
        // Remove from localStorage dismissed list
        const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notification_ids') || '[]');
        const updatedIds = dismissedIds.filter((dismissedId: string) => dismissedId !== id);
        localStorage.setItem('dismissed_notification_ids', JSON.stringify(updatedIds));
        loadNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        setAlertMessage('Bildirim silinirken hata oluştu.');
        setShowAlertModal(true);
      }
    });
    setShowConfirmModal(true);
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.email !== 'kahramanozkan@gmail.com') {
    // Yönlendirme zaten useEffect'te yapıldı, burada sadece spinner göster
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const visibleNotifications = notifications.slice(0, visibleCount);
  const hasMore = visibleCount < notifications.length;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black mb-2">Notifications Management</h1>
          <p className="text-gray-600">Manage announcement banners displayed on the website</p>
        </div>

        {/* Create/Edit Notification */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-black mb-6">
            {editingId ? 'Edit Notification' : 'Create New Notification'}
          </h2>

          <form id="notification-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (emoji) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="🚀"
                />
                <p className="text-xs text-gray-500 mt-1">Enter an emoji or upload an image (PNG)</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['🚀', '🔥', '⭐', '🎉', '📢', '💡', '🔔', '📌', '📅', '📝'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notification message"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text *
                </label>
                <input
                  type="text"
                  required
                  value={formData.link_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Learn More"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activate Start *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.activate_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, activate_start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activate End *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.activate_end}
                  onChange={(e) => setFormData(prev => ({ ...prev, activate_end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                    className="w-10 h-10 cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    value={formData.background_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingId ? 'Update Notification' : 'Create Notification'
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-lg font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-black">Existing Notifications</h2>
            <span className="text-sm text-gray-500">
              {notifications.length} total, showing {visibleNotifications.length}
            </span>
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications created yet.</p>
          ) : (
            <>
              <div className="space-y-4">
                {visibleNotifications.map((notification) => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">
                            {notification.icon || '📢'}
                          </span>
                          <h3 className="text-lg font-medium text-black">{notification.title}</h3>
                          {(() => {
                            const now = new Date();
                            const end = notification.activate_end ? new Date(notification.activate_end) : null;
                            const isExpired = end && end < now;
                            const isAutoDeactivated = isExpired && !notification.is_active;
                            if (isAutoDeactivated) {
                              return (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                  Auto Deactive
                                </span>
                              );
                            }
                            return (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                notification.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.is_active ? 'Active' : 'Inactive'}
                              </span>
                            );
                          })()}
                        </div>

                        <p className="text-gray-700 mb-3">{notification.message}</p>

                        {notification.link_text && notification.link_url && (
                          <p className="text-sm text-blue-600">
                            Link: {notification.link_text} → {notification.link_url}
                          </p>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          Created {timeAgo(notification.created_at)} • {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          <div>Start: {formatDateTime(notification.activate_start)}</div>
                          <div>End: {formatDateTime(notification.activate_end)}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {(() => {
                          const now = new Date();
                          const end = notification.activate_end ? new Date(notification.activate_end) : null;
                          const isExpired = end && end < now;
                          const isAutoDeactivated = isExpired && !notification.is_active;
                          if (isAutoDeactivated) {
                            return (
                              <span className="px-3 py-1 text-sm text-gray-500 italic">
                                Cannot activate (expired)
                              </span>
                            );
                          }
                          return (
                            <button
                              onClick={() => toggleActive(notification.id)}
                              className={`px-3 py-1 text-sm rounded-md ${
                                notification.is_active
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {notification.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          );
                        })()}

                        <button
                          onClick={() => editNotification(notification)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Information</h3>
            <p className="text-gray-700 mb-6">{alertMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Confirm</h3>
            <p className="text-gray-700 mb-6">{confirmMessage}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmCallback(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  if (confirmCallback) {
                    confirmCallback();
                  }
                  setConfirmCallback(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
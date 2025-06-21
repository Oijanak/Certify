import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationIcon from "./NotificationIcon";
import NotificationDropdown from "./NotificationDropdown";
import UserAvatar from "./UserAvatar";
import UserDropdown from "./UserDropDown";
import AuthButtons from "./AuthButtons";
import certifyLogo from "../../assets/certify.png";
import ConnectButton from "./ConnectButton";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your project has been approved",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      message: "New message from John Doe",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "System update scheduled",
      time: "2 days ago",
      read: true,
    },
    // ... other notifications
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllAsRead() {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-22">
          {/* Logo section */}
          <div className="w-1/2 sm:w-auto">
            <Link
              to={isAuthenticated && !isAdmin ? "/user" : "/admin/dashboard"}
              className="flex items-center sm:flex"
            >
              <img
                src={certifyLogo}
                alt="Certify Logo"
                className="h-12 w-auto hidden md:block"
              />
              <span className="ml-2 text-2xl font-bold text-indigo-600 hidden md:block">
                Certify
              </span>
            </Link>
          </div>

          {/* Right controls */}
          <div className="flex items-center justify-end w-1/2 sm:w-auto space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <NotificationIcon
                    count={unreadCount}
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                  />
                  {notificationsOpen && (
                    <NotificationDropdown
                      notifications={notifications}
                      onClose={() => setNotificationsOpen(false)}
                      markAllAsRead={markAllAsRead}
                    />
                  )}
                </div>
                <div className="relative ml-3">
                  <UserAvatar
                    user={user}
                    onClick={() => setProfileOpen(!profileOpen)}
                  />
                  {profileOpen && (
                    <UserDropdown
                      user={user}
                      isAdmin={isAdmin}
                      onLogout={logout}
                      onClose={() => setProfileOpen(false)}
                    />
                  )}
                </div>
              </>
            ) : (
              <AuthButtons />
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

import { useRef } from "react";
import useClickOutside from "../../hooks/useClickOutside";

export default function NotificationDropdown({
  notifications,
  onClose,
  markAllAsRead,
}) {
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, onClose);

  return (
    <div
      ref={dropdownRef}
      className="origin-top-right absolute right-0 mt-2 w-72 rounded-none shadow-lg bg-white ring-1 ring-gray-500 ring-opacity-5 focus:outline-none z-50"
    >
      {/* Fixed header that doesn't scroll */}
      <div className="sticky shadow-md top-0 bg-white z-10 px-4 py-2 border-b-indigo-800">
        <p className="text-lg font-medium text-gray-900">Notifications</p>
      </div>

      {/* Scrollable notifications list */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 border-b ${
                !notification.read
                  ? "bg-indigo-100 shadow-md border-b-indigo-300"
                  : "border-b-gray-200 shadow-sm"
              }`}
            >
              <p className="text-sm text-gray-700">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              {!notification.read && (
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 mt-1"></span>
              )}
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-center">
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        )}
      </div>

      {/* Fixed footer */}
      <div className="sticky bottom-0 bg-white shadow-md border-t-gray-400 px-4 py-2 text-center hover:bg-indigo-100 hover:cursor-pointer">
        <button
          className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
          onClick={() => {
            markAllAsRead();
          }}
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}

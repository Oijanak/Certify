export default function UserAvatar({ user, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:cursor-pointer"
    >
      <span className="sr-only">Open user menu</span>
      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
        {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
      </div>
    </button>
  );
}

import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-white p-4 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

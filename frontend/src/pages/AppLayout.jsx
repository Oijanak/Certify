import Navbar from "../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
const AppLayout = () => {
  return (
    <div className="min-h-full">
      <Navbar />
      <main className="pt-2">
        {" "}
        {/* 4rem = 64px */}
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

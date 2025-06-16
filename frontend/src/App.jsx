import { createBrowserRouter, RouterProvider } from "react-router";
import Register, { loader as emailLoader } from "./pages/Register";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar/Navbar";
import AppLayout from "./pages/AppLayout";
import AdminLayout from "./pages/AdminLayout";
import VerifyEmail from "./pages/VerifyEmail";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import AdminDashboard from "./pages/AdminDashboard";
import UserListWithPagination, {
  loader as userLoader,
} from "./components/UserListWithPagination";
import Certificates from "./components/Certificates";
import IssueCertificate from "./components/IssueCertificate";
import ProfilePage from "./pages/ProfilePage";
import RequestCertificate from "./pages/RequestCertificate";
import { CertificateProvider } from "./context/CertificateContext";
import CertificateDetails from "./components/CertificateDetails";

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <CertificateProvider>
          <AppLayout />
        </CertificateProvider>
      </AuthProvider>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "register",
        element: <Register />,
        loader: emailLoader,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "nav",
        element: <Navbar />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "user",
        element: (
          <ProtectedRoute userOnly={true} redirectTo="/admin/dashboard" />
        ),
        children: [
          {
            path: "",
            element: <Dashboard />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "certificate/request",
            element: <RequestCertificate />,
          },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute adminOnly={true} redirectTo="/login" />,

        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: "dashboard",
                element: <AdminDashboard />,
              },
              {
                path: "users",
                element: <UserListWithPagination />,
                loader: userLoader,
              },
              {
                path: "certificates",
                element: <Certificates />,
              },
              {
                path: "certificates/issue/:id",
                element: <IssueCertificate />,
              },
              {
                path: "certificates/:id",
                element: <CertificateDetails />,
              },
            ],
          },
        ],
      },
      {
        path: "redirect-by-role",
        element: <RoleBasedRedirect />,
      },
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;

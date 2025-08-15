import { Route, Routes, Link, useLocation, } from "react-router-dom";
import UrlForm from "./Components/UrlForm";
import AdminPage from "./Components/AdminPage";

export default function App() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Enhanced Navigation */}
      <nav className="px-6 py-4 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            URL Shortener
          </Link>
          
          <div className="flex items-center space-x-6 no-underline">
            <NavLink to="/" currentPath={location.pathname} className="no-underline">
              Home
            </NavLink>
            <NavLink to="/admin" currentPath={location.pathname}>
              Admin
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
                <UrlForm />
              </div>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <div className="py-8">
                <AdminPage />
              </div>
            } 
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-gray-800/50 border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} URL Shortener. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Custom NavLink component for active state styling
function NavLink({ to, currentPath, children }) {
  const isActive = currentPath === to;
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 no-underline rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "bg-gray-700 text-white"
          : "text-gray-300 hover:text-white hover:bg-gray-700/50"
      }`}
    >
      {children}
    </Link>
  );
}
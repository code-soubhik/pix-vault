import { useAuth } from '../provider/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-[10vh] bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Pix Vault</h1>
      <div className="flex items-center space-x-4">
        {user && <span>Welcome, {user.email}</span>}
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

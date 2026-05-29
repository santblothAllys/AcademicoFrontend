import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Inicio', icon: '🏠' },
  { path: '/cursos', label: 'Cursos', icon: '📚' },
  { path: '/asignaturas', label: 'Asignaturas', icon: '📖' },
  { path: '/cursos-asignaturas', label: 'Curso-Asignatura', icon: '🔗' },
  { path: '/evaluaciones', label: 'Evaluaciones', icon: '📝' },
  { path: '/notas', label: 'Notas', icon: '📊' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">SmartBook Académico</Link>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-indigo-700'
                    : 'hover:bg-indigo-500'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

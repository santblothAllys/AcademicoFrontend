import { User } from 'lucide-react';

export default function Home() {
  const features = [
    { 
      title: 'Cursos', 
      description: 'Gestiona los cursos académicos, sus descripciones y periodos',
      icon: '📚',
      color: 'bg-indigo-500',
      link: '/cursos'
    },
    { 
      title: 'Asignaturas', 
      description: 'Administra las asignaturas, créditos y descripciones',
      icon: '📖',
      color: 'bg-green-500',
      link: '/asignaturas'
    },
    { 
      title: 'Curso-Asignatura', 
      description: 'Relaciona cursos con asignaturas y asigna docentes',
      icon: '🔗',
      color: 'bg-purple-500',
      link: '/cursos-asignaturas'
    },
    { 
      title: 'Evaluaciones', 
      description: 'Crea y gestiona las evaluaciones de cada asignatura',
      icon: '📝',
      color: 'bg-orange-500',
      link: '/evaluaciones'
    },
    { 
      title: 'Notas', 
      description: 'Registra y gestiona las notas de los estudiantes',
      icon: '📊',
      color: 'bg-red-500',
      link: '/notas'
    },
    { 
      title: 'Estudiantes', 
      description: 'Gestiona la información de los estudiantes',
      icon: '👨‍🎓',
      color: 'bg-blue-500',
      link: '/estudiantes'
    },
    { 
      title: 'Docentes', 
      description: 'Administra los docentes y sus especialidades',
      icon: '👨‍🏫',
      color: 'bg-teal-500',
      link: '/docentes'
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <User size={64} />
          </div>
          <h1 className="text-5xl font-bold mb-4">SmartBook Académico</h1>
          <p className="text-xl opacity-90">
            Sistema de gestión académica completo para instituciones educativas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <a
              key={index}
              href={feature.link}
              className={`${feature.color} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm opacity-90">{feature.description}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Características</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">CRUD Completo</h3>
              <p className="text-gray-600">Operaciones completas de crear, leer, actualizar y eliminar para todas las entidades</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Búsqueda y Filtros</h3>
              <p className="text-gray-600">Busca y filtra rápidamente cualquier información en el sistema</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Notas</h3>
              <p className="text-gray-600">Control completo de evaluaciones y calificaciones de estudiantes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
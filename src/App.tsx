import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cursos from './pages/Cursos';
import Asignaturas from './pages/Asignaturas';
import CursoAsignaturas from './pages/CursoAsignaturas';
import Evaluaciones from './pages/Evaluaciones';
import Notas from './pages/Notas';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/asignaturas" element={<Asignaturas />} />
          <Route path="/cursos-asignaturas" element={<CursoAsignaturas />} />
          <Route path="/evaluaciones" element={<Evaluaciones />} />
          <Route path="/notas" element={<Notas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

export interface Estudiante {
  id?: number;
  nombre: string;
  email: string;
  matricula: string;
  telefono?: string;
}

export interface Docente {
  id?: number;
  nombre: string;
  email: string;
  especialidad?: string;
  telefono?: string;
}

export interface Curso {
  id?: number;
  nombre: string;
  descripcion: string;
  anio: number;
  periodo: string;
}

export interface Asignatura {
  id?: number;
  nombre: string;
  descripcion: string;
  creditos: number;
}

export interface CursoAsignatura {
  id?: number;
  cursoId: number;
  cursoNombre?: string;
  asignaturaId: number;
  asignaturaNombre?: string;
  docenteId: number;
  docenteNombre?: string;
  semestre: string;
}

export interface Evaluacion {
  id?: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  peso: number;
  notaMaxima: number;
  cursoAsignaturaId: number;
}

export interface Nota {
  id?: number;
  estudianteId: number;
  estudianteNombre?: string;
  valor: number;
  evaluacionId: number;
  evaluacionNombre?: string;
}
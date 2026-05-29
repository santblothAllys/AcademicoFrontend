import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, BookOpen } from 'lucide-react';
import { cursoService } from '../services';
import type { Curso } from '../types';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const cursoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().max(500, 'Máximo 500 caracteres'),
  anio: z.number().min(2000, 'Año inválido').max(2100, 'Año inválido'),
  periodo: z.string().min(1, 'El periodo es requerido'),
});

type CursoFormData = z.infer<typeof cursoSchema>;

export default function Cursos() {
  const { showToast } = useToast();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [filteredCursos, setFilteredCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CursoFormData>({
    defaultValues: { anio: new Date().getFullYear() }
  });

  useEffect(() => {
    loadCursos();
  }, []);

  useEffect(() => {
    const filtered = cursos.filter(curso =>
      curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.periodo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.anio.toString().includes(searchTerm)
    );
    setFilteredCursos(filtered);
    setCurrentPage(1);
  }, [searchTerm, cursos]);

  const loadCursos = async () => {
    try {
      setLoading(true);
      const response = await cursoService.getAll();
      setCursos(response.data);
      setFilteredCursos(response.data);
    } catch (error) {
      showToast('error', 'Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CursoFormData) => {
    try {
      if (editingCurso?.id) {
        await cursoService.update(editingCurso.id, { ...data, id: editingCurso.id });
        showToast('success', 'Curso actualizado correctamente');
      } else {
        await cursoService.create(data);
        showToast('success', 'Curso creado correctamente');
      }
      setIsModalOpen(false);
      reset({ anio: new Date().getFullYear() });
      setEditingCurso(null);
      loadCursos();
    } catch (error) {
      showToast('error', 'Error al guardar curso');
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso);
    reset(curso);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este curso?')) {
      try {
        await cursoService.delete(id);
        showToast('success', 'Curso eliminado correctamente');
        loadCursos();
      } catch (error) {
        showToast('error', 'Error al eliminar curso');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCurso(null);
    reset({ anio: new Date().getFullYear() });
  };

  const paginatedCursos = filteredCursos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCursos.length / itemsPerPage) || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={32} className="text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Cursos</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre, descripción, periodo o año..." />
          </div>
          <Button onClick={() => { reset({ anio: new Date().getFullYear() }); setEditingCurso(null); setIsModalOpen(true); }} icon={<Plus size={20} />}>
            Nuevo Curso
          </Button>
        </div>

        {filteredCursos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron cursos
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCursos.map((curso) => (
                    <tr key={curso.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{curso.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{curso.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{curso.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{curso.anio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{curso.periodo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(curso)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(curso.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCurso ? 'Editar Curso' : 'Nuevo Curso'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Nombre" 
            {...register('nombre')} 
            error={errors.nombre?.message} 
            placeholder="Cursos de Ingeniería" 
            maxLength={100}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              {...register('descripcion')}
              placeholder="Descripción detallada del curso"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Año" 
              type="number" 
              {...register('anio', { valueAsNumber: true })} 
              error={errors.anio?.message} 
            />
            <Input 
              label="Periodo" 
              {...register('periodo')} 
              error={errors.periodo?.message} 
              placeholder="2026-1" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingCurso ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
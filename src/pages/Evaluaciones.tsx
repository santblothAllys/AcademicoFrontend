import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, ClipboardCheck } from 'lucide-react';
import { evaluacionService, cursoAsignaturaService } from '../services';
import type { Evaluacion, CursoAsignatura } from '../types';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const evaluacionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().max(500, 'Máximo 500 caracteres'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  peso: z.number().min(0.1, 'El peso debe ser mayor a 0').max(100, 'El peso máximo es 100'),
  notaMaxima: z.number().min(1, 'La nota máxima debe ser mayor a 0'),
  cursoAsignaturaId: z.number().min(1, 'Selecciona un curso-asignatura'),
});

type EvaluacionFormData = z.infer<typeof evaluacionSchema>;

export default function Evaluaciones() {
  const { showToast } = useToast();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [filteredEvaluaciones, setFilteredEvaluaciones] = useState<Evaluacion[]>([]);
  const [cursoAsignaturas, setCursoAsignaturas] = useState<CursoAsignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvaluacion, setEditingEvaluacion] = useState<Evaluacion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EvaluacionFormData>({
    defaultValues: { peso: 10, notaMaxima: 10 }
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const filtered = evaluaciones.filter(evaluacion =>
      evaluacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluacion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluacion.fecha.includes(searchTerm)
    );
    setFilteredEvaluaciones(filtered);
    setCurrentPage(1);
  }, [searchTerm, evaluaciones]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [eResponse, caResponse] = await Promise.all([
        evaluacionService.getAll(),
        cursoAsignaturaService.getAll(),
      ]);
      setEvaluaciones(eResponse.data);
      setFilteredEvaluaciones(eResponse.data);
      setCursoAsignaturas(caResponse.data);
    } catch (error) {
      showToast('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EvaluacionFormData) => {
    try {
      if (editingEvaluacion?.id) {
        await evaluacionService.update(editingEvaluacion.id, { ...data, id: editingEvaluacion.id });
        showToast('success', 'Evaluación actualizada correctamente');
      } else {
        await evaluacionService.create(data);
        showToast('success', 'Evaluación creada correctamente');
      }
      setIsModalOpen(false);
      reset({ peso: 10, notaMaxima: 10 });
      setEditingEvaluacion(null);
      loadAllData();
    } catch (error) {
      showToast('error', 'Error al guardar evaluación');
    }
  };

  const handleEdit = (evaluacion: Evaluacion) => {
    setEditingEvaluacion(evaluacion);
    setValue('nombre', evaluacion.nombre);
    setValue('descripcion', evaluacion.descripcion);
    setValue('fecha', evaluacion.fecha);
    setValue('peso', evaluacion.peso);
    setValue('notaMaxima', evaluacion.notaMaxima);
    setValue('cursoAsignaturaId', evaluacion.cursoAsignaturaId);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta evaluación?')) {
      try {
        await evaluacionService.delete(id);
        showToast('success', 'Evaluación eliminada correctamente');
        loadAllData();
      } catch (error) {
        showToast('error', 'Error al eliminar evaluación');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvaluacion(null);
    reset({ peso: 10, notaMaxima: 10 });
  };

  const paginatedEvaluaciones = filteredEvaluaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredEvaluaciones.length / itemsPerPage) || 1;

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
        <ClipboardCheck size={32} className="text-orange-600" />
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Evaluaciones</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre, descripción o fecha..." />
          </div>
          <Button onClick={() => { reset({ peso: 10, notaMaxima: 10 }); setEditingEvaluacion(null); setIsModalOpen(true); }} icon={<Plus size={20} />}>
            Nueva Evaluación
          </Button>
        </div>

        {filteredEvaluaciones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron evaluaciones
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota Máx</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEvaluaciones.map((evaluacion) => (
                    <tr key={evaluacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evaluacion.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{evaluacion.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{evaluacion.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evaluacion.fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evaluacion.peso}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evaluacion.notaMaxima}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(evaluacion)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(evaluacion.id!)}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEvaluacion ? 'Editar Evaluación' : 'Nueva Evaluación'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Nombre" 
            {...register('nombre')} 
            error={errors.nombre?.message} 
            placeholder="Examen Parcial 1" 
            maxLength={100}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              {...register('descripcion')}
              placeholder="Descripción de la evaluación"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>}
          </div>
          <Input 
            label="Fecha" 
            type="date" 
            {...register('fecha')} 
            error={errors.fecha?.message} 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Peso (%)" 
              type="number" 
              step="0.1"
              {...register('peso', { valueAsNumber: true })} 
              error={errors.peso?.message} 
            />
            <Input 
              label="Nota Máxima" 
              type="number" 
              step="0.1"
              {...register('notaMaxima', { valueAsNumber: true })} 
              error={errors.notaMaxima?.message} 
            />
          </div>
          <Select
            label="Curso-Asignatura"
            {...register('cursoAsignaturaId', { valueAsNumber: true })}
            error={errors.cursoAsignaturaId?.message}
            options={cursoAsignaturas.map(ca => ({ 
              value: ca.id!, 
              label: `${ca.cursoNombre} - ${ca.asignaturaNombre}` 
            }))}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingEvaluacion ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
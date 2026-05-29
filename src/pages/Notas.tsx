import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, BarChart3 } from 'lucide-react';
import { notaService, evaluacionService, estudianteService } from '../services';
import type { Nota, Evaluacion, Estudiante } from '../types';
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

const notaSchema = z.object({
  estudianteId: z.number().min(1, 'Selecciona un estudiante'),
  evaluacionId: z.number().min(1, 'Selecciona una evaluación'),
  valor: z.number().min(0, 'La nota no puede ser negativa'),
});

type NotaFormData = z.infer<typeof notaSchema>;

export default function Notas() {
  const { showToast } = useToast();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [filteredNotas, setFilteredNotas] = useState<Nota[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<NotaFormData>();
  const selectedEvaluacionId = watch('evaluacionId');

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const filtered = notas.filter(nota =>
      nota.estudianteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.evaluacionNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.valor.toString().includes(searchTerm)
    );
    setFilteredNotas(filtered);
    setCurrentPage(1);
  }, [searchTerm, notas]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [nResponse, eResponse, estResponse] = await Promise.all([
        notaService.getAll(),
        evaluacionService.getAll(),
        estudianteService.getAll(),
      ]);
      setNotas(nResponse.data);
      setFilteredNotas(nResponse.data);
      setEvaluaciones(eResponse.data);
      setEstudiantes(estResponse.data);
    } catch (error) {
      showToast('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const selectedEvaluacion = evaluaciones.find(e => e.id === selectedEvaluacionId);

  const onSubmit = async (data: NotaFormData) => {
    try {
      if (editingNota?.id) {
        await notaService.update(editingNota.id, { ...data, id: editingNota.id });
        showToast('success', 'Nota actualizada correctamente');
      } else {
        await notaService.create(data);
        showToast('success', 'Nota creada correctamente');
      }
      setIsModalOpen(false);
      reset();
      setEditingNota(null);
      loadAllData();
    } catch (error) {
      showToast('error', 'Error al guardar nota');
    }
  };

  const handleEdit = (nota: Nota) => {
    setEditingNota(nota);
    setValue('estudianteId', nota.estudianteId);
    setValue('evaluacionId', nota.evaluacionId);
    setValue('valor', nota.valor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta nota?')) {
      try {
        await notaService.delete(id);
        showToast('success', 'Nota eliminada correctamente');
        loadAllData();
      } catch (error) {
        showToast('error', 'Error al eliminar nota');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNota(null);
    reset();
  };

  const paginatedNotas = filteredNotas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredNotas.length / itemsPerPage) || 1;

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
        <BarChart3 size={32} className="text-red-600" />
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Notas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por estudiante, evaluación o valor..." />
          </div>
          <Button onClick={() => { reset(); setEditingNota(null); setIsModalOpen(true); }} icon={<Plus size={20} />}>
            Nueva Nota
          </Button>
        </div>

        {filteredNotas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron notas
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedNotas.map((nota) => (
                    <tr key={nota.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nota.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nota.estudianteNombre || nota.estudianteId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nota.evaluacionNombre || nota.evaluacionId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          nota.valor >= 8 ? 'bg-green-100 text-green-800' :
                          nota.valor >= 6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {nota.valor.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(nota)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(nota.id!)}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingNota ? 'Editar Nota' : 'Nueva Nota'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Evaluación"
            {...register('evaluacionId', { valueAsNumber: true })}
            error={errors.evaluacionId?.message}
            options={evaluaciones.map(e => ({ value: e.id!, label: e.nombre }))}
          />
          <Select
            label="Estudiante"
            {...register('estudianteId', { valueAsNumber: true })}
            error={errors.estudianteId?.message}
            options={estudiantes.map(est => ({ value: est.id!, label: `${est.nombre} (${est.matricula})` }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={selectedEvaluacion?.notaMaxima || 10}
              {...register('valor', { valueAsNumber: true })}
              placeholder="8.5"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.valor ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.valor && <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>}
            {selectedEvaluacion && (
              <p className="mt-1 text-sm text-gray-600">Nota máxima: {selectedEvaluacion.notaMaxima} ({selectedEvaluacion.peso}% del total)</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingNota ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
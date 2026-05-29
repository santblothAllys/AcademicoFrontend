import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Book } from 'lucide-react';
import { asignaturaService } from '../services';
import type { Asignatura } from '../types';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const asignaturaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().max(500, 'Máximo 500 caracteres'),
  creditos: z.number().min(1, 'Mínimo 1 crédito').max(10, 'Máximo 10 créditos'),
});

type AsignaturaFormData = z.infer<typeof asignaturaSchema>;

export default function Asignaturas() {
  const { showToast } = useToast();
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [filteredAsignaturas, setFilteredAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AsignaturaFormData>({
    defaultValues: { creditos: 3 }
  });

  useEffect(() => {
    loadAsignaturas();
  }, []);

  useEffect(() => {
    const filtered = asignaturas.filter(asignatura =>
      asignatura.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asignatura.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAsignaturas(filtered);
    setCurrentPage(1);
  }, [searchTerm, asignaturas]);

  const loadAsignaturas = async () => {
    try {
      setLoading(true);
      const response = await asignaturaService.getAll();
      setAsignaturas(response.data);
      setFilteredAsignaturas(response.data);
    } catch (error) {
      showToast('error', 'Error al cargar asignaturas');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AsignaturaFormData) => {
    try {
      if (editingAsignatura?.id) {
        await asignaturaService.update(editingAsignatura.id, { ...data, id: editingAsignatura.id });
        showToast('success', 'Asignatura actualizada correctamente');
      } else {
        await asignaturaService.create(data);
        showToast('success', 'Asignatura creada correctamente');
      }
      setIsModalOpen(false);
      reset({ creditos: 3 });
      setEditingAsignatura(null);
      loadAsignaturas();
    } catch (error) {
      showToast('error', 'Error al guardar asignatura');
    }
  };

  const handleEdit = (asignatura: Asignatura) => {
    setEditingAsignatura(asignatura);
    reset(asignatura);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta asignatura?')) {
      try {
        await asignaturaService.delete(id);
        showToast('success', 'Asignatura eliminada correctamente');
        loadAsignaturas();
      } catch (error) {
        showToast('error', 'Error al eliminar asignatura');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAsignatura(null);
    reset({ creditos: 3 });
  };

  const paginatedAsignaturas = filteredAsignaturas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredAsignaturas.length / itemsPerPage) || 1;

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
        <Book size={32} className="text-green-600" />
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Asignaturas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre o descripción..." />
          </div>
          <Button onClick={() => { reset({ creditos: 3 }); setEditingAsignatura(null); setIsModalOpen(true); }} icon={<Plus size={20} />}>
            Nueva Asignatura
          </Button>
        </div>

        {filteredAsignaturas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron asignaturas
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAsignaturas.map((asignatura) => (
                    <tr key={asignatura.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asignatura.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asignatura.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{asignatura.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asignatura.creditos}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(asignatura)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(asignatura.id!)}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAsignatura ? 'Editar Asignatura' : 'Nueva Asignatura'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Nombre" 
            {...register('nombre')} 
            error={errors.nombre?.message} 
            placeholder="Cálculo Diferencial" 
            maxLength={100}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              {...register('descripcion')}
              placeholder="Descripción detallada de la asignatura"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>}
          </div>
          <Input 
            label="Créditos" 
            type="number" 
            {...register('creditos', { valueAsNumber: true })} 
            error={errors.creditos?.message} 
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingAsignatura ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
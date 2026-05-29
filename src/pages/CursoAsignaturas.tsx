import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Link2 } from 'lucide-react';
import { cursoAsignaturaService, cursoService, asignaturaService, docenteService } from '../services';
import type { CursoAsignatura, Curso, Asignatura, Docente } from '../types';
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

const cursoAsignaturaSchema = z.object({
  cursoId: z.number().min(1, 'Selecciona un curso'),
  asignaturaId: z.number().min(1, 'Selecciona una asignatura'),
  docenteId: z.number().min(1, 'Selecciona un docente'),
  semestre: z.string().min(1, 'El semestre es requerido'),
});

type CursoAsignaturaFormData = z.infer<typeof cursoAsignaturaSchema>;

export default function CursoAsignaturas() {
  const { showToast } = useToast();
  const [cursoAsignaturas, setCursoAsignaturas] = useState<CursoAsignatura[]>([]);
  const [filteredCursoAsignaturas, setFilteredCursoAsignaturas] = useState<CursoAsignatura[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCursoAsignatura, setEditingCursoAsignatura] = useState<CursoAsignatura | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CursoAsignaturaFormData>();

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const filtered = cursoAsignaturas.filter(ca =>
      ca.cursoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ca.asignaturaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ca.docenteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ca.semestre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCursoAsignaturas(filtered);
    setCurrentPage(1);
  }, [searchTerm, cursoAsignaturas]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [caResponse, cResponse, aResponse, dResponse] = await Promise.all([
        cursoAsignaturaService.getAll(),
        cursoService.getAll(),
        asignaturaService.getAll(),
        docenteService.getAll(),
      ]);
      setCursoAsignaturas(caResponse.data);
      setFilteredCursoAsignaturas(caResponse.data);
      setCursos(cResponse.data);
      setAsignaturas(aResponse.data);
      setDocentes(dResponse.data);
    } catch (error) {
      showToast('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CursoAsignaturaFormData) => {
    try {
      if (editingCursoAsignatura?.id) {
        await cursoAsignaturaService.update(editingCursoAsignatura.id, { ...data, id: editingCursoAsignatura.id });
        showToast('success', 'Relación actualizada correctamente');
      } else {
        await cursoAsignaturaService.create(data);
        showToast('success', 'Relación creada correctamente');
      }
      setIsModalOpen(false);
      reset();
      setEditingCursoAsignatura(null);
      loadAllData();
    } catch (error) {
      showToast('error', 'Error al guardar relación');
    }
  };

  const handleEdit = (cursoAsignatura: CursoAsignatura) => {
    setEditingCursoAsignatura(cursoAsignatura);
    setValue('cursoId', cursoAsignatura.cursoId);
    setValue('asignaturaId', cursoAsignatura.asignaturaId);
    setValue('docenteId', cursoAsignatura.docenteId);
    setValue('semestre', cursoAsignatura.semestre);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta relación?')) {
      try {
        await cursoAsignaturaService.delete(id);
        showToast('success', 'Relación eliminada correctamente');
        loadAllData();
      } catch (error) {
        showToast('error', 'Error al eliminar relación');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCursoAsignatura(null);
    reset();
  };

  const paginatedCursoAsignaturas = filteredCursoAsignaturas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCursoAsignaturas.length / itemsPerPage) || 1;

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
        <Link2 size={32} className="text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Cursos-Asignaturas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por curso, asignatura, docente o semestre..." />
          </div>
          <Button onClick={() => { reset(); setEditingCursoAsignatura(null); setIsModalOpen(true); }} icon={<Plus size={20} />}>
            Nueva Relación
          </Button>
        </div>

        {filteredCursoAsignaturas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron relaciones
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semestre</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCursoAsignaturas.map((ca) => (
                    <tr key={ca.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ca.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ca.cursoNombre || ca.cursoId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ca.asignaturaNombre || ca.asignaturaId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ca.docenteNombre || ca.docenteId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ca.semestre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(ca)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ca.id!)}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCursoAsignatura ? 'Editar Relación' : 'Nueva Relación'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Curso"
            {...register('cursoId', { valueAsNumber: true })}
            error={errors.cursoId?.message}
            options={cursos.map(c => ({ value: c.id!, label: c.nombre }))}
          />
          <Select
            label="Asignatura"
            {...register('asignaturaId', { valueAsNumber: true })}
            error={errors.asignaturaId?.message}
            options={asignaturas.map(a => ({ value: a.id!, label: `${a.nombre} (${a.creditos} créditos)` }))}
          />
          <Select
            label="Docente"
            {...register('docenteId', { valueAsNumber: true })}
            error={errors.docenteId?.message}
            options={docentes.map(d => ({ value: d.id!, label: d.nombre }))}
          />
          <Input
            label="Semestre"
            {...register('semestre')}
            error={errors.semestre?.message}
            placeholder="1"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingCursoAsignatura ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
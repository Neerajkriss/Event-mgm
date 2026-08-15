import { useState } from 'react';
import {
  Tags, Plus, Pencil, Trash2, Calendar,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { Category } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

const iconOptions = ['Music', 'Trophy', 'Palette', 'UtensilsCrossed', 'Briefcase', 'Laptop', 'Camera', 'Gamepad2', 'Heart', 'Star'];

const colorOptions = [
  '#8b5cf6', '#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#0891b2',
  '#db2777', '#ea580c', '#4f46e5', '#0d9488',
];

export default function AdminCategoriesPage() {
  const { categories, events, addCategory, updateCategory, deleteCategory } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: colorOptions[0], icon: iconOptions[0] });
  const [error, setError] = useState('');

  const eventCount = (catId: string) => events.filter((e) => e.categoryId === catId).length;

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', color: colorOptions[0], icon: iconOptions[0] });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description, color: cat.color, icon: cat.icon });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError('Category name must be at least 2 characters.');
      return;
    }
    if (editing) {
      updateCategory(editing.id, { name: form.name.trim(), description: form.description.trim(), color: form.color, icon: form.icon });
    } else {
      addCategory({ name: form.name.trim(), description: form.description.trim(), color: form.color, icon: form.icon });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Categories"
        description="Create, edit, and manage the categories that organize events on the platform."
        icon={<Tags className="h-5 w-5" />}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        }
      />

      {categories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Tags className="h-7 w-7" />}
            title="No categories yet"
            description="Create your first category to start organizing events."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="card group p-5 transition-all duration-200 hover:shadow-cardhover">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                  <Tags className="h-5 w-5" />
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => openEdit(cat)} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Edit category">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="rounded-lg p-2 text-gray-400 transition hover:bg-error-50 hover:text-error-600" aria-label="Delete category">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-gray-900">{cat.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{cat.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="badge bg-gray-100 text-gray-600">
                  <Calendar className="h-3 w-3" />
                  {formatDate(cat.createdAt)}
                </span>
                <span className="text-xs font-medium text-gray-500">{eventCount(cat.id)} events</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
        description={editing ? 'Update the category details below.' : 'Fill in the details to create a new category.'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" type="submit" form="category-form">
              {editing ? 'Save Changes' : 'Create Category'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="cat-name">Category Name</label>
            <input
              id="cat-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Music & Concerts"
              className="input"
              autoFocus
            />
          </div>
          <div>
            <label className="label" htmlFor="cat-desc">Description</label>
            <textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this category"
              rows={3}
              className="input resize-none"
            />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`h-8 w-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${form.icon === ic ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-error-600">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteCategory(deleteId); }}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone. Events in this category will remain but lose their category association."
        confirmLabel="Delete"
      />
    </div>
  );
}

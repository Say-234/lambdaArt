// components/admin/ModuleForm.tsx
"use client";
import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2, FiImage } from 'react-icons/fi';

interface ModuleFormProps {
  module?: any;
  onClose: () => void;
  onSave: (module: any) => void;
  theme: 'light' | 'dark';
}

const themeColors = {
  dark: {
    background: 'bg-[#1A1F16]',
    card: 'bg-[#2D3A25] border-[#3E4C22]',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
    },
    input: 'bg-[#2D3A25] border-[#3E4C22] text-white',
    button: {
      primary: 'bg-[#B08D57] hover:bg-[#8B6B3D] text-white',
      secondary: 'bg-[#2D3A25] hover:bg-[#3E4C22] text-white border border-[#3E4C22]',
    }
  },
  light: {
    background: 'bg-[#F5F1E8]',
    card: 'bg-white border-[#D4B483]',
    text: {
      primary: 'text-[#2D3A25]',
      secondary: 'text-[#5D7B46]',
    },
    input: 'bg-white border-[#D4B483] text-[#2D3A25]',
    button: {
      primary: 'bg-[#5D7B46] hover:bg-[#3E4C22] text-white',
      secondary: 'bg-[#E8DFCA] hover:bg-[#D4B483] text-[#2D3A25] border border-[#D4B483]',
    }
  }
};

export default function ModuleForm({ module, onClose, onSave, theme }: ModuleFormProps) {
  const colors = themeColors[theme];
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDesc: '',
    longDesc: '',
    iconSrc: '',
    price: 0,
    duration: '',
    level: 'débutant',
    category: '',
    featured: false,
    gallery: [] as string[]
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || '',
        slug: module.slug || '',
        shortDesc: module.shortDesc || '',
        longDesc: module.longDesc || '',
        iconSrc: module.iconSrc || '',
        price: module.price || 0,
        duration: module.duration || '',
        level: module.level || 'débutant',
        category: module.category || '',
        featured: module.featured || false,
        gallery: module.gallery || []
      });
    }
  }, [module]);

  const handleImageUpload = async (file: File, isIcon: boolean = false) => {
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      if (isIcon) {
        setFormData(prev => ({ ...prev, iconSrc: data.url }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          gallery: [...prev.gallery, data.url] 
        }));
      }

    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageDelete = async (imageUrl: string, index: number) => {
    if (confirm('Supprimer cette image ? Elle sera également supprimée de Cloudinary.')) {
      try {
        // Supprimer de Cloudinary
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        });

        // Supprimer de la gallery
        setFormData(prev => ({
          ...prev,
          gallery: prev.gallery.filter((_, i) => i !== index)
        }));

      } catch (error) {
        console.error('Erreur suppression image:', error);
        alert('Erreur lors de la suppression de l\'image');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: module?.id,
      createdAt: module?.createdAt || new Date(),
      updatedAt: new Date()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto ${colors.card} border`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${colors.text.primary}`}>
            {module ? 'Modifier le module' : 'Nouveau module'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${colors.button.secondary}`}
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                Titre *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full p-3 rounded-lg border ${colors.input}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className={`w-full p-3 rounded-lg border ${colors.input}`}
                placeholder="nom-du-module"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
              Description courte *
            </label>
            <textarea
              required
              value={formData.shortDesc}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDesc: e.target.value }))}
              rows={3}
              className={`w-full p-3 rounded-lg border ${colors.input}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
              Description longue
            </label>
            <textarea
              value={formData.longDesc}
              onChange={(e) => setFormData(prev => ({ ...prev, longDesc: e.target.value }))}
              rows={4}
              className={`w-full p-3 rounded-lg border ${colors.input}`}
            />
          </div>

          {/* Upload Icone */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
              Icône du module
            </label>
            <div className="flex items-center gap-4">
              {formData.iconSrc && (
                <img 
                  src={formData.iconSrc} 
                  alt="Icône" 
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${colors.button.secondary}`}>
                <FiUpload />
                {uploading ? 'Upload...' : 'Choisir une icône'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, true);
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Gallery d'images */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
              Gallery d'images
            </label>
            
            {/* Images existantes */}
            {formData.gallery.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.gallery.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Gallery ${index}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleGalleryImageDelete(image, index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload nouvelle image */}
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer w-fit ${colors.button.secondary}`}>
              <FiImage />
              {uploading ? 'Upload...' : 'Ajouter une image à la gallery'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, false);
                }}
                disabled={uploading}
              />
            </label>
          </div>

          {uploadError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                Prix (FCFA) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                className={`w-full p-3 rounded-lg border ${colors.input}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                Durée *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className={`w-full p-3 rounded-lg border ${colors.input}`}
                placeholder="ex: 6 semaines"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                Niveau *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className={`w-full p-3 rounded-lg border ${colors.input}`}
              >
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                Catégorie *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full p-3 rounded-lg border ${colors.input}`}
                placeholder="ex: textile, artisanat..."
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className={colors.text.primary}>Module en vedette</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg ${colors.button.secondary}`}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg ${colors.button.primary}`}
              disabled={uploading}
            >
              {module ? 'Modifier' : 'Créer'} le module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
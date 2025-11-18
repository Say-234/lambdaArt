'use client';
import { useState } from 'react';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<string>;
  existingImages: string[];
  onDeleteImage: (url: string) => Promise<void>;
}

export default function ImageUploader({ onUpload, existingImages = [], onDeleteImage }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      await onUpload(file);
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Échec du téléchargement de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    try {
      await onDeleteImage(url);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Échec de la suppression de l\'image');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Galerie d'images
        </label>
        <div className="grid grid-cols-3 gap-4">
          {existingImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Galerie ${index}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleDelete(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Supprimer l'image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Ajouter des images
        </label>
        <div className="flex items-center">
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300">
            <span>{isUploading ? 'Téléchargement...' : 'Sélectionner des images'}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
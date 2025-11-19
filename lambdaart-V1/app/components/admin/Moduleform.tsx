// app/components/admin/ModuleForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { doc, setDoc, addDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Assure-toi que 'storage' n'est PAS importé ici
import './moduleform.css';
// import { useAuth } from '../../hooks/useAuth'; // Pas directement utilisé dans le formulaire

interface ModuleFormProps {
  module?: any;
  onClose: () => void;
  onSave: (module: any) => void;
}

export default function ModuleForm({ module, onClose, onSave }: ModuleFormProps) {
  const [formData, setFormData] = useState({
    slug: module?.slug || '',
    title: module?.title || '',
    shortDesc: module?.shortDesc || '',
    longDesc: module?.longDesc || '',
    iconSrc: module?.iconSrc || '',
    gallery: module?.gallery || []
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false); // Renommé 'isUploading' pour les fichiers
  const [isSavingModule, setIsSavingModule] = useState(false); // Pour la sauvegarde Firestore
  const [errors, setErrors] = useState({
    slug: '',
    title: '',
    shortDesc: '',
    longDesc: '',
    iconSrc: '',
    gallery: ''
  });
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null); // Pour les erreurs d'upload d'images
  const [history, setHistory] = useState<string[][]>([]); // Pour l'historique de la galerie
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (module?.gallery) {
      setHistory([module.gallery]);
      setHistoryIndex(0);
    } else {
      setHistory([[]]); // Initialise avec une galerie vide
      setHistoryIndex(0);
    }
  }, [module]);

  const withRetry = async <T,>(fn: () => Promise<T>, retries = 3): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      return withRetry(fn, retries - 1);
    }
  };

  const checkConnection = async () => {
    try {
      await withRetry(() => getDocs(collection(db, 'modules')));
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {
      slug: !formData.slug ? 'Le slug est requis' :
            !/^[a-z0-9-]+$/.test(formData.slug) ? 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets' : '',
      title: !formData.title ? 'Le titre est requis' : '',
      shortDesc: !formData.shortDesc ? 'La description courte est requise' :
                  formData.shortDesc.length > 160 ? 'Maximum 160 caractères' : '',
      longDesc: !formData.longDesc ? 'La description longue est requise' : '',
      iconSrc: '', // On ne valide plus l'URL ici car elle vient de l'upload
      gallery: '' // On ne valide plus l'URL ici
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const updateGallery = (newGallery: string[]) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newGallery];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFormData({ ...formData, gallery: history[historyIndex - 1] });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFormData({ ...formData, gallery: history[historyIndex + 1] });
    }
  };

  // NOUVELLE FONCTION: Gérer l'upload de fichier via l'API Vercel
  const handleFileUpload = async (file: File) => {
    setUploadError(null); // Réinitialise l'erreur d'upload
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('file', file); // 'file' doit correspondre au nom attendu par l'API (req.file ou req.files.file)

      const response = await fetch('/api/upload-image', { // L'URL de ta Serverless Function
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'upload de l\'image.');
      }

      const result = await response.json();
      return result.url; // Retourne l'URL de l'image de Cloudinary

    } catch (error: any) {
      console.error('Erreur lors de l\'upload de fichier:', error);
      setUploadError(error.message || 'Échec de l\'upload de l\'image. Veuillez réessayer.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSavingModule(true); // Active l'état de sauvegarde du module
    setFirebaseError(null);
    setUploadError(null); // Efface les erreurs d'upload précédentes

    try {
      if (!await checkConnection()) {
        setFirebaseError('Aucune connexion internet. Veuillez vérifier votre réseau.');
        return;
      }

      let iconUrl = formData.iconSrc;
      if (iconFile) {
        const uploadedIconUrl = await handleFileUpload(iconFile);
        if (!uploadedIconUrl) {
          setIsSavingModule(false);
          return; // Arrête la sauvegarde si l'upload échoue
        }
        iconUrl = uploadedIconUrl;
      }

      let galleryUrls = [...formData.gallery];
      if (galleryFiles.length > 0) {
        const uploadedGalleryUrls = await Promise.all(
          galleryFiles.map(file => handleFileUpload(file))
        );
        const successfulUploads = uploadedGalleryUrls.filter(url => url !== null) as string[];
        if (successfulUploads.length !== galleryFiles.length) {
          setUploadError('Certaines images de la galerie n\'ont pas pu être uploadées.');
          setIsSavingModule(false);
          return;
        }
        galleryUrls = [...galleryUrls, ...successfulUploads];
      }

      const moduleToSave = {
        ...formData,
        iconSrc: iconUrl,
        gallery: galleryUrls,
      };

      if (module?.id) {
        await updateDoc(doc(db, 'modules', module.id), moduleToSave);
        onSave({ id: module.id, ...moduleToSave });
      } else {
        const docRef = await addDoc(collection(db, 'modules'), moduleToSave);
        onSave({ id: docRef.id, ...moduleToSave });
      }

      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du module:', error);
      setFirebaseError(error.message || 'Échec de la sauvegarde du module. Veuillez réessayer.');
    } finally {
      setIsSavingModule(false); // Désactive l'état de sauvegarde du module
    }
  };

  const removeGalleryImage = (index: number) => {
    // Ici, on ne supprime que l'URL de la liste, pas l'image de Cloudinary
    // La suppression d'images de Cloudinary nécessiterait une autre fonction API.
    updateGallery(formData.gallery.filter((_: string, i: number) => i !== index));
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {module ? 'Modifier le module' : 'Ajouter un nouveau module'}
          </h2>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        {(firebaseError || uploadError) && (
          <div className="error-alert">
            {firebaseError || uploadError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="module-form">
          <div className="form-group">
            <label className="form-label">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className={`form-input ${errors.slug ? 'form-error' : ''}`}
              title="Slug du module"
              placeholder="Entrez le slug du module (ex: perlage)"
              required
            />
            {errors.slug && <p className="error-message">{errors.slug}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Titre</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`form-input ${errors.title ? 'form-error' : ''}`}
              title="Titre du module"
              placeholder="Entrez le titre du module"
              required
            />
            {errors.title && <p className="error-message">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description courte</label>
            <textarea
              name="shortDesc"
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              className={`form-input form-textarea ${errors.shortDesc ? 'form-error' : ''}`}
              rows={2}
              placeholder="Entrez une description courte (max 160 caractères)"
              title="Description courte"
              required
            />
            {errors.shortDesc && <p className="error-message">{errors.shortDesc}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description longue</label>
            <textarea
              name="longDesc"
              value={formData.longDesc}
              onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
              className={`form-input form-textarea ${errors.longDesc ? 'form-error' : ''}`}
              rows={4}
              placeholder="Entrez une description longue"
              title="Description longue"
              required
            />
            {errors.longDesc && <p className="error-message">{errors.longDesc}</p>}
          </div>

          {/* CHAMP POUR L'UPLOAD DE L'ICÔNE */}
          <div className="form-group">
            <label className="form-label">Icône (fichier image)</label>
            <div className="file-upload">
              {formData.iconSrc && (
                <img src={formData.iconSrc} alt="Icône actuelle" className="file-preview" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="file-input"
                title="Sélectionner une icône"
              />
            </div>
          </div>

          {/* CHAMP POUR L'UPLOAD DES IMAGES DE LA GALERIE */}
          <div className="form-group">
            <label className="form-label">Galerie d'images (fichiers images)</label>
            <div className="gallery-controls">
              <button
                type="button"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="undo-redo-button"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="undo-redo-button"
              >
                Rétablir
              </button>
            </div>
            <div className="gallery-grid">
              {formData.gallery.map((img: string, index: number) => (
                <div key={index} className="gallery-item">
                  <img src={img} alt={`Gallery ${index}`} className="gallery-image" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="delete-image-button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple // Permet de sélectionner plusieurs fichiers
              onChange={(e) => {
                if (e.target.files) {
                  setGalleryFiles(Array.from(e.target.files));
                }
              }}
              className="form-input"
              title="Ajouter une image à la galerie"
            />
          </div>

          <div className="preview-section">
            <h3 className="preview-title">Prévisualisation</h3>
            <div className="preview-content">
              <h4 className="preview-heading">{formData.title || "(Aucun titre)"}</h4>
              <p className="preview-text">{formData.shortDesc || "(Aucune description courte)"}</p>
              {formData.iconSrc && (
                <img src={formData.iconSrc} alt="Preview icon" className="preview-icon" />
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUploading || isSavingModule} // Désactive pendant l'upload ET la sauvegarde
              className="submit-button"
            >
              {isUploading ? 'Upload en cours...' : (isSavingModule ? 'Enregistrement...' : 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
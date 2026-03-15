import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ImageUpload = ({ value, onChange, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux. Maximum 10MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Construct full URL
      const imageUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
      onChange(imageUrl);
      toast.success('Image téléchargée avec succès!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        data-testid="image-file-input"
      />

      {value ? (
        <div className="relative group" data-testid="image-preview-container">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover border border-white/10"
            data-testid="image-preview"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              className="border-white text-white hover:bg-white hover:text-black"
              data-testid="change-image-btn"
            >
              <Upload className="w-4 h-4 mr-2" />
              Changer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              data-testid="remove-image-btn"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            w-full h-48 border-2 border-dashed rounded-none cursor-pointer
            flex flex-col items-center justify-center gap-3 transition-all
            ${dragOver 
              ? 'border-[#d4af37] bg-[#d4af37]/10' 
              : 'border-white/20 hover:border-[#d4af37]/50 bg-white/5'
            }
            ${uploading ? 'pointer-events-none' : ''}
          `}
          data-testid="image-drop-zone"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
              <span className="text-white/50 text-sm">Téléchargement...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-white/30" />
              <div className="text-center">
                <p className="text-white/70 text-sm">
                  Glissez une image ici ou <span className="text-[#d4af37]">cliquez pour parcourir</span>
                </p>
                <p className="text-white/30 text-xs mt-1">
                  JPG, PNG, GIF, WebP • Max 10MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

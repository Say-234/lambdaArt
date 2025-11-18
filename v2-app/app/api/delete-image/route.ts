// app/api/delete-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ success: false, message: 'Aucune URL fournie.' }, { status: 400 });
    }

    // Extraire le public_id de l'URL Cloudinary
    const urlParts = imageUrl.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileNameWithExtension.split('.')[0];
    const fullPublicId = `lambda-art-modules/${publicId}`;

    console.log('Suppression Cloudinary - Public ID:', fullPublicId);

    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(fullPublicId);

    if (result.result === 'ok') {
      return NextResponse.json({ 
        success: true, 
        message: 'Image supprimée avec succès' 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Échec de la suppression sur Cloudinary' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erreur lors de la suppression Cloudinary:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Échec de la suppression de l\'image.' 
    }, { status: 500 });
  }
}
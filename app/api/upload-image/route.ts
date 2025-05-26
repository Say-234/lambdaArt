// app/api/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  api_environment_variable: process.env.CLOUDINARY_API_ENVIRONMENT_VARIABLE || 'production',
});

export async function POST(request: NextRequest) {
  try {
    // Le corps de la requête est déjà un FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null; // Assurez-vous que le nom correspond à ce que vous envoyez

    if (!file) {
      return NextResponse.json({ success: false, message: 'Aucun fichier fourni.' }, { status: 400 });
    }

    // Convertir le File en Buffer pour l'upload Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Uploader le fichier vers Cloudinary
    // Utiliser 'buffer' comme source pour l'upload
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        folder: 'lambda-art-modules',
        resource_type: "auto"
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(buffer);
    });

    if (!result || typeof result !== 'object' || !('secure_url' in result)) {
      throw new Error("Cloudinary upload did not return a valid secure_url");
    }

    return NextResponse.json({ success: true, url: (result as any).secure_url }, { status: 200 });

  } catch (error: any) {
    console.error('Erreur lors de l\'upload vers Cloudinary:', error);
    return NextResponse.json({ success: false, message: error.message || 'Échec de l\'upload de l\'image.' }, { status: 500 });
  }
}
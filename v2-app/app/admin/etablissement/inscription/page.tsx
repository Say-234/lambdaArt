
import { Suspense } from 'react'
import InscriptionClientPage from './InscriptionClientPage'

function InscriptionPageFallback() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#B08D57] mx-auto"></div>
          <p className="mt-4">Vérification du lien d'invitation...</p>
        </div>
      </div>
    );
}

export default function InscriptionEtablissementPage() {
  return (
    <Suspense fallback={<InscriptionPageFallback />}>
      <InscriptionClientPage />
    </Suspense>
  )
}

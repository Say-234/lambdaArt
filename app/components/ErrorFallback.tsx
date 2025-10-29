'use client';

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oups ! Une erreur est survenue</h2>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
            <p className="font-medium text-red-800">Détails de l'erreur :</p>
            <p className="text-red-700 mt-1 text-sm">{error.message || 'Erreur inconnue'}</p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Code d'erreur : {error.digest}
              </p>
            )}
          </div>

          <p className="mb-6 text-gray-700">
            Désolé, une erreur s'est produite lors du chargement de la page.
            Veuillez réessayer ou contacter le support si le problème persiste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetErrorBoundary}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Réessayer
            </button>
            
            <a
              href="/"
              className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Retour à l'accueil
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Si le problème persiste, contactez-nous à l'adresse{' '}
              <a href="mailto:support@lambdaart.com" className="text-blue-600 hover:underline">
                support@lambdaart.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

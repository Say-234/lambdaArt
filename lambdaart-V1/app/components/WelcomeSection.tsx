import Link from 'next/link';

interface WelcomeSectionProps {
  scrollToRegistrationForm: () => void;
}

export default function WelcomeSection({ scrollToRegistrationForm }: WelcomeSectionProps) {
  return (
    <section className="bg-white py-xl px-md text-center shadow-sm">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-title text-primary text-4xl mb-md">Bienvenue chez Lambda'Art</h2>
        <p className="text-dark text-lg mb-lg leading-relaxed">
          Un espace de formation et d'expression dédié à toutes les formes de savoir-faire pratiques. Des activités manuelles et créatives, aux réalisations artisanales en passant par des techniques avancées proches des métiers d'usine et de production, nous vous offrons des ateliers accessibles, vivants et adaptés à tous les niveaux.<br />Que vous souhaitiez apprendre un métier de vos mains, découvrir une passion ou développer des compétences utiles et monétisables, Lambda’Art vous accompagne pas à pas dans un cadre convivial et motivant.
        </p>
        <p className="text-dark text-lg mb-lg leading-relaxed">
          Rejoignez une communauté dynamique et bienveillante de passionnés, de curieux et de créateurs. Avec Lambda’Art, révélez votre potentiel et construisez votre estime personnelle grâce à vos talents pratiques.
        </p>
        <Link 
          href="#inscription-form" 
          onClick={scrollToRegistrationForm} 
          className="inline-block bg-primary text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:bg-dark hover:-translate-y-1 transition-all duration-300"
        >
          Je m'inscris
        </Link>
      </div>
    </section>
  );
}
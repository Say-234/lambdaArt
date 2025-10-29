import Link from 'next/link';

interface WelcomeSectionProps {
  scrollToRegistrationForm: () => void;
}

export default function WelcomeSection({ scrollToRegistrationForm }: WelcomeSectionProps) {
  return (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2>Bienvenue chez Lambda'Art</h2>
        <p>Un espace de formation et d'expression dédié à toutes les formes de savoir-faire pratiques. Des activités manuelles et créatives, aux réalisations artisanales en passant par des techniques avancées proches des métiers d'usine et de production, nous vous offrons des ateliers accessibles, vivants et adaptés à tous les niveaux.<br />Que vous souhaitiez apprendre un métier de vos mains, découvrir une passion ou développer des compétences utiles et monétisables, Lambda’Art vous accompagne pas à pas dans un cadre convivial et motivant.</p>
        <p>Rejoignez une communauté dynamique et bienveillante de passionnés, de curieux et de créateurs. Avec Lambda’Art, révélez votre potentiel et construisez votre estime personnelle grâce à vos talents pratiques.</p>
        <Link href="#inscription-form" onClick={scrollToRegistrationForm} className="cta-button">
          Je m'inscris
        </Link>
      </div>
    </section>
  );
}
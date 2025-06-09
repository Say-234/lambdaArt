// app/components/ModuleCard.tsx
import Image from 'next/image';
import Link from 'next/link';

interface Module {
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
}

interface Props {
  module: Module;
}

const ModuleCard: React.FC<Props> = ({ module }) => {
  return (
    // Envelopper toute la carte dans un Link
    <Link href={`/modules/${module.slug}`} passHref>
      {/* Utilisation de 'passHref' est une bonne pratique avec un composant enfant comme div */}
      {/* On peut ajouter une classe pour styler la carte comme un lien cliquable si nécessaire */}
      <div className="module-card clickable-card" data-module={module.slug}>
        <div className="module-header">
          {/* L'Image est maintenant à l'intérieur du Link */}
          <Image src={module.iconSrc} alt={module.title} className="module-icon" width={50} height={50} />
          <div className="module-title-content"> {/* Renommé pour éviter le conflit avec la classe "module-title" du h3 */}
            <h3>{module.title}</h3>
            <p className="short-desc">{module.shortDesc}</p>
          </div>
          {/* Le bouton '+' est supprimé */}
        </div>
      </div>
    </Link>
  );
};

export default ModuleCard;
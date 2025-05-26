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
    <div className="module-card" data-module={module.slug}>
      <div className="module-header">
        <Image src={module.iconSrc} alt={module.title} className="module-icon" width={50} height={50} />
        <div className="module-title">
          <h3>{module.title}</h3>
          <p className="short-desc">{module.shortDesc}</p>
        </div>
        <Link href={`/modules/${module.slug}`} className="toggle-btn" aria-label={`Voir les détails de ${module.title}`}>
          +
        </Link>
      </div>
    </div>
  );
};

export default ModuleCard;
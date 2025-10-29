import ModulesCard from './ModulesCard';

interface Module {
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
}

interface ModulesListProps {
  modulesData: Module[];
}

export default function ModulesList({ modulesData }: ModulesListProps) {
  return (
    <section className="module-list">
      {modulesData.length > 0 ? (
        modulesData.map((module) => (
          <ModulesCard key={module.slug} module={module} />
        ))
      ) : (
        <p>Aucun module disponible pour le moment.</p>
      )}
    </section>
  );
}
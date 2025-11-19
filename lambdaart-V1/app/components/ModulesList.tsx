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
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg max-w-6xl mx-auto px-md">
      {modulesData.length > 0 ? (
        modulesData.map((module) => (
          <ModulesCard key={module.slug} module={module} />
        ))
      ) : (
        <p className="text-center col-span-full">Aucun module disponible pour le moment.</p>
      )}
    </section>
  );
}
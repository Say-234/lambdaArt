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
    <Link href={`/modules/${module.slug}`} passHref>
      <div className="bg-white rounded-lg shadow-sm p-md flex flex-col justify-between h-full cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center mb-sm">
          <Image 
            src={module.iconSrc} 
            alt={module.title} 
            className="w-16 h-16 rounded-full object-cover mr-md border-2 border-accent"
            width={64} 
            height={64} 
          />
          <div>
            <h3 className="font-title text-primary text-xl mb-xs">{module.title}</h3>
            <p className="text-dark text-sm">{module.shortDesc}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ModuleCard;
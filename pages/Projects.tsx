
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { projects } from '../data/projects';
import { site } from '../data/site';
import ProjectCard from '../components/ProjectCard';

const Projects: React.FC = () => {
   return (
      <div className="min-h-screen bg-paper dark:bg-night">
         <div className="max-w-6xl mx-auto px-6 pt-32 pb-16 md:pt-40">
            <Link to="/" className="reveal inline-flex items-center gap-1.5 text-[13px] font-bold text-muted dark:text-slate-400 hover:text-brand transition-colors mb-8">
               <ArrowLeft size={15} /> 홈으로
            </Link>

            <p className="reveal reveal-1 text-xs font-black tracking-[0.25em] text-brand mb-4">{site.eyebrow}</p>
            <h1 className="reveal reveal-2 text-3xl md:text-5xl font-black text-ink dark:text-white tracking-tight mb-4">
               모든 프로젝트
            </h1>
            <p className="reveal reveal-3 text-base text-muted dark:text-slate-400 leading-relaxed mb-12 max-w-xl">
               지금까지 만든 작업의 전체 목록입니다. 카드를 누르면 서비스나 저장소로 이동합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {projects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} className={`reveal reveal-${Math.min(i + 1, 6)}`} />
               ))}
            </div>
         </div>
      </div>
   );
};

export default Projects;

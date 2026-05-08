import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogProps {
  posts: BlogPost[];
}

export const Blog: React.FC<BlogProps> = ({ posts }) => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        <Link 
          to="/"
          className="mb-8 text-accent hover:underline flex items-center group font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            Local SEO Insights
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            Expert guides, strategies, and industry news to help your small business dominate local search results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`h-full ${idx === 0 ? 'md:col-span-2' : ''}`}
            >
              <Link
                to={`/blog/${post.slug}`}
                className={`glass-panel group cursor-pointer hover:border-accent/30 transition-all flex h-full overflow-hidden ${idx === 0 ? 'flex-col md:flex-row' : 'flex-col'}`}
              >
              <div className={`${idx === 0 ? 'md:w-1/2 aspect-video md:aspect-auto' : 'aspect-video'} relative overflow-hidden`}>
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <span className="bg-accent text-slate-950 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {idx === 0 ? 'Featured Post' : post.tags[0]}
                  </span>
                </div>
              </div>
              
              <div className={`p-8 flex flex-col flex-grow ${idx === 0 ? 'md:w-1/2' : ''}`}>
                <div className="flex items-center space-x-4 text-[10px] text-white/30 uppercase tracking-widest mb-4">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {post.date}</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {idx === 0 ? '15' : '10'} min read</span>
                </div>
                <h3 className={`${idx === 0 ? 'text-2xl md:text-3xl' : 'text-xl'} font-bold mb-4 group-hover:text-accent transition-colors leading-tight`}>
                  {post.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-8 line-clamp-4">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center text-accent text-[10px] font-bold uppercase tracking-widest pt-6 border-t border-white/5">
                  Read Full Article <ArrowLeft className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform rotate-180" />
                </div>
              </div>
            </Link>
          </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

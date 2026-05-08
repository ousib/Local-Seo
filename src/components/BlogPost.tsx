import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, Bookmark } from 'lucide-react';
import { BlogPost } from '../types';
import { blogPosts } from '../data/blogPosts';

export const BlogPostComponent: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  const [readingProgress, setReadingProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <p className="text-white/50 mb-8">The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="px-8 py-4 bg-accent text-slate-950 font-bold rounded-2xl">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-[#0b0e14]">
      {/* Reading Progress Bar */}
      <div className="fixed top-24 left-0 w-full h-1 z-[60] pointer-events-none">
        <motion.div 
          className="h-full bg-accent shadow-[0_0_10px_rgba(76,201,240,0.5)]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 py-4 px-8 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            to="/blog"
            className="text-white/40 hover:text-white flex items-center text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-accent">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-accent">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-4 text-[10px] font-bold text-accent uppercase tracking-widest mb-6">
            <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">{post.tags[0]}</span>
            <span className="flex items-center text-white/30"><Calendar className="w-3 h-3 mr-1" /> {post.date}</span>
            <span className="flex items-center text-white/30"><Clock className="w-3 h-3 mr-1" /> 12 min read</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center space-x-4 mb-12 py-6 border-y border-white/5">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold">{post.author}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest">SEO Strategist</div>
            </div>
          </div>

          <div className="aspect-[21/9] rounded-[40px] overflow-hidden mb-16 border border-white/10">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="prose prose-invert prose-lg max-w-none pt-8 border-t border-white/5">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <div className="mt-20 p-10 glass-panel rounded-[40px] text-center border-accent/20 border">
            <h3 className="text-2xl font-bold mb-4 text-white">Dominate Your Local Market</h3>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Want to improve your local rankings faster? Try our Local SEO platform today and start appearing in front of customers.
            </p>
            <Link 
              to="/"
              className="inline-block px-8 py-4 bg-accent text-slate-950 font-bold rounded-2xl uppercase tracking-widest hover:bg-accent/90 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>
      </article>

      <footer className="max-w-4xl mx-auto px-8 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <button className="text-white/40 hover:text-white transition-colors cursor-pointer"><Facebook className="w-5 h-5" /></button>
            <button className="text-white/40 hover:text-white transition-colors cursor-pointer"><Twitter className="w-5 h-5" /></button>
            <button className="text-white/40 hover:text-white transition-colors cursor-pointer"><Linkedin className="w-5 h-5" /></button>
          </div>
          <p className="text-white/20 text-xs uppercase tracking-widest font-bold">
            © 2026 LocalSEO AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

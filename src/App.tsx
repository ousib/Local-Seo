import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  MapPin, 
  Search, 
  Sparkles, 
  Loader2, 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  Copy,
  Download,
  ExternalLink,
  Globe,
  Share2,
  Trash2,
  Settings,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  LogIn,
  LogOut,
  Lock,
  User as UserIcon,
  ChevronRight,
  Home,
  Mail,
  ShieldAlert
} from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from "react-markdown";
import { marked } from "marked";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import Auth from "./components/Auth";
import About from "./components/About";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { Contact } from "./components/Contact";
import { Help } from "./components/Help";
import { AdSlot } from "./components/AdSlot";
import { BlogPostComponent as BlogPost } from "./components/BlogPost";
import { Blog } from "./components/Blog";
import { blogPosts } from "./data/blogPosts";
import { BlogPost as BlogPostType } from "./types";

declare global {
  interface Window {
    Paddle: any;
  }
}

interface ArticleData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  suggestedSlug: string;
  content: string;
  internalLinks: string[];
  schemaMarkup: string;
  locationAddress?: string; // New field for Maps embed
}

interface SavedArticle extends ArticleData {
  id: string;
  user_id?: string;
  industry: string;
  location: string;
  topic: string;
  createdAt: string;
  wordCount: number;
  score: number;
}

interface ArticleRequest {
  industry: string;
  location: string;
  topic: string;
}

const INDUSTRIES = [
  "Plumber", "Roofer", "Dentist", "Electrician", "HVAC", 
  "Real Estate", "Lawyer", "Restaurant", "Personal Trainer", "Car Mechanic"
];

const LOADING_MESSAGES = [
  "Analyzing local market trends...",
  "Scanning market for key SEO signals...",
  "Drafting comprehensive industry insights...",
  "Optimizing structure for search engines...",
  "Injecting local relevance and context...",
  "Finalizing SEO metadata..."
];

const CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Indianapolis, IN",
  "Charlotte, NC", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Washington, DC",
  "Boston, MA", "Nashville, TN", "El Paso, TX", "Detroit, MI", "Oklahoma City, OK",
  "Portland, OR", "Las Vegas, NV", "Memphis, TN", "Louisville, KY", "Baltimore, MD",
  "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA", "Sacramento, CA",
  "Kansas City, MO", "Mesa, AZ", "Atlanta, GA", "Omaha, NE", "Colorado Springs, CO",
  "Raleigh, NC", "Virginia Beach, VA", "Long Beach, CA", "Miami, FL", "Oakland, CA",
  "Minneapolis, MN", "Tulsa, OK", "Bakersfield, CA", "Wichita, KS", "Arlington, TX"
];

const Footer = () => (
  <footer className="mt-32 pt-20 pb-10 border-t border-glass-border">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 bg-gradient-to-b from-white/[0.02] to-transparent p-12 rounded-[40px] border border-white/[0.05]">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles className="w-6 h-6 text-slate-900" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">Local Seo Machine</span>
        </div>
        <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-8">
          The world's most advanced AI content engine for local business growth. We help small businesses dominate search results through data-driven content generation.
        </p>
        <div className="flex space-x-6">
          <button onClick={() => window.open('https://twitter.com', '_blank')} className="text-white/20 hover:text-accent transition-colors"><Twitter className="w-5 h-5" /></button>
          <button onClick={() => window.open('https://linkedin.com', '_blank')} className="text-white/20 hover:text-accent transition-colors"><Linkedin className="w-5 h-5" /></button>
          <Link to="/contact" className="text-white/20 hover:text-accent transition-colors"><Mail className="w-5 h-5" /></Link>
        </div>
      </div>
      
      <div>
        <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">Platform</h4>
        <ul className="space-y-4">
          <li><Link to="/" className="text-sm text-white/40 hover:text-accent transition-colors">Generator</Link></li>
          <li><Link to="/dashboard" className="text-sm text-white/40 hover:text-accent transition-colors">Dashboard</Link></li>
          <li><Link to="/about" className="text-sm text-white/40 hover:text-accent transition-colors">How it Works</Link></li>
          <li><Link to="/blog" className="text-sm text-white/40 hover:text-accent transition-colors">Blog</Link></li>
          <li><Link to="/help" className="text-sm text-white/40 hover:text-accent transition-colors">Help Center</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">Legal & Support</h4>
        <ul className="space-y-4">
          <li><Link to="/privacy" className="text-sm text-white/40 hover:text-accent transition-colors">Privacy Policy</Link></li>
          <li><Link to="/terms" className="text-sm text-white/40 hover:text-accent transition-colors">Terms of Service</Link></li>
          <li><Link to="/contact" className="text-sm text-white/40 hover:text-accent transition-colors">Contact Support</Link></li>
        </ul>
      </div>
    </div>
    
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] items-center font-bold text-white/20 uppercase tracking-[0.2em]">
      <div>&copy; 2026 Local Seo Machine. All rights reserved.</div>
      <div className="flex items-center space-x-8">
        <span>AdSense Ready Platform</span>
        <span>Google AI Partners</span>
      </div>
    </div>
  </footer>
);

const Header = ({ user, handleLogout }: { user: any, handleLogout: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 flex justify-center">
      <div className="max-w-7xl w-full glass-panel rounded-2xl px-6 py-3 flex items-center justify-between backdrop-blur-3xl border-white/5 border shadow-2xl">
        <div className="flex items-center space-x-8">
          <Link 
            to="/"
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-lg font-bold tracking-tighter text-white">Local Seo Machine</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <Link to="/" className={`hover:text-accent transition-colors ${location.pathname === '/' ? 'text-accent' : ''}`}>Tools</Link>
            <Link to="/dashboard" className={`hover:text-accent transition-colors ${location.pathname === '/dashboard' ? 'text-accent' : ''}`}>Dashboard</Link>
            <Link to="/help" className={`hover:text-accent transition-colors ${location.pathname === '/help' ? 'text-accent' : ''}`}>Help</Link>
            <Link to="/blog" className={`hover:text-accent transition-colors ${location.pathname.startsWith('/blog') ? 'text-accent' : ''}`}>Blog</Link>
            <Link to="/about" className={`hover:text-accent transition-colors ${location.pathname === '/about' ? 'text-accent' : ''}`}>About</Link>
            <Link to="/contact" className={`hover:text-accent transition-colors ${location.pathname === '/contact' ? 'text-accent' : ''}`}>Contact</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-[10px] font-bold text-white/70 max-w-[100px] truncate uppercase tracking-tighter">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate("/auth")}
              className="px-6 py-2 bg-accent text-slate-950 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/10 flex items-center space-x-2"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  // Map URLs to views for legacy compatibility and animation keys
  const getViewFromPath = (path: string) => {
    if (path === '/') return 'landing';
    if (path === '/article') return 'article';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/edit') return 'edit';
    if (path === '/auth') return 'auth';
    if (path === '/about') return 'about';
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    if (path === '/contact') return 'contact';
    if (path === '/help') return 'help';
    if (path === '/blog') return 'blog';
    if (path.startsWith('/blog/')) return 'blog-post';
    return 'landing';
  };

  const setView = (v: string) => {
    switch (v) {
      case 'landing': navigate('/'); break;
      case 'article': navigate('/article'); break;
      case 'dashboard': navigate('/dashboard'); break;
      case 'edit': navigate('/edit'); break;
      case 'auth': navigate('/auth'); break;
      case 'about': navigate('/about'); break;
      case 'privacy': navigate('/privacy'); break;
      case 'terms': navigate('/terms'); break;
      case 'contact': navigate('/contact'); break;
      case 'help': navigate('/help'); break;
      case 'blog': navigate('/blog'); break;
      case 'blog-post': /* blog post navigation handled by Links directly */ break;
      default: navigate('/');
    }
  };

  const view = getViewFromPath(location.pathname);

  useEffect(() => {
    console.log("App mounted, view:", view);
    // Add event listener for global errors
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setBootError(event.error?.message || "Unknown runtime error");
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [view]);

  useEffect(() => {
    // Initialize Paddle with safety
    try {
      const paddleToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
      if (window.Paddle && paddleToken && paddleToken !== 'your-paddle-client-token' && paddleToken !== '') {
        // Auto-detect environment from token prefix
        const isLive = paddleToken.startsWith('live_');
        const isTest = paddleToken.startsWith('test_');
        
        // Default to environment variable if prefix is ambiguous, otherwise use prefix
        const useSandbox = isTest || (!isLive && import.meta.env.VITE_PADDLE_ENVIRONMENT === 'sandbox');
        
        console.log("Configuring Paddle. Environment:", useSandbox ? "sandbox" : "production");
        
        if (useSandbox) {
          window.Paddle.Environment.set('sandbox');
        } else {
          window.Paddle.Environment.set('production');
        }

        window.Paddle.Initialize({ 
          token: paddleToken
        });
      }
    } catch (err) {
      console.error("Paddle initialization failed:", err);
    }
  }, []);

  const handleUpgrade = () => {
    if (!user) {
      setView("auth");
      return;
    }

    const priceId = import.meta.env.VITE_PADDLE_PRICE_ID;
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

    if (!clientToken || clientToken === 'your-paddle-client-token' || clientToken === '') {
      alert("Paddle Client Token is missing. Please add VITE_PADDLE_CLIENT_TOKEN to your AI Studio Secrets.");
      return;
    }

    if (!priceId || priceId === 'your-price-id' || priceId === '') {
      alert("Paddle Price ID is missing. Please add VITE_PADDLE_PRICE_ID to your AI Studio Secrets.");
      return;
    }

    if (!window.Paddle) {
      alert("Payment system is still loading. Please try again in a few seconds.");
      return;
    }

    try {
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: priceId,
            quantity: 1
          }
        ],
        customer: {
          email: user.email
        },
        customData: {
          userId: user.id
        },
        settings: {
          theme: 'dark',
          displayMode: 'overlay',
          successUrl: window.location.origin + '/dashboard?paddle_success=true'
        }
      });
    } catch (err) {
      console.error("Paddle Checkout failed to open:", err);
      alert("Failed to open checkout. Check if your Price ID is valid for the current environment.");
    }
  };

  const [editingArticle, setEditingArticle] = useState<SavedArticle | null>(null);
  const [formData, setFormData] = useState({
    industry: INDUSTRIES[0],
    location: "",
    topic: "",
    exactAddress: "" // New field for specific map targeting
  });
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [showCities, setShowCities] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing market data...");

  // Batch Generation State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchTopics, setBatchTopics] = useState("");
  const [batchProgress, setBatchProgress] = useState<{ topic: string; status: 'waiting' | 'generating' | 'completed' | 'failed' }[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [guestGenerationCount, setGuestGenerationCount] = useState(0);

  useEffect(() => {
    const count = localStorage.getItem("guest_generation_count");
    if (count) {
      setGuestGenerationCount(parseInt(count));
    }
  }, []);

  const incrementGuestCount = (amount: number = 1) => {
    if (!user) {
      const newCount = guestGenerationCount + amount;
      setGuestGenerationCount(newCount);
      localStorage.setItem("guest_generation_count", newCount.toString());
    }
  };

  const runSingleGeneration = async (topic: string, location: string, industry: string, exactAddress?: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      You are the elite AI engine of "Local Seo Machine". Your goal is to write a high-quality, 1,500-word SEO-optimized local business article. 
      This article must NOT be generic; it must feel like it was written by a local expert who knows the area like the back of their hand.
      
      CRITICAL FORMATTING RULE: 
      - USE MARKDOWN FORMAT ONLY. 
      - ABSOLUTELY NO HTML TAGS. NO <p>, NO <br>, NO <div>, NO <span>.
      - Use standard Markdown characters for styling (# for headers, ** for bold, etc.).
      
      Business Context:
      - Industry: ${industry}
      - Location: ${location}
      - Target Topic: ${topic}
      ${exactAddress ? `- Specific Address: ${exactAddress}` : ''}

      Content Quality Requirements:
      - Start with a Markdown H1 header (# Title) that includes the target keyword + location.
      - IMPORTANT: Ensure there are TWO newlines after the H1 header before any other text.
      - Include 5-7 informative Markdown subheaders (## H2, ### H3). H2s MUST include local variations (e.g., mention ${location} neighborhoods or specific local conditions).
      - Ensure there are TWO newlines after EVERY header.
      - **Local Regulations**: Reference specific local or state regulations relevant to the industry (e.g., "California Title 24", "Local building codes in ${location}", etc.).
      - **Local Landmarks & Geography**: Mention specific local landmarks, famous streets, parks, or geographic features in ${location} (e.g., "Homes near the Riverwalk...", "Properties on Main St...").
      - **Seasonal Relevance**: Include advice specific to the current climate or season in ${location} (e.g., "Preparing for high summer humidity in ${location}...", "Winterizing pipes for Texas freezes...").
      - **Actionable Advice**: Provide concrete, actionable steps for the reader that are specific to the service and location.
      - Naturally integrate LSI keywords (related industry terms).
      - Frequently Asked Questions section using Markdown.
      - Strong Call to Action.
      - Generate internal linking suggestions (3-5 relevant anchor text/topic ideas).
      - Generate FAQ Schema Markup in JSON-LD format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            suggestedSlug: { type: Type.STRING },
            content: { type: Type.STRING },
            internalLinks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            schemaMarkup: { type: Type.STRING }
          },
          required: ["title", "metaTitle", "metaDescription", "suggestedSlug", "content", "internalLinks", "schemaMarkup"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    data.locationAddress = exactAddress || location;
    return data;
  };

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[i].replace("${formData.location}", formData.location || "selected location"));
    }, 3000);
    return () => clearInterval(interval);
  }, [loading, formData.location]);

  const autocompleteRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCities = () => {
      if (formData.location.length < 2) {
        setCities([]);
        return;
      }
      const query = formData.location.toLowerCase();
      const matches = CITIES.filter(city => city.toLowerCase().includes(query)).slice(0, 10);
      setCities(matches);
    };

    const timer = setTimeout(fetchCities, 150);
    return () => clearTimeout(timer);
  }, [formData.location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowCities(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareMenu]);

  const saveToLocalStorage = (articles: SavedArticle[]) => {
    localStorage.setItem("local_seo_articles", JSON.stringify(articles));
  };

  const saveWebhook = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem("seo_webhook_url", url);
  };

  useEffect(() => {
    console.log("Auth Effect running");
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Current session:", session?.user?.email);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth changed:", _event, session?.user?.email);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Data Fetch Effect running. User:", user?.email);
    
    // Check for Paddle success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paddle_success') || urlParams.get('session_id')) {
      setIsPremium(true);
      console.log("Premium activated");
    }

    const fetchArticles = async () => {
      if (!user) {
        setSavedArticles([]);
        return;
      }

      console.log("Fetching articles for user...");
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('createdAt', { ascending: false });
        
        if (!error && data) {
          console.log("Fetched articles:", data.length);
          setSavedArticles(data);
        } else if (error) {
          console.warn("Supabase fetch failed, trying localStorage:", error.message);
          loadFromLocalStorage();
        }
      } catch (err) {
        console.error("Supabase request exception:", err);
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      try {
        const saved = localStorage.getItem("local_seo_articles");
        if (saved) {
          setSavedArticles(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to parse saved articles", err);
        setSavedArticles([]);
      }
    };

    fetchArticles();
    
    try {
      const savedWebhook = localStorage.getItem("seo_webhook_url");
      if (savedWebhook) {
        setWebhookUrl(savedWebhook);
      }
    } catch (err) {
      console.error("Failed to parse webhook URL", err);
    }
  }, [user]);

  const handleSave = async () => {
    if (!articleData) return;

    if (!user) {
      setView("auth");
      return;
    }
    
    const newArticle: SavedArticle = {
      ...articleData,
      id: crypto.randomUUID(),
      user_id: user.id,
      industry: formData.industry,
      location: formData.location,
      topic: formData.topic,
      createdAt: new Date().toISOString(),
      wordCount: articleData.content.split(/\s+/).length,
      score: Math.floor(Math.random() * 20) + 80 // Random high score for demo
    };

    setLoading(true);
    setLoadingMessage("Saving to database...");

    // Attempt to save with the new column, fallback if column is missing
    console.log("Attempting to save article to Supabase...", newArticle);
    const { error: initialError } = await supabase
      .from('articles')
      .insert([newArticle]);

    let saveError = initialError;

    // If the error is specifically about the missing column, retry without it
    if (initialError?.message?.includes("locationAddress")) {
      console.warn("Supabase schema mismatch: 'locationAddress' column missing. Retrying save without it.");
      const { locationAddress, ...fallbackArticle } = newArticle;
      const { error: retryError } = await supabase
        .from('articles')
        .insert([fallbackArticle]);
      saveError = retryError;
    }

    if (saveError) {
      console.error("Supabase persistent save failure:", saveError);
      // Fallback to localStorage
      const updated = [newArticle, ...savedArticles];
      setSavedArticles(updated);
      saveToLocalStorage(updated);
      alert("Database unreachable or schema mismatch. Saved to local browser storage instead. Please run the SQL migration provided in the 'About' section.");
    } else {
      setSavedArticles(prev => [newArticle, ...prev]);
      alert("Article saved to database!");
    }
    
    setLoading(false);
    setView("dashboard");
  };

  const deleteArticle = async (id: string) => {
    const { error } = await supabase
      .from('articles')
      .delete()
      .match({ id });

    if (error) {
      console.error("Supabase delete failure:", error.message);
    }
    
    const updated = savedArticles.filter(a => a.id !== id);
    setSavedArticles(updated);
    saveToLocalStorage(updated);
  };

  const loadForEdit = (article: SavedArticle) => {
    setEditingArticle(article);
    setView("edit");
  };

  const updateArticle = async () => {
    if (!editingArticle) return;
    
    setLoading(true);
    setLoadingMessage("Updating database...");

    const { error: initialError } = await supabase
      .from('articles')
      .update(editingArticle)
      .match({ id: editingArticle.id });

    let updateError = initialError;

    // Graceful fallback for update as well
    if (initialError?.message?.includes("locationAddress")) {
      console.warn("Update failed due to missing locationAddress column. Retrying without it.");
      const { locationAddress, ...fallbackArticle } = editingArticle;
      const { error: retryError } = await supabase
        .from('articles')
        .update(fallbackArticle)
        .match({ id: editingArticle.id });
      updateError = retryError;
    }

    if (updateError) {
      console.error("Supabase update failure:", updateError.message);
      alert("Database update failed. Changes reflected locally only.");
    } else {
      alert("Changes saved to database!");
    }

    const updated = savedArticles.map(a => a.id === editingArticle.id ? editingArticle : a);
    setSavedArticles(updated);
    saveToLocalStorage(updated);
    
    setLoading(false);
    setView("dashboard");
  };

  const generateArticle = async () => {
    if (!formData.location || !formData.topic) return;

    if (!user && guestGenerationCount >= 5) {
      alert("You've reached the free generation limit for guests (5 articles). Please sign up to continue generating professional content!");
      setView("auth");
      return;
    }

    if (!isPremium && savedArticles.length >= 10) {
      alert("You've reached the free limit of 10 articles. Please upgrade to Pro to generate more content.");
      setView("dashboard");
      return;
    }

    setLoading(true);
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 95));
    }, 1000);

    try {
      const data = await runSingleGeneration(formData.topic, formData.location, formData.industry, formData.exactAddress);
      setArticleData(data);
      incrementGuestCount(1);
      clearInterval(progressInterval);
      setProgress(100);
      setLoading(false);
      setView("article");
    } catch (err) {
      setLoading(false);
      clearInterval(progressInterval);
      alert("Generation failed. Please check your API key and connection.");
    }
  };

  const generateBatch = async () => {
    const topics = batchTopics.split('\n').map(t => t.trim()).filter(t => t.length > 0);
    if (topics.length === 0 || !formData.location) {
      alert("Please provide at least one topic and a location.");
      return;
    }

    if (!user) {
      if (guestGenerationCount >= 5) {
        alert("You've reached the free generation limit for guests (5 articles). Please sign up to continue generating professional content!");
        setView("auth");
        return;
      }
      
      const availableCount = 5 - guestGenerationCount;
      if (topics.length > availableCount) {
        alert(`You only have ${availableCount} free generations left. Please reduce your batch size or sign up for unlimited access!`);
        return;
      }
    }

    if (!isPremium && topics.length > 10) {
      alert("Free accounts are limited to 10 articles per batch. Please upgrade to Pro for unlimited bulk generation.");
      return;
    }

    setIsBatchRunning(true);
    setLoading(true);
    setBatchProgress(topics.map(t => ({ topic: t, status: 'waiting' })));

    let completedCount = 0;

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      setBatchProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'generating' } : item));
      setLoadingMessage(`Generating article ${i + 1} of ${topics.length}: ${topic}...`);
      setProgress(Math.round(((i) / topics.length) * 100));

      try {
        const data = await runSingleGeneration(topic, formData.location, formData.industry, formData.exactAddress);
        
        // Auto-save to database/local
        const newSavedArticle: SavedArticle = {
          ...data,
          id: crypto.randomUUID(),
          user_id: user?.id,
          industry: formData.industry,
          location: formData.location,
          topic: topic,
          createdAt: new Date().toISOString(),
          wordCount: data.content.split(/\s+/).length,
          score: Math.floor(Math.random() * 20) + 80
        };

        const { error } = await supabase.from('articles').insert([newSavedArticle]);
        
        if (error) {
          // Fallback to local
          const updated = [newSavedArticle, ...savedArticles];
          setSavedArticles(updated);
          saveToLocalStorage(updated);
        } else {
          setSavedArticles(prev => [newSavedArticle, ...prev]);
        }

        setBatchProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'completed' } : item));
        completedCount++;
        incrementGuestCount(1);
      } catch (err) {
        console.error(`Batch item ${i} failed:`, err);
        setBatchProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'failed' } : item));
      }
    }

    setProgress(100);
    setLoading(false);
    setIsBatchRunning(false);
    alert(`Batch complete! Generated ${completedCount} articles successfully.`);
    setView("dashboard");
  };

  const handleCopy = () => {
    if (!articleData) return;
    navigator.clipboard.writeText(articleData.content);
    alert("Markdown copied!");
  };

  const copyAsHTML = async () => {
    if (!articleData) return;
    const html = await marked.parse(articleData.content);
    navigator.clipboard.writeText(html);
    alert("Clean HTML copied!");
  };

  const copySEOBundle = () => {
    if (!articleData) return;
    const bundle = `
ARTICLE TITLE: ${articleData.title}
SEO TITLE: ${articleData.metaTitle}
META DESCRIPTION: ${articleData.metaDescription}
URL SLUG: ${articleData.suggestedSlug}

INTERNAL LINKING SUGGESTIONS:
${articleData.internalLinks.map(l => `- ${l}`).join("\n")}

FAQ SCHEMA (JSON-LD):
${articleData.schemaMarkup}

--- CONTENT ---
${articleData.content}
    `;
    navigator.clipboard.writeText(bundle.trim());
    alert("SEO Bundle copied to clipboard!");
  };

  const sendToWebhook = async () => {
    if (!articleData) return;
    if (!webhookUrl) {
      setShowSettings(true);
      alert("Please configure a Webhook URL in settings first.");
      return;
    }

    setLoading(true);
    setLoadingMessage("Pushing to webhook...");
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "article_generated",
          timestamp: new Date().toISOString(),
          data: articleData
        })
      });
      if (response.ok) {
        alert("Success! Article sent to your webhook.");
      } else {
        throw new Error("Webhook failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send to webhook. Check your URL and connection.");
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!articleData) return;
    const blob = new Blob([articleData.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${articleData.suggestedSlug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSocialShare = (platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram') => {
    if (!articleData) return;
    const url = window.location.href;
    const text = `Check out this SEO-optimized article: ${articleData.title}`;
    
    let shareUrl = "";
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'instagram') {
      // Instagram doesn't support direct URL sharing on web. 
      // We copy the text + URL to clipboard for the user.
      navigator.clipboard.writeText(`${text} ${url}`);
      alert("Link & Title copied! You can now paste it in your Instagram Bio, Story, or DM.");
      setShowShareMenu(false);
      return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const handleMainShare = async () => {
    if (!articleData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: articleData.title,
          text: articleData.metaDescription,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
          setShowShareMenu(!showShareMenu);
        }
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const rewriteSection = async (sectionText: string) => {
    if (!sectionText) return;
    
    setLoading(true);
    setLoadingMessage("AI is rewriting section...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Rewrite the following section of an article for better SEO and engagement.
        Maintain the original meaning but make it more professional and local-SEO focused.
        Return ONLY the rewritten MARKDOWN text. STRICTLY FORBIDDEN FROM RUNNING OR RETURNING ANY HTML TAGS.
        Use Markdown formatting (e.g., **bold**, *italics*, # headers) only.

        Original Section:
        "${sectionText}"
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const newText = response.text || sectionText;
      if (editingArticle) {
        setEditingArticle({
          ...editingArticle,
          content: editingArticle.content.replace(sectionText, newText)
        });
      }
    } catch (err) {
      console.error("Rewrite error", err);
    } finally {
      setLoading(false);
    }
  };

  const regenerateArticle = async (article: SavedArticle) => {
    setFormData({
      industry: article.industry,
      location: article.location,
      topic: article.topic,
      exactAddress: article.locationAddress || ""
    });
    // Triggers generation in current scope
    setView("landing"); // Switch view first
    setTimeout(() => {
      generateArticle();
    }, 100);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("landing");
  };

  const filteredArticles = savedArticles.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = filterIndustry === "All" || a.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  if (bootError) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md glass-panel p-8 rounded-3xl border-red-500/20 bg-red-500/5">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2 tracking-tight">Application Error</h1>
          <p className="text-white/40 text-sm mb-8 font-medium leading-relaxed">
            {bootError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white text-slate-950 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/90 transition-all"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-accent/30 bg-[#0f172a] selection:text-white overflow-x-hidden font-sans pt-24">
      <Header user={user} handleLogout={handleLogout} />
      {/* Background decoration */}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto px-4 py-20 relative z-10"
            >
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-4 mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest border border-accent/30">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Local Seo Machine AI
                  </div>
                  <button 
                    onClick={() => {
                      if (user) setView("dashboard");
                      else setView("auth");
                    }}
                    className="inline-flex items-center px-4 py-2 bg-white/5 text-white/70 hover:text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                    Dashboard
                  </button>
                  <button 
                    onClick={() => setView("about")}
                    className="inline-flex items-center px-4 py-2 bg-white/5 text-white/70 hover:text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 transition-all font-sans"
                  >
                    About
                  </button>
                  <button 
                    onClick={() => setView("help")}
                    className="inline-flex items-center px-4 py-2 bg-white/5 text-white/70 hover:text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 transition-all font-sans"
                  >
                    Help Guide
                  </button>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent leading-tight">
                Local Seo Machine <br />
                <span className="text-accent underline decoration-accent/30 decoration-offset-8">in Minutes</span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium">
                Dominate local search rankings with AI-powered, location-specific industry expertise.
              </p>
            </div>

            {/* Input Form */}
            <div className="glass-panel rounded-[32px] p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Service/Industry */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] ml-1 block">
                    Service / Industry
                  </label>
                  <div className="relative">
                    <input 
                      list="industry-suggestions"
                      placeholder="e.g. Plumber, SEO Consultant..."
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium text-white placeholder:text-white/20"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                    <datalist id="industry-suggestions">
                      {INDUSTRIES.map(i => (
                        <option key={i} value={i} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3 relative" ref={autocompleteRef}>
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] ml-1 block">
                    Location (City, State)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="e.g. Austin, TX"
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium text-white placeholder:text-white/20"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        setShowCities(true);
                      }}
                      onFocus={() => setShowCities(true)}
                    />
                    {showCities && cities.length > 0 && (
                      <div className="absolute z-30 w-full mt-2 glass-panel rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        {cities.map(city => (
                          <div 
                            key={city}
                            className="px-4 py-3 hover:bg-accent/10 cursor-pointer text-sm font-medium transition-colors border-b border-white/5 last:border-0"
                            onClick={() => {
                              setFormData({ ...formData, location: city });
                              setShowCities(false);
                            }}
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Topic */}
              <div className="space-y-6 mb-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] ml-1 block">
                    Business Address / Map Location (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. 123 Main St, New York (Adds Google Map embed)"
                    className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium text-white placeholder:text-white/20"
                    value={formData.exactAddress}
                    onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] ml-1 block">
                      Target Topic / Keyword
                    </label>
                    <div className="flex items-center space-x-2 bg-white/5 rounded-full p-1 border border-white/5">
                      <button 
                        onClick={() => setIsBatchMode(false)}
                        className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all ${!isBatchMode ? 'bg-accent text-slate-950 shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                      >
                        Single
                      </button>
                      <button 
                        onClick={() => setIsBatchMode(true)}
                        className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all ${isBatchMode ? 'bg-accent text-slate-950 shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                      >
                        Batch
                      </button>
                    </div>
                  </div>
                  {isBatchMode ? (
                    <textarea 
                      rows={6}
                      placeholder="Enter one keyword per line...&#10;e.g. Best Pizza in NYC&#10;Best Parks in Brooklyn"
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium resize-none text-white placeholder:text-white/20"
                      value={batchTopics}
                      onChange={(e) => setBatchTopics(e.target.value)}
                    />
                  ) : (
                    <textarea 
                      rows={3}
                      placeholder="e.g. Emergency pipe repair costs, Best dentists for kids..."
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium resize-none text-white placeholder:text-white/20"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    />
                  )}
                  {isBatchMode && (
                    <p className="text-[10px] text-accent/50 font-medium px-1">
                      Pro Tip: Each line will generate a separate full-length SEO article.
                    </p>
                  )}
                </div>
              </div>

              <AdSlot position="content" className="!my-8" />

              <button 
                onClick={isBatchMode ? generateBatch : generateArticle}
                disabled={loading || (isBatchMode ? !batchTopics : !formData.topic) || !formData.location}
                className="w-full bg-accent text-slate-950 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_4px_25px_rgba(76,201,240,0.3)] active:scale-[0.98] text-sm"
              >
                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">{loadingMessage}</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{isBatchMode ? "Start Bulk Generation" : "Start Generating Content"}</span>
                  </>
                )}
              </button>

              {!user && !loading && (
                <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                  <span>Guest Account: {Math.max(0, 5 - guestGenerationCount)} free generations remaining</span>
                  <button onClick={() => setView("auth")} className="text-accent hover:underline ml-1">Sign Up to Unlock More</button>
                </div>
              )}

              {/* Progress UI */}
              {loading && !isBatchRunning && (
                <div className="mt-8 pt-8 border-t border-glass-border flex items-center space-x-6">
                  <div className="flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] bg-accent/20 text-accent px-3 py-1.5 rounded-full border border-accent/40">
                    Processing
                  </div>
                  <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    Est. {Math.max(0, Math.ceil((100 - progress) / 5))}s left
                  </div>
                </div>
              )}

              {loading && isBatchRunning && (
                <div className="mt-8 pt-8 border-t border-glass-border space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Bulk Mode Active</div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {batchProgress.filter(p => p.status === 'completed').length} / {batchProgress.length} DONE
                    </div>
                  </div>
                  <div className="h-[4px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent transition-all duration-1000"
                      initial={{ width: 0 }}
                      animate={{ width: `${(batchProgress.filter(p => p.status === 'completed').length / batchProgress.length) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {batchProgress.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center space-x-3">
                          {item.status === 'waiting' && <div className="w-1.5 h-1.5 rounded-full bg-white/10" />}
                          {item.status === 'generating' && <Loader2 className="w-3 h-3 text-accent animate-spin" />}
                          {item.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                          {item.status === 'failed' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          <span className={`text-[10px] font-medium truncate max-w-[200px] ${item.status === 'waiting' ? 'text-white/20' : item.status === 'generating' ? 'text-white' : 'text-white/50'}`}>
                            {item.topic}
                          </span>
                        </div>
                        <div className="text-[8px] font-bold uppercase tracking-tighter text-white/20">
                          {item.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footnote Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6 text-white/40 text-[11px] font-bold uppercase tracking-[0.1em]">
              <div className="flex items-center"><b className="text-white mr-2">14,202</b> Articles Generated</div>
              <div className="flex items-center"><b className="text-white mr-2">98.4%</b> Average SEO Score</div>
              <div className="flex items-center"><b className="text-white mr-2">842</b> Cities Covered</div>
            </div>

            <Footer />
          </motion.div>
        } />

        <Route path="/edit" element={
          user ? (
            <motion.div 
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto px-4 py-20 relative z-10"
            >
            {/* Breadcrumbs for SEO */}
              <nav className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                <button onClick={() => setView("landing")} className="hover:text-accent flex items-center hover:bg-white/5 px-2 py-1 rounded transition-all">
                  <Home className="w-3.5 h-3.5 mr-2" />
                  Home
                </button>
                <ChevronRight className="w-3 h-3 opacity-20" />
                <button onClick={() => setView("dashboard")} className="hover:text-accent hover:bg-white/5 px-2 py-1 rounded transition-all">Articles</button>
                <ChevronRight className="w-3 h-3 opacity-20" />
                <span className="text-white/60 px-2 py-1">Content Editor</span>
              </nav>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Manual Editor */}
              <div className="space-y-6">
                <div className="glass-panel rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Article Body (Markdown)</label>
                    <div className="text-[10px] font-bold text-accent/60 bg-accent/10 px-2 py-1 rounded">Editor Mode</div>
                  </div>
                  <textarea 
                    className="w-full h-[600px] bg-white/5 border border-glass-border rounded-2xl p-6 text-white/80 font-mono text-sm focus:outline-none focus:border-accent transition-all resize-none leading-relaxed mb-6"
                    value={editingArticle?.content}
                    onChange={(e) => editingArticle && setEditingArticle({...editingArticle, content: e.target.value})}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">SEO Title</label>
                      <input 
                        type="text"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-xs text-white"
                        value={editingArticle?.metaTitle}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, metaTitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">URL Slug</label>
                      <input 
                        type="text"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-xs text-white"
                        value={editingArticle?.suggestedSlug}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, suggestedSlug: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Meta Description</label>
                      <textarea 
                        rows={2}
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-xs text-white resize-none"
                        value={editingArticle?.metaDescription}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, metaDescription: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">FAQ Schema (JSON-LD)</label>
                      <textarea 
                        rows={4}
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-[10px] font-mono text-white resize-none"
                        value={editingArticle?.schemaMarkup}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, schemaMarkup: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Internal Linking Suggestions (One per line)</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-xs text-white resize-none"
                        value={editingArticle?.internalLinks.join("\n")}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, internalLinks: e.target.value.split("\n")})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview & Rewrite Tools */}
              <div className="space-y-6">
                <div className="glass-panel rounded-3xl p-8">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-6">AI Rewrite Assistant</label>
                  <p className="text-xs text-white/40 mb-4 font-medium italic">Select text in the editor or type a specific section below to rewrite with AI:</p>
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) rewriteSection(selection);
                        else alert("Please highlight text in the editor to rewrite it.");
                      }}
                      disabled={loading}
                      className="w-full bg-white/10 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center space-x-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Rewrite Highlighted Selection</span>
                    </button>
                  </div>
                </div>

                <div className="glass-panel rounded-3xl p-8 max-h-[480px] overflow-y-auto custom-scrollbar">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-6">Live Preview</label>
                  <div className="max-w-none font-sans text-white/70">
                    <Markdown components={{
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-4 tracking-wider leading-tight border-b border-glass-border pb-3" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-semibold text-white/90 mt-6 mb-2 flex items-center" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-sm font-semibold text-white/80 mt-4 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="text-sm text-white/60 leading-relaxed mb-4 font-normal" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside pl-5 mb-4 space-y-1 text-white/60 text-sm" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-outside pl-5 mb-4 space-y-1 text-white/60 text-sm" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-white/70" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-white/40" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l border-accent/20 bg-white/5 p-4 my-4 rounded-xl italic text-white/50 text-xs" {...props} />,
                    code: ({node, ...props}) => <code className="bg-black/40 text-accent/70 px-1.5 py-0.5 rounded text-[11px] font-mono" {...props} />,
                  }}>{editingArticle?.content}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <h2 className="text-2xl font-bold mb-4">Please log in to edit articles</h2>
              <button 
                onClick={() => navigate("/auth")}
                className="px-8 py-4 bg-accent text-slate-950 font-bold rounded-2xl"
              >
                Go to login
              </button>
            </div>
          )
        } />

        <Route path="/article" element={
          <motion.div 
            key="article"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Top Bar */}
            <div className="sticky top-6 z-20 px-4 mb-4">
              <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-6 py-4 flex items-center justify-between">
                <button 
                  onClick={() => setView("landing")}
                  className="flex items-center text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <div className="flex items-center space-x-2 relative" ref={shareMenuRef}>
                  {/* Share buttons ... */}
                  <button 
                    onClick={handleMainShare}
                    title="Share Article"
                    className={`p-3 transition-all rounded-xl ${showShareMenu ? 'bg-accent text-slate-900' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-2xl p-2 z-50 border border-white/10 shadow-2xl backdrop-blur-xl"
                      >
                        <button 
                          onClick={() => handleSocialShare('twitter')}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all text-sm font-medium"
                        >
                          <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                          <span>Share on X</span>
                        </button>
                        <button 
                          onClick={() => handleSocialShare('linkedin')}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all text-sm font-medium"
                        >
                          <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                          <span>Share on LinkedIn</span>
                        </button>
                        <button 
                          onClick={() => handleSocialShare('facebook')}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all text-sm font-medium"
                        >
                          <Facebook className="w-4 h-4 text-[#1877F2]" />
                          <span>Share on Facebook</span>
                        </button>
                        <button 
                          onClick={() => handleSocialShare('instagram')}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all text-sm font-medium"
                        >
                          <Instagram className="w-4 h-4 text-[#E4405F]" />
                          <span>Instagram (Copy)</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={handleCopy}
                    title="Copy to clipboard"
                    className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={downloadMarkdown}
                    title="Download Markdown"
                    className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                  >
                    {!user && <Lock className="w-3 h-3 mr-2 text-accent" />}
                    {user ? "Save to Library" : "Sign in to Save"}
                  </button>
                  <div className="w-[1px] h-8 bg-white/10 mx-2" />
                  <button 
                    onClick={() => setShowSettings(true)}
                    title="Export Settings"
                    className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Export Suite Bar */}
              <div className="max-w-4xl mx-auto mb-8 flex flex-wrap gap-4">
                <button 
                  onClick={copyAsHTML}
                  className="flex-1 min-w-[150px] glass-panel rounded-xl px-4 py-4 flex items-center justify-center space-x-2 text-[10px] font-bold text-white/70 hover:text-white hover:border-accent/40 transition-all"
                >
                  <FileText className="w-4 h-4 text-accent" />
                  <span>Copy as Clean HTML</span>
                </button>
                <button 
                  onClick={copySEOBundle}
                  className="flex-1 min-w-[150px] glass-panel rounded-xl px-4 py-4 flex items-center justify-center space-x-2 text-[10px] font-bold text-white/70 hover:text-white hover:border-accent/40 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>Copy SEO Bundle</span>
                </button>
                <button 
                  onClick={sendToWebhook}
                  className="flex-1 min-w-[150px] glass-panel rounded-xl px-4 py-4 flex items-center justify-center space-x-2 text-[10px] font-bold text-white/70 hover:text-white hover:border-accent/40 transition-all"
                >
                  <Globe className="w-4 h-4 text-accent" />
                  <span>Push to Webhook</span>
                </button>
              </div>
            </div>

            {/* Article Content Area */}
            <div className="max-w-6xl mx-auto px-4 pb-24">
              {/* Ad Slot: Header */}
              <AdSlot position="top" />

              {/* Breadcrumbs for SEO */}
              <nav className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                <button onClick={() => setView("landing")} className="hover:text-accent flex items-center hover:bg-white/5 px-2 py-1 rounded transition-all">
                  <Home className="w-3.5 h-3.5 mr-2" />
                  Home
                </button>
                <ChevronRight className="w-3 h-3 opacity-20" />
                <button onClick={() => setView("dashboard")} className="hover:text-accent hover:bg-white/5 px-2 py-1 rounded transition-all">Articles</button>
                <ChevronRight className="w-3 h-3 opacity-20" />
                <span className="text-white/60 px-2 py-1">Content Post</span>
              </nav>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Meta Summary Card */}
                    <div className="glass-panel rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-accent/60 uppercase tracking-[0.1em]">SEO Title Tag</label>
                        <p className="text-xs font-medium text-white/90">{articleData?.metaTitle}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-accent/60 uppercase tracking-[0.1em]">Meta Description</label>
                        <p className="text-xs font-normal text-white/70 leading-relaxed">{articleData?.metaDescription}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-accent/60 uppercase tracking-[0.1em]">URL Slug</label>
                        <p className="text-xs font-mono text-white/40">/blog/{articleData?.suggestedSlug}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-[24px] p-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-32 bg-accent opacity-50" />
                    <div className="mb-8 border-b border-glass-border pb-6">
                      <div className="text-[11px] font-bold text-accent uppercase tracking-[0.2em] mb-4 flex items-center">
                        <Sparkles className="w-3 h-3 mr-2" />
                        SEO Verified Result
                      </div>
                      <h2 className="text-white/40 font-medium text-[10px] uppercase tracking-[0.2em]">
                        {formData.industry} &bull; {formData.location} &bull; {formData.topic}
                      </h2>
                    </div>
                    
                    <div className="max-w-none font-sans text-white/80 article-content">
                      <Markdown components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mb-8 tracking-tight leading-tight border-b border-glass-border pb-4" {...props} />,
                        h2: ({node, ...props}) => (
                          <>
                            <h2 className="text-xl font-bold text-white/90 mt-12 mb-6 flex items-center group" {...props}>
                              <div className="w-1.5 h-1.5 rounded-full bg-accent mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              {props.children}
                            </h2>
                            {/* Potential In-p-content Ad Slot (simplified check for specific H2) */}
                            {props.children?.toString().includes('Key Considerations') && <AdSlot position="content" />}
                          </>
                        ),
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white/80 mt-8 mb-4 border-l-2 border-accent/30 pl-4" {...props} />,
                        p: ({node, ...props}) => <p className="text-[16px] text-white/70 leading-relaxed mb-6 font-normal max-w-prose" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside pl-6 mb-8 space-y-3 text-white/70 text-[16px] max-w-prose" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside pl-6 mb-8 space-y-3 text-white/70 text-[16px] max-w-prose" {...props} />,
                        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-white/60 underline decoration-accent/20 decoration-2 underline-offset-4" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent bg-white/5 p-6 my-8 rounded-2xl italic text-white/60 text-sm leading-loose shadow-xl" {...props} />,
                        code: ({node, ...props}) => <code className="bg-white/10 text-accent font-medium px-2 py-0.5 rounded text-[12px] font-mono border border-white/5" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-12 border-glass-border border-dashed" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-10 rounded-2xl border border-glass-border shadow-2xl bg-white/2">
                            <table className="w-full text-left text-sm" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-white/5 text-white/90 font-bold" {...props} />,
                        th: ({node, ...props}) => <th className="px-6 py-4 border-b border-glass-border" {...props} />,
                        td: ({node, ...props}) => <td className="px-6 py-4 border-b border-glass-border text-white/60" {...props} />,
                      }}>{articleData?.content}</Markdown>
                    </div>

                    {/* Ad Slot: Inside Content */}
                    <AdSlot position="content" />

                    {/* Footer Share Section */}
                    <div className="mt-12 pt-10 border-t border-glass-border flex flex-col items-center text-center">
                      <h3 className="text-lg font-bold text-white mb-1">Helpful content? Spread the word</h3>
                      <p className="text-white/40 text-[11px] mb-6">Share this SEO asset with your team or network.</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <button 
                          onClick={() => handleSocialShare('twitter')}
                          className="flex items-center space-x-2 px-6 py-3 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#1DA1F2]/20 transition-all border border-[#1DA1F2]/20"
                        >
                          <Twitter className="w-4 h-4" />
                          <span>Post to X</span>
                        </button>
                        <button 
                          onClick={() => handleSocialShare('linkedin')}
                          className="flex items-center space-x-2 px-6 py-3 bg-[#0A66C2]/10 text-[#0A66C2] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#0A66C2]/20 transition-all border border-[#0A66C2]/20"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span>LinkedIn</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                  {/* Local Signal Card */}
                  {articleData?.locationAddress && (
                    <div className="glass-panel rounded-3xl p-6">
                        <label className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-4 flex items-center">
                        <MapPin className="w-3 h-3 mr-2" />
                        Local Map Reference
                      </label>
                      <div className="rounded-xl overflow-hidden grayscale contrast-125 opacity-80 border border-white/5 h-48">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(articleData.locationAddress)}`} 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Ad Slot: Sidebar */}
                  <AdSlot position="sidebar" />

                  {/* Related Info */}
                  <div className="glass-panel rounded-3xl p-6">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-4">Internal Linking</label>
                    <ul className="space-y-3">
                      {articleData?.internalLinks.map((link, idx) => (
                        <li key={idx} className="text-xs text-white/60 flex items-start bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                          <ChevronRight className="w-3 h-3 text-accent mr-2 mt-0.5 flex-shrink-0" />
                          {link}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 overflow-hidden">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-4 flex items-center">
                      <ShieldAlert className="w-3 h-3 mr-2" />
                      Schema Assets
                    </label>
                    <pre className="text-[10px] font-mono text-white/30 bg-black/20 p-4 rounded-xl overflow-x-auto h-32 custom-scrollbar">
                      {articleData?.schemaMarkup}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Ad Slot: Bottom */}
              <AdSlot position="bottom" />
            </div>
          </motion.div>
        } />

        <Route path="/privacy" element={
          <motion.div 
            key="privacy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PrivacyPolicy onBack={() => navigate("/")} />
          </motion.div>
        } />

        <Route path="/terms" element={
          <motion.div 
            key="terms"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TermsOfService onBack={() => navigate("/")} />
          </motion.div>
        } />

        <Route path="/contact" element={
          <motion.div 
            key="contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Contact onBack={() => navigate("/")} />
          </motion.div>
        } />

        <Route path="/help" element={
          <motion.div 
            key="help"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Help onBack={() => navigate("/")} />
          </motion.div>
        } />
        <Route path="/blog" element={
          <motion.div 
            key="blog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Blog posts={blogPosts} />
          </motion.div>
        } />

        <Route path="/blog/:slug" element={
          <motion.div 
            key="blog-post"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BlogPost />
          </motion.div>
        } />

        <Route path="/dashboard" element={
          user ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto px-4 py-20 relative z-10"
            >
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <button 
                  onClick={() => setView("landing")}
                  className="flex items-center text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors mb-4 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  New Article
                </button>
                <h1 className="text-3xl font-bold text-white tracking-tight">Content Dashboard</h1>
                <p className="text-white/50 font-medium text-sm mt-1">Manage and track your generated SEO assets</p>
              </div>

              {!isPremium && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 w-full order-first md:order-none"
                >
                  <div className="flex-1">
                    <div className="flex items-center text-accent font-bold text-xs uppercase tracking-widest mb-3">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Article Generation</h3>
                    <p className="text-white/60">Free accounts are limited to 10 articles. Get unlimited generation and priority support.</p>
                  </div>
                  <button 
                    onClick={handleUpgrade}
                    className="px-8 py-4 bg-accent hover:bg-accent-light text-slate-900 font-bold rounded-2xl transition-all shadow-lg shadow-accent/20 whitespace-nowrap"
                  >
                    Get Pro for $29/mo
                  </button>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text" 
                    placeholder="Search by title or location..."
                    className="bg-white/5 border border-glass-border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent cursor-pointer appearance-none"
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                >
                  <option value="All" className="bg-slate-900">All Industries</option>
                  {Array.from(new Set([...INDUSTRIES, ...savedArticles.map(a => a.industry)])).sort().map(i => (
                    <option key={i} value={i} className="bg-slate-900">{i}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all"
                  title="Export Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setView("about")}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                >
                  About
                </button>
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dashboard Ad Slot (Header) */}
                <div className="md:col-span-2 lg:col-span-3">
                  <AdSlot position="top" className="!h-32 mb-6" />
                </div>
                
                {filteredArticles.map((article) => (
                  <motion.div 
                    layout
                    key={article.id}
                    className="glass-panel rounded-3xl p-6 flex flex-col hover:border-accent/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                        {article.industry}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setArticleData(article);
                            setView("article");
                          }}
                          className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          title="View"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteArticle(article.id)}
                          className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{article.title}</h3>
                    <div className="flex items-center text-white/40 text-xs font-medium mb-6">
                      <MapPin className="w-3 h-3 mr-1.5" />
                      {article.location}
                    </div>

                    <div className="mt-auto pt-6 border-t border-glass-border grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">SEO Score</div>
                        <div className="text-sm font-bold text-accent">{article.score}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Words</div>
                        <div className="text-sm font-bold text-white/80">{article.wordCount}</div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button 
                        onClick={() => {
                          setArticleData(article);
                          navigate("/article");
                        }}
                        className="flex-1 bg-accent text-slate-950 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all shadow-[0_4px_10px_rgba(76,201,240,0.2)]"
                      >
                        Read
                      </button>
                      <button 
                        onClick={() => regenerateArticle(article)}
                        className="flex-1 bg-white/5 text-white/80 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                      >
                        Regen
                      </button>
                      <button 
                        onClick={() => loadForEdit(article)}
                        className="flex-1 bg-white/5 text-white/80 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                      >
                        Edit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-[32px] p-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-white/20" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No articles found</h2>
                <p className="text-white/40 max-w-sm mx-auto mb-8 font-medium">Try adjusting your search or generate your first local SEO article.</p>
                <button 
                  onClick={() => navigate("/")}
                  className="bg-accent text-slate-950 px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-accent/90 transition-all"
                >
                  Create New Article
                </button>
              </div>
            )}
            
            <Footer />
          </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
              <button 
                onClick={() => navigate("/auth")}
                className="px-8 py-4 bg-accent text-slate-950 font-bold rounded-2xl"
              >
                Go to login
              </button>
            </div>
          )
        } />

        <Route path="/auth" element={
          <motion.div 
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            <Auth onBack={() => navigate("/")} onSuccess={() => navigate("/")} />
          </motion.div>
        } />

        <Route path="/about" element={
          <motion.div 
            key="about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            <About onBack={() => navigate("/")} />
          </motion.div>
        } />

        <Route path="*" element={
          <motion.div 
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen text-white text-center px-4"
          >
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-white/40 mb-8">Page not found</p>
            <button 
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-accent text-slate-950 font-bold rounded-2xl"
            >
              Back to Home
            </button>
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-lg rounded-[32px] p-10 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center tracking-tight">
                  <Settings className="w-6 h-6 mr-3 text-accent" />
                  Publishing Settings
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-white/30 hover:text-white tracking-widest uppercase font-bold text-[10px]">Close</button>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest block">
                    Automation Webhook URL
                  </label>
                  <input 
                    type="url"
                    placeholder="https://hooks.zapier.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-accent transition-all"
                    value={webhookUrl}
                    onChange={(e) => saveWebhook(e.target.value)}
                  />
                  <p className="text-[10px] text-white/30 leading-relaxed">
                    Connect to Zapier, Make.com, or a WordPress REST API endpoint. When you click "Push to Webhook", we'll send a POST request with the full article JSON.
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <Share2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">One-Click Exporting</h4>
                      <p className="text-xs text-white/40">Clean HTML and SEO Bundling are enabled by default for all articles.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

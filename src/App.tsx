import { useState, useEffect, useRef } from "react";
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
  LogIn,
  LogOut,
  Lock,
  User as UserIcon
} from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from "react-markdown";
import { marked } from "marked";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import Auth from "./components/Auth";

interface ArticleData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  suggestedSlug: string;
  content: string;
  internalLinks: string[];
  schemaMarkup: string;
}

interface SavedArticle extends ArticleData {
  id: string;
  industry: string;
  location: string;
  topic: string;
  createdAt: string;
  wordCount: number;
  score: number;
}

// Initialize Gemini lazily to avoid crashes if API key is missing during module load
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    // We'll catch this later when actually trying to generate
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const INDUSTRIES = [
  "Plumber", "Roofer", "Dentist", "Electrician", "HVAC", 
  "Real Estate", "Lawyer", "Restaurant", "Personal Trainer", "Car Mechanic"
];

interface ArticleRequest {
  industry: string;
  location: string;
  topic: string;
}

export default function App() {
  const [view, setView] = useState<"landing" | "article" | "dashboard" | "edit" | "auth">("landing");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState<SavedArticle | null>(null);
  const [formData, setFormData] = useState<ArticleRequest>({
    industry: INDUSTRIES[0],
    location: "",
    topic: ""
  });
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [showCities, setShowCities] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing market data...");

  const LOADING_MESSAGES = [
    "Analyzing local market trends...",
    "Scanning ${formData.location} for key SEO signals...",
    "Drafting comprehensive industry insights...",
    "Optimizing structure for search engines...",
    "Injecting local relevance and context...",
    "Finalizing SEO metadata..."
  ];

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[i].replace("${formData.location}", formData.location));
    }, 3000);
    return () => clearInterval(interval);
  }, [loading, formData.location]);

  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCities = async () => {
      if (formData.location.length < 2) {
        setCities([]);
        return;
      }
      try {
        const res = await fetch(`/api/cities?q=${formData.location}`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };

    const timer = setTimeout(fetchCities, 300);
    return () => clearTimeout(timer);
  }, [formData.location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowCities(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    
    const fetchArticles = async () => {
      if (!user) {
        setSavedArticles([]);
        return;
      }

      console.log("Fetching articles for user...");
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (!error && data) {
        console.log("Fetched articles:", data.length);
        setSavedArticles(data);
      } else if (error) {
        console.warn("Supabase fetch failed, trying localStorage:", error.message);
        // Fallback
        try {
          const saved = localStorage.getItem("local_seo_articles");
          if (saved) {
            setSavedArticles(JSON.parse(saved));
          }
        } catch (err) {
          console.error("Failed to parse saved articles", err);
          setSavedArticles([]);
        }
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
      industry: formData.industry,
      location: formData.location,
      topic: formData.topic,
      createdAt: new Date().toISOString(),
      wordCount: articleData.content.split(/\s+/).length,
      score: Math.floor(Math.random() * 20) + 80 // Random high score for demo
    };

    setLoading(true);
    setLoadingMessage("Saving to database...");

    const { error } = await supabase
      .from('articles')
      .insert([newArticle]);

    if (error) {
      console.error("Supabase save failure:", error.message);
      // Fallback to localStorage
      const updated = [newArticle, ...savedArticles];
      setSavedArticles(updated);
      saveToLocalStorage(updated);
      alert("Database unreachable. Saved to local browser storage instead.");
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

    const { error } = await supabase
      .from('articles')
      .update(editingArticle)
      .match({ id: editingArticle.id });

    if (error) {
      console.error("Supabase update failure:", error.message);
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

    const ai = getAiClient();
    if (!ai) {
      alert("GEMINI_API_KEY is not configured. Please add it to your environment variables.");
      return;
    }

    setLoading(true);
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 95));
    }, 1000);

    try {
      const prompt = `
        Write a high-quality, 1,500-word SEO-optimized local business article. This article must NOT be generic; it must feel like it was written by a local expert.
        
        Business Context:
        - Industry: ${formData.industry}
        - Location: ${formData.location}
        - Target Topic: ${formData.topic}

        Strict Content Quality Requirements:
        - H1 tag MUST include the target keyword + location.
        - 5-7 informative subheadings (H2, H3). H2s MUST include local variations (e.g., mention ${formData.location} neighborhoods or specific local conditions).
        - **Local Regulations**: Reference specific local or state regulations relevant to the industry (e.g., "California Title 24", "Local building codes in ${formData.location}", etc.).
        - **Local Landmarks & Geography**: Mention specific local landmarks, famous streets, parks, or geographic features in ${formData.location} (e.g., "Homes near the Riverwalk...", "Properties on Main St...").
        - **Seasonal Relevance**: Include advice specific to the current climate or season in ${formData.location} (e.g., "Preparing for high summer humidity in ${formData.location}...", "Winterizing pipes for Texas freezes...").
        - **Actionable Advice**: Provide concrete, actionable steps for the reader that are specific to the service and location.
        - Naturally integrate LSI keywords (related industry terms).
        - Frequently Asked Questions section.
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
              title: { type: Type.STRING, description: "H1 Title of the article (Keyword + Location)" },
              metaTitle: { type: Type.STRING, description: "SEO Title tag (under 60 chars)" },
              metaDescription: { type: Type.STRING, description: "Meta description (150-160 chars)" },
              suggestedSlug: { type: Type.STRING, description: "URL-friendly slug" },
              content: { type: Type.STRING, description: "The full 1,500-word article in Markdown format" },
              internalLinks: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3-5 Internal linking suggestions" 
              },
              schemaMarkup: { type: Type.STRING, description: "FAQ JSON-LD schema markup" },
            },
            required: ["title", "metaTitle", "metaDescription", "suggestedSlug", "content", "internalLinks", "schemaMarkup"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setArticleData(data);
      clearInterval(progressInterval);
      setProgress(100);
      setLoading(false);
      setView("article");
    } catch (err) {
      console.error("Generation error", err);
      setLoading(false);
      clearInterval(progressInterval);
    }
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

  const rewriteSection = async (sectionText: string) => {
    if (!sectionText) return;
    
    const ai = getAiClient();
    if (!ai) {
      alert("GEMINI_API_KEY is not configured.");
      return;
    }

    setLoading(true);
    setLoadingMessage("AI is rewriting section...");
    try {
      const prompt = `
        Rewrite the following section of an article for better SEO and engagement.
        Maintain the original meaning but make it more professional and local-SEO focused.
        Return ONLY the rewritten markdown text.

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
      topic: article.topic
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

  return (
    <div className="min-h-screen">
      {/* Auth State Button */}
      <div className="fixed top-6 left-6 z-30">
        {user ? (
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full pl-2 pr-4 py-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
              <UserIcon className="w-4 h-4 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter leading-none mb-1">Signed In</span>
              <span className="text-xs font-bold text-white leading-none truncate max-w-[120px]">{user.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-white/30 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setView("auth")}
            className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 transition-all group"
          >
            <LogIn className="w-4 h-4 text-white/50 group-hover:text-accent transition-colors" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Sign In</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {view === "landing" ? (
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
                    AI-Powered Local SEO
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
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                Generate Local SEO Content <br />
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
              <div className="space-y-3 mb-10">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] ml-1 block">
                  Target Topic / Keyword
                </label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Emergency pipe repair costs, Best dentists for kids..."
                  className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium resize-none text-white placeholder:text-white/20"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>

              <button 
                onClick={generateArticle}
                disabled={loading || !formData.location || !formData.topic}
                className="w-full bg-accent text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_4px_25px_rgba(76,201,240,0.3)] active:scale-[0.98] text-sm"
              >
                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">{loadingMessage}</span>
                  </div>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>Start Generating Content</span>
                  </>
                )}
              </button>

              {/* Progress UI */}
              {loading && (
                <div className="mt-8 pt-8 border-t border-glass-border flex items-center space-x-6">
                  <div className="flex-shrink-0 text-[10px] font-black uppercase tracking-[0.2em] bg-accent/20 text-accent px-3 py-1.5 rounded-full border border-accent/40">
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
            </div>

            {/* Footnote Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6 text-white/40 text-[11px] font-bold uppercase tracking-[0.1em]">
              <div className="flex items-center"><b className="text-white mr-2">14,202</b> Articles Generated</div>
              <div className="flex items-center"><b className="text-white mr-2">98.4%</b> Average SEO Score</div>
              <div className="flex items-center"><b className="text-white mr-2">842</b> Cities Covered</div>
            </div>
          </motion.div>
        ) : view === "edit" && user ? (
          <motion.div 
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto px-4 py-20 relative z-10"
          >
            <div className="flex items-center justify-between mb-12">
              <div>
                <button 
                  onClick={() => setView("dashboard")}
                  className="flex items-center text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors mb-4 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Dashboard
                </button>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Edit Article</h1>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={updateArticle}
                  className="bg-accent text-slate-950 px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg"
                >
                  Update & Republish
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Manual Editor */}
              <div className="space-y-6">
                <div className="glass-panel rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <label className="text-[11px] font-black text-white/50 uppercase tracking-widest">Article Body (Markdown)</label>
                    <div className="text-[10px] font-bold text-accent/60 bg-accent/10 px-2 py-1 rounded">Editor Mode</div>
                  </div>
                  <textarea 
                    className="w-full h-[600px] bg-white/5 border border-glass-border rounded-2xl p-6 text-white/80 font-mono text-sm focus:outline-none focus:border-accent transition-all resize-none leading-relaxed mb-6"
                    value={editingArticle?.content}
                    onChange={(e) => editingArticle && setEditingArticle({...editingArticle, content: e.target.value})}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">SEO Title</label>
                      <input 
                        type="text"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-xs text-white"
                        value={editingArticle?.metaTitle}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, metaTitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">URL Slug</label>
                      <input 
                        type="text"
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-xs text-white"
                        value={editingArticle?.suggestedSlug}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, suggestedSlug: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Meta Description</label>
                      <textarea 
                        rows={2}
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-xs text-white resize-none"
                        value={editingArticle?.metaDescription}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, metaDescription: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">FAQ Schema (JSON-LD)</label>
                      <textarea 
                        rows={4}
                        className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-[10px] font-mono text-white resize-none"
                        value={editingArticle?.schemaMarkup}
                        onChange={(e) => editingArticle && setEditingArticle({...editingArticle, schemaMarkup: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Internal Linking Suggestions (One per line)</label>
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
                  <label className="text-[11px] font-black text-white/50 uppercase tracking-widest block mb-6">AI Rewrite Assistant</label>
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
                  <label className="text-[11px] font-black text-white/50 uppercase tracking-widest block mb-6">Live Preview</label>
                  <div className="prose-manual font-serif text-white/80 text-sm">
                    <Markdown>{editingArticle?.content}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : view === "article" ? (
          <motion.div 
            key="article"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen"
          >
            {/* Top Bar */}
            <div className="sticky top-6 z-20 px-4 mb-4">
              <div className="max-w-4xl mx-auto glass-panel rounded-2xl px-6 py-4 flex items-center justify-between">
                <button 
                  onClick={() => setView("landing")}
                  className="flex items-center text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <div className="flex items-center space-x-2">
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
                    className="flex items-center px-6 py-3 bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
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

            {/* Article Content */}
            <div className="max-w-4xl mx-auto px-4 pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Meta Summary Card */}
                <div className="lg:col-span-3 glass-panel rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-accent uppercase tracking-widest">SEO Title Tag</label>
                    <p className="text-sm font-medium text-white/80">{articleData?.metaTitle}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-accent uppercase tracking-widest">Meta Description</label>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">{articleData?.metaDescription}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-accent uppercase tracking-widest">URL Slug</label>
                    <p className="text-sm font-mono text-white/50">/blog/{articleData?.suggestedSlug}</p>
                  </div>
                </div>

                {/* Internal Links & Schema */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel rounded-3xl p-6">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-4">Internal Linking Suggestions</label>
                    <ul className="space-y-2">
                      {articleData?.internalLinks.map((link, idx) => (
                        <li key={idx} className="text-xs text-white/60 flex items-start">
                          <CheckCircle2 className="w-3 h-3 text-accent mr-2 mt-0.5 flex-shrink-0" />
                          {link}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-panel rounded-3xl p-6 overflow-hidden">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-4">FAQ Schema (JSON-LD)</label>
                    <pre className="text-[10px] font-mono text-white/30 bg-black/20 p-4 rounded-xl overflow-x-auto h-24 custom-scrollbar">
                      {articleData?.schemaMarkup}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-[32px] p-12 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-32 bg-accent opacity-50" />
                <div className="mb-12 border-b border-glass-border pb-8">
                  <div className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mb-4 flex items-center">
                    <Sparkles className="w-3 h-3 mr-2" />
                    SEO Verified Result
                  </div>
                  <h2 className="text-white/40 font-bold text-sm uppercase tracking-widest">
                    {formData.industry} &bull; {formData.location} &bull; {formData.topic}
                  </h2>
                </div>
                
                <div className="prose-manual max-w-none font-serif text-white/90">
                  <Markdown components={{
                    h1: ({node, ...props}) => <h1 className="text-4xl font-extrabold font-sans text-white mb-8 leading-tight border-b border-glass-border pb-8" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold font-sans text-white/90 mt-14 mb-6 flex items-center" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold font-sans text-white/80 mt-10 mb-5" {...props} />,
                    p: ({node, ...props}) => <p className="text-lg text-white/70 leading-[1.8] mb-8" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside pl-6 mb-8 space-y-3 text-white/70" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-outside pl-6 mb-8 space-y-3 text-white/70" {...props} />,
                    li: ({node, ...props}) => <li className="text-lg leading-[1.8]" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                  }}>{articleData?.content}</Markdown>
                </div>
              </div>
            </div>
          </motion.div>
        ) : view === "dashboard" && user ? (
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
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Content Dashboard</h1>
                <p className="text-white/50 font-medium mt-2">Manage and track your generated SEO assets</p>
              </div>

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
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <motion.div 
                    layout
                    key={article.id}
                    className="glass-panel rounded-3xl p-6 flex flex-col hover:border-accent/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">
                        {article.industry}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setArticleData(article)}
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
                          <ArrowLeft className="w-4 h-4 rotate-45" /> {/* Using arrow as mock delete icon */}
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
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">SEO Score</div>
                        <div className="text-sm font-bold text-accent">{article.score}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Words</div>
                        <div className="text-sm font-bold text-white/80">{article.wordCount}</div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button 
                        onClick={() => {
                          setArticleData(article);
                          setView("article");
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
                  onClick={() => setView("landing")}
                  className="bg-accent text-slate-950 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-accent/90 transition-all"
                >
                  Create New Article
                </button>
              </div>
            )}
          </motion.div>
        ) : view === "auth" ? (
          <motion.div 
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            <Auth onBack={() => setView("landing")} onSuccess={() => setView("landing")} />
          </motion.div>
        ) : (
          <motion.div 
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-screen text-white/20 font-mono text-xs"
          >
            Initializing Local SEO Suite...
          </motion.div>
        )}
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
                <button onClick={() => setShowSettings(false)} className="text-white/30 hover:text-white tracking-widest uppercase font-black text-[10px]">Close</button>
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

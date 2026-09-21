import { Check, Clipboard, Link2, LockKeyhole, Plus, Scissors, Sparkles, Zap } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const PREFIX = "#s/";

function encode(value: string) {
  return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeURIComponent(escape(atob(padded)));
}
function validUrl(value: string) {
  try { const parsed = new URL(value); return parsed.protocol === "http:" || parsed.protocol === "https:"; }
  catch { return false; }
}

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!window.location.hash.startsWith(PREFIX)) return;
    try {
      const target = decode(window.location.hash.slice(PREFIX.length));
      if (validUrl(target)) window.location.replace(target);
    } catch { window.history.replaceState(null, "", window.location.pathname); }
  }, []);

  const displayUrl = useMemo(() => shortUrl.replace(window.location.origin, "yourdomain.com"), [shortUrl]);
  function shorten(event: FormEvent) {
    event.preventDefault();
    const clean = url.trim();
    if (!clean) return setError("একটি URL লিখুন");
    if (!validUrl(clean)) return setError("সঠিক http:// অথবা https:// URL দিন");
    setShortUrl(`${window.location.origin}${window.location.pathname}${PREFIX}${encode(clean)}`);
    setError(""); setCopied(false);
  }
  async function copy() {
    await navigator.clipboard.writeText(shortUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  }
  function reset() { setUrl(""); setShortUrl(""); setError(""); setCopied(false); }

  return <div className="page">
    <header className="header">
      <a className="brand" href="./"><span className="brand-mark"><Scissors size={18} /></span><span>ছোট্ট<span className="dot">.</span>লিংক</span></a>
      <div className="header-note"><span className="status-dot" /> দ্রুত, সহজ, ব্যক্তিগত</div>
    </header>
    <main className="main">
      <section className="hero"><div className="eyebrow"><Sparkles size={14} /> লিংক শেয়ারিং, নতুন করে</div><h1>আপনার লিংককে<br /><span>ছোট করে দিন।</span></h1><p>লম্বা URL-কে একটি সুন্দর, শেয়ার-যোগ্য লিংকে পরিণত করুন। কোনো অ্যাকাউন্ট নয়, কোনো জটিলতা নয়।</p></section>
      <section className="card">
        <form onSubmit={shorten}><label htmlFor="url">আপনার লম্বা URL এখানে পেস্ট করুন</label><div className={`input-row ${error ? "error" : ""}`}><Link2 className="input-icon" size={20} /><input id="url" value={url} onChange={e => { setUrl(e.target.value); setError(""); }} placeholder="https://example.com/your-long-link" type="url" /><button className="shorten" type="submit">ছোট করুন <Zap size={16} fill="currentColor" /></button></div>{error && <p className="error-text">{error}</p>}</form>
        {shortUrl ? <div className="result"><div className="result-title"><span className="success"><Check size={15} /></span> আপনার ছোট লিংক তৈরি হয়েছে</div><div className="result-row"><span className="result-url">{displayUrl}</span><button className="copy" onClick={copy} type="button">{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? "কপি হয়েছে" : "কপি করুন"}</button></div><div className="result-actions"><a href={shortUrl} target="_blank" rel="noreferrer">লিংক খুলুন ↗</a><button onClick={reset} type="button"><Plus size={14} /> নতুন লিংক</button></div></div> : <p className="privacy"><LockKeyhole size={14} /> আপনার URL কোথাও সংরক্ষণ করা হয় না</p>}
      </section>
      <div className="features"><Feature icon={<Zap size={17} />} title="এক ঝলকে" text="কোনো অপেক্ষা নেই" /><Feature icon={<LockKeyhole size={17} />} title="গোপনীয়" text="কোনো ট্র্যাকিং নেই" /><Feature icon={<Link2 size={17} />} title="সর্বত্র কাজ করে" text="সব ব্রাউজারে" /></div>
    </main>
    <footer><span>© ২০২৬ ছোট্ট.লিংক</span><span>সিম্পল রাখা হয়েছে, আপনার জন্য</span></footer>
  </div>;
}
function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="feature"><span className="feature-icon">{icon}</span><div><strong>{title}</strong><span>{text}</span></div></div>; }

export default App;

createRoot(document.getElementById("root")!).render(<App />);

import { useState } from "react";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";
const DARK = "#0d1b2a";

const GRADES = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "College"];
const SUBJECTS = ["English / ELA", "Math", "Science", "Social Studies", "Business", "History", "Art", "PE / Health", "Foreign Language", "Special Education", "Other"];

const LEVELS = [
  { id: "below", label: "⬇️ Below Grade Level", desc: "Simplified language, scaffolding, foundational support", color: "#e07b54" },
  { id: "above", label: "⬆️ Above Grade Level", desc: "Extended challenge, deeper thinking, enrichment", color: "#5ab4e8" },
  { id: "ell", label: "🌍 English Language Learners", desc: "Visual supports, simplified language, vocabulary focus", color: "#7dc97d" },
  { id: "iep", label: "📋 IEP / Special Needs", desc: "Modified objectives, accommodations, step-by-step support", color: "#b07de8" },
];

const ELEMENTS = [
  "Vocabulary & language", "Instructions & directions", "Reading passages",
  "Written responses", "Assessment questions", "Discussion prompts",
  "Assignment complexity", "Visual supports",
];

const inp = (extra = {}) => ({
  width: "100%",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  WebkitAppearance: "none",
  ...extra,
});

const Label = ({ text, required }) => (
  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>
    {text} {required && <span style={{ color: GOLD }}>*</span>}
  </div>
);

const renderContent = (text) =>
  text.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{ height: 7 }} />;
    if (/^#{1,3}\s/.test(t) || /^\*\*[^*]+\*\*$/.test(t)) {
      return (
        <div key={i} style={{ fontWeight: 900, fontSize: 14, color: NAVY, borderLeft: `4px solid ${GOLD}`, paddingLeft: 11, margin: "16px 0 7px" }}>
          {t.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
        </div>
      );
    }
    if (/^\d+\.\s/.test(t)) {
      return (
        <div key={i} style={{ fontWeight: 700, fontSize: 14, color: "#222", paddingLeft: 4, margin: "6px 0" }}>
          {t.replace(/\*\*/g, "")}
        </div>
      );
    }
    if (t.startsWith("-") || t.startsWith("•")) {
      return (
        <div key={i} style={{ display: "flex", gap: 9, margin: "4px 0 4px 8px", fontSize: 13, color: "#333", lineHeight: 1.6 }}>
          <span style={{ color: GOLD, fontWeight: 900, flexShrink: 0 }}>•</span>
          <span>{t.replace(/^[-•]\s*/, "").replace(/\*\*/g, "")}</span>
        </div>
      );
    }
    return <div key={i} style={{ fontSize: 13, color: "#444", lineHeight: 1.75, margin: "2px 0" }}>{t.replace(/\*\*/g, "")}</div>;
  });

export default function App() {
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [selectedLevels, setSelectedLevels] = useState(["below", "above"]);
  const [selectedElements, setSelectedElements] = useState(["Vocabulary & language", "Instructions & directions", "Assignment complexity"]);
  const [extraContext, setExtraContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  const toggleLevel = (id) => {
    setSelectedLevels(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 2) {
        return prev; // Block selection if already at 2
      }
      return [...prev, id];
    });
  };

 const toggleElement = (el) => {
    setSelectedElements(prev => {
      if (prev.includes(el)) {
        return prev.filter(x => x !== el);
      }
      if (prev.length >= 3) {
        return prev; // Block selection if already at 3
      }
      return [...prev, el];
    });
  };

  const buildPrompt = () => {
    const levelsToGenerate = selectedLevels;
    
    return `You are an expert differentiation specialist. Provide specific, actionable modifications to adapt this lesson for different learners.

CRITICAL RULES:
- Use PLAIN TEXT only. No markdown, no asterisks, no hashtags, no bold formatting.
- Do NOT rewrite the entire lesson. Focus on MODIFICATIONS to the original.
- For EACH element selected, provide 2-3 specific changes with examples.
- Be specific and actionable, not vague.
- Total response must be under 700 words.

ORIGINAL LESSON INFO:
Subject: ${subject || "General"}
Grade Level: ${grade || "Not specified"}
Topic: ${topic || "Not specified"}
Elements to Modify: ${selectedElements.join(", ")}
${extraContext ? `Context: ${extraContext}` : ""}

ORIGINAL CONTENT:
"""
${lessonContent}
"""

For EACH learner group below, provide modifications using this format:

[GROUP NAME IN CAPS]

[Element Name]:
- First specific modification with example
- Second specific modification with example
- Third modification if needed

[Next Element Name]:
- First specific modification with example
- Second specific modification with example

Teacher Tips:
- One practical classroom tip for this group
- One tip for materials or setup

IMPORTANT: You MUST address EVERY element listed above for EACH group. Do not skip elements.

${levelsToGenerate.includes("below") ? `BELOW GRADE LEVEL
Simplify language, add scaffolding (sentence starters, word banks, graphic organizers), break tasks into smaller steps, reduce complexity while keeping the core concept. Provide specific examples of simplified text and step breakdowns.` : ""}

${levelsToGenerate.includes("above") ? `ABOVE GRADE LEVEL
Add depth, critical thinking, extension tasks, and higher-order questions (analyze, evaluate, create). Challenge without just adding more work. Provide specific examples of enrichment activities and advanced questions.` : ""}

${levelsToGenerate.includes("ell") ? `ENGLISH LANGUAGE LEARNERS
Simplify sentence structure, define key vocabulary in context, add visual support suggestions, reduce idiomatic language. Provide specific examples of vocabulary supports and visual aids to create.` : ""}

${levelsToGenerate.includes("iep") ? `IEP / SPECIAL NEEDS
Break down steps, reduce written output, offer alternative response formats, include specific accommodations. Provide specific examples of modified tasks and accommodation strategies.` : ""}

Remember: Provide 2-3 specific modifications per element, not just one-liners. Include concrete examples teachers can use immediately.`;
  };

  const generate = async () => {
    if (!lessonContent.trim()) { setError("Please paste your lesson content or describe your lesson."); return; }
    if (selectedLevels.length === 0) { setError("Please select at least one learner group."); return; }
    setError(""); setResults(null); setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() })
      });
      const json = await res.json();
      if (json.error) { setError("Error: " + json.error); return; }
      const text = json.text;
      if (!text) { setError("Nothing returned. Try again."); return; }

      // Parse sections by level headers
      const levelLabels = {
        below: ["BELOW GRADE LEVEL", "BELOW-GRADE LEVEL", "BELOW GRADE"],
        above: ["ABOVE GRADE LEVEL", "ABOVE-GRADE LEVEL", "ABOVE GRADE"],
        ell: ["ENGLISH LANGUAGE LEARNERS", "ELL", "ENGLISH LEARNERS"],
        iep: ["IEP", "IEP / SPECIAL NEEDS", "SPECIAL NEEDS", "IEP/SPECIAL NEEDS"],
      };

      const parsed = {};
      const lines = text.split("\n");
      let currentLevel = null;
      let currentLines = [];

      lines.forEach(line => {
        const upper = line.toUpperCase().trim().replace(/[#*]/g, "").trim();
        let matched = null;
        for (const [key, labels] of Object.entries(levelLabels)) {
          if (selectedLevels.includes(key) && labels.some(l => upper.includes(l))) {
            matched = key;
            break;
          }
        }
        if (matched) {
          if (currentLevel && currentLines.length) {
            parsed[currentLevel] = currentLines.join("\n").trim();
          }
          currentLevel = matched;
          currentLines = [];
        } else if (currentLevel) {
          currentLines.push(line);
        }
      });
      if (currentLevel && currentLines.length) {
        parsed[currentLevel] = currentLines.join("\n").trim();
      }

      // Fallback: if parsing failed, show full text
      if (Object.keys(parsed).length === 0) {
        parsed["below"] = text;
      }

      setResults(parsed);
      setActiveTab(Object.keys(parsed)[0]);
    } catch (e) {
      setError("Request failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getLevelInfo = (id) => LEVELS.find(l => l.id === id);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${DARK} 0%, ${NAVY} 100%)`, fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "0 0 80px" }}>

      {/* NAV */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: 1 }}>
          4THDMC <span style={{ color: GOLD }}>|</span> EVOLVE
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Teacher Toolkit</div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 18px" }}>

        {/* HEADER */}
        {!results && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "inline-block", border: `1px solid ${GOLD}`, color: GOLD, fontSize: 10, letterSpacing: 4, padding: "4px 14px", marginBottom: 12, fontWeight: 700, borderRadius: 2, textTransform: "uppercase" }}>
              4THDMC | EVOLVE
            </div>
            <div style={{ fontSize: "clamp(28px, 7vw, 44px)", fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
              DIFFERENTIATION<br /><span style={{ color: GOLD }}>HELPER</span>
            </div>
            <div style={{ width: 40, height: 3, background: GOLD, margin: "12px 0 8px" }} />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontStyle: "italic" }}>
              One lesson. Every learner. Done in seconds.
            </div>
          </div>
        )}

        {!results && (
          <>
            {/* LESSON INPUT */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "22px 18px", marginBottom: 16 }}>
              <div style={{ color: GOLD, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 18 }}>✦ Your Lesson</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <Label text="Subject" />
                  <select value={subject} onChange={e => setSubject(e.target.value)} style={inp({ background: "#162d52", color: subject ? "#fff" : "rgba(255,255,255,0.35)" })}>
                    <option value="">Select...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label text="Grade Level" />
                  <select value={grade} onChange={e => setGrade(e.target.value)} style={inp({ background: "#162d52", color: grade ? "#fff" : "rgba(255,255,255,0.35)" })}>
                    <option value="">Select...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <Label text="Topic" />
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Supply and Demand, Reading Comprehension..." style={inp()} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <Label text="Paste Your Lesson, Activity, or Assignment" required />
                <textarea
                  value={lessonContent}
                  onChange={e => setLessonContent(e.target.value)}
                  placeholder="Paste your lesson plan, assignment instructions, reading passage, discussion questions — anything you want differentiated..."
                  rows={7}
                  style={{ ...inp(), resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              <div>
                <Label text="Extra Context (optional)" />
                <input value={extraContext} onChange={e => setExtraContext(e.target.value)}
                  placeholder="e.g. High ELL population, 3 students with dyslexia, advanced honors class..."
                  style={inp()} />
              </div>
            </div>

            {/* LEARNER GROUPS */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "22px 18px", marginBottom: 16 }}>
              <div style={{ color: GOLD, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>✦ Generate Versions For</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 16 }}>Select up to 2 learner groups per use</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LEVELS.map(({ id, label, desc, color }) => {
                  const isOnLevel = id === "onlevel";
                  const selected = isOnLevel ? false : selectedLevels.includes(id);
                  return (
                    <button key={id} onClick={() => toggleLevel(id)} disabled={isOnLevel} style={{
                      padding: "13px 16px", borderRadius: 10, cursor: isOnLevel ? "default" : "pointer",
                      textAlign: "left", display: "flex", alignItems: "center", gap: 14,
                      border: `1px solid ${selected ? color : "rgba(255,255,255,0.12)"}`,
                      background: selected ? `${color}18` : isOnLevel ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.02)",
                      opacity: isOnLevel ? 0.4 : 1,
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${selected ? color : "rgba(255,255,255,0.25)"}`,
                        background: selected ? color : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {selected && <span style={{ color: DARK, fontSize: 12, fontWeight: 900 }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: selected ? color : "#fff", marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ELEMENTS TO DIFFERENTIATE */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "22px 18px", marginBottom: 16 }}>
              <div style={{ color: GOLD, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>✦ What To Differentiate</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 14 }}>Select up to 3 elements to modify per use</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ELEMENTS.map(el => (
                  <button key={el} onClick={() => toggleElement(el)} style={{
                    padding: "7px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${selectedElements.includes(el) ? GOLD : "rgba(255,255,255,0.18)"}`,
                    background: selectedElements.includes(el) ? "rgba(201,168,76,0.18)" : "transparent",
                    color: selectedElements.includes(el) ? GOLD : "rgba(255,255,255,0.5)",
                  }}>{el}</button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff9090", padding: "12px 16px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <button onClick={generate} disabled={loading} style={{
              width: "100%", padding: 18, background: loading ? "rgba(201,168,76,0.4)" : GOLD,
              color: DARK, border: "none", borderRadius: 12, fontWeight: 900,
              fontSize: 16, letterSpacing: 3, cursor: loading ? "not-allowed" : "pointer",
              textTransform: "uppercase", boxShadow: loading ? "none" : "0 4px 24px rgba(201,168,76,0.3)",
            }}>
              {loading ? "⏳  Differentiating Your Lesson..." : "DIFFERENTIATE THIS LESSON"}
            </button>
          </>
        )}

        {/* RESULTS */}
        {results && (
          <div>
            {/* Result header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "inline-block", border: `1px solid ${GOLD}`, color: GOLD, fontSize: 10, letterSpacing: 4, padding: "4px 14px", marginBottom: 10, fontWeight: 700, borderRadius: 2, textTransform: "uppercase" }}>
                4THDMC | EVOLVE
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                DIFFERENTIATED<br /><span style={{ color: GOLD }}>VERSIONS READY</span>
              </div>
              <div style={{ width: 40, height: 3, background: GOLD, margin: "10px 0 6px" }} />
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                {topic || "Your lesson"} · {grade || ""} {subject || ""}
              </div>
            </div>

            {/* TAB SWITCHER */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {Object.keys(results).map(key => {
                const level = getLevelInfo(key);
                const isActive = activeTab === key;
                return (
                  <button key={key} onClick={() => setActiveTab(key)} style={{
                    padding: "9px 16px", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: `1px solid ${isActive ? (level?.color || GOLD) : "rgba(255,255,255,0.18)"}`,
                    background: isActive ? `${level?.color || GOLD}20` : "transparent",
                    color: isActive ? (level?.color || GOLD) : "rgba(255,255,255,0.45)",
                  }}>
                    {level?.label || key}
                  </button>
                );
              })}
            </div>

            {/* ACTIVE TAB CONTENT */}
            {activeTab && results[activeTab] && (
              <div style={{ background: "#fff", borderRadius: 14, padding: "22px 18px", boxShadow: "0 16px 50px rgba(0,0,0,0.4)", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${getLevelInfo(activeTab)?.color || GOLD}`, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: NAVY }}>{getLevelInfo(activeTab)?.label}</div>
                    <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>{getLevelInfo(activeTab)?.desc}</div>
                  </div>
                  <div style={{ background: `${getLevelInfo(activeTab)?.color}18`, border: `1px solid ${getLevelInfo(activeTab)?.color || GOLD}`, color: getLevelInfo(activeTab)?.color || GOLD, fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                    Ready ✓
                  </div>
                </div>
                <div>{renderContent(results[activeTab])}</div>
                <button onClick={() => copy(activeTab, results[activeTab])} style={{
                  width: "100%", padding: "13px", marginTop: 18,
                  background: copiedKey === activeTab ? "#2a9d5c" : NAVY,
                  color: "#fff", border: "none", borderRadius: 8,
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: 1, transition: "background 0.2s",
                }}>
                  {copiedKey === activeTab ? "✓ Copied!" : "📋 Copy This Version"}
                </button>
              </div>
            )}

            <button onClick={() => { setResults(null); setLessonContent(""); setExtraContext(""); setTopic(""); }} style={{
              width: "100%", padding: 15, background: "transparent",
              color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              ← Differentiate Another Lesson
            </button>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginTop: 20 }}>
        Powered by <span style={{ color: "rgba(201,168,76,0.35)" }}>4THDMC | EVOLVE LLC </span> · Brandon Russell
      </div>
    </div>
  );
}

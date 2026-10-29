/* =====================================================================
   IA de Spectra Motion : Gemini via Firebase AI Logic (projet Studio Prism), sans serveur et sans clé secrète
   (même mécanisme que SPECTRA Writer). À activer une fois dans la console Firebase : AI Logic → Commencer → « Gemini Developer API ».
   Le SDK n'est chargé qu'à la première demande. Limite quotidienne par compte (gratuit / licence), en plus des quotas de la console.
   Fonctions : design à partir d'une description, rédaction et traduction, sous-titres automatiques (transcription d'un son).
   ===================================================================== */
const AI_SDK = '13.0.0';
const AI_MODELS = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.5-flash'];
const AI_DAY = {free:25, pro:300, admin:1000};
let aiInit = null, aiBlocked = '', aiBlockedAt = 0;
const aiGone = new Set();
const aiDayKey = () => `sm.ai.${me?.uid || 'x'}.${new Date().toISOString().slice(0, 10)}`;
const aiUsed = () => +store.get(aiDayKey()) || 0;
const aiLimit = () => AI_DAY[planKey()] || AI_DAY.free;
function aiWhy(){
  if (!FIREBASE_CONFIG) return 'L\'IA fonctionne sur le site en ligne de Spectra Motion, avec votre compte Studio Prism (cette démonstration n\'a pas d\'IA).';
  if (!me) return 'Connectez-vous pour utiliser l\'IA.';
  if (aiBlocked && Date.now() - aiBlockedAt < 30000) return aiBlocked;
  if (aiUsed() >= aiLimit()) return `Vous avez utilisé vos ${aiLimit()} demandes à l'IA du jour${planKey() === 'free' ? ' (offre gratuite). Une licence Spectra Motion en donne bien plus.' : '.'} Le compteur repart demain.`;
  return '';
}
async function aiModel(sys, name, json = true){
  if (!aiInit) aiInit = (async () => {
    const base = `https://www.gstatic.com/firebasejs/${AI_SDK}/`;
    const [A, I] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-ai.js')]);
    const app = A.getApps().find(x => x.name === 'sm-ai') || A.initializeApp(FIREBASE_CONFIG, 'sm-ai');
    return {I, ai:I.getAI(app, {backend:new I.GoogleAIBackend()})};
  })().catch(e => { aiInit = null; throw e; });
  const {I, ai} = await aiInit;
  return I.getGenerativeModel(ai, {model:name, systemInstruction:sys, generationConfig:{...(json ? {responseMimeType:'application/json'} : {}), temperature:.8, maxOutputTokens:16384}});
}
function aiParse(t){
  t = String(t || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(t); } catch(e){}
  const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a){ try { return JSON.parse(t.slice(a, b + 1)); } catch(e){} }
  throw new Error('L\'IA a renvoyé une réponse illisible. Réessayez.');
}
function aiErr(e){
  const m = String(e?.message || e || ''), code = String(e?.code || '');
  if (/Template-Only Mode/i.test(m)) return {fatal:true, msg:'Le projet Firebase est en « mode modèles uniquement ». Console Firebase → AI Logic → Paramètres → désactiver « Appliquer le mode modèles uniquement ».'};
  if (/api-not-enabled|has not been used|SERVICE_DISABLED|requires the Firebase AI API/i.test(m + ' ' + code)) return {fatal:true, msg:'L\'IA n\'est pas encore activée sur le projet Studio Prism : console Firebase → AI Logic → « Commencer » (Gemini Developer API).'};
  if (/app.?check/i.test(m)) return {msg:'Demande refusée par App Check (protection du projet Firebase).'};
  if (/API key|API_KEY|referer|referrer/i.test(m)) return {msg:'La clé du projet Firebase refuse cette demande : autorisez « Firebase AI Logic » pour cette clé (Google Cloud → Identifiants).'};
  if (/403|PERMISSION_DENIED/i.test(m)) return {msg:'Le projet Firebase a refusé la demande (403).'};
  if (/404|not found|is not supported|unknown model/i.test(m)) return {model:true, msg:'Modèle indisponible.'};
  if (/\b429\b|RESOURCE_EXHAUSTED|exceeded your current quota/i.test(m)){
    const wait = Math.ceil(parseFloat((m.match(/retry in ([\d.]+)s/i) || [])[1]) || 60), day = /per.?day|daily/i.test(m);
    return {busy:true, wait:day ? 0 : wait, msg:day ? 'Le quota gratuit du jour de l\'IA (Google) est épuisé pour tout le projet Studio Prism. Il repart demain.' : `Le quota gratuit de l'IA est atteint pour le moment. Réessayez dans ${wait} s.`};
  }
  if (/\b(500|503)\b|high demand|overloaded|UNAVAILABLE/i.test(m)) return {busy:true, wait:3, msg:'Les serveurs de Google sont très sollicités. Réessayez dans quelques secondes.'};
  if (/blocked|SAFETY|finishReason/i.test(m)) return {msg:'L\'IA a refusé cette demande. Reformulez-la autrement.'};
  if (/Failed to fetch|NetworkError|network|import/i.test(m)) return {msg:'Impossible de joindre l\'IA. Vérifiez votre connexion internet.'};
  return {msg:'Erreur de l\'IA : ' + m.slice(0, 220)};
}
async function aiCall(sys, parts, onWait){
  const why = aiWhy(); if (why) throw new Error(why);
  const list = AI_MODELS.filter(n => !aiGone.has(n)); let last = null, waited = false;
  for (let i = 0; i < list.length; i++){
    try {
      const model = await aiModel(sys, list[i]);
      const r = await withTimeout(model.generateContent(parts), 120000, 'ai/timeout');
      store.set(aiDayKey(), aiUsed() + 1);
      return aiParse(r.response.text());
    } catch(e){
      if (e?.code === 'ai/timeout') throw new Error('L\'IA a mis trop de temps à répondre. Réessayez avec une demande plus courte.');
      if (e instanceof Error && /illisible/.test(e.message)) throw e;
      const x = aiErr(e); console.warn('[Spectra Motion] IA', list[i], e); last = x;
      if (x.model){ aiGone.add(list[i]); continue; }
      if (x.busy){ if (i < list.length - 1) continue; if (!waited && x.wait && x.wait <= 30){ waited = true; onWait?.(x.wait); await sleep(x.wait * 1000 + 300); i = -1; continue; } }
      if (x.fatal){ aiBlocked = x.msg; aiBlockedAt = Date.now(); }
      throw new Error(x.msg);
    }
  }
  throw new Error(last?.msg || 'Aucun modèle d\'IA disponible pour le moment.');
}
/* l'éditeur fournit les consignes (schéma du design) ; ce module ne fait que transmettre et compter */
window.SMAI = {
  available:() => !aiWhy(), why:aiWhy, left:() => Math.max(0, aiLimit() - aiUsed()), limit:aiLimit,
  json:(sys, prompt, onWait) => aiCall(sys, prompt, onWait),
  /* son (WAV en base64) + consigne → JSON */
  audio:(sys, b64, prompt, onWait) => aiCall(sys, [{inlineData:{mimeType:'audio/wav', data:b64}}, {text:prompt}], onWait),
};

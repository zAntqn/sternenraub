/**
 * Einstiegspunkt für den Einpacker.
 *
 * Der Einpacker (werkzeug\bauen.ps1) braucht eine Vorlage mit einer Marke.
 * Hier steht deshalb nichts als die Marke — der eigentliche Server ist
 * server\server.js, die Schiedsrichterin netz\raum.js.
 *
 * Ergebnis: web\server\main.js — eine Datei, keine Importe, direkt von
 * Deno Deploy ausführbar.
 */
/* ===== engine\src\engine\config.js ===== */
/**
 * ============================================================
 *  STERNENRAUB — Konfiguration
 * ============================================================
 *  Hier stehen ALLE Zahlen, an denen man zum Balancing drehen kann.
 *  Im restlichen Code steht keine einzige Spielzahl hart drin.
 *
 *  Nach jeder Änderung einfach neu simulieren:
 *      node src/sim/run.js
 * ============================================================
 */

const CONFIG = {

  /* ---------- Kartenverteilung im Deck ---------- */
  deck: {
    zahlenMin: 1,             // kleinster Zahlenwert
    zahlenMax: 12,            // größter Zahlenwert
    kopienProZahl: 6,         // wie oft jeder Zahlenwert vorkommt  -> 12*6 = 72

    kosmisch: {
      SCHWARZES_LOCH: 2,
      WEISSES_LOCH:   2,
      URKNALL:        2,
      MILCHSTRASSE:   2,
      STERNSCHNUPPE:  3,      // Joker
    },
    // Die Nova liegt von Beginn an offen aus und ist NICHT im Deck.
    novaImSpiel: true,
  },

  /* ---------- Grundgerüst der Partie ---------- */
  spiel: {
    runden: 8,
    handkarten: 4,            // Handkartenzahl, auf die am Zugende aufgefüllt wird
    minSpieler: 2,
    maxSpieler: 4,

    // Zahlenkarten in der Mitte  =  Rundennummer + mitteBasis
    mitteBasis: 4,

    // Züge pro Spieler und Runde =  Rundennummer + zuegeBasis[spielerzahl]
    zuegeBasis: { 2: 2, 3: 2, 4: 1 },
  },

  /* ---------- Der Zug ---------- */
  zug: {
    kosmischeProZug: 1,             // Teil 1: höchstens so viele kosmische Karten
    bauenMinHandkarten: 1,          // Bauen/Erweitern: mindestens so viele eigene Handkarten
    bauenMaxAusMitte: 2,            // ... und höchstens so viele Karten aus der Mitte
    klauenMinHandkarten: 2,         // Klauen: mindestens so viele eigene Handkarten
    klauenMaxAusMitte: 2,           // ... und höchstens so viele Karten aus der Mitte
    versiegelnProRunde: 2,          // Versiegelungen pro Spieler und Runde
    // Nicht-Joker-Sonderkarten in der Mitte: bleiben liegen (false) oder dürfen mitgenommen werden (true).
    // Der Joker ist davon unabhängig — er ist Teil eines Sternbilds und wird immer mitgenommen.
    kosmischeAusMitteNehmbar: false,
    // GESTRICHEN (Regelwerk, Abschnitt "Klauen"): "Es gibt keinen Weg, einen verbauten
    // Joker nachträglich loszuwerden. Wer sein Sternbild schützen will, muss versiegeln."
    jokerTauschErlaubt: false,
    jokerKlauErlaubt: true,         // Gegner mit der echten Karte darf den Joker herausklauen (Aktion)
    // Der Dieb muss mit dem erbeuteten Joker im selben Zug ein NEUES Sternbild bauen.
    // Ohne diese Bedingung würde jeder jeden Joker abgreifen und in ein bestehendes
    // eigenes Sternbild schieben.
    jokerKlauBrauchtNeuesSternbild: true,
  },

  /* ---------- Sternbilder ---------- */
  sternbild: {
    minKarten: 3,
    maxKarten: 6,             // Ausnahme: der Drache (siehe drache.karten)
  },

  /* ---------- Punktwerte ---------- */
  punkte: {
    // nach Kartenzahl
    PFEIL:  { 3: 2, 4: 3, 5: 6, 6: 9 },
    WAGEN:  { 3: 2, 4: 4, 5: 6, 6: 8 },
    // feste Werte
    KRONE:       5,
    KREUZ:      11,
    ZWILLING:    6,
    DOPPELSTIER:10,
    DRACHE:     22,
  },

  /* ---------- Wagen ---------- */
  wagen: {
    minSchrittweite: 2,       // Pfeil hat 1, Wagen mindestens das hier
  },

  /* ---------- Der Drache ---------- */
  drache: {
    karten: 12,               // zwei fertige Sechser-Pfeile
    teilLaenge: 6,            // Länge jedes Teil-Pfeils
    mitJokerErlaubt: false,   // Drache lässt sich nicht mit Joker abschließen
    kostetZug: true,          // das Zusammensetzen kostet eine Aktion
  },

  /* ---------- Der Himmel ---------- */
  himmel: {
    bonus: 20,
    minKartenProSternbild: 4,
    // diese Sternbilder müssen alle gleichzeitig ausliegen
    benoetigteTypen: ['PFEIL', 'WAGEN', 'KRONE', 'KREUZ', 'ZWILLING', 'DOPPELSTIER'],
    gibtSchwarzesLoch: true,  // sofortiges Schwarzes Loch gegen einen Gegner
    versiegeltAlles: true,    // alle eigenen Sternbilder werden sofort versiegelt
    nurEinmalProSpieler: true,
  },

  /* ---------- Klauen ---------- */
  klauen: {
    entschaedigungProKarte: 1, // Punkte, die der Bestohlene sofort gutgeschrieben bekommt
    mussMehrPunkteBringen: true,
  },

  /* ---------- Kosmische Karten ---------- */
  kosmisch: {
    milchstrasseKarten: 3,     // "ziehe 3 Karten"
    weissesLochKarten: 1,      // Karten, die man aus einem fremden Sternbild zieht
    kreuzMitJokerErlaubt: false, // Kreuz lässt sich nicht mit Joker abschließen
    // Wohin gehen Karten zerstörter Sternbilder (Schwarzes Loch, Urknall, Weißes Loch)?
    //   'MITTE'  = wie ursprünglich aufgeschrieben. Die Mitte wächst dann unbegrenzt,
    //              gemessen bis 27 Karten in Runde 4 — der Tisch wird unübersichtlich.
    //   'ABLAGE' = Antons Entscheidung vom 4. September 2026. Die Mitte gibt nie
    //              Karten ab, der Ablagestapel wird zurückgemischt. Hält den Tisch
    //              übersichtlich und wirkt gegen den Kartenmangel in späten Runden.
    zerstoerteKartenNach: 'ABLAGE',

    // Nova
    novaZerstoertAuchSicher: true,
    novaKartenAufAblage: true,
    novaIstFreieAktion: true,
  },

  /* ---------- Bot-Stellschrauben ---------- */
  bots: {
    normal: {
      // Versiegeln
      versiegelnMinPunkte: 6,        // darunter wird nie versiegelt ("kleine Sternbilder offen lassen")
      risikoKlaubar: 0.55,           // geschätztes Risiko, wenn ein Gegner es übernehmen könnte
      risikoNurKosmisch: 0.16,       // Grundrisiko durch Schwarzes Loch / Urknall / Nova

      // Bewertung von Bauzügen
      sicherBonus: 1.0,              // Bonus, wenn das Ergebnis nicht mehr wachsen kann
      kartenEinsatzMalus: 0.3,       // sparsam mit Karten umgehen
      abwurfMalus: 0.3,

      // Klauen
      klauGrundBonus: 1.5,           // Klauen schadet dem Gegner zusätzlich
      klauFastSicherBonus: 2.0,      // bevorzugt Ziele kurz vor dem Sicherwerden

      // Fernziele. ACHTUNG: In der aktuellen Balance sind Drache und Himmel
      // praktisch unerreichbar — hohe Werte machen den Bot messbar schwächer.
      drachenBonus: 4.0,
      drachenTeilBonus: 2.0,
      himmelSchwelleTypen: 5,        // ab so vielen verschiedenen Typen wird der Himmel verfolgt
      himmelBonus: 3.0,

      // Kosmische Karten aufsparen
      schwarzesLochMinPunkte: 3,     // aufheben, bis das Ziel so viel wert ist
      weissesLochMinPunkte: 3,
      urknallMinVorteil: 3,          // nur wenn Gegner deutlich mehr offen liegen haben
      novaMinPunkte: 8,              // Nova für die dicken Fische
      // Am Rundenende sind zerstörte Punkte endgültig weg — dann wird abgedrückt,
      // egal wie hoch die Schwelle sonst ist.
      endspurtZuege: 2,              // ab so vielen Restzügen gilt "Rundenende"
      novaLetzteRunde: true,         // spätestens in der Schlussrunde die Nova zünden
    },
  },

  /* ---------- Simulation ---------- */
  sim: {
    partienProSpielerzahl: 100,
    spielerzahlen: [2, 3, 4],
    seed: 20260903,
    maxZuegeSicherung: 5000,   // Notbremse gegen Endlosschleifen
  },
};

/** Züge pro Spieler in Runde `runde` bei `spielerzahl` Spielern. */
function zuegeInRunde(runde, spielerzahl) {
  const basis = CONFIG.spiel.zuegeBasis[spielerzahl] ?? 1;
  return runde + basis;
}

/** Anzahl nutzbarer Zahlenkarten in der Mitte in Runde `runde`. */
function mitteGroesse(runde) {
  return runde + CONFIG.spiel.mitteBasis;
}

/* ===== engine\src\engine\cards.js ===== */
/**
 * Karten und Deck.
 */

/** @typedef {'ZAHL'|'SCHWARZES_LOCH'|'WEISSES_LOCH'|'URKNALL'|'MILCHSTRASSE'|'STERNSCHNUPPE'|'NOVA'} KartenArt */

/**
 * @typedef {Object} Karte
 * @property {number} id     eindeutige Karten-ID
 * @property {KartenArt} art
 * @property {number|null} wert  Zahlenwert (nur bei art==='ZAHL')
 */

const KOSMISCH_ARTEN = ['SCHWARZES_LOCH', 'WEISSES_LOCH', 'URKNALL', 'MILCHSTRASSE', 'STERNSCHNUPPE'];
/** Kosmische Karten, die als Teil 1 des Zuges ausgespielt werden (Joker gehört NICHT dazu). */
const AKTIONS_KOSMISCH = ['SCHWARZES_LOCH', 'WEISSES_LOCH', 'URKNALL', 'MILCHSTRASSE'];

const istZahl   = (k) => k.art === 'ZAHL';
const istJoker  = (k) => k.art === 'STERNSCHNUPPE';
/** Karten, die in einem Sternbild liegen dürfen. */
const istBaubar = (k) => k.art === 'ZAHL' || k.art === 'STERNSCHNUPPE';

/** Baut das komplette Deck (ohne Nova) und gibt zusätzlich die Nova zurück. */
function baueDeck() {
  const karten = [];
  let id = 0;
  const d = CONFIG.deck;

  for (let w = d.zahlenMin; w <= d.zahlenMax; w++) {
    for (let i = 0; i < d.kopienProZahl; i++) {
      karten.push({ id: id++, art: 'ZAHL', wert: w });
    }
  }
  for (const [art, anzahl] of Object.entries(d.kosmisch)) {
    for (let i = 0; i < anzahl; i++) {
      karten.push({ id: id++, art, wert: null });
    }
  }
  const nova = d.novaImSpiel ? { id: id++, art: 'NOVA', wert: null } : null;
  return { deck: karten, nova };
}

function kartenName(k) {
  if (k.art === 'ZAHL') return String(k.wert);
  return ({
    SCHWARZES_LOCH: '🕳 Schwarzes Loch',
    WEISSES_LOCH: '⚪ Weißes Loch',
    URKNALL: '💥 Urknall',
    MILCHSTRASSE: '🌌 Milchstraße',
    STERNSCHNUPPE: '☄ Sternschnuppe',
    NOVA: '✹ Nova',
  })[k.art] ?? k.art;
}

/* ===== engine\src\engine\constellation.js ===== */
/**
 * Sternbild-Erkennung und Bewertung.
 *
 * Ein Sternbild ist eine Menge von Zahlenkarten (plus evtl. Joker).
 * Diese Datei sagt: Ist das gültig? Welcher Typ? Wie viele Punkte?
 *
 * Für Tempo wird eine Kartenmenge als EINE Zahl kodiert:
 *   schluessel = Summe über alle Karten von 7^wert   (Joker = 7^0 = 1)
 * Da jeder Wert höchstens sechsmal vorkommt, ist das eindeutig, und zwei
 * Mengen lassen sich durch simple Addition zusammenfügen.
 */

/** @typedef {'PFEIL'|'WAGEN'|'KRONE'|'KREUZ'|'ZWILLING'|'DOPPELSTIER'|'DRACHE'} SternbildTyp */

const LO = CONFIG.deck.zahlenMin;
const HI = CONFIG.deck.zahlenMax;

const POW7 = [];
for (let i = 0; i <= HI; i++) POW7[i] = 7 ** i;

const UNGUELTIG = Object.freeze({ gueltig: false, typ: null, punkte: 0, groesse: 0, werte: null });

/** Karte -> Code (Zahlenwert, Joker = 0). Andere kosmische Karten: -1 */
function kartenCode(k) {
  if (k.art === 'ZAHL') return k.wert;
  if (k.art === 'STERNSCHNUPPE') return 0;
  return -1;
}

function schluesselVonCodes(codes) {
  let s = 0;
  for (const c of codes) { if (c < 0) return -1; s += POW7[c]; }
  return s;
}

function schluesselVonKarten(karten) {
  let s = 0;
  for (const k of karten) { const c = kartenCode(k); if (c < 0) return -1; s += POW7[c]; }
  return s;
}

/* ------------------------------------------------------------------ */
/*  Klassifikation aus einem Häufigkeitsvektor                          */
/* ------------------------------------------------------------------ */

const zaehler = new Array(HI + 1);

/** @returns {import('./constellation.js').Bewertung} */
function klassifiziereSchluessel(key, n) {
  const P = CONFIG.punkte;

  let rest = key;
  for (let v = 0; v <= HI; v++) { zaehler[v] = rest % 7; rest = (rest - zaehler[v]) / 7; }
  if (zaehler[0] !== 0) return UNGUELTIG;   // Joker müssen vorher aufgelöst sein

  /* Drache: genau 1–12, je einmal */
  if (n === CONFIG.drache.karten) {
    for (let v = LO; v <= HI; v++) if (zaehler[v] !== 1) return UNGUELTIG;
    const werte = []; for (let v = LO; v <= HI; v++) werte.push(v);
    return { gueltig: true, typ: 'DRACHE', punkte: P.DRACHE, groesse: n, werte };
  }
  if (n < CONFIG.sternbild.minKarten || n > CONFIG.sternbild.maxKarten) return UNGUELTIG;

  const werte = [];
  let paare = 0, drillinge = 0, vierlinge = 0, verschiedene = 0, mehrAlsVier = false;
  for (let v = LO; v <= HI; v++) {
    const c = zaehler[v];
    if (c === 0) continue;
    verschiedene++;
    for (let i = 0; i < c; i++) werte.push(v);
    if (c === 2) paare++;
    else if (c === 3) drillinge++;
    else if (c === 4) vierlinge++;
    else if (c > 4) mehrAlsVier = true;
  }
  if (mehrAlsVier) return UNGUELTIG;

  if (n === 4 && vierlinge === 1) return { gueltig: true, typ: 'KREUZ', punkte: P.KREUZ, groesse: n, werte };
  if (n === 5 && drillinge === 1 && paare === 1) return { gueltig: true, typ: 'KRONE', punkte: P.KRONE, groesse: n, werte };
  if (n === 6 && drillinge === 2) return { gueltig: true, typ: 'DOPPELSTIER', punkte: P.DOPPELSTIER, groesse: n, werte };
  if (n === 6 && paare === 3) return { gueltig: true, typ: 'ZWILLING', punkte: P.ZWILLING, groesse: n, werte };

  if (verschiedene === n) {
    const d = werte[1] - werte[0];
    for (let i = 2; i < n; i++) if (werte[i] - werte[i - 1] !== d) return UNGUELTIG;
    if (d === 1) { const p = P.PFEIL[n]; return p == null ? UNGUELTIG : { gueltig: true, typ: 'PFEIL', punkte: p, groesse: n, werte }; }
    if (d >= CONFIG.wagen.minSchrittweite) { const p = P.WAGEN[n]; return p == null ? UNGUELTIG : { gueltig: true, typ: 'WAGEN', punkte: p, groesse: n, werte }; }
  }
  return UNGUELTIG;
}

/* ------------------------------------------------------------------ */
/*  Joker-Auflösung                                                    */
/* ------------------------------------------------------------------ */

/** Vorberechnete Schlüssel-Zuschläge für j Joker (alle Wertkombinationen). */
const jokerDeltas = new Map();
function deltasFuer(j) {
  let d = jokerDeltas.get(j);
  if (d) return d;
  d = [];
  const rek = (start, rest, summe) => {
    if (rest === 0) { d.push(summe); return; }
    for (let v = start; v <= HI; v++) rek(v, rest - 1, summe + POW7[v]);
  };
  rek(LO, j, 0);
  jokerDeltas.set(j, d);
  return d;
}

const cache = new Map();

/**
 * Bewertet eine Kartenmenge über ihren Schlüssel.
 * @param {number} key       Summe der 7^wert (Joker = 1)
 * @param {number} n         Kartenzahl
 */
function bewerteSchluessel(key, n) {
  if (key < 0) return UNGUELTIG;
  const merk = key * 16 + n;
  const hit = cache.get(merk);
  if (hit !== undefined) return hit;

  const joker = key % 7;
  let best = UNGUELTIG;
  if (joker === 0) {
    best = klassifiziereSchluessel(key, n);
  } else {
    const ohne = key - joker;
    for (const delta of deltasFuer(joker)) {
      const b = klassifiziereSchluessel(ohne + delta, n);
      if (!b.gueltig) continue;
      if (b.typ === 'KREUZ' && !CONFIG.kosmisch.kreuzMitJokerErlaubt) continue;
      if (b.typ === 'DRACHE' && !CONFIG.drache.mitJokerErlaubt) continue;
      if (b.punkte > best.punkte) best = b;
    }
  }
  cache.set(merk, best);
  return best;
}

/** Cache leeren — nötig, wenn zur Laufzeit an der CONFIG gedreht wird. */
function cacheLeeren() { cache.clear(); jokerDeltas.clear(); }

/* ------------------------------------------------------------------ */
/*  Bequeme Schnittstellen                                             */
/* ------------------------------------------------------------------ */

/** @param {number[]} zahlenWerte @param {number} joker */
function bewerteWerte(zahlenWerte, joker = 0) {
  let key = joker;
  for (const w of zahlenWerte) key += POW7[w];
  return bewerteSchluessel(key, zahlenWerte.length + joker);
}

/** @param {import('./cards.js').Karte[]} karten */
function bewerte(karten) {
  return bewerteSchluessel(schluesselVonKarten(karten), karten.length);
}

/* ------------------------------------------------------------------ */
/*  Schutz                                                             */
/* ------------------------------------------------------------------ */

/** "Was nicht mehr wachsen kann, ist fertig und sicher." */
function istSicher(sb) {
  if (sb.versiegelt) return true;
  const b = bewerte(sb.karten);
  if (!b.gueltig) return false;
  if (b.typ === 'DRACHE' || b.typ === 'KREUZ') return true;
  return b.groesse >= CONFIG.sternbild.maxKarten;
}

const punkteVon = (sb) => bewerte(sb.karten).punkte;
const typVon = (sb) => bewerte(sb.karten).typ;

/** Zwei Sechser-Pfeile, die zusammen genau 1–12 ergeben? */
function bildenDrachen(a, b) {
  const ba = bewerte(a.karten), bb = bewerte(b.karten);
  if (!ba.gueltig || !bb.gueltig) return false;
  if (ba.typ !== 'PFEIL' || bb.typ !== 'PFEIL') return false;
  if (ba.groesse !== CONFIG.drache.teilLaenge || bb.groesse !== CONFIG.drache.teilLaenge) return false;
  if (!CONFIG.drache.mitJokerErlaubt) {
    if (a.karten.some((k) => k.art === 'STERNSCHNUPPE') || b.karten.some((k) => k.art === 'STERNSCHNUPPE')) return false;
  }
  const key = schluesselVonKarten(a.karten) + schluesselVonKarten(b.karten);
  return bewerteSchluessel(key, a.karten.length + b.karten.length).typ === 'DRACHE';
}

/** Welche Werte vertreten die Joker in der besten Auslegung? */
function jokerWerte(karten) {
  const b = bewerte(karten);
  if (!b.gueltig || !b.werte) return [];
  const rest = [...b.werte];
  for (const k of karten) {
    if (k.art !== 'ZAHL') continue;
    const i = rest.indexOf(k.wert);
    if (i >= 0) rest.splice(i, 1);
  }
  return rest;
}

/* ===== engine\src\engine\moves.js ===== */
/**
 * Zuggenerierung: Welche Aktionen sind gerade legal?
 *
 * Alle Aktionen tragen ihren Punktgewinn schon mit sich, damit die Bots
 * nicht noch einmal rechnen müssen.
 */

/**
 * Alle Teilmengen einer Kartenliste bis Größe maxSize, dedupliziert nach Wertemuster.
 * @returns {{ids:number[], key:number, n:number}[]}
 */
function teilmengen(karten, maxSize) {
  const n = karten.length;
  const codes = karten.map(kartenCode);
  const out = [];
  const gesehen = new Set();
  const max = Math.min(maxSize, n);
  const rek = (start, ids, key) => {
    if (ids.length > 0 && !gesehen.has(key)) {
      gesehen.add(key);
      out.push({ ids: ids.slice(), key, n: ids.length });
    }
    if (ids.length === max) return;
    for (let i = start; i < n; i++) {
      ids.push(karten[i].id);
      rek(i + 1, ids, key + POW7[codes[i]]);
      ids.pop();
    }
  };
  rek(0, [], 0);
  return out;
}

/* ================================================================== */
/*  Aktionen (Teil 2 des Zuges)                                        */
/* ================================================================== */

function generiereAktionen(spiel, spielerIdx) {
  const sp = spiel.spieler[spielerIdx];
  const aktionen = [];
  const MAX = CONFIG.sternbild.maxKarten;
  const MIN = CONFIG.sternbild.minKarten;

  /* ---------- Abwerfen (immer erlaubt) ---------- */
  const gesehenAbwurf = new Set();
  for (const k of sp.hand) {
    const key = k.art + ':' + k.wert;
    if (gesehenAbwurf.has(key)) continue;
    gesehenAbwurf.add(key);
    aktionen.push({ art: 'ABWERFEN', handIds: [k.id], gewinn: 0, punkteNachher: 0 });
  }

  /* ---------- Versiegeln ---------- */
  if (sp.versiegelungenDieseRunde < CONFIG.zug.versiegelnProRunde) {
    for (const sb of sp.sternbilder) {
      if (istSicher(sb)) continue;
      const b = bewerte(sb.karten);
      if (!b.gueltig) continue;
      aktionen.push({ art: 'VERSIEGELN', sbId: sb.id, gewinn: 0, punkteNachher: b.punkte });
    }
  }

  /* ---------- Drache zusammensetzen ---------- */
  for (let i = 0; i < sp.sternbilder.length; i++) {
    for (let j = i + 1; j < sp.sternbilder.length; j++) {
      const a = sp.sternbilder[i], b = sp.sternbilder[j];
      if (bildenDrachen(a, b)) {
        const vorher = bewerte(a.karten).punkte + bewerte(b.karten).punkte;
        aktionen.push({
          art: 'DRACHE', sbIdA: a.id, sbIdB: b.id,
          gewinn: CONFIG.punkte.DRACHE - vorher, punkteNachher: CONFIG.punkte.DRACHE,
        });
      }
    }
  }

  /* ---------- Bauen / Erweitern / Klauen ---------- */
  const handBaubar = sp.hand.filter(istBaubar);
  if (handBaubar.length === 0) return aktionen;

  const mitteBaubar = spiel.mitte.filter(istBaubar);
  const maxAusMitte = Math.max(CONFIG.zug.bauenMaxAusMitte, CONFIG.zug.klauenMaxAusMitte);
  const handTM = teilmengen(handBaubar, MAX);
  const mitteTM = [{ ids: [], key: 0, n: 0 }, ...teilmengen(mitteBaubar, maxAusMitte)];

  const ziele = [{ sb: null, key: 0, n: 0, punkte: 0, eigen: true, opferIdx: -1 }];
  for (const sb of sp.sternbilder) {
    if (istSicher(sb)) continue;
    ziele.push({ sb, key: schluesselVonKarten(sb.karten), n: sb.karten.length, punkte: bewerte(sb.karten).punkte, eigen: true, opferIdx: -1 });
  }
  for (let g = 0; g < spiel.spieler.length; g++) {
    if (g === spielerIdx) continue;
    for (const sb of spiel.spieler[g].sternbilder) {
      if (istSicher(sb)) continue;
      ziele.push({ sb, key: schluesselVonKarten(sb.karten), n: sb.karten.length, punkte: bewerte(sb.karten).punkte, eigen: false, opferIdx: g });
    }
  }

  for (const ziel of ziele) {
    const platz = MAX - ziel.n;
    if (platz <= 0) continue;
    const minHand = ziel.eigen ? CONFIG.zug.bauenMinHandkarten : CONFIG.zug.klauenMinHandkarten;
    const maxMitte = ziel.eigen ? CONFIG.zug.bauenMaxAusMitte : CONFIG.zug.klauenMaxAusMitte;

    for (const h of handTM) {
      if (h.n < minHand || h.n > platz) continue;
      const restPlatz = platz - h.n;
      const basisKey = ziel.key + h.key;
      const basisN = ziel.n + h.n;

      for (const m of mitteTM) {
        if (m.n > maxMitte || m.n > restPlatz) continue;
        const gesamt = basisN + m.n;
        if (gesamt < MIN) continue;
        const b = bewerteSchluessel(basisKey + m.key, gesamt);
        if (!b.gueltig) continue;

        if (ziel.eigen) {
          aktionen.push({
            art: 'BAUEN', sbId: ziel.sb ? ziel.sb.id : null,
            handIds: h.ids, mitteIds: m.ids,
            gewinn: b.punkte - ziel.punkte, punkteNachher: b.punkte,
            typ: b.typ, groesse: b.groesse, werte: b.werte, kartenEinsatz: h.n + m.n,
          });
        } else {
          if (CONFIG.klauen.mussMehrPunkteBringen && b.punkte <= ziel.punkte) continue;
          aktionen.push({
            art: 'KLAUEN', opferIdx: ziel.opferIdx, sbId: ziel.sb.id,
            handIds: h.ids, mitteIds: m.ids,
            gewinn: b.punkte, punkteNachher: b.punkte, typ: b.typ, groesse: b.groesse, werte: b.werte,
            geklauteKarten: ziel.n, entschaedigung: ziel.n * CONFIG.klauen.entschaedigungProKarte,
            kartenEinsatz: h.n + m.n,
          });
        }
      }
    }
  }

  /* ---------- Joker aus fremdem Sternbild klauen ---------- */
  /*
   * Regelwerk, Abschnitt "Klauen — Einen Joker herausklauen":
   * Liegt in einem fremden, NICHT VERSIEGELTEN Sternbild eine Sternschnuppe und der
   * Dieb hat die Karte auf der Hand, die sie gerade vertritt, darf er tauschen.
   *
   * Zwei Bedingungen:
   *   - Er muss mit dem Joker im selben Zug ein NEUES Sternbild bauen. Ein bestehendes
   *     damit zu ergänzen ist nicht erlaubt.
   *   - Geht beides nicht zusammen, wird der Tausch gar nicht erst angeboten.
   *
   * Fertige, aber unversiegelte Sternbilder (Kreuz, Sechser, Drache) sind erlaubt —
   * dort wächst nichts, es wird nur getauscht. Deshalb steht hier `sb.versiegelt`
   * und nicht `istSicher(sb)`.
   */
  if (CONFIG.zug.jokerKlauErlaubt) {
    for (let g = 0; g < spiel.spieler.length; g++) {
      if (g === spielerIdx) continue;
      for (const sb of spiel.spieler[g].sternbilder) {
        if (sb.versiegelt || !sb.karten.some(istJoker)) continue;

        // Welche Werte vertreten die Joker gerade? Doppelte Werte nur einmal.
        const werte = [...new Set(jokerWerte(sb.karten))];
        for (const w of werte) {
          const tausch = sp.hand.find((k) => k.art === 'ZAHL' && k.wert === w);
          if (!tausch) continue;

          // Der Joker wandert auf die Hand — mit ihm und dem Rest der Hand
          // (ohne die hergegebene Karte) plus höchstens zwei Mittelkarten
          // muss ein gültiges neues Sternbild entstehen.
          const restHand = handBaubar.filter((k) => k.id !== tausch.id);
          const restTM = [{ ids: [], key: 0, n: 0 }, ...teilmengen(restHand, MAX - 1)];
          const gesehen = new Set();

          for (const h of restTM) {
            for (const m of mitteTM) {
              if (m.n > CONFIG.zug.bauenMaxAusMitte) continue;
              const gesamt = 1 + h.n + m.n;              // 1 = der erbeutete Joker
              if (gesamt < MIN || gesamt > MAX) continue;
              const b = bewerteSchluessel(POW7[0] + h.key + m.key, gesamt);
              if (!b.gueltig) continue;
              const merk = b.typ + ':' + b.werte.join(',');
              if (gesehen.has(merk)) continue;
              gesehen.add(merk);

              aktionen.push({
                art: 'JOKERKLAU',
                opferIdx: g, sbId: sb.id,
                tauschHandId: tausch.id, wert: w,
                handIds: h.ids, mitteIds: m.ids,
                typ: b.typ, groesse: b.groesse, werte: b.werte,
                gewinn: b.punkte, punkteNachher: b.punkte,
                kartenEinsatz: 1 + h.n + m.n,
              });
            }
          }
        }
      }
    }
  }

  return aktionen;
}

/* ================================================================== */
/*  Kosmische Karten (Teil 1) und Nova (freie Aktion)                  */
/* ================================================================== */

function generiereKosmische(spiel, spielerIdx) {
  const sp = spiel.spieler[spielerIdx];
  const out = [];
  const gesehen = new Set();

  for (const k of sp.hand) {
    if (!AKTIONS_KOSMISCH.includes(k.art)) continue;
    if (gesehen.has(k.art)) continue;
    gesehen.add(k.art);

    if (k.art === 'MILCHSTRASSE' || k.art === 'URKNALL') {
      out.push({ kartenId: k.id, art: k.art, wirkung: 0 });
      continue;
    }
    for (let g = 0; g < spiel.spieler.length; g++) {
      if (g === spielerIdx) continue;
      for (const sb of spiel.spieler[g].sternbilder) {
        if (istSicher(sb)) continue;
        const punkte = bewerte(sb.karten).punkte;
        if (k.art === 'SCHWARZES_LOCH') {
          out.push({ kartenId: k.id, art: k.art, zielIdx: g, sbId: sb.id, wirkung: punkte });
        } else {
          const gesehenW = new Set();
          for (const c of sb.karten) {
            const key = c.art + ':' + c.wert;
            if (gesehenW.has(key)) continue;
            gesehenW.add(key);
            out.push({ kartenId: k.id, art: k.art, zielIdx: g, sbId: sb.id, karteId: c.id, wirkung: punkte });
          }
        }
      }
    }
  }
  return out;
}

function generiereNova(spiel, spielerIdx) {
  if (!spiel.nova) return [];
  const out = [];
  for (let g = 0; g < spiel.spieler.length; g++) {
    if (g === spielerIdx) continue;
    for (const sb of spiel.spieler[g].sternbilder) {
      out.push({ zielIdx: g, sbId: sb.id, wirkung: bewerte(sb.karten).punkte, sicher: istSicher(sb) });
    }
  }
  return out;
}

function generiereJokerTausch(spiel, spielerIdx) {
  if (!CONFIG.zug.jokerTauschErlaubt) return [];
  const sp = spiel.spieler[spielerIdx];
  const out = [];
  for (const sb of sp.sternbilder) {
    if (sb.versiegelt || !sb.karten.some(istJoker)) continue;
    for (const w of jokerWerte(sb.karten)) {
      const karte = sp.hand.find((k) => k.art === 'ZAHL' && k.wert === w);
      if (karte) { out.push({ sbId: sb.id, handId: karte.id, wert: w }); break; }
    }
  }
  return out;
}

/* ===== engine\src\engine\rng.js ===== */
/** Deterministischer Zufallsgenerator (mulberry32) — gleiche Seed = gleiche Partie. */
function rngVon(seed) {
  let a = seed >>> 0;
  const f = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.int = (n) => Math.floor(f() * n);
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  f.shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(f() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  return f;
}

/* ===== engine\src\engine\game.js ===== */
/**
 * Die Spiel-Engine. Kennt keine Oberfläche.
 */


class Spiel {
  /**
   * @param {number} spielerzahl
   * @param {number} seed
   * @param {{namen?:string[], protokoll?:boolean}} [opts]
   */
  constructor(spielerzahl, seed, opts = {}) {
    this.rng = rngVon(seed);
    this.protokollAn = !!opts.protokoll;
    this.protokoll = [];

    const { deck, nova } = baueDeck();
    this.deck = deck;
    this.ablage = [];
    this.mitte = [];
    this.nova = nova;
    this.novaVerbraucht = false;
    this.ausDemSpiel = [];    // verbrauchte Karten, die nie wieder ins Deck kommen (Nova)
    this.sbZaehler = 0;       // Sternbild-IDs je Partie, damit gleiche Seed gleiche IDs gibt
    // Welche kosmische Karte zuletzt gewirkt hat. Nur für die Oberfläche, die
    // daran ihr Bild wählt; sie setzt das Feld nach dem Lesen selbst zurück.
    this.letzteKosmisch = null;

    // Spieler, die das Schwarze Loch aus dem Himmel selbst ausrichten dürfen.
    // Alle anderen (die Bots) bekommen automatisch das stärkste Ziel.
    this.himmelWahlManuell = opts.himmelWahlManuell ?? [];
    this.offeneHimmelWahl = null;   // { spielerIdx, ziele[] }, solange gewählt wird

    this.spieler = [];
    for (let i = 0; i < spielerzahl; i++) {
      this.spieler.push({
        idx: i,
        name: opts.namen?.[i] ?? `Spieler ${i + 1}`,
        hand: [],
        sternbilder: [],
        punkte: 0,
        versiegelungenDieseRunde: 0,
        himmelErreicht: false,
        letzteStartRunde: -1,
      });
    }

    this.runde = 0;
    this.starterIdx = this.rng.int(spielerzahl);
    this.ersterStarter = this.starterIdx;
    this.beendet = false;

    this.rundenPunkte = [];   // [runde][spieler] = Punktzuwachs
    this.stats = leereStats(spielerzahl);
  }

  log(text) { if (this.protokollAn) this.protokoll.push({ runde: this.runde, text }); }

  /** Nächste Sternbild-ID dieser Partie. */
  neueSbId() { return 'sb' + (++this.sbZaehler); }

  /* ---------------- Kartenfluss ---------------- */

  zieheKarte() {
    if (this.deck.length === 0) {
      if (this.ablage.length === 0) return null;
      this.deck = this.rng.shuffle(this.ablage);
      this.ablage = [];
      this.log('Nachziehstapel leer — Ablage neu gemischt.');
    }
    return this.deck.pop();
  }

  fuelleHand(sp) {
    while (sp.hand.length < CONFIG.spiel.handkarten) {
      const k = this.zieheKarte();
      if (!k) break;
      sp.hand.push(k);
    }
  }

  zahlenInMitte() {
    return this.mitte.reduce((n, k) => n + (istZahl(k) || k.art === 'STERNSCHNUPPE' ? 1 : 0), 0);
  }

  fuelleMitte() {
    const ziel = mitteGroesse(this.runde);
    let schutz = 200;
    while (this.zahlenInMitte() < ziel && schutz-- > 0) {
      const k = this.zieheKarte();
      if (!k) break;
      this.mitte.push(k);
    }
  }

  /* ---------------- Rundenablauf ---------------- */

  alleKartenEinsammeln() {
    // `ausDemSpiel` bleibt bewusst außen vor — was dort liegt, kommt nie zurück.
    const alle = [...this.mitte, ...this.ablage];
    this.mitte = []; this.ablage = [];
    for (const sp of this.spieler) {
      alle.push(...sp.hand); sp.hand = [];
      for (const sb of sp.sternbilder) alle.push(...sb.karten);
      sp.sternbilder = [];
    }
    alle.push(...this.deck);
    this.deck = this.rng.shuffle(alle);
  }

  starteRunde() {
    this.runde++;
    this.alleKartenEinsammeln();

    if (this.runde === 1) {
      // Startspieler wurde im Konstruktor gelost
    } else {
      const min = Math.min(...this.spieler.map((s) => s.punkte));
      const kandidaten = this.spieler.filter((s) => s.punkte === min);
      kandidaten.sort((a, b) => b.letzteStartRunde - a.letzteStartRunde || a.idx - b.idx);
      this.starterIdx = kandidaten[0].idx;
    }
    this.spieler[this.starterIdx].letzteStartRunde = this.runde;

    for (const sp of this.spieler) {
      sp.versiegelungenDieseRunde = 0;
      this.fuelleHand(sp);
    }
    this.fuelleMitte();
    this.log(`— Runde ${this.runde} beginnt (Startspieler: ${this.spieler[this.starterIdx].name}) —`);
  }

  wertungRunde() {
    const zuwachs = [];
    for (const sp of this.spieler) {
      let p = 0;
      for (const sb of sp.sternbilder) p += bewerte(sb.karten).punkte;
      sp.punkte += p;
      zuwachs.push(p);
      this.log(`${sp.name}: +${p} aus Sternbildern (gesamt ${sp.punkte})`);
    }
    this.rundenPunkte.push(zuwachs);
  }

  /* ---------------- Zug ---------------- */

  findeSb(spielerIdx, sbId) {
    return this.spieler[spielerIdx].sternbilder.find((s) => s.id === sbId) ?? null;
  }

  entferneKarteAusHand(sp, id) {
    const i = sp.hand.findIndex((k) => k.id === id);
    return i >= 0 ? sp.hand.splice(i, 1)[0] : null;
  }

  entferneKarteAusMitte(id) {
    const i = this.mitte.findIndex((k) => k.id === id);
    return i >= 0 ? this.mitte.splice(i, 1)[0] : null;
  }

  /**
   * Erst prüfen, dann entfernen: liegen alle angegebenen Karten wirklich noch da?
   * Fehlt eine, wird der Zug abgebrochen, bevor irgendetwas verändert ist — sonst
   * bliebe z. B. ein Sternbild mit zu wenigen Karten liegen.
   */
  pruefeKartenDa(sp, handIds = [], mitteIds = []) {
    for (const id of handIds) {
      if (!sp.hand.some((k) => k.id === id))
        throw new Error(`Karte ${id} liegt nicht mehr auf der Hand von ${sp.name} — Zug abgebrochen`);
    }
    for (const id of mitteIds) {
      if (!this.mitte.some((k) => k.id === id))
        throw new Error(`Karte ${id} liegt nicht mehr in der Mitte — Zug abgebrochen`);
    }
  }

  /** @param {'ZERSTOERT'|'ABLAGE'} ziel */
  loeseSbAuf(spielerIdx, sb, ziel = 'ZERSTOERT') {
    const sp = this.spieler[spielerIdx];
    const i = sp.sternbilder.indexOf(sb);
    if (i >= 0) sp.sternbilder.splice(i, 1);
    const wohin = ziel === 'ABLAGE' ? 'ABLAGE' : CONFIG.kosmisch.zerstoerteKartenNach;
    if (wohin === 'ABLAGE') this.ablage.push(...sb.karten);
    else this.mitte.push(...sb.karten);
  }

  /** Teil 1: eine kosmische Karte ausspielen. */
  spieleKosmisch(spielerIdx, wahl) {
    const sp = this.spieler[spielerIdx];
    this.pruefeKartenDa(sp, [wahl.kartenId]);
    const karte = this.entferneKarteAusHand(sp, wahl.kartenId);
    if (!karte) throw new Error('Kosmische Karte nicht auf der Hand');
    // Rein für die Oberfläche: welche Karte zuletzt gewirkt hat. Damit kann
    // sie das passende Bild zeigen, statt den Zug aus dem Protokoll zu raten.
    // Keine Regel hängt daran.
    this.letzteKosmisch = karte.art;
    this.ablage.push(karte);
    this.stats.kosmisch[karte.art] = (this.stats.kosmisch[karte.art] ?? 0) + 1;

    switch (karte.art) {
      case 'SCHWARZES_LOCH': {
        const sb = this.findeSb(wahl.zielIdx, wahl.sbId);
        if (sb && !istSicher(sb)) {
          this.log(`${sp.name} spielt Schwarzes Loch auf ${this.spieler[wahl.zielIdx].name} (${bewerte(sb.karten).punkte} P.)`);
          this.loeseSbAuf(wahl.zielIdx, sb);
        }
        break;
      }
      case 'WEISSES_LOCH': {
        const sb = this.findeSb(wahl.zielIdx, wahl.sbId);
        if (sb && !istSicher(sb)) {
          const i = sb.karten.findIndex((k) => k.id === wahl.karteId);
          if (i >= 0) {
            const [genommen] = sb.karten.splice(i, 1);
            sp.hand.push(genommen);
            this.log(`${sp.name} zieht ${kartenName(genommen)} aus einem Sternbild von ${this.spieler[wahl.zielIdx].name}`);
            if (sb.karten.length < CONFIG.sternbild.minKarten) this.loeseSbAuf(wahl.zielIdx, sb);
          }
        }
        break;
      }
      case 'URKNALL': {
        this.log(`${sp.name} spielt den Urknall`);
        for (const p of this.spieler) {
          for (const sb of [...p.sternbilder]) if (!istSicher(sb)) this.loeseSbAuf(p.idx, sb);
        }
        break;
      }
      case 'MILCHSTRASSE': {
        for (let i = 0; i < CONFIG.kosmisch.milchstrasseKarten; i++) {
          const k = this.zieheKarte(); if (k) sp.hand.push(k);
        }
        this.log(`${sp.name} spielt Milchstraße (+${CONFIG.kosmisch.milchstrasseKarten} Karten)`);
        break;
      }
    }
  }

  /** Freie Aktion: die Nova. */
  spieleNova(spielerIdx, wahl) {
    if (!this.nova) return;
    this.letzteKosmisch = 'NOVA';
    const sb = this.findeSb(wahl.zielIdx, wahl.sbId);
    if (!sb) return;
    this.log(`${this.spieler[spielerIdx].name} zündet die NOVA auf ein Sternbild von ${this.spieler[wahl.zielIdx].name} (${bewerte(sb.karten).punkte} P.)`);
    this.loeseSbAuf(wahl.zielIdx, sb, CONFIG.kosmisch.novaKartenAufAblage ? 'ABLAGE' : 'ZERSTOERT');
    // Regel: "Danach ist die Nova aus dem Spiel." Nicht auf die Ablage — von dort
    // würde sie beim nächsten Einsammeln wieder ins Deck wandern.
    this.ausDemSpiel.push(this.nova);
    this.nova = null;
    this.novaVerbraucht = true;
    this.stats.novaGenutzt++;
  }

  /** Freie Aktion: eigenen Joker gegen die echte Karte tauschen. */
  jokerTauschen(spielerIdx, wahl) {
    const sp = this.spieler[spielerIdx];
    const sb = this.findeSb(spielerIdx, wahl.sbId);
    if (!sb) return;
    const i = sb.karten.findIndex((k) => k.art === 'STERNSCHNUPPE');
    if (i < 0) return;
    const echt = this.entferneKarteAusHand(sp, wahl.handId);
    if (!echt) return;
    const [joker] = sb.karten.splice(i, 1, echt);
    sp.hand.push(joker);
    this.stats.jokerTausch++;
  }

  /** Teil 2: die Pflichtaktion. */
  fuehreAktion(spielerIdx, a) {
    const sp = this.spieler[spielerIdx];
    // Betrifft ABWERFEN, BAUEN, KLAUEN und JOKERKLAU; VERSIEGELN und DRACHE
    // führen keine Karten mit und laufen hier durch.
    // Beim Jokerklau kommt die hergegebene Karte dazu — sie steht nicht in handIds,
    // weil handIds das neue Sternbild beschreibt.
    const zuPruefen = a.tauschHandId != null ? [...(a.handIds || []), a.tauschHandId] : a.handIds;
    this.pruefeKartenDa(sp, zuPruefen, a.mitteIds);

    switch (a.art) {
      case 'ABWERFEN': {
        const k = this.entferneKarteAusHand(sp, a.handIds[0]);
        if (k) this.ablage.push(k);
        this.stats.abwuerfe++;
        this.log(`${sp.name} wirft ${k ? kartenName(k) : '?'} ab`);
        break;
      }
      case 'VERSIEGELN': {
        const sb = this.findeSb(spielerIdx, a.sbId);
        if (sb) { sb.versiegelt = true; sp.versiegelungenDieseRunde++; this.stats.versiegelungen++; }
        this.log(`${sp.name} versiegelt ein Sternbild (${sb ? bewerte(sb.karten).punkte : 0} P.)`);
        break;
      }
      case 'DRACHE': {
        const a1 = this.findeSb(spielerIdx, a.sbIdA);
        const a2 = this.findeSb(spielerIdx, a.sbIdB);
        if (a1 && a2) {
          const karten = [...a1.karten, ...a2.karten];
          sp.sternbilder = sp.sternbilder.filter((s) => s !== a1 && s !== a2);
          sp.sternbilder.push({ id: this.neueSbId(), karten, versiegelt: false });
          this.stats.drachen++;
          this.stats.sternbildGebaut.DRACHE++;
          this.log(`🐉 ${sp.name} setzt den DRACHEN zusammen (+${CONFIG.punkte.DRACHE})`);
        }
        break;
      }
      case 'BAUEN': {
        const karten = [];
        for (const id of a.handIds) { const k = this.entferneKarteAusHand(sp, id); if (k) karten.push(k); }
        for (const id of a.mitteIds) { const k = this.entferneKarteAusMitte(id); if (k) karten.push(k); }
        let sb = a.sbId ? this.findeSb(spielerIdx, a.sbId) : null;
        if (sb) {
          const alterTyp = bewerte(sb.karten).typ;
          sb.karten.push(...karten);
          const neuerTyp = bewerte(sb.karten).typ;
          if (neuerTyp && neuerTyp !== alterTyp) this.stats.sternbildGebaut[neuerTyp]++;
          this.log(`${sp.name} erweitert ein Sternbild auf ${neuerTyp} (${bewerte(sb.karten).punkte} P.)`);
        } else {
          sb = { id: this.neueSbId(), karten, versiegelt: false };
          sp.sternbilder.push(sb);
          const t = bewerte(sb.karten).typ;
          if (t) this.stats.sternbildGebaut[t]++;
          this.log(`${sp.name} baut ${t} (${bewerte(sb.karten).punkte} P.)`);
        }
        break;
      }
      case 'KLAUEN': {
        const opfer = this.spieler[a.opferIdx];
        const sb = this.findeSb(a.opferIdx, a.sbId);
        if (!sb) break;
        const entschaedigung = sb.karten.length * CONFIG.klauen.entschaedigungProKarte;
        const karten = [];
        for (const id of a.handIds) { const k = this.entferneKarteAusHand(sp, id); if (k) karten.push(k); }
        for (const id of a.mitteIds) { const k = this.entferneKarteAusMitte(id); if (k) karten.push(k); }
        opfer.sternbilder = opfer.sternbilder.filter((s) => s !== sb);
        sb.karten.push(...karten);
        sp.sternbilder.push(sb);
        opfer.punkte += entschaedigung;
        this.stats.klaus++;
        this.stats.entschaedigung += entschaedigung;
        const t = bewerte(sb.karten).typ;
        if (t) this.stats.sternbildGebaut[t]++;
        this.log(`🗡 ${sp.name} klaut ${opfer.name} ein Sternbild → ${t} (${bewerte(sb.karten).punkte} P.); ${opfer.name} erhält ${entschaedigung} Trostpunkte`);
        break;
      }
      /*
       * Joker herausklauen: der Klau EINER KARTE, nicht eines Sternbilds.
       * Die echte Karte wandert hinein, der Joker heraus — und muss im selben Zug
       * ein neues eigenes Sternbild bilden. Das fremde Sternbild bleibt beim
       * Besitzer, unverändert in Form und Punkten; deshalb gibt es keine Trostpunkte.
       */
      case 'JOKERKLAU': {
        const opfer = this.spieler[a.opferIdx];
        const sb = this.findeSb(a.opferIdx, a.sbId);
        if (!sb) throw new Error('Das Sternbild mit dem Joker liegt nicht mehr da — Zug abgebrochen');
        if (sb.versiegelt) throw new Error('Ein versiegeltes Sternbild gibt seinen Joker nicht her');
        const i = sb.karten.findIndex((k) => k.art === 'STERNSCHNUPPE');
        if (i < 0) throw new Error('Dort liegt keine Sternschnuppe mehr — Zug abgebrochen');

        const echt = this.entferneKarteAusHand(sp, a.tauschHandId);
        const [joker] = sb.karten.splice(i, 1, echt);

        const karten = [joker];
        for (const id of a.handIds) { const k = this.entferneKarteAusHand(sp, id); if (k) karten.push(k); }
        for (const id of a.mitteIds) { const k = this.entferneKarteAusMitte(id); if (k) karten.push(k); }

        const neu = { id: this.neueSbId(), karten, versiegelt: false };
        sp.sternbilder.push(neu);

        this.stats.jokerKlaus++;
        const b = bewerte(karten);
        if (b.typ) this.stats.sternbildGebaut[b.typ]++;
        this.log(`☄ ${sp.name} tauscht bei ${opfer.name} die ${echt.wert} gegen die Sternschnuppe `
          + `und baut damit ${b.typ} (${b.punkte} P.) — ${opfer.name}s Sternbild bleibt liegen`);
        break;
      }
      default: throw new Error('Unbekannte Aktion ' + a.art);
    }
  }

  /** Himmel: alle sechs Sternbilder mit je >= N Karten. */
  pruefeHimmel(spielerIdx) {
    const sp = this.spieler[spielerIdx];
    if (sp.himmelErreicht && CONFIG.himmel.nurEinmalProSpieler) return false;
    const H = CONFIG.himmel;
    const vorhanden = new Set();
    for (const sb of sp.sternbilder) {
      const b = bewerte(sb.karten);
      if (b.gueltig && b.groesse >= H.minKartenProSternbild && b.typ) vorhanden.add(b.typ);
    }
    if (!H.benoetigteTypen.every((t) => vorhanden.has(t))) return false;

    sp.himmelErreicht = true;
    sp.punkte += H.bonus;
    this.stats.himmel++;
    this.log(`✨ ${sp.name} vollendet den HIMMEL (+${H.bonus})`);

    if (H.versiegeltAlles) for (const sb of sp.sternbilder) sb.versiegelt = true;

    if (H.gibtSchwarzesLoch) {
      const ziele = this.himmelZiele(spielerIdx);
      if (ziele.length === 0) {
        // nichts zu zerstören
      } else if (this.himmelWahlManuell.includes(spielerIdx)) {
        // Der Spieler sucht sich das Ziel selbst aus. Der Zug hängt so lange,
        // bis waehleHimmelZiel() gerufen wird.
        this.offeneHimmelWahl = { spielerIdx, ziele };
      } else {
        // Bots: automatisch das stärkste offene gegnerische Sternbild
        let best = ziele[0];
        for (const z of ziele) if (z.punkte > best.punkte) best = z;
        this.himmelZielZerstoeren(best);
      }
    }
    return true;
  }

  /**
   * Gültige Ziele für das Schwarze Loch aus dem Himmel: offene, nicht sichere
   * Sternbilder der Gegner. Versiegelte bleiben tabu — die knackt nur die Nova.
   */
  himmelZiele(spielerIdx) {
    const ziele = [];
    for (const g of this.spieler) {
      if (g.idx === spielerIdx) continue;
      for (const sb of g.sternbilder) {
        if (istSicher(sb)) continue;
        ziele.push({ zielIdx: g.idx, sbId: sb.id, punkte: bewerte(sb.karten).punkte });
      }
    }
    return ziele;
  }

  himmelZielZerstoeren(ziel) {
    const sb = this.findeSb(ziel.zielIdx, ziel.sbId);
    if (!sb || istSicher(sb)) return false;
    this.letzteKosmisch = 'SCHWARZES_LOCH';
    this.log(`🕳 Schwarzes Loch aus dem Himmel trifft ${this.spieler[ziel.zielIdx].name} (${bewerte(sb.karten).punkte} P.)`);
    this.loeseSbAuf(ziel.zielIdx, sb);
    return true;
  }

  /**
   * Löst eine offene Himmelswahl auf. `sbId` muss zu einem der angebotenen Ziele
   * gehören; ohne gültige Angabe verfällt das Schwarze Loch.
   */
  waehleHimmelZiel(sbId) {
    const offen = this.offeneHimmelWahl;
    if (!offen) return false;
    this.offeneHimmelWahl = null;
    const ziel = offen.ziele.find((z) => z.sbId === sbId);
    if (!ziel) return false;
    return this.himmelZielZerstoeren(ziel);
  }

  /** Kompletter Zug eines Spielers. */
  spieleZug(spielerIdx, entscheidung) {
    const sp = this.spieler[spielerIdx];
    this.stats.zuege++;
    if (sp.hand.length < CONFIG.spiel.handkarten) this.stats.zuegeMitLueckeInDerHand++;
    this.stats.mitteSumme += this.mitte.length;
    this.stats.mitteMax = Math.max(this.stats.mitteMax, this.mitte.length);

    if (entscheidung.kosmisch) this.spieleKosmisch(spielerIdx, entscheidung.kosmisch);
    if (entscheidung.nova && this.nova) this.spieleNova(spielerIdx, entscheidung.nova);
    if (entscheidung.jokerTausch) this.jokerTauschen(spielerIdx, entscheidung.jokerTausch);

    if (entscheidung.aktion) this.fuehreAktion(spielerIdx, entscheidung.aktion);

    this.pruefeHimmel(spielerIdx);

    // Teil 3
    this.fuelleHand(sp);
    this.fuelleMitte();
  }

  /* ---------------- Komplette Partie ---------------- */

  optionen(spielerIdx) {
    return {
      aktionen: generiereAktionen(this, spielerIdx),
      kosmische: generiereKosmische(this, spielerIdx),
      nova: generiereNova(this, spielerIdx),
      jokerTausch: generiereJokerTausch(this, spielerIdx),
    };
  }

  /** Wertvollstes einzelnes Sternbild, das ein Spieler gerade ausliegen hat. */
  besterEinzelwert(sp) {
    let best = 0;
    for (const sb of sp.sternbilder) best = Math.max(best, bewerte(sb.karten).punkte);
    return best;
  }

  /**
   * Endstand.
   *
   * `sieger` ist IMMER eine Liste von Spielerindizes — bei einem geteilten Sieg
   * enthält sie mehrere. Die Sitzposition entscheidet nie: Erst zählen die Punkte,
   * dann das wertvollste einzelne Sternbild aus der Schlussrunde. Ist auch das
   * gleich, gewinnen alle Betroffenen gemeinsam.
   */
  ergebnis() {
    const einzel = this.spieler.map((s) => this.besterEinzelwert(s));
    const sortiert = [...this.spieler].sort(
      (a, b) => b.punkte - a.punkte || einzel[b.idx] - einzel[a.idx],
    );
    const kopf = sortiert[0];
    const sieger = this.spieler
      .filter((s) => s.punkte === kopf.punkte && einzel[s.idx] === einzel[kopf.idx])
      .map((s) => s.idx);
    return {
      punkte: this.spieler.map((s) => s.punkte),
      besterEinzelwert: einzel,
      sieger,
      geteilterSieg: sieger.length > 1,
      rangfolge: sortiert.map((s) => s.idx),
      punktgleich: sortiert.length > 1 && sortiert[0].punkte === sortiert[1].punkte,
      abstand: sortiert[0].punkte - sortiert[sortiert.length - 1].punkte,
      ersterStarter: this.ersterStarter,
      rundenPunkte: this.rundenPunkte,
      stats: this.stats,
    };
  }
}

function leereStats() {
  return {
    zuege: 0, zuegeMitLueckeInDerHand: 0, mitteSumme: 0, mitteMax: 0,
    klaus: 0, versiegelungen: 0, abwuerfe: 0, drachen: 0, himmel: 0,
    jokerKlaus: 0, jokerTausch: 0, novaGenutzt: 0, entschaedigung: 0,
    kosmisch: { SCHWARZES_LOCH: 0, WEISSES_LOCH: 0, URKNALL: 0, MILCHSTRASSE: 0 },
    sternbildGebaut: { PFEIL: 0, WAGEN: 0, KRONE: 0, KREUZ: 0, ZWILLING: 0, DOPPELSTIER: 0, DRACHE: 0 },
  };
}

/**
 * Spielt eine komplette Partie.
 * @param {number} spielerzahl
 * @param {Array<(spiel:Spiel, idx:number)=>any>} bots
 * @param {number} seed
 */
function spielePartie(spielerzahl, bots, seed, opts = {}) {
  const spiel = new Spiel(spielerzahl, seed, opts);
  for (let r = 1; r <= CONFIG.spiel.runden; r++) {
    spiel.starteRunde();
    const zuege = zuegeInRunde(r, spielerzahl);
    spiel.zuegeProSpieler = zuege;
    for (let z = 0; z < zuege; z++) {
      spiel.zugIndex = z;
      spiel.restZuege = zuege - z - 1;
      for (let k = 0; k < spielerzahl; k++) {
        const idx = (spiel.starterIdx + k) % spielerzahl;
        const entscheidung = bots[idx](spiel, idx);
        if (entscheidung) spiel.spieleZug(idx, entscheidung);
      }
    }
    spiel.wertungRunde();
  }
  spiel.beendet = true;
  return spiel;
}

/* ===== engine\src\engine\ablauf.js ===== */
/**
 * Ablaufsteuerung für die Oberfläche.
 *
 * `spielePartie` in game.js treibt die Schleife von außen — gut für die Simulation,
 * unbrauchbar für einen Menschen, der zwischendurch klicken soll. `Ablauf` hält
 * denselben Ablauf als Zustand: Runde, Zugnummer, wer dran ist. Die Oberfläche ruft
 * nur noch `spieleZug()` bzw. `botZug()` auf und fragt danach `zustand()` ab.
 *
 * Reihenfolge und Wertung sind identisch zu `spielePartie` — gleiche Seed, gleiche
 * Bots, gleiche Partie.
 */

/** @typedef {'ZUG'|'HIMMELWAHL'|'RUNDENENDE'|'ENDE'} Phase */

class Ablauf {
  /**
   * @param {number} spielerzahl
   * @param {number} seed
   * @param {{namen?:string[], protokoll?:boolean, menschIdx?:number|null}} [opts]
   *        menschIdx: wessen Hand `zustand()` offenlegt (Vorgabe 0).
   *        null oder -1 = niemand, dann ist die Partie reines Bot-gegen-Bot.
   */
  constructor(spielerzahl, seed, opts = {}) {
    const menschIdx = opts.menschIdx === undefined ? 0 : opts.menschIdx;
    // Der Mensch richtet das Schwarze Loch aus dem Himmel selbst aus, die Bots nicht.
    const himmelWahlManuell = opts.himmelWahlManuell
      ?? (menschIdx != null && menschIdx >= 0 ? [menschIdx] : []);
    /** @type {Spiel} */
    this.spiel = new Spiel(spielerzahl, seed, { ...opts, himmelWahlManuell });
    this.spielerzahl = spielerzahl;
    this.menschIdx = menschIdx;

    this.runde = 0;             // 1..CONFIG.spiel.runden; 0 = noch nicht gestartet
    this.zugIndex = 0;          // 0-basiert, welcher Zug der Runde
    this.zuegeProRunde = 0;     // aus zuegeInRunde()
    this.amZug = -1;            // Spielerindex; -1 außerhalb der Phase 'ZUG'
    /** @type {Phase} */
    this.phase = 'RUNDENENDE';  // vor `start()` steht die nächste Runde an
    this.beendet = false;

    this.reihenPos = 0;         // wie weit reihum, gezählt ab spiel.starterIdx
  }

  /* ---------------- Steuerung ---------------- */

  /** Startet Runde 1 und setzt `amZug` auf den Startspieler. Mehrfachaufruf tut nichts. */
  start() {
    if (this.runde === 0) this._starteRunde();
    return this;
  }

  /** Ist der Mensch am Zug? */
  istMensch() {
    return this.phase === 'ZUG' && this.amZug === this.menschIdx;
  }

  /** Optionen des aktuellen Spielers, oder null außerhalb der Phase 'ZUG'. */
  optionen() {
    return this.phase === 'ZUG' ? this.spiel.optionen(this.amZug) : null;
  }

  /**
   * Führt den Zug des aktuell aktiven Spielers aus und rückt vor.
   * Verhält sich wie `spielePartie`: eine falsy Entscheidung überspringt den Zug
   * komplett (kein Nachziehen), `{aktion:null}` verbraucht den Zug ohne Pflichtaktion.
   * @param {{kosmisch?:object, nova?:object, jokerTausch?:object, aktion?:object|null}|null} entscheidung
   */
  spieleZug(entscheidung) {
    if (this.phase !== 'ZUG') return this;
    if (entscheidung) this.spiel.spieleZug(this.amZug, entscheidung);
    // Hat der Zug den Himmel vollendet und darf der Spieler das Schwarze Loch
    // selbst ausrichten, hängt der Ablauf hier, bis gewählt wurde.
    if (this.spiel.offeneHimmelWahl) { this.phase = 'HIMMELWAHL'; return this; }
    return this.weiter();
  }

  /** Die Ziele, unter denen gerade zu wählen ist — leer, wenn nichts offen ist. */
  himmelZiele() {
    return this.spiel.offeneHimmelWahl ? this.spiel.offeneHimmelWahl.ziele : [];
  }

  /**
   * Löst die offene Himmelswahl auf und macht dann normal weiter.
   * Ohne gültige `sbId` verfällt das Schwarze Loch.
   */
  waehleHimmelZiel(sbId) {
    if (this.phase !== 'HIMMELWAHL') return this;
    this.spiel.waehleHimmelZiel(sbId);
    this.phase = 'ZUG';
    return this.weiter();
  }

  /**
   * Lässt einen Bot den aktuellen Zug spielen und rückt vor.
   * Der Bot führt Teil 1 und die freien Aktionen selbst aus (Konvention der Bots)
   * und liefert nur die Pflichtaktion zurück.
   * @param {(spiel:Spiel, idx:number)=>any} botFn
   */
  botZug(botFn) {
    if (this.phase !== 'ZUG') return this;
    this.spieleZug(botFn(this.spiel, this.amZug));
    // Sitzt ein Bot auf einem Platz, der eigentlich selbst wählen dürfte, entscheidet
    // er wie jeder Bot: das stärkste offene Ziel. Sonst bliebe der Ablauf hier stehen.
    if (this.phase === 'HIMMELWAHL') {
      const ziele = this.himmelZiele();
      let best = ziele[0];
      for (const z of ziele) if (z.punkte > best.punkte) best = z;
      this.waehleHimmelZiel(best ? best.sbId : null);
    }
    return this;
  }

  /**
   * Rückt einen Schritt vor: nächster Spieler, sonst nächster Zug, sonst
   * Rundenwertung. In der Phase 'RUNDENENDE' startet genau EINE neue Runde.
   */
  weiter() {
    if (this.beendet) return this;

    if (this.phase === 'RUNDENENDE') { this._starteRunde(); return this; }
    if (this.phase !== 'ZUG') return this;

    this.reihenPos++;
    if (this.reihenPos < this.spielerzahl) { this._vorZug(); return this; }

    this.reihenPos = 0;
    this.zugIndex++;
    if (this.zugIndex < this.zuegeProRunde) { this._vorZug(); return this; }

    // Runde vorbei — genau einmal werten
    this.spiel.wertungRunde();
    this.amZug = -1;
    if (this.runde >= CONFIG.spiel.runden) {
      this.phase = 'ENDE';
      this.beendet = true;
      this.spiel.beendet = true;
    } else {
      this.phase = 'RUNDENENDE';
    }
    return this;
  }

  /* ---------------- intern ---------------- */

  /** Nächste Runde austeilen und die Zähler auf den ersten Zug setzen. */
  _starteRunde() {
    this.spiel.starteRunde();               // setzt auch spiel.starterIdx neu
    this.runde = this.spiel.runde;
    this.zuegeProRunde = zuegeInRunde(this.runde, this.spielerzahl);
    this.spiel.zuegeProSpieler = this.zuegeProRunde;
    this.zugIndex = 0;
    this.reihenPos = 0;
    this.phase = 'ZUG';
    this._vorZug();
  }

  /**
   * Zähler, die das Spiel VOR jedem Zug braucht.
   * `spiel.restZuege` liest z. B. der normale Bot für seinen Endspurt.
   */
  _vorZug() {
    this.spiel.zugIndex = this.zugIndex;
    this.spiel.restZuege = this.zuegeProRunde - this.zugIndex - 1;
    this.amZug = (this.spiel.starterIdx + this.reihenPos) % this.spielerzahl;
  }

  /* ---------------- Schnappschuss ---------------- */

  /**
   * Kompakter Schnappschuss für die Oberfläche.
   *
   * Die Kartenobjekte werden durchgereicht, nicht kopiert — nur die Listen selbst
   * sind neu. Die Oberfläche darf Karten also lesen, aber nicht verändern.
   * `hand` ist nur für `menschIdx` gefüllt, sonst null; `handAnzahl` gilt für alle.
   */
  zustand() {
    const s = this.spiel;
    return {
      runde: this.runde,
      zuegeProRunde: this.zuegeProRunde,
      zugIndex: this.zugIndex,
      restZuege: this.phase === 'ZUG' ? this.zuegeProRunde - this.zugIndex - 1 : 0,
      offeneHimmelWahl: this.spiel.offeneHimmelWahl,
      amZug: this.amZug,
      phase: this.phase,
      beendet: this.beendet,
      mitte: [...s.mitte],
      nova: s.nova,
      // Die beiden Stapel am Rand. Beides ist öffentlich: die Höhe des
      // Nachziehstapels sieht jeder, und der Ablagestapel liegt offen —
      // wichtig, weil er neu gemischt wird, sobald das Deck leer ist.
      deckAnzahl: s.deck.length,
      ablageAnzahl: s.ablage.length,
      ablageOben: s.ablage.length ? s.ablage[s.ablage.length - 1] : null,
      spieler: s.spieler.map((sp) => ({
        idx: sp.idx,
        name: sp.name,
        punkte: sp.punkte,
        handAnzahl: sp.hand.length,
        hand: sp.idx === this.menschIdx ? [...sp.hand] : null,
        sternbilder: sp.sternbilder.map((sb) => {
          const b = bewerte(sb.karten);
          return {
            id: sb.id,
            karten: [...sb.karten],
            versiegelt: !!sb.versiegelt,
            typ: b.typ,
            punkte: b.punkte,
            sicher: istSicher(sb),
          };
        }),
        himmelErreicht: sp.himmelErreicht,
        versiegelungenDieseRunde: sp.versiegelungenDieseRunde,
      })),
    };
  }
}

/* ===== engine\src\bots\normal.js ===== */
/**
 * Normaler Bot — soll spielen wie ein Mensch.
 *
 *  - versiegelt, wenn ein Sternbild wertvoll ist UND gefährdet
 *  - lässt kleine Sternbilder offen
 *  - verfolgt Fernziele: Drache (hat schon einen Sechser-Pfeil) und Himmel (4 Typen)
 *  - hebt sich Schwarzes Loch und Nova für lohnende Ziele auf
 *  - klaut bevorzugt Sternbilder, die kurz vor dem Sicherwerden stehen
 */

const B = () => CONFIG.bots.normal;

/* ---------- Hilfsgrößen ---------- */

/** Ist dieses Sternbild theoretisch übernehmbar? Klauen braucht >= 2 Handkarten Platz. */
function klaubar(sb) {
  if (istSicher(sb)) return false;
  const frei = CONFIG.sternbild.maxKarten - sb.karten.length;
  return frei >= CONFIG.zug.klauenMinHandkarten;
}

/** Geschätztes Verlustrisiko eines eigenen, offenen Sternbilds. */
function risiko(spiel, sb) {
  if (istSicher(sb)) return 0;
  const b = B();
  let r = b.risikoNurKosmisch;
  if (klaubar(sb)) r = b.risikoKlaubar;
  // Am Rundenende ist weniger Zeit für Angriffe
  const rest = spiel.restZuege ?? 2;
  return r * Math.min(1, (rest + 1) / 3);
}

/** Welche Sternbild-Typen liegen (mit genug Karten) schon vor mir? */
function himmelFortschritt(sp) {
  const H = CONFIG.himmel;
  const da = new Set();
  for (const sb of sp.sternbilder) {
    const b = bewerte(sb.karten);
    if (b.gueltig && b.typ && b.groesse >= H.minKartenProSternbild) da.add(b.typ);
  }
  return da;
}

/** Habe ich einen fertigen Sechser-Pfeil? Dann welcher Bereich fehlt zum Drachen? */
function drachenLage(sp) {
  for (const sb of sp.sternbilder) {
    const b = bewerte(sb.karten);
    if (b.gueltig && b.typ === 'PFEIL' && b.groesse === CONFIG.drache.teilLaenge) {
      const start = b.werte[0];
      // Gegenstück: der andere Sechser-Block von 1..12
      const gegen = start === CONFIG.deck.zahlenMin ? CONFIG.deck.zahlenMin + 6 : CONFIG.deck.zahlenMin;
      if (start === CONFIG.deck.zahlenMin || start === CONFIG.deck.zahlenMin + 6) {
        return { hat: true, gegenStart: gegen };
      }
    }
  }
  return { hat: false, gegenStart: null };
}

/** Liegen alle Werte im Sechserblock ab `start`? */
function imBlock(werte, start) {
  if (start == null) return false;
  return werte.every((w) => w >= start && w < start + CONFIG.drache.teilLaenge);
}

/* ---------- Bewertung einer Aktion ---------- */

function bewerteAktion(spiel, idx, a, kontext) {
  const b = B();
  switch (a.art) {
    case 'ABWERFEN':
      return -b.abwurfMalus;

    case 'VERSIEGELN': {
      const sb = spiel.findeSb(idx, a.sbId);
      if (!sb) return -99;
      const p = bewerte(sb.karten).punkte;
      if (p < b.versiegelnMinPunkte) return -99;         // kleine Sternbilder offen lassen
      return p * risiko(spiel, sb);
    }

    case 'DRACHE':
      return a.gewinn + b.drachenBonus;

    case 'BAUEN': {
      let s = a.gewinn - a.kartenEinsatz * b.kartenEinsatzMalus;
      const sb = a.sbId ? spiel.findeSb(idx, a.sbId) : null;
      const wirdSicher = a.typ === 'KREUZ' || a.groesse >= CONFIG.sternbild.maxKarten;
      if (wirdSicher) {
        // gesicherte Punkte sind mehr wert als offene
        s += b.sicherBonus + a.punkteNachher * (sb ? risiko(spiel, sb) : 0.2);
      }
      // Fernziel Drache: gezielt den GEGENSTÜCK-Pfeil bauen, nicht irgendeinen
      if (kontext.drache.hat && a.typ === 'PFEIL' && a.werte && imBlock(a.werte, kontext.drache.gegenStart)) {
        if (a.groesse === CONFIG.drache.teilLaenge) s += b.drachenBonus;
        else s += b.drachenTeilBonus * (a.groesse / CONFIG.drache.teilLaenge);
      }
      // Fernziel Himmel: fehlende Typen bauen
      if (kontext.himmel.size >= b.himmelSchwelleTypen && a.typ &&
          !kontext.himmel.has(a.typ) && a.groesse >= CONFIG.himmel.minKartenProSternbild &&
          CONFIG.himmel.benoetigteTypen.includes(a.typ)) {
        s += b.himmelBonus;
      }
      return s;
    }

    case 'KLAUEN': {
      const opfer = spiel.spieler[a.opferIdx];
      const sb = spiel.findeSb(a.opferIdx, a.sbId);
      const geraubtePunkte = sb ? bewerte(sb.karten).punkte : 0;
      // eigener Gewinn + dem Gegner entzogene Punkte − Trostpunkte
      let s = a.punkteNachher + geraubtePunkte - a.entschaedigung + b.klauGrundBonus;
      // Ziele, die kurz vor dem Sicherwerden stehen, bevorzugen
      if (sb && CONFIG.sternbild.maxKarten - sb.karten.length <= 2) s += b.klauFastSicherBonus;
      if (a.typ === 'KREUZ' || a.groesse >= CONFIG.sternbild.maxKarten) s += b.sicherBonus;
      if (kontext.himmel.size >= b.himmelSchwelleTypen && a.typ && !kontext.himmel.has(a.typ) &&
          a.groesse >= CONFIG.himmel.minKartenProSternbild) s += b.himmelBonus;
      s -= a.kartenEinsatz * b.kartenEinsatzMalus;
      return s;
    }

    /*
     * Joker herausklauen kostet den ganzen Zug und bringt genau das neue Sternbild,
     * das dabei entsteht — also wird es wie ein Bauzug bewertet. Der Regelauftrag:
     * nur nutzen, wenn es mindestens so viel bringt wie der beste normale Zug.
     * Deshalb kein Bonus, sondern nur ein kleiner Aufschlag dafür, dass der Gegner
     * seinen Joker verliert und sein Sternbild damit angreifbar bleibt.
     */
    case 'JOKERKLAU':
      return a.gewinn + 0.4;

    default:
      return 0;
  }
}

/* ---------- Kosmische Karten ---------- */

/**
 * @param {object|null} schonzone  Sternbild, das der Bot selbst klauen will — nicht zerstören!
 */
function waehleKosmisch(spiel, idx, schonzone = null) {
  const b = B();
  let opt = generiereKosmische(spiel, idx);
  if (schonzone) opt = opt.filter((o) => o.sbId !== schonzone);
  if (opt.length === 0) return null;

  const nachArt = new Map();
  for (const o of opt) {
    const alt = nachArt.get(o.art);
    if (!alt || (o.wirkung ?? 0) > (alt.wirkung ?? 0)) nachArt.set(o.art, o);
  }

  // "Endspurt": am Rundenende sind zerstörte Punkte endgültig weg
  const endspurt = (spiel.restZuege ?? 99) <= b.endspurtZuege;

  // Milchstraße: reiner Kartenvorteil, immer sofort
  if (nachArt.has('MILCHSTRASSE')) return nachArt.get('MILCHSTRASSE');

  const sl = nachArt.get('SCHWARZES_LOCH');
  const wl = nachArt.get('WEISSES_LOCH');

  // Schwarzes Loch: aufheben, bis ein Ziel es wert ist — im Endspurt immer
  if (sl && (sl.wirkung >= b.schwarzesLochMinPunkte || (endspurt && sl.wirkung > 0))) return sl;

  // Urknall: nur wenn die Gegner deutlich mehr offen liegen haben
  if (nachArt.has('URKNALL') && !schonzone) {
    let eigen = 0, fremd = 0;
    for (const sp of spiel.spieler) {
      for (const sb of sp.sternbilder) {
        if (istSicher(sb)) continue;
        const p = bewerte(sb.karten).punkte;
        if (sp.idx === idx) eigen += p; else fremd += p;
      }
    }
    const vorteil = fremd - eigen;
    if (vorteil >= b.urknallMinVorteil || (endspurt && vorteil > 0)) return nachArt.get('URKNALL');
  }

  // Weißes Loch: lohnt sich, wenn das Ziel wertvoll ist
  if (wl && (wl.wirkung >= b.weissesLochMinPunkte || (endspurt && wl.wirkung > 0))) return wl;

  return null;
}

function waehleNova(spiel, idx, schonzone = null) {
  if (!spiel.nova) return null;
  let opt = generiereNova(spiel, idx);
  if (schonzone) opt = opt.filter((o) => o.sbId !== schonzone);
  if (opt.length === 0) return null;
  const b = B();
  const best = opt.reduce((a, c) => (c.wirkung > a.wirkung ? c : a));
  const endspurt = (spiel.restZuege ?? 99) <= b.endspurtZuege;
  // In der Schlussrunde ist eine ungenutzte Nova verschenkt
  const letzteChance = b.novaLetzteRunde && spiel.runde >= CONFIG.spiel.runden && endspurt;
  if (best.wirkung >= b.novaMinPunkte && endspurt) return best;
  if (best.wirkung >= b.novaMinPunkte * 2) return best;
  if (letzteChance && best.wirkung > 0) return best;
  return null;
}

/* ---------- Hauptfunktion ---------- */

function besteAktion(spiel, idx) {
  const sp = spiel.spieler[idx];
  const kontext = { himmel: himmelFortschritt(sp), drache: drachenLage(sp) };
  const aktionen = generiereAktionen(spiel, idx);
  if (aktionen.length === 0) return null;
  let best = null;
  for (const a of aktionen) {
    const s = bewerteAktion(spiel, idx, a, kontext);
    if (!best || s > best.s) best = { s, a };
  }
  return best;
}

function botNormal(spiel, idx) {
  // Teil 1 ist begrenzt: höchstens CONFIG.zug.kosmischeProZug Karten pro Zug.
  // Nova und Jokertausch sind freie Aktionen und zählen hier NICHT mit.
  let kosmischeGespielt = 0;
  const darfKosmisch = () => kosmischeGespielt < CONFIG.zug.kosmischeProZug;

  // Milchstraße vorziehen — mehr Karten heißt mehr Möglichkeiten
  const kosmVorab = darfKosmisch()
    ? generiereKosmische(spiel, idx).find((o) => o.art === 'MILCHSTRASSE')
    : null;
  if (kosmVorab) { spiel.spieleKosmisch(idx, kosmVorab); kosmischeGespielt++; }

  // freie Aktion: eigenen Joker gegen die echte Karte tauschen (schützt vor Jokerklau)
  const tausch = generiereJokerTausch(spiel, idx);
  if (tausch.length > 0) spiel.jokerTauschen(idx, tausch[0]);

  // Erst gucken, was man tun WILL — dann entscheiden, ob eine kosmische Karte
  // dazu passt. Sonst schießt man sich das eigene Klau-Ziel weg.
  const vorab = besteAktion(spiel, idx);
  const schonzone = vorab && vorab.a.art === 'KLAUEN' && vorab.s > 3 ? vorab.a.sbId : null;

  const kosm = darfKosmisch() ? waehleKosmisch(spiel, idx, schonzone) : null;
  if (kosm) { spiel.spieleKosmisch(idx, kosm); kosmischeGespielt++; }

  const nova = waehleNova(spiel, idx, schonzone);
  if (nova) spiel.spieleNova(idx, nova);

  // Nach den Zerstörungen neu bewerten
  const best = (kosm || nova) ? besteAktion(spiel, idx) : vorab;
  return { aktion: best ? best.a : null };
}

/* ===== engine\src\bots\easy.js ===== */
/**
 * Einfacher Bot — die Messlatte.
 *  - nimmt immer den Zug mit dem höchsten Sofortgewinn an Punkten
 *  - spielt kosmische Karten, sobald sie nutzbar sind
 *  - versiegelt nie
 *
 * Konvention: Der Bot führt Teil 1 (kosmische Karte) und freie Aktionen selbst aus
 * und gibt nur noch die Pflichtaktion zurück.
 */

function botEinfach(spiel, idx) {
  // Teil 1: erste nutzbare kosmische Karte, stärkstes Ziel
  const kosm = generiereKosmische(spiel, idx);
  if (kosm.length > 0) {
    const best = kosm.reduce((a, b) => ((b.wirkung ?? 0) > (a.wirkung ?? 0) ? b : a));
    spiel.spieleKosmisch(idx, best);
  }

  // Nova sofort verfeuern
  if (spiel.nova) {
    const novas = generiereNova(spiel, idx);
    if (novas.length > 0) {
      const best = novas.reduce((a, b) => (b.wirkung > a.wirkung ? b : a));
      if (best.wirkung > 0) spiel.spieleNova(idx, best);
    }
  }

  // Teil 2: höchster Sofortgewinn
  const aktionen = generiereAktionen(spiel, idx).filter((a) => a.art !== 'VERSIEGELN');
  if (aktionen.length === 0) return { aktion: null };

  let best = null;
  for (const a of aktionen) {
    const wert = a.art === 'KLAUEN' ? a.punkteNachher : a.gewinn;
    if (!best || wert > best.wert) best = { wert, a };
  }
  return { aktion: best.a };
}

/* ===== netz\raum.js ===== */
/**
 * Ein Raum: Lobby und laufende Partie für mehrere Spieler.
 *
 * WICHTIG — diese Datei ist die Schiedsrichterin. Sie läuft auf dem SERVER,
 * nicht im Browser der Spieler. Nur so kann niemand die Handkarten der anderen
 * auslesen oder einen ungültigen Zug erzwingen.
 *
 * Sie kennt weder das Netz noch den Bildschirm: keine WebSockets, kein DOM,
 * keine Node-APIs. Dadurch läuft sie unverändert
 *   - im Node-Server (server/server.js) für das echte Spiel mit Freunden
 *   - und im Browser (app/netz-lokal.js) zum Ausprobieren ohne Server.
 *
 * Der Kniff gegen manipulierte Clients: Ein Spieler beschreibt seinen Zug nie
 * selbst. Er bekommt eine nummerierte Liste erlaubter Züge und schickt nur die
 * Nummer zurück. Der Raum baut die Liste vor jeder Prüfung neu auf. Was nicht
 * in seiner eigenen Liste steht, gibt es nicht.
 */

/** Zeichen ohne Verwechslungsgefahr — kein 0/O, kein 1/I/L. */
const CODE_ZEICHEN = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LAENGE = 4;

const BOT_NAMEN = ['Rigel', 'Wega', 'Atair', 'Mizar'];

/** So viele Protokollzeilen gehen mit jeder Sicht mit — mehr liest niemand. */
const PROTOKOLL_FENSTER = 80;

/** Zufall, der überall läuft — im Browser wie in Node. */
function zufallsZeichen(n, alphabet) {
  let s = '';
  const puffer = new Uint8Array(n);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(puffer);
  else for (let i = 0; i < n; i++) puffer[i] = Math.floor(Math.random() * 256);
  for (let i = 0; i < n; i++) s += alphabet[puffer[i] % alphabet.length];
  return s;
}

const neuerCode = () => zufallsZeichen(CODE_LAENGE, CODE_ZEICHEN);
const neuesGeheimnis = () => zufallsZeichen(24, 'abcdefghijklmnopqrstuvwxyz0123456789');

/**
 * @typedef {Object} Platz
 * @property {number} idx        Sitzplatz 0..3
 * @property {string} name
 * @property {'MENSCH'|'BOT'|'LEER'} art
 * @property {string|null} geheimnis   nur der Server kennt es; damit kommt man zurück
 * @property {boolean} verbunden
 * @property {'einfach'|'normal'} stufe  nur bei Bots
 */

class Raum {
  /**
   * @param {object} [opts]
   *   code          fester Raumcode (sonst wird einer gelost)
   *   maxPlaetze    Vorgabe: CONFIG.spiel.maxSpieler
   *   jetzt         Funktion für die Uhrzeit, damit Tests sie stellen können
   *   botFrist      Millisekunden, nach denen ein Bot für einen Abgesprungenen übernimmt
   */
  constructor(opts = {}) {
    this.code = opts.code || neuerCode();
    this.maxPlaetze = opts.maxPlaetze || CONFIG.spiel.maxSpieler;
    this.jetzt = opts.jetzt || (() => Date.now());
    this.botFrist = opts.botFrist ?? 45000;

    /** @type {Platz[]} */
    this.plaetze = [];
    this.phase = 'LOBBY';        // 'LOBBY' | 'PARTIE' | 'ENDE'
    this.ablauf = null;
    this.wirtIdx = 0;            // wer den Raum aufgemacht hat und starten darf
    this.letzteOptionen = new Map();  // platzIdx -> die zuletzt verschickte Zugliste
    this.protokollStand = 0;
  }

  /* ---------------- Lobby ---------------- */

  get spielerZahl() { return this.plaetze.length; }
  frei() { return this.maxPlaetze - this.plaetze.length; }

  /**
   * Setzt einen Menschen an den Tisch.
   * @returns {{ok:true, idx:number, geheimnis:string}|{ok:false, grund:string}}
   */
  betreten(name) {
    if (this.phase !== 'LOBBY') return { ok: false, grund: 'Die Partie läuft schon.' };
    if (this.frei() <= 0) return { ok: false, grund: 'Der Raum ist voll.' };
    const geheimnis = neuesGeheimnis();
    const idx = this.plaetze.length;
    this.plaetze.push({
      idx, name: this.freierName(name), art: 'MENSCH',
      geheimnis, verbunden: true, stufe: 'normal', wegSeit: null,
    });
    return { ok: true, idx, geheimnis };
  }

  /** Gleiche Namen sind verwirrend — hier bekommt der zweite eine 2 dahinter. */
  freierName(name) {
    let sauber = String(name || '').trim().slice(0, 14) || 'Gast';
    const belegt = new Set(this.plaetze.map((p) => p.name));
    if (!belegt.has(sauber)) return sauber;
    for (let i = 2; i < 20; i++) if (!belegt.has(sauber + ' ' + i)) return sauber + ' ' + i;
    return sauber + ' ' + neuerCode();
  }

  /** Einen freien Platz mit einem Bot besetzen. Nur der Wirt darf das. */
  botDazu(vonIdx, stufe = 'normal') {
    if (this.phase !== 'LOBBY') return { ok: false, grund: 'Die Partie läuft schon.' };
    if (vonIdx !== this.wirtIdx) return { ok: false, grund: 'Das darf nur, wer den Raum aufgemacht hat.' };
    if (this.frei() <= 0) return { ok: false, grund: 'Der Raum ist voll.' };
    const idx = this.plaetze.length;
    const name = this.freierName(BOT_NAMEN[idx % BOT_NAMEN.length]);
    this.plaetze.push({ idx, name, art: 'BOT', geheimnis: null, verbunden: true, stufe, wegSeit: null });
    return { ok: true, idx };
  }

  /** Einen Platz wieder räumen (nur in der Lobby, nur vom Wirt oder man selbst). */
  platzRaeumen(vonIdx, idx) {
    if (this.phase !== 'LOBBY') return { ok: false, grund: 'Die Partie läuft schon.' };
    if (vonIdx !== this.wirtIdx && vonIdx !== idx) return { ok: false, grund: 'Nicht erlaubt.' };
    if (idx === this.wirtIdx) return { ok: false, grund: 'Der Wirt bleibt sitzen.' };
    const weg = this.plaetze.findIndex((p) => p.idx === idx);
    if (weg < 0) return { ok: false, grund: 'Der Platz ist schon leer.' };
    this.plaetze.splice(weg, 1);
    this.plaetze.forEach((p, i) => { p.idx = i; });
    if (this.wirtIdx >= this.plaetze.length) this.wirtIdx = 0;
    return { ok: true };
  }

  umbenennen(idx, name) {
    const p = this.plaetze[idx];
    if (!p || this.phase !== 'LOBBY') return { ok: false, grund: 'Geht gerade nicht.' };
    p.name = this.freierName(name);
    return { ok: true };
  }

  /** Zurück nach einem Verbindungsabbruch. */
  wiederRein(geheimnis) {
    const p = this.plaetze.find((x) => x.geheimnis && x.geheimnis === geheimnis);
    if (!p) return { ok: false, grund: 'Dieser Platz gehört dir nicht (mehr).' };
    p.verbunden = true;
    p.wegSeit = null;
    if (p.art === 'BOT') p.art = 'MENSCH';    // der Bot gibt den Platz zurück
    return { ok: true, idx: p.idx };
  }

  /** Verbindung weg — der Platz bleibt reserviert, bis die Frist abläuft. */
  abgemeldet(idx) {
    const p = this.plaetze[idx];
    if (!p) return;
    p.verbunden = false;
    p.wegSeit = this.jetzt();
    if (this.phase === 'LOBBY' && p.idx !== this.wirtIdx) this.platzRaeumen(this.wirtIdx, idx);
  }

  /**
   * Muss regelmäßig gerufen werden: Wer zu lange weg ist, wird von einem Bot
   * vertreten, damit die Partie nicht stirbt. Der Platz bleibt zurückholbar.
   * @returns {number[]} Plätze, die gerade übernommen wurden
   */
  pruefeAbgesprungene() {
    const uebernommen = [];
    if (this.phase !== 'PARTIE') return uebernommen;
    for (const p of this.plaetze) {
      if (p.art !== 'MENSCH' || p.verbunden || p.wegSeit == null) continue;
      if (this.jetzt() - p.wegSeit < this.botFrist) continue;
      p.art = 'BOT';
      uebernommen.push(p.idx);
    }
    return uebernommen;
  }

  /* ---------------- Partie ---------------- */

  starten(vonIdx, seed) {
    if (this.phase !== 'LOBBY') return { ok: false, grund: 'Die Partie läuft schon.' };
    if (vonIdx !== this.wirtIdx) return { ok: false, grund: 'Nur wer den Raum aufgemacht hat, kann starten.' };
    if (this.spielerZahl < CONFIG.spiel.minSpieler) {
      return { ok: false, grund: `Es braucht mindestens ${CONFIG.spiel.minSpieler} Spieler.` };
    }
    const namen = this.plaetze.map((p) => p.name);
    this.ablauf = new Ablauf(this.spielerZahl, (seed ?? Math.floor(Math.random() * 2 ** 32)) >>> 0, {
      namen, protokoll: true,
      menschIdx: -1,                          // niemand ist bevorzugt; jeder sieht nur sich selbst
      himmelWahlManuell: this.plaetze.filter((p) => p.art === 'MENSCH').map((p) => p.idx),
    });
    this.ablauf.start();
    this.phase = 'PARTIE';
    return { ok: true };
  }

  botFuer(idx) {
    const p = this.plaetze[idx];
    return p && p.stufe === 'einfach' ? botEinfach : botNormal;
  }

  /** Ist gerade ein Bot dran (oder ein übernommener Platz)? */
  botIstDran() {
    const a = this.ablauf;
    if (!a || a.phase !== 'ZUG') return false;
    const p = this.plaetze[a.amZug];
    return !!p && p.art === 'BOT';
  }

  /**
   * Einen einzelnen Botzug ausführen. Der Aufrufer (Server) ruft das in Ruhe
   * wiederholt auf, damit die Menschen zusehen können.
   * @returns {boolean} true, wenn wirklich gezogen wurde
   */
  botSchritt() {
    if (!this.botIstDran()) return false;
    this.ablauf.botZug(this.botFuer(this.ablauf.amZug));
    this.nachZug();
    return true;
  }

  /** Rundenwechsel und Spielende einsammeln. */
  nachZug() {
    const a = this.ablauf;
    if (a.phase === 'RUNDENENDE') a.weiter();
    if (a.beendet) this.phase = 'ENDE';
  }

  /* ---------------- Was ein Spieler sehen darf ---------------- */

  /**
   * Der Ausschnitt für genau einen Platz. Fremde Handkarten sind hier nur
   * Zahlen, keine Karten — sie verlassen den Server nie.
   */
  sicht(idx) {
    if (this.phase === 'LOBBY') {
      return {
        phase: 'LOBBY',
        code: this.code,
        ichBin: idx,
        wirt: this.wirtIdx,
        maxPlaetze: this.maxPlaetze,
        minSpieler: CONFIG.spiel.minSpieler,
        plaetze: this.plaetze.map((p) => ({
          idx: p.idx, name: p.name, art: p.art, verbunden: p.verbunden, stufe: p.stufe,
        })),
      };
    }

    const a = this.ablauf;
    const s = a.spiel;
    const z = a.zustand();
    // zustand() legt die Hand von menschIdx offen — der ist hier -1, also niemand.
    // Die eigene Hand setzen wir gezielt ein.
    for (const sp of z.spieler) {
      sp.hand = sp.idx === idx ? [...s.spieler[idx].hand] : null;
      sp.verbunden = this.plaetze[sp.idx] ? this.plaetze[sp.idx].verbunden : true;
      sp.art = this.plaetze[sp.idx] ? this.plaetze[sp.idx].art : 'BOT';
    }

    return {
      phase: this.phase,
      code: this.code,
      ichBin: idx,
      zustand: z,
      // Nur der letzte Abschnitt. Das ganze Protokoll wuchs mit jeder Runde,
      // und es geht bei JEDEM Zug an JEDEN Spieler — gemessen wurde die Partie
      // dadurch gegen Ende zäh, und auf dem Handy kostet es Datenvolumen.
      protokoll: s.protokoll.slice(-PROTOKOLL_FENSTER),
      optionen: this.optionenFuer(idx),
      ergebnis: this.phase === 'ENDE' ? s.ergebnis() : null,
    };
  }

  /**
   * Die nummerierte Zugliste für einen Platz — und nur für den, der dran ist.
   * Die Liste wird gemerkt, damit eine hereinkommende Nummer dagegen geprüft
   * werden kann.
   */
  optionenFuer(idx) {
    const a = this.ablauf;
    const leer = { aktionen: [], kosmische: [], nova: [], jokerTausch: [], himmelZiele: [] };
    if (!a || this.phase !== 'PARTIE') { this.letzteOptionen.delete(idx); return leer; }

    if (a.phase === 'HIMMELWAHL' && a.amZug === idx) {
      const o = { ...leer, himmelZiele: a.himmelZiele() };
      this.letzteOptionen.set(idx, o);
      return o;
    }
    if (a.phase !== 'ZUG' || a.amZug !== idx) { this.letzteOptionen.delete(idx); return leer; }

    const o = a.optionen();
    o.himmelZiele = [];
    this.letzteOptionen.set(idx, o);
    return o;
  }

  /* ---------------- Züge annehmen ---------------- */

  /**
   * Der einzige Weg, einen Zug zu machen. `wahl` enthält NUR Nummern aus der
   * Liste, die dieser Spieler zuletzt bekommen hat.
   * @param {number} idx
   * @param {{art:'AKTION'|'KOSMISCH'|'NOVA'|'JOKERTAUSCH'|'HIMMELZIEL', nr:number}} wahl
   */
  zug(idx, wahl) {
    const a = this.ablauf;
    if (this.phase !== 'PARTIE' || !a) return { ok: false, grund: 'Gerade läuft keine Partie.' };
    const p = this.plaetze[idx];
    if (!p) return { ok: false, grund: 'Diesen Platz gibt es nicht.' };
    if (a.amZug !== idx) return { ok: false, grund: 'Du bist nicht dran.' };

    // Immer frisch aufbauen: die gemerkte Liste ist nur die Nummerierung,
    // gültig ist, was JETZT erlaubt wäre.
    const o = this.optionenFuer(idx);
    const hol = (liste, nr) => (Number.isInteger(nr) && nr >= 0 && nr < liste.length ? liste[nr] : null);

    switch (wahl && wahl.art) {
      case 'KOSMISCH': {
        const k = hol(o.kosmische, wahl.nr);
        if (!k) return { ok: false, grund: 'Diese kosmische Karte kannst du gerade nicht spielen.' };
        a.spiel.spieleKosmisch(idx, k);
        return { ok: true, weiter: false };
      }
      case 'NOVA': {
        const n = hol(o.nova, wahl.nr);
        if (!n) return { ok: false, grund: 'Die Nova geht gerade nicht.' };
        a.spiel.spieleNova(idx, n);
        return { ok: true, weiter: false };
      }
      case 'JOKERTAUSCH': {
        const t = hol(o.jokerTausch, wahl.nr);
        if (!t) return { ok: false, grund: 'Dieser Tausch geht gerade nicht.' };
        a.spiel.jokerTauschen(idx, t);
        return { ok: true, weiter: false };
      }
      case 'HIMMELZIEL': {
        if (a.phase !== 'HIMMELWAHL') return { ok: false, grund: 'Da ist gerade nichts zu wählen.' };
        const ziel = hol(o.himmelZiele, wahl.nr);
        a.waehleHimmelZiel(ziel ? ziel.sbId : null);
        this.nachZug();
        return { ok: true, weiter: true };
      }
      case 'AKTION': {
        const akt = hol(o.aktionen, wahl.nr);
        if (!akt) return { ok: false, grund: 'Dieser Zug ist nicht erlaubt.' };
        a.spieleZug({ aktion: akt });
        this.nachZug();
        return { ok: true, weiter: true };
      }
      default:
        return { ok: false, grund: 'Unbekannte Anfrage.' };
    }
  }
}

/* ===== server\server.js ===== */
/**
 * Sternenraub — Server für das Spiel mit Freunden.
 *
 * Läuft auf Deno Deploy. Aufgabe: Räume halten, WebSockets bedienen, und für
 * jeden Spieler NUR das verschicken, was er sehen darf.
 *
 * Die Schiedsrichterin ist netz/raum.js. Diese Datei kennt keine Spielregeln.
 * Sie nimmt Nachrichten entgegen, gibt sie an den Raum weiter und schickt die
 * Sichten zurück.
 *
 * Sicherheit: Ein Spieler beschreibt seinen Zug nie selbst, er schickt nur die
 * Nummer aus der Liste, die der Raum ihm gegeben hat. Fremde Handkarten sind
 * in `raum.sicht(idx)` gar nicht enthalten und verlassen den Server nie.
 *
 * Gebaut wird die auslieferbare Fassung mit:
 *     powershell -ExecutionPolicy Bypass -File werkzeug\server-bauen.ps1
 * Ergebnis: web\server\main.js — eine einzige Datei ohne Importe.
 */


/* ------------------------------------------------------------------ */
/*  Zustand                                                            */
/* ------------------------------------------------------------------ */

/** code -> Raum */
const srvRaeume = new Map();
/** code -> Map(platzIdx -> WebSocket) */
const srvSockets = new Map();

/** Wie lange ein leerer Raum aufgehoben wird, bevor er verfällt. */
const SRV_RAUM_FRIST = 2 * 60 * 60 * 1000;   // zwei Stunden
/**
 * Denkpause eines Bots, damit die Menschen mitkommen. Über die
 * Umgebungsvariable BOT_PAUSE verstellbar — im Test steht sie auf 0, damit
 * eine ganze Partie in Sekunden durchläuft.
 */
const SRV_BOT_PAUSE = (() => {
  let v = null;
  try { v = Deno.env && Deno.env.get ? Deno.env.get('BOT_PAUSE') : null; } catch { /* ohne Recht: Vorgabe */ }
  const n = Number(v);
  return Number.isFinite(n) && v !== null && v !== '' ? Math.max(0, n) : 900;
})();

/* ------------------------------------------------------------------ */
/*  Verschicken                                                        */
/* ------------------------------------------------------------------ */

function srvSende(ws, obj) {
  try { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); } catch { /* weg ist weg */ }
}

function srvFehler(ws, text) { srvSende(ws, { art: 'FEHLER', text }); }

/** Jedem Verbundenen seine eigene Sicht schicken — jede ist anders. */
function srvAlleSehen(code) {
  const raum = srvRaeume.get(code);
  const socks = srvSockets.get(code);
  if (!raum || !socks) return;
  for (const [idx, ws] of socks) srvSende(ws, { art: 'SICHT', sicht: raum.sicht(idx) });
}

/* ------------------------------------------------------------------ */
/*  Bots ziehen lassen                                                 */
/* ------------------------------------------------------------------ */

/**
 * Solange ein Bot dran ist: einen Zug, verschicken, kurz warten, nächster.
 * Läuft für jeden Raum nur einmal gleichzeitig (`botLaeuft`).
 */
async function srvBotsZiehen(code) {
  const raum = srvRaeume.get(code);
  if (!raum || raum.botLaeuft) return;
  raum.botLaeuft = true;
  try {
    while (srvRaeume.get(code) === raum && raum.botIstDran()) {
      // Bei Pause 0 (Test) gar kein Zeitgeber: der wird in manchen Umgebungen
      // auf eine Sekunde gedrosselt und macht aus einer Partie eine Ewigkeit.
      if (SRV_BOT_PAUSE > 0) await new Promise((f) => setTimeout(f, SRV_BOT_PAUSE));
      if (!raum.botSchritt()) break;
      srvAlleSehen(code);
    }
  } finally {
    raum.botLaeuft = false;
  }
}

/* ------------------------------------------------------------------ */
/*  Nachrichten                                                        */
/* ------------------------------------------------------------------ */

/**
 * @param {WebSocket} ws
 * @param {object} sitz  { code, idx } — wird beim Betreten gefüllt
 * @param {object} n     die Nachricht des Clients
 */
function srvNachricht(ws, sitz, n) {
  const art = n && n.art;

  /* ---- Raum aufmachen ---- */
  if (art === 'ERSTELLEN') {
    const raum = new Raum();
    const rein = raum.betreten(n.name);
    if (!rein.ok) return srvFehler(ws, rein.grund);
    srvRaeume.set(raum.code, raum);
    srvSockets.set(raum.code, new Map([[rein.idx, ws]]));
    raum.zuletzt = Date.now();
    sitz.code = raum.code;
    sitz.idx = rein.idx;
    srvSende(ws, {
      art: 'PLATZ', code: raum.code, idx: rein.idx, geheimnis: rein.geheimnis,
      sicht: raum.sicht(rein.idx),
    });
    return;
  }

  /* ---- Raum betreten ---- */
  if (art === 'BEITRETEN') {
    const code = String(n.code || '').toUpperCase().trim();
    const raum = srvRaeume.get(code);
    if (!raum) return srvFehler(ws, 'Diesen Raum gibt es nicht (mehr).');
    const rein = raum.betreten(n.name);
    if (!rein.ok) return srvFehler(ws, rein.grund);
    srvSockets.get(code).set(rein.idx, ws);
    raum.zuletzt = Date.now();
    sitz.code = code;
    sitz.idx = rein.idx;
    srvSende(ws, {
      art: 'PLATZ', code, idx: rein.idx, geheimnis: rein.geheimnis,
      sicht: raum.sicht(rein.idx),
    });
    srvAlleSehen(code);
    return;
  }

  /* ---- Nach einem Abbruch zurück ---- */
  if (art === 'ZURUECK') {
    const code = String(n.code || '').toUpperCase().trim();
    const raum = srvRaeume.get(code);
    if (!raum) return srvFehler(ws, 'Diesen Raum gibt es nicht (mehr).');
    const rein = raum.wiederRein(n.geheimnis);
    if (!rein.ok) return srvFehler(ws, rein.grund);
    srvSockets.get(code).set(rein.idx, ws);
    raum.zuletzt = Date.now();
    sitz.code = code;
    sitz.idx = rein.idx;
    srvSende(ws, { art: 'PLATZ', code, idx: rein.idx, geheimnis: n.geheimnis, sicht: raum.sicht(rein.idx) });
    srvAlleSehen(code);
    return;
  }

  /* ---- Ab hier muss man an einem Platz sitzen ---- */
  const raum = srvRaeume.get(sitz.code);
  if (!raum || sitz.idx == null) return srvFehler(ws, 'Du sitzt an keinem Tisch.');
  raum.zuletzt = Date.now();

  switch (art) {
    case 'NAME': {
      const r = raum.umbenennen(sitz.idx, n.name);
      if (!r.ok) return srvFehler(ws, r.grund);
      break;
    }
    case 'BOT': {
      const r = raum.botDazu(sitz.idx, n.stufe === 'einfach' ? 'einfach' : 'normal');
      if (!r.ok) return srvFehler(ws, r.grund);
      break;
    }
    case 'PLATZ_WEG': {
      const r = raum.platzRaeumen(sitz.idx, Number(n.idx));
      if (!r.ok) return srvFehler(ws, r.grund);
      break;
    }
    case 'START': {
      const r = raum.starten(sitz.idx);
      if (!r.ok) return srvFehler(ws, r.grund);
      srvAlleSehen(sitz.code);
      srvBotsZiehen(sitz.code);
      return;
    }
    case 'ZUG': {
      const r = raum.zug(sitz.idx, { art: n.was, nr: Number(n.nr) });
      if (!r.ok) return srvFehler(ws, r.grund);
      srvAlleSehen(sitz.code);
      srvBotsZiehen(sitz.code);
      return;
    }
    default:
      return srvFehler(ws, 'Unbekannte Anfrage.');
  }
  srvAlleSehen(sitz.code);
}

/* ------------------------------------------------------------------ */
/*  Aufräumen                                                          */
/* ------------------------------------------------------------------ */

/**
 * Regelmäßig: Wer zu lange weg ist, wird von einem Bot vertreten, damit die
 * Partie nicht stehen bleibt. Leere Räume verfallen.
 */
setInterval(() => {
  const jetzt = Date.now();
  for (const [code, raum] of srvRaeume) {
    const uebernommen = raum.pruefeAbgesprungene();
    if (uebernommen.length) { srvAlleSehen(code); srvBotsZiehen(code); }

    const socks = srvSockets.get(code);
    const niemandDa = !socks || socks.size === 0;
    if (niemandDa && jetzt - (raum.zuletzt || 0) > SRV_RAUM_FRIST) {
      srvRaeume.delete(code);
      srvSockets.delete(code);
    }
  }
}, 5000);

/* ------------------------------------------------------------------ */
/*  Der Webdienst                                                      */
/* ------------------------------------------------------------------ */

Deno.serve((anfrage) => {
  const url = new URL(anfrage.url);

  // Kurze Auskunft, ob der Server lebt — praktisch zum Nachsehen im Browser.
  if (url.pathname !== '/ws') {
    return new Response(
      JSON.stringify({ dienst: 'Sternenraub', raeume: srvRaeume.size, zeit: new Date().toISOString() }, null, 1),
      { headers: { 'content-type': 'application/json; charset=utf-8' } },
    );
  }

  if (anfrage.headers.get('upgrade') !== 'websocket') {
    return new Response('Hier spricht nur WebSocket.', { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(anfrage);
  const sitz = { code: null, idx: null };

  socket.onmessage = (e) => {
    let n = null;
    try { n = JSON.parse(e.data); } catch { return srvFehler(socket, 'Unlesbare Nachricht.'); }
    try { srvNachricht(socket, sitz, n); }
    catch (fehler) { srvFehler(socket, 'Das ging schief: ' + (fehler && fehler.message)); }
  };

  socket.onclose = () => {
    const raum = srvRaeume.get(sitz.code);
    const socks = srvSockets.get(sitz.code);
    if (socks && socks.get(sitz.idx) === socket) socks.delete(sitz.idx);
    if (raum && sitz.idx != null) {
      raum.abgemeldet(sitz.idx);
      raum.zuletzt = Date.now();
      srvAlleSehen(sitz.code);
    }
  };

  socket.onerror = () => { /* der Abbruch kommt gleich als onclose */ };

  return response;
});


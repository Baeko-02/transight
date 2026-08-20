"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Validation =
  | { kind: "hash"; hashes: string[]; normalize: "text" | "hex" | "null" | "offset" }
  | { kind: "keyword"; hash: string; size: number }
  | { kind: "range"; a: number; b: number };

type Field = { id: string; label: string; placeholder: string; optional?: boolean; tabHint: string; validation: Validation };
type Clue = { label: string; value: string; href: string; network: string };
type Mission = { id: number; title: string; difficulty: string; time: string; route: string; objective: string; briefing: string; clues: Clue[]; fields: Field[]; hints: string[] };

// 강사용 문제 데이터: 문제 추가·수정은 이 배열에서 관리합니다.
// 문자열 정답은 정규화된 SHA-256 해시만 저장합니다.
const MISSIONS: Mission[] = [
  {
    id: 1, title: "USDT 출처 찾기", difficulty: "기초", time: "15:20:35 UTC", route: "거래소 출금 확인",
    objective: "토큰을 보낸 주소의 엔티티 라벨을 확인합니다.",
    briefing: "아래 주소는 2026년 8월 17일에 10 USDT를 받았습니다. 이 USDT를 보낸 엔티티는 어디인가요?",
    clues: [{ label: "추적 지갑", value: "0x7f4980d82d884062220B06C4d628329fb43dAf42", href: "https://etherscan.io/address/0x7f4980d82d884062220B06C4d628329fb43dAf42", network: "Etherscan" }],
    fields: [
      { id: "1-1", label: "10 USDT를 보낸 엔티티는 어디인가요?", placeholder: "거래소 또는 엔티티 이름", tabHint: "10 USDT가 들어온 행의 From 주소 라벨을 확인해 보세요.", validation: { kind: "keyword", hash: "8c2785d119e0c4629f89bf83d7b2059d718d18baadfd10320c708feef56ecebf", size: 5 } },
      { id: "1-2", label: "10 USDT를 전송받은 트랜잭션 해시는 무엇인가요?", placeholder: "0x로 시작하는 Tx Hash", tabHint: "10 USDT 수신 기록을 연 뒤 페이지 상단의 Transaction Hash를 복사해 보세요.", validation: { kind: "hash", hashes: ["99d065edb22adcb8d8b7a8496d230533fbaec612c281ae9d8724e82c7cac1c5b"], normalize: "hex" } },
    ],
    hints: [
      "Etherscan에서 주소를 연 뒤 ERC-20 Token Txns 또는 Token Transfers를 확인하세요.",
      "2026-08-17에 정확히 10 USDT가 들어온 기록을 찾으세요.",
      "해당 전송의 From 주소 라벨과 Transaction Hash를 각각 입력하세요.",
    ],
  },
  {
    id: 2, title: "브릿지 플랫폼 찾기", difficulty: "기초", time: "15:41:11 UTC", route: "USDC 브릿지 확인",
    objective: "지갑 활동에서 323 USDC 브릿징 기록과 사용한 플랫폼을 식별합니다.",
    briefing: "아래 주소는 2026년 8월 17일에 323 USDC를 브릿징했습니다. 사용한 브릿지 플랫폼과 해당 트랜잭션 해시를 찾아보세요.",
    clues: [{ label: "추적 지갑", value: "0x7f4980d82d884062220B06C4d628329fb43dAf42", href: "https://etherscan.io/address/0x7f4980d82d884062220B06C4d628329fb43dAf42", network: "Etherscan" }],
    fields: [
      { id: "2-1", label: "323 USDC가 브릿징된 플랫폼은 어디인가요?", placeholder: "브릿지 플랫폼 이름", tabHint: "323 USDC가 이동한 거래의 To 주소 또는 Spoke Pool 라벨을 확인해 보세요.", validation: { kind: "keyword", hash: "deb538b50cb6318b008ce659351305f566d3d7453de0332d5be20fa1e69b8c47", size: 6 } },
      { id: "2-2", label: "323 USDC 브릿징 트랜잭션 해시는 무엇인가요?", placeholder: "0x로 시작하는 Tx Hash", tabHint: "323 USDC가 이동한 거래를 연 뒤 Transaction Hash를 복사해 보세요.", validation: { kind: "hash", hashes: ["6a90389cfdca61d943d9a280c289ba168664f9c358706dba8708acde4eabf3e4"], normalize: "hex" } },
    ],
    hints: [
      "Etherscan에서 주소를 연 뒤 ERC-20 Token Txns 또는 Token Transfers를 확인하세요.",
      "2026-08-17에 323 USDC가 지갑에서 나간 기록을 찾으세요.",
      "해당 거래의 To 주소 라벨과 Transaction Hash를 각각 입력하세요.",
    ],
  },
  {
    id: 3, title: "DeFi 예치 찾기", difficulty: "기초", time: "15:40:35 UTC", route: "예치와 수령 토큰 확인",
    objective: "보낸 토큰과 새로 받은 토큰을 함께 확인해 DeFi 예치를 식별합니다.",
    briefing: "같은 주소는 2026년 8월 17일에 USDT를 DeFi에 예치하고 그 대가로 새로운 토큰을 받았습니다. DeFi 이름과 받은 토큰의 심볼을 찾아보세요.",
    clues: [{ label: "예치 트랜잭션", value: "0x6321713e3b4cb420ad2e497a2d994249c89fb32a5eb345e4de340ad3f93f7a94", href: "https://etherscan.io/tx/0x6321713e3b4cb420ad2e497a2d994249c89fb32a5eb345e4de340ad3f93f7a94", network: "Etherscan" }],
    fields: [
      { id: "3-1", label: "USDT를 예치한 DeFi는 어디인가요?", placeholder: "DeFi 프로토콜 이름", tabHint: "To 주소에 붙은 프로토콜 라벨을 확인해 보세요.", validation: { kind: "keyword", hash: "5e0502adfb96f1f1544d24f00c99b269c12570acfd994666ffb86424e0835370", size: 5 } },
      { id: "3-2", label: "예치 대가로 받은 토큰의 심볼은 무엇인가요?", placeholder: "토큰 심볼", tabHint: "Tokens Transferred에서 지갑으로 들어온 새 토큰을 확인해 보세요.", validation: { kind: "hash", hashes: ["64f18ad87db85ddfce2a5185e54503f5393099c40c325248232dde430f27d91e"], normalize: "text" } },
    ],
    hints: [
      "Etherscan의 Tokens Transferred 영역을 확인하세요.",
      "USDT가 나간 것과 동시에 지갑으로 새로 들어온 토큰을 함께 보세요.",
      "To 주소의 프로토콜 라벨과 들어온 토큰의 심볼을 각각 입력하세요.",
    ],
  },
];

const FLOW = ["수신 확인", "출처 확인", "브릿지 확인", "DeFi 확인"];
const STORAGE_KEY = "transight-investigation-beginner-v3";
const SHA_SEEDS = (() => {
  const maxWord = 2 ** 32;
  const initial: number[] = [];
  const constants: number[] = [];
  const composite: Record<number, boolean> = {};
  let count = 0;
  for (let candidate = 2; count < 64; candidate++) {
    if (!composite[candidate]) {
      for (let i = candidate * candidate; i < 313; i += candidate) composite[i] = true;
      initial[count] = (candidate ** 0.5 * maxWord) | 0;
      constants[count++] = (candidate ** (1 / 3) * maxWord) | 0;
    }
  }
  return { initial: initial.slice(0, 8), constants };
})();

function decode(b64: string) { return decodeURIComponent(escape(atob(b64))); }
async function digest(value: string) {
  // Pure JS fallback keeps grading available in non-secure/local preview contexts.
  const rightRotate = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const maxWord = 2 ** 32;
  const words: number[] = [];
  const hash = SHA_SEEDS.initial.slice();
  const k = SHA_SEEDS.constants;
  const bytes = unescape(encodeURIComponent(value));
  let ascii = bytes + "\x80";
  while ((ascii.length % 64) !== 56) ascii += "\x00";
  for (let i = 0; i < ascii.length; i++) words[i >> 2] |= ascii.charCodeAt(i) << ((3 - i) % 4) * 8;
  words.push((bytes.length / maxWord) | 0, bytes.length << 3);
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15]; const w2 = w[i - 2];
      if (i >= 16) w[i] = (w[i - 16] + (rightRotate(7, w15) ^ rightRotate(18, w15) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(17, w2) ^ rightRotate(19, w2) ^ (w2 >>> 10))) | 0;
      const a = hash[0]; const e = hash[4];
      const temp1 = (hash[7] + (rightRotate(6, e) ^ rightRotate(11, e) ^ rightRotate(25, e)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] + w[i]) | 0;
      const temp2 = ((rightRotate(2, a) ^ rightRotate(13, a) ^ rightRotate(22, a)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))) | 0;
      hash.unshift((temp1 + temp2) | 0); hash[4] = (hash[4] + temp1) | 0; hash.pop();
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  return hash.map((n) => (n >>> 0).toString(16).padStart(8, "0")).join("");
}
function normalize(value: string, mode: "text" | "hex" | "null" | "offset") {
  const base = value.trim().toLowerCase();
  if (mode === "text") return base.replace(/[\s,]/g, "");
  if (mode === "offset") return base.replace(/\s/g, "").replace(/[–—]/g, "-").replace(/번째|바이트/g, "");
  if (mode === "null" && (base === "null" || base === "소각")) return base;
  const hex = base.replace(/\s/g, "").replace(/^0x/, "").replace(/^0+/, "");
  return hex || "0";
}
async function validate(value: string, rule: Validation) {
  if (!value.trim()) return false;
  if (rule.kind === "range") {
    const n = Number(value.replace(/[\s,]/g, ""));
    return Number.isFinite(n) && n >= rule.a && n <= rule.b;
  }
  if (rule.kind === "keyword") {
    const clean = normalize(value, "text");
    if (clean.length < rule.size) return false;
    const candidates = Array.from({ length: clean.length - rule.size + 1 }, (_, i) => clean.slice(i, i + rule.size));
    return (await Promise.all(candidates.map(digest))).includes(rule.hash);
  }
  return rule.hashes.includes(await digest(normalize(value, rule.normalize)));
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }
  return <button className="copy-button" type="button" onClick={copy} aria-label="값 복사">{copied ? "복사됨" : "복사"}</button>;
}

function CaseHeader({ active }: { active: number }) {
  return <div className="case-header"><div className="brand-lockup"><span className="brand-mark">T</span><span><b>TRANSIGHT</b><small>ONCHAIN INVESTIGATION</small></span></div><div className="status-pill"><i />{active === 4 ? "추적 완료" : `단계 ${Math.max(active, 0)}/3`}</div></div>;
}

function RouteRail({ solved, active }: { solved: number[]; active: number }) {
  return <div className="route-rail" aria-label="자금 흐름 진행 상황">{FLOW.map((node, index) => {
    const lit = index === 0 || solved.length >= index || active > index;
    return <div className={`route-stop ${lit ? "lit" : ""}`} key={node}><span className="route-dot">{index === 0 ? "S" : index}</span><span className="route-label">{node}</span>{index < FLOW.length - 1 && <span className={`route-link ${solved.length > index ? "lit" : ""}`} />}</div>;
  })}</div>;
}

function Explanation({ mission }: { mission: Mission }) {
  if (mission.id === 1) return <section className="explanation"><div className="explanation-title"><span>정답 확인</span><h3>보낸 주소의 라벨은 {decode("QnliaXQ=")}입니다</h3></div><p>2026년 8월 17일 15:20:35 UTC의 전송 기록에서 10 USDT가 추적 지갑으로 들어왔습니다. From 주소에는 거래소 라벨이 표시되며, 같은 화면에서 전체 Transaction Hash를 확인할 수 있습니다.</p><a className="explanation-link" href="https://etherscan.io/tx/0xc62a311e7e27f985e9d1e186aa6f18a4d0b8b80c48fff9933a4c7e54b624faac" target="_blank" rel="noreferrer">해설 트랜잭션 열기 · 0xc62a311e…b624faac ↗</a></section>;
  if (mission.id === 2) return <section className="explanation"><div className="explanation-title"><span>정답 확인</span><h3>323 USDC를 브릿징한 플랫폼은 {decode("QWNyb3Nz")}입니다</h3></div><p>주소의 토큰 이동 기록에서 323 USDC가 나간 트랜잭션을 찾을 수 있습니다. 거래의 To 주소와 Logs 탭에서 Spoke Pool 및 FundsDeposited 이벤트를 확인하고, 상단에서 전체 Transaction Hash를 확인합니다.</p><a className="explanation-link" href="https://etherscan.io/tx/0x83c4ccd91b4d462364fd086aa8ce16449c104961dac6119797c2bcf6b344a9a3" target="_blank" rel="noreferrer">해설 트랜잭션 열기 · 0x83c4ccd9…344a9a3 ↗</a></section>;
  return <section className="explanation"><div className="explanation-title"><span>정답 확인</span><h3>{decode("Rmx1aWQ=")}에 예치하고 {decode("ZlVTRFQ=")}를 받았습니다</h3></div><p>Tokens Transferred에서 USDT가 DeFi 컨트랙트로 나가고, 같은 트랜잭션 안에서 새로운 토큰이 지갑으로 들어오는 것을 확인할 수 있습니다. 이 새 토큰은 예치 지분을 나타내는 영수증 토큰입니다.</p><div className="method-grid"><div><b>01 · To 라벨</b><span>예치한 DeFi를 확인합니다.</span></div><div><b>02 · 보낸 토큰</b><span>USDT가 컨트랙트로 이동합니다.</span></div><div><b>03 · 받은 토큰</b><span>{decode("ZlVTRFQ=")} 심볼을 확인합니다.</span></div></div><a className="explanation-link" href="https://etherscan.io/tx/0x6321713e3b4cb420ad2e497a2d994249c89fb32a5eb345e4de340ad3f93f7a94" target="_blank" rel="noreferrer">해설 트랜잭션 열기 · 0x6321713e…3f93f7a94 ↗</a></section>;
}

export default function Home() {
  const [view, setView] = useState(0);
  const [solved, setSolved] = useState<number[]>([]);
  const [hints, setHints] = useState<Record<number, number>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { if (new URLSearchParams(window.location.search).has("fresh")) { setHydrated(true); return; } try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const saved = JSON.parse(raw); if (Array.isArray(saved.solved)) setSolved(saved.solved); if (saved.hints) setHints(saved.hints); } } catch {} setHydrated(true); }, []);
  useEffect(() => { if (!hydrated || new URLSearchParams(window.location.search).has("fresh")) return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ solved, hints })); } catch {} }, [solved, hints, hydrated]);
  const mission = view >= 1 && view <= 3 ? MISSIONS[view - 1] : null;
  const totalHints = useMemo(() => Object.values(hints).reduce((sum, n) => sum + n, 0), [hints]);
  const percent = Math.round((solved.length / 3) * 100);

  function start() { setView(solved.length === 3 ? 4 : Math.min(solved.length + 1, 3)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function openMission(id: number) { if (id <= solved.length + 1) { setView(id); setResults({}); window.scrollTo({ top: 0, behavior: "smooth" }); } }
  function revealHint() { if (mission) setHints((prev) => ({ ...prev, [mission.id]: Math.min((prev[mission.id] || 0) + 1, 3) })); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!mission) return; setChecking(true);
    const pairs = await Promise.all(mission.fields.map(async (field) => [field.id, await validate(answers[field.id] || "", field.validation)] as const));
    const nextResults = Object.fromEntries(pairs); setResults(nextResults);
    const passed = mission.fields.filter((field) => !field.optional).every((field) => nextResults[field.id]);
    if (passed && !solved.includes(mission.id)) setSolved((prev) => [...prev, mission.id].sort());
    setChecking(false);
  }
  function next() { if (!mission) return; setResults({}); setAnswers({}); setView(mission.id === 3 ? 4 : mission.id + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function reset() { localStorage.removeItem(STORAGE_KEY); setSolved([]); setHints({}); setAnswers({}); setResults({}); setView(0); window.scrollTo({ top: 0, behavior: "smooth" }); }
  if (!hydrated) return <main className="loading-screen"><span>CASE FILE LOADING</span></main>;

  return <main><div className="shell"><CaseHeader active={view} />
    {view === 0 && <>
      <section className="hero hero-clean"><div className="hero-copy"><p className="eyebrow"><span>BEGINNER CASE 01</span> · 온체인 추적 입문</p><h1>온체인 추적<br /><em>실습 기초</em></h1><div className="hero-actions"><button className="primary-button" onClick={start}>{solved.length ? "문제 계속 풀기" : "문제 시작"}<span>→</span></button><span className="estimate">예상 소요 10–15분</span></div></div>
      </section>
      <section className="briefing-grid"><div className="briefing-main"><span className="section-number">01</span><div><p className="section-label">MISSION BRIEF</p><h2>실습 목표</h2><p>하나의 주소에서 발생한 세 가지 사건을 추적하며 온체인 추적 실습의 기초를 배웁니다. 각 활동을 CEX, DeFi, Bridge로 구분해 봅니다.</p></div></div><div className="rules"><p className="section-label">풀이 순서</p><ul><li><b>주소 확인</b><span>보낸 주소와 받은 주소의 라벨을 확인합니다.</span></li><li><b>토큰 확인</b><span>어떤 토큰이 나가고 들어왔는지 봅니다.</span></li><li><b>답안 제출</b><span>플랫폼 이름과 트랜잭션 해시를 정확히 입력합니다.</span></li></ul></div></section>
      <section className="progress-card"><div><p className="section-label">CASE PROGRESS</p><h2>{percent}% 조사 완료</h2></div><div className="progress-meter"><span style={{ width: `${percent}%` }} /></div><RouteRail solved={solved} active={0} /><div className="mission-list">{MISSIONS.map((item) => <button key={item.id} onClick={() => openMission(item.id)} disabled={item.id > solved.length + 1}><span>0{item.id}</span><div><b>{item.title}</b><small>{item.route}</small></div><i>{solved.includes(item.id) ? "해결" : item.id <= solved.length + 1 ? "열림" : "잠김"}</i></button>)}</div></section>
    </>}

    {mission && <section className="mission-page"><RouteRail solved={solved} active={mission.id} /><div className="mission-heading"><div><button className="back-button" onClick={() => setView(0)}>← 사건 개요</button><p className="eyebrow">EVIDENCE STEP 0{mission.id} · {mission.route}</p><h1>{mission.title}</h1><p>{mission.objective}</p></div><div className="difficulty"><span>난이도</span><b>{mission.difficulty}</b><small>{mission.time}</small></div></div><div className="date-alert"><b>추적 범위</b><span>모든 문제는 <strong>2026-08-17</strong> 기록을 기준으로 합니다.</span></div>
      <div className="workspace-grid"><div className="work-column">
        <section className="evidence-panel"><div className="panel-kicker"><span>주어진 단서</span><b>E-{mission.id.toString().padStart(3, "0")}</b></div><p>{mission.briefing}</p>{mission.clues.map((clue) => <div className="clue-row" key={clue.value}><div><span>{clue.label}</span><button className="hash-button" title={clue.value} onClick={() => navigator.clipboard.writeText(clue.value)}><code>{clue.value}</code></button></div><div className="clue-actions"><CopyButton value={clue.value} /><a href={clue.href} target="_blank" rel="noreferrer">{clue.network} 열기 ↗</a></div></div>)}</section>
        <form className="answer-sheet" onSubmit={submit}><div className="sheet-heading"><div><p className="section-label">ANSWER SHEET</p><h2>분석 기록</h2></div><span>{mission.fields.filter((f) => !f.optional).length}개 필수 항목</span></div><div className="field-list">{mission.fields.map((field) => { const status = results[field.id]; return <label className={`field ${status === true ? "correct" : status === false ? "wrong" : ""}`} key={field.id}><span className="field-number">{field.id}{field.optional && <small>선택</small>}</span><span className="field-body"><b>{field.label}</b><span className="input-wrap"><input value={answers[field.id] || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))} placeholder={field.placeholder} autoComplete="off" spellCheck={false} /><i>{status === true ? "✓" : status === false ? "×" : ""}</i></span>{status === false && <small className="feedback">다시 확인해 보세요. {field.tabHint}</small>}{status === true && <small className="feedback ok">근거가 확인되었습니다.</small>}</span></label>; })}</div><button className="submit-button" type="submit" disabled={checking}>{checking ? "기록 대조 중…" : "답안 확인"}<span>SHA-256 검증</span></button></form>
        {solved.includes(mission.id) && <><Explanation mission={mission} /><button className="next-button" onClick={next}>{mission.id === 3 ? "전체 자금 흐름 확인" : `다음 단계 · 0${mission.id + 1}`}<span>→</span></button></>}
      </div><aside className="hint-panel"><div className="hint-head"><div><p className="section-label">FIELD NOTES</p><h3>단계별 힌트</h3></div><span>{hints[mission.id] || 0}/3 사용</span></div><p>막히면 한 단계씩 열어 보세요. 정답 자체보다 어느 화면을 봐야 하는지 알려줍니다.</p><div className="hint-stack">{mission.hints.map((hint, index) => <div className={`hint-card ${index < (hints[mission.id] || 0) ? "revealed" : ""}`} key={hint}><span>HINT 0{index + 1}</span>{index < (hints[mission.id] || 0) ? <p>{hint}</p> : <div className="redacted"><i /><i /><i /></div>}</div>)}</div><button onClick={revealHint} disabled={(hints[mission.id] || 0) >= 3}>{(hints[mission.id] || 0) >= 3 ? "모든 힌트 사용" : "다음 힌트 개봉"}</button></aside></div>
    </section>}

    {view === 4 && <section className="completion"><div className="complete-hero"><p className="eyebrow">BEGINNER CASE · COMPLETE</p><h1>온체인 추적의<br /><em>첫 단계를 완료했습니다.</em></h1><p>하나의 주소에서 거래소 출금, 브릿지, DeFi 예치를 구분했습니다.</p><div className="score-row"><div><b>3/3</b><span>문제 해결</span></div><div><b>{totalHints}</b><span>힌트 사용</span></div><div><b>3건</b><span>트랜잭션 확인</span></div></div></div>
      <section className="flow-board"><div className="board-heading"><p className="section-label">BEGINNER TRACE SUMMARY</p><h2>확인한 온체인 활동</h2></div><div className="simple-flow"><div className="flow-node source"><span>STEP 01</span><b>{decode("QnliaXQ=")}</b><small>10 USDT 출금</small></div><div className="flow-arrow"><span>Ethereum</span></div><div className="flow-fork"><div className="fork-hub"><b>추적 주소</b><code>0x7f4980…43dAf42</code></div><div className="branch top"><span>STEP 02</span><b>{decode("QWNyb3Nz")}</b><small>USDC 브릿지</small></div><div className="branch bottom"><span>STEP 03</span><b>{decode("Rmx1aWQ=")}</b><small>USDT 예치 → {decode("ZlVTRFQ=")}</small></div></div></div><p className="residual-note">초급 과정의 핵심은 라벨, To/From 주소, Tokens Transferred를 정확히 읽는 것입니다.</p></section>
      <section className="lessons"><div><span>01</span><h3>엔티티 라벨</h3><p>From 주소의 라벨을 확인하면 거래소 출금 여부를 빠르게 알 수 있습니다.</p></div><div><span>02</span><h3>컨트랙트 라벨</h3><p>To 주소와 이벤트 이름을 보면 브릿지 플랫폼을 식별할 수 있습니다.</p></div><div><span>03</span><h3>토큰 이동</h3><p>나간 토큰과 들어온 토큰을 함께 보면 DeFi 예치 구조가 보입니다.</p></div></section><div className="complete-actions"><button className="primary-button" onClick={() => setView(1)}>문제 다시 보기</button><button className="text-button" onClick={reset}>진행 기록 초기화</button></div>
    </section>}
  </div><footer><span>TRANSIGHT · ONCHAIN FOUNDATIONS</span><span>교육용 시뮬레이션 · BEGINNER COURSE</span></footer></main>;
}

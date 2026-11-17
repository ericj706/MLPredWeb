import React, { useEffect, useRef, useState } from 'react';
import { predict } from './api';

const initial = { age: '', gender: 'M', heightCm: '', weightKg: '', systolic: '', diastolic: '', gripForce: '', sitAndBendForward: '', sitUpsCounts: '', broadJumpCm: '' };
const example = { age: 28, gender: 'M', heightCm: 175, weightKg: 72, systolic: 120, diastolic: 80, gripForce: 42, sitAndBendForward: 12, sitUpsCounts: 35, broadJumpCm: 210 };
const groups = [
  { title: '기본 신체 정보', number: '01', description: '현재의 나를 알려주세요.', fields: [['age','나이','세',19,100,'1','28'],['heightCm','키','cm',1,250,'0.1','175'],['weightKg','몸무게','kg',1,300,'0.1','72']] },
  { title: '혈압 정보', number: '02', description: '측정한 혈압을 입력해 주세요.', fields: [['systolic','수축기 혈압','mmHg',1,300,'1','120'],['diastolic','이완기 혈압','mmHg',1,250,'1','80']] },
  { title: '체력 정보', number: '03', description: '측정 단위를 확인해 주세요. 유연성은 음수도 입력할 수 있어요.', fields: [['gripForce','악력','kg',0,150,'0.1','42'],['sitAndBendForward','앉아윗몸앞으로굽히기','cm',-100,100,'0.1','12'],['sitUpsCounts','윗몸일으키기','회',0,300,'1','35'],['broadJumpCm','제자리멀리뛰기','cm',0,400,'0.1','210']] }
];
function Icon({type = 'pulse', ...props}) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{type === 'arrow' ? <path d="M5 12h14m-5-5 5 5-5 5"/> : type === 'check' ? <path d="m5 12 4 4L19 6"/> : <><path d="M3 12h5l3-8 4 16 3-8h3"/></>}</svg> }
export default function App() {
 const [form,setForm] = useState(initial);
 const [busy,setBusy] = useState(false);
 const [logs,setLogs] = useState([]);
 const [result,setResult] = useState(null);
 const [error,setError] = useState('');
 const abort = useRef(null);
 useEffect(() => () => abort.current?.abort(), []);
 const filled = Object.values(form).filter(v => v !== '').length;
 function update(key,value) { setForm(prev => ({...prev,[key]:value})); setResult(null); setError(''); setLogs([]); }
 async function submit(e) {
   e.preventDefault(); if (busy) return;
   setError(''); setResult(null); setLogs(['입력 정보를 서버에 전송하고 있습니다.']); setBusy(true);
   const controller = new AbortController(); abort.current = controller;
   try {
     const input = Object.fromEntries(Object.entries(form).map(([k,v]) => [k,k === 'gender' ? v : Number(v)]));
     await predict(input, (event,data) => {
       if (data.message) setLogs(prev => [...prev,data.message]);
       if (event === 'result' || data.status === 'SUCCESS') setResult(data);
     }, controller.signal);
   } catch (err) {
     if (!controller.signal.aborted) { setError(err.message || '서버 연결을 확인해 주세요.'); setResult(null); }
   } finally { if (!controller.signal.aborted) setBusy(false); }
 }
 return <>
  <header className="header"><a className="brand" href="#"><span className="brand-icon"><Icon/></span>bodyway<span className="brand-dot">.</span></a><span className="header-note">나를 이해하는 새로운 방법</span><span className="project-tag">ML PREDICTION LAB</span></header>
  <main>
   <section className="intro"><div><span className="eyebrow"><span/> BODY FAT ESTIMATION</span><h1>숫자 너머,<br/><span>내 몸을 이해하는 시간.</span></h1><p>신체와 체력 정보로 알아보는 나의 예상 체지방률.<br/>측정한 정보를 입력하면 예측 결과를 실시간으로 전해드려요.</p></div><div className="intro-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-core"><Icon/><span>KNOW YOUR BODY</span></div><span className="art-label label-top">BODY</span><span className="art-label label-bottom">BALANCE</span></div></section>
   <div className="workspace">
    <form className="form-card" onSubmit={submit}>
     <div className="card-heading"><div><span className="eyebrow">YOUR PROFILE</span><h2>나의 측정 정보</h2></div><button type="button" className="text-button" disabled={busy} onClick={() => {setForm(example);setResult(null);setLogs([]);setError('');}}>예시 입력 <span>↗</span></button></div>
     <fieldset disabled={busy}>
      {groups.map(group => <section className="form-section" key={group.number}><div className="section-heading"><span className="section-number">{group.number}</span><div><h3>{group.title}</h3><p>{group.description}</p></div></div>
       {group.number === '01' && <div className="gender-row"><span id="gender-label">성별</span><div className="segmented" role="group" aria-labelledby="gender-label">{[['M','남성'],['F','여성']].map(([v,label]) => <button type="button" aria-pressed={form.gender === v} className={form.gender === v ? 'selected' : ''} onClick={() => update('gender',v)} key={v}>{label}</button>)}</div></div>}
       <div className={`fields ${group.number === '01' ? 'three' : ''}`}>{group.fields.map(([key,label,unit,min,max,step,placeholder]) => <label className="field" key={key}><span>{label}</span><div className="input-wrap"><input required type="number" name={key} value={form[key]} min={min} max={max} step={step} placeholder={placeholder} onChange={e => update(key,e.target.value)} /><span>{unit}</span></div></label>)}</div>
      </section>)}
     </fieldset>
     <div className="form-footer"><span><span className="small-dot"/> {filled}/10 항목 입력 완료</span><button type="button" className="reset" disabled={busy} onClick={() => {setForm(initial);setLogs([]);setResult(null);setError('');}}>초기화</button></div>
     <button className="submit" disabled={busy} type="submit">{busy ? <><span className="spinner"/>예측 결과를 확인하고 있어요</> : <>체지방률 예측하기<Icon type="arrow"/></>}</button>
     <p className="form-hint">입력값은 이 화면의 예측 요청에 사용됩니다.</p>
    </form>
    <aside className="result-column">
     <section className={`result-card ${result ? 'has-result' : ''}`} aria-live="polite" aria-busy={busy}><div className="result-heading"><span className="eyebrow">YOUR INSIGHT</span><span className="live-tag"><span/> {busy ? '분석 중' : result ? '완료' : '대기 중'}</span></div>
      <h2>나의 예상 체지방률</h2>
      {result ? <><div className="result-number">{result.predictionResult.toFixed(1)}<span>%</span></div><p className="result-copy">입력하신 신체·체력 정보에 따른 예측 결과예요.</p><div className="metric"><span>모델 검증 성능 · R²</span><strong>{typeof result.evaluationMetric === 'number' ? result.evaluationMetric.toFixed(3) : '—'}</strong></div><p className="metric-note">R²는 검증 데이터에서 평가한 모델 전체 성능이며, 개인별 정확도를 의미하지 않아요.</p>{result.message && <div className="result-message">{result.message}</div>}</> : <div className="empty-state"><div className={`empty-icon ${busy ? 'pulsing' : ''}`}><Icon/></div><div className="empty-number">—<span> %</span></div><h3>{busy ? '나의 정보를 분석하고 있어요' : '나의 몸을 알아볼 준비가 되었나요?'}</h3><p>{busy ? '서버에서 전달하는 진행 상태를 확인해 주세요.' : '측정 정보를 입력하고 예측을 시작하면\n이곳에서 결과를 확인할 수 있어요.'}</p></div>}
      {error && <div className="error" role="alert">{error}<small>Spring 서버(8080)와 AI 서버의 실행 상태를 확인해 주세요.</small></div>}
      {logs.length > 0 && <div className="progress-log"><span className="log-title">실시간 진행 상태</span>{logs.map((log,i) => <div className="log" key={i}><span className={busy && i === logs.length-1 ? 'log-dot active' : 'log-dot'}>{busy && i === logs.length-1 ? '' : '✓'}</span><p>{log}</p></div>)}</div>}
     </section>
     <section className="guide"><span className="guide-icon">i</span><div><h3>결과는 이렇게 참고해 주세요</h3><p>체지방률은 키와 몸무게만으로 알기 어려운 신체 구성을 이해하는 데 도움을 줍니다. 이 서비스는 머신러닝 학습 프로젝트로, 예측값은 참고용이며 실제 측정을 대체하지 않습니다.</p></div></section>
     <div className="tech-note"><span>LIGHTGBM</span><span className="tech-line"/><span>실시간 예측 · SSE</span></div>
    </aside>
   </div>
   <footer><span className="footer-brand">bodyway.</span><span>내 몸을 알아가는 작은 시작.</span><span>Machine Learning Project</span></footer>
  </main>
 </>;
}
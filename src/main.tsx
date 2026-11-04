import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BookOpen, Check, ChevronRight, Code2, Download, FileQuestion, GitBranch, History, Moon, Play, Search, Sun, Upload, X } from 'lucide-react'
import { chapters, questions } from './data'
import { exportProgress, importProgress, loadProgress, saveProgress } from './lib/storage'
import { runCCode, type JudgeResult } from './lib/judge'
import type { Progress, Question } from './types'
import './styles.css'

type Route = 'dashboard' | 'courses' | 'bank' | 'practice'
const routeFromHash = (): { route: Route; questionId?: string } => {
  const [first, second] = window.location.hash.replace(/^#\/?/, '').split('/')
  if (first === 'practice' && second) return { route: 'practice', questionId: second }
  if (first === 'courses' || first === 'bank') return { route: first }
  return { route: 'dashboard' }
}

function App() {
  const [route, setRoute] = useState(routeFromHash)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(progress.theme === 'dark')
  useEffect(() => { const onHash = () => setRoute(routeFromHash()); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash) }, [])
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; const next: Progress = { ...progress, theme: dark ? 'dark' : 'light' }; if (progress.theme !== next.theme) { setProgress(next); saveProgress(next) } }, [dark])
  const update = (next: Progress) => { setProgress(next); saveProgress(next) }
  const open = (hash: string) => { window.location.hash = hash }
  const completedCount = progress.completed.length
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#/"><span className="brand-mark">C</span><span>C·Path</span><small>Learn C by Doing.</small></a>
      <nav className="topnav" aria-label="主导航">
        <a className={route.route === 'dashboard' ? 'active' : ''} href="#/">工作台</a>
        <a className={route.route === 'courses' ? 'active' : ''} href="#/courses">课程地图</a>
        <a className={route.route === 'bank' ? 'active' : ''} href="#/bank">题库</a>
      </nav>
      <div className="top-actions"><button className="icon-button" onClick={() => setDark(v => !v)} aria-label="切换主题">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><a className="icon-button" href="https://github.com/SiriZhao/c-path" target="_blank" rel="noreferrer" aria-label="GitHub"><GitBranch size={18}/></a></div>
    </header>
    <main className="page">
      {route.route === 'dashboard' && <Dashboard progress={progress} open={open} completedCount={completedCount} />}
      {route.route === 'courses' && <Courses progress={progress} open={open} update={update} />}
      {route.route === 'bank' && <Bank progress={progress} query={query} setQuery={setQuery} open={open} />}
      {route.route === 'practice' && <Practice id={route.questionId ?? questions[0]?.id} progress={progress} update={update} open={open} />}
    </main>
  </div>
}

function Dashboard({ progress, open, completedCount }: { progress: Progress; open: (h: string) => void; completedCount: number }) {
  const last = questions.find(q => q.id === progress.lastQuestion) ?? questions[0]
  const chapter = chapters.find(c => `chapter-${c.number}` === progress.currentChapter) ?? chapters[0]
  return <>
    <section className="hero-grid"><div><p className="eyebrow">C·PATH / LEARNING WORKSPACE</p><h1>把每一次编译，<em>变成理解。</em></h1><p className="hero-copy">沿着清晰的课程路径学习 C 语言，用真实题库练习，用自己的代码建立直觉。</p><div className="hero-actions"><button className="primary" onClick={() => open(`#/practice/${last.id}`)}><Play size={16}/>继续练习 <ChevronRight size={16}/></button><a className="secondary" href="#/courses">查看课程地图</a></div></div><div className="hero-note"><span className="status-dot"/>本地学习记录已开启<p>代码、进度和错题保存在当前浏览器，不需要注册账号。</p><div className="record-actions"><button className="text-button" onClick={() => { const blob = new Blob([exportProgress(progress)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'c-path-progress.json'; link.click(); URL.revokeObjectURL(link.href) }}><Download size={14}/>导出记录</button><label className="text-button"><Upload size={14}/>导入记录<input hidden type="file" accept="application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const next = importProgress(await file.text()); saveProgress(next); window.location.reload() } catch { window.alert('记录文件格式不正确') } }} /></label></div></div></section>
    <section className="stats-row"><div><strong>{completedCount}</strong><span>已完成题目</span></div><div><strong>{questions.length}</strong><span>已导入题目</span></div><div><strong>{chapter.number}</strong><span>当前章节</span></div><div><strong>{Object.keys(progress.code).length}</strong><span>保存过代码</span></div></section>
    <section className="dashboard-grid"><div className="panel next-panel"><div className="panel-heading"><div><p className="eyebrow">NEXT STEP</p><h2>从这里继续</h2></div><Code2 size={20}/></div><div className="next-card"><span className="chapter-pill">第 {chapter.number} 章 · {chapter.title}</span><h3>{last.title}</h3><p>{last.reviewStatus === 'reviewed' ? '已完成审核的练习' : '题面与测试待补录 · 适合先阅读源码并整理思路'}</p><button className="text-button" onClick={() => open(`#/practice/${last.id}`)}>打开练习 <ChevronRight size={16}/></button></div></div><div className="panel"><div className="panel-heading"><div><p className="eyebrow">MAP</p><h2>学习路径</h2></div><BookOpen size={20}/></div><div className="path-list">{chapters.slice(0, 5).map((c, i) => <button key={c.id} className="path-item" onClick={() => open('#/courses')}><span className={i === 0 ? 'path-index current' : 'path-index'}>{i + 1}</span><span><b>{c.title}</b><small>{c.topics.slice(0, 2).join(' · ')}</small></span><ChevronRight size={16}/></button>)}</div></div></section>
    <section className="panel activity"><div className="panel-heading"><div><p className="eyebrow">RECENT</p><h2>最近练习</h2></div><History size={20}/></div><div className="empty-state"><FileQuestion size={22}/><span>完成第一道题后，这里会记录你的练习轨迹。</span><button className="text-button" onClick={() => open('#/bank')}>去题库看看 <ChevronRight size={16}/></button></div></section>
  </>
}

function Courses({ progress, open, update }: { progress: Progress; open: (h: string) => void; update: (p: Progress) => void }) {
  return <><div className="page-intro"><p className="eyebrow">COURSE MAP</p><h1>从语法到程序思维</h1><p>课程章节按学习顺序组织。官方课程与本项目的学习导航并非同一套编号，题库映射以审计报告为准。</p></div><div className="course-grid">{chapters.map((c, i) => { const count = questions.filter(q => q.chapter === c.title).length; return <article className="course-card" key={c.id}><div className="course-number">{String(i + 1).padStart(2, '0')}</div><div><span className="muted">CHAPTER {c.number}</span><h2>{c.title}</h2><p>{c.topics.join(' · ')}</p><div className="course-meta"><span>{count} 道题库练习</span><button className="text-button" onClick={() => { update({ ...progress, currentChapter: c.id }); open('#/bank') }}>浏览练习 <ChevronRight size={14}/></button></div></div></article> })}</div></>
}

function Bank({ progress, query, setQuery, open }: { progress: Progress; query: string; setQuery: (v: string) => void; open: (h: string) => void }) {
  const [chapter, setChapter] = useState('全部章节'); const [status, setStatus] = useState('全部状态')
  const filtered = useMemo(() => questions.filter(q => (!query || `${q.title} ${q.id} ${q.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase())) && (chapter === '全部章节' || q.chapter === chapter) && (status === '全部状态' || (status === '已完成' ? progress.completed.includes(q.id) : !progress.completed.includes(q.id)))), [query, chapter, status, progress.completed])
  return <><div className="page-intro compact"><p className="eyebrow">QUESTION BANK / {questions.length} ITEMS</p><h1>把知识点变成手感</h1><p>当前导入的是本地 C_PAT 仓库的 38 个源文件。题面与测试数据缺失的题目会明确标注，避免把未验证内容当成可判题题目。</p></div><div className="filters"><label className="search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索题号、标题或知识点" /></label><select value={chapter} onChange={e => setChapter(e.target.value)}><option>全部章节</option>{chapters.map(c => <option key={c.id}>{c.title}</option>)}</select><select value={status} onChange={e => setStatus(e.target.value)}><option>全部状态</option><option>未完成</option><option>已完成</option></select></div><div className="bank-list">{filtered.map(q => <QuestionRow key={q.id} q={q} done={progress.completed.includes(q.id)} open={open} />)}{filtered.length === 0 && <div className="empty-state large"><Search size={24}/><span>没有匹配的题目</span><button className="text-button" onClick={() => setQuery('')}>清除搜索</button></div>}</div></>
}

function QuestionRow({ q, done, open }: { q: Question; done: boolean; open: (h: string) => void }) { return <article className="question-row"><div className={done ? 'check complete' : 'check'}>{done ? <Check size={15}/> : q.id.replace('pat-', '').toUpperCase()}</div><div className="question-main"><div className="question-title"><h2>{q.title}</h2><span className="source-tag">本地源代码</span></div><p><span>{q.id.replace('pat-', '').toUpperCase()}</span><span>第 {q.chapter}</span>{q.topics.slice(0, 3).map(t => <span key={t}>{t}</span>)}</p></div><div className="question-state">{q.reviewStatus !== 'reviewed' && <span className="review-tag">待补录题面</span>}<button className="icon-button" onClick={() => open(`#/practice/${q.id}`)} aria-label={`打开 ${q.title}`}><ChevronRight size={18}/></button></div></article> }

function Practice({ id, progress, update, open }: { id: string; progress: Progress; update: (p: Progress) => void; open: (h: string) => void }) {
  const q = questions.find(item => item.id === id) ?? questions[0]; const [code, setCode] = useState(progress.code[q.id] ?? q.starterCode); const [input, setInput] = useState(''); const [result, setResult] = useState<JudgeResult | null>(null); const [hint, setHint] = useState(0)
  useEffect(() => { setCode(progress.code[q.id] ?? q.starterCode); setResult(null); setHint(0) }, [q.id])
  const saveCode = (value: string) => { setCode(value); update({ ...progress, code: { ...progress.code, [q.id]: value }, lastQuestion: q.id, attempts: { ...progress.attempts, [q.id]: (progress.attempts[q.id] ?? 0) + 1 } }) }
  const run = async () => setResult(await runCCode(code, input))
  const markDone = () => update({ ...progress, completed: Array.from(new Set([...progress.completed, q.id])), lastQuestion: q.id })
  return <div className="practice-shell"><div className="practice-top"><button className="back-link" onClick={() => open('#/bank')}>← 返回题库</button><span className="practice-id">{q.id.replace('pat-', '').toUpperCase()}</span><span className="review-tag">{q.reviewStatus === 'reviewed' ? '已审核' : '来源已导入 · 待审核'}</span><span className="save-state">自动保存</span></div><div className="practice-grid"><aside className="problem-pane"><p className="eyebrow">PROBLEM / {q.chapter}</p><h1>{q.title}</h1><div className="tag-list">{q.topics.map(t => <span key={t}>{t}</span>)}</div><div className="notice"><strong>题面状态</strong><p>本地仓库只提供标题与 C 源代码，未提供可复核的题面、样例和测试数据。这里保留来源和代码，等待人工补录后再启用判题。</p><small>来源：{q.provenance.path}</small></div><section className="problem-section"><h2>学习建议</h2><ol><li>先用自己的话写出输入、处理和输出。</li><li>在纸上跟踪一个最小边界样例。</li><li>再把步骤拆成变量、循环和函数。</li></ol></section><section className="problem-section"><h2>渐进提示</h2><div className="hint-tabs"><button className={hint === 0 ? 'selected' : ''} onClick={() => setHint(0)}>方向</button><button className={hint === 1 ? 'selected' : ''} onClick={() => setHint(1)}>思路</button><button className={hint === 2 ? 'selected' : ''} onClick={() => setHint(2)}>实现</button></div><p className="hint-content">{['先确认题目要处理的数据形状，再选择对应的 C 语言结构。当前题面缺失，避免根据标题臆造答案。','把问题拆成输入读取、核心计算、格式化输出三个阶段，逐段验证变量变化。','先写伪代码和最小版本；参考源代码来自本地仓库，尚未完成独立测试复核。'][hint]}</p></section></aside><section className="editor-pane"><div className="editor-toolbar"><div><span className="editor-label">main.c</span><span className="muted">C11 · 本地草稿</span></div><button className="secondary small" onClick={() => saveCode(q.starterCode)}><X size={14}/>恢复初始代码</button></div><div className="editor-wrap"><div className="line-numbers">{code.split('\n').map((_, i) => <span key={i}>{i + 1}</span>)}</div><textarea spellCheck={false} value={code} onChange={e => saveCode(e.target.value)} aria-label="C 代码编辑器" /></div><div className="run-panel"><div className="run-actions"><button className="primary" onClick={run}><Play size={15}/>运行</button><button className="secondary" onClick={markDone}><Check size={15}/>标记已完成</button><span className="muted">{progress.attempts[q.id] ?? 0} 次编辑保存</span></div><label className="input-label">自定义输入<textarea value={input} onChange={e => setInput(e.target.value)} placeholder="题面和测试数据补录后，可在这里输入公开样例" /></label>{result && <div className="result-box"><div className="result-title"><span className="result-status">{result.status}</span><strong>{result.message}</strong></div><p>{result.detail}</p></div>}</div></section></div></div>
}

function AppRoot() { return <App /> }
createRoot(document.getElementById('root')!).render(<StrictMode><AppRoot /></StrictMode>)

import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { buildPartsPlan, databaseStats, getLocalStores } from './data/partsDatabase';

function RobotBlueprint() {
  return (
    <div className="blueprint" aria-label="Blueprint of a dog-shaped robot on wheels">
      <span className="measure measure-top">PROJECT → PARTS</span>
      <div className="robot-head"><span /><i /></div><div className="robot-ear" /><div className="robot-neck" />
      <div className="robot-body"><b>RMS–01</b><span className="circuit-line line-one" /><span className="circuit-line line-two" /><i className="board-chip">CPU</i></div>
      <div className="robot-tail" /><div className="wheel wheel-left"><span /></div><div className="wheel wheel-right"><span /></div>
      <span className="measure measure-bottom">UNDERSTAND BEFORE YOU BUILD</span>
    </div>
  );
}

function InputField({ label, hint, children }) {
  return <label className="field"><span>{label}</span>{children}<small>{hint}</small></label>;
}

function PartMetaphor({ part }) {
  let type = 'building-block';
  let label = 'Support part = building block';

  if (part.category === 'Sensors') {
    type = 'eyes'; label = 'Sensor = eyes';
  } else if (part.category === 'Controllers' || /arduino/i.test(part.part_name)) {
    type = 'brain'; label = 'Arduino = brain';
  } else if (part.category === 'Motor Drivers') {
    type = 'power-manager'; label = 'Motor driver = power manager';
  } else if (part.category === 'Motors & Motion') {
    type = 'muscles'; label = 'Motors = muscles';
  } else if (part.category === 'Power' || /battery/i.test(part.part_name)) {
    type = 'energy'; label = 'Battery = energy';
  }

  return (
    <div className="part-metaphor">
      <span className="part-metaphor-icon">
        <svg viewBox="0 0 48 48" role="img" aria-label={`${label} metaphor`}>
          {type === 'eyes' ? <><ellipse cx="15" cy="24" rx="9" ry="7" /><ellipse cx="33" cy="24" rx="9" ry="7" /><circle cx="15" cy="24" r="3" /><circle cx="33" cy="24" r="3" /></> : null}
          {type === 'brain' ? <><path d="M19 38c-5 0-8-4-7-8-4-2-4-8 0-10-2-5 3-9 7-7 2-5 9-4 10 0 5-2 10 3 8 8 4 3 3 9-1 11 1 5-4 9-9 7-2 4-8 3-9-1Z" /><path d="M24 13v25M17 20c4 0 6 2 7 5M31 20c-4 0-6 2-7 5" /></> : null}
          {type === 'power-manager' ? <><rect x="10" y="12" width="28" height="24" rx="2" /><path d="M4 19h6M4 29h6M38 19h6M38 29h6M18 24h12M27 20l4 4-4 4" /></> : null}
          {type === 'muscles' ? <><path d="M9 31c6 8 20 9 28 2 5-5 2-13-4-14-4-1-7 2-8 6-3-3-5-8-5-13h-8c0 8-2 13-3 19Z" /><path d="M20 12c2-3 5-4 8-2" /></> : null}
          {type === 'energy' ? <><rect x="9" y="14" width="28" height="22" rx="2" /><path d="M37 21h4v8h-4M16 25h7M19.5 21.5v7M27 25h5" /></> : null}
          {type === 'building-block' ? <><rect x="10" y="13" width="28" height="24" rx="2" /><circle cx="17" cy="20" r="2" /><circle cx="31" cy="20" r="2" /><circle cx="17" cy="30" r="2" /><circle cx="31" cy="30" r="2" /><path d="M19 20h10M19 30h10" /></> : null}
        </svg>
      </span>
      <span className="part-metaphor-copy"><small>Think of it as</small><strong>{label.replace(/^.* = /, '')}</strong></span>
    </div>
  );
}

function App() {
  const [brief, setBrief] = useState({ project: '', behaviors: '', country: '', budget: '' });
  const [submitted, setSubmitted] = useState(null);
  const [choices, setChoices] = useState({});
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const plan = useMemo(() => submitted ? buildPartsPlan(submitted) : null, [submitted]);
  const parts = plan?.parts ?? [];
  const localStores = submitted ? getLocalStores(submitted.country) : [];
  const neededParts = parts.filter((part) => choices[part.part_id] === 'need');
  const allPartsNeeded = parts.length > 0 && parts.every((part) => choices[part.part_id] === 'need');

  function updateBrief(event) {
    setBrief((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  function useExample() {
    setBrief({ project: 'Dog-shaped robot with hidden wheels', behaviors: 'Hear “left” or “right” and move a short distance in that direction', country: 'India', budget: '₹3,000–₹5,000' });
    setError('');
  }

  function createPlan(event) {
    event.preventDefault();
    if (Object.values(brief).some((value) => !value.trim())) {
      setError('Complete all four answers before creating the parts plan.');
      return;
    }
    setSubmitted({ ...brief }); setChoices({}); setFeedback('');
    requestAnimationFrame(() => document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth' }));
  }

  function editBrief() {
    setSubmitted(null); setChoices({}); setFeedback('');
    requestAnimationFrame(() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }));
  }

  function markAllPartsNeeded() {
    setChoices(Object.fromEntries(parts.map((part) => [part.part_id, 'need'])));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Robotics, Made Simple home"><span className="brand-mark" aria-hidden="true">R</span><span>Robotics, Made Simple</span></a>
        <span className="v1-tag">V1 · animal-like robots</span>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="kicker">FROM IDEA TO THE RIGHT STARTING PARTS</p>
            <h1 id="hero-title">Know what your robot needs—and <em>why.</em></h1>
            <p className="hero-text">For parents and grade 6–8 builders who have chosen a project but are stuck between technical stores, mismatched videos, and confusing parts.</p>
            <a className="primary-link" href="#planner">Make a parts plan <span aria-hidden="true">↓</span></a>
            <div className="proof-row"><span>{databaseStats.parts} catalogued parts</span><span>{databaseStats.categories} categories</span><span>No login</span></div>
          </div>
          <RobotBlueprint />
        </section>

        <section className="planner" id="planner">
          <div className="section-intro">
            <p className="step-label">01 / Tell us the finished idea</p><h2>Four answers before any parts.</h2>
            <p>The behavior, country, and budget change what belongs in the plan. We ask first so the list has a reason.</p>
          </div>
          <form className="project-form" onSubmit={createPlan} noValidate>
            <div className="form-head"><span>PROJECT BRIEF</span><button type="button" className="example-button" onClick={useExample}>Use dog robot example</button></div>
            <InputField label="What animal-like robot has been finalised?" hint="Example: A dog-shaped robot with hidden wheels"><input name="project" value={brief.project} onChange={updateBrief} placeholder="Describe the robot" autoComplete="off" /></InputField>
            <InputField label="What should it do?" hint="Use clear actions, such as hear ‘left’ and turn left"><textarea name="behaviors" value={brief.behaviors} onChange={updateBrief} placeholder="List the intended behaviours" rows="3" /></InputField>
            <div className="field-pair">
              <InputField label="Where will you buy parts?" hint="Country, not a store"><input name="country" value={brief.country} onChange={updateBrief} placeholder="India" autoComplete="country-name" /></InputField>
              <InputField label="What is the budget range?" hint="Use your local currency"><input name="budget" value={brief.budget} onChange={updateBrief} placeholder="₹3,000–₹5,000" /></InputField>
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="submit-button" type="submit">Create my parts plan <span aria-hidden="true">→</span></button>
            <p className="form-note">No parts appear until all four answers are complete.</p>
          </form>
        </section>

        {submitted ? (
          <section className="plan" id="plan" aria-live="polite">
            <div className="plan-header"><div><p className="step-label">02 / Understand the starting parts</p><h2>Your starting plan</h2></div><button type="button" className="edit-button" onClick={editBrief}>Edit project</button></div>
            <div className="brief-strip">
              <div><span>PROJECT</span><strong>{submitted.project}</strong></div><div><span>BEHAVIOUR</span><strong>{submitted.behaviors}</strong></div><div><span>PLACE / BUDGET</span><strong>{submitted.country} · {submitted.budget}</strong></div>
            </div>
            <div className="disclosure" role="note"><b>Database-guided demo—not live AI, live prices, or verified buying advice.</b><span>Check specifications with an adult before buying, connecting, or powering hardware.</span></div>
            {plan.notes.length || plan.gaps.length ? (
              <div className="plan-notes">
                {plan.notes.map((note) => <p key={note}><strong>Plan note</strong>{note}</p>)}
                {plan.gaps.map((gap) => <p className="catalogue-gap" key={gap}><strong>Catalogue gap</strong>{gap}</p>)}
              </div>
            ) : null}
            <div className="parts-toolbar">
              <div><strong>{parts.length}</strong><span>starting parts</span></div>
              <p>Mark every item so your “Need” list is useful.</p>
              <div className="parts-actions">
                <button type="button" onClick={markAllPartsNeeded} disabled={allPartsNeeded}>{allPartsNeeded ? 'All parts marked as needed' : 'I need all parts'}</button>
                <span className="progress-count">{Object.keys(choices).length}/{parts.length} marked</span>
              </div>
            </div>
            <div className="parts-list">
              {parts.map((part, index) => (
                <article className="part-card" key={part.part_id}>
                  <div className="part-index">{String(index + 1).padStart(2, '0')}</div><div className="part-icon" aria-hidden="true">{part.category.slice(0, 1)}</div>
                  <div className="part-copy">
                    <span className="part-group">{part.category} · Qty {part.usual_qty}</span><h3>{part.part_name}</h3>
                    <p><strong>{part.kid_friendly_name}.</strong> {part.what_it_does}.</p>
                    <PartMetaphor part={part} />
                    <div className="part-facts"><span>{part.skill_level}</span><span>{part.voltage}</span><span>{part.compatible_with}</span></div>
                    <details><summary>What to check before buying</summary><p><b>Common mistake:</b> {part.common_mistake}. <b>Safety:</b> {part.safety_note}.</p></details>
                    {part.priceLead ? <p className="price-lead">Price lead: ₹{part.priceLead.price_inr} from {part.priceLead.seller}, checked {part.priceLead.checked_date}. Not a live price or direct product link.</p> : null}
                    <div className="buy-searches">{part.searchLinks.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.label}>{link.label} <span aria-hidden="true">↗</span></a>)}</div>
                  </div>
                  <fieldset className="ownership"><legend>Do you own this?</legend>{[['have', 'Already have'], ['need', 'Need']].map(([value, label]) => <label className={choices[part.part_id] === value ? 'selected' : ''} key={value}><input type="radio" name={`choice-${part.part_id}`} checked={choices[part.part_id] === value} onChange={() => setChoices((current) => ({ ...current, [part.part_id]: value }))} />{label}</label>)}</fieldset>
                </article>
              ))}
            </div>
            <section className="summary-card" aria-labelledby="summary-title">
              <div><p className="step-label">03 / Take the next step</p><h2 id="summary-title">Your “Need” list</h2>{neededParts.length ? <ul>{neededParts.map((part) => <li key={part.part_id}>{part.usual_qty} × {part.part_name}</li>)}</ul> : <p className="empty-summary">Mark parts above as “Need” and they will appear here.</p>}</div>
              <div className="first-stage"><span>FIRST BUILD STAGE</span><strong>Make the wheels move safely</strong><p>Before adding sensors or voice, connect the controller, motor driver, motors, and low-voltage power with an adult.</p></div>
            </section>
            {localStores.length ? (
              <section className="store-section" aria-labelledby="stores-title">
                <div><span className="part-group">Local search leads</span><h2 id="stores-title">Bengaluru stores in the database</h2><p>These are store leads, not stock confirmations. Call before travelling.</p></div>
                <div className="store-grid">{localStores.map((store) => <a href={store.maps_search_url} target="_blank" rel="noreferrer" key={store.store_id}><strong>{store.store_name}</strong><span>{store.category}</span><small>Rating recorded: {store.rating} · checked {store.checked_date}</small></a>)}</div>
              </section>
            ) : null}
            <section className="feedback-card" aria-labelledby="feedback-title">
              <div><span className="part-group">One last check</span><h2 id="feedback-title">Did this plan help you understand what you need?</h2></div>
              <div className="feedback-actions"><button type="button" className={feedback === 'useful' ? 'active' : ''} onClick={() => setFeedback('useful')}>Yes, useful</button><button type="button" className={feedback === 'needs-work' ? 'active' : ''} onClick={() => setFeedback('needs-work')}>Needs work</button></div>
              {feedback ? <p className="feedback-confirmation" role="status">Recorded for this demo: {feedback === 'useful' ? 'useful' : 'needs work'}.</p> : null}
            </section>
          </section>
        ) : null}
      </main>
      <footer><span>Robotics, Made Simple</span><p>Understand the parts. Build with an adult.</p><span>Build Week · V1</span></footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

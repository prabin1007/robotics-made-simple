import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import './styles.css';
import { buildPartsPlan, databaseStats, getLocalStores, isBengaluruLocation } from './data/partsDatabase';

const DEFAULT_BRIEF = { project: '', behaviors: '', country: 'Bangalore, India', budget: '' };
const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function parseBudgetRange(value) {
  const amounts = (value.match(/\d[\d,]*(?:\.\d+)?\s*[kK]?/g) ?? [])
    .map((amount) => {
      const usesThousands = /k/i.test(amount);
      const number = Number(amount.replaceAll(',', '').replace(/k/i, '').trim());
      return usesThousands ? number * 1000 : number;
    })
    .filter(Number.isFinite);
  if (!amounts.length) return null;
  return amounts.length === 1 ? { min: 0, max: amounts[0] } : { min: Math.min(...amounts), max: Math.max(...amounts) };
}

function totalSelectedPrices(selectedParts) {
  return selectedParts.reduce((total, part) => {
    const estimate = part.priceEstimate;
    if (!estimate || !Number.isFinite(estimate.typical)) return { ...total, missing: total.missing + 1 };
    return {
      min: total.min + estimate.min,
      typical: total.typical + estimate.typical,
      max: total.max + estimate.max,
      priced: total.priced + 1,
      missing: total.missing,
    };
  }, { min: 0, typical: 0, max: 0, priced: 0, missing: 0 });
}

function compareWithBudget(estimate, budgetText) {
  const budget = parseBudgetRange(budgetText);
  if (!budget) return { state: 'unknown', text: 'Budget format could not be compared. Use a number or range, such as ₹3,000–₹5,000.' };
  if (estimate > budget.max) return { state: 'over', text: `About ₹${inr.format(estimate - budget.max)} above your budget limit.` };
  if (budget.min > 0 && estimate < budget.min) return { state: 'under', text: `About ₹${inr.format(budget.min - estimate)} below the lower end of your budget.` };
  return { state: 'within', text: 'The planning estimate is within your stated budget.' };
}

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

function PartTutorial({ part }) {
  if (!part.tutorial) return null;

  return (
    <details className="part-tutorial">
      <summary>
        <span>How this part works</span>
        <small>5-step visual guide</small>
      </summary>
      <figure>
        <img
          src={part.tutorial.file}
          alt={`Five-step visual explanation of how ${part.tutorial.title} works`}
          width="1600"
          height="1040"
          loading="lazy"
          decoding="async"
        />
        <figcaption>
          <span>Read from left to right, then check “Remember” and “Watch out”.</span>
          <a href={part.tutorial.file} target="_blank" rel="noreferrer">Open full-size guide <span aria-hidden="true">↗</span></a>
        </figcaption>
      </figure>
    </details>
  );
}

function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return isMobile;
}

function OwnershipChoices({ part, value, onChange, className = '' }) {
  return <fieldset className={`ownership ${className}`.trim()}><legend>Do you own this?</legend>{[['have', 'Already have'], ['need', 'Need']].map(([choice, label]) => <label className={value === choice ? 'selected' : ''} key={choice}><input type="radio" name={`choice-${part.part_id}`} checked={value === choice} onChange={() => onChange(choice)} />{label}</label>)}</fieldset>;
}

function PartDetails({ part }) {
  return <><p><strong>{part.kid_friendly_name}.</strong> {part.what_it_does}.</p>{part.recipeReason ? <p className="recipe-reason"><strong>Why this recipe needs it:</strong> {part.recipeReason}.</p> : null}<PartMetaphor part={part} /><PartTutorial part={part} /><div className="part-facts"><span>{part.skill_level}</span><span>{part.voltage}</span><span>{part.compatible_with}</span></div><div className="part-price-estimate"><strong>Planning estimate: ₹{inr.format(part.priceEstimate.typical)}</strong><span>Range ₹{inr.format(part.priceEstimate.min)}–₹{inr.format(part.priceEstimate.max)} · {part.priceEstimate.confidence} confidence · dated {part.priceEstimate.asOf}</span></div><details><summary>What to check before buying</summary><p><b>Common mistake:</b> {part.common_mistake}. <b>Safety:</b> {part.safety_note}.</p></details>{part.priceLead ? <p className="price-lead">Price lead: ₹{part.priceLead.price_inr} from {part.priceLead.seller}, checked {part.priceLead.checked_date}. Not a live price or direct product link.</p> : null}<div className="buy-searches">{part.searchLinks.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.label}>{link.label} <span aria-hidden="true">↗</span></a>)}</div></>;
}

function FirstBuildStage({ className = '' }) {
  return <div className={`first-stage ${className}`.trim()}><span>FIRST BUILD STAGE</span><strong>Make the wheels move safely</strong><p>Before adding sensors or voice, connect the controller, motor driver, motors, and low-voltage power with an adult.</p></div>;
}

function App() {
  const [brief, setBrief] = useState({ ...DEFAULT_BRIEF });
  const [submitted, setSubmitted] = useState(null);
  const [choices, setChoices] = useState({});
  const [feedback, setFeedback] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [feedbackError, setFeedbackError] = useState('');
  const submitFeedback = useMutation(api.feedback.submit);
  const [error, setError] = useState('');
  const isMobile = useMobileLayout();
  const plan = useMemo(() => submitted ? buildPartsPlan(submitted) : null, [submitted]);
  const parts = plan?.parts ?? [];
  const localStores = submitted ? getLocalStores(submitted.country) : [];
  const neededParts = parts.filter((part) => choices[part.part_id] === 'need');
  const selectedPriceTotal = useMemo(() => totalSelectedPrices(neededParts), [neededParts]);
  const fullPlanPriceTotal = useMemo(() => totalSelectedPrices(parts), [parts]);
  const budgetComparison = submitted && neededParts.length ? compareWithBudget(selectedPriceTotal.typical, submitted.budget) : null;
  const allPartsNeeded = parts.length > 0 && parts.every((part) => choices[part.part_id] === 'need');
  const allPartsMarked = parts.length > 0 && parts.every((part) => Boolean(choices[part.part_id]));
  const showLocationNotice = brief.country.trim() && !isBengaluruLocation(brief.country);

  function updateBrief(event) {
    setBrief((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  function useExample() {
    setBrief({ project: 'Dog-shaped robot with hidden wheels', behaviors: 'Hear “left” or “right” and move a short distance in that direction', country: 'Bangalore, India', budget: '₹3,000–₹5,000' });
    setError('');
  }

  function resetBrief() {
    setBrief({ ...DEFAULT_BRIEF });
    setSubmitted(null);
    setChoices({});
    setFeedback('');
    setFeedbackComment('');
    setFeedbackStatus('idle');
    setFeedbackError('');
    setError('');
  }

  function startNewPlan() {
    resetBrief();
    requestAnimationFrame(() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function createPlan(event) {
    event.preventDefault();
    if (Object.values(brief).some((value) => !value.trim())) {
      setError('Complete all four answers before creating the parts plan.');
      return;
    }
    setSubmitted({ ...brief }); setChoices({}); setFeedback(''); setFeedbackComment(''); setFeedbackStatus('idle'); setFeedbackError('');
    requestAnimationFrame(() => document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth' }));
  }

  function editBrief() {
    setSubmitted(null); setChoices({}); setFeedback(''); setFeedbackComment(''); setFeedbackStatus('idle'); setFeedbackError('');
    requestAnimationFrame(() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }));
  }

  function markAllPartsNeeded() {
    setChoices(Object.fromEntries(parts.map((part) => [part.part_id, 'need'])));
  }

  function chooseFeedback(value) {
    setFeedback(value);
    setFeedbackStatus('idle');
    setFeedbackError('');
  }

  async function saveFeedback(event) {
    event.preventDefault();
    if (!feedback || !submitted || !plan) return;
    setFeedbackStatus('saving');
    setFeedbackError('');
    try {
      await submitFeedback({
        rating: feedback,
        comment: feedbackComment.trim() || undefined,
        project: submitted.project,
        behaviors: submitted.behaviors,
        location: submitted.country,
        budget: submitted.budget,
        recipeId: plan.recipe.id,
        matchType: plan.matchType,
        neededPartsCount: neededParts.length,
      });
      setFeedbackStatus('saved');
    } catch {
      setFeedbackStatus('error');
      setFeedbackError('Your feedback was not saved. Please check your connection and try again.');
    }
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
            <div className="form-head"><span>PROJECT BRIEF</span><div className="form-head-actions"><button type="button" className="reset-button" onClick={resetBrief}>Reset</button><button type="button" className="example-button" onClick={useExample}>Use dog robot example</button></div></div>
            <InputField label="What animal-like robot has been finalised?" hint="Example: A dog-shaped robot with hidden wheels"><input name="project" value={brief.project} onChange={updateBrief} placeholder="Describe the robot" autoComplete="off" /></InputField>
            <InputField label="What should it do?" hint="Use clear actions, such as hear ‘left’ and turn left"><textarea name="behaviors" value={brief.behaviors} onChange={updateBrief} placeholder="List the intended behaviours" rows="3" /></InputField>
            <div className="field-pair">
              <InputField label="Where will you buy parts?" hint="City and country. Local store details currently cover Bangalore only."><input name="country" value={brief.country} onChange={updateBrief} placeholder="Bangalore, India" autoComplete="address-level2" />{showLocationNotice ? <small className="location-notice" role="note">We are still developing local-store coverage for other cities. Your parts plan will still be created.</small> : null}</InputField>
              <InputField label="What is the budget range?" hint="Use your local currency"><input name="budget" value={brief.budget} onChange={updateBrief} placeholder="₹3,000–₹5,000" /></InputField>
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="submit-button" type="submit">Create my parts plan <span aria-hidden="true">→</span></button>
            <p className="form-note">No parts appear until all four answers are complete.</p>
          </form>
        </section>

        {submitted ? (
          <section className="plan" id="plan" aria-live="polite">
            <div className="plan-header"><div><p className="step-label">02 / Understand the starting parts</p><h2>{plan.isPartial ? 'Your partial starting plan' : 'Your starting plan'}</h2></div><button type="button" className="edit-button" onClick={editBrief}>Edit project</button></div>
            <div className="brief-strip">
              <div><span>PROJECT</span><strong>{submitted.project}</strong></div><div><span>BEHAVIOUR</span><strong>{submitted.behaviors}</strong></div><div><span>PLACE / BUDGET</span><strong>{submitted.country} · {submitted.budget}</strong></div>
            </div>
            <section className={`recipe-match recipe-${plan.matchType}`} aria-label="Dog recipe match result">
              <div>
                <span>{plan.matchType === 'exact' ? 'Exact recipe match' : plan.matchType === 'partial' ? 'Partial recipe match' : 'No dog recipe match'}</span>
                <h3>{plan.matchType === 'exact' ? 'We found a matching build guide for your requirement.' : plan.matchType === 'partial' ? 'We found a build guide that covers part of your requirement.' : 'We do not have a matching build guide yet.'}</h3>
                <p>{plan.matchType === 'exact' ? plan.recipe.supportedOutcome : plan.matchType === 'partial' ? 'The fixed dog BOM covers only the recipe outcome below. Requested differences must be checked before buying.' : 'This request is outside the one recipe available in V1, so no parts list is shown.'}</p>
              </div>
            </section>
            <div className="disclosure" role="note"><b>Database-guided demo—not live AI, live prices, or verified buying advice.</b><span>Check specifications with an adult before buying, connecting, or powering hardware.</span></div>
            {plan.isPartial ? (
              <section className="partial-plan" role="alert" aria-labelledby="partial-plan-title">
                <div className="partial-plan-marker" aria-hidden="true">!</div>
                <div>
                  <span>PARTIAL PLAN · STOP BEFORE BUYING</span>
                  <h3 id="partial-plan-title">Some requirements are not covered yet.</h3>
                  <p>The parts below cover the supported starting build only. Do not buy parts for the unmatched requirements until they have been checked.</p>
                  {plan.unsupportedRequirements.length ? (
                    <div className="unmatched-requirements">
                      <strong>We could not match:</strong>
                      <ul>{plan.unsupportedRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
                    </div>
                  ) : null}
                  {plan.gaps.length ? (
                    <div className="unmatched-requirements">
                      <strong>Missing from this catalogue:</strong>
                      <ul>{plan.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
            {plan.notes.length ? <aside className="plan-notes" aria-label="Before you start"><strong>Before you start</strong><ul>{plan.notes.map((note) => <li key={note}>{note}</li>)}</ul></aside> : null}
            {isMobile && parts.length ? (
              <section className="mobile-parts-overview" aria-labelledby="mobile-parts-title">
                <header><div><span>PARTS AT A GLANCE</span><h3 id="mobile-parts-title">Your starting parts</h3></div><strong>₹{inr.format(fullPlanPriceTotal.typical)}<small>listed estimate</small></strong></header>
                <div className="mobile-parts-table">{parts.map((part, index) => <article className="mobile-part-row" id={`part-${part.part_id}`} key={part.part_id}><span className="mobile-row-index">{String(index + 1).padStart(2, '0')}</span><div className="mobile-row-name"><strong>{part.part_name}</strong><small>{part.recipeRole}</small></div><span className="mobile-row-qty">Qty {part.usual_qty}</span><span className="mobile-row-price">₹{inr.format(part.priceEstimate.typical)}</span><OwnershipChoices part={part} value={choices[part.part_id]} onChange={(value) => setChoices((current) => ({ ...current, [part.part_id]: value }))} className="mobile-ownership" /><details className="mobile-part-details"><summary>Why this part</summary><div className="mobile-part-details-body"><PartDetails part={part} /></div></details></article>)}</div>
                <FirstBuildStage className="mobile-first-stage" />
              </section>
            ) : null}
            <div className="parts-toolbar" id="parts-start">
              <div><strong>{parts.length}</strong><span>{plan.isPartial ? 'parts for the supported start' : 'starting parts'}</span></div>
              <p>Mark every item so your “Need” list is useful.</p>
              <div className="parts-actions">
                <a href="#need-summary">View Need list <span aria-hidden="true">↓</span></a>
                <button type="button" onClick={markAllPartsNeeded} disabled={allPartsNeeded}>{allPartsNeeded ? 'All parts marked as needed' : 'I need all parts'}</button>
                <span className="progress-count">{Object.keys(choices).length}/{parts.length} marked</span>
              </div>
            </div>
            {!isMobile ? <div className="parts-list">
              {parts.map((part, index) => (
                <article className="part-card" id={`part-${part.part_id}`} key={part.part_id}>
                  <div className="part-index">{String(index + 1).padStart(2, '0')}</div><div className="part-icon" aria-hidden="true">{part.category.slice(0, 1)}</div>
                  <div className="part-copy">
                    <span className="part-group">{part.recipeRole ? `${part.recipeRole} · ` : ''}{part.category} · Qty {part.usual_qty}</span><h3>{part.part_name}</h3>
                    <PartDetails part={part} />
                  </div>
                  {!isMobile ? <OwnershipChoices part={part} value={choices[part.part_id]} onChange={(value) => setChoices((current) => ({ ...current, [part.part_id]: value }))} /> : null}
                </article>
              ))}
            </div> : null}
            <section className="summary-card" id="need-summary" aria-labelledby="summary-title">
              <div><div className="summary-heading"><div><p className="step-label">03 / Take the next step</p><h2 id="summary-title">Your “Need” list</h2></div><a href="#parts-start">Back to parts <span aria-hidden="true">↑</span></a></div>{neededParts.length ? <><ul className="need-list">{neededParts.map((part) => <li key={part.part_id}><strong>{part.usual_qty} × {part.part_name}</strong><small className="need-list-purpose">{part.recipeReason}</small><span>₹{inr.format(part.priceEstimate.typical)} estimate</span><a href={`#part-${part.part_id}`}>Purpose, guide and buying searches ↑</a></li>)}</ul><div className={`budget-check budget-${budgetComparison.state}`} role="status"><span>SELECTED-PARTS ESTIMATE</span><strong>₹{inr.format(selectedPriceTotal.typical)}</strong><p>Combined range: ₹{inr.format(selectedPriceTotal.min)}–₹{inr.format(selectedPriceTotal.max)}</p><b>{budgetComparison.text}</b>{selectedPriceTotal.missing ? <small>{selectedPriceTotal.missing} selected item(s) have no estimate and are excluded.</small> : null}</div><p className="price-assumption">Assumption: each CSV school-project price covers one listed purchase line, including the displayed quantity or pack. These are tentative India estimates, not a checkout total.</p></> : <p className="empty-summary">{allPartsMarked ? 'You already have every listed part. Nothing needs to be bought for this plan.' : 'Mark parts above as “Need” and they will appear here with an estimated total.'}</p>}<section className="build-prerequisites" aria-labelledby="prerequisites-title"><span>REQUIRED BUT NOT IN THE PARTS TOTAL</span><h3 id="prerequisites-title">Have these before building</h3><ul>{plan.recipe.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
              {!isMobile ? <FirstBuildStage /> : null}
            </section>
            {localStores.length ? (
              <section className="store-section" aria-labelledby="stores-title">
                <div><span className="part-group">Local search leads</span><h2 id="stores-title">Bengaluru stores in the database</h2><p>These are store leads, not stock confirmations. Call before travelling.</p></div>
                <div className="store-grid">{localStores.map((store) => <a href={store.maps_search_url} target="_blank" rel="noreferrer" key={store.store_id}><strong>{store.store_name}</strong><span>{store.category}</span><small>Rating recorded: {store.rating} · checked {store.checked_date}</small></a>)}</div>
              </section>
            ) : null}
            <form className="feedback-card" aria-labelledby="feedback-title" onSubmit={saveFeedback}>
              <div><span className="part-group">One last check</span><h2 id="feedback-title">Did this plan help you understand what you need?</h2><p>Your answer helps us improve the next parts plan.</p></div>
              <div className="feedback-actions"><button type="button" className={feedback === 'useful' ? 'active' : ''} onClick={() => chooseFeedback('useful')}>Yes, useful</button><button type="button" className={feedback === 'needs-work' ? 'active' : ''} onClick={() => chooseFeedback('needs-work')}>Needs work</button></div>
              {feedback ? <><label className="feedback-comment"><span>Anything else you want to tell us? <small>Optional</small></span><textarea value={feedbackComment} onChange={(event) => { setFeedbackComment(event.target.value); setFeedbackStatus('idle'); }} maxLength="1000" rows="3" placeholder="Tell us what was clear, missing, or confusing." /><small>{feedbackComment.length}/1000</small></label><button className="feedback-submit" type="submit" disabled={feedbackStatus === 'saving' || feedbackStatus === 'saved'}>{feedbackStatus === 'saving' ? 'Saving…' : feedbackStatus === 'saved' ? 'Feedback saved' : 'Send feedback'}</button></> : <p className="feedback-help">Choose one answer to add an optional comment.</p>}
              {feedbackStatus === 'saved' ? <div className="feedback-saved" role="status"><p className="feedback-confirmation">Thank you. Your feedback has been saved.</p><button type="button" onClick={startNewPlan}>Start a new parts plan <span aria-hidden="true">↑</span></button></div> : null}
              {feedbackError ? <p className="feedback-error" role="alert">{feedbackError}</p> : null}
            </form>
            <aside className="record-conclusion" role="note"><strong>Based on our current records</strong><p>This plan should help you start the voice-controlled dog animaloid. Part details and prices can change, so check the listed specifications with an adult before buying, connecting, or powering anything.</p></aside>
          </section>
        ) : null}
      </main>
      <footer><span>Robotics, Made Simple</span><p>Understand the parts. Build with an adult.</p><span>Build Week · V1</span></footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><ConvexProvider client={convex}><App /></ConvexProvider></React.StrictMode>);

import { useEffect, useState } from 'react';
import { SUGGESTED_LANGUAGES, languages } from '../../data/languages.js';
import { postFeedback } from '../../lib/api.js';
import { Back, Check, Star } from '../Icons.jsx';

const TYPES = [
  { id: 'language', label: 'Suggest a language' },
  { id: 'correction', label: 'Fix a phrase' },
  { id: 'feature', label: 'Idea or feedback' },
  { id: 'bug', label: 'Something is off' },
  { id: 'other', label: 'Other' },
];

const HINTS = {
  language: 'Which language, and who would you practise it with? (optional)',
  correction: 'What should it say instead, and why does the current version sound off?',
  feature: 'What would make BiLingos better for you?',
  bug: 'What happened, and on which device or browser?',
  other: 'Tell us anything.',
};

export default function FeedbackScreen({ initialType = 'feature', initialPhrase = '', appLanguage, onBack, onQueue }) {
  const [type, setType] = useState(initialType);
  const [language, setLanguage] = useState('');
  const [phrase, setPhrase] = useState(initialPhrase);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [rating, setRating] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => setError(''), [type, language, message, phrase]);

  const supported = new Set(languages.map((l) => l.name.toLowerCase()));
  const suggestions = SUGGESTED_LANGUAGES.filter((l) => !supported.has(l.toLowerCase()));

  async function submit(e) {
    e.preventDefault();
    if (type === 'language' && !language.trim()) {
      setError('Pick a language or type one.');
      return;
    }
    if (type === 'correction' && !phrase.trim()) {
      setError('Paste the phrase that needs fixing.');
      return;
    }
    if (type !== 'language' && type !== 'correction' && !message.trim()) {
      setError('Write a short message first.');
      return;
    }
    setError('');
    setStatus('sending');
    const entry = {
      type,
      language: type === 'language' ? language.trim() : '',
      phrase: type === 'correction' ? phrase.trim() : '',
      message: message.trim(),
      contact: contact.trim(),
      rating,
      appLanguage,
      at: new Date().toISOString(),
    };
    try {
      await postFeedback(entry);
      setStatus('sent');
    } catch {
      onQueue(entry); // kept on this device, retried next time the app opens
      setStatus('saved');
    }
  }

  if (status === 'sent' || status === 'saved') {
    return (
      <div className="page">
        <div className="empty">
          <div className="badge" aria-hidden="true">
            <Check width={36} height={36} strokeWidth={3} />
          </div>
          <h2>Thank you!</h2>
          <p>
            {status === 'sent'
              ? 'Your feedback reached the team.'
              : "We couldn't reach the server, so it is saved on this device and will be sent next time you open the app."}
          </p>
          <button className="primary" onClick={onBack}>
            Back to learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-head row">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <Back />
        </button>
        <h1 className="page-title small">Feedback</h1>
      </header>

      <form className="form" onSubmit={submit}>
        <p className="page-sub">
          BiLingos starts with Mandarin, Malay and Tamil. Tell us which language to add next, fix a line
          that sounds unnatural, or say what to improve.
        </p>

        <fieldset>
          <legend>What is this about?</legend>
          <div className="pills">
            {TYPES.map((tp) => (
              <button
                key={tp.id}
                type="button"
                className={`pill ${type === tp.id ? 'on' : ''}`}
                aria-pressed={type === tp.id}
                onClick={() => setType(tp.id)}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </fieldset>

        {type === 'language' && (
          <fieldset>
            <legend>Which language?</legend>
            <div className="pills">
              {suggestions.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`pill ${language === l ? 'on' : ''}`}
                  aria-pressed={language === l}
                  onClick={() => setLanguage(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            <input
              className="field"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Or type another language"
              maxLength={40}
              aria-label="Language name"
            />
          </fieldset>
        )}

        {type === 'correction' && (
          <label className="label">
            The phrase that needs fixing
            <input
              className="field"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Paste or type the line as it appears in the app"
              maxLength={200}
            />
          </label>
        )}

        <label className="label">
          {HINTS[type]}
          <textarea
            className="field"
            rows={4}
            maxLength={600}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <fieldset>
          <legend>How is BiLingos so far? (optional)</legend>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`star ${rating >= n ? 'on' : ''}`}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                aria-pressed={rating === n}
                onClick={() => setRating(rating === n ? null : n)}
              >
                <Star width={28} height={28} />
              </button>
            ))}
          </div>
        </fieldset>

        <label className="label">
          Email or name, if you want a reply (optional)
          <input
            className="field"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={100}
            autoComplete="off"
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="primary wide" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send feedback'}
        </button>
      </form>
    </div>
  );
}

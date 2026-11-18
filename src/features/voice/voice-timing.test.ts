import { contextualWords, END_OF_SPEECH_MS, IDLE_TIMEOUT_MS, nextListeningStep } from './voice-timing';

describe('nextListeningStep', () => {
  const start = 1_000;

  it('waits while nobody has spoken yet', () => {
    expect(nextListeningStep({ startedAt: start, lastHeardAt: null, transcript: '' }, start + 3_000)).toBe('wait');
  });

  it('times out after 8 s of silence', () => {
    expect(nextListeningStep({ startedAt: start, lastHeardAt: null, transcript: '' }, start + IDLE_TIMEOUT_MS)).toBe('timeout');
  });

  it('waits while words keep coming', () => {
    const heard = start + 2_000;
    expect(nextListeningStep({ startedAt: start, lastHeardAt: heard, transcript: 'spent 500' }, heard + 500)).toBe('wait');
  });

  it('finishes 1.2 s after the last word', () => {
    const heard = start + 2_000;
    expect(nextListeningStep({ startedAt: start, lastHeardAt: heard, transcript: 'spent 500 on swiggy' }, heard + END_OF_SPEECH_MS)).toBe('finish');
  });

  it('does not time out during a long sentence', () => {
    const heard = start + IDLE_TIMEOUT_MS + 500;
    expect(nextListeningStep({ startedAt: start, lastHeardAt: heard, transcript: 'paid the electricity bill' }, heard + 100)).toBe('wait');
  });

  it('ignores blank transcripts', () => {
    expect(nextListeningStep({ startedAt: start, lastHeardAt: start + 10, transcript: '  ' }, start + IDLE_TIMEOUT_MS)).toBe('timeout');
  });
});

describe('contextualWords', () => {
  it('lists names and capitalised keywords once each', () => {
    expect(
      contextualWords([
        { name: 'Food', keywords: 'swiggy, zomato' },
        { name: 'Travel', keywords: 'uber,swiggy' },
      ]),
    ).toEqual(['Food', 'Swiggy', 'Zomato', 'Travel', 'Uber']);
  });
});

/**
 * @jest-environment node
 */
import { MockLanguageModelV4 } from 'ai/test';

import { createExtractor } from './model-extractor';

const hints = [
  { id: 'food', name: 'Food', description: 'restaurants', keywords: 'swiggy' },
  { id: 'travel', name: 'Travel', description: 'cabs', keywords: 'uber' },
];

const ANSWER = { note: 'Swiggy', amountRupees: 500, amountUnsure: false, category: 'Food', categoryUnsure: false, isExpense: true };

type GenerateResult = Awaited<ReturnType<MockLanguageModelV4['doGenerate']>>;

function mockModel(text: string) {
  return new MockLanguageModelV4({
    doGenerate: async (): Promise<GenerateResult> => ({
      content: [{ type: 'text', text }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: {
        inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 10, text: 10, reasoning: undefined },
      },
      warnings: [],
    }),
  });
}

describe('createExtractor (real AI SDK path, mock model)', () => {
  it('sends instructions, prompt and a JSON schema in the field order the app relies on', async () => {
    const model = mockModel(JSON.stringify(ANSWER));
    const extract = createExtractor(() => model);

    const output = await extract('spent 500 on swiggy', hints, [{ note: 'Uber', categoryName: 'Travel' }]);

    expect(output).toEqual(ANSWER);
    const call = model.doGenerateCalls[0];
    const system = call.prompt.find((message) => message.role === 'system');
    expect(system?.content).toContain('- Food: restaurants');
    expect(system?.content).toContain('- Uber → Travel');
    expect(JSON.stringify(call.prompt)).toContain('spent 500 on swiggy');

    expect(call.responseFormat?.type).toBe('json');
    const schema = call.responseFormat?.type === 'json' ? call.responseFormat.schema : undefined;
    const properties = (schema as { properties?: Record<string, { enum?: string[] }> } | undefined)?.properties ?? {};
    expect(Object.keys(properties)).toEqual(['note', 'amountRupees', 'amountUnsure', 'category', 'categoryUnsure', 'isExpense']);
    expect(properties.category.enum).toEqual(['Food', 'Travel']);
    expect(call.temperature).toBe(0);
  });

  it('rejects an answer whose category is not in the list', async () => {
    const extract = createExtractor(() => mockModel(JSON.stringify({ ...ANSWER, category: 'Pets' })));
    await expect(extract('vet 900', hints, [])).rejects.toThrow();
  });

  it('rejects text that is not JSON', async () => {
    const extract = createExtractor(() => mockModel('I think it is food'));
    await expect(extract('spent 500', hints, [])).rejects.toThrow();
  });

  it('refuses to run with no categories', async () => {
    const extract = createExtractor(() => mockModel('{}'));
    await expect(extract('spent 500', [], [])).rejects.toThrow('No categories');
  });
});

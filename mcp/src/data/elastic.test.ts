import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchModules } from './elastic.js';

type EsBody = {
  from: number;
  highlight: unknown;
  query: { bool: { filter: Array<Record<string, unknown>>; must: Array<Record<string, unknown>> } };
  size: number;
};

let fetchMock: ReturnType<typeof vi.fn>;

function esResponse(total: unknown = { value: 0 }, hits: Array<unknown> = []) {
  return { ok: true, status: 200, json: async () => ({ hits: { hits, total } }) } as Response;
}

/** Run a search and return the parsed request body sent to ElasticSearch. */
async function capture(params: Parameters<typeof searchModules>[0]): Promise<EsBody> {
  await searchModules(params);
  return JSON.parse(fetchMock.mock.calls[0][1].body as string) as EsBody;
}

describe('searchModules query builder', () => {
  beforeEach(() => {
    fetchMock = vi.fn(async () => esResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses match_all with no query and an empty filter set', async () => {
    const body = await capture({ limit: 10, offset: 0 });

    expect(body.query.bool.must).toEqual([{ match_all: {} }]);
    expect(body.query.bool.filter).toEqual([]);
    expect(body.from).toBe(0);
    expect(body.size).toBe(10);
    expect(body.highlight).toBeDefined();
  });

  it('uses multi_match when a query is provided', async () => {
    const body = await capture({ limit: 5, offset: 0, query: 'machine learning' });

    expect(body.query.bool.must[0]).toMatchObject({
      multi_match: {
        fields: ['moduleCode^3', 'title^2', 'description'],
        query: 'machine learning',
      },
    });
  });

  it('builds a nested query for semesters', async () => {
    const body = await capture({ limit: 10, offset: 0, semesters: [1, 2] });

    expect(body.query.bool.filter).toContainEqual({
      nested: {
        path: 'semesterData',
        query: { terms: { 'semesterData.semester': [1, 2] } },
      },
    });
  });

  it('normalises levels to the thousand form', async () => {
    const body = await capture({ levels: [2, 2000], limit: 10, offset: 0 });

    expect(body.query.bool.filter).toContainEqual({
      terms: { 'moduleCode.level': ['2000', '2000'] },
    });
  });

  it('maps keyword facets to their .keyword fields', async () => {
    const body = await capture({
      attributes: ['su'],
      departments: ['Computer Science'],
      faculties: ['Computing'],
      gradingBasis: ['Graded'],
      limit: 10,
      offset: 0,
    });

    expect(body.query.bool.filter).toContainEqual({ terms: { 'faculty.keyword': ['Computing'] } });
    expect(body.query.bool.filter).toContainEqual({
      terms: { 'department.keyword': ['Computer Science'] },
    });
    expect(body.query.bool.filter).toContainEqual({
      terms: { 'gradingBasisDescription.keyword': ['Graded'] },
    });
    expect(body.query.bool.filter).toContainEqual({
      terms: { 'moduleAttributes.keyword': ['su'] },
    });
  });

  it('builds a range clause from credit bounds', async () => {
    const body = await capture({ limit: 10, maxCredit: 8, minCredit: 4, offset: 0 });

    expect(body.query.bool.filter).toContainEqual({ range: { moduleCredit: { gte: 4, lte: 8 } } });
  });

  it('omits an absent credit bound', async () => {
    const body = await capture({ limit: 10, minCredit: 4, offset: 0 });

    expect(body.query.bool.filter).toContainEqual({ range: { moduleCredit: { gte: 4 } } });
  });

  it('builds a must_not exists clause for noExam', async () => {
    const body = await capture({ limit: 10, noExam: true, offset: 0 });

    expect(body.query.bool.filter).toContainEqual({
      bool: {
        must_not: {
          nested: {
            path: 'semesterData',
            query: { exists: { field: 'semesterData.examDate' } },
          },
        },
      },
    });
  });

  it('parses total from the object form and returns hits', async () => {
    fetchMock.mockResolvedValueOnce(
      esResponse({ value: 42 }, [{ _source: { moduleCode: 'CS1010' } }]),
    );

    const result = await searchModules({ limit: 10, offset: 0 });

    expect(result.total).toBe(42);
    expect(result.hits).toHaveLength(1);
  });

  it('parses total from the plain number form', async () => {
    fetchMock.mockResolvedValueOnce(esResponse(7, []));

    const result = await searchModules({ limit: 10, offset: 0 });

    expect(result.total).toBe(7);
  });

  it('throws when ElasticSearch returns a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Unavailable',
    } as Response);

    await expect(searchModules({ limit: 10, offset: 0 })).rejects.toThrow(/503 Unavailable/);
  });
});

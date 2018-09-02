import { graphql } from 'graphql';
import { makeExecutableSchema } from 'apollo-server';
import index from './';
import db from '../db';

const schema = makeExecutableSchema(index);

const gql = (x) => x.raw[0]; // identify function for template literals

describe('course queries', () => {
  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
    await db.seed.run();
  });

  it('should be empty when courses are not found', async () => {
    const query = gql`
      query {
        courses(acadYear: "2017-2018") {
          code
        }
      }
    `;
    const { data } = await graphql(schema, query);

    expect(data).not.toBeNull();
    expect(data.courses).toEqual([]);
  });

  it('should be not be null when courses are found', async () => {
    const query = gql`
      query {
        courses(acadYear: "2016-2017") {
          code
        }
      }
    `;
    const { data } = await graphql(schema, query);

    expect(data).not.toBeNull();
    expect(data).toMatchSnapshot();
  });

  it('should return everything when first and offset are not specified', async () => {
    const query = gql`
      query {
        courses(acadYear: "2016-2017") {
          code
        }
      }
    `;
    const {
      data: { courses },
    } = await graphql(schema, query);

    expect(courses).toHaveLength(2);
  });

  it('should return first n elements when specified', async () => {
    const query = gql`
      query {
        courses(acadYear: "2016-2017", first: 1) {
          code
        }
      }
    `;
    const {
      data: { courses },
    } = await graphql(schema, query);

    expect(courses).toHaveLength(1);
  });

  it('should return offset n elements when specified', async () => {
    const query = gql`
      query {
        courses(acadYear: "2016-2017", offset: 2) {
          code
        }
      }
    `;
    const {
      data: { courses },
    } = await graphql(schema, query);

    expect(courses).toHaveLength(0);
  });

  it('should return first n and offset n elements when specified', async () => {
    const query = gql`
      query {
        courses(acadYear: "2016-2017", first: 1, offset: 1) {
          code
        }
      }
    `;
    const {
      data: { courses },
    } = await graphql(schema, query);

    expect(courses).toHaveLength(1);
    expect(courses[0].code).toBe('anotherTestCode');
  });

  it('should be null when course is not found', async () => {
    const query = gql`
      query {
        course(acadYear: "2017-2018", code: "CS2100") {
          code
        }
      }
    `;
    const {
      data: { course },
    } = await graphql(schema, query);

    expect(course).toBeNull();
  });

  it('should not be null when course is valid', async () => {
    const query = gql`
      query {
        course(acadYear: "2016-2017", code: "CS2100") {
          code
          title
          credit
          department
          description
        }
      }
    `;
    const { data } = await graphql(schema, query);

    expect(data).not.toBeNull();
    expect(data).toMatchSnapshot();
  });
});

describe('terms query', () => {
  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
    await db.seed.run();
  });

  it('should return terms when school id is valid', async () => {
    const query = gql`
      query {
        terms(schoolId: 1) {
          id
        }
      }
    `;
    const {
      data: { terms },
    } = await graphql(schema, query);
    expect(terms).toHaveLength(1);
  });
});

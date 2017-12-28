import { graphql } from 'graphql';
import schema from './index';

const gql = x => x.raw[0]; // identify function for template literals

jest.mock('./jsonData', () => ({
  '2016-2017': {
    CS1000: {
      code: 'testCode',
      title: 'testTitle',
      credit: 4.0,
      history: [],
    },
    CS2100: {
      code: 'anotherTestCode',
      title: 'anotherTestTitle',
      credit: 4.0,
      history: [],
    },
  },
}));

describe('graphql', () => {
  it('should be null when modules are not found', async () => {
    const query = gql`
      query {
        modules(acadYear: "2017-2018") {
          code
        }
      }
    `;
    const { data } = await graphql(schema, query);

    expect(data).toBeNull();
  });

  it('should be not be null when modules are found', async () => {
    const query = gql`
      query {
        modules(acadYear: "2016-2017") {
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
        modules(acadYear: "2016-2017") {
          code
        }
      }
    `;
    const { data: { modules } } = await graphql(schema, query);

    expect(modules).toHaveLength(2);
  });

  it('should return first n elements when specified', async () => {
    const query = gql`
      query {
        modules(acadYear: "2016-2017", first: 1) {
          code
        }
      }
    `;
    const { data: { modules } } = await graphql(schema, query);

    expect(modules).toHaveLength(1);
  });

  it('should return offset n elements when specified', async () => {
    const query = gql`
      query {
        modules(acadYear: "2016-2017", offset: 2) {
          code
        }
      }
    `;
    const { data: { modules } } = await graphql(schema, query);

    expect(modules).toHaveLength(0);
  });

  it('should return first n and offset n elements when specified', async () => {
    const query = gql`
      query {
        modules(acadYear: "2016-2017", first: 1, offset: 1) {
          code
        }
      }
    `;
    const { data: { modules } } = await graphql(schema, query);

    expect(modules).toHaveLength(1);
    expect(modules[0].code).toBe('anotherTestCode');
  });

  it('should be null when module is not found', async () => {
    const query = gql`
      query {
        module(acadYear: "2017-2018", code: "CS2100") {
          code
        }
      }
    `;
    const { data } = await graphql(schema, query);

    expect(data).toBeNull();
  });

  it('should not be null when module is valid', async () => {
    const query = gql`
      query {
        module(acadYear: "2016-2017", code: "CS2100") {
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

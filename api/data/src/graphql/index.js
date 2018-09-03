import { gql } from 'apollo-server';
import _ from 'lodash';
import { TABLES } from '../db/constants';
import db from '../db/database';
import { DateScalarType } from './customScalars';

const typeDefs = gql`
  scalar Date

  type School {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    longName: String!
    shortName: String
  }

  type Term {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    name: String!
    startsAt: Date!
    endsAt: Date!
  }

  # Describes a module, may span different semesters
  type Course {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    code: String!
    title: String!
    description: String
    value: Float
    workload: String
    prerequisite: String
    corequisite: String
  }

  # Describes a particular module for a semester
  type CourseInfo {
    semester: Int
    examDate: String
    examOpenBook: Boolean
    examDuration: String
    examVenue: String
    timetable: [Lesson]
  }

  # Bidding stats for Cors
  type CorsBiddingStats {
    quota: Int
    bidders: Int
    lowestBid: Int
    lowestSuccessfulBid: Int
    highestBid: Int
    faculty: String
    studentAcctType: String
    acadYear: String
    semester: Int
    round: String
    group: String
  }

  # A lesson conducted, may it be a lecture, laboratory or lecture
  type Lesson {
    classNo: String!
    lessonType: String!
    weekText: String!
    dayText: String!
    startTime: String!
    endTime: String!
    venue: String!
  }

  # the schema allows the following query:
  type Query {
    schools(first: Int, offset: Int): [School!]!
    terms(schoolId: ID!, first: Int, offset: Int): [Term!]!
    courses(termId: ID!, first: Int, offset: Int): [Course!]!
    course(termId: ID!, code: String!): Course
  }

  type Mutation {
    term(schoolId: ID!, name: String!, startsAt: Date!, endsAt: Date!): ID!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

const resolvers = {
  Query: {
    schools(root, { first, offset }) {
      return db
        .table(TABLES.schools)
        .select()
        .limit(first || -1)
        .offset(offset);
    },
    terms(root, { schoolId, first, offset }) {
      return db
        .table(TABLES.terms)
        .select()
        .where({ schoolId })
        .limit(first || -1)
        .offset(offset);
    },
    courses(root, { termId, first, offset }) {
      return db
        .table(TABLES.courses)
        .select()
        .where({ termId })
        .limit(first || -1)
        .offset(offset);
    },
    course(root, { termId, code }) {
      return db
        .table(TABLES.courses)
        .select()
        .where({ termId, code })
        .first();
    },
  },
  Mutation: {
    term(root, { schoolId, name, startsAt, endsAt }) {
      return db
        .table(TABLES.terms)
        .insert({ schoolId, name, startsAt, endsAt })
        .then((x) => x[0]);
    },
  },
  Date: DateScalarType,
};

export default {
  typeDefs,
  resolvers,
};

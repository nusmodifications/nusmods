import { makeExecutableSchema } from 'graphql-tools';
import bunyan from 'bunyan';
import R from 'ramda';

import jsonData from './jsonData';

const log = bunyan.createLogger({ name: 'graphql' });

const Schema = `
# Describes a module for, may span different semesters
type Module {
  code: String!
  title: String!
  department: String
  description: String
  credit: Float
  workload: String
  prerequisite: String
  corequisite: String
  corsBiddingStats: [CorsBiddingStats]
  # Refers to the history of the module throughout semesters
  history: [ModuleInfo]!
}

# Describes a particular module for a semester
type ModuleInfo {
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
  modules(acadYear: String!, first: Int, offset: Int): [Module]!
  module(acadYear: String!, code: String!): Module!
}

schema {
  query: Query
}
`;

const Resolvers = {
  Query: {
    modules(root, { acadYear, first, offset }) {
      const yearData = jsonData[acadYear];
      if (yearData == null) {
        return null;
      }
      const modules = Object.values(yearData);
      return modules.slice(offset, offset ? (offset + first) : first);
    },
    module(root, { acadYear, code }) {
      return R.path([acadYear, code], jsonData);
    },
  },
};

const subLog = log.child({ path: 'graphql' });
const logger = {
  log: e => subLog.error(e),
};

const schema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers,
  logger,
});

export default schema;

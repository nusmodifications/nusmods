import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ActionCable from 'actioncable';
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink';

const cable = ActionCable.createConsumer('ws://localhost:4000/cable');

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'same-origin',
});

const hasSubscriptionOperation = ({ query: { definitions } }) =>
  definitions.some(
    ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription',
  );

const link = ApolloLink.split(hasSubscriptionOperation, new ActionCableLink({ cable }), httpLink);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;

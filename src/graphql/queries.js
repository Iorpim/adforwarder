/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUpdateMessage = /* GraphQL */ `
  query GetUpdateMessage($userid: ID!) {
    getUpdateMessage(userid: $userid) {
      userid
      payload
    }
  }
`;
export const listUpdateMessages = /* GraphQL */ `
  query ListUpdateMessages(
    $filter: TableUpdateMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUpdateMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        userid
        payload
      }
      nextToken
    }
  }
`;

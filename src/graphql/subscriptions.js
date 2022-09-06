/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUpdateMessage = /* GraphQL */ `
  subscription OnCreateUpdateMessage {
    onCreateUpdateMessage {
      userid
      payload
    }
  }
`;
export const onUpdateUpdateMessage = /* GraphQL */ `
  subscription OnUpdateUpdateMessage($userid: ID!) {
    onUpdateUpdateMessage(userid: $userid) {
      userid
      payload
    }
  }
`;
export const onDeleteUpdateMessage = /* GraphQL */ `
  subscription OnDeleteUpdateMessage($userid: ID!) {
    onDeleteUpdateMessage(userid: $userid) {
      userid
      payload
    }
  }
`;

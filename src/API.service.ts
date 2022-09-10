/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.
import { Injectable } from "@angular/core";
import API, { graphqlOperation, GraphQLResult } from "@aws-amplify/api-graphql";
import { Observable } from "zen-observable-ts";

export interface SubscriptionResponse<T> {
  value: GraphQLResult<T>;
}

export type __SubscriptionContainer = {
  onCreateUpdateMessage: OnCreateUpdateMessageSubscription;
  onUpdateUpdateMessage: OnUpdateUpdateMessageSubscription;
  onDeleteUpdateMessage: OnDeleteUpdateMessageSubscription;
};

export type CreateUpdateMessageInput = {
  userid: string;
  payload: string;
};

export type updateMessage = {
  __typename: "updateMessage";
  userid: string;
  payload: string;
};

export type UpdateUpdateMessageInput = {
  userid: string;
  payload: string;
};

export type DeleteUpdateMessageInput = {
  userid: string;
};

export type TableUpdateMessageFilterInput = {
  userid?: TableIDFilterInput | null;
};

export type TableIDFilterInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
};

export type updateMessageConnection = {
  __typename: "updateMessageConnection";
  items?: Array<updateMessage | null> | null;
  nextToken?: string | null;
};

export type CreateUpdateMessageMutation = {
  __typename: "updateMessage";
  userid: string;
  payload: string;
};

export type UpdateUpdateMessageMutation = {
  __typename: "updateMessage";
  userid: string;
  payload: string;
};

export type DeleteUpdateMessageMutation = {
  __typename: "updateMessage";
  userid: string;
  payload: string;
};

export type GetUpdateMessageQuery = {
  __typename: "updateMessage";
  userid: string;
  payload: string;
};

export type ListUpdateMessagesQuery = {
  __typename: "updateMessageConnection";
  items?: Array<{
    __typename: "updateMessage";
    userid: string;
    payload: string;
  } | null> | null;
  nextToken?: string | null;
};

export type OnCreateUpdateMessageSubscription = {
  __typename: "updateMessage";
  userid: string;
  payload: string;
};

export type OnUpdateUpdateMessageSubscription = {
  __typename: "updateMessage";
  userid: string;
  payload: string;
};

export type OnDeleteUpdateMessageSubscription = {
  __typename: "updateMessage";
  userid: string;
  payload: string;
};

@Injectable({
  providedIn: "root"
})
export class APIService {
  async CreateUpdateMessage(
    input: CreateUpdateMessageInput
  ): Promise<CreateUpdateMessageMutation> {
    const statement = `mutation CreateUpdateMessage($input: CreateUpdateMessageInput!) {
        createUpdateMessage(input: $input) {
          __typename
          userid
          payload
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <CreateUpdateMessageMutation>response.data.createUpdateMessage;
  }
  async UpdateUpdateMessage(
    input: UpdateUpdateMessageInput
  ): Promise<UpdateUpdateMessageMutation> {
    const statement = `mutation UpdateUpdateMessage($input: UpdateUpdateMessageInput!) {
        updateUpdateMessage(input: $input) {
          __typename
          userid
          payload
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <UpdateUpdateMessageMutation>response.data.updateUpdateMessage;
  }
  async DeleteUpdateMessage(
    input: DeleteUpdateMessageInput
  ): Promise<DeleteUpdateMessageMutation> {
    const statement = `mutation DeleteUpdateMessage($input: DeleteUpdateMessageInput!) {
        deleteUpdateMessage(input: $input) {
          __typename
          userid
          payload
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <DeleteUpdateMessageMutation>response.data.deleteUpdateMessage;
  }
  async GetUpdateMessage(userid: string): Promise<GetUpdateMessageQuery> {
    const statement = `query GetUpdateMessage($userid: ID!) {
        getUpdateMessage(userid: $userid) {
          __typename
          userid
          payload
        }
      }`;
    const gqlAPIServiceArguments: any = {
      userid
    };
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <GetUpdateMessageQuery>response.data.getUpdateMessage;
  }
  async ListUpdateMessages(
    filter?: TableUpdateMessageFilterInput,
    limit?: number,
    nextToken?: string
  ): Promise<ListUpdateMessagesQuery> {
    const statement = `query ListUpdateMessages($filter: TableUpdateMessageFilterInput, $limit: Int, $nextToken: String) {
        listUpdateMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
            __typename
            userid
            payload
          }
          nextToken
        }
      }`;
    const gqlAPIServiceArguments: any = {};
    if (filter) {
      gqlAPIServiceArguments.filter = filter;
    }
    if (limit) {
      gqlAPIServiceArguments.limit = limit;
    }
    if (nextToken) {
      gqlAPIServiceArguments.nextToken = nextToken;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <ListUpdateMessagesQuery>response.data.listUpdateMessages;
  }
  OnCreateUpdateMessageListener: Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onCreateUpdateMessage">>
  > = API.graphql(
    graphqlOperation(
      `subscription OnCreateUpdateMessage {
        onCreateUpdateMessage {
          __typename
          userid
          payload
        }
      }`
    )
  ) as Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onCreateUpdateMessage">>
  >;

  OnUpdateUpdateMessageListener(
    userid: string
  ): Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onUpdateUpdateMessage">>
  > {
    const statement = `subscription OnUpdateUpdateMessage($userid: ID!) {
        onUpdateUpdateMessage(userid: $userid) {
          __typename
          userid
          payload
        }
      }`;
    const gqlAPIServiceArguments: any = {
      userid
    };
    return API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    ) as Observable<
      SubscriptionResponse<
        Pick<__SubscriptionContainer, "onUpdateUpdateMessage">
      >
    >;
  }

  OnDeleteUpdateMessageListener(
    userid?: string
  ): Observable<
    SubscriptionResponse<Pick<__SubscriptionContainer, "onDeleteUpdateMessage">>
  > {
    const statement = `subscription OnDeleteUpdateMessage($userid: ID) {
        onDeleteUpdateMessage(userid: $userid) {
          __typename
          userid
          payload
        }
      }`;
    const gqlAPIServiceArguments: any = {};
    if (userid) {
      gqlAPIServiceArguments.userid = userid;
    }
    return API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    ) as Observable<
      SubscriptionResponse<
        Pick<__SubscriptionContainer, "onDeleteUpdateMessage">
      >
    >;
  }
}

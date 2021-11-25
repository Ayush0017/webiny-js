const ERROR_FIELDS = `{
    message
    code
    data
}`;

const getDataFields = (fields = "") => `{
    id
    app
    title
    scope {
        type
    }
    steps {
        title
        type
        reviewers {
            id
        }
    }
    ${fields}
}`;

export const GET_WORKFLOW_QUERY = /* GraphQL */ `
    query GetWorkflow($id: ID!) {
        advancedPublishingWorkflow {
            getWorkflow(id: $id) {
                data ${getDataFields()}
                error ${ERROR_FIELDS}
            }
        }
    }
`;

export const LIST_WORKFLOWS_QUERY = /* GraphQL */ `
    query ListWorkflows(
        $where: ApwListWorkflowsWhereInput,
        $limit: Int,
        $after: String,
        $sort: [ApwListWorkflowsSort!],
        $search: ApwListWorkflowsSearchInput
    ) {
        advancedPublishingWorkflow {
            listWorkflows(
                where: $where,
                limit: $limit,
                after: $after,
                sort: $sort,
                search: $search
            ) {
                data ${getDataFields()}
                error ${ERROR_FIELDS}
                meta {
                    hasMoreItems
                    totalCount
                    cursor
                }
            }
        }
    }
`;

export const CREATE_WORKFLOW_MUTATION = /* GraphQL */ `
    mutation CreateWorkflowMutation($data: ApwCreateWorkflowInput!) {
        advancedPublishingWorkflow {
            createWorkflow(data: $data) {
                data ${getDataFields()}
                error ${ERROR_FIELDS}
            }
        }
    }
`;

export const UPDATE_WORKFLOW_MUTATION = /* GraphQL */ `
    mutation UpdateWorkflowMutation($id: ID!, $data: ApwUpdateWorkflowInput!) {
        advancedPublishingWorkflow {
            updateWorkflow(id: $id, data: $data) {
                data ${getDataFields()}
                error ${ERROR_FIELDS}
            }
        }
    }
`;

export const DELETE_WORKFLOW_MUTATION = /* GraphQL */ `
    mutation DeleteWorkflowMutation($id: ID!) {
        advancedPublishingWorkflow {
            deleteWorkflow(id: $id) {
                data
                error ${ERROR_FIELDS}
            }
        }
    }
`;
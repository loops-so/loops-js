interface QueryOptions {
  path: `v1/${string}`;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  payload?: Record<string, unknown>;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

interface ApiKeySuccessResponse {
  success: true;
  teamName: string;
}

interface ApiKeyErrorResponse {
  error: "Invalid API key";
}

interface ContactSuccessResponse {
  success: true;
  /** The ID of the contact. */
  id: string;
}

interface DeleteSuccessResponse {
  success: true;
  message: "Contact deleted.";
}

interface SuppressionContact {
  /**
   * The contact's Loops-assigned ID.
   */
  id: string;
  /**
   * The contact's email address.
   */
  email: string;
  /**
   * The contact's unique user ID.
   */
  userId: string | null;
}

interface SuppressionRemovalQuota {
  /**
   * The number of suppression removals you can request in a rolling 30 day period.
   */
  limit: number;
  /**
   * The remaining number of suppression removals left in the current 30 day period.
   */
  remaining: number;
}

interface CheckContactSuppressionSuccessResponse {
  contact: SuppressionContact;
  isSuppressed: boolean;
  removalQuota: SuppressionRemovalQuota;
}

interface RemoveContactSuppressionSuccessResponse {
  success: true;
  message: string;
  removalQuota: SuppressionRemovalQuota;
}

interface ErrorResponse {
  success: false;
  message: string;
}

type Contact = {
  /**
   * The contact's ID.
   */
  id: string;
  /**
   * The contact's email address.
   */
  email: string;
  /**
   * The contact's first name.
   */
  firstName: string | null;
  /**
   * The contact's last name.
   */
  lastName: string | null;
  /**
   * The source the contact was created from.
   */
  source: string;
  /**
   * Whether the contact will receive campaign and loops emails.
   */
  subscribed: boolean;
  /**
   * The contact's user group (used to segemnt users when sending emails).
   */
  userGroup: string;
  /**
   * A unique user ID (for example, from an external application).
   */
  userId: string | null;
  /**
   * Mailing lists the contact is subscribed to.
   * @see https://loops.so/docs/contacts/mailing-lists
   */
  mailingLists: Record<string, true>;
  /**
   * The contact's double opt-in status.
   * @see https://loops.so/docs/contacts/double-opt-in
   */
  optInStatus: "pending" | "accepted" | "rejected" | null;
} & Record<string, string | number | boolean | null>;

interface ContactPropertySuccessResponse {
  success: boolean;
}

interface EventSuccessResponse {
  success: boolean;
}

interface TransactionalSuccess {
  success: true;
}

interface TransactionalError {
  type: "error";
  success: false;
  path: string;
  message: string;
}

interface TransactionalNestedError {
  type: "nestedError";
  success: false;
  error: {
    path: string;
    message: string;
  };
  transactionalId?: string;
}

type ContactProperties = Record<string, string | number | boolean | null>;

type EventProperties = Record<string, string | number | boolean>;

type MailingLists = Record<string, boolean>;

type TransactionalVariables = Record<
  string,
  string | number | Array<Record<string, string | number>>
>;

interface TransactionalAttachment {
  /**
   * The file name, shown in email clients.
   */
  filename: string;
  /**
   * MIME type of the file.
   */
  contentType: string;
  /**
   * Base64-encoded content of the file.
   */
  data: string;
}

interface MailingList {
  /**
   * The ID of the list.
   */
  id: string;
  /**
   * The name of the list.
   */
  name: string;
  /**
   * The list's description.
   */
  description: string | null;
  /**
   * Whether the list is public (true) or private (false).
   * @see https://loops.so/docs/contacts/mailing-lists#list-visibility
   */
  isPublic: boolean;
}

interface PaginationData {
  /**
   * Total results found.
   */
  totalResults: number;
  /**
   * The number of results returned in this response.
   */
  returnedResults: number;
  /**
   * The maximum number of results requested.
   */
  perPage: number;
  /**
   * Total number of pages.
   */
  totalPages: number;
  /**
   * The next cursor (for retrieving the next page of results using the `cursor` parameter), or `null` if there are no further pages.
   */
  nextCursor: string | null;
  /**
   * The URL of the next page of results, or `null` if there are no further pages.
   */
  nextPage: string | null;
}

interface ContactProperty {
  /**
   * The property's name.
   */
  key: string;
  /**
   * The human-friendly label for this property.
   */
  label: string;
  /**
   * The type of property.
   */
  type: "string" | "number" | "boolean" | "date";
}

interface TransactionalEmailResource {
  /** The ID of the transactional email. */
  id: string;
  /** The name of the transactional email. */
  name: string;
  /** The ID of the draft email message, or `null` if none. */
  draftEmailMessageId: string | null;
  /** The ID of the published email message, or `null` if none. */
  publishedEmailMessageId: string | null;
  /** The ID of the group this transactional email belongs to. */
  transactionalGroupId: string | null;
  /** The date the transactional email was created in ECMA-262 date-time format. */
  createdAt: string;
  /** The date the transactional email was last updated in ECMA-262 date-time format. */
  updatedAt: string;
  /**
   * Data variable names used by the published email.
   * Empty for unpublished transactional emails.
   */
  dataVariables: string[];
}

interface TransactionalDraftResponse extends TransactionalEmailResource {
  /**
   * The `contentRevisionId` of the draft email message.
   * Pass this as `expectedRevisionId` on your first update via `updateEmailMessage()`.
   */
  draftEmailMessageContentRevisionId: string | null;
}

interface Group {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ListGroupsResponse {
  pagination: PaginationData;
  data: Group[];
}

interface AudienceFilterBetweenValue {
  from: string;
  to: string;
}

interface PropertyCondition {
  type: "property";
  key: string;
  operator:
    | "any"
    | "contains"
    | "notContains"
    | "equals"
    | "notEquals"
    | "greaterThan"
    | "lessThan"
    | "isTrue"
    | "isFalse"
    | "empty"
    | "notEmpty"
    | "dateEmpty"
    | "dateNotEmpty"
    | "after"
    | "before"
    | "between";
  value?: string | number | AudienceFilterBetweenValue;
}

interface OptInCondition {
  type: "optIn";
  status: "accepted" | "pending" | "rejected" | null;
}

interface ActivityCondition {
  type: "activity";
  action: "sent" | "opened" | "clicked";
  negate: boolean;
  target: "campaign" | "workflow" | "workflowEmail";
  id: string;
}

type AudienceFilterCondition =
  | PropertyCondition
  | OptInCondition
  | ActivityCondition;

interface AudienceFilter {
  match: "all" | "any";
  conditions: AudienceFilterCondition[];
}

interface CampaignScheduling {
  method: "now" | "schedule";
  /** ISO 8601 send time. Null when the method is `now`. */
  timestamp: string | null;
}

interface CampaignSchedulingRequest {
  method: "now" | "schedule";
  /** Required and must be in the future when `method` is `schedule`. */
  timestamp?: string;
}

interface AudienceSegment {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  filter: AudienceFilter | null;
}

interface ListAudienceSegmentsResponse {
  pagination: PaginationData;
  data: AudienceSegment[];
}

type IncomingWebhookPlatform = "clerk" | "polar" | "stripe" | "supabase";

interface EventPatternSummary {
  /** The ID of the event pattern. */
  id: string;
  /**
   * The name of the event pattern. Use this when sending events with the API.
   */
  eventName: string;
  /**
   * The platform that sent this event pattern, if the event pattern is from an
   * incoming webhook. `null` for custom events.
   */
  incomingWebhookPlatform: IncomingWebhookPlatform | null;
}

interface WorkflowEventProperty {
  name: string;
  type: "string" | "number" | "boolean" | "date";
}

interface EventPattern extends EventPatternSummary {
  /**
   * The properties of the event pattern, which can be used in emails.
   */
  eventProperties: WorkflowEventProperty[];
}

interface ListEventPatternsResponse {
  pagination: PaginationData;
  data: EventPatternSummary[];
}

interface WorkflowSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ListWorkflowsResponse {
  pagination: PaginationData;
  data: WorkflowSummary[];
}

type WorkflowStatus = "Draft" | "Sending" | "Paused" | "PausedAndQueueing";

type SimplifiedWorkflowNode = {
  typeName: string;
  nextNodeIds: string[];
} & Record<string, unknown>;

interface SimplifiedWorkflow {
  id: string;
  status: WorkflowStatus;
  name?: string;
  description?: string;
  mailingListId: string | null;
  rootNodeId: string;
  /**
   * The current workflow revision token. Pass the latest value as
   * `expectedRevisionId` on the next workflow mutation. `null` for workflows
   * that do not have a revision token yet.
   */
  workflowRevisionId: string | null;
  nodes: Record<string, SimplifiedWorkflowNode>;
}

type WorkflowNode = {
  id: string;
  workflowId: string;
  typeName: string;
  nextNodeIds: string[];
} & Record<string, unknown>;

type WorkflowNodeWithRevision = WorkflowNode & {
  /**
   * The current workflow revision token. `null` for workflows that do not
   * have a revision token yet.
   */
  workflowRevisionId: string | null;
};

type WorkflowQueuedContactPolicy = "fail" | "discard";

/** Pass the latest `workflowRevisionId`, including `null` for older workflows. */
type WorkflowExpectedRevisionId = string | null;

type CreateWorkflowNodeTypeName =
  | "AudienceFilter"
  | "BranchNode"
  | "ExperimentBranchNode"
  | "TimerAction"
  | "SendEmailAction"
  | "VariantNode";

type CreateWorkflowNodeParams =
  | {
      expectedRevisionId: WorkflowExpectedRevisionId;
      insertMode: "between";
      nodeTypeName: CreateWorkflowNodeTypeName;
      fromNodeId: string;
      toNodeId: string;
    }
  | {
      expectedRevisionId: WorkflowExpectedRevisionId;
      insertMode: "before";
      nodeTypeName: CreateWorkflowNodeTypeName;
      toNodeId: string;
    }
  | {
      expectedRevisionId: WorkflowExpectedRevisionId;
      insertMode: "before";
      nodeTypeName: CreateWorkflowNodeTypeName;
      /** @deprecated Use `toNodeId` instead. */
      beforeNodeId: string;
    }
  | {
      expectedRevisionId: WorkflowExpectedRevisionId;
      insertMode: "after";
      nodeTypeName: CreateWorkflowNodeTypeName;
      fromNodeId: string;
    };

type CreatedWorkflowNode = WorkflowNodeWithRevision & {
  /**
   * Default child nodes created along with the requested node.
   * BranchNode creation returns two AudienceFilter children.
   * ExperimentBranchNode creation returns two regular VariantNode children
   * and one control VariantNode.
   */
  createdChildNodes?: WorkflowNode[];
};

interface CreateWorkflowNodeResponse {
  node: CreatedWorkflowNode;
  workflow: SimplifiedWorkflow;
}

interface AddWorkflowBranchResponse {
  node: WorkflowNodeWithRevision;
  workflow: SimplifiedWorkflow;
}

interface WorkflowMailingListPreview {
  status: "dryRun" | "queuedContactsFound";
  mailingListId: string | null;
  queuedContactCount: number;
}

interface WorkflowMailingListUpdatedResponse {
  status: "updated";
  mailingListId: string | null;
  workflowRevisionId: string;
  queuedContactCount: number;
  workflow: SimplifiedWorkflow;
}

type ChangeWorkflowMailingListResponse =
  | WorkflowMailingListPreview
  | WorkflowMailingListUpdatedResponse;

interface WorkflowQueuedContactDeletePreview {
  status: "dryRun" | "queuedContactsFound";
  nodeIds: string[];
  queuedContactCount: number;
}

interface WorkflowDeletedResponse {
  status: "deleted";
  nodeIds: string[];
  workflowRevisionId: string;
  queuedContactCount: number;
  workflow: SimplifiedWorkflow;
}

type UpdateWorkflowNodeResponse = WorkflowNodeWithRevision & {
  workflow: SimplifiedWorkflow;
};

type RerouteNodeConnectionResponse = WorkflowNodeWithRevision & {
  workflow: SimplifiedWorkflow;
};

type DeleteWorkflowNodeResponse =
  | WorkflowQueuedContactDeletePreview
  | WorkflowDeletedResponse;

type WorkflowContactPropertyComparisonOperator =
  | "any"
  | "contains"
  | "not_contains"
  | "empty"
  | "not_empty"
  | "equal"
  | "not_equal"
  | "greater_than"
  | "less_than"
  | "true"
  | "false"
  | "numeric_equal"
  | "numeric_not_equal"
  | "after"
  | "before"
  | "between";

interface WorkflowContactPropertyComparison {
  value: string | number | boolean;
  operator: WorkflowContactPropertyComparisonOperator;
}

interface WorkflowContactPropertyQuery {
  key: string;
  is: WorkflowContactPropertyComparison;
  was: WorkflowContactPropertyComparison;
}

type UpdateWorkflowNodePayload =
  | { typeName: "SignupTrigger" }
  | {
      typeName?: "EventTrigger";
      eventPatternId?: string | null;
      eventName?: string | null;
      reEligible?: boolean;
    }
  | {
      typeName?: "ContactPropertyTrigger";
      contactPropertyQuery?: WorkflowContactPropertyQuery;
      reEligible?: boolean;
    }
  | {
      typeName?: "AddToListTrigger";
      reEligible?: boolean;
    }
  | {
      audienceSegmentId?: string | null;
      audienceFilter?: AudienceFilter;
      appliesDownstream?: boolean;
    }
  | {
      amount?: number;
      unit?: "m" | "h" | "d";
    }
  | {
      samplingRate?: number;
    }
  | {
      isControl?: boolean;
    };

interface EmailMessagePreviewResponse {
  /** The ID of the email message the preview was sent for. */
  id: string;
}

type GuardianRuleName =
  | "unsupportedContactProperties"
  | "missingFallbackContactProperties"
  | "unsupportedEventProperties"
  | "missingFallbackEventProperties"
  | "unsupportedDataVariables"
  | "invalidCustomDataVariables"
  | "missingRequiredDataVariables"
  | "missingButtonHrefs"
  | "invalidButtonHrefs"
  | "shortenedYouTubeButtonHrefs"
  | "missingLinkHrefs"
  | "invalidLinkHrefs"
  | "shortenedYouTubeLinkHrefs"
  | "shortenedYouTubeImageHrefs"
  | "emailWithoutMailtoButtonHrefs"
  | "emailWithoutMailtoLinkHrefs"
  | "emailWithoutMailtoImageHrefs"
  | "bareArrayNodes"
  | "missingSocialIconHrefs";

interface GuardianRuleItem {
  /** A human-readable label for the item (for example, link text or a property name). */
  label: string;
  /**
   * Machine-readable identifier when the rule refers to a property or variable.
   */
  codeName?: string;
}

interface GuardianRule {
  /** The identifier of the Guardian rule that fired. */
  rule: GuardianRuleName;
  /** A short summary of the rule. */
  title: string;
  /** A longer explanation of why the issue matters. */
  description: string;
  /** The specific elements that triggered the rule. */
  items: GuardianRuleItem[];
}

interface EmailMessageGuardianResponse {
  /** Validation errors. These must be resolved before the email can be published. */
  errors: GuardianRule[];
  /** Validation warnings. These are advisory and do not block publishing. */
  warnings: GuardianRule[];
}

interface ListTransactionalsResourceResponse {
  pagination: PaginationData;
  data: TransactionalEmailResource[];
}

interface CreateUploadResponse {
  /**
   * The ID of the created asset.
   * Pass this to `completeUpload()` once the file has been uploaded.
   */
  emailAssetId: string;
  /**
   * The pre-signed URL to upload the file to with an HTTP `PUT` request.
   * Send the same `Content-Type` and `Content-Length` used in the create request.
   */
  presignedUrl: string;
}

interface CompleteUploadResponse {
  emailAssetId: string;
  /** The public URL of the uploaded asset. */
  finalUrl: string;
}

interface ThemeStyles {
  backgroundColor?: string;
  backgroundXPadding?: number;
  backgroundYPadding?: number;
  bodyColor?: string;
  bodyXPadding?: number;
  bodyYPadding?: number;
  bodyFontFamily?: string;
  bodyFontCategory?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  buttonBodyColor?: string;
  buttonBodyXPadding?: number;
  buttonBodyYPadding?: number;
  buttonBorderColor?: string;
  buttonBorderWidth?: number;
  buttonBorderRadius?: number;
  buttonTextColor?: string;
  buttonTextFormat?: number;
  buttonTextFontSize?: number;
  dividerColor?: string;
  dividerBorderWidth?: number;
  textBaseColor?: string;
  textBaseFontSize?: number;
  textBaseLineHeight?: number;
  textBaseLetterSpacing?: number;
  textLinkColor?: string;
  heading1Color?: string;
  heading1FontSize?: number;
  heading1LineHeight?: number;
  heading1LetterSpacing?: number;
  heading2Color?: string;
  heading2FontSize?: number;
  heading2LineHeight?: number;
  heading2LetterSpacing?: number;
  heading3Color?: string;
  heading3FontSize?: number;
  heading3LineHeight?: number;
  heading3LetterSpacing?: number;
}

interface Theme {
  id: string;
  name: string;
  styles: ThemeStyles;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListThemesResponse {
  pagination: PaginationData;
  data: Theme[];
}

type ThemeResponse = Theme;

interface UpdateThemeResponse extends ThemeResponse {
  /**
   * The number of emails using this theme that are affected by the style change.
   * `0` when only the name changed.
   */
  affectedEmailCount: number;
}

interface Component {
  id: string;
  name: string;
  lmx: string;
}

interface ListComponentsResponse {
  pagination: PaginationData;
  data: Component[];
}

type ComponentResponse = Component;

interface UpdateComponentResponse extends ComponentResponse {
  /**
   * The number of emails using this component that were updated by the body change.
   * `0` when only the name changed.
   */
  affectedEmailCount: number;
}

interface Campaign {
  id: string;
  name: string;
  status: "Draft" | "Scheduled" | "Sending" | "Sent";
  createdAt: string;
  updatedAt: string;
  emailMessageId: string | null;
  campaignGroupId: string | null;
  mailingListId: string | null;
  audienceSegmentId: string | null;
  audienceFilter: AudienceFilter | null;
  scheduling: CampaignScheduling;
}

interface ListCampaignsResponse {
  pagination: PaginationData;
  data: Campaign[];
}

interface CreateCampaignResponse extends Campaign {
  emailMessageContentRevisionId: string | null;
}

type CampaignResponse = Campaign;

type CampaignListItem = Campaign;

interface EmailMessageWarning {
  rule: string;
  severity: "warning";
  message: string;
  path?: string;
}

interface EmailMessageResponse {
  id: string;
  /** Present only when the message belongs to a campaign. */
  campaignId?: string;
  /** Present only when the message belongs to a transactional email. */
  transactionalId?: string;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  ccEmail?: string;
  bccEmail?: string;
  languageCode?: string;
  emailFormat: "styled" | "plain";
  lmx: string;
  contentRevisionId: string | null;
  updatedAt: string;
  contactPropertiesFallbacks?: Record<string, string>;
  eventPropertiesFallbacks?: Record<string, string>;
  dataVariablesFallbacks?: Record<string, string>;
  warnings?: EmailMessageWarning[];
}

class RateLimitExceededError extends Error {
  limit: number;
  remaining: number;
  constructor(limit: number, remaining: number) {
    super(`Rate limit of ${limit} requests per second exceeded.`);
    this.name = "RateLimitExceededError";
    this.limit = limit;
    this.remaining = remaining;
  }
}

class APIError extends Error {
  statusCode: number;
  json:
    | ErrorResponse
    | TransactionalError
    | TransactionalNestedError
    | ApiKeyErrorResponse
    | null;
  rawBody?: string;
  constructor(
    statusCode: number,
    json:
      | ErrorResponse
      | TransactionalError
      | TransactionalNestedError
      | ApiKeyErrorResponse
      | null,
    rawBody?: string
  ) {
    let message: string | undefined;
    if (json !== null) {
      if (
        "error" in json &&
        typeof json.error === "object" &&
        json.error?.message
      ) {
        message = json.error.message;
      } else if ("error" in json && typeof json.error === "string") {
        message = json.error;
      } else if ("message" in json && typeof json.message === "string") {
        message = json.message;
      }
    }
    super(`${statusCode}${message ? ` - ${message}` : ""}`);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.json = json;
    this.rawBody = rawBody;

    // This captures the proper stack trace in most environments
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, APIError);
    }
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class LoopsClient {
  apiKey: string;
  apiRoot = "https://app.loops.so/api/";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
  }

  /**
   * Creates and sends a query to the Loops API.
   *
   * @param {Object} params
   * @param {string} params.path Endpoint path
   * @param {string} params.method HTTP method
   * @param {Object} params.headers Additional headers to send with the request
   * @param {Object} params.payload Payload for PUT and POST requests
   * @param {Object} params.params URL query parameters
   */
  private async _makeQuery<T>({
    path,
    method = "GET",
    headers,
    payload,
    params,
  }: QueryOptions): Promise<T> {
    const h = new Headers();
    h.set("Authorization", `Bearer ${this.apiKey}`);
    h.set("Content-Type", "application/json");

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          h.set(key, value as string);
        }
      });
    }

    const url = new URL(path, this.apiRoot);
    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, value as string)
      );
    }

    const response = await fetch(url.href, {
      method,
      headers: h,
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (response.status === 429) {
      const limit = parseInt(
        response.headers.get("x-ratelimit-limit") || "10",
        10
      );
      const remaining = parseInt(
        response.headers.get("x-ratelimit-remaining") || "10",
        10
      );
      throw new RateLimitExceededError(limit, remaining);
    }

    const text = await response.text();
    let json = null;

    try {
      json = JSON.parse(text);
    } catch {
      // JSON parsing failed
    }

    // All other status codes from API, throw an error
    if (!response.ok) {
      throw new APIError(response.status, json, json === null ? text : undefined);
    }

    if (json === null) {
      throw new APIError(response.status, null, text);
    }

    return json;
  }

  /**
   * Test an API key.
   *
   * @see https://loops.so/docs/api-reference/api-key
   *
   * @returns {Object} Success response (JSON)
   */
  async testApiKey(): Promise<ApiKeySuccessResponse> {
    return this._makeQuery({
      path: "v1/api-key",
    });
  }

  /**
   * Create a new contact.
   *
   * @param {Object} params
   * @param {string} params.email The email address of the contact.
   * @param {Object} [params.properties] All other contact properties, including custom properties.
   * @param {Object} [params.mailingLists] An object of mailing list IDs and boolean subscription statuses.
   *
   * @see https://loops.so/docs/api-reference/create-contact
   *
   * @returns {Object} Contact record (JSON)
   */
  async createContact({
    email,
    properties,
    mailingLists,
  }: {
    email: string;
    properties?: ContactProperties;
    mailingLists?: MailingLists;
  }): Promise<ContactSuccessResponse> {
    const payload = { ...properties, mailingLists } as {
      email?: string;
      mailingLists?: MailingLists;
    } & ContactProperties;
    payload["email"] = email;
    return this._makeQuery({
      path: "v1/contacts/create",
      method: "POST",
      payload,
    });
  }

  /**
   * Update a contact.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   * @param {Object} [params.properties] All other contact properties, including custom properties.
   * @param {Object} [params.mailingLists] An object of mailing list IDs and boolean subscription statuses.
   *
   * @see https://loops.so/docs/api-reference/update-contact
   *
   * @returns {Object} Contact record (JSON)
   */
  async updateContact({
    email,
    userId,
    properties,
    mailingLists,
  }: {
    email?: string;
    userId?: string;
    properties?: ContactProperties;
    mailingLists?: MailingLists;
  }): Promise<ContactSuccessResponse> {
    if (!userId && !email)
      throw new ValidationError(
        "You must provide an `email` or `userId` value."
      );
    const payload = {
      ...properties,
      mailingLists,
    } as {
      email?: string;
      userId?: string;
      mailingLists?: MailingLists;
    } & ContactProperties;
    if (email) payload["email"] = email;
    if (userId) payload["userId"] = userId;
    return this._makeQuery({
      path: "v1/contacts/update",
      method: "PUT",
      payload,
    });
  }

  /**
   * Find a contact by email address or user ID.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   *
   * @see https://loops.so/docs/api-reference/find-contact
   *
   * @returns {Object} List of contact records (JSON)
   */
  async findContact({
    email,
    userId,
  }: {
    email?: string;
    userId?: string;
  }): Promise<Contact[]> {
    if (email && userId)
      throw new ValidationError("Only one parameter is permitted.");
    if (!email && !userId)
      throw new ValidationError(
        "You must provide an `email` or `userId` value."
      );
    const params: { email?: string; userId?: string } = {};
    if (email) params["email"] = email;
    else if (userId) params["userId"] = userId;
    return this._makeQuery({
      path: "v1/contacts/find",
      params,
    });
  }

  /**
   * Delete a contact by email or user ID.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   *
   * @see https://loops.so/docs/api-reference/delete-contact
   *
   * @returns {Object} Confirmation (JSON)
   */
  async deleteContact({
    email,
    userId,
  }: {
    email?: string;
    userId?: string;
  }): Promise<DeleteSuccessResponse> {
    if (email && userId)
      throw new ValidationError("Only one parameter is permitted.");
    if (!email && !userId)
      throw new ValidationError(
        "You must provide an `email` or `userId` value."
      );
    const payload: { email?: string; userId?: string } = {};
    if (email) payload["email"] = email;
    else if (userId) payload["userId"] = userId;
    return this._makeQuery({
      path: "v1/contacts/delete",
      method: "POST",
      payload,
    });
  }

  /**
   * Check whether a contact is suppressed by email or user ID.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   *
   * @see https://loops.so/docs/api-reference/check-contact-suppression
   *
   * @returns {Object} Suppression status and removal quota (JSON)
   */
  async checkContactSuppression({
    email,
    userId,
  }: {
    email?: string;
    userId?: string;
  }): Promise<CheckContactSuppressionSuccessResponse> {
    if (email && userId)
      throw new ValidationError("Only one parameter is permitted.");
    if (!email && !userId)
      throw new ValidationError(
        "You must provide an `email` or `userId` value."
      );
    const params: { email?: string; userId?: string } = {};
    if (email) params["email"] = email;
    else if (userId) params["userId"] = userId;
    return this._makeQuery({
      path: "v1/contacts/suppression",
      params,
    });
  }

  /**
   * Remove suppression for a contact by email or user ID.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   *
   * @see https://loops.so/docs/api-reference/remove-contact-suppression
   *
   * @returns {Object} Confirmation and remaining removal quota (JSON)
   */
  async removeContactSuppression({
    email,
    userId,
  }: {
    email?: string;
    userId?: string;
  }): Promise<RemoveContactSuppressionSuccessResponse> {
    if (email && userId)
      throw new ValidationError("Only one parameter is permitted.");
    if (!email && !userId)
      throw new ValidationError(
        "You must provide an `email` or `userId` value."
      );
    const params: { email?: string; userId?: string } = {};
    if (email) params["email"] = email;
    else if (userId) params["userId"] = userId;
    return this._makeQuery({
      path: "v1/contacts/suppression",
      method: "DELETE",
      params,
    });
  }

  /**
   * Create a new contact property.
   *
   * @param {string} name The name of the property. Should be in camelCase like "planName".
   * @param {"string" | "number" | "boolean" | "date"} type The property's value type.
   *
   * @see https://loops.so/docs/api-reference/create-contact-property
   *
   * @returns {Object} Contact property record (JSON)
   */
  async createContactProperty(
    name: string,
    type: "string" | "number" | "boolean" | "date"
  ): Promise<ContactPropertySuccessResponse> {
    return this._makeQuery({
      path: "v1/contacts/properties",
      method: "POST",
      payload: {
        name,
        type,
      },
    });
  }

  /**
   * List contact properties.
   *
   * @param {"all" | "custom"} [list] Return all or just custom properties.
   *
   * @see https://loops.so/docs/api-reference/list-contact-properties
   *
   * @returns {Object} List of contact properties (JSON)
   */
  async listContactProperties(
    list?: "all" | "custom"
  ): Promise<ContactProperty[]> {
    return this._makeQuery({
      path: "v1/contacts/properties",
      params: { list: list || "all" },
    });
  }

  /**
   * List mailing lists.
   *
   * @see https://loops.so/docs/api-reference/list-mailing-lists
   *
   * @returns {Object} List of mailing lists (JSON)
   */
  async listMailingLists(): Promise<MailingList[]> {
    return this._makeQuery({
      path: "v1/lists",
    });
  }

  /**
   * Send an event.
   *
   * @param {Object} params
   * @param {string} [params.email] The email address of the contact.
   * @param {string} [params.userId] The user ID of the contact.
   * @param {string} params.eventName The name of the event.
   * @param {Object} [params.contactProperties] Properties to update the contact with, including custom properties.
   * @param {Object} [params.eventProperties] Event properties, made available in emails triggered by the event.
   * @param {Object} [params.mailingLists] An object of mailing list IDs and boolean subscription statuses.
   * @param {Object} [params.headers] Additional headers to send with the request.
   *
   * @see https://loops.so/docs/api-reference/send-event
   *
   * @returns {Object} Response (JSON)
   */
  async sendEvent({
    email,
    userId,
    eventName,
    contactProperties,
    eventProperties,
    mailingLists,
    headers,
  }: {
    email?: string;
    userId?: string;
    eventName: string;
    contactProperties?: ContactProperties;
    eventProperties?: EventProperties;
    mailingLists?: MailingLists;
    headers?: Record<string, string>;
  }): Promise<EventSuccessResponse> {
    if (!userId && !email)
      throw new ValidationError(
        "You must provide an `email` or `userId` value."
      );
    const payload: {
      email?: string;
      userId?: string;
      eventName: string;
      eventProperties?: EventProperties;
      mailingLists?: MailingLists;
    } = {
      eventName,
      ...contactProperties,
      eventProperties,
      mailingLists,
    };
    if (email) payload["email"] = email;
    if (userId) payload["userId"] = userId;
    return this._makeQuery({
      path: "v1/events/send",
      method: "POST",
      headers,
      payload,
    });
  }

  /**
   * Send a transactional email.
   *
   * @param {Object} params
   * @param {string} params.transactionalId The ID of the transactional email to send.
   * @param {string} params.email The email address of the recipient.
   * @param {boolean} [params.addToAudience] Create a contact in your audience using the provided email address (if one doesn't already exist).
   * @param {Object} [params.dataVariables] Data variables as defined by the transational email template.
   * @param {Object[]} [params.attachments] File(s) to be sent along with the email message.
   * @param {Object} [params.headers] Additional headers to send with the request.
   *
   * @see https://loops.so/docs/api-reference/send-transactional-email
   *
   * @returns {Object} Confirmation (JSON)
   */
  async sendTransactionalEmail({
    transactionalId,
    email,
    addToAudience,
    dataVariables,
    attachments,
    headers,
  }: {
    transactionalId: string;
    email: string;
    addToAudience?: boolean;
    dataVariables?: TransactionalVariables;
    attachments?: Array<TransactionalAttachment>;
    headers?: Record<string, string>;
  }): Promise<TransactionalSuccess> {
    const payload = {
      transactionalId,
      email,
      addToAudience,
      dataVariables,
      attachments,
    };
    return this._makeQuery({
      path: "v1/transactional",
      method: "POST",
      headers,
      payload,
    });
  }

  /**
   * List transactional emails.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response.
   *
   * @see https://loops.so/docs/api-reference/list-transactional-emails
   *
   * @returns {Object} List of transactional emails (JSON)
   */
  async listTransactionalEmails({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListTransactionalsResourceResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/transactional-emails",
      params,
    });
  }

  /**
   * Get a transactional email by ID.
   *
   * @param {string} transactionalId The ID of the transactional email.
   *
   * @see https://loops.so/docs/api-reference/get-transactional-email
   *
   * @returns {Object} Transactional email (JSON)
   */
  async getTransactionalEmail(
    transactionalId: string
  ): Promise<TransactionalEmailResource> {
    return this._makeQuery({
      path: `v1/transactional-emails/${transactionalId}`,
    });
  }

  /**
   * Create a transactional email.
   *
   * @param {Object} params
   * @param {string} params.name The name of the transactional email.
   * @param {string} [params.transactionalGroupId] The ID of the group to add this transactional email to.
   *
   * @see https://loops.so/docs/api-reference/create-transactional-email
   *
   * @returns {Object} Created transactional email with draft (JSON)
   */
  async createTransactionalEmail({
    name,
    transactionalGroupId,
  }: {
    name: string;
    transactionalGroupId?: string;
  }): Promise<TransactionalDraftResponse> {
    const payload: { name: string; transactionalGroupId?: string } = { name };
    if (transactionalGroupId !== undefined) {
      payload.transactionalGroupId = transactionalGroupId;
    }
    return this._makeQuery({
      path: "v1/transactional-emails",
      method: "POST",
      payload,
    });
  }

  /**
   * Update a transactional email.
   *
   * @param {string} transactionalId The ID of the transactional email.
   * @param {Object} params
   * @param {string} [params.name] The name of the transactional email.
   * @param {string} [params.transactionalGroupId] The ID of the group to move this transactional email to.
   *
   * @see https://loops.so/docs/api-reference/update-transactional-email
   *
   * @returns {Object} Updated transactional email (JSON)
   */
  async updateTransactionalEmail(
    transactionalId: string,
    {
      name,
      transactionalGroupId,
    }: {
      name?: string;
      transactionalGroupId?: string;
    }
  ): Promise<TransactionalEmailResource> {
    const payload: { name?: string; transactionalGroupId?: string } = {};
    if (name !== undefined) payload.name = name;
    if (transactionalGroupId !== undefined) {
      payload.transactionalGroupId = transactionalGroupId;
    }
    return this._makeQuery({
      path: `v1/transactional-emails/${transactionalId}`,
      method: "POST",
      payload,
    });
  }

  /**
   * Ensure a transactional email has a draft email message.
   *
   * @param {string} transactionalId The ID of the transactional email.
   *
   * @see https://loops.so/docs/api-reference/ensure-transactional-draft
   *
   * @returns {Object} Transactional email with draft (JSON)
   */
  async ensureTransactionalEmailDraft(
    transactionalId: string
  ): Promise<TransactionalDraftResponse> {
    return this._makeQuery({
      path: `v1/transactional-emails/${transactionalId}/draft`,
      method: "POST",
    });
  }

  /**
   * Publish a transactional email draft.
   *
   * @param {string} transactionalId The ID of the transactional email.
   *
   * @see https://loops.so/docs/api-reference/publish-transactional-email
   *
   * @returns {Object} Published transactional email (JSON)
   */
  async publishTransactionalEmail(
    transactionalId: string
  ): Promise<TransactionalEmailResource> {
    return this._makeQuery({
      path: `v1/transactional-emails/${transactionalId}/publish`,
      method: "POST",
    });
  }

  /**
   * List dedicated sending IP addresses.
   *
   * @see https://loops.so/docs/api-reference/dedicated-sending-ips
   *
   * @returns {string[]} List of IP addresses
   */
  async listDedicatedSendingIps(): Promise<string[]> {
    return this._makeQuery({
      path: "v1/dedicated-sending-ips",
    });
  }

  /**
   * List audience segments.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response.
   *
   * @see https://loops.so/docs/api-reference/list-audience-segments
   *
   * @returns {Object} List of audience segments (JSON)
   */
  async listAudienceSegments({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListAudienceSegmentsResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/audience-segments",
      params,
    });
  }

  /**
   * Get an audience segment by ID.
   *
   * @param {string} audienceSegmentId The ID of the audience segment.
   *
   * @see https://loops.so/docs/api-reference/get-audience-segment
   *
   * @returns {Object} Audience segment (JSON)
   */
  async getAudienceSegment(
    audienceSegmentId: string
  ): Promise<AudienceSegment> {
    return this._makeQuery({
      path: `v1/audience-segments/${audienceSegmentId}`,
    });
  }

  /**
   * Create an audience segment.
   *
   * @param {Object} params
   * @param {string} params.name The name of the audience segment. Must be unique within the team.
   * @param {string} [params.description] An optional description of the audience segment.
   * @param {AudienceFilter} params.filter A tree of audience conditions combined with `match`.
   *
   * @see https://loops.so/docs/api-reference/create-audience-segment
   *
   * @returns {Object} Created audience segment (JSON)
   */
  async createAudienceSegment({
    name,
    description,
    filter,
  }: {
    name: string;
    description?: string;
    filter: AudienceFilter;
  }): Promise<AudienceSegment> {
    const payload: {
      name: string;
      description?: string;
      filter: AudienceFilter;
    } = { name, filter };
    if (description !== undefined) payload.description = description;
    return this._makeQuery({
      path: "v1/audience-segments",
      method: "POST",
      payload,
    });
  }

  /**
   * List email themes.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response.
   *
   * @see https://loops.so/docs/api-reference/list-themes
   *
   * @returns {Object} List of themes (JSON)
   */
  async listThemes({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListThemesResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/themes",
      params,
    });
  }

  /**
   * Get a theme by ID.
   *
   * @param {string} themeId The ID of the theme.
   *
   * @see https://loops.so/docs/api-reference/get-theme
   *
   * @returns {Object} Theme (JSON)
   */
  async getTheme(themeId: string): Promise<ThemeResponse> {
    return this._makeQuery({
      path: `v1/themes/${themeId}`,
    });
  }

  /**
   * Create a theme.
   *
   * @param {Object} params
   * @param {string} params.name The theme name.
   * @param {ThemeStyles} [params.styles] Style attributes for the theme.
   *
   * @see https://loops.so/docs/api-reference/create-theme
   *
   * @returns {Object} Created theme (JSON)
   */
  async createTheme({
    name,
    styles,
  }: {
    name: string;
    styles?: ThemeStyles;
  }): Promise<ThemeResponse> {
    const payload: { name: string; styles?: ThemeStyles } = { name };
    if (styles !== undefined) payload.styles = styles;
    return this._makeQuery({
      path: "v1/themes",
      method: "POST",
      payload,
    });
  }

  /**
   * Update a theme's name and/or styles.
   *
   * When `styles` change, the update cascades to every email using this theme.
   * `affectedEmailCount` in the response reports how many emails were affected.
   *
   * @param {string} themeId The ID of the theme.
   * @param {Object} params
   * @param {string} [params.name] The theme name.
   * @param {ThemeStyles} [params.styles] Style attributes for the theme.
   *
   * @see https://loops.so/docs/api-reference/update-theme
   *
   * @returns {Object} Updated theme (JSON)
   */
  async updateTheme(
    themeId: string,
    {
      name,
      styles,
    }: {
      name?: string;
      styles?: ThemeStyles;
    }
  ): Promise<UpdateThemeResponse> {
    const payload: { name?: string; styles?: ThemeStyles } = {};
    if (name !== undefined) payload.name = name;
    if (styles !== undefined) payload.styles = styles;
    return this._makeQuery({
      path: `v1/themes/${themeId}`,
      method: "POST",
      payload,
    });
  }

  /**
   * List email components.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response.
   *
   * @see https://loops.so/docs/api-reference/list-components
   *
   * @returns {Object} List of components (JSON)
   */
  async listComponents({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListComponentsResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/components",
      params,
    });
  }

  /**
   * Get a component by ID.
   *
   * @param {string} componentId The ID of the component.
   *
   * @see https://loops.so/docs/api-reference/get-component
   *
   * @returns {Object} Component (JSON)
   */
  async getComponent(componentId: string): Promise<ComponentResponse> {
    return this._makeQuery({
      path: `v1/components/${componentId}`,
    });
  }

  /**
   * Create a component.
   *
   * @param {Object} params
   * @param {string} params.name The component name.
   * @param {string} params.lmx The component body as an LMX string.
   *
   * @see https://loops.so/docs/api-reference/create-component
   *
   * @returns {Object} Created component (JSON)
   */
  async createComponent({
    name,
    lmx,
  }: {
    name: string;
    lmx: string;
  }): Promise<ComponentResponse> {
    return this._makeQuery({
      path: "v1/components",
      method: "POST",
      payload: { name, lmx },
    });
  }

  /**
   * Update a component's name and/or LMX body.
   *
   * When `lmx` changes, the update cascades to every email using this component.
   * `affectedEmailCount` in the response reports how many were affected.
   *
   * @param {string} componentId The ID of the component.
   * @param {Object} params
   * @param {string} [params.name] The component name.
   * @param {string} [params.lmx] The component body as an LMX string.
   *
   * @see https://loops.so/docs/api-reference/update-component
   *
   * @returns {Object} Updated component (JSON)
   */
  async updateComponent(
    componentId: string,
    {
      name,
      lmx,
    }: {
      name?: string;
      lmx?: string;
    }
  ): Promise<UpdateComponentResponse> {
    const payload: { name?: string; lmx?: string } = {};
    if (name !== undefined) payload.name = name;
    if (lmx !== undefined) payload.lmx = lmx;
    return this._makeQuery({
      path: `v1/components/${componentId}`,
      method: "POST",
      payload,
    });
  }

  /**
   * List campaigns.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results. Cursors can be found from the `pagination.nextCursor` value in each response.
   *
   * @see https://loops.so/docs/api-reference/list-campaigns
   *
   * @returns {Object} List of campaigns (JSON)
   */
  async listCampaigns({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListCampaignsResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/campaigns",
      params,
    });
  }

  /**
   * Create a draft campaign.
   *
   * @param {Object} params
   * @param {string} params.name The campaign name.
   * @param {string} [params.campaignGroupId] The ID of the group to add this campaign to.
   * @param {string | null} [params.mailingListId] The ID of the mailing list to send to.
   * @param {string | null} [params.audienceSegmentId] The ID of an audience segment.
   * @param {AudienceFilter | null} [params.audienceFilter] An audience filter.
   * @param {CampaignSchedulingRequest} [params.scheduling] When the campaign should send.
   *
   * @see https://loops.so/docs/api-reference/create-campaign
   *
   * @returns {Object} Created campaign (JSON)
   */
  async createCampaign({
    name,
    campaignGroupId,
    mailingListId,
    audienceSegmentId,
    audienceFilter,
    scheduling,
  }: {
    name: string;
    campaignGroupId?: string;
    mailingListId?: string | null;
    audienceSegmentId?: string | null;
    audienceFilter?: AudienceFilter | null;
    scheduling?: CampaignSchedulingRequest;
  }): Promise<CreateCampaignResponse> {
    const payload: {
      name: string;
      campaignGroupId?: string;
      mailingListId?: string | null;
      audienceSegmentId?: string | null;
      audienceFilter?: AudienceFilter | null;
      scheduling?: CampaignSchedulingRequest;
    } = { name };
    if (campaignGroupId !== undefined) payload.campaignGroupId = campaignGroupId;
    if (mailingListId !== undefined) payload.mailingListId = mailingListId;
    if (audienceSegmentId !== undefined) {
      payload.audienceSegmentId = audienceSegmentId;
    }
    if (audienceFilter !== undefined) payload.audienceFilter = audienceFilter;
    if (scheduling !== undefined) payload.scheduling = scheduling;
    return this._makeQuery({
      path: "v1/campaigns",
      method: "POST",
      payload,
    });
  }

  /**
   * Get a campaign by ID.
   *
   * @param {string} campaignId The ID of the campaign.
   *
   * @see https://loops.so/docs/api-reference/get-campaign
   *
   * @returns {Object} Campaign (JSON)
   */
  async getCampaign(campaignId: string): Promise<CampaignResponse> {
    return this._makeQuery({
      path: `v1/campaigns/${campaignId}`,
    });
  }

  /**
   * Update a draft campaign.
   *
   * @param {string} campaignId The ID of the campaign.
   * @param {Object} params
   * @param {string} [params.name] The campaign name.
   * @param {string} [params.campaignGroupId] The ID of the group to move this campaign to.
   * @param {string | null} [params.mailingListId] The ID of the mailing list to send to.
   * @param {string | null} [params.audienceSegmentId] The ID of an audience segment.
   * @param {AudienceFilter | null} [params.audienceFilter] An audience filter.
   * @param {CampaignSchedulingRequest} [params.scheduling] When the campaign should send.
   *
   * @see https://loops.so/docs/api-reference/update-campaign
   *
   * @returns {Object} Updated campaign (JSON)
   */
  async updateCampaign(
    campaignId: string,
    {
      name,
      campaignGroupId,
      mailingListId,
      audienceSegmentId,
      audienceFilter,
      scheduling,
    }: {
      name?: string;
      campaignGroupId?: string;
      mailingListId?: string | null;
      audienceSegmentId?: string | null;
      audienceFilter?: AudienceFilter | null;
      scheduling?: CampaignSchedulingRequest;
    }
  ): Promise<CampaignResponse> {
    const payload: {
      name?: string;
      campaignGroupId?: string;
      mailingListId?: string | null;
      audienceSegmentId?: string | null;
      audienceFilter?: AudienceFilter | null;
      scheduling?: CampaignSchedulingRequest;
    } = {};
    if (name !== undefined) payload.name = name;
    if (campaignGroupId !== undefined) payload.campaignGroupId = campaignGroupId;
    if (mailingListId !== undefined) payload.mailingListId = mailingListId;
    if (audienceSegmentId !== undefined) {
      payload.audienceSegmentId = audienceSegmentId;
    }
    if (audienceFilter !== undefined) payload.audienceFilter = audienceFilter;
    if (scheduling !== undefined) payload.scheduling = scheduling;
    return this._makeQuery({
      path: `v1/campaigns/${campaignId}`,
      method: "POST",
      payload,
    });
  }

  /**
   * Get an email message by ID.
   *
   * @param {string} emailMessageId The ID of the email message.
   *
   * @see https://loops.so/docs/api-reference/get-email-message
   *
   * @returns {Object} Email message (JSON)
   */
  async getEmailMessage(emailMessageId: string): Promise<EmailMessageResponse> {
    return this._makeQuery({
      path: `v1/email-messages/${emailMessageId}`,
    });
  }

  /**
   * Update an email message.
   *
   * @param {string} emailMessageId The ID of the email message.
   * @param {Object} params
   * @param {string} [params.expectedRevisionId] The `contentRevisionId` you last fetched. Used for optimistic concurrency.
   * @param {string} [params.subject] The email subject.
   * @param {string} [params.previewText] The email preview text.
   * @param {string} [params.fromName] The sender name.
   * @param {string} [params.fromEmail] The sender username (without `@` or domain).
   * @param {string} [params.replyToEmail] Reply-to email. Must be empty or a valid email address.
   * @param {string} [params.ccEmail] CC email address.
   * @param {string} [params.bccEmail] BCC email address.
   * @param {string} [params.languageCode] Language code for the email.
   * @param {"styled" | "plain"} [params.emailFormat] The rendering format of the email.
   * @param {string} [params.lmx] The email body serialized as LMX.
   * @param {Record<string, string | null>} [params.contactPropertiesFallbacks] Fallback values for contact properties.
   * @param {Record<string, string | null>} [params.eventPropertiesFallbacks] Fallback values for event properties.
   * @param {Record<string, string | null>} [params.dataVariablesFallbacks] Fallback values for data variables.
   *
   * @see https://loops.so/docs/api-reference/update-email-message
   *
   * @returns {Object} Updated email message (JSON)
   */
  async updateEmailMessage(
    emailMessageId: string,
    {
      expectedRevisionId,
      subject,
      previewText,
      fromName,
      fromEmail,
      replyToEmail,
      ccEmail,
      bccEmail,
      languageCode,
      emailFormat,
      lmx,
      contactPropertiesFallbacks,
      eventPropertiesFallbacks,
      dataVariablesFallbacks,
    }: {
      expectedRevisionId?: string;
      subject?: string;
      previewText?: string;
      fromName?: string;
      fromEmail?: string;
      replyToEmail?: string;
      ccEmail?: string;
      bccEmail?: string;
      languageCode?: string;
      emailFormat?: "styled" | "plain";
      lmx?: string;
      contactPropertiesFallbacks?: Record<string, string | null>;
      eventPropertiesFallbacks?: Record<string, string | null>;
      dataVariablesFallbacks?: Record<string, string | null>;
    }
  ): Promise<EmailMessageResponse> {
    const payload: {
      expectedRevisionId?: string;
      subject?: string;
      previewText?: string;
      fromName?: string;
      fromEmail?: string;
      replyToEmail?: string;
      ccEmail?: string;
      bccEmail?: string;
      languageCode?: string;
      emailFormat?: "styled" | "plain";
      lmx?: string;
      contactPropertiesFallbacks?: Record<string, string | null>;
      eventPropertiesFallbacks?: Record<string, string | null>;
      dataVariablesFallbacks?: Record<string, string | null>;
    } = {};
    if (expectedRevisionId !== undefined)
      payload.expectedRevisionId = expectedRevisionId;
    if (subject !== undefined) payload.subject = subject;
    if (previewText !== undefined) payload.previewText = previewText;
    if (fromName !== undefined) payload.fromName = fromName;
    if (fromEmail !== undefined) payload.fromEmail = fromEmail;
    if (replyToEmail !== undefined) payload.replyToEmail = replyToEmail;
    if (ccEmail !== undefined) payload.ccEmail = ccEmail;
    if (bccEmail !== undefined) payload.bccEmail = bccEmail;
    if (languageCode !== undefined) payload.languageCode = languageCode;
    if (emailFormat !== undefined) payload.emailFormat = emailFormat;
    if (lmx !== undefined) payload.lmx = lmx;
    if (contactPropertiesFallbacks !== undefined) {
      payload.contactPropertiesFallbacks = contactPropertiesFallbacks;
    }
    if (eventPropertiesFallbacks !== undefined) {
      payload.eventPropertiesFallbacks = eventPropertiesFallbacks;
    }
    if (dataVariablesFallbacks !== undefined) {
      payload.dataVariablesFallbacks = dataVariablesFallbacks;
    }
    return this._makeQuery({
      path: `v1/email-messages/${emailMessageId}`,
      method: "POST",
      payload,
    });
  }

  /**
   * Send a preview of an email message.
   *
   * @param {string} emailMessageId The ID of the email message.
   * @param {Object} params
   * @param {string[]} params.emails One or more addresses to send the preview to.
   * @param {Record<string, string>} [params.contactProperties] Contact property values to render.
   * @param {Record<string, string>} [params.eventProperties] Event property values to render.
   * @param {Record<string, unknown>} [params.dataVariables] Transactional data variables to render.
   *
   * @see https://loops.so/docs/api-reference/preview-email-message
   *
   * @returns {Object} Preview confirmation (JSON)
   */
  async sendEmailMessagePreview(
    emailMessageId: string,
    {
      emails,
      contactProperties,
      eventProperties,
      dataVariables,
    }: {
      emails: string[];
      contactProperties?: Record<string, string>;
      eventProperties?: Record<string, string>;
      dataVariables?: Record<string, unknown>;
    }
  ): Promise<EmailMessagePreviewResponse> {
    const payload: {
      emails: string[];
      contactProperties?: Record<string, string>;
      eventProperties?: Record<string, string>;
      dataVariables?: Record<string, unknown>;
    } = { emails };
    if (contactProperties !== undefined) {
      payload.contactProperties = contactProperties;
    }
    if (eventProperties !== undefined) {
      payload.eventProperties = eventProperties;
    }
    if (dataVariables !== undefined) payload.dataVariables = dataVariables;
    return this._makeQuery({
      path: `v1/email-messages/${emailMessageId}/preview`,
      method: "POST",
      payload,
    });
  }

  /**
   * Run Guardian checks on an email message.
   *
   * Validates content against Guardian rules and returns errors and warnings.
   * Errors must be resolved before the email can be published; warnings are advisory.
   *
   * @param {string} emailMessageId The ID of the email message.
   *
   * @see https://loops.so/docs/api-reference/run-guardian-checks
   *
   * @returns {Object} Guardian errors and warnings (JSON)
   */
  async runEmailMessageGuardian(
    emailMessageId: string
  ): Promise<EmailMessageGuardianResponse> {
    return this._makeQuery({
      path: `v1/email-messages/${emailMessageId}/guardian`,
    });
  }

  /**
   * List event patterns available to workflow event trigger nodes.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results.
   *
   * @see https://loops.so/docs/api-reference/list-event-patterns
   *
   * @returns {Object} List of event patterns (JSON)
   */
  async listEventPatterns({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListEventPatternsResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/event-patterns",
      params,
    });
  }

  /**
   * Get an event pattern by ID.
   *
   * @param {string} eventPatternId The ID of the event pattern.
   *
   * @see https://loops.so/docs/api-reference/get-event-pattern
   *
   * @returns {Object} Event pattern (JSON)
   */
  async getEventPattern(eventPatternId: string): Promise<EventPattern> {
    return this._makeQuery({
      path: `v1/event-patterns/${eventPatternId}`,
    });
  }

  /**
   * Get an event pattern by event name.
   *
   * @param {string} eventName The name of the event pattern.
   *
   * @see https://loops.so/docs/api-reference/get-event-pattern-by-name
   *
   * @returns {Object} Event pattern (JSON)
   */
  async getEventPatternByName(eventName: string): Promise<EventPattern> {
    return this._makeQuery({
      path: `v1/event-patterns/by-name/${encodeURIComponent(eventName)}`,
    });
  }

  /**
   * List workflows.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results.
   *
   * @see https://loops.so/docs/api-reference/list-workflows
   *
   * @returns {Object} List of workflows (JSON)
   */
  async listWorkflows({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListWorkflowsResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/workflows",
      params,
    });
  }

  /**
   * Create a draft workflow with a blank trigger and exit node.
   *
   * @param {Object} params
   * @param {string} params.name The name of the workflow.
   * @param {string} [params.description] The description of the workflow.
   * @param {string | null} [params.mailingListId] The ID of a mailing list the workflow sends to.
   *
   * @see https://loops.so/docs/api-reference/create-workflow
   *
   * @returns {Object} Created workflow (JSON)
   */
  async createWorkflow({
    name,
    description,
    mailingListId,
  }: {
    name: string;
    description?: string;
    mailingListId?: string | null;
  }): Promise<SimplifiedWorkflow> {
    const payload: {
      name: string;
      description?: string;
      mailingListId?: string | null;
    } = { name };
    if (description !== undefined) payload.description = description;
    if (mailingListId !== undefined) payload.mailingListId = mailingListId;
    return this._makeQuery({
      path: "v1/workflows",
      method: "POST",
      payload,
    });
  }

  /**
   * Get a workflow by ID.
   *
   * @param {string} workflowId The ID of the workflow.
   *
   * @see https://loops.so/docs/api-reference/get-workflow
   *
   * @returns {Object} Workflow graph (JSON)
   */
  async getWorkflow(
    workflowId: string
  ): Promise<SimplifiedWorkflow> {
    return this._makeQuery({
      path: `v1/workflows/${workflowId}`,
    });
  }

  /**
   * Update a workflow's display properties.
   *
   * At least one of `name` or `description` must be provided. To change the
   * mailing list, use `changeWorkflowMailingList()`.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {Object} params
   * @param {string | null} params.expectedRevisionId The workflow revision token from the latest read or mutation. Pass `null` for workflows without a revision yet.
   * @param {string} [params.name] The updated workflow name.
   * @param {string} [params.description] The updated workflow description.
   *
   * @see https://loops.so/docs/api-reference/update-workflow
   *
   * @returns {Object} Updated workflow (JSON)
   */
  async updateWorkflow(
    workflowId: string,
    {
      expectedRevisionId,
      name,
      description,
    }: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      name?: string;
      description?: string;
    }
  ): Promise<SimplifiedWorkflow> {
    const payload: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      name?: string;
      description?: string;
    } = { expectedRevisionId };
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    return this._makeQuery({
      path: `v1/workflows/${workflowId}`,
      method: "POST",
      payload,
    });
  }

  /**
   * Dry run or apply a workflow mailing list change.
   *
   * If queued contacts would be removed, Loops returns
   * `"status": "queuedContactsFound"` instead of updating. Retry with
   * `queuedContactPolicy: "discard"` to apply the change.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {Object} params
   * @param {string | null} params.expectedRevisionId The workflow revision token from the latest read or mutation. Pass `null` for workflows without a revision yet.
   * @param {string | null} params.mailingListId The mailing list to use, or `null` to clear it.
   * @param {boolean} [params.dryRun] If `true`, validate without modifying the workflow.
   * @param {"fail" | "discard"} [params.queuedContactPolicy] How to handle queued contacts that would be removed.
   *
   * @see https://loops.so/docs/api-reference/change-workflow-mailing-list
   *
   * @returns {Object} Preview or updated mailing list result (JSON)
   */
  async changeWorkflowMailingList(
    workflowId: string,
    {
      expectedRevisionId,
      mailingListId,
      dryRun,
      queuedContactPolicy,
    }: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      mailingListId: string | null;
      dryRun?: boolean;
      queuedContactPolicy?: WorkflowQueuedContactPolicy;
    }
  ): Promise<ChangeWorkflowMailingListResponse> {
    const payload: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      mailingListId: string | null;
      dryRun?: boolean;
      queuedContactPolicy?: WorkflowQueuedContactPolicy;
    } = { expectedRevisionId, mailingListId };
    if (dryRun !== undefined) payload.dryRun = dryRun;
    if (queuedContactPolicy !== undefined) {
      payload.queuedContactPolicy = queuedContactPolicy;
    }
    return this._makeQuery({
      path: `v1/workflows/${workflowId}/mailing-list`,
      method: "POST",
      payload,
    });
  }

  /**
   * Create a new default workflow node and return it with the latest workflow.
   *
   * Use `insertMode: "between"` to place the node between an existing connection,
   * `insertMode: "before"` to insert before a node (`toNodeId`), or
   * `insertMode: "after"` to insert after a node that has exactly one outgoing
   * connection. Configure the node after creation with `updateWorkflowNode()`.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {Object} params Create parameters including `insertMode` and revision.
   *
   * @see https://loops.so/docs/api-reference/create-workflow-node
   *
   * @returns {Object} Created node and workflow (JSON)
   */
  async createWorkflowNode(
    workflowId: string,
    params: CreateWorkflowNodeParams
  ): Promise<CreateWorkflowNodeResponse> {
    return this._makeQuery({
      path: `v1/workflows/${workflowId}/nodes`,
      method: "POST",
      payload: params,
    });
  }

  /**
   * Get a workflow node by ID.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {string} nodeId The ID of the workflow node.
   *
   * @see https://loops.so/docs/api-reference/get-workflow-node
   *
   * @returns {Object} Workflow node (JSON)
   */
  async getWorkflowNode(
    workflowId: string,
    nodeId: string
  ): Promise<WorkflowNodeWithRevision> {
    return this._makeQuery({
      path: `v1/workflows/${workflowId}/nodes/${nodeId}`,
    });
  }

  /**
   * Update workflow-node-owned fields for a single node.
   *
   * Shared resources such as email messages and audience segments should be
   * updated through their own APIs.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {string} nodeId The ID of the workflow node.
   * @param {Object} params
   * @param {string | null} params.expectedRevisionId The workflow revision token from the latest read or mutation. Pass `null` for workflows without a revision yet.
   * @param {UpdateWorkflowNodePayload} params.payload Node-type-specific fields to update.
   *
   * @see https://loops.so/docs/api-reference/update-workflow-node
   *
   * @returns {Object} Updated workflow node and latest workflow (JSON)
   */
  async updateWorkflowNode(
    workflowId: string,
    nodeId: string,
    {
      expectedRevisionId,
      payload,
    }: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      payload: UpdateWorkflowNodePayload;
    }
  ): Promise<UpdateWorkflowNodeResponse> {
    return this._makeQuery({
      path: `v1/workflows/${workflowId}/nodes/${nodeId}`,
      method: "POST",
      payload: { expectedRevisionId, payload },
    });
  }

  /**
   * Delete a single workflow node.
   *
   * If contacts are queued at the node, Loops returns
   * `"status": "queuedContactsFound"` instead of deleting. Retry with
   * `queuedContactPolicy: "discard"` to delete the node.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {string} nodeId The ID of the workflow node.
   * @param {Object} params
   * @param {string | null} params.expectedRevisionId The workflow revision token from the latest read or mutation. Pass `null` for workflows without a revision yet.
   * @param {boolean} [params.dryRun] If `true`, validate without modifying the workflow.
   * @param {"fail" | "discard"} [params.queuedContactPolicy] How to handle queued contacts.
   *
   * @see https://loops.so/docs/api-reference/delete-workflow-node
   *
   * @returns {Object} Preview or delete result (JSON)
   */
  async deleteWorkflowNode(
    workflowId: string,
    nodeId: string,
    {
      expectedRevisionId,
      dryRun,
      queuedContactPolicy,
    }: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      dryRun?: boolean;
      queuedContactPolicy?: WorkflowQueuedContactPolicy;
    }
  ): Promise<DeleteWorkflowNodeResponse> {
    const payload: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      dryRun?: boolean;
      queuedContactPolicy?: WorkflowQueuedContactPolicy;
    } = { expectedRevisionId };
    if (dryRun !== undefined) payload.dryRun = dryRun;
    if (queuedContactPolicy !== undefined) {
      payload.queuedContactPolicy = queuedContactPolicy;
    }
    return this._makeQuery({
      path: `v1/workflows/${workflowId}/nodes/${nodeId}`,
      method: "DELETE",
      payload,
    });
  }

  /**
   * Add a branch and a child node under an existing Branch or Experiment node.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {string} nodeId The ID of the Branch or Experiment node.
   * @param {Object} params
   * @param {string | null} params.expectedRevisionId The workflow revision token from the latest read or mutation. Pass `null` for workflows without a revision yet.
   *
   * @see https://loops.so/docs/api-reference/add-workflow-branch
   *
   * @returns {Object} Created child node and workflow (JSON)
   */
  async addWorkflowBranch(
    workflowId: string,
    nodeId: string,
    {
      expectedRevisionId,
    }: {
      expectedRevisionId: WorkflowExpectedRevisionId;
    }
  ): Promise<AddWorkflowBranchResponse> {
    return this._makeQuery({
      path: `v1/workflows/${workflowId}/nodes/${nodeId}/add-branch`,
      method: "POST",
      payload: { expectedRevisionId },
    });
  }

  /**
   * Reroute a source node's single outgoing connection to another target node.
   *
   * The source node must have exactly one outgoing connection. Branch and
   * experiment branch nodes cannot be rerouted with this method.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {string} nodeId The ID of the source workflow node.
   * @param {Object} params
   * @param {string | null} params.expectedRevisionId The workflow revision token from the latest read or mutation. Pass `null` for workflows without a revision yet.
   * @param {string} params.newTargetNodeId The node that should receive the connection.
   *
   * @see https://loops.so/docs/api-reference/reroute-node-connection
   *
   * @returns {Object} Updated source node and latest workflow (JSON)
   */
  async rerouteWorkflowNode(
    workflowId: string,
    nodeId: string,
    {
      expectedRevisionId,
      newTargetNodeId,
    }: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      newTargetNodeId: string;
    }
  ): Promise<RerouteNodeConnectionResponse> {
    return this._makeQuery({
      path: `v1/workflows/${workflowId}/nodes/${nodeId}/reroute`,
      method: "POST",
      payload: { expectedRevisionId, newTargetNodeId },
    });
  }

  /**
   * Delete a node and its downstream subtree.
   *
   * If contacts are queued at any node that would be deleted, Loops returns
   * `"status": "queuedContactsFound"` instead of deleting. Retry with
   * `queuedContactPolicy: "discard"` to delete.
   *
   * @param {string} workflowId The ID of the workflow.
   * @param {string} nodeId The ID of the workflow node.
   * @param {Object} params
   * @param {string | null} params.expectedRevisionId The workflow revision token from the latest read or mutation. Pass `null` for workflows without a revision yet.
   * @param {boolean} [params.dryRun] If `true`, validate without modifying the workflow.
   * @param {"fail" | "discard"} [params.queuedContactPolicy] How to handle queued contacts.
   *
   * @see https://loops.so/docs/api-reference/delete-workflow-nodes
   *
   * @returns {Object} Preview or delete result (JSON)
   */
  async deleteWorkflowNodesRecursive(
    workflowId: string,
    nodeId: string,
    {
      expectedRevisionId,
      dryRun,
      queuedContactPolicy,
    }: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      dryRun?: boolean;
      queuedContactPolicy?: WorkflowQueuedContactPolicy;
    }
  ): Promise<DeleteWorkflowNodeResponse> {
    const payload: {
      expectedRevisionId: WorkflowExpectedRevisionId;
      dryRun?: boolean;
      queuedContactPolicy?: WorkflowQueuedContactPolicy;
    } = { expectedRevisionId };
    if (dryRun !== undefined) payload.dryRun = dryRun;
    if (queuedContactPolicy !== undefined) {
      payload.queuedContactPolicy = queuedContactPolicy;
    }
    return this._makeQuery({
      path: `v1/workflows/${workflowId}/nodes/${nodeId}/recursive`,
      method: "DELETE",
      payload,
    });
  }

  /**
   * List campaign groups.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results.
   *
   * @see https://loops.so/docs/api-reference/list-campaign-groups
   *
   * @returns {Object} List of campaign groups (JSON)
   */
  async listCampaignGroups({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListGroupsResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/campaign-groups",
      params,
    });
  }

  /**
   * Create a campaign group.
   *
   * @param {Object} params
   * @param {string} params.name The group name.
   * @param {string} [params.description] An optional description for the group.
   *
   * @see https://loops.so/docs/api-reference/create-campaign-group
   *
   * @returns {Object} Created campaign group (JSON)
   */
  async createCampaignGroup({
    name,
    description,
  }: {
    name: string;
    description?: string;
  }): Promise<Group> {
    const payload: { name: string; description?: string } = { name };
    if (description !== undefined) payload.description = description;
    return this._makeQuery({
      path: "v1/campaign-groups",
      method: "POST",
      payload,
    });
  }

  /**
   * Get a campaign group by ID.
   *
   * @param {string} campaignGroupId The ID of the campaign group.
   *
   * @see https://loops.so/docs/api-reference/get-campaign-group
   *
   * @returns {Object} Campaign group (JSON)
   */
  async getCampaignGroup(campaignGroupId: string): Promise<Group> {
    return this._makeQuery({
      path: `v1/campaign-groups/${campaignGroupId}`,
    });
  }

  /**
   * Update a campaign group.
   *
   * @param {string} campaignGroupId The ID of the campaign group.
   * @param {Object} params
   * @param {string} [params.name] The group name.
   * @param {string} [params.description] A description for the group.
   *
   * @see https://loops.so/docs/api-reference/update-campaign-group
   *
   * @returns {Object} Updated campaign group (JSON)
   */
  async updateCampaignGroup(
    campaignGroupId: string,
    {
      name,
      description,
    }: {
      name?: string;
      description?: string;
    }
  ): Promise<Group> {
    const payload: { name?: string; description?: string } = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    return this._makeQuery({
      path: `v1/campaign-groups/${campaignGroupId}`,
      method: "POST",
      payload,
    });
  }

  /**
   * List transactional groups.
   *
   * @param {Object} params
   * @param {number} [params.perPage] How many results to return in each request. Must be between 10 and 50. Defaults to 20.
   * @param {string} [params.cursor] A cursor, to return a specific page of results.
   *
   * @see https://loops.so/docs/api-reference/list-transactional-groups
   *
   * @returns {Object} List of transactional groups (JSON)
   */
  async listTransactionalGroups({
    perPage,
    cursor,
  }: {
    perPage?: number;
    cursor?: string;
  } = {}): Promise<ListGroupsResponse> {
    const params: { perPage: string; cursor?: string } = {
      perPage: (perPage || 20).toString(),
    };
    if (cursor) params["cursor"] = cursor;
    return this._makeQuery({
      path: "v1/transactional-groups",
      params,
    });
  }

  /**
   * Create a transactional group.
   *
   * @param {Object} params
   * @param {string} params.name The group name.
   * @param {string} [params.description] An optional description for the group.
   *
   * @see https://loops.so/docs/api-reference/create-transactional-group
   *
   * @returns {Object} Created transactional group (JSON)
   */
  async createTransactionalGroup({
    name,
    description,
  }: {
    name: string;
    description?: string;
  }): Promise<Group> {
    const payload: { name: string; description?: string } = { name };
    if (description !== undefined) payload.description = description;
    return this._makeQuery({
      path: "v1/transactional-groups",
      method: "POST",
      payload,
    });
  }

  /**
   * Get a transactional group by ID.
   *
   * @param {string} transactionalGroupId The ID of the transactional group.
   *
   * @see https://loops.so/docs/api-reference/get-transactional-group
   *
   * @returns {Object} Transactional group (JSON)
   */
  async getTransactionalGroup(
    transactionalGroupId: string
  ): Promise<Group> {
    return this._makeQuery({
      path: `v1/transactional-groups/${transactionalGroupId}`,
    });
  }

  /**
   * Update a transactional group.
   *
   * @param {string} transactionalGroupId The ID of the transactional group.
   * @param {Object} params
   * @param {string} [params.name] The group name.
   * @param {string} [params.description] A description for the group.
   *
   * @see https://loops.so/docs/api-reference/update-transactional-group
   *
   * @returns {Object} Updated transactional group (JSON)
   */
  async updateTransactionalGroup(
    transactionalGroupId: string,
    {
      name,
      description,
    }: {
      name?: string;
      description?: string;
    }
  ): Promise<Group> {
    const payload: { name?: string; description?: string } = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    return this._makeQuery({
      path: `v1/transactional-groups/${transactionalGroupId}`,
      method: "POST",
      payload,
    });
  }

  /**
   * Create an upload.
   *
   * @param {Object} params
   * @param {string} params.contentType The MIME type of the file to upload. Supported types are `image/jpeg`, `image/png`, `image/gif` and `image/webp`.
   * @param {number} params.contentLength The size of the file in bytes. Must be a positive integer no greater than 4,000,000 bytes.
   *
   * @see https://loops.so/docs/api-reference/create-upload
   *
   * @returns {Object} Pre-signed upload URL (JSON)
   */
  async createUpload({
    contentType,
    contentLength,
  }: {
    contentType: string;
    contentLength: number;
  }): Promise<CreateUploadResponse> {
    return this._makeQuery({
      path: "v1/uploads",
      method: "POST",
      payload: { contentType, contentLength },
    });
  }

  /**
   * Complete an upload.
   *
   * @param {string} id The `emailAssetId` returned when the upload was created.
   *
   * @see https://loops.so/docs/api-reference/complete-upload
   *
   * @returns {Object} Public URL of the uploaded asset (JSON)
   */
  async completeUpload(id: string): Promise<CompleteUploadResponse> {
    return this._makeQuery({
      path: `v1/uploads/${id}/complete`,
      method: "POST",
    });
  }
}

export {
  LoopsClient,
  RateLimitExceededError,
  APIError,
  ValidationError,
  ApiKeySuccessResponse,
  ApiKeyErrorResponse,
  ContactSuccessResponse,
  DeleteSuccessResponse,
  SuppressionContact,
  SuppressionRemovalQuota,
  CheckContactSuppressionSuccessResponse,
  RemoveContactSuppressionSuccessResponse,
  ErrorResponse,
  Contact,
  ContactProperty,
  ContactPropertySuccessResponse,
  EventSuccessResponse,
  TransactionalSuccess,
  TransactionalError,
  TransactionalNestedError,
  ContactProperties,
  EventProperties,
  TransactionalVariables,
  TransactionalAttachment,
  MailingList,
  PaginationData,
  TransactionalEmailResource,
  TransactionalDraftResponse,
  ListTransactionalsResourceResponse,
  CreateUploadResponse,
  CompleteUploadResponse,
  MailingLists,
  ThemeStyles,
  Theme,
  ListThemesResponse,
  ThemeResponse,
  UpdateThemeResponse,
  Component,
  ListComponentsResponse,
  ComponentResponse,
  UpdateComponentResponse,
  Group,
  ListGroupsResponse,
  AudienceFilterBetweenValue,
  PropertyCondition,
  OptInCondition,
  ActivityCondition,
  AudienceFilterCondition,
  AudienceFilter,
  CampaignScheduling,
  CampaignSchedulingRequest,
  AudienceSegment,
  ListAudienceSegmentsResponse,
  IncomingWebhookPlatform,
  EventPatternSummary,
  WorkflowEventProperty,
  EventPattern,
  ListEventPatternsResponse,
  WorkflowSummary,
  ListWorkflowsResponse,
  WorkflowStatus,
  SimplifiedWorkflowNode,
  SimplifiedWorkflow,
  WorkflowExpectedRevisionId,
  WorkflowNode,
  WorkflowNodeWithRevision,
  WorkflowQueuedContactPolicy,
  CreateWorkflowNodeTypeName,
  CreateWorkflowNodeParams,
  CreatedWorkflowNode,
  CreateWorkflowNodeResponse,
  AddWorkflowBranchResponse,
  WorkflowMailingListPreview,
  WorkflowMailingListUpdatedResponse,
  ChangeWorkflowMailingListResponse,
  WorkflowQueuedContactDeletePreview,
  WorkflowDeletedResponse,
  DeleteWorkflowNodeResponse,
  UpdateWorkflowNodeResponse,
  RerouteNodeConnectionResponse,
  WorkflowContactPropertyComparisonOperator,
  WorkflowContactPropertyComparison,
  WorkflowContactPropertyQuery,
  UpdateWorkflowNodePayload,
  EmailMessagePreviewResponse,
  GuardianRuleName,
  GuardianRuleItem,
  GuardianRule,
  EmailMessageGuardianResponse,
  Campaign,
  CampaignListItem,
  ListCampaignsResponse,
  CreateCampaignResponse,
  CampaignResponse,
  EmailMessageWarning,
  EmailMessageResponse,
};

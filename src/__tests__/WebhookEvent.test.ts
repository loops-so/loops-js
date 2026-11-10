import type { WebhookEvent } from "../index";

const common = {
  eventTime: 1734425918,
  webhookSchemaVersion: "1.0.0" as const,
};
const contactIdentity = {
  id: "contact-id",
  email: "person@example.com",
  userId: null,
};
const email = { id: "email-id", emailMessageId: "message-id", subject: "Hello" };
const mailingList = {
  id: "list-id",
  name: "News",
  description: null,
  isPublic: true,
};

describe("WebhookEvent", () => {
  it("accepts each documented event payload", () => {
    const events: WebhookEvent[] = [
      {
        ...common,
        eventName: "contact.created",
        contactIdentity,
        contact: {
          ...contactIdentity,
          firstName: null,
          lastName: null,
          source: "API",
          subscribed: true,
          userGroup: "",
          mailingLists: { "list-id": true },
          optInStatus: "accepted",
          favoriteNumber: 42,
        },
      },
      { ...common, eventName: "contact.unsubscribed", contactIdentity },
      { ...common, eventName: "contact.deleted", contactIdentity },
      {
        ...common,
        eventName: "contact.mailingList.subscribed",
        contactIdentity,
        mailingList,
      },
      {
        ...common,
        eventName: "contact.mailingList.unsubscribed",
        contactIdentity,
        mailingList,
      },
      {
        ...common,
        eventName: "campaign.email.sent",
        contactIdentity,
        email,
        campaignId: "campaign-id",
        campaignName: "News",
      },
      {
        ...common,
        eventName: "loop.email.sent",
        contactIdentity,
        email,
        loopId: "loop-id",
        loopName: "Welcome",
        mailingLists: [mailingList],
      },
      {
        ...common,
        eventName: "transactional.email.sent",
        contactIdentity,
        email,
        transactionalId: "transactional-id",
        transactionalName: "Receipt",
      },
      ...(
        [
          "email.delivered",
          "email.softBounced",
          "email.hardBounced",
          "email.spamReported",
        ] as const
      ).map((eventName) => ({
        ...common,
        eventName,
        contactIdentity,
        email,
        sourceType: "transactional" as const,
        transactionalId: "transactional-id",
      })),
      ...(
        [
          "email.opened",
          "email.clicked",
          "email.unsubscribed",
          "email.resubscribed",
        ] as const
      ).map((eventName) => ({
        ...common,
        eventName,
        contactIdentity,
        email,
        sourceType: "campaign" as const,
        campaignId: "campaign-id",
      })),
      { ...common, eventName: "testing.testEvent", message: "test" },
    ];

    expect(events).toHaveLength(17);
  });

  it("narrows event-specific fields and email source identifiers", () => {
    function handle(event: WebhookEvent): string {
      if (event.eventName === "contact.created") {
        const accepted: "accepted" | null = event.contact.optInStatus;
        expect(accepted).toBe("accepted");
        return event.contact.email;
      }
      if (event.eventName === "email.delivered") {
        if (event.sourceType === "transactional") {
          // @ts-expect-error Transactional events have no campaign identifier.
          event.campaignId;
          return event.transactionalId;
        }
        if (event.sourceType === "loop") return event.loopId;
        return event.campaignId;
      }
      if (event.eventName === "testing.testEvent") {
        // @ts-expect-error Test events do not contain a contact.
        event.contactIdentity;
        return event.message;
      }
      return event.contactIdentity.email;
    }

    expect(
      handle({
        ...common,
        eventName: "email.delivered",
        sourceType: "transactional",
        transactionalId: "receipt",
        contactIdentity,
        email,
      })
    ).toBe("receipt");
    expect(
      handle({ ...common, eventName: "testing.testEvent", message: "test" })
    ).toBe("test");

    const transactionalOpen = {
      ...common,
      eventName: "email.opened",
      sourceType: "transactional",
      transactionalId: "receipt",
      contactIdentity,
      email,
    } as const;
    // @ts-expect-error Email opens are not tracked for transactional emails.
    const invalidSource: WebhookEvent = transactionalOpen;
    const namelessCampaign = {
      ...common,
      eventName: "campaign.email.sent",
      campaignId: "campaign-id",
      contactIdentity,
      email,
    } as const;
    // @ts-expect-error Sent campaign events require their campaign name.
    const incomplete: WebhookEvent = namelessCampaign;
    expect(invalidSource).toBeDefined();
    expect(incomplete).toBeDefined();
  });
});

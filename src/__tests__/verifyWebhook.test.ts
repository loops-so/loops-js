import { createHmac, randomBytes } from "node:crypto";
import { verifyWebhook, WebhookVerificationError } from "../index";

const SECRET_BYTES = randomBytes(32);
const SECRET = `whsec_${SECRET_BYTES.toString("base64")}`;
const SECRET_WITHOUT_PREFIX = SECRET_BYTES.toString("base64");

function sign(params: {
  id: string;
  timestamp: string | number;
  rawBody: string;
  secret?: string;
}): string {
  const secret = params.secret ?? SECRET;
  const encoded = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  const key = Buffer.from(encoded, "base64");
  const digest = createHmac("sha256", key)
    .update(`${params.id}.${params.timestamp}.${params.rawBody}`)
    .digest("base64");
  return `v1,${digest}`;
}

function validPayload(overrides?: {
  id?: string;
  timestamp?: number;
  rawBody?: string;
  secret?: string;
  extraSignatures?: string[];
}) {
  const id = overrides?.id ?? "msg_test_123";
  const timestamp = overrides?.timestamp ?? Math.floor(Date.now() / 1000);
  const rawBody =
    overrides?.rawBody ?? JSON.stringify({ eventName: "email.sent" });
  const signature = sign({
    id,
    timestamp,
    rawBody,
    secret: overrides?.secret,
  });
  const signatures = [signature, ...(overrides?.extraSignatures ?? [])].join(
    " "
  );

  return {
    id,
    timestamp: String(timestamp),
    rawBody,
    headers: {
      "webhook-id": id,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": signatures,
    },
  };
}

describe("verifyWebhook", () => {
  it("verifies a valid request and returns the parsed payload", () => {
    const { headers, rawBody } = validPayload();

    const event = verifyWebhook({
      headers,
      rawBody,
      secret: SECRET,
    });

    expect(event).toEqual({ eventName: "email.sent" });
  });

  it("accepts secrets without the whsec_ prefix", () => {
    const { headers, rawBody } = validPayload({
      secret: SECRET_WITHOUT_PREFIX,
    });

    expect(() =>
      verifyWebhook({
        headers,
        rawBody,
        secret: SECRET_WITHOUT_PREFIX,
      })
    ).not.toThrow();
  });

  it("accepts a Headers object", () => {
    const { id, timestamp, rawBody } = validPayload();
    const headers = new Headers({
      "webhook-id": id,
      "webhook-timestamp": timestamp,
      "webhook-signature": sign({ id, timestamp, rawBody }),
    });

    const event = verifyWebhook({
      headers,
      rawBody,
      secret: SECRET,
    });

    expect(event).toEqual({ eventName: "email.sent" });
  });

  it("matches any v1 signature when multiple are present", () => {
    const { headers, rawBody } = validPayload({
      extraSignatures: ["v1,not-a-real-signature", "v0,ignored"],
    });

    expect(() =>
      verifyWebhook({
        headers,
        rawBody,
        secret: SECRET,
      })
    ).not.toThrow();
  });

  it("is case-insensitive for header names on plain objects", () => {
    const { id, timestamp, rawBody } = validPayload();

    const event = verifyWebhook({
      headers: {
        "Webhook-Id": id,
        "Webhook-Timestamp": timestamp,
        "Webhook-Signature": sign({ id, timestamp, rawBody }),
      },
      rawBody,
      secret: SECRET,
    });

    expect(event).toEqual({ eventName: "email.sent" });
  });

  it("joins array header values", () => {
    const { id, timestamp, rawBody } = validPayload();
    const good = sign({ id, timestamp, rawBody });

    const event = verifyWebhook({
      headers: {
        "webhook-id": [id],
        "webhook-timestamp": [timestamp],
        "webhook-signature": ["v1,bad-signature", good],
      },
      rawBody,
      secret: SECRET,
    });

    expect(event).toEqual({ eventName: "email.sent" });
  });

  it("throws MISSING_SECRET when secret is empty", () => {
    const { headers, rawBody } = validPayload();

    try {
      verifyWebhook({ headers, rawBody, secret: "" });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe("MISSING_SECRET");
    }
  });

  it("throws MISSING_HEADERS when a required header is absent", () => {
    const { rawBody } = validPayload();

    try {
      verifyWebhook({
        headers: {
          "webhook-id": "msg_test_123",
          "webhook-timestamp": String(Math.floor(Date.now() / 1000)),
        },
        rawBody,
        secret: SECRET,
      });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe("MISSING_HEADERS");
    }
  });

  it("throws INVALID_TIMESTAMP for a non-numeric timestamp", () => {
    const { id, rawBody } = validPayload();

    try {
      verifyWebhook({
        headers: {
          "webhook-id": id,
          "webhook-timestamp": "not-a-number",
          "webhook-signature": "v1,abc",
        },
        rawBody,
        secret: SECRET,
      });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe(
        "INVALID_TIMESTAMP"
      );
    }
  });

  it("throws INVALID_TIMESTAMP when the timestamp is outside tolerance", () => {
    const stale = Math.floor(Date.now() / 1000) - 301;
    const { headers, rawBody } = validPayload({ timestamp: stale });

    try {
      verifyWebhook({ headers, rawBody, secret: SECRET });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe(
        "INVALID_TIMESTAMP"
      );
    }
  });

  it("allows a custom toleranceSeconds", () => {
    const stale = Math.floor(Date.now() / 1000) - 301;
    const { headers, rawBody } = validPayload({ timestamp: stale });

    expect(() =>
      verifyWebhook({
        headers,
        rawBody,
        secret: SECRET,
        toleranceSeconds: 600,
      })
    ).not.toThrow();
  });

  it("throws INVALID_SIGNATURE for a bad signature", () => {
    const { id, timestamp, rawBody } = validPayload();

    try {
      verifyWebhook({
        headers: {
          "webhook-id": id,
          "webhook-timestamp": timestamp,
          "webhook-signature": "v1,dGhpc2lzbm90YXJlYWxzaWduYXR1cmU=",
        },
        rawBody,
        secret: SECRET,
      });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe(
        "INVALID_SIGNATURE"
      );
    }
  });

  it("throws INVALID_SIGNATURE when the body has been altered", () => {
    const { headers } = validPayload();

    try {
      verifyWebhook({
        headers,
        rawBody: JSON.stringify({ eventName: "tampered" }),
        secret: SECRET,
      });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe(
        "INVALID_SIGNATURE"
      );
    }
  });

  it("throws INVALID_BODY when the verified body is not JSON", () => {
    const rawBody = "not-json";
    const id = "msg_test_123";
    const timestamp = String(Math.floor(Date.now() / 1000));

    try {
      verifyWebhook({
        headers: {
          "webhook-id": id,
          "webhook-timestamp": timestamp,
          "webhook-signature": sign({ id, timestamp, rawBody }),
        },
        rawBody,
        secret: SECRET,
      });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe("INVALID_BODY");
    }
  });
});

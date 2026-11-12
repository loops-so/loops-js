import { verifyWebhook, WebhookVerificationError } from "../index";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const SECRET_BYTES = globalThis.crypto.getRandomValues(new Uint8Array(32));
const SECRET = `whsec_${bytesToBase64(SECRET_BYTES)}`;
const SECRET_WITHOUT_PREFIX = bytesToBase64(SECRET_BYTES);

async function sign(params: {
  id: string;
  timestamp: string | number;
  rawBody: string;
  secret?: string;
}): Promise<string> {
  const secret = params.secret ?? SECRET;
  const encoded = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  const keyBytes = base64ToBytes(encoded);
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(
      `${params.id}.${params.timestamp}.${params.rawBody}`
    )
  );
  return `v1,${bytesToBase64(new Uint8Array(signature))}`;
}

async function validPayload(overrides?: {
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
  const signature = await sign({
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
  it("verifies a valid request and returns the parsed payload", async () => {
    const { headers, rawBody } = await validPayload();

    const event = await verifyWebhook({
      headers,
      rawBody,
      secret: SECRET,
    });

    expect(event).toEqual({ eventName: "email.sent" });
  });

  it("accepts secrets without the whsec_ prefix", async () => {
    const { headers, rawBody } = await validPayload({
      secret: SECRET_WITHOUT_PREFIX,
    });

    await expect(
      verifyWebhook({
        headers,
        rawBody,
        secret: SECRET_WITHOUT_PREFIX,
      })
    ).resolves.toEqual({ eventName: "email.sent" });
  });

  it("accepts a Headers object", async () => {
    const { id, timestamp, rawBody } = await validPayload();
    const headers = new Headers({
      "webhook-id": id,
      "webhook-timestamp": timestamp,
      "webhook-signature": await sign({ id, timestamp, rawBody }),
    });

    const event = await verifyWebhook({
      headers,
      rawBody,
      secret: SECRET,
    });

    expect(event).toEqual({ eventName: "email.sent" });
  });

  it("matches any v1 signature when multiple are present", async () => {
    const { headers, rawBody } = await validPayload({
      extraSignatures: ["v1,not-a-real-signature", "v0,ignored"],
    });

    await expect(
      verifyWebhook({
        headers,
        rawBody,
        secret: SECRET,
      })
    ).resolves.toEqual({ eventName: "email.sent" });
  });

  it("is case-insensitive for header names on plain objects", async () => {
    const { id, timestamp, rawBody } = await validPayload();

    const event = await verifyWebhook({
      headers: {
        "Webhook-Id": id,
        "Webhook-Timestamp": timestamp,
        "Webhook-Signature": await sign({ id, timestamp, rawBody }),
      },
      rawBody,
      secret: SECRET,
    });

    expect(event).toEqual({ eventName: "email.sent" });
  });

  it("joins array header values", async () => {
    const { id, timestamp, rawBody } = await validPayload();
    const good = await sign({ id, timestamp, rawBody });

    const event = await verifyWebhook({
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

  it("throws MISSING_SECRET when secret is empty", async () => {
    const { headers, rawBody } = await validPayload();

    try {
      await verifyWebhook({ headers, rawBody, secret: "" });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe("MISSING_SECRET");
    }
  });

  it("throws MISSING_HEADERS when a required header is absent", async () => {
    const { rawBody } = await validPayload();

    try {
      await verifyWebhook({
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

  it("throws INVALID_TIMESTAMP for a non-numeric timestamp", async () => {
    const { id, rawBody } = await validPayload();

    try {
      await verifyWebhook({
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

  it("throws INVALID_TIMESTAMP when the timestamp is outside tolerance", async () => {
    const stale = Math.floor(Date.now() / 1000) - 301;
    const { headers, rawBody } = await validPayload({ timestamp: stale });

    try {
      await verifyWebhook({ headers, rawBody, secret: SECRET });
      throw new Error("expected verifyWebhook to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WebhookVerificationError);
      expect((error as WebhookVerificationError).code).toBe(
        "INVALID_TIMESTAMP"
      );
    }
  });

  it("allows a custom toleranceSeconds", async () => {
    const stale = Math.floor(Date.now() / 1000) - 301;
    const { headers, rawBody } = await validPayload({ timestamp: stale });

    await expect(
      verifyWebhook({
        headers,
        rawBody,
        secret: SECRET,
        toleranceSeconds: 600,
      })
    ).resolves.toEqual({ eventName: "email.sent" });
  });

  it("throws INVALID_SIGNATURE for a bad signature", async () => {
    const { id, timestamp, rawBody } = await validPayload();

    try {
      await verifyWebhook({
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

  it("throws INVALID_SIGNATURE when the body has been altered", async () => {
    const { headers } = await validPayload();

    try {
      await verifyWebhook({
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

  it("throws INVALID_BODY when the verified body is not JSON", async () => {
    const rawBody = "not-json";
    const id = "msg_test_123";
    const timestamp = String(Math.floor(Date.now() / 1000));

    try {
      await verifyWebhook({
        headers: {
          "webhook-id": id,
          "webhook-timestamp": timestamp,
          "webhook-signature": await sign({ id, timestamp, rawBody }),
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

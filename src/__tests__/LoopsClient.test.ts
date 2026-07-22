import {
  APIError,
  LoopsClient,
  RateLimitExceededError,
  ValidationError,
} from "../index";

describe("LoopsClient", () => {
  const apiKey = "test-api-key";
  let client: LoopsClient;

  beforeEach(() => {
    client = new LoopsClient(apiKey);
    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  describe("constructor", () => {
    it("should create a new instance with the provided API key", () => {
      expect(client).toBeInstanceOf(LoopsClient);
      expect(client.apiKey).toBe(apiKey);
    });

    it("should throw error for empty API key", () => {
      expect(() => new LoopsClient("")).toThrow("API key is required");
    });
  });

  describe("testApiKey", () => {
    it("should make a request to the API key endpoint", async () => {
      const mockResponse = { success: true, teamName: "Test Team" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.testApiKey();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/api-key"),
        expect.any(Object)
      );
    });

    it("should handle invalid API key response", async () => {
      const mockResponse = { error: "Invalid API key" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.testApiKey()).rejects.toThrow(APIError);
    });

    it("should handle rate limiting", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 429,
        headers: new Headers({
          "x-ratelimit-limit": "10",
          "x-ratelimit-remaining": "0",
        }),
      });

      await expect(client.testApiKey()).rejects.toThrow(RateLimitExceededError);
    });

    it("should handle network errors", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(client.testApiKey()).rejects.toThrow("Network error");
    });
  });

  describe("createContact", () => {
    it("should create a contact with the provided email", async () => {
      const email = "test@example.com";
      const mockResponse = { success: true, id: "clw9h3y5a014yl70k9m2n4p8q" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createContact({ email });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/create"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email }),
        })
      );
    });

    it("should create a contact with the provided email and properties", async () => {
      const email = "test@example.com";
      const properties = {
        name: "John Doe",
        age: 30,
        isActive: true,
      };
      const mockResponse = { success: true, id: "clw9h3y5a014yl70k9m2n4p8q" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createContact({ email, properties });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/create"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ ...properties, email }),
        })
      );
    });

    it("should handle error when contact already exists", async () => {
      const email = "existing@example.com";
      const mockResponse = {
        success: false,
        message: "Contact with this email already exists",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.createContact({ email })).rejects.toThrow(APIError);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/create"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email }),
        })
      );
    });

    it("should throw error for missing email", async () => {
      // @ts-expect-error - testing invalid input
      await expect(client.createContact()).rejects.toThrow(TypeError);
    });
  });

  describe("updateContact", () => {
    it("should update contact successfully", async () => {
      const email = "test@example.com";
      const properties = {
        firstName: "John",
        lastName: "Doe",
        userGroup: "customers",
      };
      const mailingLists = {
        cm06f5v0e45nf0ml5754o9cix: true,
      };
      const mockResponse = { success: true, id: "clw9h3y5a014yl70k9m2n4p8q" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateContact({
        email,
        properties,
        mailingLists,
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/update"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ ...properties, mailingLists, email }),
        })
      );
    });

    it("should update contact by userId", async () => {
      const userId = "1234567890";
      const properties = {
        firstName: "John",
        lastName: "Doe",
        userGroup: "customers",
      };
      const mailingLists = {
        cm06f5v0e45nf0ml5754o9cix: true,
      };
      const mockResponse = { success: true, id: "clw9h3y5a014yl70k9m2n4p8q" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateContact({
        userId,
        properties,
        mailingLists,
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/update"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ ...properties, mailingLists, userId }),
        })
      );
    });

    it("should create contact when contact does not exist", async () => {
      const email = "nonexistent@example.com";
      const mockResponse = {
        success: true,
        id: "clw9h3y5a014yl70k9m2n4p8q",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateContact({ email });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/update"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ email }),
        })
      );
    });

    it("should throw error for missing email and userId", async () => {
      await expect(client.updateContact({})).rejects.toThrow(ValidationError);
    });
  });

  describe("checkContactSuppression", () => {
    it("should check suppression status by email", async () => {
      const email = "test@example.com";
      const mockResponse = {
        contact: {
          id: "cll6b3i8901a9jx0oyktl2m4u",
          email,
          userId: null,
        },
        isSuppressed: true,
        removalQuota: {
          limit: 100,
          remaining: 10,
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.checkContactSuppression({ email });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/suppression?email=test%40example.com"),
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should check suppression status by userId", async () => {
      const userId = "1234567890";
      const mockResponse = {
        contact: {
          id: "cll6b3i8901a9jx0oyktl2m4u",
          email: "test@example.com",
          userId,
        },
        isSuppressed: false,
        removalQuota: {
          limit: 100,
          remaining: 99,
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.checkContactSuppression({ userId });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/suppression?userId=1234567890"),
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should throw error when both email and userId are provided", async () => {
      await expect(
        client.checkContactSuppression({
          email: "test@example.com",
          userId: "1234567890",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error when neither email nor userId is provided", async () => {
      await expect(client.checkContactSuppression({})).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe("removeContactSuppression", () => {
    it("should remove suppression by email", async () => {
      const email = "test@example.com";
      const mockResponse = {
        success: true,
        message: "Email removed from suppression list.",
        removalQuota: {
          limit: 100,
          remaining: 9,
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.removeContactSuppression({ email });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/suppression?email=test%40example.com"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("should remove suppression by userId", async () => {
      const userId = "1234567890";
      const mockResponse = {
        success: true,
        message: "User removed from suppression list.",
        removalQuota: {
          limit: 100,
          remaining: 8,
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.removeContactSuppression({ userId });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/suppression?userId=1234567890"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("should throw error when both email and userId are provided", async () => {
      await expect(
        client.removeContactSuppression({
          email: "test@example.com",
          userId: "1234567890",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error when neither email nor userId is provided", async () => {
      await expect(client.removeContactSuppression({})).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe("createContactProperty", () => {
    it("should create contact property successfully", async () => {
      const name = "customField";
      const type = "string";
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createContactProperty(name, type);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/properties"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name, type }),
        })
      );
    });

    it("should handle error for invalid property type", async () => {
      const mockResponse = {
        success: false,
        message: "Invalid property type",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(
        client.createContactProperty("test", "invalid" as any)
      ).rejects.toThrow(APIError);
    });

    it("should throw error for missing name", async () => {
      await expect(
        client.createContactProperty(undefined as any, "string" as any)
      ).rejects.toThrow(TypeError);
    });

    it("should handle error when property name already exists", async () => {
      const name = "existingField";
      const type = "string";
      const mockResponse = {
        success: false,
        message: "Property with this name already exists",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.createContactProperty(name, type)).rejects.toThrow(
        APIError
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/contacts/properties"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name, type }),
        })
      );
    });
  });

  describe("sendEvent", () => {
    it("should send an event successfully with email", async () => {
      const eventData = {
        email: "test@example.com",
        eventName: "test_event",
        contactProperties: {
          firstName: "John",
          lastName: "Doe",
        },
        eventProperties: {
          source: "web",
        },
        mailingLists: {
          cm06f5v0e45nf0ml5754o9cix: true,
        },
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendEvent(eventData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/events/send"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            eventName: eventData.eventName,
            ...eventData.contactProperties,
            eventProperties: eventData.eventProperties,
            mailingLists: eventData.mailingLists,
            email: eventData.email,
          }),
        })
      );
    });

    it("should send an event successfully with userId", async () => {
      const eventData = {
        userId: "1234567890",
        eventName: "test_event",
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendEvent(eventData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/events/send"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            eventName: eventData.eventName,
            userId: eventData.userId,
          }),
        })
      );
    });

    it("should throw error when neither email nor userId is provided", async () => {
      const eventData = {
        eventName: "test_event",
      } as any;

      await expect(client.sendEvent(eventData)).rejects.toThrow(
        ValidationError
      );
    });

    it("should handle API error response", async () => {
      const eventData = {
        email: "test@example.com",
        eventName: "test_event",
      };
      const mockResponse = {
        success: false,
        error: "Invalid event name",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.sendEvent(eventData)).rejects.toThrow(APIError);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/events/send"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            eventName: eventData.eventName,
            email: eventData.email,
          }),
        })
      );
    });

    it("should send event with idempotency key", async () => {
      const eventData = {
        email: "test@example.com",
        eventName: "test_event",
        headers: {
          "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000",
        },
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendEvent(eventData);

      expect(result).toEqual(mockResponse);

      // Get the actual fetch call arguments
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const requestOptions = fetchCall[1];

      // Verify headers using Headers object methods
      const headers = requestOptions.headers;
      expect(headers.get("Idempotency-Key")).toBe(
        "550e8400-e29b-41d4-a716-446655440000"
      );

      // Verify the body doesn't contain idempotency key
      expect(requestOptions.body).toBe(
        JSON.stringify({
          eventName: eventData.eventName,
          email: eventData.email,
        })
      );
    });

    it("should send event without idempotency key when empty string", async () => {
      const eventData = {
        email: "test@example.com",
        eventName: "test_event",
        headers: {
          "Idempotency-Key": "",
        },
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendEvent(eventData);

      expect(result).toEqual(mockResponse);

      // Get the actual fetch call arguments
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const requestOptions = fetchCall[1];

      // Verify no header is set
      expect(requestOptions.headers.get("Idempotency-Key")).toBeNull();
    });
  });

  describe("sendTransactionalEmail", () => {
    it("should send a transactional email successfully", async () => {
      const emailData = {
        transactionalId: "clfq6dinn000yl70fgwwyp82l",
        email: "test@example.com",
        dataVariables: {
          name: "John",
          products: [
            { name: "Widget", price: 29.99 },
            { name: "Gadget", price: 49.99 },
          ],
        },
      };
      const mockResponse = { success: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.sendTransactionalEmail(emailData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(emailData),
        })
      );
    });

    it("should handle error when sending transactional email fails", async () => {
      const emailData = {
        transactionalId: "clx0i4z6b015yl70r9s0t1u2v",
        email: "test@example.com",
      };
      const mockResponse = {
        success: false,
        message: "Transactional email template not found",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(client.sendTransactionalEmail(emailData)).rejects.toThrow(
        APIError
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(emailData),
        })
      );
    });

    it("should throw TypeError for missing required fields", async () => {
      const emailData = {
        email: "test@example.com",
      } as any;

      await expect(client.sendTransactionalEmail(emailData)).rejects.toThrow(
        TypeError
      );
    });
  });

  describe("non-JSON error responses", () => {
    it("should handle HTML error response", async () => {
      const htmlBody = "<html><body>502 Bad Gateway</body></html>";
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 502,
        headers: new Headers(),
        text: () => Promise.resolve(htmlBody),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(502);
        expect((error as APIError).json).toBeNull();
        expect((error as APIError).rawBody).toBe(htmlBody);
      }
    });

    it("should handle plain text error response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        headers: new Headers(),
        text: () => Promise.resolve("Service Unavailable"),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(503);
        expect((error as APIError).rawBody).toBe("Service Unavailable");
      }
    });

    it("should handle empty body error response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: () => Promise.resolve(""),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).json).toBeNull();
        expect((error as APIError).rawBody).toBe("");
      }
    });

    it("should still parse valid JSON errors normally", async () => {
      const jsonError = { success: false, message: "Invalid API key" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify(jsonError)),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).json).toEqual(jsonError);
        expect((error as APIError).rawBody).toBeUndefined();
      }
    });

    it("should throw APIError when success response is not JSON", async () => {
      const htmlBody = "<html><body>OK</body></html>";
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve(htmlBody),
      });

      try {
        await client.testApiKey();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(200);
        expect((error as APIError).json).toBeNull();
        expect((error as APIError).rawBody).toBe(htmlBody);
      }
    });
  });

  describe("listTransactionalEmails", () => {
    it("should list transactional emails successfully", async () => {
      const mockTransactionalEmails = [
        {
          id: "clfn0k1yg001imo0fdeqg30i8",
          name: "Welcome Email",
          draftEmailMessageId: "clm8k2n4p000yl70f6g7h8i9j",
          publishedEmailMessageId: "clm8k2n4p001yl70k1l2m3n4o",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-02T00:00:00.000Z",
          dataVariables: ["name", "product"],
        },
      ];
      const mockResponse = {
        pagination: {
          totalResults: 1,
          returnedResults: 1,
          perPage: 1,
          totalPages: 1,
          nextCursor: null,
          nextPage: null,
        },
        data: mockTransactionalEmails,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.listTransactionalEmails();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional-emails?perPage=20"),
        expect.objectContaining({
          method: "GET",
        })
      );

      result.data.forEach((email) => {
        expect(typeof email.id).toBe("string");
        expect(typeof email.name).toBe("string");
        expect(typeof email.createdAt).toBe("string");
        expect(typeof email.updatedAt).toBe("string");
        expect(Array.isArray(email.dataVariables)).toBe(true);
        expect(email.dataVariables.length).toBe(2);
      });
    });

    it("should handle empty response", async () => {
      const mockResponse = {
        pagination: {
          totalResults: 0,
          returnedResults: 0,
          perPage: 20,
          totalPages: 0,
          nextCursor: null,
          nextPage: null,
        },
        data: [],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.listTransactionalEmails();

      expect(result.data).toEqual([]);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional-emails?perPage=20"),
        expect.objectContaining({
          method: "GET",
        })
      );
    });
  });

  describe("getTransactionalEmail", () => {
    it("should get a transactional email by ID", async () => {
      const mockResponse = {
        id: "clfn0k1yg001imo0fdeqg30i8",
        name: "Welcome Email",
        draftEmailMessageId: null,
        publishedEmailMessageId: "clm8k2n4p001yl70k1l2m3n4o",
        transactionalGroupId: null,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-02T00:00:00.000Z",
        dataVariables: ["name"],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getTransactionalEmail("clfn0k1yg001imo0fdeqg30i8");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional-emails/clfn0k1yg001imo0fdeqg30i8"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("createTransactionalEmail", () => {
    it("should create a transactional email", async () => {
      const mockResponse = {
        id: "clfn0k1yg001imo0fdeqg30i8",
        name: "Welcome Email",
        draftEmailMessageId: "clm8k2n4p000yl70f6g7h8i9j",
        draftEmailMessageContentRevisionId: "clv8g2x4z012yl70n5o6p7q8r",
        publishedEmailMessageId: null,
        transactionalGroupId: null,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
        dataVariables: [],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createTransactionalEmail({
        name: "Welcome Email",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional-emails"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Welcome Email" }),
        })
      );
    });
  });

  describe("updateTransactionalEmail", () => {
    it("should update a transactional email", async () => {
      const mockResponse = {
        id: "clfn0k1yg001imo0fdeqg30i8",
        name: "Updated Email",
        draftEmailMessageId: "clm8k2n4p000yl70f6g7h8i9j",
        publishedEmailMessageId: "clm8k2n4p001yl70k1l2m3n4o",
        transactionalGroupId: null,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-02T00:00:00.000Z",
        dataVariables: ["name"],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateTransactionalEmail("clfn0k1yg001imo0fdeqg30i8", {
        name: "Updated Email",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional-emails/clfn0k1yg001imo0fdeqg30i8"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Updated Email" }),
        })
      );
    });
  });

  describe("ensureTransactionalEmailDraft", () => {
    it("should ensure a transactional email draft exists", async () => {
      const mockResponse = {
        id: "clfn0k1yg001imo0fdeqg30i8",
        name: "Welcome Email",
        draftEmailMessageId: "clm8k2n4p000yl70f6g7h8i9j",
        draftEmailMessageContentRevisionId: "clv8g2x4z012yl70n5o6p7q8r",
        publishedEmailMessageId: "clm8k2n4p001yl70k1l2m3n4o",
        transactionalGroupId: null,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-02T00:00:00.000Z",
        dataVariables: ["name"],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.ensureTransactionalEmailDraft("clfn0k1yg001imo0fdeqg30i8");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional-emails/clfn0k1yg001imo0fdeqg30i8/draft"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("publishTransactionalEmail", () => {
    it("should publish a transactional email draft", async () => {
      const mockResponse = {
        id: "clfn0k1yg001imo0fdeqg30i8",
        name: "Welcome Email",
        draftEmailMessageId: null,
        publishedEmailMessageId: "clm8k2n4p001yl70k1l2m3n4o",
        transactionalGroupId: null,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-02T00:00:00.000Z",
        dataVariables: ["name"],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.publishTransactionalEmail("clfn0k1yg001imo0fdeqg30i8");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/transactional-emails/clfn0k1yg001imo0fdeqg30i8/publish"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("createUpload", () => {
    it("should create an upload", async () => {
      const mockResponse = {
        emailAssetId: "clu7f1w3y011yl70m5n6o7p8q",
        presignedUrl: "https://example.com/upload",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createUpload({
        contentType: "image/png",
        contentLength: 102400,
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/uploads"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            contentType: "image/png",
            contentLength: 102400,
          }),
        })
      );
    });
  });

  describe("completeUpload", () => {
    it("should complete an upload", async () => {
      const mockResponse = {
        emailAssetId: "clu7f1w3y011yl70m5n6o7p8q",
        finalUrl: "https://cdn.example.com/clu7f1w3y011yl70m5n6o7p8q.png",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.completeUpload("clu7f1w3y011yl70m5n6o7p8q");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/uploads/clu7f1w3y011yl70m5n6o7p8q/complete"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("listDedicatedSendingIps", () => {
    it("should return a list of IP addresses", async () => {
      const mockResponse = ["1.2.3.4", "5.6.7.8"];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.listDedicatedSendingIps();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/dedicated-sending-ips"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("createAudienceSegment", () => {
    it("should create an audience segment", async () => {
      const filter = {
        match: "all" as const,
        conditions: [
          {
            type: "property" as const,
            key: "planName",
            operator: "equals" as const,
            value: "pro",
          },
        ],
      };
      const mockResponse = {
        id: "cls6e8g0i2k4m6o8q0s2u4w6",
        name: "Active users",
        description: "Contacts on the pro plan",
        createdAt: "2025-06-29T07:47:39.370Z",
        updatedAt: "2025-06-29T07:47:39.370Z",
        filter,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createAudienceSegment({
        name: "Active users",
        description: "Contacts on the pro plan",
        filter,
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/audience-segments"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Active users",
            filter,
            description: "Contacts on the pro plan",
          }),
        })
      );
    });

    it("should handle error when segment name already exists", async () => {
      const filter = {
        match: "all" as const,
        conditions: [
          {
            type: "property" as const,
            key: "planName",
            operator: "equals" as const,
            value: "pro",
          },
        ],
      };
      const mockResponse = {
        message: "An audience segment with this name already exists",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(
        client.createAudienceSegment({
          name: "Active users",
          filter,
        })
      ).rejects.toThrow(APIError);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/audience-segments"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Active users",
            filter,
          }),
        })
      );
    });

    it("should handle error for an invalid filter", async () => {
      const filter = {
        match: "all" as const,
        conditions: [
          {
            type: "property" as const,
            key: "planName",
            operator: "equals" as const,
            value: "pro",
          },
        ],
      };
      const mockResponse = {
        message: "Invalid filter",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      try {
        await client.createAudienceSegment({
          name: "Active users",
          filter,
        });
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(400);
        expect((error as APIError).json).toEqual(mockResponse);
      }
    });
  });

  describe("listThemes", () => {
    it("should list themes with pagination", async () => {
      const mockResponse = {
        pagination: {
          totalResults: 1,
          returnedResults: 1,
          perPage: 20,
          totalPages: 1,
          nextCursor: null,
          nextPage: null,
        },
        data: [
          {
            id: "clo1z5q7s004yl70y3z4a5b6c",
            name: "Default",
            styles: { backgroundColor: "#ffffff" },
            isDefault: true,
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.listThemes({ perPage: 10, cursor: "abc" });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/themes?perPage=10&cursor=abc"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("getTheme", () => {
    it("should get a theme by ID", async () => {
      const mockResponse = {
        id: "clo1z5q7s004yl70y3z4a5b6c",
        name: "Default",
        styles: {},
        isDefault: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getTheme("clo1z5q7s004yl70y3z4a5b6c");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/themes/clo1z5q7s004yl70y3z4a5b6c"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("listComponents", () => {
    it("should list components with pagination", async () => {
      const mockResponse = {
        pagination: {
          totalResults: 1,
          returnedResults: 1,
          perPage: 20,
          totalPages: 1,
          nextCursor: null,
          nextPage: null,
        },
        data: [
          {
            id: "clp2a6r8t005yl70d7e8f9g0h",
            name: "Header",
            lmx: "<Section />",
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.listComponents();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/components?perPage=20"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("getComponent", () => {
    it("should get a component by ID", async () => {
      const mockResponse = {
        id: "clp2a6r8t005yl70d7e8f9g0h",
        name: "Header",
        lmx: "<Section />",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getComponent("clp2a6r8t005yl70d7e8f9g0h");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/components/clp2a6r8t005yl70d7e8f9g0h"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  const campaignFixture = {
    id: "cln0y4p6r003yl70i1j2k3l4m",
    name: "Spring announcement",
    status: "Draft",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    emailMessageId: "clm9x3o5q002yl70a8b3c4d5e",
    campaignGroupId: null,
    mailingListId: null,
    audienceSegmentId: null,
    audienceFilter: null,
    scheduling: { method: "now" as const, timestamp: null },
  };

  describe("listCampaigns", () => {
    it("should list campaigns", async () => {
      const mockResponse = {
        pagination: {
          totalResults: 1,
          returnedResults: 1,
          perPage: 20,
          totalPages: 1,
          nextCursor: null,
          nextPage: null,
        },
        data: [campaignFixture],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.listCampaigns();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/campaigns?perPage=20"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("createCampaign", () => {
    it("should create a draft campaign", async () => {
      const mockResponse = {
        ...campaignFixture,
        emailMessageContentRevisionId: "clv8g2x4z012yl70n5o6p7q8r",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createCampaign({ name: "Spring announcement" });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/campaigns"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Spring announcement" }),
        })
      );
    });
  });

  describe("getCampaign", () => {
    it("should get a campaign by ID", async () => {
      const mockResponse = campaignFixture;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getCampaign("cln0y4p6r003yl70i1j2k3l4m");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/campaigns/cln0y4p6r003yl70i1j2k3l4m"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("updateCampaign", () => {
    it("should update a draft campaign", async () => {
      const mockResponse = {
        ...campaignFixture,
        name: "Updated name",
        updatedAt: "2025-01-02T00:00:00.000Z",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateCampaign("cln0y4p6r003yl70i1j2k3l4m", {
        name: "Updated name",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/campaigns/cln0y4p6r003yl70i1j2k3l4m"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Updated name" }),
        })
      );
    });
  });

  describe("getEmailMessage", () => {
    it("should get an email message by ID", async () => {
      const mockResponse = {
        id: "clm9x3o5q002yl70a8b3c4d5e",
        campaignId: "cln0y4p6r003yl70i1j2k3l4m",
        subject: "Hello",
        previewText: "Preview",
        fromName: "Loops",
        fromEmail: "hello",
        replyToEmail: "",
        emailFormat: "styled",
        lmx: "<Email />",
        contentRevisionId: "clv8g2x4z012yl70n5o6p7q8r",
        updatedAt: "2025-01-01T00:00:00.000Z",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getEmailMessage("clm9x3o5q002yl70a8b3c4d5e");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/email-messages/clm9x3o5q002yl70a8b3c4d5e"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("updateEmailMessage", () => {
    it("should update an email message", async () => {
      const mockResponse = {
        id: "clm9x3o5q002yl70a8b3c4d5e",
        campaignId: "cln0y4p6r003yl70i1j2k3l4m",
        subject: "Updated subject",
        previewText: "Preview",
        fromName: "Loops",
        fromEmail: "hello",
        replyToEmail: "",
        emailFormat: "styled",
        lmx: "<Email />",
        contentRevisionId: "clv8g2x4z013yl70s9t0u1v2w",
        updatedAt: "2025-01-02T00:00:00.000Z",
        warnings: [
          {
            rule: "example",
            severity: "warning",
            message: "Example warning",
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateEmailMessage("clm9x3o5q002yl70a8b3c4d5e", {
        expectedRevisionId: "clv8g2x4z012yl70n5o6p7q8r",
        subject: "Updated subject",
        lmx: "<Email />",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/email-messages/clm9x3o5q002yl70a8b3c4d5e"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            expectedRevisionId: "clv8g2x4z012yl70n5o6p7q8r",
            subject: "Updated subject",
            lmx: "<Email />",
          }),
        })
      );
    });

    it("should handle API errors", async () => {
      const mockResponse = {
        success: false,
        message: "Campaign is not in draft status",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 409,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await expect(
        client.updateEmailMessage("clm9x3o5q002yl70a8b3c4d5e", { subject: "Updated" })
      ).rejects.toThrow(APIError);
    });
  });

  describe("createTheme", () => {
    it("should create a theme", async () => {
      const mockResponse = {
        id: "clo1z5q7s004yl70y3z4a5b6c",
        name: "Brand",
        styles: { backgroundColor: "#111111" },
        isDefault: false,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createTheme({
        name: "Brand",
        styles: { backgroundColor: "#111111" },
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/themes"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Brand",
            styles: { backgroundColor: "#111111" },
          }),
        })
      );
    });
  });

  describe("updateTheme", () => {
    it("should update a theme", async () => {
      const mockResponse = {
        id: "clo1z5q7s004yl70y3z4a5b6c",
        name: "Brand Updated",
        styles: {},
        isDefault: false,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-02T00:00:00.000Z",
        affectedEmailCount: 3,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateTheme("clo1z5q7s004yl70y3z4a5b6c", {
        name: "Brand Updated",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/themes/clo1z5q7s004yl70y3z4a5b6c"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Brand Updated" }),
        })
      );
    });
  });

  describe("createComponent", () => {
    it("should create a component", async () => {
      const mockResponse = {
        id: "clp2a6r8t005yl70d7e8f9g0h",
        name: "Footer",
        lmx: "<Section />",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createComponent({
        name: "Footer",
        lmx: "<Section />",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/components"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Footer", lmx: "<Section />" }),
        })
      );
    });
  });

  describe("updateComponent", () => {
    it("should update a component", async () => {
      const mockResponse = {
        id: "clp2a6r8t005yl70d7e8f9g0h",
        name: "Footer",
        lmx: "<Section updated />",
        affectedEmailCount: 2,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateComponent("clp2a6r8t005yl70d7e8f9g0h", {
        lmx: "<Section updated />",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/components/clp2a6r8t005yl70d7e8f9g0h"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ lmx: "<Section updated />" }),
        })
      );
    });
  });

  describe("runEmailMessageGuardian", () => {
    it("should run guardian checks", async () => {
      const mockResponse = {
        errors: [
          {
            rule: "missingButtonHrefs",
            title: "Missing button link",
            description: "Buttons won't work without href value",
            items: [{ label: "Click here" }],
          },
        ],
        warnings: [],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.runEmailMessageGuardian(
        "clm9x3o5q002yl70a8b3c4d5e"
      );

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "v1/email-messages/clm9x3o5q002yl70a8b3c4d5e/guardian"
        ),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("listEventPatterns", () => {
    it("should list event patterns with pagination", async () => {
      const mockResponse = {
        pagination: {
          totalResults: 1,
          returnedResults: 1,
          perPage: 20,
          totalPages: 1,
          nextCursor: null,
          nextPage: null,
        },
        data: [
          {
            id: "cle1a2b3c004yl70d5e6f7g8h",
            eventName: "signup",
            incomingWebhookPlatform: null,
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.listEventPatterns({ perPage: 10 });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/event-patterns?perPage=10"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("getEventPattern", () => {
    it("should get an event pattern by ID", async () => {
      const mockResponse = {
        id: "cle1a2b3c004yl70d5e6f7g8h",
        eventName: "signup",
        eventProperties: [{ name: "plan", type: "string" }],
        incomingWebhookPlatform: null,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getEventPattern("cle1a2b3c004yl70d5e6f7g8h");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/event-patterns/cle1a2b3c004yl70d5e6f7g8h"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("getEventPatternByName", () => {
    it("should get an event pattern by name", async () => {
      const mockResponse = {
        id: "cle1a2b3c004yl70d5e6f7g8h",
        eventName: "signup completed",
        eventProperties: [],
        incomingWebhookPlatform: null,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.getEventPatternByName("signup completed");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "v1/event-patterns/by-name/signup%20completed"
        ),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("createWorkflow", () => {
    it("should create a workflow", async () => {
      const mockResponse = {
        id: "cls5d9u1w009yl70c7d8e9f0g",
        status: "Draft",
        name: "Onboarding",
        mailingListId: null,
        rootNodeId: "clt6e0v2x010yl70h1i2j3k4l",
        nodes: {},
        workflowRevisionId: "rev_1",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createWorkflow({ name: "Onboarding" });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/workflows"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Onboarding" }),
        })
      );
    });
  });

  describe("updateWorkflow", () => {
    it("should update a workflow", async () => {
      const mockResponse = {
        id: "cls5d9u1w009yl70c7d8e9f0g",
        status: "Draft",
        name: "Updated",
        mailingListId: null,
        rootNodeId: "clt6e0v2x010yl70h1i2j3k4l",
        nodes: {},
        workflowRevisionId: "rev_2",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateWorkflow("cls5d9u1w009yl70c7d8e9f0g", {
        expectedRevisionId: "rev_1",
        name: "Updated",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("v1/workflows/cls5d9u1w009yl70c7d8e9f0g"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            expectedRevisionId: "rev_1",
            name: "Updated",
          }),
        })
      );
    });
  });

  describe("changeWorkflowMailingList", () => {
    it("should change a workflow mailing list", async () => {
      const mockResponse = {
        status: "updated",
        mailingListId: "clm1",
        workflowRevisionId: "rev_2",
        queuedContactCount: 0,
        queuedContactLimitReached: false,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.changeWorkflowMailingList(
        "cls5d9u1w009yl70c7d8e9f0g",
        {
          expectedRevisionId: "rev_1",
          mailingListId: "clm1",
        }
      );

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "v1/workflows/cls5d9u1w009yl70c7d8e9f0g/mailing-list"
        ),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            expectedRevisionId: "rev_1",
            mailingListId: "clm1",
          }),
        })
      );
    });
  });

  describe("createWorkflowNode", () => {
    it("should create a workflow node between two nodes", async () => {
      const mockResponse = {
        node: {
          id: "new_node",
          workflowId: "cls5d9u1w009yl70c7d8e9f0g",
          typeName: "TimerAction",
          nextNodeIds: ["to"],
          workflowRevisionId: "rev_2",
        },
        workflow: {
          id: "cls5d9u1w009yl70c7d8e9f0g",
          status: "Draft",
          mailingListId: null,
          rootNodeId: "from",
          nodes: {},
          workflowRevisionId: "rev_2",
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createWorkflowNode(
        "cls5d9u1w009yl70c7d8e9f0g",
        {
          expectedRevisionId: "rev_1",
          insertMode: "between",
          nodeTypeName: "TimerAction",
          fromNodeId: "from",
          toNodeId: "to",
        }
      );

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "v1/workflows/cls5d9u1w009yl70c7d8e9f0g/nodes"
        ),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            expectedRevisionId: "rev_1",
            insertMode: "between",
            nodeTypeName: "TimerAction",
            fromNodeId: "from",
            toNodeId: "to",
          }),
        })
      );
    });
  });

  describe("updateWorkflowNode", () => {
    it("should update a workflow node", async () => {
      const mockResponse = {
        id: "node1",
        workflowId: "cls5d9u1w009yl70c7d8e9f0g",
        typeName: "TimerAction",
        nextNodeIds: [],
        amount: 1,
        unit: "h",
        workflowRevisionId: "rev_2",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateWorkflowNode(
        "cls5d9u1w009yl70c7d8e9f0g",
        "node1",
        {
          expectedRevisionId: "rev_1",
          payload: { amount: 1, unit: "h" },
        }
      );

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "v1/workflows/cls5d9u1w009yl70c7d8e9f0g/nodes/node1"
        ),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            expectedRevisionId: "rev_1",
            payload: { amount: 1, unit: "h" },
          }),
        })
      );
    });
  });

  describe("deleteWorkflowNode", () => {
    it("should delete a workflow node", async () => {
      const mockResponse = {
        status: "deleted",
        nodeIds: ["node1"],
        workflowRevisionId: "rev_2",
        queuedContactCount: 0,
        queuedContactLimitReached: false,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.deleteWorkflowNode(
        "cls5d9u1w009yl70c7d8e9f0g",
        "node1",
        { expectedRevisionId: "rev_1" }
      );

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "v1/workflows/cls5d9u1w009yl70c7d8e9f0g/nodes/node1"
        ),
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({ expectedRevisionId: "rev_1" }),
        })
      );
    });
  });

  describe("addWorkflowBranch", () => {
    it("should add a workflow branch", async () => {
      const mockResponse = {
        node: {
          id: "branch_child",
          workflowId: "cls5d9u1w009yl70c7d8e9f0g",
          typeName: "AudienceFilter",
          nextNodeIds: [],
          workflowRevisionId: "rev_2",
        },
        workflow: {
          id: "cls5d9u1w009yl70c7d8e9f0g",
          status: "Draft",
          mailingListId: null,
          rootNodeId: "root",
          nodes: {},
          workflowRevisionId: "rev_2",
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.addWorkflowBranch(
        "cls5d9u1w009yl70c7d8e9f0g",
        "branch1",
        { expectedRevisionId: "rev_1" }
      );

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "v1/workflows/cls5d9u1w009yl70c7d8e9f0g/nodes/branch1/add-branch"
        ),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ expectedRevisionId: "rev_1" }),
        })
      );
    });
  });

  describe("deleteWorkflowNodesRecursive", () => {
    it("should recursively delete workflow nodes", async () => {
      const mockResponse = {
        status: "deleted",
        nodeIds: ["node1", "node2"],
        workflowRevisionId: "rev_2",
        queuedContactCount: 0,
        queuedContactLimitReached: false,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.deleteWorkflowNodesRecursive(
        "cls5d9u1w009yl70c7d8e9f0g",
        "node1",
        { expectedRevisionId: "rev_1", queuedContactPolicy: "discard" }
      );

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "v1/workflows/cls5d9u1w009yl70c7d8e9f0g/nodes/node1/recursive"
        ),
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({
            expectedRevisionId: "rev_1",
            queuedContactPolicy: "discard",
          }),
        })
      );
    });
  });
});

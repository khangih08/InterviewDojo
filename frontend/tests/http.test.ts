import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const {
  mockAxiosCreate,
  mockAxiosPost,
  mockAxiosIsAxiosError,
  mockGetAccessToken,
  mockGetRefreshToken,
  mockSaveAuthTokens,
  mockSaveUser,
  mockClearAuthTokens,
  mockClearUser,
  mockToastError,
  mockToastInfo,
} = vi.hoisted(() => ({
  mockAxiosCreate: vi.fn(),
  mockAxiosPost: vi.fn(),
  mockAxiosIsAxiosError: vi.fn(),
  mockGetAccessToken: vi.fn(),
  mockGetRefreshToken: vi.fn(),
  mockSaveAuthTokens: vi.fn(),
  mockSaveUser: vi.fn(),
  mockClearAuthTokens: vi.fn(),
  mockClearUser: vi.fn(),
  mockToastError: vi.fn(),
  mockToastInfo: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: mockAxiosCreate,
    post: mockAxiosPost,
    isAxiosError: mockAxiosIsAxiosError,
  },
}));

vi.mock("@/lib/auth", () => ({
  getAccessToken: mockGetAccessToken,
  getRefreshToken: mockGetRefreshToken,
  saveAuthTokens: mockSaveAuthTokens,
  saveUser: mockSaveUser,
  clearAuthTokens: mockClearAuthTokens,
  clearUser: mockClearUser,
}));

vi.mock("@/lib/toast", () => ({
  toastError: mockToastError,
  toastInfo: mockToastInfo,
}));

type MockInstance = ReturnType<typeof createMockInstance>;

function createMockInstance() {
  const instance = vi.fn();
  const requestUse = vi.fn();
  const responseUse = vi.fn();

  Object.assign(instance, {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  });

  return { instance, requestUse, responseUse };
}

async function loadHttpModuleWith(mockInstance: MockInstance) {
  vi.resetModules();
  mockAxiosCreate.mockReturnValue(mockInstance.instance);
  const module = await import("@/lib/api/http");
  const requestHandler = mockInstance.requestUse.mock.calls[0]?.[0];
  const responseErrorHandler = mockInstance.responseUse.mock.calls[0]?.[1];

  return {
    ...module,
    requestHandler,
    responseErrorHandler,
  };
}

describe("http client", () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    mockAxiosIsAxiosError.mockReturnValue(true);
    mockGetAccessToken.mockReturnValue("stored-access-token");
    mockGetRefreshToken.mockReturnValue("stored-refresh-token");
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalBaseUrl;
  });

  it("creates an axios client with the configured defaults", async () => {
    const mockInstance = createMockInstance();

    await loadHttpModuleWith(mockInstance);

    expect(mockAxiosCreate).toHaveBeenCalledWith({
      baseURL: "https://api.example.com",
      timeout: 20_000,
      headers: { "Content-Type": "application/json" },
    });
  });

  it("adds the bearer token when the request does not already have one", async () => {
    const mockInstance = createMockInstance();
    const { requestHandler } = await loadHttpModuleWith(mockInstance);
    const config = { headers: {} as Record<string, string> };

    const result = requestHandler(config);

    expect(result.headers.Authorization).toBe("Bearer stored-access-token");
  });

  it("preserves an existing authorization header", async () => {
    const mockInstance = createMockInstance();
    const { requestHandler } = await loadHttpModuleWith(mockInstance);
    const config = {
      headers: { Authorization: "Bearer existing-token" } as Record<
        string,
        string
      >,
    };

    const result = requestHandler(config);

    expect(result.headers.Authorization).toBe("Bearer existing-token");
  });

  it("refreshes the session and retries the original request on 401", async () => {
    const mockInstance = createMockInstance();
    const { responseErrorHandler } = await loadHttpModuleWith(mockInstance);
    mockAxiosPost.mockResolvedValue({
      data: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: { id: "u-1" },
      },
    });
    mockInstance.instance.mockResolvedValue({
      data: { ok: true },
    });

    const error = {
      config: { url: "/questions", headers: {} },
      response: { status: 401, data: { message: "Unauthorized" } },
      message: "Unauthorized",
    };

    const result = await responseErrorHandler(error);

    expect(mockAxiosPost).toHaveBeenCalledWith(
      "https://api.example.com/auth/refresh",
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer stored-refresh-token",
        }),
      }),
    );
    expect(mockSaveAuthTokens).toHaveBeenCalledWith({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    expect(mockSaveUser).toHaveBeenCalledWith({ id: "u-1" });
    expect(dispatchEventSpy).toHaveBeenCalled();
    expect(mockInstance.instance).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer new-access-token",
        }),
      }),
    );
    expect(result).toEqual({ data: { ok: true } });
  });

  it("clears the session and shows an info toast when refresh fails", async () => {
    const mockInstance = createMockInstance();
    const { responseErrorHandler } = await loadHttpModuleWith(mockInstance);
    mockAxiosPost.mockRejectedValue(new Error("refresh failed"));

    const error = {
      config: { url: "/questions", headers: {} },
      response: { status: 401, data: { message: "Unauthorized" } },
      message: "Unauthorized",
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(mockClearAuthTokens).toHaveBeenCalled();
    expect(mockClearUser).toHaveBeenCalled();
    expect(mockToastInfo).toHaveBeenCalledWith(
      "Your login session has expired. Please sign in again.",
    );
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("shows a normalized error toast for non-auth failures", async () => {
    const mockInstance = createMockInstance();
    const { responseErrorHandler } = await loadHttpModuleWith(mockInstance);

    const error = {
      config: { url: "/questions", headers: {} },
      response: {
        status: 400,
        data: { message: ["Question", "not found"] },
      },
      message: "Bad Request",
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(mockToastError).toHaveBeenCalledWith("Question not found");
  });

  it("skips the error toast for cancelled requests and opt-out headers", async () => {
    const mockInstance = createMockInstance();
    const { responseErrorHandler } = await loadHttpModuleWith(mockInstance);

    await expect(
      responseErrorHandler({
        config: {
          url: "/questions",
          headers: { "x-skip-error-toast": "1" },
        },
        response: { status: 500, data: { message: "No toast" } },
      }),
    ).rejects.toBeTruthy();

    await expect(
      responseErrorHandler({
        code: "ERR_CANCELED",
        config: { url: "/questions", headers: {} },
        response: { status: 500, data: { message: "Canceled" } },
      }),
    ).rejects.toBeTruthy();

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("maps axios and generic errors with toApiError", async () => {
    const mockInstance = createMockInstance();
    const { toApiError } = await loadHttpModuleWith(mockInstance);

    const networkError = {
      code: "ERR_NETWORK",
      message: "Network Error",
      response: undefined,
    };
    const messageArrayError = {
      message: "Request failed",
      response: { status: 422, data: { message: ["One", "Two"] } },
    };

    expect(toApiError(networkError)).toEqual({
      status: 0,
      message: "Cannot reach the server. Make sure the backend is running.",
      details: undefined,
    });
    expect(toApiError(messageArrayError)).toEqual({
      status: 422,
      message: "One Two",
      details: { message: ["One", "Two"] },
    });

    mockAxiosIsAxiosError.mockReturnValue(false);
    expect(toApiError(new Error("boom"))).toEqual({
      status: 0,
      message: "boom",
    });
    expect(toApiError("unexpected")).toEqual({
      status: 0,
      message: "Lỗi không xác định",
    });
  });
});

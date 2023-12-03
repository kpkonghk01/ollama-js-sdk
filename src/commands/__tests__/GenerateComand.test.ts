import { jest } from "@jest/globals";
import { type AxiosInstance } from "axios";
import {
  GenerateCommand,
  isGenerateResponseStream,
  type GenerateRequest,
} from "../GenerateCommand.js";
import { OllamaError } from "../../errors/OllamaError.js";
import { Readable } from "stream";

jest.mock("axios");

describe("GenerateCommand", () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  const request: GenerateRequest = {
    model: "testModel",
    prompt: "testPrompt",
    stream: false,
  };

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should send a POST request to /api/generate", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          model: request.model,
          created_at: new Date().toISOString(),
          response: "mock response",
          done: true,
        },
      });

      const command = new GenerateCommand(request);
      await command.execute(mockAxiosInstance);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/generate",
        expect.any(Object)
      );
    });

    it("should return a stream when stream option is true", async () => {
      const mockResponse = {
        model: request.model,
        created_at: new Date().toISOString(),
        response: "mock response",
        done: true,
      };

      const mockStream = Readable.from([JSON.stringify(mockResponse)]);
      mockAxiosInstance.post.mockResolvedValue({
        data: mockStream,
      });

      const command = new GenerateCommand({ ...request, stream: true });

      const result = await command.execute(mockAxiosInstance);

      expect(isGenerateResponseStream(result)).toBe(true);
    });

    it("should throw an OllamaError when response parsing fails", async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: "invalid" });

      const command = new GenerateCommand(request);

      await expect(command.execute(mockAxiosInstance)).rejects.toThrow(
        OllamaError
      );
    });
  });
});

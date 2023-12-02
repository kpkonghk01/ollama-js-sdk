import { jest } from "@jest/globals";
import axios, { type AxiosInstance, type AxiosStatic } from "axios";
import {
  EmbeddingCommand,
  type EmbeddingRequest,
  type EmbeddingResponse,
} from "../EmbeddingCommand.js";

jest.mock("axios");

describe("EmbeddingCommand", () => {
  const mockAxiosInstance: jest.Mocked<AxiosInstance> = {
    post: jest.fn(),
  } as any;
  const validRequest: EmbeddingRequest = {
    model: "testModel",
    prompt: "testPrompt",
  };
  const validResponse: EmbeddingResponse = { embedding: [0.1, 0.2, 0.3] };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should execute and return valid response", async () => {
    mockAxiosInstance.post.mockResolvedValue({
      data: validResponse,
    });
    const command = new EmbeddingCommand(validRequest);
    const response = await command.execute(mockAxiosInstance);
    expect(response).toEqual(validResponse);
  });

  it("should throw an OllamaError when response parsing fails", async () => {
    const invalidResponse = { embedding: ["0.1", "0.2", "0.3"] };
    mockAxiosInstance.post.mockResolvedValue({
      data: invalidResponse,
    });
    const command = new EmbeddingCommand(validRequest);
    await expect(command.execute(mockAxiosInstance)).rejects.toThrow(
      "Cannot parse embedding response"
    );
  });
});

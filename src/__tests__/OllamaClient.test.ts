import { jest } from "@jest/globals";
import OllamaClient from "../OllamaClient.js";
import type { Command } from "../interfaces/Command.js";
import axios, { type AxiosInstance, type AxiosStatic } from "axios";

jest.mock("axios");

describe("OllamaClient", () => {
  let client: OllamaClient;

  const mockedAxios = axios as jest.Mocked<AxiosStatic>;

  const mockAxiosInstance: jest.Mocked<AxiosInstance> = {} as any;

  const config = {
    baseURL: "http://test.com",
  };

  beforeEach(() => {
    mockedAxios.create = jest.fn(() => mockAxiosInstance);
    client = new OllamaClient(config);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("constructor", () => {
    it("should create an axios instance with the correct configuration", () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        headers: {
          "Content-Type": "application/json",
        },
        ...config,
      });
    });
  });

  describe("send", () => {
    it("should execute the command with the axios instance", async () => {
      const mockCommand: Command<string> = {
        execute: jest
          .fn<Command<string>["execute"]>()
          .mockResolvedValue("test"),
      };

      const result = await client.send(mockCommand);

      expect(mockCommand.execute).toHaveBeenCalledWith(mockAxiosInstance);
      expect(result).toBe("test");
    });
  });
});

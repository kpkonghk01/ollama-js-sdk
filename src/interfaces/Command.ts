import type { AxiosInstance } from "axios";

export interface Command<T> {
  execute(client: AxiosInstance): Promise<T>;
}

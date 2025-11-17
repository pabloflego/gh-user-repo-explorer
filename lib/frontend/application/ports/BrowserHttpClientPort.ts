export type BrowserHttpClientPort = (
  input: URL | (string | Request), 
  init?: RequestInit | undefined
) => Promise<Response>;
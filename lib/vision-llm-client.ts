import { TIMEOUTS, createTimeoutSignal, TimeoutError } from "./timeout-utils";

export interface VisionLLMMatch {
  phenotype: string;
  confidence: number;
  reasoning?: string;
  groups?: string[];
  hierarchy?: string[];
}

export interface VisionLLMResponse {
  analysis: string;
  primary_region?: string;
  matches: VisionLLMMatch[];
  provider?: string;
  cost_estimate?: number;
}

interface ClassifyOptions {
  provider?: string;
  signal?: AbortSignal;
}

const BASE_URL = process.env.VISION_LLM_API_URL;
const DEFAULT_PROVIDER = process.env.VISION_LLM_PROVIDER || "gpt5";

function buildEndpoint(path: string): URL | null {
  if (!BASE_URL) {
    console.warn(
      "Vision LLM base URL is not configured. Set VISION_LLM_API_URL to enable LLM classification."
    );
    return null;
  }

  try {
    return new URL(path, BASE_URL);
  } catch (error) {
    console.error("Invalid VISION_LLM_API_URL:", error);
    return null;
  }
}

export async function classifyImageWithVisionLLM(
  imageUrl: string,
  options: ClassifyOptions = {}
): Promise<VisionLLMResponse | null> {
  const endpoint = buildEndpoint("/classify-url");
  if (!endpoint) {
    return null;
  }

  const provider = options.provider || DEFAULT_PROVIDER;
  endpoint.searchParams.set("image_url", imageUrl);
  if (provider) {
    endpoint.searchParams.set("provider", provider);
  }

  const controller = new AbortController();
  const timeoutSignal = createTimeoutSignal(TIMEOUTS.AI_API_CALL);

  const onAbort = () => controller.abort();
  timeoutSignal.addEventListener("abort", onAbort, { once: true });

  const mergedSignal = options.signal
    ? mergeSignals(options.signal, controller.signal)
    : controller.signal;

  try {
    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      signal: mergedSignal,
    });

    if (!response.ok) {
      let errorDetail: any;
      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = await response.text();
      }

      console.error(
        "Vision LLM classification failed:",
        response.status,
        response.statusText,
        errorDetail
      );
      return null;
    }

    const data = (await response.json()) as VisionLLMResponse;
    return data;
  } catch (error: any) {
    if (error instanceof TimeoutError || error?.name === "TimeoutError") {
      console.error("Vision LLM classification timed out:", error);
    } else if (error?.name === "AbortError") {
      console.error("Vision LLM classification aborted:", error);
    } else {
      console.error("Vision LLM classification error:", error);
    }
    return null;
  } finally {
    timeoutSignal.removeEventListener("abort", onAbort);
  }
}

function mergeSignals(signalA: AbortSignal, signalB: AbortSignal): AbortSignal {
  if (signalA.aborted) {
    return signalA;
  }
  if (signalB.aborted) {
    return signalB;
  }

  const controller = new AbortController();

  const abort = (signal: AbortSignal) => {
    if (!controller.signal.aborted) {
      controller.abort(signal.reason);
    }
  };

  const onAbortA = () => abort(signalA);
  const onAbortB = () => abort(signalB);

  signalA.addEventListener("abort", onAbortA);
  signalB.addEventListener("abort", onAbortB);

  controller.signal.addEventListener(
    "abort",
    () => {
      signalA.removeEventListener("abort", onAbortA);
      signalB.removeEventListener("abort", onAbortB);
    },
    { once: true }
  );

  return controller.signal;
}

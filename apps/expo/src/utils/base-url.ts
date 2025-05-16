import { appVariant, ngrokUrl } from "@/lib/utils";
import Constants from "expo-constants";
import { logger } from "@/lib/logger";
/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
export const getBaseUrl = (isNgrok = false) => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];
  logger.info("localhost", localhost);
  logger.info("ngrokUrl", ngrokUrl);
  if (localhost) {
    if (localhost.includes("ngrok") || isNgrok) {
      return ngrokUrl;
    } else {
      return `http://${localhost}:3000`;
    }
  } else if (appVariant !== "production") {
    return "https://snatched-ai-dev-oh2uj.ondigitalocean.app";
  } else {
    return "https://snatchedai.com";
  }
};

export const getScheme = () => {
  return appVariant === "production"
    ? "snatched-ai"
    : appVariant === "preview"
    ? "snatched-ai-preview"
    : "snatched-ai-dev";
};

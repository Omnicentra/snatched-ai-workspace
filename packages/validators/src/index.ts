import { z } from "zod";

export const unused = z.string().describe(
  `This lib is currently not used as we use drizzle-zod for simple schemas
   But as your application grows and you need other validators to share
   with back and frontend, you can put them in here
  `,
);

export const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const prettyPrint = (obj: string | object | number) => {
  console.log("");
  if (typeof obj === "string") {
    console.log("*".repeat(30));
    console.log(obj);
    console.log("*".repeat(30));
  } else if (typeof obj === "object") {
    console.log(JSON.stringify(obj, null, 2));
  } else {
    console.log(obj);
  }
  console.log("");
};

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

/**
 * Formats a PostgreSQL timestamp with timezone to 24-hour time format (HH:mm)
 * @param timestamp PostgreSQL timestamp string (e.g. "2025-05-04 11:54:44+00")
 * @returns Formatted time string (e.g. "11:54") or empty string if timestamp is null/invalid
 */
export const formatPostgresTimestamp = (timestamp: string | null | undefined): string => {
  if (!timestamp) return "";
  
  try {
    // Convert PostgreSQL timestamp to ISO format by adding colon to timezone offset
    const isoTimestamp = timestamp.replace(/\+(\d{2})$/, "+$1:00");
    const date = new Date(isoTimestamp);
    
    // Validate the date is valid before formatting
    if (isNaN(date.getTime())) {
      console.error("Invalid date from timestamp:", timestamp);
      return "";
    }
    
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "";
  }
};

export interface BodyRatingResponse {
  currentSnatchedScore: number | null;
  potentialSnatchedScore: number | null;
  potentialWaistReductionInches: number | null;
  waistDefinition: number | null;
  hipCurve: number | null;
  gluteShape: number | null;
  posture: number | null;
  armShape: number | null;
  backDefinition: number | null;
  issue1: string | null;
  issue2: string | null;
  issue3: string | null;
}


import { GoogleGenAI, Type } from "@google/genai";
import { Telemetry, FlightMode, MissionType } from "../types";

const SYSTEM_INSTRUCTION = `
You are the Onboard Autonomous Decision Core (Aegis-UAV).
Your role is to act as a real-time expert system for target tracking and autonomous follow supervision.

CORE OPERATIONAL PROTOCOLS:
1. OBJECT-BASED TRACKING: Treat targets as anonymous objects. Never identify individuals.
2. SUPERVISORY CONTROL: You suggest actions; you do not control motors directly.
3. SAFETY FIRST: If confidence < 0.5, suggest HOLD. If lost, suggest MANUAL.

STRICT FAILSAFE LOGIC:
- BATTERY < 20%: Suggest RTL regardless of lock.
- GPS < 30%: Suggest HOLD position.

OUTPUT FORMAT:
You MUST return a JSON object with the following fields:
- target_id: The ID of the current target (e.g., "OBJ-001")
- lock_confidence: 0.0 to 1.0 based on telemetry and visual consistency
- risk_level: "Low", "Medium", or "High"
- suggested_action: Concise flight recommendation (e.g., "Adjust heading to center target")
- reason: Technical justification
- status: "LOCKED", "LOST", "OCCLUDED", or "SCANNING"

Note: Professional, technical, clinical tone.
`;

export const getTrackingDecision = async (
  telemetry: Telemetry,
  currentMode: FlightMode,
  mission: MissionType,
  targetId: string | null,
  context: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const prompt = `
    FLIGHT_STATE:
    - MODE: ${currentMode}
    - MISSION: ${mission}
    - TARGET_LOCK: ${targetId || 'NONE'}
    - TELEMETRY: Alt:${telemetry.altitude}m, Spd:${telemetry.speed}km/h, Bat:${telemetry.battery}%, GPS:${telemetry.gpsSignal}%
    
    ENVIRONMENTAL_CONTEXT: ${context}
    
    DECISION_CORE_PROMPT: Analyze tracking state and provide autonomous follow supervision.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            target_id: { type: Type.STRING },
            lock_confidence: { type: Type.NUMBER },
            risk_level: { type: Type.STRING },
            suggested_action: { type: Type.STRING },
            reason: { type: Type.STRING },
            status: { type: Type.STRING }
          },
          required: ["target_id", "lock_confidence", "risk_level", "suggested_action", "reason", "status"]
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Tracking Error:", error);
    return {
      target_id: targetId || "UNKNOWN",
      lock_confidence: 0,
      risk_level: "High",
      suggested_action: "Manual control required - system error",
      reason: "API connection failure",
      status: "LOST"
    };
  }
};

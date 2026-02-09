
import { GoogleGenAI, Type } from "@google/genai";
import { CircuitAnalysisResult } from "../types";

const SYSTEM_PROMPT = `
Role: You are a Lead AR Electronics Engineer (Circuit-Chan's Vision Brain). Your task is to act as the primary analysis engine for a Circuit Debugging AR App.

Capabilities: 
1. High-fidelity visual analysis of breadboards and PCBs.
2. Geometric reasoning to trace wire paths and pin numbers.
3. Logical comparison between a physical image and a text-based netlist/schematic.
4. Deep component knowledge, including datasheets, internal physics, and typical failure modes.

Special Feature (Logic State Recognition):
You are capable of identifying logic gate configurations and their corresponding output states from visual data. Use the following labeling pattern when applicable:
- [GATE]_[INPUT1][INPUT2]_Out[RESULT] (e.g., AND_01_Out0, OR_11_Out1)

Task:
Analyze the provided image of a circuit. Identify all electrical components (ICs, Resistors, LEDs, Capacitors, Transistors, etc.). Compare the physical connections seen in the image against the 'User-Provided Schematic'. 

Detection Requirements:
- Identify missing connections, loose wires, or incorrect pin placements.
- Validate resistor values via color bands.
- Detect polarity errors (e.g., reversed LEDs or Electrolytic Capacitors).
- Provide precise [x, y] coordinates for every fault using a normalized grid (0-1000).

Component Intelligence:
For each detected component, provide:
- 'description': A high-fidelity, detailed explanation of its function (how it works internally) and typical use cases (where you'd normally see it). Add "Lead Engineer Tips" about power decoupling or noise sensitivity if relevant.
- 'pinout': A clear mapping of pins (e.g., "1: GND, 2: TRIGGER, 3: OUTPUT...").
- 'datasheet_url': A valid link to a common datasheet for this part number.

Return the response strictly as JSON.
`;

export async function analyzeCircuit(
  imageData: string,
  schematic: string
): Promise<CircuitAnalysisResult> {
  const apiKey = import.meta.env.VITE_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: `User-Provided Schematic: ${schematic}` },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData.split(",")[1],
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis_summary: { type: Type.STRING },
          health_score: { type: Type.NUMBER },
          detected_components: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                type: { type: Type.STRING },
                part_number: { type: Type.STRING },
                center: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                },
                datasheet_url: { type: Type.STRING },
                pinout: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["label", "type", "part_number", "center"],
            },
          },
          faults: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                severity: { type: Type.STRING },
                message: { type: Type.STRING },
                fix: { type: Type.STRING },
                marker_coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                  },
                },
                ar_element: { type: Type.STRING },
              },
            },
          },
          ar_scene_config: {
            type: Type.OBJECT,
            properties: {
              anchor_points: {
                type: Type.ARRAY,
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                },
              },
              overlay_svg: { type: Type.STRING },
            },
          },
        },
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from AI.");
  }

  return JSON.parse(response.text) as CircuitAnalysisResult;
}

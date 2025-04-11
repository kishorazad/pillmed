import OpenAI from "openai";

// Initialize OpenAI client
// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const systemPrompt = `You are MedAssist, an AI healthcare assistant for Medadock, an online pharmacy platform.

Your purpose is to provide accurate, helpful and concise information about:
- Medications and their uses
- General health questions
- Minor symptom guidance (always recommending consultation with healthcare professionals for serious concerns)
- Healthy lifestyle recommendations
- Basic medical term explanations

Guidelines:
1. Always make it clear that you're an AI assistant, not a doctor.
2. For serious medical concerns, always advise consulting a healthcare professional.
3. Never diagnose conditions or suggest treatments beyond general knowledge.
4. Be compassionate but professional.
5. Provide concise, factual responses based on established medical knowledge.
6. When you don't know something, admit it clearly.
7. Do not provide information about controlled substances beyond general facts.
8. Focus on general health information that would be publicly available.
9. Never claim to know the user's specific medical conditions or history.
10. Keep your responses to 2-3 paragraphs maximum for readability.`;

/**
 * Processes a user's health query and returns an AI response
 * @param query The user's health question
 * @param messageHistory Previous message history (optional)
 * @returns The AI assistant's response
 */
export async function processHealthQuery(
  query: string,
  messageHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Add system prompt if this is the start of the conversation
    const messages: ChatMessage[] = messageHistory.length === 0
      ? [{ role: 'system', content: systemPrompt }]
      : [...messageHistory];
    
    // Add the user's query
    messages.push({ role: 'user', content: query });

    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any, // Type assertion to match OpenAI's expected format
      temperature: 0.7,
      max_tokens: 500,
    });

    // Return the assistant's response
    const assistantResponse = response.choices[0].message.content;
    return assistantResponse || "I'm sorry, I couldn't process your question. Please try again.";
  } catch (error) {
    console.error("Error processing health query:", error);
    return "I'm sorry, there was an error processing your request. Please try again later.";
  }
}

/**
 * Processes a medication information request and returns AI-generated information
 * @param medicationName The name of the medication to get information about
 * @returns Structured information about the medication
 */
export async function getMedicationInfo(medicationName: string): Promise<any> {
  try {
    const prompt = `Provide a concise overview of the medication "${medicationName}" with the following information in JSON format:
    1. generic_name: The generic name of the medication
    2. drug_class: The class of drug it belongs to
    3. primary_uses: A short list of primary conditions it treats
    4. common_side_effects: A list of the most common side effects
    5. precautions: Important precautions or warnings
    6. typical_dosage: A general range for typical dosage (note that this is general information, not personalized medical advice)
    
    Format the response as a valid JSON object with these exact keys, using only factual, well-established medical information.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const jsonResponse = response.choices[0].message.content;
    return jsonResponse ? JSON.parse(jsonResponse) : null;
  } catch (error) {
    console.error("Error getting medication information:", error);
    return null;
  }
}

/**
 * Analyzes multiple medications for potential interactions
 * @param medications Array of medication names to analyze
 * @returns Information about potential interactions
 */
export async function analyzeMedicationInteractions(medications: string[]): Promise<any> {
  if (medications.length < 2) {
    return { interactions: [] };
  }

  try {
    const prompt = `Analyze the following medications for potential interactions: ${medications.join(", ")}

    Provide your response in JSON format with the following structure:
    {
      "interactions": [
        {
          "medications": ["drug1", "drug2"],
          "severity": "mild|moderate|severe",
          "description": "Brief description of the interaction",
          "recommendation": "What to do about this interaction"
        }
      ]
    }
    
    Only include actual known interactions based on established medical information. If there are no known significant interactions, return an empty array for "interactions".`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const jsonResponse = response.choices[0].message.content;
    return jsonResponse ? JSON.parse(jsonResponse) : { interactions: [] };
  } catch (error) {
    console.error("Error analyzing medication interactions:", error);
    return { interactions: [] };
  }
}
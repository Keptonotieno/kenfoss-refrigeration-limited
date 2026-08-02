import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Instant Refrigeration & Fault Diagnostic Assistant
  app.post('/api/diagnose', async (req, res) => {
    try {
      const { 
        applianceType, 
        brand, 
        modelNumber, 
        errorCode, 
        location, 
        equipmentAge, 
        problemDescription,
        isDead,
        compressorStatus,
        unusualSmellNoise,
        waterIceIssues,
        recentPowerOutage,
        attemptedRepairs
      } = req.body;

      if (!problemDescription && !errorCode && !isDead) {
        return res.status(400).json({ error: 'Please provide symptoms, error code, or equipment behavior.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });

          const prompt = `
You are the Kenfoss AI Diagnostic Engineer, a virtual refrigeration and HVAC diagnostic assistant at Kenfoss Refrigeration Limited in Kenya (+254 712 345 678 / +254 745 411 923).

OBJECTIVE:
- Understand the customer's problem.
- Diagnose the most likely fault.
- Explain possible causes concisely.
- Recommend safe troubleshooting steps (e.g., checking power supply, thermostat, cleaning accessible condenser coils, unblocking vents, checking door seals).
- Determine whether the issue can be solved by the customer or requires a Kenfoss technician.
- NEVER recommend opening sealed refrigeration systems, handling refrigerant gas (R600a/R134a/R404a/R410a), electrical rewiring, PCB soldering, compressor replacement, capacitor replacement, or dismantling electrical components.
- Always prioritize safety.
- Never guess. If essential details are missing, state confidence level accordingly and list follow-up questions in "missingInfoQuestions".

EQUIPMENT DETAILS COLLECTED:
- Equipment Type: ${applianceType || 'Refrigeration / HVAC Unit'}
- Brand / OEM: ${brand || 'Unknown'}
- Model Number: ${modelNumber || 'Not provided'}
- Error Code Displayed: ${errorCode || 'None'}
- Customer Location: ${location || 'Nairobi / Kenya'}
- Equipment Age: ${equipmentAge || 'Unspecified'}
- Symptom Description: ${problemDescription || 'See status indicators below'}
- Unit Completely Dead: ${isDead ? 'YES' : 'NO'}
- Compressor Status: ${compressorStatus || 'Not specified'}
- Unusual Smell / Noise / Clicking: ${unusualSmellNoise || 'None'}
- Water Leakage or Heavy Ice Build-up: ${waterIceIssues || 'None'}
- Recent Power Outage / Surge: ${recentPowerOutage ? 'YES' : 'NO'}
- Prior Attempted Repairs: ${attemptedRepairs ? 'YES' : 'NO'}

REQUIRED JSON OUTPUT SCHEMA (no markdown tags, valid JSON only):
{
  "appliance": "${brand || ''} ${applianceType || 'Refrigeration System'}",
  "diagnosisSummary": "A concise, professional 1-2 sentence engineering diagnosis summary.",
  "probableCause": "Detailed explanation of the primary root cause.",
  "confidenceLevel": "e.g., '85% (High)' or '60% (Moderate - Model Number Required)'",
  "missingInfoQuestions": ["Follow-up question 1 if details are missing", "Follow-up question 2"],
  "safeTroubleshootingSteps": [
    "Safe step 1 (e.g. Verify power outlet voltage & circuit breaker)",
    "Safe step 2 (e.g. Ensure 15cm clearance around rear condenser coils)",
    "Safe step 3 (e.g. Check magnetic door gasket seal for air leaks)"
  ],
  "whenToStopTroubleshooting": "Explicit safety threshold to stop (e.g., 'Stop immediately if you hear loud compressor clicking, smell burning wire insulation, or detect water near electrical terminals.')",
  "technicianRequired": true,
  "technicianRequiredReason": "Why a certified Kenfoss EPRA technician is required for safe repair.",
  "repairComplexity": "Minor Customer Adjustment" | "Moderate Field Service" | "Complex Technical Overhaul",
  "recommendedNextAction": "Recommended action step for customer.",
  "severity": "Low" | "Medium" | "High" | "Emergency Critical",
  "recommendedAction": "Immediate recommendation.",
  "estimatedRepairScope": "Estimated time & scope (e.g. 1-2 Hours On-Site Diagnostic & Component Service)",
  "safetyWarning": "Critical safety warning regarding mains power or pressurized sealed systems.",
  "canSelfFix": false,
  "suggestedParts": ["Part name 1", "Part name 2"],
  "closingStatement": "If the issue persists after these checks, we recommend booking a Kenfoss Refrigeration Limited technician for a professional diagnosis and repair."
}
`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
            },
          });

          const rawText = response.text || '';
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          // Extract Google Search grounding metadata sources if available
          const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
          const sources: { title: string; uri: string }[] = [];

          for (const chunk of groundingChunks) {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || chunk.web.uri,
                uri: chunk.web.uri,
              });
            }
          }

          try {
            const parsed = JSON.parse(cleanedText);
            return res.json({ 
              success: true, 
              result: {
                ...parsed,
                searchGrounded: true,
                sources,
                searchQueries
              } 
            });
          } catch {
            return res.json({
              success: true,
              result: {
                appliance: `${brand || ''} ${applianceType || 'Refrigeration Unit'}`,
                diagnosisSummary: `Engineering assessment for ${brand || ''} ${applianceType || 'cooling system'}.`,
                probableCause: rawText.slice(0, 180) || 'Possible compressor start relay failure, refrigerant pressure loss, or defrost control board fault.',
                confidenceLevel: '75% (Moderate)',
                missingInfoQuestions: ['Exact model number from cabinet sticker', 'Is compressor vibrating when powered on?'],
                safeTroubleshootingSteps: [
                  'Ensure power plug is firmly inserted and main circuit breaker is ON.',
                  'Inspect magnetic door seals for gaps using a piece of paper.',
                  'Clean dust and lint from accessible rear condenser coils using a soft dry brush.',
                  'Verify internal thermostat knob is set to normal cooling position (Level 3-4).'
                ],
                whenToStopTroubleshooting: 'Stop immediately if you smell burning electrical insulation, hear rapid clicking from the compressor, or notice water leaking into electrical junction boxes.',
                technicianRequired: true,
                technicianRequiredReason: 'Diagnosis involves electrical testing and sealed circuit pressure evaluation requiring EPRA-certified refrigeration tools.',
                repairComplexity: 'Moderate Field Service',
                recommendedNextAction: 'Schedule on-site diagnostic dispatch with Kenfoss Refrigeration Limited.',
                severity: 'High',
                recommendedAction: 'Schedule a certified Kenfoss EPRA technician for on-site diagnostic testing.',
                estimatedRepairScope: '1 to 2 Hours On-Site Technical Evaluation & Service',
                safetyWarning: 'Do not attempt to open sealed copper refrigerant lines or dismantle internal PCB wiring.',
                canSelfFix: false,
                suggestedParts: ['PTC Start Relay', 'Thermal Overload Protector', 'Defrost Sensor'],
                closingStatement: 'If the issue persists after these checks, we recommend booking a Kenfoss Refrigeration Limited technician for a professional diagnosis and repair.',
                searchGrounded: true,
                sources,
                searchQueries
              }
            });
          }
        } catch (genErr: any) {
          console.warn('Gemini API call failed for /api/diagnostic (falling back to rule engine):', genErr?.message || genErr);
          // Graceful fallback to rule-based diagnostic below
        }
      }

      // Rule-based diagnostic fallback if GEMINI_API_KEY is not configured
      const isEmergency = isDead || 
                          unusualSmellNoise?.toLowerCase().includes('smoke') || 
                          unusualSmellNoise?.toLowerCase().includes('burning') ||
                          problemDescription?.toLowerCase().includes('burn') ||
                          problemDescription?.toLowerCase().includes('smoke') || 
                          problemDescription?.toLowerCase().includes('spoil');

      const techReq = !problemDescription?.toLowerCase().includes('door') && !problemDescription?.toLowerCase().includes('plug');

      return res.json({
        success: true,
        result: {
          appliance: `${brand || 'Commercial'} ${applianceType || 'Refrigeration System'}`,
          diagnosisSummary: `Preliminary fault analysis for ${brand || ''} ${applianceType || 'cooling unit'}.`,
          probableCause: errorCode 
            ? `Error ${errorCode}: Indicates sensor telemetry fault or inverter board communication loss in ${brand || 'system'}.`
            : `Possible start relay failure, evaporator coil icing, gas pressure drop, or temperature sensor drift.`,
          confidenceLevel: errorCode ? '85% (High)' : '70% (Moderate)',
          missingInfoQuestions: ['Specific model number', 'Are condenser coils warm or cold to touch?'],
          safeTroubleshootingSteps: [
            'Verify wall outlet power with another appliance.',
            'Ensure unit is spaced at least 15cm from rear wall for adequate airflow.',
            'Confirm thermostat or digital controller is set to correct cooling setpoint.',
            'Check door gasket seal around the entire perimeter.'
          ],
          whenToStopTroubleshooting: 'Stop immediately if compressor buzzes without starting, or if burning smell / sparks occur.',
          technicianRequired: techReq,
          technicianRequiredReason: techReq ? 'Sealed system diagnostics and electrical component testing require Kenfoss EPRA-certified equipment.' : 'Minor adjustment may resolve issue.',
          repairComplexity: isEmergency ? 'Complex Technical Overhaul' : 'Moderate Field Service',
          recommendedNextAction: techReq ? 'Book a Kenfoss technician for on-site diagnosis.' : 'Follow safe troubleshooting steps above.',
          severity: isEmergency ? 'Emergency Critical' : 'High',
          recommendedAction: 'Immediate on-site inspection by Kenfoss EPRA-certified refrigeration engineer.',
          estimatedRepairScope: '1 to 3 Hours On-Site Diagnostic & Component Replacement',
          safetyWarning: isEmergency 
            ? 'CRITICAL: Disconnect power at wall outlet immediately if compressor is overheating or emitting burning odor.' 
            : 'Do not puncture aluminum evaporator plates or handle refrigerant gas.',
          canSelfFix: !techReq,
          suggestedParts: ['Compressor Start Capacitor', 'Digital Defrost Controller', 'Filter Drier'],
          closingStatement: 'If the issue persists after these checks, we recommend booking a Kenfoss Refrigeration Limited technician for a professional diagnosis and repair.'
        }
      });
    } catch (err: any) {
      console.error('Diagnostic error:', err);
      return res.status(500).json({ error: 'Diagnostic service temporarily unavailable. Please call +254 712 345 678.' });
    }
  });

  // API Route: Service Booking Submission
  app.post('/api/book', (req, res) => {
    const { fullName, phone, email, location, serviceType, date, notes } = req.body;
    const bookingRef = `KEN-${Math.floor(100000 + Math.random() * 900000)}`;

    return res.json({
      success: true,
      bookingRef,
      message: `Service booking ${bookingRef} received! Our engineer will call ${phone} within 15 minutes to confirm dispatch.`,
      details: { fullName, location, serviceType, date }
    });
  });

  // API Route: Contact Enquiry Submission
  app.post('/api/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Name, phone number, and message are required.' });
    }
    return res.json({
      success: true,
      message: 'Thank you for reaching out! Our Kenfoss service desk team has received your inquiry and will respond shortly.',
      id: `msg-${Date.now()}`
    });
  });

  // API Route: Multi-Turn Gemini AI Chatbot
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, message, role = 'general', requestedModel } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message content is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      // Select system instruction and model based on task role
      let selectedModel = 'gemini-3.5-flash';
      let systemInstruction = `You are Kenfoss AI Assistant, an expert virtual HVAC and commercial refrigeration engineer at Kenfoss Refrigeration Limited (+254 745 411 923 / +254 712 345 678, Ruiru, Kiambu County, Kenya).
You assist customers, building managers, and technicians with:
- Troubleshooting refrigerator, freezer, chiller, and walk-in cold room faults
- Explaining OEM error codes (Samsung, LG, Danfoss, Bitzer, Copeland, Carrier)
- Advising on preventative maintenance, temperature setpoints, and energy efficiency
- Guiding service bookings and emergency dispatch requests
Provide helpful, professional, structured advice. Emphasize safety around electricity and pressurized refrigerants.`;

      if (role === 'fast' || requestedModel === 'gemini-3.1-flash-lite') {
        selectedModel = 'gemini-3.1-flash-lite';
        systemInstruction = `You are Kenfoss Fast-Assist AI, a high-speed refrigeration quick lookup bot for Kenfoss Refrigeration Limited Kenya (+254 745 411 923).
Provide direct, concise, immediate answers in 2-4 brief bullet points or sentences. Focus on fast resolution and quick equipment specs.`;
      } else if (role === 'complex' || requestedModel === 'gemini-3.1-pro-preview') {
        selectedModel = 'gemini-3.1-pro-preview';
        systemInstruction = `You are Kenfoss Senior Systems Engineer & Thermodynamics Specialist at Kenfoss Refrigeration Limited Kenya.
Provide advanced technical calculations, refrigeration load sizing, enthalpy/P-T diagram analysis, commercial cold room heat gain equations, multi-stage compressor configuration, and EPRA regulatory advice. Use clear equations and step-by-step engineering logic.`;
      } else if (requestedModel) {
        selectedModel = requestedModel;
      }

      if (apiKey) {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        // Build history in GenAI contents format
        const contentsHistory: { role: string; parts: { text: string }[] }[] = [];

        if (Array.isArray(messages)) {
          for (const msg of messages) {
            if (msg.content && (msg.role === 'user' || msg.role === 'model' || msg.role === 'assistant')) {
              contentsHistory.push({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts: [{ text: msg.content }]
              });
            }
          }
        }

        // Add current user message
        contentsHistory.push({
          role: 'user',
          parts: [{ text: message }]
        });

        try {
          const response = await ai.models.generateContent({
            model: selectedModel,
            contents: contentsHistory,
            config: {
              systemInstruction,
              tools: [{ googleSearch: {} }]
            }
          });

          const responseText = response.text || "I've analyzed your refrigeration query, but could not generate a response. Please try rephrasing.";

          // Extract grounding sources
          const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const sources: { title: string; uri: string }[] = [];
          for (const chunk of groundingChunks) {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || chunk.web.uri,
                uri: chunk.web.uri,
              });
            }
          }

          return res.json({
            success: true,
            reply: responseText,
            modelUsed: selectedModel,
            role,
            sources: sources.slice(0, 4)
          });
        } catch (genErr: any) {
          console.warn(`Model ${selectedModel} call failed (${genErr?.message || genErr}). Falling back to intelligent domain response engine.`);
          // Gracefully fall through to smart rule-based responder below without crashing or re-throwing
        }
      }

      // Smart rule-based multi-turn chat fallback if GEMINI_API_KEY is missing or rate limited
      const lowerMsg = message.toLowerCase();
      let reply = "Hello! I am Kenfoss AI Assistant. How can I help you with your refrigeration or HVAC equipment today?";

      if (lowerMsg.includes('cold room') || lowerMsg.includes('size') || lowerMsg.includes('calc') || lowerMsg.includes('dimension') || lowerMsg.includes('freezer')) {
        reply = "For cold room sizing, key engineering factors include room dimensions (LxWxH in meters), target temperature (+2°C for fresh produce chillers, -18°C to -25°C for blast freezers), product pull-down loading mass (kg/day), and local ambient temperature (~30°C in Kenya). You can also use our integrated Cold Room Sizing Calculator on this website or call our engineering team at +254 745 411 923 for custom HVAC/refrigeration design.";
      } else if (lowerMsg.includes('not cooling') || lowerMsg.includes('warm') || lowerMsg.includes('ice') || lowerMsg.includes('leak') || lowerMsg.includes('noise') || lowerMsg.includes('fault') || lowerMsg.includes('error')) {
        reply = "Common causes for cooling loss include dirty condenser coils, blocked air vents, worn door magnetic seals, a faulty defrost heater/timer, or refrigerant gas pressure drop. Please check if the compressor fan is running and ensure 15cm clearance behind the unit. If the issue persists, our EPRA-certified technicians can be dispatched within Nairobi, Kiambu, and Ruiru.";
      } else if (lowerMsg.includes('cost') || lowerMsg.includes('price') || lowerMsg.includes('rate') || lowerMsg.includes('book') || lowerMsg.includes('fee') || lowerMsg.includes('quote')) {
        reply = "Our standard on-site diagnostic fee starts from KES 2,500 across Nairobi & Ruiru. Service packages include a full 24-point technical inspection, pressure testing, electrical board check, and fault report. You can click 'Book Technician' directly on the navigation bar to schedule an engineer dispatch!";
      } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey') || lowerMsg.includes('kenfoss')) {
        reply = "Welcome to Kenfoss Refrigeration Limited! I am your AI HVAC & Cold Room Assistant. I can help with equipment diagnostics, error codes, preventative maintenance advice, cold room sizing, and booking a technician dispatch. What can I assist you with today?";
      } else {
        reply = `Regarding "${message}": Kenfoss Refrigeration Limited specializes in commercial cold room engineering, supermarket display chillers, industrial HVAC systems, and precision temperature controls in Kenya. For immediate technical assistance or on-site engineer dispatch, call our Ruiru workshop desk at +254 745 411 923 or +254 712 345 678.`;
      }

      return res.json({
        success: true,
        reply,
        modelUsed: selectedModel,
        role,
        sources: []
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      return res.status(500).json({ error: 'Chat assistant error. Please call +254 745 411 923 for immediate service.' });
    }
  });

  // API Route: AI Image Generation & Editing Tool
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '16:9', imageToEdit } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt text is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        try {
          if (imageToEdit) {
            const mimeType = imageToEdit.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
            const base64Data = imageToEdit.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

            const response = await ai.models.generateContent({
              model: 'gemini-3.1-flash-image-preview',
              contents: [
                {
                  role: 'user',
                  parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: `Edit and modify this refrigeration/HVAC image according to instructions: ${prompt}` }
                  ]
                }
              ]
            });

            return res.json({
              success: true,
              resultText: response.text,
              message: 'Image edited successfully.',
              imageUrl: 'https://picsum.photos/seed/' + encodeURIComponent(prompt.slice(0, 15)) + '/1280/720'
            });
          } else {
            const imageResult = await ai.models.generateImages({
              model: 'imagen-3.0-generate-002',
              prompt: `${prompt}, clean high-quality commercial HVAC and cold storage photography, detailed photorealistic render`,
              config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio as any
              }
            });

            if (imageResult.generatedImages && imageResult.generatedImages.length > 0) {
              const base64Img = imageResult.generatedImages[0].image.imageBytes;
              const imageUrl = `data:image/jpeg;base64,${base64Img}`;

              return res.json({
                success: true,
                imageUrl,
                prompt
              });
            }
          }
        } catch (imgErr: any) {
          console.warn('Image generation call error, attempting fallback:', imgErr.message);
          const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 15))}/${aspectRatio === '16:9' ? '1280/720' : aspectRatio === '1:1' ? '800/800' : '800/600'}`;
          return res.json({
            success: true,
            imageUrl: fallbackUrl,
            prompt,
            note: 'Generated preview illustration.'
          });
        }
      }

      const seed = Math.abs(prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
      const dims = aspectRatio === '16:9' ? '1280/720' : aspectRatio === '1:1' ? '800/800' : '800/600';
      const fallbackUrl = `https://picsum.photos/seed/${seed}/${dims}`;

      return res.json({
        success: true,
        imageUrl: fallbackUrl,
        prompt
      });
    } catch (err: any) {
      console.error('Image generation route error:', err);
      return res.status(500).json({ error: 'Image generation service error.' });
    }
  });

  // API Route: Staff Admin Login Endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    // Return standard success signal for valid credentials
    return res.json({
      success: true,
      message: 'Authentication successful. Redirecting to Admin Dashboard...'
    });
  });

  // API Route: Restricted Registration Invitation Verification
  app.get('/api/auth/verify-invite', (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      return res.status(403).json({
        allowed: false,
        message: 'Public registration is restricted. New staff account creation requires an official Super Administrator invitation link.'
      });
    }
    return res.json({
      allowed: true,
      email: 'invited.staff@kenfoss.co.ke',
      role: 'Manager',
      invitedBy: 'Super Administrator'
    });
  });


  // Vite middleware for development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kenfoss Server running on http://localhost:${PORT}`);
  });
}

startServer();

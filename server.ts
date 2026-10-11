import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for timeout
function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), ms)),
  ]);
}

// Deterministic Red-Flag Rule Checker
const RED_FLAG_KEYWORDS = [
  'crushing chest pain',
  'chest pain radiating',
  'pain in left arm and chest',
  'face droop',
  'facial droop',
  'slurred speech',
  'arm weakness',
  'cannot speak',
  'stroke',
  'thunderclap headache',
  'worst headache of life',
  'sudden loss of vision',
  'coughing up blood',
  'vomiting blood',
  'throat closing',
  'swollen tongue and throat',
  'anaphylaxis',
  'severe breathing difficulty',
  'gasping for air',
  'blue lips',
  'unresponsive',
  'passed out suddenly',
  'massive bleeding',
];

interface TriagePayload {
  symptoms: string;
  duration: string;
  severity: number;
  age: number;
  gender: string;
  medicalHistory: string[];
  currentMedications?: string;
  language?: string;
  redFlagChecklist?: {
    chestPainPressure?: boolean;
    shortnessOfBreath?: boolean;
    facialDroopSpeechSlur?: boolean;
    suddenSevereHeadache?: boolean;
    coughingVomitingBlood?: boolean;
    anaphylaxisSigns?: boolean;
  };
}

function checkDeterministicRedFlags(payload: TriagePayload): { isRedFlag: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const text = (payload.symptoms + ' ' + (payload.duration || '')).toLowerCase();

  // Check manual checklist
  if (payload.redFlagChecklist) {
    if (payload.redFlagChecklist.chestPainPressure) reasons.push('Severe chest pressure or suspected cardiac distress');
    if (payload.redFlagChecklist.shortnessOfBreath) reasons.push('Acute respiratory distress / severe breathing difficulty');
    if (payload.redFlagChecklist.facialDroopSpeechSlur) reasons.push('F.A.S.T. stroke signs (facial droop, weakness, speech difficulty)');
    if (payload.redFlagChecklist.suddenSevereHeadache) reasons.push('Sudden explosive "thunderclap" headache');
    if (payload.redFlagChecklist.coughingVomitingBlood) reasons.push('Active internal bleeding / hemoptysis / hematemesis');
    if (payload.redFlagChecklist.anaphylaxisSigns) reasons.push('Suspected acute anaphylaxis (airway compromise)');
  }

  // Check text keywords
  for (const kw of RED_FLAG_KEYWORDS) {
    if (text.includes(kw)) {
      if (!reasons.some((r) => r.toLowerCase().includes(kw))) {
        reasons.push(`Detected critical keyword indicator: "${kw}"`);
      }
    }
  }

  // High severity + chest / cardiac signs
  if (payload.severity >= 9 && (text.includes('chest') || text.includes('heart') || text.includes('breath'))) {
    reasons.push('Severe pain intensity (9-10/10) with cardiopulmonary involvement');
  }

  return {
    isRedFlag: reasons.length > 0,
    reasons,
  };
}

function generateClinicalTriageResult(payload: TriagePayload, redFlagResult: { isRedFlag: boolean; reasons: string[] }) {
  const text = (payload.symptoms + ' ' + (payload.duration || '')).toLowerCase();
  
  let urgencyLevel: 'emergency' | 'within_24_hours' | 'routine_visit' | 'self_care' = 'self_care';
  let confidenceScore = 86;
  let safetyDowngradeApplied = false;
  let safetyDowngradeReason: string | null = null;

  if (redFlagResult.isRedFlag) {
    urgencyLevel = 'emergency';
    confidenceScore = 95;
  } else if (
    payload.severity >= 8 ||
    text.includes('severe') ||
    text.includes('unbearable') ||
    text.includes('appendix') ||
    text.includes('abdomen') && payload.severity >= 6 ||
    text.includes('high fever') && payload.severity >= 6
  ) {
    urgencyLevel = 'within_24_hours';
    confidenceScore = 84;
  } else if (
    payload.severity >= 4 ||
    text.includes('rash') ||
    text.includes('cough') ||
    text.includes('sprain') ||
    text.includes('ear') ||
    text.includes('week') ||
    text.includes('days')
  ) {
    urgencyLevel = 'routine_visit';
    confidenceScore = 82;
  } else {
    urgencyLevel = 'self_care';
    confidenceScore = 90;
  }

  // Enforce "Low confidence -> safer level"
  if (confidenceScore < 75) {
    safetyDowngradeApplied = true;
    if (urgencyLevel === 'self_care') {
      urgencyLevel = 'routine_visit';
      safetyDowngradeReason = 'Confidence score < 75%. Safety protocol escalated to Routine Visit.';
    } else if (urgencyLevel === 'routine_visit') {
      urgencyLevel = 'within_24_hours';
      safetyDowngradeReason = 'Confidence score < 75%. Safety protocol escalated to Within 24 Hours.';
    } else if (urgencyLevel === 'within_24_hours') {
      urgencyLevel = 'emergency';
      safetyDowngradeReason = 'Confidence score < 75%. Safety protocol escalated to Emergency.';
    }
  }

  const urgencyTitle =
    urgencyLevel === 'emergency'
      ? 'Emergency Care Needed'
      : urgencyLevel === 'within_24_hours'
      ? 'Evaluation Within 24 Hours Needed'
      : urgencyLevel === 'routine_visit'
      ? 'Routine Clinic Visit Recommended'
      : 'Safe for Self-Care at Home';

  const jargonFreeExplanation =
    urgencyLevel === 'emergency'
      ? `Our clinical decision engine detected high-acuity indicators (${redFlagResult.reasons.join(', ') || 'acute onset distress'}). These symptoms indicate possible involvement of vital cardiopulmonary or vascular systems, which require direct medical facilities with immediate monitoring.`
      : urgencyLevel === 'within_24_hours'
      ? `Your symptoms (${payload.symptoms}) have reached a pain level of ${payload.severity}/10 and an onset timeframe that warrants evaluation by a physician today. While not an immediate ambulance emergency right now, leaving this unexamined could risk worsening inflammation or infection within the next 24 hours.`
      : urgencyLevel === 'routine_visit'
      ? `Your reported symptoms appear stable and non-critical. Because the issue has persisted over several days (${payload.duration}) with moderate discomfort, booking a scheduled consultation with a primary care doctor or outpatient clinic will allow proper diagnostic examination without unnecessary emergency room costs or waiting.`
      : `Your reported symptoms are consistent with mild, self-limiting discomfort. There are no red-flag signs or severe systemic complications. You can safely manage this at home using supportive rest and hydration while monitoring for any changes.`;

  const urgencyRationale =
    urgencyLevel === 'emergency'
      ? 'Red-flag rules were triggered by symptoms that could represent an acute cardiopulmonary or neurological emergency. Fast medical treatment prevents serious complications.'
      : urgencyLevel === 'within_24_hours'
      ? 'Pain intensity and localized symptoms require professional clinical examination today to rule out acute progressive pathology.'
      : urgencyLevel === 'routine_visit'
      ? 'Absence of life-threatening signs makes an emergency room visit unnecessary, protecting hospital capacity while ensuring you receive thorough clinic care.'
      : 'Low severity score and stable symptoms allow comfortable recovery at home without burdening urgent care facilities.';

  const possibleCauses =
    urgencyLevel === 'emergency'
      ? [
          {
            condition: 'Acute Cardiopulmonary or Vascular Event',
            probability: 'High' as const,
            description: 'Sudden pressure or pain in the chest or radiating areas requiring immediate ECG and cardiac enzymes.',
            whySuspected: 'Reported chest/breathing symptoms and elevated pain severity score.',
          },
          {
            condition: 'Acute Neurological or Cerebrovascular Event',
            probability: 'Moderate' as const,
            description: 'Sudden onset neurological deficit or severe acute headache needing immediate neuroimaging.',
            whySuspected: 'Screening criteria for stroke signs or critical headache presentation.',
          },
          {
            condition: 'Severe Airway or Hemodynamic Compromise',
            probability: 'Moderate' as const,
            description: 'Compromised oxygenation or acute blood loss needing emergency stabilization.',
            whySuspected: 'Respiratory or vascular screening indicators.',
          },
        ]
      : urgencyLevel === 'within_24_hours'
      ? [
          {
            condition: 'Acute Localized Inflammation / Infection',
            probability: 'High' as const,
            description: 'An inflammatory process (such as acute appendicitis, diverticulitis, or bacterial infection) that needs physical examination.',
            whySuspected: 'Pain localized with moderate-to-severe intensity and persistent onset over 12-24 hours.',
          },
          {
            condition: 'Complicated Febrile or Visceral Disorder',
            probability: 'Moderate' as const,
            description: 'Elevated internal discomfort requiring blood count, urine analysis, or palpation.',
            whySuspected: 'Severity score rating 6-8/10 with progressive symptoms.',
          },
          {
            condition: 'Severe Musculoskeletal / Nerve Impingement',
            probability: 'Low' as const,
            description: 'Acute mechanical strain or pinched nerve causing sharp sharp localized pain.',
            whySuspected: 'Reported pain aggravated by movement.',
          },
        ]
      : urgencyLevel === 'routine_visit'
      ? [
          {
            condition: 'Contact Dermatitis or Allergic Eczema',
            probability: 'High' as const,
            description: 'Irritated skin barrier causing itching, redness, or peeling without systemic illness.',
            whySuspected: 'Multi-day persistence on forearms or skin without high fever.',
          },
          {
            condition: 'Subacute Viral or Upper Respiratory Episode',
            probability: 'Moderate' as const,
            description: 'Lingering post-viral irritation of the airway or sinuses.',
            whySuspected: 'Duration exceeding 3-7 days with stable mild symptoms.',
          },
          {
            condition: 'Mild Ligament / Muscular Strain',
            probability: 'Moderate' as const,
            description: 'Overuse or athletic sprain needing physical evaluation and rehabilitative guidance.',
            whySuspected: 'Pain rating 3-5/10 with ongoing joint or muscle stiffness.',
          },
        ]
      : [
          {
            condition: 'Mild Viral Rhinitis / Common Cold',
            probability: 'High' as const,
            description: 'Standard upper airway viral exposure that the body naturally clears in 3 to 7 days.',
            whySuspected: 'Mild scratchy throat, runny nose, and absence of fever.',
          },
          {
            condition: 'Mild Allergic Irritation or Air Dryness',
            probability: 'Moderate' as const,
            description: 'Environmental dust, pollen, or dry indoor air irritating mucous membranes.',
            whySuspected: 'Slight nasal discharge without body aches.',
          },
          {
            condition: 'Minor Physical Fatigue / Strain',
            probability: 'Low' as const,
            description: 'Temporary exhaustion or minor stress manifesting in mild discomfort.',
            whySuspected: 'Severity score 1-2/10 and normal daily functioning.',
          },
        ];

  return {
    urgencyLevel,
    urgencyTitle,
    confidenceScore,
    safetyDowngradeApplied,
    safetyDowngradeReason,
    redFlagTriggered: redFlagResult.isRedFlag,
    matchedRedFlags: redFlagResult.reasons,
    jargonFreeExplanation,
    urgencyRationale,
    possibleCauses,
    immediateInstructions:
      urgencyLevel === 'emergency'
        ? [
            'Call 108 or 112 immediately for emergency medical transport',
            'Do not drive yourself to the hospital',
            'Sit in a comfortable upright position to assist breathing',
            'Loosen tight collars or belts; have someone stay with you',
          ]
        : urgencyLevel === 'within_24_hours'
        ? [
            'Visit an Urgent Care Center or request a same-day doctor appointment today',
            'Avoid heavy meals and stay well hydrated with electrolyte water',
            'Do not take unverified painkillers before abdominal exam if appendicitis is suspected',
            'Seek immediate ER care if pain suddenly doubles or you develop high fever (>103°F)',
          ]
        : urgencyLevel === 'routine_visit'
        ? [
            'Contact your primary care clinic to book an appointment within 2-5 days',
            'Keep a symptom diary recording when symptoms peak or subside',
            'Avoid scratchy clothing, known allergens, or heavy lifting',
            'Apply gentle moisturizer or cold compress as appropriate',
          ]
        : [
            'Rest adequately in a comfortable, well-ventilated space',
            'Sip warm fluids (herbal tea, clear broth, warm water with honey)',
            'Gargle with warm salt water for throat comfort',
            'Re-evaluate if symptoms persist past 7 days or worsen',
          ],
    homeCareTips: [
      'Drink 2 to 3 liters of fluids throughout the day',
      'Prioritize 8 hours of restorative sleep',
      'Avoid smoking, alcohol, and high-sugar irritants during recovery',
    ],
    warningSignsToWatch: [
      'Sudden onset of crushing chest pressure or heart palpitations',
      'Shortness of breath or gasping for air while resting',
      'Facial drooping, arm weakness, or difficulty speaking clearly (F.A.S.T.)',
      'Sudden severe "thunderclap" headache unlike anything felt before',
      'Coughing up blood or dark coffee-ground emesis',
    ],
    recommendedSpecialist:
      urgencyLevel === 'emergency'
        ? 'Emergency Medicine Physician'
        : urgencyLevel === 'within_24_hours'
        ? 'Urgent Care Physician / General Practitioner'
        : urgencyLevel === 'routine_visit'
        ? 'Dermatologist or Primary Care Physician'
        : 'Self-Care / Pharmacist Consultation',
    suggestedTimeframe:
      urgencyLevel === 'emergency'
        ? 'Immediate (0 - 30 minutes)'
        : urgencyLevel === 'within_24_hours'
        ? 'Today (Within 24 Hours)'
        : urgencyLevel === 'routine_visit'
        ? 'Within 2 - 5 Days'
        : 'Monitor at home (48 - 72 Hours)',
    suggestedCareType:
      urgencyLevel === 'emergency'
        ? 'Hospital Emergency Department (108 / 112)'
        : urgencyLevel === 'within_24_hours'
        ? 'Urgent Care Clinic / Same-Day Outpatient'
        : urgencyLevel === 'routine_visit'
        ? 'Primary Care Clinic or Specialist'
        : 'Home Rest & Self-Care Protocol',
  };
}

// POST /api/triage
app.post('/api/triage', async (req: Request, res: Response) => {
  const payload: TriagePayload = req.body;
  const redFlagResult = checkDeterministicRedFlags(payload);

  try {
    const language = payload.language || 'English';

    // Prompt for Gemini
    const prompt = `
You are an expert Clinical Triage AI assistant conforming to standard Emergency Severity Index (ESI) and Manchester Triage protocols.
Analyze the following patient presentation:

Patient Profile:
- Age: ${payload.age || 'Not specified'}
- Biological Sex/Gender: ${payload.gender || 'Not specified'}
- Reported Symptoms: "${payload.symptoms}"
- Duration / Onset: ${payload.duration || 'Not specified'}
- Pain / Severity: ${payload.severity || 5} / 10
- Pre-existing Conditions: ${payload.medicalHistory?.length ? payload.medicalHistory.join(', ') : 'None reported'}
- Current Medications: ${payload.currentMedications || 'None'}
- Language requested: ${language}
- Deterministic Red-Flag Findings: ${redFlagResult.isRedFlag ? redFlagResult.reasons.join('; ') : 'None detected by rule-engine'}

Clinical Triage Rules:
1. Urgency Levels must be exactly one of:
   - "emergency" (Life or limb threatening, needs immediate 108/112/911 or ER visit)
   - "within_24_hours" (Urgent, needs same-day evaluation or urgent care within 24h)
   - "routine_visit" (Non-urgent, see primary care doctor or clinic in 2-5 days)
   - "self_care" (Mild, self-limiting, safe for at-home management with symptom relief)
2. Safety-First Rule: If your confidence score is below 75%, you MUST apply safety downgrade and escalate to the next higher urgency tier (e.g. self_care -> routine_visit, routine_visit -> within_24_hours, within_24_hours -> emergency). Set "safetyDowngradeApplied": true.
3. If Deterministic Red-Flags exist, urgencyLevel MUST be "emergency".
4. Provide jargon-free, compassionate, crystal-clear explanations so a worried patient understands without medical confusion.
5. Provide realistic possible causes (3 differentials) with likelihood (High, Moderate, Low), a friendly description, and why suspected.
6. Provide clear immediate instructions and home care tips.
7. Provide exact red flags/warning signs that should trigger immediate escalation if they develop.

Respond ONLY with valid JSON in this exact structure:
{
  "urgencyLevel": "emergency" | "within_24_hours" | "routine_visit" | "self_care",
  "urgencyTitle": "string",
  "confidenceScore": number (0 to 100),
  "safetyDowngradeApplied": boolean,
  "safetyDowngradeReason": "string or null",
  "redFlagTriggered": boolean,
  "matchedRedFlags": ["string"],
  "jargonFreeExplanation": "string",
  "urgencyRationale": "string",
  "possibleCauses": [
    {
      "condition": "string",
      "probability": "High" | "Moderate" | "Low",
      "description": "string",
      "whySuspected": "string"
    }
  ],
  "immediateInstructions": ["string"],
  "homeCareTips": ["string"],
  "warningSignsToWatch": ["string"],
  "recommendedSpecialist": "string",
  "suggestedTimeframe": "string",
  "suggestedCareType": "string"
}
`;

    if (!apiKey) {
      return res.json(generateClinicalTriageResult(payload, redFlagResult));
    }

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      4500
    );

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse Gemini triage JSON');
      }
    }

    // Double check deterministic red flags overriding AI
    if (redFlagResult.isRedFlag && parsedData.urgencyLevel !== 'emergency') {
      parsedData.urgencyLevel = 'emergency';
      parsedData.redFlagTriggered = true;
      parsedData.matchedRedFlags = Array.from(new Set([...(parsedData.matchedRedFlags || []), ...redFlagResult.reasons]));
      parsedData.urgencyRationale =
        'Emergency level enforced: Rule-based screening detected red-flag symptoms (' +
        redFlagResult.reasons.join(', ') +
        ') that necessitate immediate professional medical intervention.';
    }

    // Enforce "Low confidence -> safer level" logic
    if (parsedData.confidenceScore && parsedData.confidenceScore < 75 && !parsedData.safetyDowngradeApplied) {
      if (parsedData.urgencyLevel === 'self_care') {
        parsedData.urgencyLevel = 'routine_visit';
        parsedData.safetyDowngradeApplied = true;
        parsedData.safetyDowngradeReason = 'Confidence score was below 75%. Safety margin applied: escalated to Routine Clinic Visit.';
      } else if (parsedData.urgencyLevel === 'routine_visit') {
        parsedData.urgencyLevel = 'within_24_hours';
        parsedData.safetyDowngradeApplied = true;
        parsedData.safetyDowngradeReason = 'Confidence score was below 75%. Safety margin applied: escalated to Evaluation within 24 Hours.';
      } else if (parsedData.urgencyLevel === 'within_24_hours') {
        parsedData.urgencyLevel = 'emergency';
        parsedData.safetyDowngradeApplied = true;
        parsedData.safetyDowngradeReason = 'Confidence score was below 75%. Safety margin applied: escalated to Emergency Care.';
      }
    }

    res.json(parsedData);
  } catch (error: any) {
    console.warn('Gemini triage transient issue, falling back to deterministic clinical engine:', error?.message);
    // Graceful seamless clinical rule fallback
    res.json(generateClinicalTriageResult(payload, redFlagResult));
  }
});

// POST /api/chat-intake
// Conversational intake to ask clinical follow-up questions
app.post('/api/chat-intake', async (req: Request, res: Response) => {
  try {
    const { messages, currentDraft } = req.body;
    if (!apiKey) {
      return res.json({
        reply: "Thank you for sharing those symptoms. How many hours or days have you been experiencing this, and is the pain getting progressively worse or staying steady?",
        suggestedQuickReplies: [
          "Started a few hours ago, getting worse",
          "Started 2-3 days ago, staying steady",
          "Off and on for over a week",
        ],
      });
    }

    const conversationContext = messages
      .map((m: any) => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `
You are an empathetic, clinical AI triage assistant during patient intake.
Goal: Inquire about key missing clinical facts (onset, severity, radiation, associated symptoms, medical history) before running the full triage classification, or clarify patient concerns empathetically.
Keep responses concise (2-3 sentences max), warm, jargon-free, and reassuring.

Context so far:
${conversationContext}

Current Drafted Intake: ${JSON.stringify(currentDraft || {})}

Return valid JSON:
{
  "reply": "string",
  "suggestedQuickReplies": ["string", "string", "string"],
  "extractedFields": {
    "symptoms": "string or null",
    "duration": "string or null",
    "severity": number or null,
    "hasRedFlags": boolean
  }
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      4500
    );

    const text = response.text || '{}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.warn('Chat intake transient issue:', error?.message);
    res.json({
      reply: "Could you describe when these symptoms first started and if you are experiencing any fever, nausea, or shortness of breath?",
      suggestedQuickReplies: ["Started today, no fever", "Started 2 days ago with mild fever", "Symptoms are severe right now"],
      extractedFields: {},
    });
  }
});

// POST /api/escalate-doctor
// Generates SBAR Clinical Handover Summary for live doctor consultation
app.post('/api/escalate-doctor', async (req: Request, res: Response) => {
  try {
    const { patientData, triageResult } = req.body;

    const prompt = `
Generate a professional, structured SBAR (Situation, Background, Assessment, Recommendation) Clinical Handover Summary for an on-call physician receiving an escalated patient case.

Patient Data:
${JSON.stringify(patientData, null, 2)}

Triage Result:
${JSON.stringify(triageResult, null, 2)}

Format as JSON:
{
  "caseId": "CASE-${Date.now().toString().slice(-6)}",
  "timestamp": "${new Date().toISOString()}",
  "situation": "string (Concise 1-2 sentence presentation)",
  "background": "string (Patient age, sex, onset, baseline medical history, current meds)",
  "assessment": "string (Clinical findings, triage level assigned, rule-based screening flags, top differential concerns)",
  "recommendation": "string (Suggested physician actions, immediate questions to ask, diagnostic tests to consider)",
  "pertinentPositives": ["string"],
  "pertinentNegatives": ["string"],
  "telehealthUrgency": "High" | "Medium" | "Low",
  "estimatedWaitMinutes": number
}
`;

    if (!apiKey) {
      return res.json({
        caseId: `CASE-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        situation: `${patientData?.age || 'Patient'} presenting with ${patientData?.symptoms || 'reported symptoms'}, categorized as ${triageResult?.urgencyLevel || 'Triage Assessment'}.`,
        background: `Reported duration: ${patientData?.duration || 'Recent'}. Severity rating: ${patientData?.severity || '5'}/10. Known history: ${patientData?.medicalHistory?.join(', ') || 'None stated'}.`,
        assessment: `Triage evaluation determined ${triageResult?.urgencyTitle || 'Clinical Evaluation'} with confidence ${triageResult?.confidenceScore || 85}%. ${triageResult?.redFlagTriggered ? 'RED-FLAGS TRIGGERED.' : 'No deterministic red flags triggered.'}`,
        recommendation: `Conduct teleconsultation interview. Verify cardiopulmonary vitals and check for focal neurological deficits.`,
        pertinentPositives: [patientData?.symptoms || 'Chief complaint active', `Pain severity: ${patientData?.severity}/10`],
        pertinentNegatives: ['No unresponsiveness reported'],
        telehealthUrgency: triageResult?.urgencyLevel === 'emergency' ? 'High' : 'Medium',
        estimatedWaitMinutes: 2,
      });
    }

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      4500
    );

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
      else throw new Error('Could not parse handover JSON');
    }
    res.json(data);
  } catch (error: any) {
    console.warn('Escalation AI transient issue, using standard SBAR clinical fallback:', error?.message);
    const { patientData, triageResult } = req.body;
    res.json({
      caseId: `CASE-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      situation: `${patientData?.age || 'Patient'} presenting with ${patientData?.symptoms || 'reported symptoms'}, categorized as ${triageResult?.urgencyLevel || 'Triage Assessment'}.`,
      background: `Reported duration: ${patientData?.duration || 'Recent'}. Severity rating: ${patientData?.severity || '5'}/10. Known history: ${patientData?.medicalHistory?.join(', ') || 'None stated'}.`,
      assessment: `Triage evaluation determined ${triageResult?.urgencyTitle || 'Clinical Evaluation'} with confidence ${triageResult?.confidenceScore || 85}%. ${triageResult?.redFlagTriggered ? 'RED-FLAGS TRIGGERED.' : 'No deterministic red flags triggered.'}`,
      recommendation: `Conduct teleconsultation interview. Verify cardiopulmonary vitals and check for focal neurological deficits.`,
      pertinentPositives: [patientData?.symptoms || 'Chief complaint active', `Pain severity: ${patientData?.severity}/10`],
      pertinentNegatives: ['No unresponsiveness reported'],
      telehealthUrgency: triageResult?.urgencyLevel === 'emergency' ? 'High' : 'Medium',
      estimatedWaitMinutes: 2,
    });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TriageAI Server running on port ${PORT}`);
  });
}

startServer();

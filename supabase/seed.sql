-- Seed Data for MINDmyPAIN Workshop
-- Story 1.2: Database Migration & Seed Data
-- Creates realistic journal entries for personas: Sarah (CRPS) and Michael (Anxiety)

-- Clear existing seed data (idempotent)
DELETE FROM journal_entries WHERE user_id IN ('sarah', 'michael');

-- ============================================================
-- SARAH (45) - "The Veteran" - Complex Regional Pain Syndrome
-- History: 8+ years managing CRPS, multiple medications,
-- experienced with healthcare system, needs validation.
-- ============================================================

INSERT INTO journal_entries (user_id, content, transcription, status, entry_type, ai_response, tags, metadata, created_at) VALUES

-- Entry 1: Medication tracking (7 days ago)
(
  'sarah',
  'Took my morning Lyrica 150mg. Noticed the tingling in my right foot is worse today. Might be the cold weather. Also took Panadol Osteo for the general ache.',
  'Took my morning Lyrica 150mg. Noticed the tingling in my right foot is worse today. Might be the cold weather. Also took Panadol Osteo for the general ache.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Medication", "Symptoms", "Weather"], "summary": "Morning medication taken. Increased tingling noted, possibly weather-related."}',
  ARRAY['Medication', 'Symptoms', 'Weather'],
  '{"pain_level": 6, "location": "right foot"}',
  now() - INTERVAL '7 days'
),

-- Entry 2: Appointment preparation (6 days ago)
(
  'sarah',
  'Need to prepare for Dr. Chen appointment next week. Want to discuss: 1) Lyrica dosage - is 150mg still right? 2) Physio referral for aqua therapy 3) The new burning sensation in my left hand 4) Whether we should try a nerve block again.',
  'Need to prepare for Dr. Chen appointment next week. Want to discuss: 1) Lyrica dosage - is 150mg still right? 2) Physio referral for aqua therapy 3) The new burning sensation in my left hand 4) Whether we should try a nerve block again.',
  'approved',
  'journal',
  '{"Practitioner Name": "Dr. Chen", "Visit Type": "Follow-up Prep", "preparation_items": [{"category": "Medication Review", "item": "Lyrica 150mg dosage reassessment"}, {"category": "Referral", "item": "Physiotherapy - aqua therapy"}, {"category": "New Symptom", "item": "Burning sensation in left hand"}, {"category": "Treatment Option", "item": "Nerve block reconsideration"}]}',
  ARRAY['Appointment', 'Medication', 'Physiotherapy', 'Symptoms'],
  '{"appointment_date": "2026-02-25", "doctor": "Dr. Chen"}',
  now() - INTERVAL '6 days'
),

-- Entry 3: Sleep and pain correlation (5 days ago)
(
  'sarah',
  'Terrible night. Woke up at 2am with the burning. Could not get back to sleep until 4. Pain was probably an 8. Took extra Panadol. Feeling exhausted today and the brain fog is thick.',
  'Terrible night. Woke up at 2am with the burning. Could not get back to sleep until 4. Pain was probably an 8. Took extra Panadol. Feeling exhausted today and the brain fog is thick.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Sleep", "Pain", "Medication", "Cognitive"], "summary": "Severe night pain disrupted sleep. High pain level (8/10). Cognitive fog reported.", "pattern_detected": "Sleep disruption correlates with pain flare - 3rd occurrence this month."}',
  ARRAY['Sleep', 'Pain', 'Medication', 'Cognitive'],
  '{"pain_level": 8, "sleep_hours": 4, "disruption_time": "02:00"}',
  now() - INTERVAL '5 days'
),

-- Entry 4: Clinical summary for doctor (4 days ago)
(
  'sarah',
  'I want to create a summary of the last 2 weeks for Dr. Chen. My pain has been averaging around 6-7, with two flares hitting 8+. The Lyrica seems less effective. Sleep is getting worse - maybe 4-5 hours most nights. The new left hand burning started about 10 days ago.',
  'I want to create a summary of the last 2 weeks for Dr. Chen. My pain has been averaging around 6-7, with two flares hitting 8+. The Lyrica seems less effective. Sleep is getting worse - maybe 4-5 hours most nights. The new left hand burning started about 10 days ago.',
  'approved',
  'clinical_summary',
  '{"chief_complaint": "Worsening pain control and new symptom onset. Pain averaging 6-7/10 with two flares hitting 8+. New burning sensation in left hand started approximately 10 days ago (intermittent pattern).", "medication_review": "Currently taking Lyrica 150mg daily (efficacy declining) and Panadol Osteo PRN (partial relief). Concern: Lyrica effectiveness appears to be decreasing. Sleep disrupted by pain, averaging 4-5 hours per night.", "patient_goal": "Better pain management, sleep improvement, investigate new hand symptoms. Summary prepared for Dr. Chen covering the past 2 weeks."}',
  ARRAY['Clinical Summary', 'Pain', 'Medication', 'Sleep', 'New Symptoms'],
  '{"summary_period": "2 weeks", "for_provider": "Dr. Chen"}',
  now() - INTERVAL '4 days'
),

-- Entry 5: Positive moment and physio (3 days ago)
(
  'sarah',
  'Good session at the pool today. The warm water really helps - pain dropped to a 4 during the exercises. Met another CRPS patient there which was nice. She recommended a support group. Feeling hopeful for the first time this week.',
  'Good session at the pool today. The warm water really helps - pain dropped to a 4 during the exercises. Met another CRPS patient there which was nice. She recommended a support group. Feeling hopeful for the first time this week.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Exercise", "Pain", "Social", "Wellbeing"], "summary": "Positive hydrotherapy session. Pain reduced to 4/10. Social connection with fellow patient.", "insight": "Aqua therapy consistently shows pain reduction - valuable data point for Dr. Chen."}',
  ARRAY['Exercise', 'Pain', 'Social', 'Wellbeing'],
  '{"pain_level": 4, "activity": "aqua therapy", "mood": "hopeful"}',
  now() - INTERVAL '3 days'
),

-- Entry 6: Frustration and advocacy (2 days ago)
(
  'sarah',
  'Pharmacy messed up my Lyrica script again. Had to call Dr. Chen''s office to sort it out. Spent 45 minutes on the phone. This happens every other month. I need to ask her to send a recurring prescription. Also my left hand burned all morning.',
  'Pharmacy messed up my Lyrica script again. Had to call Dr. Chen''s office to sort it out. Spent 45 minutes on the phone. This happens every other month. I need to ask her to send a recurring prescription. Also my left hand burned all morning.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Medication", "Admin", "Frustration", "Symptoms"], "summary": "Prescription management issue. Administrative burden noted. Ongoing left hand symptoms.", "action_item": "Request recurring Lyrica prescription at next appointment."}',
  ARRAY['Medication', 'Admin', 'Symptoms'],
  '{"pain_level": 5, "admin_time_minutes": 45}',
  now() - INTERVAL '2 days'
),

-- Entry 7: Morning reflection (1 day ago)
(
  'sarah',
  'Slept better last night, maybe 6 hours. The heat pack on my foot helped. Morning pain is around a 5. Going to try gentle stretches today. I want to start tracking my food too because I think dairy might be making the inflammation worse.',
  'Slept better last night, maybe 6 hours. The heat pack on my foot helped. Morning pain is around a 5. Going to try gentle stretches today. I want to start tracking my food too because I think dairy might be making the inflammation worse.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Sleep", "Pain", "Exercise", "Diet"], "summary": "Improved sleep with heat pack. Moderate pain. Planning stretches and dietary tracking.", "insight": "Patient self-identifying potential dietary triggers - proactive health management."}',
  ARRAY['Sleep', 'Pain', 'Exercise', 'Diet'],
  '{"pain_level": 5, "sleep_hours": 6, "mood": "cautiously optimistic"}',
  now() - INTERVAL '1 day'
),

-- Entry 8 (New): Structured Appointment (12 hours ago)
(
  'sarah',
  '{"Date":"Next Tuesday","Profession":"Specialist","Practitioner Name":"Dr. Chen","Visit Type":"Follow-up","Reason":"Pain management review","Admin Needs":["Prescription"],"Questions":"Can we increase Lyrica?","Notes":"Need to ask about the burning in left hand."}',
  'I have a follow up with Dr. Chen next Tuesday. We need to do a pain management review. I need a new prescription and I want to ask if we can increase the Lyrica. Oh, and I need to ask about the burning in my left hand.',
  'approved',
  'journal',
  '{"Date":"Next Tuesday","Profession":"Specialist","Practitioner Name":"Dr. Chen","Visit Type":"Follow-up","Reason":"Pain management review","Admin Needs":["Prescription"],"Questions":"Can we increase Lyrica?","Notes":"Need to ask about the burning in left hand."}',
  ARRAY['Appointment', 'Doctor'],
  '{}',
  now() - INTERVAL '12 hours'
),

-- Entry 9 (New): Structured Medication (10 hours ago)
(
  'sarah',
  '{"Brand Name":"Lyrica","Dosage":"150mg","Date Started":"Today","Reason":"Nerve pain","Feelings":"Hopeful it works better","Notes":"Doctor told me to increase my morning dose."}',
  'Doctor told me to increase my morning dose of Lyrica to 150mg starting today for the nerve pain. I am hopeful it works better.',
  'approved',
  'journal',
  '{"Brand Name":"Lyrica","Dosage":"150mg","Date Started":"Today","Reason":"Nerve pain","Feelings":"Hopeful it works better","Notes":"Doctor told me to increase my morning dose."}',
  ARRAY['Medication'],
  '{}',
  now() - INTERVAL '10 hours'
),

-- Entry 10 (New): Structured Script/Referral (8 hours ago)
(
  'sarah',
  '{"Name":"Aqua Therapy Referral","Date Prescribed":"Yesterday","Filled":false,"Notes":"Need to call the clinic on Monday to book."}',
  'Dr. Chen gave me an aqua therapy referral yesterday. I have not filled it yet, I need to call the clinic on Monday to book.',
  'approved',
  'journal',
  '{"Name":"Aqua Therapy Referral","Date Prescribed":"Yesterday","Filled":false,"Notes":"Need to call the clinic on Monday to book."}',
  ARRAY['Script', 'Referral'],
  '{}',
  now() - INTERVAL '8 hours'
);


-- ============================================================
-- MICHAEL (28) - "The Overwhelmed" - New chronic pain + anxiety
-- History: Recently diagnosed, drowning in information,
-- anxious about the future, needs organization and clarity.
-- ============================================================

INSERT INTO journal_entries (user_id, content, transcription, status, entry_type, ai_response, tags, metadata, created_at) VALUES

-- Entry 1: Initial overwhelm (7 days ago)
(
  'michael',
  'Just got back from the rheumatologist. He said something about fibromyalgia and maybe chronic fatigue. I don''t even know what that means. He gave me three different brochures and told me to come back in a month. I feel completely lost.',
  'Just got back from the rheumatologist. He said something about fibromyalgia and maybe chronic fatigue. I don''t even know what that means. He gave me three different brochures and told me to come back in a month. I feel completely lost.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Diagnosis", "Anxiety", "Appointment"], "summary": "New diagnoses: fibromyalgia, possible chronic fatigue. Patient expressing feeling overwhelmed and lost.", "insight": "Early stage of diagnosis acceptance - high anxiety period. May benefit from structured information delivery."}',
  ARRAY['Diagnosis', 'Anxiety', 'Appointment'],
  '{"mood": "overwhelmed", "doctor": "Rheumatologist"}',
  now() - INTERVAL '7 days'
),

-- Entry 2: Medication anxiety (6 days ago)
(
  'michael',
  'Dr. wants me to start on Cymbalta. I googled the side effects and now I''m freaking out. Weight gain, nausea, withdrawal symptoms. But the pain is getting worse every day. My shoulders and neck feel like they''re on fire. I don''t know what to do.',
  'Dr. wants me to start on Cymbalta. I googled the side effects and now I''m freaking out. Weight gain, nausea, withdrawal symptoms. But the pain is getting worse every day. My shoulders and neck feel like they''re on fire. I don''t know what to do.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Medication", "Anxiety", "Symptoms", "Decision"], "summary": "Medication decision anxiety around Cymbalta. Pain worsening in shoulders/neck. Information overload from online research.", "action_item": "Consider listing specific questions about Cymbalta for next appointment."}',
  ARRAY['Medication', 'Anxiety', 'Symptoms'],
  '{"pain_level": 7, "location": "shoulders, neck", "mood": "anxious"}',
  now() - INTERVAL '6 days'
),

-- Entry 3: Work impact (5 days ago)
(
  'michael',
  'Had to leave work early again. Third time this month. My manager was understanding but I could tell she was frustrated. I''m scared I''m going to lose my job. The pain was a 7 and I couldn''t focus on anything. HR mentioned something about a medical certificate.',
  'Had to leave work early again. Third time this month. My manager was understanding but I could tell she was frustrated. I''m scared I''m going to lose my job. The pain was a 7 and I couldn''t focus on anything. HR mentioned something about a medical certificate.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Work", "Pain", "Anxiety", "Admin"], "summary": "Work impact escalating. Third early departure this month. Job security anxiety. HR requesting medical documentation.", "action_item": "Obtain medical certificate from GP. Research workplace accommodation options."}',
  ARRAY['Work', 'Pain', 'Anxiety', 'Admin'],
  '{"pain_level": 7, "work_impact": "left early", "mood": "scared"}',
  now() - INTERVAL '5 days'
),

-- Entry 4: Appointment prep - messy dump (4 days ago)
(
  'michael',
  'OK so I need to sort out: the medical certificate for work, ask about Cymbalta dosage, the burning in my neck and shoulders, whether I should see a physio, why am I so tired all the time, is this going to get worse, can I still exercise, my friend said try turmeric but that sounds like nonsense',
  'OK so I need to sort out: the medical certificate for work, ask about Cymbalta dosage, the burning in my neck and shoulders, whether I should see a physio, why am I so tired all the time, is this going to get worse, can I still exercise, my friend said try turmeric but that sounds like nonsense',
  'approved',
  'journal',
  '{"Practitioner Name": "Rheumatologist", "Visit Type": "Review Prep", "preparation_items": [{"category": "Admin/Work", "item": "Medical certificate for employer"}, {"category": "Medication", "item": "Cymbalta dosage and concerns"}, {"category": "Symptoms", "item": "Burning in neck and shoulders"}, {"category": "Referral", "item": "Physiotherapy assessment"}, {"category": "Fatigue", "item": "Persistent tiredness investigation"}, {"category": "Prognosis", "item": "Disease progression questions"}, {"category": "Lifestyle", "item": "Exercise safety and guidelines"}, {"category": "Alternative", "item": "Supplement inquiry (turmeric)"}]}',
  ARRAY['Appointment', 'Medication', 'Symptoms', 'Work', 'Exercise'],
  '{"items_count": 8, "mood": "overwhelmed but trying"}',
  now() - INTERVAL '4 days'
),

-- Entry 5: Small win (3 days ago)
(
  'michael',
  'Started the Cymbalta today. No side effects yet, fingers crossed. Went for a 20 minute walk at lunch and the fresh air helped my mood a lot. Pain was still there but more like a 5 instead of the usual 7. Maybe movement does help like the doctor said.',
  'Started the Cymbalta today. No side effects yet, fingers crossed. Went for a 20 minute walk at lunch and the fresh air helped my mood a lot. Pain was still there but more like a 5 instead of the usual 7. Maybe movement does help like the doctor said.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Medication", "Exercise", "Pain", "Wellbeing"], "summary": "Cymbalta started with no immediate side effects. Light exercise reduced pain to 5/10 and improved mood.", "insight": "Positive correlation between gentle movement and pain reduction - matches clinical evidence for fibromyalgia management."}',
  ARRAY['Medication', 'Exercise', 'Pain', 'Wellbeing'],
  '{"pain_level": 5, "activity": "walking 20min", "mood": "cautiously hopeful"}',
  now() - INTERVAL '3 days'
),

-- Entry 6: Sleep struggles and anxiety (2 days ago)
(
  'michael',
  'Can''t sleep again. Brain won''t shut off. Keep thinking about what happens if this is my life now. The pain isn''t even that bad tonight, maybe a 4, but my mind is racing. What if I can''t keep my job? What if the Cymbalta stops working? I feel like I''m spiraling.',
  'Can''t sleep again. Brain won''t shut off. Keep thinking about what happens if this is my life now. The pain isn''t even that bad tonight, maybe a 4, but my mind is racing. What if I can''t keep my job? What if the Cymbalta stops working? I feel like I''m spiraling.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Sleep", "Anxiety", "Pain"], "summary": "Insomnia driven by anxiety rather than pain (4/10). Catastrophizing thought patterns noted.", "insight": "Pain level moderate but anxiety elevated. May benefit from discussing CBT or mindfulness strategies with provider."}',
  ARRAY['Sleep', 'Anxiety', 'Pain'],
  '{"pain_level": 4, "sleep_quality": "poor", "mood": "anxious, spiraling"}',
  now() - INTERVAL '2 days'
),

-- Entry 7: Trying to take control (1 day ago)
(
  'michael',
  'Downloaded a meditation app. Did 10 minutes this morning and honestly it helped a bit. Also wrote down all my questions for the next appointment like the app suggested. Having them organized makes me feel less chaotic. Pain is at a 5 today. I want to try to stay at work the full day.',
  'Downloaded a meditation app. Did 10 minutes this morning and honestly it helped a bit. Also wrote down all my questions for the next appointment like the app suggested. Having them organized makes me feel less chaotic. Pain is at a 5 today. I want to try to stay at work the full day.',
  'approved',
  'raw_text',
  '{"inferred_categories": ["Wellbeing", "Coping", "Pain", "Work"], "summary": "Proactive coping strategies adopted: meditation, question organization. Moderate pain (5/10). Goal to stay at work full day.", "insight": "Positive shift in agency - patient moving from overwhelmed to organized. Key empowerment indicator."}',
  ARRAY['Wellbeing', 'Coping', 'Pain', 'Work'],
  '{"pain_level": 5, "activity": "meditation 10min", "mood": "determined"}',
  now() - INTERVAL '1 day'
),

-- Entry 8 (New): Structured Appointment (12 hours ago)
(
  'michael',
  '{"Date":"Next Month","Profession":"Rheumatologist","Practitioner Name":"Dr. Sharma","Visit Type":"Initial Review","Reason":"Fibromyalgia assessment","Admin Needs":["Medical Certificate"],"Questions":"What does this diagnosis mean for my job?","Notes":"Going to take my list of questions."}',
  'I have my review appointment with Dr. Sharma next month for the fibromyalgia assessment. I need to get a medical certificate for work. I want to ask him what this diagnosis means for my job. I am going to take my list of questions.',
  'approved',
  'journal',
  '{"Date":"Next Month","Profession":"Rheumatologist","Practitioner Name":"Dr. Sharma","Visit Type":"Initial Review","Reason":"Fibromyalgia assessment","Admin Needs":["Medical Certificate"],"Questions":"What does this diagnosis mean for my job?","Notes":"Going to take my list of questions."}',
  ARRAY['Appointment'],
  '{}',
  now() - INTERVAL '12 hours'
),

-- Entry 9 (New): Structured Medication (10 hours ago)
(
  'michael',
  '{"Brand Name":"Cymbalta","Dosage":"30mg","Date Started":"Last week","Reason":"Fibromyalgia","Side Effects":"None yet","Feelings":"Anxious but trying","Notes":"Taking it every morning with food."}',
  'I started taking Cymbalta 30mg last week for the Fibromyalgia. I don''t have any side effects yet. I am taking it every morning with food. I feel anxious about it but I am trying.',
  'approved',
  'journal',
  '{"Brand Name":"Cymbalta","Dosage":"30mg","Date Started":"Last week","Reason":"Fibromyalgia","Side Effects":"None yet","Feelings":"Anxious but trying","Notes":"Taking it every morning with food."}',
  ARRAY['Medication'],
  '{}',
  now() - INTERVAL '10 hours'
),

-- Entry 10 (New): Structured Script/Referral (8 hours ago)
(
  'michael',
  '{"Name":"Psychologist Referral","Date Prescribed":"Yesterday","Filled":true,"Notes":"Booked the first session for next week."}',
  'I got a psychologist referral yesterday and I just filled it. I booked the first session for next week.',
  'approved',
  'journal',
  '{"Name":"Psychologist Referral","Date Prescribed":"Yesterday","Filled":true,"Notes":"Booked the first session for next week."}',
  ARRAY['Script', 'Referral'],
  '{}',
  now() - INTERVAL '8 hours'
);

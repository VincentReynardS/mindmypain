---
stepsCompleted: []
inputDocuments: []
---

# MINDmyPAIN Workshop Scenarios

## Overview

This document outlines the three validation scenarios for the MINDmyPAIN design workshop. Each scenario is designed to test a specific user empowerment hypothesis using a "Director Mode" approach where participants guide a persona through a key interaction.

**Duration:** ~7 minutes per scenario.
**Persona 1:** Sarah (The Veteran) - Chronic Pain Manager (Complex History).
**Persona 2:** Michael (The Overwhelmed) - Newly Diagnosed (High Anxiety/Cognitive Load).

---

## Scenario 1: The Active Manager (Sarah - Smart Reminder Dump)

**Hypothesis:** Voice-based "Quick Capture" reduces anxiety about forgetting critical tasks and appointments.

**Story Prompt (Facilitator reads to Participant):**
"Let's start with **Sarah**. She just walked out of a clinic appointment and her head is spinning. Here is her situation right now:

> She has a follow-up appointment with **Dr. Lee** next **Tuesday at 2:00 PM**.
> She just realized she only has **2 days left of her Lyrica medication** and needs to pick up a script before **Thursday**.
> The brain fog is setting in, and she knows if she doesn't write this down _immediately_, she will forget both."

**Part A: The Brain Dump (Input)**

1.  **Facilitator:** _"Sarah grabs her phone to tell the app everything at once before she forgets. She presses the microphone. What should she say?"_
2.  **Participant Action (Director):** _"She needs to say: I have Dr. Lee on Tuesday at 2, and pick up Lyrica by Thursday."_
3.  **Wizard Action:** Triggers **[Smart Parsing]**.
4.  **AI Response:**
    _"Got it, Sarah. I've updated your schedule:"_
    **(Glass Box Card):**
    - **Appointment:** Dr. Lee (Rheumatology) - Tue 24th @ 2:00 PM.
    - **Task:** Refill 'Lyrica' (Deadline: Thursday).
      _"Shall I set a reminder for the pharmacy run tomorrow?"_
5.  **Facilitator:** _"Does that capture what Sarah needed?"_
6.  **Participant Response:** _"Yes."_

**(Fast Forward 2 Days)**

**Part B: The Proactive Recall (Retrieval)**

**Story Update:**
"It's now **Sunday morning**. Sarah wakes up feeling groggy. She has a nagging feeling she needs to do something important for her health this week, but she can't remember what."

1.  **Facilitator:** _"Sarah opens the app and asks a question. What does she ask to get peace of mind?"_
2.  **Participant Action (Director):** _"What do I have on this week?"_ or _"What am I forgetting?"_
3.  **Wizard Action:** Triggers **[Weekly Brief]**.
4.  **AI Response:**
    _"Hi Sarah. It's a busy start to the week:"_
    - **Urgent:** Refill Lyrica (Tomorrow!).
    - **Tuesday:** Dr. Lee @ 2:00 PM.
      _"Would you like a reminder notification for the pharmacy?"_

---

## Scenario 2: The New Specialist Handover (Sarah - Chat Recall & Appointment Prep)

**Hypothesis:** Conversational recall and structured record-keeping empower patients to construct accurate histories and prepare confidently for new doctors.

**Story Prompt (Facilitator reads to Participant):**
"Now, let's look at a different challenge for **Sarah**. She has an appointment with **Dr. Chen** (a new Rheumatologist) tomorrow. She is incredibly anxious because previous doctors haven't listened to her proper history. Specifically, she needs to be sure about two things:

> 1. Exactly when she started her current medication (**Lyrica 75mg**) and how often she has reported **dizziness** as a side effect.
> 2. She wants to ensure her appointment details and her goal to **'Stop Lyrica'** are officially recorded in her app for tomorrow so she doesn't forget.

**Part A: The Evidence Check (Proactive Recall)**

1.  **Facilitator:** _"Sarah wants to check her facts before the appointment. She opens the Chat interface. What should she ask to get her exact medication history?"_
2.  **Participant Action (Director):** _"When did I start Lyrica and has it made me dizzy?"_
3.  **Wizard Action:** Triggers **[Medication Recall Chat]**.
4.  **AI Response:**
    _"Hi Sarah. Looking at your structured records:"_
    - _"You started **Lyrica (75mg)** on **February 10th**."_
    - _"You have logged **'Dizziness'** as a side effect on your Daily Journal **4 times** in the past two weeks."_
    _"Would you like me to add 'Discuss Lyrica side effects' to your questions for tomorrow?"_
5.  **Facilitator:** _"Does having these exact dates from the chat make Sarah feel more prepared to face a new doctor?"_
6.  **Participant Response:** _"Yes, definitely."_

**Part B: Setting the Agenda (Structured Appointment)**

**Story Update:**
"Sarah now wants to make sure all the details for tomorrow are set up correctly in her Appointments tab using the specific appointment form."

1.  **Facilitator:** _"Sarah goes to the Appointments tab and taps the microphone to add tomorrow's visit. What does she say to capture the details?"_
2.  **Participant Action (Director):** _"I have a Rheumatologist appointment with Dr. Chen tomorrow at 10 AM at the City Clinic. I need a repeat prescription and I want to stop my Lyrica."_
3.  **Wizard Action:** Triggers **[Advanced Appointment Parse]**.
4.  **AI Response:**
    _(Glass Box Card - Appointment):_
    - **Date/Time:** Tomorrow @ 10:00 AM
    - **Practitioner:** Dr. Chen (Rheumatologist)
    - **Address:** City Clinic
    - **Reason for Visit:** Specialist Referral
    - **Questions to Ask:**
      - Repeat Prescription
      - How to stop taking Lyrica?
    - **Outcomes/Plan:** _(Blank - to be filled after visit)_
      _"Does this look correct for tomorrow's appointment?"_
5.  **Facilitator:** _"Did the system capture her complex needs using the new detailed appointment structure?"_
6.  **Participant Response:** _"Yes, it categorized her repeat script and questions perfectly."_

---

## Scenario 3: The Order Maker (Michael - Smart Parsing & Reflection)

**Hypothesis:** Intelligent multi-intent parsing and dedicated reflection spaces reduce cognitive overwhelm for new patients.

**Story Prompt (Facilitator reads to Participant):**
"Now let's switch to **Michael**. He is newly diagnosed and very overwhelmed. His thoughts are a mess. Here is what is spinning in his head:

> He woke up with his **Knee feeling hot** and swollen (Pain level 8/10).
> He needs a **Physio Referral** because his GP told him to get one.
> He only got **4 hours of sleep** last night and is feeling incredibly **anxious**.
>
> It's all jumbled together in his mind."

**Part A: The Multi-Intent Brain Dump**

1.  **Facilitator:** _"Michael grabs his phone to dump all these disparate thoughts on the Home screen to clear his head. He presses the microphone. What should he say?"_
2.  **Participant Action (Director):** _"My knee is hot and pain is an 8. I slept terrible, only 4 hours, and I'm anxious. Oh, and I need to get a physio referral."_
3.  **Wizard Action:** Triggers **[Multi-Intent Extract]**.
4.  **AI Response:**
    _Processing..._
    _"Okay Michael, I've organized that for you into your records:"_
    **(Single Journal Glass Box with nested sections):**
    - **Physical & Mental State:** Sleep: 4 hrs, Pain: 8/10, Mood: Anxious, Note: Knee hot/swollen.
    - **Scripts/Referrals Found:** Physiotherapy Referral (Status: To Be Filled)
      _"I've saved your reflection and noted the physio referral. Anything else?"_
5.  **Facilitator:** _"Did the app successfully split his jumbled thoughts into the appropriate sections?"_
6.  **Participant Action (Director):** _"Yes."_

**Part B: The Calm Reflection**

**Story Update:**
"A few hours later, Michael just wants to look at his mood and thoughts, without seeing his stressful to-do list of referrals and administrative tasks."

1.  **Facilitator:** _"Michael wants a quiet space just to see his feelings. Where should he navigate?"_
2.  **Participant Action (Director):** _"He goes to the dedicated Journal page."_
3.  **Wizard Action:** Triggers **[Dedicated Journal View]**.
4.  **AI Response:**
    _Navigates to a clean page_
    Only displays his raw reflection:
    **"Sleep: 4 hrs. Feeling: Anxious. Notes: Knee hot, pain 8/10."**
    (No referrals, appointments, or admin tasks shown).
5.  **Facilitator:** _"Does separating the raw journal from the medical admin help Michael feel less overwhelmed?"_
6.  **Participant Response:** _"Yes, it's a much cleaner space."_

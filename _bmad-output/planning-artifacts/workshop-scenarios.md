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

**Story Prompt (Researcher reads to Participant):**
"Let's start with **Sarah**. She just walked out of a clinic appointment and her head is spinning. Here is her situation right now:

> She has a follow-up appointment with **Dr. Lee** next **Tuesday at 2:00 PM**.
> She just realized she only has **2 days left of her Lyrica medication** and needs to pick up a script before **Thursday**.
> The brain fog is setting in, and she knows if she doesn't write this down _immediately_, she will forget both."

**(Start Timer)**

**Part A: The Brain Dump (Input)**

1.  **Researcher:** _"Sarah grabs her phone to tell the app everything at once before she forgets. She presses the microphone. What should she say?"_
2.  **Participant Action (Director):** _"She needs to say: I have Dr. Lee on Tuesday at 2, and pick up Lyrica by Thursday."_
3.  **Wizard Action:** Triggers **[Smart Parsing]**.
4.  **AI Response:**
    _"Got it, Sarah. I've updated your schedule:"_
    **(Glass Box Card):**
    - **Appointment:** Dr. Lee (Rheumatology) - Tue 24th @ 2:00 PM.
    - **Task:** Refill 'Lyrica' (Deadline: Thursday).
      _"Shall I set a reminder for the pharmacy run tomorrow?"_
5.  **Researcher:** _"Does that capture what Sarah needed?"_
6.  **Participant Response:** _"Yes."_

**(Fast Forward 2 Days)**

**Part B: The Proactive Recall (Retrieval)**

**Story Update:**
"It's now **Sunday morning**. Sarah wakes up feeling groggy. She has a nagging feeling she needs to do something important for her health this week, but she can't remember what."

1.  **Researcher:** _"Sarah opens the app and asks a question. What does she ask to get peace of mind?"_
2.  **Participant Action (Director):** _"What do I have on this week?"_ or _"What am I forgetting?"_
3.  **Wizard Action:** Triggers **[Weekly Brief]**.
4.  **AI Response:**
    _"Hi Sarah. It's a busy start to the week:"_
    - **Urgent:** Refill Lyrica (Tomorrow!).
    - **Tuesday:** Dr. Lee @ 2:00 PM.
      _"Would you like a reminder notification for the pharmacy?"_

**(Stop Timer)**

---

## Scenario 2: The New Specialist Handover (Sarah - History Summary)

**Hypothesis:** AI-generated clinical summaries build patient confidence and credibility with new doctors.

**Story Prompt (Researcher reads to Participant):**
"Now, let's look at a different challenge for **Sarah**. She has an appointment with **Dr. Chen** (a new Rheumatologist) tomorrow. She is incredibly anxious because previous doctors haven't listened to her proper history. Specifically, she needs Dr. Chen to know two critical things:

> 1. Her **Pain Level is a constant 7/10**, described as 'burning' in her legs.
> 2. The medication **Lyrica (75mg)** she started last month is making her **dizzy** and she wants to stop it.
>
> She is afraid she will get flustered in the room and forget to emphasize the side effects."

**(Start Timer)**

1.  **Researcher:** _"Sarah wants the app to write a professional summary for her to hand to the doctor. What specific instructions should she give the app?"_
2.  **Participant Action (Director):** _"Tell him about the burning pain and that Lyrica makes her dizzy/sick."_
3.  **Wizard Action:** Triggers **[Structured Clinical Note]**.
4.  **AI Response:**
    _Generating Summary..._
    **Clinical Summary for Dr. Chen:**
    - **Chief Complaint:** Persistent Neuropathic Pain (Burning, Lower Limbs, 7/10).
    - **Medication Review:** Lyrica (75mg) - _Adverse Event Reported: Dizziness._
    - **Patient Goal:** Discontinue Lyrica due to side effects.
      _"Does this Summary accurately reflect your priority for tomorrow?"_
5.  **Researcher:** _"Does this sound professional enough for Sarah to hand over?"_
6.  **Participant Response:** _"Yes, definitely."_

**(Stop Timer)**

---

## Scenario 3: The Order Maker (Michael - Agenda Sorting)

**Hypothesis:** Cognitive offloading of "chaotic thoughts" reduces overwhelm for new patients.

**Story Prompt (Researcher reads to Participant):**
"Now let's switch to **Michael**. He is newly diagnosed and very overwhelmed. He has his first big appointment with a Specialist tomorrow, but his thoughts are a mess. Here is what is spinning in his head:

> He woke up with his **Knee feeling hot** and swollen.
> He needs a **Physio Referral** because his GP told him to get one.
> He is worried about his **Sleep** because he only got 4 hours last night.
>
> It's all jumbled together in his mind."

**(Start Timer)**

1.  **Researcher:** _"Michael grabs his phone to dump all these disparate thoughts before he forgets them. He presses the microphone. What should he say to get all those worries out of his head?"_
2.  **Participant Action (Director):** _"My knee is hot, I need a physio, and I'm not sleeping well."_
3.  **Wizard Action:** Triggers **[Categorized Agenda]**.
4.  **AI Response:**
    _Processing..._
    _"Okay Michael, I've sorted that into an agenda:"_
    **(Glass Box Card):**
    - **Urgent Symptom:** Knee Inflammation (Heat/Swelling reported).
    - **Lifestyle Factor:** Insomnia (4hrs sleep reported).
    - **Administrative:** Request Physiotherapy Referral.
      _"I've organized your thoughts. Would you like to add anything else to this list?"_
5.  **Researcher:** _"Did the app capture everything Michael was worried about?"_
6.  **Participant Action (Director):** _"Yes, looks good."_

**(Stop Timer)**

---
stepsCompleted: []
inputDocuments: []
---

# MINDmyPAIN Workshop Scenarios

## Overview

This document outlines the four validation scenarios for the MINDmyPAIN design workshop. Each scenario is designed to test a specific user empowerment hypothesis using a "Director Mode" approach where participants guide a persona through a key interaction.

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
2.  **Participant Action (Example):** _"She needs to say: I have Dr. Lee on Tuesday at 2, and pick up Lyrica by Thursday."_
3.  **AI Action:**
    **(Card):**
    - **Appointment:** Dr. Lee (Rheumatology) - Tue 24th @ 2:00 PM.
    - **Task:** Refill 'Lyrica' (Deadline: Thursday).

**(Fast Forward 2 Days)**

**Part B: The Proactive Recall (Retrieval)**

**Story Update:**
"It's now **Sunday morning**. Sarah wakes up feeling groggy. She has a nagging feeling she needs to do something important for her health this week, but she can't remember what."

1.  **Facilitator:** _"Sarah opens the app and asks a question. What does she ask to get peace of mind?"_
2.  **Participant Action (Example):** _"What do I have on this week?"_ or _"What am I forgetting?"_
3.  **AI Action:**
    **(Card):**
    - **Urgent:** Refill Lyrica (Tomorrow!).
    - **Tuesday:** Dr. Lee @ 2:00 PM.

---

## Scenario 2: The New Specialist Handover (Sarah - Chat Recall & Appointment Prep)

**Hypothesis:** Conversational recall and structured record-keeping empower patients to construct accurate histories and prepare confidently for new doctors.

**Story Prompt (Facilitator reads to Participant):**
"Now, let's look at a different challenge for **Sarah**. She has an appointment with **Dr. Chen** (a new Rheumatologist) tomorrow. She is incredibly anxious because previous doctors haven't listened to her proper history. Specifically, she needs to be sure about two things:

> 1. Exactly when she started her current medication (**Lyrica 75mg**) and how often she has reported **dizziness** as a side effect.
> 2. She wants to ensure her appointment details and her goal to **'Stop Lyrica'** are officially recorded in her app for tomorrow so she doesn't forget.

**Part A: The Evidence Check (Proactive Recall)**

1.  **Facilitator:** _"Sarah wants to check her facts before the appointment. She opens the Chat interface. What should she ask to get her exact medication history?"_
2.  **Participant Action (Example):** _"When did I start Lyrica and has it made me dizzy?"_
3.  **AI Action:**
    - **Record Event:** Started **Lyrica (75mg)** on **February 10th**.
    - **Journal Note:** Logged **'Dizziness'** as a side effect **4 times** in the past two weeks.

**Part B: Setting the Agenda (Structured Appointment)**

**Story Update:**
"Sarah now wants to make sure all the details for tomorrow are set up correctly in her Appointments tab using the specific appointment form."

1.  **Facilitator:** _"Sarah opens the app and taps the microphone to add tomorrow's visit. What does she say to capture the details?"_
2.  **Participant Action (Example):** _"I have a Rheumatologist appointment with Dr. Chen tomorrow at 10 AM at the City Clinic. I need a repeat prescription and I want to stop my Lyrica."_
3.  **AI Action:**
    _(Appointment Card):_
    - **Date/Time:** Tomorrow @ 10:00 AM
    - **Practitioner:** Dr. Chen (Rheumatologist)
    - **Address:** City Clinic
    - **Reason for Visit:** Specialist Referral
    - **Questions to Ask:**
      - Repeat Prescription
      - How to stop taking Lyrica?
    - **Outcomes/Plan:** _(Blank - to be filled after visit)_

---

## Scenario 3: The Order Maker (Michael - Single-Intent Parsing & Cross-Feature Tracking)

**Hypothesis:** Intelligent targeted parsing allows users to accurately populate specific features (Medications, Scripts, Appointments) using simple natural language, reducing the burden of manual data entry forms.

**Story Prompt (Facilitator reads to Participant):**
"Now let's switch to **Michael**. He is newly diagnosed and very overwhelmed. He just finished a very dense initial review with his Rheumatologist, Dr. Sharma. His head is spinning with new instructions:

> 1. He was given a script to start a new medication: **Cymbalta 30mg**.
> 2. He was given a **referral to see a Psychologist**.
> 3. He needs to schedule a **Follow-up Appointment** with Dr. Sharma in exactly one month.
>
> It's all jumbled together in his mind, and he's exhausted. He wants to capture these before he forgets."

**Part A: The Targeted Voice Captures**

1.  **Facilitator:** _"Michael sits in his car and opens the app. Rather than filling out complex forms, he decides to use the microphone to log each item one by one. First, he logs the medication. What does he say?"_
2.  **Participant Action (Example):** _"He taps the microphone and says: 'I need to start taking Cymbalta 30mg.'"_
3.  **AI Action:**
    The AI parses the input and creates a structured **(Medication Card):**
    - **Brand Name:** Cymbalta
    - **Dosage:** 30mg

4.  **Facilitator:** _"Great. Now he wants to log his referral. He taps the microphone again. What does he say?"_
5.  **Participant Action (Example):** _"'I got a psychologist referral today.'"_
6.  **AI Action:**
    The AI creates a structured **(Script/Referral Card):**
    - **Name:** Psychologist Referral
    - **Filled:** False

7.  **Facilitator:** _"Finally, he logs the appointment. What does he say?"_
8.  **Participant Action (Example):** _"'I need a follow-up appointment with Dr. Sharma in one month.'"_
9.  **AI Action:**
    The AI creates a structured **(Appointment Card):**
    - **Practitioner:** Dr. Sharma
    - **Type:** Follow-up

**Part B: Navigating the Care Plan**

**Story Update:**
"A few days later, Michael's brain fog has lifted slightly. He wants to review the medication he was prescribed, mark his referral as booked, and make sure his appointment is logged."

1.  **Facilitator:** _"Michael wants to verify his structured care plan. Where does he go in the app to check his medication, update his referral, and view his appointment?"_
2.  **Participant Action (Example):** _"He navigates to the 'Medications' tab to check the Cymbalta dosage, moves to the 'Scripts' tab to mark the Psychologist Referral as 'filled/booked', and checks the 'Appointments' tab to confirm his booking."_
3.  **AI Action:**
    - The participant successfully interacts with multiple features (Medications, Scripts, Appointments).
    - _(Script/Referral Card Updates):_ Shifted to 'Filled/Actioned' status.

---

## Scenario 4: The Post-Appointment Exhaustion (Michael - Outcomes & Immunisations)

**Hypothesis:** Voice-driven logging reduces the stress of record-keeping after taxing medical appointments, and intelligent parsing ensures vital details are correctly categorized.

**Story Prompt (Facilitator reads to Participant):**
"Let's stick with **Michael**. He just finished his very first Physiotherapy session. It was painful and physically exhausting. The physio gave him instructions: he needs to do 'nerve glide' exercises twice a day. She also reminded him he needs a Flu shot as we are entering winter. His brain is fried, but he knows he needs to track this."

**Part A: The Low-Energy Capture**

1.  **Facilitator:** _"Michael gets in his car. He doesn't have the energy to type into different forms. He uses the green voice record button on the home screen. What does he say?"_
2.  **Participant Action (Example):** _"I just finished at the physio. She said to do nerve glide exercises twice a day. Also she reminded me to get a flu shot."_
3.  **AI Action:**
    **(Cards):**
    - **Journal (Care Note):** Physio session completed. Assigned 'nerve glide' exercises (2x/day).
    - **Action Item:** Get Flu Shot.

**Part B: The Preventative Action (Immunisation Parsing)**

**Story Update:**
"A week later, Michael acts on that reminder and gets his flu vaccine at the local pharmacy. The pharmacist hands him a slip with the vaccine details: **'Vaxigrip Tetra - Batch #1234'**. He wants to make sure this is added to his official Profile so his GP will see it."

1.  **Facilitator:** _"Michael opens the app. What does he tell the app to ensure this is officially recorded?"_
2.  **Participant Action (Example):** _"I just got my Flu vaccine at the pharmacy. It was Vaxigrip Tetra, batch 1234."_
3.  **AI Action:**
    **(Immunisation Card):**
    - **Vaccine/Disease:** Influenza (Flu)
    - **Brand/Description:** Vaxigrip Tetra
    - **Batch No:** 1234
    - **Date Given:** Today
      *(Marks 'Get Flu Shot' task as complete)*

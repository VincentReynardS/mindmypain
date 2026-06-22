# MINDmyPAIN: Application Context & Capabilities Documentation

## Overview
MINDmyPAIN is a "Smart Health Journal" designed to empower patients managing chronic pain conditions. Its primary purpose is to bridge the communication gap between patients and healthcare providers by transforming unstructured voice and text logs into structured clinical evidence. Rather than acting as a passive tracking application, MINDmyPAIN serves as an **Active AI Partner**, assisting users in synthesizing their health data, managing their cognitive load, and regaining control over their health narratives.

This document serves as a comprehensive reference of the application's features, design behaviors, and limitations. It provides the necessary context for researchers analyzing user feedback to understand how generative AI is practically applied within the tool.

---

## App UI & Navigation Structure

MINDmyPAIN is designed as a mobile-first web application. The primary user interface is driven by a bottom navigation bar, intentionally separating unstructured logs from structured clinical evidence to reduce cognitive load. The main tabs include:

*   **Home:** The main dashboard or overview for the patient.
*   **Journal:** The primary input area where users capture their unstructured logs ("Brain Dumps") via voice or text, and view their chronological therapeutic diary.
*   **Appointments (Appts):** A dedicated area managing structured appointment cards (such as upcoming visits, practitioner details, and reasons for visit).
*   **Medications (Meds):** Tracks current active medications, dosages, and surfaces mentions of medications from past journal entries.
*   **Scripts:** Manages active prescriptions and medical referrals to ensure they are filled and actioned.
*   **Immunisations (Immun.):** Tracks vaccination history and preventative care.
*   **Ask (Chat):** The Conversational AI interface where users can proactively query their past data using natural language to prepare for appointments.

---

## Core Features: What MINDmyPAIN Can Do

The application leverages generative AI to provide the following functional features aimed at empowering patient self-management:

### 1. Smart Journaling (AI-Inferenced Logging)
*   **Low-Energy Unstructured Capture:** Users can input health logs via unstructured voice (audio recording) or text (a "Brain Dump"). This removes the friction of manual data entry, supporting patients when they are physically or mentally exhausted by "brain fog."
*   **Multi-Intent Extraction:** From a single continuous input (e.g., "I took my Cymbalta today, my pain is bad, and I need a follow-up with Dr. Lee"), the AI parses and categorizes the information into granular components such as Medications, Symptoms, Appointments, Referrals, and Action Items.
*   **Automated Categorization:** The AI maps colloquial language into structured clinical evidence cards, significantly reducing cognitive load by organizing chaos into clarity.

### 2. Proactive Recall (Conversational AI Interface)
*   **Natural Language Querying:** Patients can use a chat interface to query their past records accurately (e.g., "When did I start taking Lyrica and has it caused dizziness?").
*   **Evidence Generation:** The system synthesizes past data to build "Clinical Snapshots." This allows patients to walk into specialist appointments with an organized "Evidence Brief," shifting the power dynamic and building their confidence to lead consultations.
*   **Pattern Discovery:** The AI engages in "Active Sense-Making," proactively identifying hidden correlations in the user's data (e.g., correlating medication dosage increases with specific side effects).



---

## System Behaviors & Design Principles

The application's design strategy ensures AI is applied safely, ethically, and effectively in a sensitive health context:

### 1. Transparent AI Pattern (Visibility and Control)
*   **Visibility of AI Decisions:** Unlike typical AI systems that automatically commit decisions, MINDmyPAIN operates with full transparency. The AI generates **drafts** and explicitly asks for user approval before saving anything to the permanent health record.
*   **Patient as the Final Editor:** Users retain full rights to manually review, edit, or overwrite any AI-inferred tags or summaries. The AI's interpretation never overrides the patient’s lived reality.

### 2. High Data Integrity and Exact Match Preservation
*   **No Data Loss:** The system enforces strict matching for fields like Day, Sleep, Pain, and Medication to ensure critical health contexts are never lost or hallucinated during the parsing process.
*   **Targeted Parsing over General Chat:** The AI is specifically constrained to populate distinct feature cards (Immunizations, Scripts, Appointments).

### 3. Empathy, Tone, and Separation of Data
*   **System Responsiveness:** The AI's outputs maintain a calm, contextual, and empathetic tone to serve as a "Trust Builder."
*   **Separation of Data:** The UI intentionally separates raw, therapeutic journal entries (the unstructured "Brain Dump") from structured clinical outputs (Medication lists). This allows the tool to act as a safe emotional outlet for the patient while functioning as a precise clinical tool for the physician.

---

## System Limitations: What MINDmyPAIN Cannot Do

To properly contextualize user feedback, it is critical to understand the current boundaries of the prototype:

*   **No Diagnostic Capabilities:** MINDmyPAIN is a communication and management bridge, not a medical professional. It cannot and does not diagnose conditions, prescribe treatments, or offer independent medical advice.
*   **Not a General-Purpose Medical Chatbot:** While users can technically type any question into the chat interface, the AI's responses are strictly sandboxed to querying the user's *own* inputted data. If asked a general medical question (e.g., "What are the common symptoms of CRPS?"), the system is programmed to refuse and state it only has access to their journal entries.
*   **Online Only Requirement:** The application requires a constant internet connection to process voice and text inputs. It lacks offline persistence or local processing capabilities.
*   **No External Data Integrations:** The system currently relies entirely on self-reported data. It does not pull information from Electronic Medical Records (EMRs), nor does it auto-import biometric data from wearables (e.g., Apple Watch, Fitbit).
*   **No Long-form Appointment Synthesis (Scribe Mode):** While the app accepts short voice captures for journaling and querying, full "Scribe Mode" for long-form appointment transcription and automatic generation of comprehensive appointment summaries has been descoped from the current prototype.

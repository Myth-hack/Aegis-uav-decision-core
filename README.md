# Aegis UAV Decision Core (AI-Powered Smart System) 🚀

An intelligent, multi-functional UAV system designed to leverage edge AI, large language models (LLMs), and cloud dashboards for autonomous monitoring, disaster response, and urban analysis.

---

## 🌍 Project Overview
The Aegis UAV Decision Core bridges low-level flight hardware with high-level cognitive AI. By running lightweight vision models on edge hardware and offloading complex planning to remote APIs, the system provides real-time situational awareness and autonomous navigation for critical environments.

*   **Autonomous Object Tracking:** Edge-based target identification and following.
*   **Urban Planning AI:** Aerial segmentation to map infrastructure, open spaces, and structural changes.
*   **Global Remote Command:** Headless edge-computing network enabling long-distance data streaming and execution.
*   **Live Decision Dashboard:** A unified control center displaying live telemetry, AI detections, and automated logic logs.

---

## 🛠️ System Architecture & Tech Stack

[ OAK-D Lite Camera ] ----(DepthAI / Vision)----> [ Raspberry Pi 4/5 ]
|
[ Web Dashboard ] <----(Flask API / Websockets)----------+----(Mavlink)----> [ Pixhawk Flight Controller ]
|
(Gemini API Reasoning)

### **Core Software Stack**
*   **Vision & Edge Processing:** Python, OpenCV, DepthAI (for OAK-D hardware acceleration), MobileNet-SSD / YOLO
*   **Backend & Comm Core:** Flask, WebSockets, MAVLink / DroneKit (for Pixhawk telemetry extraction)
*   **Control Center Frontend:** React, Vite, TailwindCSS
*   **Cognitive Layer:** Gemini API integration for real-time situational analysis and decision logs

---

## 🚁 Core Modules Explained

### 1. Embedded Vision & Autonomous Tracking
Utilizes an **OAK-D Lite** camera to run real-time object detection blobs locally on dedicated Myriad X VPU silicon. This ensures high-FPS object tracking without bottlenecks on the main computer.

### 2. Cognitive Decision-Making & Dashboard
A real-time **React/Vite** dashboard connects via a **Flask backend** to stream flight metrics. Critical telemetry and situational data are processed through the **Gemini API** to generate automated environmental reports, anomaly warnings, and tactical recommendations during operations.

### 3. Flight Controller Bridge
The **Raspberry Pi** acts as an on-board companion computer running headless drone logic (`ai_drone.py`). It communicates directly with a **Pixhawk flight controller** over serial (`/dev/ttyACM0`), converting high-level AI intents into safe, precise MAVLink navigation commands.

---

## 📌 Project Status & Roadmap

- [x] **Phase 1:** Core hardware integration (OAK-D Lite + Raspberry Pi + Pixhawk bench setup).
- [x] **Phase 2:** Live Flask API streaming telemetry to a React/Vite dashboard.
- [/] **Phase 3:** Integration of LLM-based reasoning logs for flight decision-making *(In Progress)*.
- [ ] **Phase 4:** Field test validation for autonomous target tracking and edge-to-flight execution.

---

## 🎯 Vision & Impact
The ultimate goal of this project is to develop a highly resilient, fault-tolerant, and low-cost intelligent UAV architecture. By focusing on safety and system redundancy, this framework is tailored to support disaster response teams, smart city planning, and structural surveillance in rapidly expanding developing regions.
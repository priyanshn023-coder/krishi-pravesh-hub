# SmartMandi Farmer Hub

Build a complete working frontend web application called "SmartMandi" for SIH Problem Statement SIH26032.

IMPORTANT ARCHITECTURE RULE:

Lovable is ONLY the frontend/UI development environment.

DO NOT use Lovable Cloud.

DO NOT create or use a Lovable-managed database.

DO NOT create Lovable backend infrastructure.

DO NOT automatically create/configure Supabase.

DO NOT configure Vercel.

DO NOT configure n8n.

DO NOT configure payment gateways.

DO NOT create fake external integrations.

DO NOT put API secrets in frontend code.

I will manually configure Supabase, Vercel, n8n, AI APIs, payment services, RFID hardware and other external services later.

Build the website so these services can be connected later through clean service interfaces/API adapters and environment variables.

==================================================

1. PROJECT PURPOSE

==================================================

SmartMandi is a farmer-facing smart coordination and decision-support platform.

It helps farmers:

- register/login

- manage farmer profile

- find suitable procurement/mandi centres

- compare distance, rate, waiting time and slot availability

- select wheat

- book a slot

- receive token and QR

- track arrival and queue

- receive predicted waiting time

- upload wheat image for preliminary AI visual quality guidance

- use voice assistant

- track assessment

- track procurement

- track payment

- view/print records

- receive notifications

It also provides a Procurement Authority interface for:

- centre operations

- slot/capacity management

- farmer bookings

- RFID arrival simulation

- queue management

- crop assessment

- procurement processing

- payment workflow

- operational statistics

This is NOT an e-NAM/e-Uparjan replacement.

==================================================

2. TECH STACK

==================================================

Frontend:

- React

- TypeScript

- Vite

- Tailwind CSS

- reusable components

- responsive/mobile-first design

Use a clean service/adaptor architecture so external services can later be connected manually.

Create service interfaces such as:

supabaseService

aiVisionService

voiceService

queuePredictionService

rfidService

paymentService

notificationService

n8nService

For now, provide mock/demo implementations where external services are unavailable.

Keep all external configuration in environment variables.

==================================================

3. TWO USER ROLES

==================================================

One website with:

1. Farmer

2. Procurement Authority

Create role-based login and navigation.

Farmer:

- mobile/OTP UI

- profile

- dashboard

- centre discovery

- booking

- queue tracking

- AI crop check

- voice assistant

- records

- payment status

Authority:

- dashboard

- slot management

- bookings

- live queue

- RFID simulator

- farmer details

- crop assessment

- procurement

- payment

- notifications

For the prototype, demo authentication may be used, but structure it so Supabase Auth can be connected later.

==================================================

4. IMPORTANT BACKEND BOUNDARY

==================================================

The frontend must NOT directly contain secret keys.

Create API/service placeholders for:

Supabase:

- authentication

- database

- storage

- realtime

n8n:

- workflow automation

- notifications

- AI workflows

- future integrations

AI:

- crop image analysis

- LLM

- voice

Payment:

- payment status/workflow

RFID:

- future physical RFID reader

Vercel:

- deployment only

Do not pretend these are connected unless actual credentials/configuration exist.

==================================================

5. DATABASE CONTRACT

==================================================

Design frontend TypeScript types/interfaces matching these future Supabase tables:

profiles

farmer_profiles

procurement_centres

crops

mandi_rates

centre_slots

bookings

gate_entries

queue_events

crop_assessments

ai_crop_assessments

payments

queue_predictions

notifications

audit_logs

Important fields:

farmer_profiles:

- smartmandi_farmer_id

- crops

- village

- district

- state

- external_euparjan_id

- external_enam_id

- external_mp_emandi_id

- fpo_or_society_id

procurement_centres:

- name

- centre_type

- city

- district

- address

- latitude

- longitude

- operating_hours

- wheat_enabled

- capacity

- active_counters

- average_processing_minutes

- active

bookings:

- farmer

- centre

- crop

- slot

- token_number

- expected_quantity

- status

- QR data

queue_predictions:

- queue_length

- active_counters

- arrival_rate

- average_processing_time

- historical_load

- prediction_minutes

- predicted_turn_time

- model_version

Do not implement database creation inside Lovable.

==================================================

6. FARMER DASHBOARD

==================================================

Create a polished mobile-first dashboard showing:

- SmartMandi Farmer ID

- current booking

- centre

- wheat

- slot

- token

- current queue position

- estimated waiting time

- expected turn time

- current journey status

- payment status

Quick actions:

Find Centre

Book Slot

My Booking

AI Crop Check

Voice Assistant

My Records

Payment

Profile

==================================================

7. FIND CENTRE

==================================================

Create a centre discovery page.

Initially focus on Wheat and an Indore/Madhya Pradesh demo environment.

Centre cards show:

- centre name

- centre type

- distance

- wheat availability

- demo/current rate

- available slots

- predicted waiting time

- operating status

Allow sorting by:

- nearest

- highest rate

- shortest wait

- earliest slot

Create "Recommended for You".

Use transparent recommendation scoring:

30% waiting time

25% distance

25% rate

10% slot availability

10% operational status

Show WHY a centre is recommended.

Example:

"Recommended because it is closer, has a shorter predicted wait and has wheat slots available."

This is a decision-support algorithm, not an AI claim.

==================================================

8. SLOT BOOKING

==================================================

Flow:

Centre

→ Wheat

→ Available date

→ Available slot

→ Expected quantity

→ Confirm

→ Token

→ QR

→ Booking record

Authority controls slot capacity.

Example:

10:00–11:00

Capacity 20

Booked 16

Remaining 4

Full slots cannot be booked.

Generate a realistic token such as:

WHT-IND-1025

==================================================

9. FARMER JOURNEY

==================================================

Create a visual timeline:

Registration

→ Centre Selected

→ Slot Booked

→ Token Generated

→ Arrived at Gate

→ Waiting

→ Processing

→ Quality Assessment

→ Procurement Completed

→ Payment Initiated

→ Payment Processing

→ Payment Completed

Clearly highlight current stage.

==================================================

10. RFID

==================================================

Create an Authority page:

"RFID Gate Simulator"

Show:

- reader status

- RFID ID

- recent scans

- Scan button

- farmer/token lookup

- timestamp

Demo scan should simulate:

RFID scan

→ gate entry

→ booking becomes Arrived

→ queue event

→ queue position

→ waiting-time prediction

→ farmer notification

→ realtime dashboard update

Also create an RFID service/API contract for future hardware.

Conceptual payload:

{

  rfid_id,

  reader_id,

  centre_id,

  timestamp

}

Clearly label simulator as DEMO.

==================================================

11. QUEUE PREDICTION

==================================================

Create a real ML-ready queue prediction interface.

Goal:

Predict estimated waiting time and expected turn time.

Features:

- current queue length

- arrivals/hour

- active counters

- average processing time

- crop

- time of day

- day of week

- month/season

- historical centre load

- completed farmers

- currently processing farmers

Preferred future model:

Random Forest Regression or Gradient Boosting Regression.

Initial prototype may use synthetic/demo data.

DO NOT claim synthetic data is real historical data.

Create UI showing:

Queue length: 14

Active counters: 3

Arrival rate: 8/hour

Average processing: 12 min

Prediction:

Estimated wait: 54 minutes

Expected turn: 11:40 AM

Model: Random Forest

Version: v1-demo

Create a prediction service interface so an external Python/ML API can be connected later.

Do not fake a formal statistical confidence interval.

==================================================

12. REALTIME

==================================================

Prepare the frontend for Supabase Realtime.

Queue/status changes should update automatically once Supabase is connected.

Architecture:

RFID/Authority action

→ backend/database

→ realtime event

→ Farmer + Authority dashboards

For demo mode, simulate realtime changes locally.

==================================================

13. AI CROP QUALITY

==================================================

Create "AI Crop Check".

Farmer uploads a wheat image.

UI should be ready for a real vision API.

Show:

- uploaded image

- analysis state

- preliminary quality

- confidence

- visible observations

- recommendations

Possible visual observations:

- grain appearance

- discoloration

- visible foreign material

- visible damaged grains

- mold/fungal-like visible signs where detectable

IMPORTANT:

AI image analysis is preliminary visual guidance.

Do NOT claim image AI can accurately determine moisture percentage.

Official physical/instrument assessment at the centre remains authoritative.

Create aiVisionService interface for later API integration.

Demo mode can use clearly labelled simulated results.

==================================================

14. VOICE ASSISTANT

==================================================

Create a prominent Voice Assistant.

Browser flow:

Microphone

→ Speech-to-text

→ assistant

→ retrieve relevant SmartMandi data

→ response

→ text-to-speech

Example questions:

"What is my token number?"

"When should I reach?"

"What is my waiting time?"

"What is my payment status?"

"What is the wheat rate?"

"What happens after gate entry?"

Create a clean voice UI with:

- microphone button

- listening state

- transcript

- assistant response

- speaking state

- error state

Prepare voiceService for future external AI/voice API.

Also create a "Phone Voice Assistant" setup/info screen describing the future architecture:

Phone

→ telephony provider

→ webhook

→ speech recognition

→ AI

→ SmartMandi data

→ text-to-speech

→ phone

Do not claim phone calling is connected unless credentials exist.

==================================================

15. AUTHORITY DASHBOARD

==================================================

Create a professional desktop-friendly operational dashboard.

Statistics:

- today's bookings

- arrived

- waiting

- processing

- completed

- no-show

- payment pending

Live queue table:

Token

Farmer

Crop

Quantity

Arrival

Position

Status

Estimated Wait

Action

Actions:

- View Farmer

- Confirm Entry

- Start Processing

- Complete Processing

- Assess Crop

- Initiate Payment

==================================================

16. AUTHORITY SLOT MANAGEMENT

==================================================

Authority can:

- create slots

- edit slots

- set capacity

- close/reopen slots

- see booked count

- see remaining capacity

==================================================

17. FARMER DETAIL

==================================================

Authority can view:

- farmer name

- SmartMandi ID

- village

- crop

- booking

- token

- expected quantity

- arrival time

- queue position

- AI preliminary assessment

- official assessment

- payment status

Only demo/mock data until Supabase is connected.

==================================================

18. CROP ASSESSMENT

==================================================

Create assessment form:

- gross weight

- tare weight

- net weight

- moisture %

- foreign matter %

- damaged grain %

- quality grade

- notes

Calculate:

Net Weight = Gross Weight - Tare Weight

Clearly separate:

AI preliminary assessment

from

Official authority assessment.

==================================================

19. PROCUREMENT + PAYMENT

==================================================

Create complete frontend state flow:

Assessment Completed

→ Payment Initiated

→ Payment Processing

→ Payment Completed

Generate demo reference such as:

PAY-SM-20260909-00125

Clearly show:

"Demo payment workflow — no real money transfer."

Create paymentService interface for future real gateway integration.

Do not implement or claim real bank transfer.

==================================================

20. NOTIFICATIONS

==================================================

Create notification centre.

Events:

- registration

- slot booked

- token generated

- reminder

- gate entry

- queue update

- processing

- assessment

- procurement

- payment initiated

- payment completed

For demo, use local notifications.

Create notificationService interface for future n8n/SMS/push integration.

==================================================

21. PRINTABLE RECORDS

==================================================

Create browser-printable records:

1. Registration Record

2. Slot/Token Record

3. Gate Entry Record

4. Assessment Record

5. Procurement Record

6. Payment Record

Label them:

"SmartMandi Farmer Record"

Do not call them official government receipts.

==================================================

22. DEMO MODE

==================================================

Add a clearly visible DEMO MODE.

Demo mode provides:

- demo farmers

- demo centres

- demo wheat rates

- demo slots

- simulated RFID

- simulated realtime updates

- synthetic ML data/results

- simulated AI crop result

- simulated payment

Never represent demo data as official/live government data.

Seed realistic Indian demo data without using real people's personal information.

==================================================

23. SYSTEM ARCHITECTURE PAGE

==================================================

Create "How SmartMandi Works".

Show:

Farmer

↓

React Web App

↓

External Services Layer

├── Supabase

├── n8n

├── AI APIs

├── ML Prediction API

├── Payment API

└── RFID API

↓

Procurement Centre

↓

Gate → Queue → Assessment → Procurement → Payment

Explain each technology simply.

==================================================

24. TECHNOLOGY & ALGORITHMS PAGE

==================================================

Create a presentation-friendly page explaining:

React:

frontend UI

TypeScript:

type safety

Supabase:

database/auth/storage/realtime — to be connected externally

n8n:

automation/workflows — to be connected externally

Computer Vision:

preliminary wheat image analysis

LLM:

voice/chat intelligence

Machine Learning:

queue waiting-time regression

Recommendation Algorithm:

centre ranking using distance, wait, rate and availability

RFID:

physical arrival identification

State Machine:

booking → arrival → queue → processing → assessment → procurement → payment

==================================================

25. UI DESIGN

==================================================

Make the interface look like a serious agriculture/government technology platform.

Requirements:

- mobile-first farmer UI

- professional authority dashboard

- simple navigation

- large readable text

- high contrast

- clear status badges

- accessible forms

- responsive desktop/mobile

- agriculture-inspired but modern

- avoid generic SaaS appearance

English initially, but structure text so Hindi can be added later.

==================================================

26. CODE QUALITY

==================================================

Use:

- reusable components

- clean folder structure

- TypeScript types

- loading states

- error states

- empty states

- form validation

- clean state management

- service abstraction

- no hardcoded API secrets

- environment variable configuration

Create mock services that can later be replaced by real services without rewriting the UI.

==================================================

27. REAL-WORLD BOUNDARIES

==================================================

Never claim:

- SmartMandi replaces e-NAM

- SmartMandi replaces e-Uparjan

- every mandi is e-NAM enabled

- image AI officially determines crop quality

- image AI determines moisture accurately

- demo payment transfers real money

- simulated RFID is real hardware

- demo mandi rates are official live rates

SmartMandi is a coordination and decision-support platform.

==================================================

28. FINAL DEMO MUST WORK

==================================================

Demonstrate this complete flow using DEMO MODE:

FARMER:

Register

→ Login

→ Profile

→ Find Centre

→ Select Wheat

→ Compare Centres

→ Select Centre

→ Book Slot

→ Receive Token + QR

→ Print Record

→ AI Crop Check

→ Voice Assistant

→ Wait for RFID simulation

→ Realtime Gate Entry

→ Queue Position

→ ML Waiting Prediction

→ Processing

→ Assessment

→ Procurement

→ Payment Initiated

→ Payment Processing

→ Payment Completed

→ Print Payment Record

AUTHORITY:

Login

→ Dashboard

→ Create Slots

→ View Booking

→ RFID Simulator

→ Scan Farmer

→ Confirm Entry

→ Queue Update

→ Prediction Update

→ Start Processing

→ Assessment

→ Complete Procurement

→ Initiate Demo Payment

→ Farmer dashboard updates

==================================================

29. IMPORTANT FINAL INSTRUCTION

==================================================

Build the actual website now.

Prioritize:

1. Complete working UI and navigation

2. Farmer flow

3. Authority flow

4. Demo data/state

5. Booking + token

6. Queue + RFID simulator

7. ML prediction interface

8. AI crop interface

9. Voice interface

10. Payment/notification flows

11. Printable records

12. Architecture/explanation pages

DO NOT spend credits creating Lovable Cloud infrastructure.

DO NOT create a backend/database.

Instead, make the frontend integration-ready for the external services I will connect manually later.

Before finishing, make sure the entire DEMO MODE journey can be performed from start to finish without external credentials.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/72e3c2a8-edcd-4ca0-9600-d586ba56d55c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

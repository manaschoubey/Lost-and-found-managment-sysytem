# Lost-and-found-managment-sysytem
A platform where students/users can report lost or found items, search for matching items, submit claims, and get the item returned after verification.
Lost & Found Management System: Community-Driven Item Recovery Platform
Project Administration
Project Guide: Er. Ram Babu Buri

Research Area: Full-Stack Java Development & NoSQL Databases

Specializations: Java, Spring Boot, MongoDB, React.js, REST APIs, JWT Security

Team Members

Name                                                    Enrollment                                                       Email	

Manas chaubey      24E1ARCS0MP40P086        manaschaubey39@gmail.com

kartik matwa       24E1ARCSM30P072          kartikmatwa25@gmail.com

Kushagra saxena    24E1ARCSM40P082          kushagrasaxena022@gmail.com

Manisha mehla      24E1ARCSF40P088          Manisha411880@gmail.com

Abstract------
This project introduces the Lost & Found Management System, a community-driven platform engineered to reconnect people with their lost belongings through intelligent automated matching and secure claim verification. Traditional lost-and-found processes rely on physical notice boards, social media posts, and word-of-mouth — approaches that lack structure, searchability, and trust mechanisms. This platform addresses those limitations with a full-stack web application designed for campuses, offices, and public spaces.

The system operates on a Java Spring Boot backend with MongoDB as the document store, chosen for its flexible schema that accommodates diverse item attributes (electronics, documents, accessories, clothing). Authentication and authorization are enforced through stateless JSON Web Tokens (JWT) with strict Role-Based Access Control (RBAC) across three roles: USER, ADMIN, and SUPER_ADMIN. The client interface is built with React.js and Tailwind CSS, delivering a modern, fully responsive experience across desktop, tablet, and mobile devices.

To reduce the manual effort of cross-referencing lost and found reports, the platform integrates an automated rule-based matching engine that computes a weighted similarity score across four dimensions — item name similarity (30%), category match (20%), location similarity (30%), and date proximity (20%) — using Levenshtein distance and temporal analysis. Every match above a 50% threshold automatically creates a match record and notifies both parties. Furthermore, once a claim is approved by an administrator, an isolated private chat room is instantiated, allowing the finder and the claimant to coordinate the handover without exposing personal contact details.

The system also features an item timeline that visually narrates every event in an item's lifecycle — from initial report through match suggestion, claim submission, admin decision, and final return — providing full transparency. An admin analytics dashboard surfaces platform-wide insights including items by category, lost vs. found ratios, and monthly reporting trends. Collectively, the platform transforms fragmented recovery efforts into a structured, searchable, trust-verified ecosystem for community item recovery.

User Roles-----------
The Lost & Found Management System enforces strict Role-Based Access Control (RBAC) at the API layer utilizing Spring Security and stateless JSON Web Tokens (JWT).

USER: Authenticated community members who can report lost items, report found items, submit claims on found items, view their personal dashboard, receive match notifications, and participate in private chats after a claim is approved.

ADMIN: Elevated users with privileges to review pending claims, approve or reject them with remarks, access platform-wide analytics, and monitor all reported items across categories.

SUPER_ADMIN: System-level administrators with unrestricted access including role assignment, user management, and system configuration.

Architecture & Core Modules------------
The Lost & Found architecture operates as a layered full-stack system, with a Spring Boot Java backend as the central application server, a React.js single-page frontend, and MongoDB as the primary persistence layer.

Functional Modules----------
Module 1: Identity & Access Management (IAM)
Manages user registration, BCrypt password hashing, JWT issuance and validation, and role-based authorization. This module acts as the platform gatekeeper, securing every protected endpoint under /api/items, /api/claims, /api/admin, and /api/chats.

Module 2: Item Reporting & Discovery--------
Provides CRUD operations for lost and found items with pagination, keyword search, category filters, and multipart image upload. All uploaded images are stored on the server filesystem and served via a /uploads/** static resource handler. Users can browse found items to search for their lost belongings.

Module 3: Automated Matching Engine-------------
Runs on every new lost or found report. It computes a weighted similarity score against all candidate items of the opposite type using Levenshtein distance for text comparison and temporal analysis for date proximity. Items exceeding the 50% threshold generate a Match record and immediately notify both parties via the in-app notification system.

Module 4: Claim Verification Workflow------------
Allows users to submit claims on found items with written proof and supporting images. Admins review each claim and can mark it UNDER_REVIEW, APPROVE, or REJECT with remarks. Approving a claim automatically updates the found item's status to CLAIMED and triggers the creation of a private chat room.

Module 5: Private Chat & Handover Coordination---------
Once a claim is approved, an isolated chat room is instantiated linking the finder and the claimant. Users exchange messages inside the app to arrange pickup — phone numbers and emails are never exposed. Each room includes a system-generated safety message warning users against sharing sensitive information.

Module 6: Admin Dashboard & Analytics----------
Provides statistical visualizations (items by category, lost vs. found ratio, monthly reports) alongside a claim review table with one-click approve/reject actions.

Module 7: Item Timeline-----------
Aggregates every event in an item's lifecycle — reported, matched, claimed, approved, returned — into a chronological visual timeline displayed on the item detail page.

Database Strategy----
The system utilizes MongoDB Atlas as its primary document store, chosen for its flexible schema that accommodates the diverse, heterogeneous nature of lost and found item attributes.

MongoDB (Document Store)
Usage: Stores user accounts, lost items, found items, claims, matches, notifications, categories, chat rooms, and messages.

Structure: Schema-less documents with embedded arrays for images, proof photos, and status timestamps.

Integration: Connects via Spring Data MongoDB using @Document mapping and MongoRepository interfaces.

Keys: Uses native BSON ObjectIDs with cross-collection references stored as string IDs.

Collections Overview
users: id, name, email (unique), password (BCrypt), phone, role, enabled, createdAt

lost_items: id, userId, itemName, description, categoryId, location, lostDate, contactInfo, imageUrls[], status, createdAt, updatedAt

found_items: id, userId, itemName, description, categoryId, location, foundDate, contactInfo, imageUrls[], status, createdAt, updatedAt

claims: id, foundItemId, claimantUserId, proofDescription, proofImages[], status, adminRemarks, createdAt, updatedAt

matches: id, lostItemId, foundItemId, lostUserId, foundUserId, score, status, createdAt

notifications: id, userId, title, message, type, refId, read, createdAt

chat_rooms: id, claimId, itemId, itemName, finderUserId, claimantUserId, status, createdAt

messages: id, roomId, senderUserId, senderName, text, createdAt

categories: id, name, description

Automated Matching Algorithm
The matching engine computes a weighted similarity score between every pair of lost and found items using four dimensions:

Dimension	Weight	Method
Item Name Similarity	30%	Levenshtein distance normalized to [0, 1]
Category Match	20%	Exact match = 1.0, otherwise 0.0
Location Similarity	30%	Levenshtein distance on location strings
Date Proximity	20%	1.0 if ≤ 1 day, 0.75 if ≤ 7 days, 0.4 if ≤ 30 days, else 0.1
Threshold: Matches with a combined score ≥ 0.50 are saved and notifications are dispatched to both the lost reporter and the found reporter.

Non-Functional Requirements
Performance: The matching engine processes candidate items in a single pass and writes to the matches collection asynchronously. Notification bell polling runs on a 30-second interval to keep UI state fresh without overloading the server.

Security: All passwords are hashed using BCrypt before storage. JWT tokens are signed with HS256 and validated on every request via JwtAuthenticationFilter. Role-based endpoint protection is enforced through SecurityFilterChain. Contact information on found items remains hidden from non-claimants until a claim is approved.

Fault Tolerance: Match failures during item creation do not block the primary item save — matching runs in a best-effort attempt. If no matches are found above threshold, the system gracefully handles empty results without affecting item persistence.

Scalability: The backend is stateless (session-less JWT), allowing horizontal scaling behind a load balancer. The MongoDB document model scales horizontally through sharding if needed.

Responsiveness: The frontend is fully responsive across mobile, tablet, and desktop using Tailwind CSS utility classes. Dark mode is supported via a persistent theme toggle.

UML Design-----
[Lost & Found Class Diagram]https://./image/class-diagram.png

[Lost & Found System Architecture]https://./image/architecture.png

Database Design & UI Mock-ups
1. Database Architecture
See the "Database Strategy" section above for the complete list of collections and their schemas.

2. Entity-Relationship Overview













3. User Interface Mock-ups
[Home & Search Page]https://./image/home.png

[Report Lost / Found Forms]https://./image/report-form.png

[Item Details with Timeline]https://./image/item-details.png

[User Dashboard]https://./image/user-dashboard.png

[Admin Dashboard]https://./image/admin-dashboard.png

[Private Chat Room]https://./image/chat-room.png

Project Directory Structure
text
Lost-and-found-managment-sysytem/
│
├── README.md                          # Project Documentation & Weekly Logs
│
├── backend/                           # Spring Boot Backend (Java 17, MongoDB, JWT)
│   ├── pom.xml                        # Maven Dependencies Configuration
│   ├── mvnw / mvnw.cmd                # Maven Wrapper Scripts
│   ├── uploads/                       # Uploaded item and proof images
│   └── src/main/
│       ├── java/com/lostfound/
│       │   ├── LostfoundApplication.java
│       │   │
│       │   ├── config/                # Spring Configuration
│       │   │   ├── SecurityConfig.java
│       │   │   └── WebConfig.java
│       │   │
│       │   ├── controller/            # REST API Controllers
│       │   │   ├── AuthController.java
│       │   │   ├── ItemController.java
│       │   │   ├── ClaimController.java
│       │   │   ├── AdminClaimController.java
│       │   │   ├── NotificationController.java
│       │   │   ├── DashboardController.java
│       │   │   └── ChatController.java
│       │   │
│       │   ├── dto/                   # Data Transfer Objects
│       │   │   ├── ApiResponse.java
│       │   │   ├── AuthResponse.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── RegisterRequest.java
│       │   │   ├── ItemRequest.java
│       │   │   ├── ClaimRequest.java
│       │   │   └── TimelineEvent.java
│       │   │
│       │   ├── exception/             # Global Error Handling
│       │   │   └── GlobalExceptionHandler.java
│       │   │
│       │   ├── model/                 # MongoDB Documents
│       │   │   ├── User.java
│       │   │   ├── Role.java
│       │   │   ├── LostItem.java
│       │   │   ├── FoundItem.java
│       │   │   ├── Claim.java
│       │   │   ├── Match.java
│       │   │   ├── Notification.java
│       │   │   ├── Category.java
│       │   │   ├── ChatRoom.java
│       │   │   ├── Message.java
│       │   │   ├── ItemStatus.java
│       │   │   ├── ClaimStatus.java
│       │   │   └── MatchStatus.java
│       │   │
│       │   ├── repository/            # Spring Data MongoDB Repositories
│       │   │   ├── UserRepository.java
│       │   │   ├── LostItemRepository.java
│       │   │   ├── FoundItemRepository.java
│       │   │   ├── ClaimRepository.java
│       │   │   ├── MatchRepository.java
│       │   │   ├── NotificationRepository.java
│       │   │   ├── CategoryRepository.java
│       │   │   ├── ChatRoomRepository.java
│       │   │   └── MessageRepository.java
│       │   │
│       │   ├── security/              # JWT & Authentication
│       │   │   ├── JwtUtil.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── CustomUserDetailsService.java
│       │   │
│       │   ├── service/               # Business Logic
│       │   │   ├── AuthService.java
│       │   │   ├── ItemService.java
│       │   │   ├── MatchingService.java
│       │   │   ├── ClaimService.java
│       │   │   ├── NotificationService.java
│       │   │   ├── DashboardService.java
│       │   │   └── ChatService.java
│       │   │
│       │   └── util/                  # Utilities
│       │       └── FileStorageUtil.java
│       │
│       └── resources/
│           └── application.properties # MongoDB URI, JWT Secret, File Upload Path
│
└── frontend/                          # React Single-Page Application (Vite + Tailwind CSS)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── context/
        │   ├── AuthContext.jsx        # Global auth state (user, JWT token, role)
        │   └── ThemeContext.jsx       # Dark mode toggle state
        │
        ├── services/
        │   └── api.js                 # Axios client with JWT interceptor
        │
        ├── components/
        │   ├── ProtectedRoute.jsx     # Role-based route guard
        │   ├── ItemCard.jsx           # Item card with status badge
        │   ├── ItemTimeline.jsx       # Chronological event timeline
        │   ├── NotificationBell.jsx   # Unread notification dropdown
        │   ├── ThemeToggle.jsx        # Dark mode toggle button
        │   ├── UserMenu.jsx           # Avatar dropdown menu
        │   ├── SkeletonCard.jsx       # Loading skeleton
        │   └── EmptyState.jsx         # Empty state with CTA
        │
        ├── layouts/
        │   └── MainLayout.jsx         # Navbar + footer wrapper
        │
        ├── pages/
        │   ├── Home.jsx               # Search & browse items
        │   ├── Login.jsx              # Login page
        │   ├── Register.jsx           # Registration page
        │   ├── ReportLost.jsx         # Report lost item form
        │   ├── ReportFound.jsx        # Report found item form
        │   ├── ItemDetails.jsx        # Item detail + claim + timeline
        │   ├── UserDashboard.jsx      # Personal stats & notifications
        │   ├── AdminDashboard.jsx     # Analytics & claim review
        │   ├── Chats.jsx              # Chat room list
        │   └── ChatRoom.jsx           # Single chat view
        │
        └── routes/
            └── AppRoutes.jsx          # React Router configuration
Module Distribution
In a full-stack, modular architecture, dividing the platform into four end-to-end functional modules allows each team member to take complete ownership of their feature stack — covering UI design, state management, REST API controller development, database schema design, and business logic.

Below is a detailed breakdown of the role, end-to-end responsibilities, technical challenges faced, and final accomplishments for each team member.

Week 1: Project Initialization & Backend Core Setup
Member 1: Backend Core, Security & Auth
Role & Scope:
Ownership of the Spring Boot project foundation, security infrastructure, and authentication APIs.

Work Completed:

Initialized Spring Boot project with a structured package layout (controller, service, repository, model, dto, security, exception, config, util).

Configured application.properties with MongoDB URI, file upload path, and JWT secret.

Implemented BCryptPasswordEncoder bean for password hashing.

Built JwtUtil for token generation/validation with HMAC-SHA256 signing.

Created JwtAuthenticationFilter to intercept every request and populate the SecurityContext.

Configured SecurityFilterChain with stateless sessions, CORS for the React frontend, and role-based access rules.

Developed /api/auth/register, /api/auth/login, and /api/auth/me endpoints.

Implemented GlobalExceptionHandler using @ControllerAdvice returning consistent ApiResponse structure.

Verified with Postman: successful register → BCrypt hash stored → login returns JWT → /me returns user with password stripped.

Challenges:

Lombok compatibility issues on JDK 25 required rewriting model classes with explicit getters/setters.

Correctly configuring CORS without breaking JWT authentication.

Week 2: Domain Models & Automated Matching
Member 2: Domain Models, Repositories & Automated Matching
Role & Scope:
Ownership of the MongoDB document schema and the core automated matching algorithm.

Work Completed:

Created MongoDB @Document classes: LostItem, FoundItem, Claim, Match, Notification, Category.

Defined status enums: ItemStatus, ClaimStatus, MatchStatus.

Built MongoRepository interfaces for each document with custom query methods (findByStatus, findByLostUserIdOrFoundUserId, etc.).

Implemented MatchingService with a 4-dimension weighted algorithm:

Item name similarity (30%) via Levenshtein distance

Category match (20%) via exact comparison

Location similarity (30%) via Levenshtein distance

Date proximity (20%) via chronological bucket scoring

Hooked matchForLostItem() and matchForFoundItem() to trigger on every item creation.

Ensured matches above 50% threshold create a Match record and dispatch notifications to both users.

Verified end-to-end: reporting a "Black iPhone 13" lost item followed by an "iPhone 13 black" found item produces a match score of ~0.85 and generates notifications.

Challenges:

Tuning the threshold to avoid false positives while catching genuine matches.

Handling null categories and missing dates gracefully.

Week 3: Business Logic & REST APIs
Member 3: Business Logic, REST Controllers & Admin Workflows
Role & Scope:
Ownership of all business-facing REST APIs including items, claims, admin actions, notifications, and analytics.

Work Completed:

Implemented ItemController with paginated list, keyword search, category filter, and multipart image upload for both lost and found items.

Built FileStorageUtil for saving uploaded images to the uploads/ folder and serving them via WebConfig resource handler.

Developed ClaimController for submitting claims with proof text and images.

Built AdminClaimController for approve/reject/review with remarks.

Wired ClaimService.updateStatus() to update the item status to CLAIMED on approval and dispatch notifications.

Built NotificationController with list, unread, and mark-as-read endpoints.

Implemented DashboardController with user stats and admin analytics (items by category, lost vs. found, monthly reports).

Published a full API contract consumed by the frontend team.

Challenges:

Multipart form-data binding for DTO + list of images.

Ensuring only the item owner can delete their own report.

Week 4: React Frontend Architecture & UI
Member 4: React Frontend, UI/UX & Integration
Role & Scope:
Ownership of the entire client-side application — pages, routing, state management, and API integration.

Work Completed:

Scaffolded the frontend with Vite + React and configured Tailwind CSS.

Built AuthContext for JWT state management with localStorage persistence.

Implemented ProtectedRoute component for role-based route guards.

Developed Axios interceptor in api.js that injects the JWT on every request and handles 401 responses globally.

Built key pages: Home (search + filters + pagination), Login, Register, ReportLost, ReportFound, ItemDetails, UserDashboard, AdminDashboard.

Added advanced UI features:

Status badges (color-coded: LOST, FOUND, CLAIMED, RETURNED)

Skeleton loaders during data fetch

Empty states with CTA buttons

Avatar dropdown menu

Dark mode toggle with ThemeContext

Notification bell with unread count

Item timeline on the details page

Integrated the claim modal with a two-corner layout: image upload on the left, written proof on the right.

Challenges:

Tailwind v4 breaking change (no more init command) required downgrading to v3.

ESLint React Hooks rules required restructuring useEffect patterns with useCallback.

Week 5: Private Chat Feature & Item Timeline
Member 2 & Member 3: Chat Rooms & Timeline
Role & Scope:
Building the post-approval coordination channel and the item lifecycle visualization.

Work Completed (Chat):

Created ChatRoom and Message documents with repositories.

Built ChatService.createRoomForClaim() triggered automatically when an admin approves a claim.

Implemented authorization checks ensuring only the finder and the claimant can access a room.

Developed ChatController with endpoints for listing rooms, fetching messages, and sending messages.

Built frontend Chats.jsx and ChatRoom.jsx with 3-second polling for near-real-time messaging.

Added 💬 Chats link to the navbar and "My Chats" to the avatar dropdown.

Work Completed (Timeline):

Added TimelineEvent DTO with type, title, description, timestamp, and badge color.

Extended ItemService.getTimeline() to aggregate reported, matched, claimed, and returned events.

Built ItemTimeline.jsx with vertical timeline UI, emoji icons, and color-coded badges.

Timeline displays different events for lost vs. found items (found items show claim + approval events).

Challenges:

Ensuring the chat room isn't duplicated when a claim is re-approved.

Handling null timestamps in timeline events (e.g., updatedAt may not exist on legacy documents).

Week 6: Advanced UI Polish
Member 4: UI/UX Enhancements
Role & Scope:
Final visual and interactive polish across the entire application.

Work Completed:

Implemented dark mode across all pages with Tailwind's dark: classes.

Added ThemeContext with localStorage persistence for user theme preference.

Built NotificationBell component with:

Auto-refresh every 30 seconds

Red badge showing unread count

Dropdown with message previews and click-to-mark-as-read

Built SkeletonCard for elegant loading states.

Built EmptyState component with emoji illustration and CTA.

Added UserMenu dropdown with role badge, dashboard links, and logout.

Improved ItemCard with hover zoom on images, status badge, and time-ago formatting.

Added a footer to every page.

Challenges:

Balancing dark mode contrast across images and text.

Keeping the notification polling lightweight to avoid server load.

Week 7: Admin Governance & Analytics
Member 3: Admin Dashboard Deepening
Role & Scope:
Completing the admin governance portal with analytics, moderation, and reporting.

Work Completed:

Finalized admin dashboard with Recharts bar chart for Lost vs Found.

Built claim review table with Approve/Reject buttons and one-click actions.

Implemented adminAnalytics() returning itemsByCategory, lostVsFound, monthlyReports, and totalClaims.

Created the automatic role promotion flow: a user's role can be set to ADMIN by editing the document in MongoDB Compass, and the next login grants admin access.

Challenges:

Aggregating statistics across multiple collections without N+1 query problems.

Formatting chart data for Recharts consumption.

Week 8: System Integration & End-to-End Testing
All Members: Full-Stack Integration
Role & Scope:
Shifting from isolated module development to verifying cross-module data flow.

Work Completed:

End-to-end test: User registers → reports lost item → another user reports matching found item → match is created → both receive notification.

Verified claim workflow: user submits claim → admin approves → item status becomes CLAIMED → chat room is auto-created → system notification dispatched → claimant can chat with finder.

Tested role-based access: USER cannot access /api/admin/**, ADMIN can. Non-admin cannot access the admin dashboard page.

Tested file upload: image is saved to uploads/ folder with UUID filename and served via /uploads/{uuid}.

Tested dark mode persistence, notification bell updates, and timeline rendering.

Verified MongoDB collections after full flow: users, lost_items, found_items, matches, notifications, claims, chat_rooms, messages — all populated correctly.

Challenges Faced During Integration:

Chat Service Compilation Errors: Method names on FoundItem (getName, getFoundByUserId) didn't match the actual fields (itemName, userId), requiring renaming.

Lombok Annotation Processor Failures on JDK 25: Required either downgrading to JDK 17 or rewriting all models with explicit getters.

Timeline Field Mismatches: Old documents in MongoDB didn't have createdAt fields, causing null pointer issues in sorting.

CORS Configuration: Initial frontend requests to the backend were blocked until http://localhost:5173 was added to allowed origins.

Week 9: Feature Freeze & Deployment Preparation
All Members: Production Readiness
Work Completed:

Removed all hardcoded secrets from application.properties and moved them to environment variable references (${MONGODB_URI}, ${JWT_SECRET}).

Prepared the frontend api.js to use import.meta.env.VITE_API_BASE_URL for production.

Configured MongoDB Atlas cluster and whitelisted deployment IPs.

Chose Render for backend deployment and Vercel for frontend deployment.

Wrote deployment checklist:

Push both repos to GitHub
Create MongoDB Atlas cluster → get connection string
Deploy backend to Render with env vars
Deploy frontend to Vercel with VITE_API_BASE_URL
Update FRONTEND_URL env var in Render to trigger redeploy
Resolved the HTTP 408 Git push timeout by switching from HTTPS to SSH.

Challenges:

The free tier of Render puts the backend to sleep after 15 minutes of inactivity, requiring a cold-start warning.

Environment variable injection differs between local development and production.

Week 10: Final Evaluation, Deliverables & Project Submission
During Week 10, the Lost & Found engineering team completed the final system evaluation, deployment audit, comprehensive documentation, presentation deck, and end-to-end video demonstration.

Project Deliverables & Artifacts
Deliverable	Description	Resource Link
📄 Final Project Report	Complete Technical Architecture Document, SRS, and Evaluation Metrics	View Project Report (PDF) | ARCHITECTURE.md
📊 Presentation Deck (PPT)	20-Slide B.Tech Final Project Deck covering System Design, Matching Algorithm, JWT Security & Testing	View Presentation (PPT)
🎥 Video Demonstration	HD Walkthrough covering User Onboarding, Reporting, Matching, Claim Approval, Chat & Admin Panel	Watch Video Demo
🌐 Live Deployment	Public URL for the fully deployed platform	Live Demo
Key Accomplishments & Week 10 Milestones
1. Final Project Report & Technical Documentation
Compiled the comprehensive Software Requirements Specification (SRS) and Technical Architecture Document covering:

Modular monolith architecture with clear separation of concerns.

MongoDB as the primary document store for all collections.

Stateless JWT Authentication and strict Role-Based Access Control (RBAC) across USER, ADMIN, and SUPER_ADMIN.

Automated Matching Engine with a 4-dimension weighted similarity algorithm.

Private chat coordination activated post-claim-approval.

2. Final Evaluation Slide Deck (PPT)
Prepared a structured 20-slide presentation deck covering:

Problem Statement & Scope: Addressing the inefficiency of traditional lost-and-found recovery.

Architecture & Data Flow: Visualizing Spring Boot, MongoDB, and React interactions.

Matching Algorithm: The 30/20/30/20 weighted scoring formula.

JWT Security & RBAC: Stateless authentication with role-based endpoints.

Chat & Timeline: Post-approval coordination and item lifecycle visualization.

Quality Assurance & Testing: End-to-end integration test results and MongoDB collection verification.

3. End-to-End Product Video Demonstration
Produced an HD video demonstrating:

User Onboarding: Registration, login, and JWT persistence.

Item Reporting: Reporting lost and found items with image upload preview.

Automated Matching: Real-time creation of matches and notifications.

Claim Workflow: Submitting a claim, admin approval, automatic chat room creation.

Private Chat: Finder and claimant messaging to arrange a handover.

Timeline: Full item lifecycle visualization.

Admin Dashboard: Analytics chart and claim review table.

Dark Mode: Toggle and persistence across sessions.

4. Containerization & Deployment
Backend deployed on Render with environment variables.

Frontend deployed on Vercel with VITE_API_BASE_URL pointing to Render.

Database hosted on MongoDB Atlas free tier with IP whitelisting.

Summary of Module Distribution
Module	Team Member Scope	Primary Focus	Key Deliverable
1. Backend Core & Auth	Person 1	Spring Boot, JWT, Security, MongoDB Config	Auth APIs, SecurityFilterChain, Global Error Handler
2. Domain Models & Matching	Person 2	MongoDB Documents, Matching Algorithm	Item Models, Repositories, MatchingService
3. Business Logic & APIs	Person 3	REST Controllers, Claims, Dashboards	Item CRUD, Claim Workflow, Admin Analytics
4. React Frontend & UI	Person 4	React, Tailwind, State, Routing	Full SPA with Chat, Timeline, Dark Mode
Overall System Integration Summary
During the final Full System Acceptance Testing, all team members executed unified end-to-end user journeys:

text
[User Reports Lost Item (Mem 3)]
            │
            ▼
[Automated Matching Runs (Mem 2)] ──> [Match Found & Notification Sent]
            │
            ▼
[Other User Reports Found Item] ──> [Item Appears on Home Feed (Mem 4)]
            │
            ▼
[User Submits Claim] ──> [Admin Approves (Mem 3)]
            │
            ▼
[Chat Room Created (Mem 2 + 3)] ──> [Timeline Updated]
            │
            ▼
[Users Chat to Arrange Handover] ──> [Item Marked RETURNED]
By dividing integration testing by architectural responsibility, the team successfully transformed four independently built modules into a secure, high-performance, and user-friendly item recovery platform.

Technologies Used
Layer	Technology
Backend Framework	Spring Boot 3.3.4
Language	Java 17
Database	MongoDB Atlas
Authentication	JWT (JJWT 0.11.5) + BCrypt
Build Tool	Maven
Frontend Framework	React 18 + Vite
Styling	Tailwind CSS v3
Routing	React Router v6
State Management	Context API + Zustand
HTTP Client	Axios
Charts	Recharts
Icons	Lucide React
Notifications	React Hot Toast
File Storage	Local filesystem (/uploads)
Deployment (Backend)	Render
Deployment (Frontend)	Vercel
Deployment (Database)	MongoDB Atlas
Version Control	Git + GitHub (SSH)
Setup & Running Instructions
Backend
bash
cd backend
mvn clean install
mvn spring-boot:run
Runs on http://localhost:8080.

Requires:

JDK 17

MongoDB running on localhost:27017 (or MongoDB Atlas URI in application.properties)

Maven 3.6+

Frontend
bash
cd frontend
npm install
npm run dev
Runs on http://localhost:5173.

Requires:

Node.js 20+

npm 10+

Environment Variables (Backend — application.properties)
properties
spring.data.mongodb.uri=mongodb://localhost:27017/lostfound
jwt.secret=YourSuperSecretKeyHereMakeItLongEnoughForHS256
jwt.expiration=86400000
file.upload-dir=./uploads
app.cors.allowed-origins=http://localhost:5173
Environment Variables (Frontend — .env)
text
VITE_API_BASE_URL=http://localhost:8080/api
License
This project was developed as part of the B.Tech curriculum at ACEIT. All code is original work by the team members listed above.

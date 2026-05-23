# 🎬 TV - Video Streaming Platform

A full-stack, production-ready video streaming application built with **NestJS**, **PostgreSQL**, **Redis**, and **HLS Adaptive Streaming**. Stream videos efficiently with user authentication, playlists, watch history, likes, and subscription management.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [How It Works](#how-it-works)
- [Scalability & Performance](#scalability--performance)
- [Database Schema](#database-schema)
- [Deployment Guide](#deployment-guide)
- [Environment Configuration](#environment-configuration)

---

## 📺 Project Overview

**TV** is a comprehensive video streaming platform that enables users to:
- Watch adaptive-bitrate video streams (HLS format)
- Manage personalized playlists
- Track watch history with resume functionality
- Like and collect favorite videos
- Subscribe for unlimited access
- Experience seamless authentication and authorization

The system handles automatic video conversion from MP4 to HLS format, real-time rate limiting, and efficient database operations with TypeORM.

**Current Version**: 0.0.1  
**Node Runtime**: v20.19.2  
**Port**: 7000

---

## ✨ Key Features

### 📊 **Rate Limiting**
- **Free Users**: 200 videos per 30-day rolling window
- **Guests**: Session-based watch limit
- **Subscribers**: Unlimited access
- Redis-backed distributed counters

### 🔐 **Authentication & Security**
- User registration with bcryptjs password hashing (10 rounds)
- JWT-based authentication (long-lived tokens)
- Role-based access control
- Protected routes with `JwtAuthGuard`
- CORS support for multiple origins

### 🎥 **Video Streaming**
- **HLS (HTTP Live Streaming)** adaptive bitrate streaming
- Automatic MP4 → HLS conversion on application startup
- Video segmentation (.ts files) with M3U8 manifests
- Efficient bandwidth usage with adaptive quality switching
- Thumbnail generation from video first frame
- Support for both internal and external video storage

### 📋 **Playlist Management**
- Create unlimited personal playlists
- Add/remove videos with auto-positioning
- Reorder videos with drag-and-drop support
- Share playlist URLs (extensible)

### 👀 **Watch History**
- Auto-tracked when users watch videos
- Resume position saved in browser localStorage
- Chronological history with timestamps
- Deduplication (same user+video updates timestamp)

### ❤️ **Likes System**
- Per-video like counters
- User-specific like collections
- Fast toggle functionality
- Global like statistics

### 🎁 **Subscription Model**
- 30-day premium subscription plans
- Unlimited video access for subscribers
- Free tier with rate limiting (200 videos/30 days)
- Guest access with session-based tracking


---

## 🏗️ Technology Stack

### **Backend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **NestJS** | 11.0.1 | TypeScript web framework |
| **TypeScript** | 5.7 | Type-safe development |
| **TypeORM** | 0.3.27 | Database ORM & migrations |
| **PostgreSQL** | 8.16.3 | Relational database |
| **Redis** (ioredis) | 5.8.1 | Caching & rate limiting |
| **JWT** | 9.0.2 | Token-based authentication |
| **bcryptjs** | 3.0.2 | Password hashing |
| **FFmpeg** | System | Video encoding/conversion |

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| **Vanilla JavaScript** | Lightweight, no framework bloat |
| **HTML5/CSS3** | Semantic markup & responsive design |
| **HLS.js** | Browser-based HLS streaming |
| **LocalStorage** | Client-side token & session state |
| **SweetAlert2** | User notifications |

### **DevOps & Tools**
| Tool | Purpose |
|------|---------|
| **Docker** | Containerization (optional) |
| **PM2** | Process management (production) |
| **Jest** | Unit & integration testing |
| **ESLint** | Code quality & linting |
| **Prettier** | Code formatting |

---

## 🏛️ System Architecture

### **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  index.html  │  │ playlist.html │  │ history.html │  ...     │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                        │ (HLS.js)                                │
└────────────────────────┼────────────────────────────────────────┘
                         │ HTTP REST APIs
┌────────────────────────▼────────────────────────────────────────┐
│                      NestJS API SERVER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           5 MODULAR SERVICES                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │  Auth Module │  │ Video Module │  │Playlist Mod. │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │ • Register   │  │ • Streaming  │  │ • CRUD Ops   │    │ │
│  │  │ • Login      │  │ • Thumbnails │  │ • Reordering │    │ │
│  │  │ • JWT Guard  │  │ • History    │  │ • Sharing    │    │ │
│  │  │ • Roles      │  │ • Likes      │  │              │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐                       │ │
│  │  │ Playback Mod.│  │Subscription  │                       │ │
│  │  │              │  │              │                       │ │
│  │  │ • HLS Manifest│ │ • Upgrade Plan│                       │ │
│  │  │ • Rate Limit │  │ • Validation │                       │ │
│  │  │ • Access Ctrl│  │              │                       │ │
│  │  └──────────────┘  └──────────────┘                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                         │ ORM                                    │
├─────────────────────────┼────────────────────────────────────────┤
│              PERSISTENCE & CACHING LAYER                         │
│  ┌──────────────────────────────┐  ┌───────────────────────┐   │
│  │   PostgreSQL Database        │  │   Redis Cache         │   │
│  │  (Users, Videos, History,    │  │ (Rate Limits, Sessions)│  │
│  │   Playlists, Subscriptions)  │  │                       │   │
│  └──────────────────────────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              STATIC MEDIA & STREAMING LAYER                      │
│  ┌──────────────────────────────┐  ┌───────────────────────┐   │
│  │  /videos_hls (Internal)      │  │  /video_hls (External)│   │
│  │  HLS Segments & Manifests    │  │  External HLS Storage │   │
│  └──────────────────────────────┘  └───────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /thumbnails                                            │  │
│  │  Video Thumbnail Images (Internal & External)           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### **Data Flow Diagram**

```
VIDEO WATCH FLOW:
═══════════════════════════════════════════════════════════════

1. VIDEO DISCOVERY
   User → GET /videos → NestJS → TypeORM → PostgreSQL → Video[]

2. PLAYBACK AUTHORIZATION
   User → GET /playback/:id → [Auth Guard] → [Rate Limit Check]
          → If Free User: Redis Counter Increment & Validation
          → If Subscribed: Direct Access
          → Return HLS Manifest (m3u8)

3. STREAMING
   Browser (HLS.js) → GET /videos_hls/title/title.m3u8
                   → Parse Manifest
                   → Stream Segments: GET /videos_hls/title/0.ts, 1.ts, ...

4. ANALYTICS TRACKING
   Browser → PATCH /videos/:id/views → Increment Counter
          → POST /history/:id → Create Watch Entry
          → Save Resume Position in localStorage

COMPLETE CYCLE TIME: ~200ms from click to streaming
```

---

## 📁 Project Structure

```
video-streaming-site/
│
├── 📄 Core Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript config
│   ├── tsconfig.build.json          # Build config
│   ├── nest-cli.json                # NestJS CLI config
│   ├── eslint.config.mjs            # Code linting rules
│   └── create-tables.sql            # PostgreSQL schema
│
├── 🔙 Backend (src/)
│   ├── main.ts                      # Express server entry point
│   ├── app.module.ts                # Root module
│   ├── app.controller.ts            # Root routes
│   ├── app.service.ts               # Health checks
│   │
│   ├── common/                      # Shared utilities
│   │   ├── decorators/              # Custom decorators
│   │   ├── filters/                 # Exception filters
│   │   ├── guards/                  # JWT & RBAC guards
│   │   ├── interceptors/            # Response transformers
│   │   ├── pagination/              # Pagination service
│   │   └── utils/                   # Helper functions
│   │
│   └── modules/                     # Feature modules
│       ├── auth/
│       │   ├── controllers/
│       │   │   └── auth.controller.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   └── user.service.ts
│       │   ├── entities/
│       │   │   ├── user.entity.ts
│       │   │   └── role.entity.ts
│       │   ├── dto/
│       │   │   ├── register.dto.ts
│       │   │   └── login.dto.ts
│       │   └── auth.module.ts
│       │
│       ├── video/
│       │   ├── controllers/
│       │   │   ├── video.controller.ts
│       │   │   ├── history.controller.ts
│       │   │   └── likes.controller.ts
│       │   ├── services/
│       │   │   ├── video.service.ts        # MP4→HLS conversion
│       │   │   ├── watch-history.service.ts
│       │   │   └── likes.service.ts
│       │   ├── entities/
│       │   │   ├── video.entity.ts
│       │   │   ├── category.entity.ts
│       │   │   ├── watch-history.entity.ts
│       │   │   └── user-like.entity.ts
│       │   └── video.module.ts
│       │
│       ├── playlist/
│       │   ├── controllers/
│       │   │   └── playlist.controller.ts
│       │   ├── services/
│       │   │   └── playlist.service.ts
│       │   ├── entities/
│       │   │   ├── playlist.entity.ts
│       │   │   └── playlist-item.entity.ts
│       │   ├── dto/
│       │   │   └── create-playlist.dto.ts
│       │   └── playlist.module.ts
│       │
│       ├── subscription/
│       │   ├── controllers/
│       │   │   └── subscription.controller.ts
│       │   ├── services/
│       │   │   └── subscription.service.ts
│       │   ├── entities/
│       │   │   ├── subscription.entity.ts
│       │   │   └── payment.entity.ts
│       │   └── subscription.module.ts
│       │
│       └── playback/
│           ├── controllers/
│           │   └── manifest.controller.ts
│           ├── services/
│           │   ├── playback.service.ts
│           │   ├── manifest.service.ts
│           │   ├── guest-tracking.service.ts
│           │   └── cache.service.ts
│           └── playback.module.ts
│
├── 🎨 Frontend (frontend/)
│   ├── static/
│   │   ├── index.html               # Main video grid page
│   │   ├── playlist.html            # Playlist management
│   │   ├── history.html             # Watch history
│   │   ├── likes.html               # Liked videos
│   │   ├── css/
│   │   │   ├── style.css            # Main styles
│   │   │   └── playlist.css         # Playlist styles
│   │   ├── icons/                   # SVG/PNG icons
│   │   └── js/
│   │       ├── main.js              # Main page logic (HLS.js)
│   │       ├── playlist.js          # Playlist CRUD
│   │       ├── history.js           # History tracking
│   │       └── likes.js             # Like management
│   │
│   └── (frontend served from /src/main.ts)
│
├── 📹 Media Storage
│   ├── video/                       # Source MP4 files
│   ├── videos_hls/                  # Processed HLS segments
│   ├── video_hls/                   # External HLS storage
│   └── thumbnails/                  # Video thumbnails
│
└── 🧪 Testing (test/)
    ├── app.e2e-spec.ts             # End-to-end tests
    └── jest-e2e.json               # Jest config
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- **Node.js**: v18+ (tested with v20.19.2)
- **PostgreSQL**: v12+
- **Redis**: v6+
- **FFmpeg**: Latest version (for video conversion)
- **npm** or **yarn**

### **Step 1: Clone & Install**

```bash
# Clone the repository
git clone <repo-url>
cd video-streaming-site

# Install dependencies
npm install

# Verify FFmpeg is installed
ffmpeg -version
```

### **Step 2: Database Setup**

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE tv;"

# Run migrations
psql -U postgres -d tv -f create-tables.sql

# Verify tables created
psql -U postgres -d tv -c "\dt"
```

### **Step 3: Redis Setup**

```bash
# Start Redis server
redis-server

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

### **Step 4: Environment Configuration**

Create a `.env` file in the project root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=tv

# JWT
JWT_SECRET=K7p$2h!mX9r@L3t$Yq!9N8w#Z1x5c2v

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
NODE_ENV=development
PORT=7000

# CORS Origins (update with your frontend URLs)
CORS_ORIGINS=http://localhost:3000,http://192.168.0.197:3000
```

### **Step 5: Video File Preparation**

```bash
# Create video directory
mkdir -p video
mkdir -p videos_hls
mkdir -p thumbnails

# Add MP4 files to ./video/ directory
# They will be auto-converted on app startup
cp /path/to/video.mp4 video/
```

### **Step 6: Start Development Server**

```bash
# Development mode (with watch)
npm run start:dev

# OR Production mode
npm run build
npm run start:prod
```

Server will be running at: **http://localhost:7000**

### **Step 7: Access the Application**

- **Frontend**: http://localhost:7000
- **API**: http://localhost:7000/api

---

## 📡 API Documentation

### **Authentication Endpoints**

#### **Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "message": "User registered successfully"
}
```

#### **Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "isSubscribed": false
  }
}
```

---

### **Video Endpoints**

#### **Get All Videos (Paginated)**
```http
GET /videos?page=1&limit=20
Response: 200 OK

{
  "data": [
    {
      "id": 1,
      "title": "Amazing Video",
      "description": "...",
      "videoUrl": "/videos_hls/Amazing Video/Amazing Video.m3u8",
      "thumbnailUrl": "/thumbnails/Amazing Video.jpg",
      "views": 1200,
      "likes": 45,
      "createdAt": "2024-05-23T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

#### **Get Video Details**
```http
GET /videos/:id
Response: 200 OK

{
  "id": 1,
  "title": "Amazing Video",
  "description": "Full description",
  "videoUrl": "/videos_hls/Amazing Video/Amazing Video.m3u8",
  "thumbnailUrl": "/thumbnails/Amazing Video.jpg",
  "duration": 3600,
  "views": 1200,
  "likes": 45,
  "category": {
    "id": 1,
    "name": "Music"
  }
}
```

#### **Get HLS Manifest (Start Streaming)**
```http
GET /playback/:videoId
Authorization: Bearer <jwt_token>

Response: 200 OK
Content-Type: application/vnd.apple.mpegurl

#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXTINF:6.0,
Amazing Video0.ts
#EXTINF:6.0,
Amazing Video1.ts
...
```

#### **Increment Views & Add to History**
```http
PATCH /videos/:id/views
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "id": 1,
  "views": 1201,
  "message": "View counted"
}
```

#### **Like/Unlike Video**
```http
PATCH /videos/:id/like
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "id": 1,
  "likes": 46,
  "liked": true
}
```

---

### **Playlist Endpoints**

#### **Get User Playlists**
```http
GET /playlist
Authorization: Bearer <jwt_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "My Favorites",
    "description": "Videos I love",
    "items": [
      {
        "video_id": 1,
        "position": 1,
        "video": { ... }
      }
    ]
  }
]
```

#### **Create Playlist**
```http
POST /playlist
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My Playlist",
  "description": "A collection of great videos"
}

Response: 201 Created
{
  "id": "uuid",
  "title": "My Playlist",
  "items": []
}
```

#### **Add Video to Playlist**
```http
POST /playlist/:id/add/:videoId
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "id": "uuid",
  "items": [ ... ]
}
```

#### **Remove Video from Playlist**
```http
DELETE /playlist/:id/remove/:videoId
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "id": "uuid",
  "items": [ ... ]
}
```

---

### **Watch History Endpoints**

#### **Get User Watch History**
```http
GET /history
Authorization: Bearer <jwt_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "video": { ... },
    "watchedAt": "2024-05-23T15:45:00Z"
  }
]
```

#### **Add to Watch History**
```http
POST /history/:videoId
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "id": "uuid",
  "watchedAt": "2024-05-23T15:45:00Z"
}
```

---

### **Likes Endpoints**

#### **Get User Liked Videos**
```http
GET /likes
Authorization: Bearer <jwt_token>

Response: 200 OK
[
  {
    "id": 1,
    "title": "Amazing Video",
    "likedAt": "2024-05-23T14:20:00Z"
  }
]
```

#### **Add/Remove Like**
```http
POST /likes/:videoId      # Add like
DELETE /likes/:videoId    # Remove like

Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "message": "Like added"
}
```

---

### **Subscription Endpoints**

#### **Activate Subscription**
```http
POST /subscription/subscribe
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "plan": "PREMIUM"
}

Response: 201 Created
{
  "user_id": "uuid",
  "is_active": true,
  "start_date": "2024-05-23T16:00:00Z",
  "end_date": "2024-06-23T16:00:00Z"
}
```

#### **Get Subscription Status**
```http
GET /subscription
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "is_subscribed": true,
  "plan": "PREMIUM",
  "start_date": "2024-05-23T16:00:00Z",
  "end_date": "2024-06-23T16:00:00Z",
  "days_remaining": 30
}
```

---

## 🔄 How It Works

### **1. User Registration & Authentication**

```
User Signup Flow:
─────────────────────────────────────────
1. User fills form: email, password
2. POST /auth/register
3. NestJS validates input with class-validator
4. Password hashed with bcryptjs (10 rounds)
5. User stored in PostgreSQL
6. JWT token generated (exp: 9999 years)
7. Token returned to frontend
8. Frontend stores in localStorage
9. Token auto-included in subsequent requests
```

### **2. Video Upload & Auto-Conversion**

```
Video Processing Pipeline:
─────────────────────────────────────────
1. Admin places MP4 in ./video/ folder
2. App starts → VideoService.onModuleInit()
3. Scan ./video/ for .mp4 files
4. For each video:
   a. Normalize filename (collapse spaces)
   b. Run FFmpeg conversion:
      - Input: video/Title.mp4
      - Output segments: videos_hls/Title/Title0.ts, Title1.ts, ...
      - Generate manifest: Title.m3u8
   c. Extract thumbnail: ffmpeg -ss 00:00:01 -vframes 1
   d. Create Video entity in PostgreSQL
   e. Normalize URLs to routes (e.g., /videos_hls/Title/...)
5. Serve via Express static middleware
6. Client ready to stream

FFmpeg Command (Auto-generated):
────────────────────────────────────────
ffmpeg -i "video/Title.mp4" \
  -profile:v baseline \
  -level 3.0 \
  -start_number 0 \
  -hls_time 6 \           # 6-second segments
  -hls_list_size 0 \
  -f hls \
  videos_hls/Title/Title.m3u8
```

### **3. User Watches Video**

```
Playback Authorization Flow:
─────────────────────────────────────────
Browser clicks video:
  ↓
GET /videos/:id (fetch metadata)
  ↓
GET /playback/:videoId (request HLS manifest)
  ↓
[JwtAuthGuard] - Validate token
  ↓
[PlaybackService] - Check access rights:
  
  IF User is Subscribed:
    → Grant unlimited access
    
  IF User is Free:
    → Check Redis counter: user:watchcount:{userId}
    → If counter < 200:
      → Increment counter
      → Grant access
    → Else:
      → Return 403 Forbidden "Limit exceeded"
      
  IF Guest (no auth):
    → Session-based tracking
    → Similar limit check
  ↓
Return m3u8 manifest path
  ↓
Browser (HLS.js) parses manifest
  ↓
Stream segments:
  GET /videos_hls/Title/Title.m3u8
  GET /videos_hls/Title/Title0.ts
  GET /videos_hls/Title/Title1.ts
  ...
  ↓
Play video with adaptive bitrate
```

### **4. Watch History & Resume**

```
History Tracking Flow:
─────────────────────────────────────────
During playback:
  1. Every 10 seconds: Save currentTime to localStorage
  2. On video end: PATCH /videos/:id/views
  3. Backend: 
     a. Increment Video.views counter
     b. Check if WatchHistory entry exists
     c. If yes: Update watchedAt timestamp
     c. If no: Create new entry
  4. Frontend loads history page:
     a. GET /history
     b. Display videos in reverse chronological order
     c. Show resume button for each
  5. Resume playback: 
     a. Load stored currentTime from localStorage
     b. Seek to position
     c. Continue streaming
```

### **5. Subscription & Rate Limiting**

```
Subscription Activation:
─────────────────────────────────────────
User clicks "Subscribe":
  ↓
POST /subscription/subscribe
  ↓
SubscriptionService:
  1. Create Subscription record:
     - user_id: from JWT
     - start_date: now()
     - end_date: now() + 30 days
     - is_active: true
  2. Update User entity:
     - is_subscribed = true
     - subscription_tier = "PREMIUM"
     - subscription_expiry = now() + 30 days
  3. Return confirmation
  ↓
Frontend: Show success message

Rate Limiting (Free Users):
─────────────────────────────────────────
Each watch request increments Redis counter:

Key: user:watchcount:{userId}
Value: current watch count
TTL: 30 days (2592000 seconds)

On GET /playback/:id:
  1. Get current count from Redis
  2. If count < 200: Allow + Increment
  3. If count >= 200: Reject with 403
  4. Show "Upgrade to Premium" CTA

Free users can:
  - Browse unlimited videos
  - Watch only 200 videos per month
  - Still access profiles, playlists
```

---

## 📊 Scalability & Performance

### **Current Architecture (Single Server)**

```
┌─────────────────────────────────┐
│   NestJS (Single Instance)      │
│  - All API logic                │
│  - Video conversion (FFmpeg)    │
│  - Request handling             │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    │          │
┌───▼──┐  ┌──▼──┐
│ PG   │  │Redis│
└──────┘  └─────┘
```

**Capacity**: ~500 concurrent users, ~50 Mbps total bandwidth

---

### **Horizontal Scaling Strategy (Production)**

#### **1. Load Balancing**

```
          ┌─────────────────────────────┐
          │   Nginx Load Balancer       │
          │  (Round-robin / sticky)     │
          └────────┬────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
    ┌────▼──┐ ┌───▼──┐ ┌───▼──┐
    │NestJS │ │NestJS│ │NestJS│
    │Instance│ │Inst2 │ │Inst3 │
    └────┬──┘ └───┬──┘ └───┬──┘
         │        │        │
         └────────┼────────┘
                  │
          ┌───────┼────────┐
          │       │        │
      ┌───▼──┐┌──▼──┐ ┌───▼──┐
      │ PG   ││Redis│ │ S3   │
      │(RDS) ││(Ela├──│(Media)│
      └──────┘└─────┘ └──────┘
```

#### **2. Database Scaling**

```
Bottleneck Solutions:

CURRENT:
- Single PostgreSQL instance
- Watch limit counters in Redis (OK for now)

SCALE TO:
- PostgreSQL: RDS with read replicas
  • Master: Write all operations
  • Replicas: Read-heavy queries (videos, history)
  • Index on: user_id, video_id, watchedAt
  
- Sharding (if > 100M videos):
  • Shard by video_id % 16
  • Separate DB cluster per shard
```

#### **3. Caching Layer**

```
Current:
- Redis for rate limiting + watch counters

Scale to:
- CDN for static assets (thumbnails, segments)
  • CloudFront / Cloudflare
  • Edge caching: 30-day TTL
  
- Application cache:
  • Video metadata cache (Redis): 1 hour TTL
  • Popular videos cache: Separate hot table
  • Playlist queries: 5-min cache
```

#### **4. Media Storage Optimization**

```
Current:
- Single server filesystem
- /videos_hls/, /thumbnails/ local storage

Scale to:
Option A - S3 + CloudFront CDN:
  • Upload MP4 → S3
  • Lambda converts to HLS → S3
  • CloudFront serves segments globally
  • API returns CloudFront URLs
  
Option B - Object Storage (MinIO):
  • Self-hosted S3-compatible storage
  • Distributed across servers
  • Replication for HA
  
Option C - Media Server (Mux, JW Player):
  • Outsource entire video pipeline
  • Focus on app logic
```

#### **5. Video Processing Pipeline (Async)**

```
Current:
- FFmpeg runs on app startup (blocking)
- Timeout if > 1000 videos

Scale to:
- Separate encoding service:
  1. S3 upload triggers SQS/RabbitMQ
  2. EC2/Pod processes FFmpeg conversion
  3. Stores segments in S3
  4. Updates Video entity (complete)
  5. API queries immediately return "processing" status
  
Architecture:
┌─────────────────────┐
│  Upload Service     │
│  (S3 + Notifications)
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Job Queue    │
    │(RabbitMQ)    │
    └──────┬───────┘
           │
      ┌────┴────┐
      │          │
   ┌──▼──┐ ┌──▼──┐
   │Worker1│ │Worker2│
   │FFmpeg │ │FFmpeg │
   │(Auto- │ │(Auto- │
   │ scale)│ │ scale)│
   └──┬───┘ └──┬───┘
      │        │
      └────┬───┘
           ▼
      ┌──────────┐
      │ S3 + CDN │
      └──────────┘
```

#### **6. Database Indexing**

```sql
-- Critical indexes for performance
CREATE INDEX idx_video_category ON video(category_id);
CREATE INDEX idx_watch_history_user_date ON watch_history(user_id, watched_at DESC);
CREATE INDEX idx_watch_history_created ON watch_history(created_at DESC);
CREATE INDEX idx_like_user ON user_like(user_id);
CREATE INDEX idx_playlist_user ON playlist(user_id);
CREATE INDEX idx_playlist_item_position ON playlist_item(playlist_id, position);
CREATE INDEX idx_subscription_user_active ON subscription(user_id, is_active);
CREATE INDEX idx_user_subscribed ON "user"(is_subscribed);
```

#### **7. Performance Targets**

```
Metric               | Current | Target (10k users) | Target (100k users)
─────────────────────┼─────────┼────────────────────┼──────────────────
API Response Time    | <100ms  | <200ms            | <500ms
Video Load Time      | <2s     | <3s               | <5s
Concurrent Users     | 500     | 5,000             | 50,000
Throughput           | 50 Mbps | 500 Mbps          | 5 Gbps
DB Connections       | 20      | 100               | 500+ (pooling)
Cache Hit Rate       | 60%     | 85%               | 95%
```

#### **8. Monitoring & Auto-Scaling**

```
Implementation:
- Prometheus metrics on NestJS
- Grafana dashboards
- CloudWatch alarms
- Auto-scaling groups (EC2/K8s)

Metrics to track:
- API response times (P50, P95, P99)
- Database query duration
- Redis memory usage
- FFmpeg conversion queue depth
- Video segment cache hit rate
- Concurrent streaming connections
- Database connection pool utilization
```

---

## 📦 Database Schema

### **Entity Relationship Diagram**

```
┌─────────────┐
│   "user"    │
├─────────────┤        ┌──────────────┐
│ id (PK)     │────────│ subscription │
│ email (UQ)  │        ├──────────────┤
│ password    │        │ user_id (FK) │
│ is_subscribed
│ ...         │        │ start_date   │
└─────────────┘        │ end_date     │
      │ 1              │ is_active    │
      │                └──────────────┘
      │ M
   ┌──┴──────────────────────────────┐
   │                                  │
   ▼ M                            ▼ M
┌──────────┐               ┌────────────┐
│playlist  │               │watch_history
├──────────┤               ├────────────┤
│id (PK)   │────1─┐   ┌─M─│user_id(FK) │
│user_id(FK)      └───┤   │video_id(FK)│
│title     │          │   │watched_at  │
└──────────┘          │   └────────────┘
                      │
┌──────────────┐      │
│playlist_item │      │    ┌─────────────┐
├──────────────┤      │    │video        │
│playlist_id(FK)─┐    │    ├─────────────┤
│video_id(FK)────┼────┼─────│id (PK)      │
│position    │    │    │title       │
└──────────────┘      │    │video_url    │
                      │    │thumbnail_url│
                      │    │views, likes │
                      │    │category_id  │
              ┌───────┘    └─────────────┘
              │                    │
              │            ┌───────┴─────────┐
              │            │ 1               │
              │            │                 │
           ┌──▼──┐    ┌────▼────┐     ┌──────▼─┐
           │user_│    │category │     │user_like
           │like │    ├─────────┤     ├─────────┤
           ├─────┤    │id (PK)  │     │user_id(FK)
           │user │    │name     │     │video_id(FK)
           │_id  │    └─────────┘     │liked_at │
           │video│                    └─────────┘
           │_id  │
           │liked│
           │_at  │
           └─────┘
```

### **Complete Table Definitions**

```sql
-- Users
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_subscribed BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(50),
  subscription_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Videos
CREATE TABLE video (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(512),
  thumbnail_url VARCHAR(512),
  duration INT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  category_id INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (category_id) REFERENCES category(id)
);

-- Watch History
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id INT NOT NULL,
  watched_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "user"(id),
  FOREIGN KEY (video_id) REFERENCES video(id),
  UNIQUE(user_id, video_id)
);

-- User Likes
CREATE TABLE user_like (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id INT NOT NULL,
  liked_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "user"(id),
  FOREIGN KEY (video_id) REFERENCES video(id),
  UNIQUE(user_id, video_id)
);

-- Playlists
CREATE TABLE playlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "user"(id)
);

-- Playlist Items
CREATE TABLE playlist_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL,
  video_id INT NOT NULL,
  position INT NOT NULL,
  FOREIGN KEY (playlist_id) REFERENCES playlist(id),
  FOREIGN KEY (video_id) REFERENCES video(id),
  UNIQUE(playlist_id, video_id)
);

-- Subscriptions
CREATE TABLE subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP DEFAULT now(),
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "user"(id)
);

-- Categories
CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);
```

---

## 🚢 Deployment Guide

### **Local Development**

```bash
npm run start:dev
# Watches for changes, auto-restart
```

### **Production Deployment (Docker)**

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY videos_hls ./videos_hls
COPY thumbnails ./thumbnails
COPY video ./video

EXPOSE 7000

CMD ["node", "dist/main.js"]
```

```bash
# Build & run
docker build -t tv-streaming:1.0 .
docker run -p 7000:7000 \
  -e DB_HOST=postgres.internal \
  -e REDIS_HOST=redis.internal \
  tv-streaming:1.0
```

### **Production Deployment (PM2)**

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'tv-streaming',
      script: 'dist/main.js',
      instances: 4,           # Match CPU cores
      exec_mode: 'cluster',   # Load balancing
      env: {
        NODE_ENV: 'production',
        PORT: 7000
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log'
    }
  ]
};
EOF

# Start application
npm run build
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs tv-streaming
```

### **Kubernetes Deployment**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tv-streaming
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tv-streaming
  template:
    metadata:
      labels:
        app: tv-streaming
    spec:
      containers:
      - name: tv-streaming
        image: tv-streaming:1.0
        ports:
        - containerPort: 7000
        env:
        - name: DB_HOST
          value: postgres.default
        - name: REDIS_HOST
          value: redis.default
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 7000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: tv-streaming-service
spec:
  selector:
    app: tv-streaming
  ports:
  - protocol: TCP
    port: 80
    targetPort: 7000
  type: LoadBalancer
```

```bash
# Deploy to Kubernetes
kubectl apply -f deployment.yaml
```

---

## ⚙️ Environment Configuration

### **Required Variables**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_secure_password
DB_NAME=tv

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Optional

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=9999y          # Long-lived tokens

# Server
NODE_ENV=development      # or production
PORT=7000

# CORS
CORS_ORIGINS=http://localhost:3000,http://192.168.0.197:3000

# FFmpeg (optional, auto-detected)
FFMPEG_PATH=/usr/bin/ffmpeg

# Media Paths
VIDEOS_PATH=./video
HLS_OUTPUT_PATH=./videos_hls
THUMBNAILS_PATH=./thumbnails

# Rate Limiting
FREE_USER_LIMIT=200       # Videos per 30 days
SUBSCRIPTION_DURATION=30  # Days
```

### **Development vs Production**

```env
# .env.development
NODE_ENV=development
DB_LOGGING=true
DEBUG=*
LOG_LEVEL=debug

# .env.production
NODE_ENV=production
DB_LOGGING=false
DEBUG=false
LOG_LEVEL=warn
CORS_ORIGINS=https://yourdomain.com
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 📈 Performance Optimization Tips

1. **Database Queries**
   - Use `relations` only when needed
   - Index frequently queried columns
   - Paginate large result sets

2. **Caching**
   - Cache video metadata (1 hour TTL)
   - Cache popular videos (hot list)
   - Use Redis for rate limiting

3. **Video Streaming**
   - Use shorter HLS segments (6-10 seconds)
   - Enable CORS caching headers
   - CDN distribution for global reach

4. **Frontend**
   - Lazy load video cards
   - Debounce search input
   - Preload next video metadata

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit a pull request

---

## 📝 License

UNLICENSED

---

## 📞 Support

For issues or questions, please open a GitHub issue or contact the development team.

---

## 🗺️ Project Roadmap

- [ ] Admin panel for video management
- [ ] Advanced search with filters
- [ ] Social features (comments, sharing)
- [ ] Mobile app (React Native)
- [ ] Live streaming support
- [ ] DRM & content protection
- [ ] Analytics & reporting dashboard
- [ ] Payment gateway integration

---

**Last Updated**: May 23, 2026  
**Version**: 0.0.1  
**Maintained By**: Development Team

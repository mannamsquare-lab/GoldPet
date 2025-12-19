# GoldPet Flutter Client Implementation Plan

This document outlines the plan for implementing the GoldPet Flutter client, based on the project's vision, backend features already implemented, and standard Flutter development practices.

## 1. Project Setup & Core Configuration

*   **Locate/Create Flutter Project:**
    *   Identify the root directory of the Flutter project. If it doesn't exist, create a new Flutter project.
*   **Add Dependencies:**
    *   `http` or `dio` for API calls.
    *   `web_socket_channel` for WebSocket communication.
    *   State Management: `provider`, `bloc`, or `riverpod` (choose based on project conventions or team preference).
    *   Navigation: `go_router` for declarative routing and deep linking.
    *   Mapping: `flutter_naver_map` for Naver Maps integration.
    *   Local Storage: `shared_preferences` or `flutter_secure_storage` for tokens/user data.
    *   Image Handling: `image_picker`, `cached_network_image`.
    *   Date/Time: `intl`.
*   **Basic Project Structure:**
    *   Organize into `lib/src/features`, `lib/src/common`, `lib/src/core`, etc.
*   **Theming:**
    *   Define `ThemeData` for light and dark modes, adhering to Material 3 guidelines.
    *   Establish a consistent color scheme and typography.

## 2. Authentication & User Management

*   **OAuth2 Integration:**
    *   Implement login flows for Google, Kakao, Naver, Apple using appropriate Flutter packages.
    *   Handle redirection and token exchange with the backend.
*   **JWT Handling:**
    *   Securely store and retrieve JWT access and refresh tokens.
    *   Implement token refresh logic.
    *   Integrate JWT with API calls (e.g., using `Interceptor` with `dio`).
*   **User Profile Management:**
    *   UI for displaying and updating user profile information (`GET /api/v1/users/me`, `PUT /api/v1/users/me`).
    *   UI for updating profile image (`PUT /api/v1/users/me/profile-image`).

## 3. Pet Profile Management

*   **Pet Profile UI:**
    *   Screens for creating, viewing, updating, and deleting pet profiles (`/api/v1/pets`).
    *   Integrate with backend API endpoints.
    *   Handle pet species and breed selection.

## 4. Walk & Map Features

*   **Naver Maps Integration:**
    *   Initialize and display Naver Maps.
    *   Implement custom markers and overlays.
*   **GPS Tracking:**
    *   Use `geolocator` package to track user's location during walks.
    *   Record and display walk routes on the map.
*   **Walk Records:**
    *   UI for starting, stopping, and saving walk records.
    *   Display walk details (distance, duration, calories).
    *   Integrate with backend API endpoints for walk records.
*   **Walk Spots:**
    *   UI for adding photo spots during a walk.
    *   Integrate with backend API endpoints.

## 5. Friend & Matching

*   **User Discovery:**
    *   UI for searching and displaying nearby users/pets.
    *   Implement "like" functionality (`POST /api/v1/matches/like`).
*   **Match Display:**
    *   UI for displaying matched users.

## 6. Chat Features

*   **Chat Room Management:**
    *   UI for listing user's chat rooms (`GET /api/v1/chat/rooms/my`).
    *   UI for creating new chat rooms (`POST /api/v1/chat/rooms`).
*   **Real-time Messaging:**
    *   Establish WebSocket connection to `/ws` endpoint.
    *   Implement STOMP client for sending and receiving messages.
    *   UI for displaying chat messages in real-time.
    *   Integrate with `ChatService` for message persistence.
*   **Chat History:**
    *   UI for loading historical messages (`GET /api/v1/chat/rooms/{roomId}/messages`).

## 7. AI Pet Profile Generation

*   **UI for AI Profile Request:**
    *   Screen for users to upload pet photos and select AI styles.
    *   Display progress and generated AI profiles.
    *   Integrate with backend API endpoints.

## 8. Community

*   **Post Listing/Creation:**
    *   UI for browsing community posts by category.
    *   UI for creating new posts (text, images).
*   **Comments & Likes:**
    *   UI for viewing and adding comments.
    *   UI for liking posts.
    *   Integrate with backend API endpoints.

## 9. Gamification & Place Check-in

*   **Badges & Challenges:**
    *   UI for displaying user badges and achievements.
    *   UI for participating in and tracking challenges.
*   **Place Check-in:**
    *   UI for checking into pet-friendly places.
    *   Integrate with backend API endpoints.

## 10. UI/UX Design & Theming

*   **Material Design 3:**
    *   Adhere to modern Material Design principles for a consistent and intuitive user experience.
*   **Responsiveness:**
    *   Ensure the UI adapts gracefully to different screen sizes and orientations.
*   **Theming:**
    *   Implement light and dark theme support.
    *   Utilize `ThemeData` for consistent styling.

## 11. Testing

*   **Unit Tests:** For business logic and utility functions.
*   **Widget Tests:** For individual UI components.
*   **Integration Tests:** For end-to-end user flows.

---
This plan provides a comprehensive roadmap for developing the GoldPet Flutter client, ensuring alignment with the backend and project requirements.

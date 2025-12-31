import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/data/auth_repository.dart'; // Added
import '../../features/home/screens/home_screen.dart';
import '../../features/pet/screens/pet_registration_screen.dart';
import '../../features/walk/screens/walk_screen.dart';
import '../../features/friend/screens/friend_screen.dart';
import '../../features/community/screens/community_screen.dart';
import '../../features/community/screens/community_post_detail_screen.dart';
import '../../features/gamification/screens/gamification_screen.dart';
import '../../features/checkin/screens/checkin_screen.dart';
// Added
import '../../features/ai/screens/ai_profile_screen.dart'; // Added
import '../../features/chat/screens/chat_list_screen.dart';
import '../../features/chat/screens/chat_room_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/notification/screens/notification_screen.dart';
import '../../shared/widgets/main_shell.dart';
import '../../features/auth/providers/auth_provider.dart';

part 'app_router.g.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

@riverpod
GoRouter appRouter(Ref ref) {
  // Watch auth provider to trigger rebuilds on state change
  ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    redirect: (context, state) async {
      // Watch auth provider to trigger rebuilds on state change
      final authState = ref.watch(authProvider);

      // 1. Check Token
      final repository = ref.read(authRepositoryProvider);
      final token = await repository.getAccessToken();
      final isLoggedIn = token != null;

      // 2. Define Public Routes
      final isSplash = state.matchedLocation == '/splash';
      final isLogin = state.matchedLocation == '/login';
      final isPublic = isSplash || isLogin;

      // 3. Redirect Logic
      if (!isLoggedIn && !isPublic) {
        return '/login';
      }

      if (isLoggedIn && isLogin) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/pet/register',
        builder: (context, state) => const PetRegistrationScreen(),
      ),
      GoRoute(
        path: '/chat/:roomId',
        builder: (context, state) {
          final roomId = int.parse(state.pathParameters['roomId']!);
          final extra = state.extra as Map<String, dynamic>?;
          return ChatRoomScreen(
            roomId: roomId,
            title: extra?['title'] as String?,
          );
        },
      ),
      GoRoute(
        path: '/community/:postId',
        builder: (context, state) {
          final postId = int.parse(state.pathParameters['postId']!);
          return CommunityPostDetailScreen(postId: postId);
        },
      ),
      GoRoute(
        path: '/gamification',
        builder: (context, state) => const GamificationScreen(),
      ),
      GoRoute(
        path: '/ai-profile',
        builder: (context, state) => const AIProfileScreen(),
      ),
      GoRoute(
        path: '/checkin',
        builder: (context, state) => const CheckInScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/walk',
                builder: (context, state) => const WalkScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/friend',
                builder: (context, state) => const FriendScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/community',
                builder: (context, state) => const CommunityScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/chat',
                builder: (context, state) => const ChatListScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

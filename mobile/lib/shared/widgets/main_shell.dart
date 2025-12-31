import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_rounded), label: '홈'),
          NavigationDestination(
            icon: Icon(Icons.directions_walk_rounded),
            label: '산책',
          ),
          NavigationDestination(icon: Icon(Icons.people_rounded), label: '친구'),
          NavigationDestination(icon: Icon(Icons.forum_rounded), label: '커뮤니티'),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_rounded),
            label: '채팅',
          ),
          NavigationDestination(icon: Icon(Icons.person_rounded), label: '프로필'),
        ],
      ),
    );
  }
}

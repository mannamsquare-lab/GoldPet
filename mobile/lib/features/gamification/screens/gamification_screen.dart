import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/gamification_providers.dart';

class GamificationScreen extends ConsumerWidget {
  const GamificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('활동 & 도전'),
          bottom: const TabBar(
            tabs: [
              Tab(text: '내 뱃지'),
              Tab(text: '챌린지'),
            ],
          ),
        ),
        body: const TabBarView(children: [BadgesTab(), ChallengesTab()]),
      ),
    );
  }
}

class BadgesTab extends ConsumerWidget {
  const BadgesTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncBadges = ref.watch(myBadgesProvider);

    return asyncBadges.when(
      data: (badges) {
        if (badges.isEmpty) {
          return const Center(child: Text('획득한 뱃지가 없습니다. 열심히 활동해보세요!'));
        }
        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
          ),
          itemCount: badges.length,
          itemBuilder: (context, index) {
            final badge = badges[index];
            return Column(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundImage: NetworkImage(badge.imageUrl),
                  onBackgroundImageError: (exception, stackTrace) =>
                      const Icon(Icons.star), // Fallback
                ),
                const SizedBox(height: 8),
                Text(
                  badge.name,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            );
          },
        );
      },
      error: (err, stack) => Center(child: Text('Error: $err')),
      loading: () => const Center(child: CircularProgressIndicator()),
    );
  }
}

class ChallengesTab extends ConsumerWidget {
  const ChallengesTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncChallenges = ref.watch(activeChallengesProvider);
    final asyncProgress = ref.watch(myChallengeProgressProvider);

    return asyncChallenges.when(
      data: (challenges) {
        if (challenges.isEmpty) {
          return const Center(child: Text('진행 중인 챌린지가 없습니다.'));
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: challenges.length,
          itemBuilder: (context, index) {
            final challenge = challenges[index];

            // Find progress if available (handling separate provider loading logic simplified here)
            final progressValue = asyncProgress.asData?.value
                .where((p) => p.challengeId == challenge.id)
                .firstOrNull;

            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: ListTile(
                title: Text(challenge.title),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(challenge.description),
                    if (progressValue != null) ...[
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: progressValue.progressPercent / 100,
                      ),
                      Text(
                        '${progressValue.currentValue} / ${challenge.goalValue}',
                      ),
                    ],
                  ],
                ),
                trailing: progressValue?.status == 'COMPLETED'
                    ? const Icon(Icons.check_circle, color: Colors.green)
                    : const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  // Show detail
                },
              ),
            );
          },
        );
      },
      error: (err, stack) => Center(child: Text('Error: $err')),
      loading: () => const Center(child: CircularProgressIndicator()),
    );
  }
}

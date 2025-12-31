import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../data/community_models.dart';
import '../providers/community_list_provider.dart';
import 'write_post_screen.dart';
import 'community_post_detail_screen.dart';

class CommunityScreen extends ConsumerWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncPosts = ref.watch(communityListProvider);
    final asyncCategories = ref.watch(communityCategoriesProvider);
    final notifier = ref.read(communityListProvider.notifier);

    // Assuming we can access _currentCategoryId via checking a provider state or simple variable?
    // Since riverpod Notifier getter isn't directly observable in build without state change.
    // However, when setCategory is called, it triggers refresh() which updates state, so build runs.
    // But modifying the Notifier to expose `currentCategoryId` in `state` would be better if we want to redraw the chips.
    // For now, I'll rely on a local StateProvider for UI selection state for immediate feedback?
    // No, let's keep it simple. We can assume `notifier.currentCategoryId` is stable across rebuilds if the notifier is alive.
    // BUT, accessing properties of notifier in build time is okay for reading, but to trigger rebuild on change we need state.

    // Better approach: Since `communityListProvider` state only holds `List<Post>`, we don't know the selected category on UI redraw unless we store it elsewhere.
    // Let's create a local `selectedCategoryProvider` in this file or use a useState hook if it was hooks_riverpod.
    // Since it's ConsumerWidget, let's use a separate provider for selection in the UI.
    // Wait, I modified `CommunityListNotifier` to hold `_currentCategoryId`. I can read it.
    // To make UI reactive to category change, I should have probably included it in the state.

    // Quick Fix: I will just use a `StateProvider` for the selected category ID in this file for UI sync,
    // and listen to it to update the list.

    return Scaffold(
      appBar: AppBar(
        title: const Text('커뮤니티'),
        actions: [IconButton(icon: const Icon(Icons.search), onPressed: () {})],
      ),
      body: Column(
        children: [
          // Category Filter
          SizedBox(
            height: 50,
            child: asyncCategories.when(
              data: (categories) {
                return ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: categories.length + 1, // +1 for "All"
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      final isSelected = notifier.currentCategoryId == null;
                      return ChoiceChip(
                        label: const Text('전체'),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) notifier.setCategory(null);
                        },
                      );
                    }
                    final category = categories[index - 1];
                    final isSelected =
                        notifier.currentCategoryId == category.id;
                    return ChoiceChip(
                      label: Text(category.name),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) notifier.setCategory(category.id);
                      },
                    );
                  },
                );
              },
              error: (_, __) => const SizedBox(),
              loading: () => const Center(child: CircularProgressIndicator()),
            ),
          ),

          Expanded(
            child: asyncPosts.when(
              data: (posts) {
                if (posts.isEmpty) {
                  return const Center(child: Text('게시글이 없습니다.'));
                }
                return RefreshIndicator(
                  onRefresh: () =>
                      ref.read(communityListProvider.notifier).refresh(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: posts.length,
                    itemBuilder: (context, index) =>
                        _PostItem(post: posts[index]),
                  ),
                );
              },
              error: (err, stack) => Center(child: Text('Error: $err')),
              loading: () => const Center(child: CircularProgressIndicator()),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          final currentCategoryId = ref
              .read(communityListProvider.notifier)
              .currentCategoryId;
          if (currentCategoryId == null) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("글을 작성할 카테고리를 먼저 선택해주세요.")),
            );
            return;
          }
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => WritePostScreen(categoryId: currentCategoryId),
            ),
          );
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.edit, color: Colors.black),
      ),
    );
  }
}

class _PostItem extends StatelessWidget {
  final CommunityPostModel post;
  const _PostItem({required this.post});

  // Helper function to format date
  String _formatDate(DateTime date) {
    return "${date.year}.${date.month.toString().padLeft(2, '0')}.${date.day.toString().padLeft(2, '0')}";
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CommunityPostDetailScreen(postId: post.id),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Colors.grey[200],
                  backgroundImage: post.userProfileImage != null
                      ? NetworkImage(post.userProfileImage!)
                      : null,
                  child: post.userProfileImage == null
                      ? const Icon(Icons.person, size: 20, color: Colors.grey)
                      : null,
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.userNickname ?? '알 수 없음',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      _formatDate(post.createdAt),
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    ),
                  ],
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    post.categoryName,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              post.title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Text(
              post.content,
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.favorite_border, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(
                  '${post.likeCount}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
                const SizedBox(width: 16),
                Icon(
                  Icons.chat_bubble_outline,
                  size: 16,
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 4),
                Text(
                  '${post.commentCount}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
                const Spacer(),
                Icon(
                  Icons.visibility_outlined,
                  size: 16,
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 4),
                Text(
                  '${post.viewCount}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

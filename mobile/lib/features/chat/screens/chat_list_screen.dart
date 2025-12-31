import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/chat_list_provider.dart';
import '../data/chat_models.dart';

class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(chatListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('채팅')),
      body: state.when(
        data: (data) => data.isEmpty
            ? const Center(child: Text('채팅방이 없습니다.'))
            : ListView.builder(
                itemCount: data.length,
                itemBuilder: (context, index) {
                  return _ChatItem(room: data[index]);
                },
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: ${err.toString()}')),
      ),
    );
  }
}

class _ChatItem extends StatelessWidget {
  final ChatRoomModel room;
  const _ChatItem({required this.room});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        context.push(
          '/chat/${room.id}',
          extra: {'title': room.title ?? 'Chat Room'},
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.divider)),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: AppColors.primaryLight,
              child: Icon(Icons.person, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        room.title ?? 'No Title',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      // Time would need logic
                    ],
                  ),
                  const SizedBox(height: 4),
                  // Last message not available in model yet
                  const Text(
                    'Tap to view messages',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

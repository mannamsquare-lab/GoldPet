import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../data/notification_models.dart';
import '../providers/notification_providers.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationList = ref.watch(notificationListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('알림'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: '모두 읽음으로 표시',
            onPressed: () {
              ref.read(notificationControllerProvider.notifier).markAllAsRead();
            },
          ),
        ],
      ),
      body: notificationList.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return const Center(child: Text('새로운 알림이 없습니다.'));
          }
          return RefreshIndicator(
            onRefresh: () async {
              return ref.refresh(notificationListProvider.future);
            },
            child: ListView.separated(
              itemCount: notifications.length,
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final notification = notifications[index];
                return Dismissible(
                  key: Key('notification_${notification.id}'),
                  background: Container(
                    color: Colors.red.withValues(alpha: 0.1),
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  direction: DismissDirection.endToStart,
                  onDismissed: (direction) {
                    ref
                        .read(notificationControllerProvider.notifier)
                        .deleteNotification(notification.id);
                  },
                  child: NotificationTile(notification: notification),
                );
              },
            ),
          );
        },
        error: (error, stack) => Center(child: Text('오류 발생: $error')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class NotificationTile extends ConsumerWidget {
  final NotificationModel notification;

  const NotificationTile({super.key, required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Determine icon based on type (simple heuristic)
    IconData iconData = Icons.notifications;
    Color iconColor = Colors.grey;

    if (notification.type == 'MATCH') {
      iconData = Icons.favorite;
      iconColor = Colors.pink;
    } else if (notification.type == 'COMMENT') {
      iconData = Icons.comment;
      iconColor = Colors.blue;
    } else if (notification.type == 'WALK') {
      iconData = Icons.directions_walk;
      iconColor = Colors.green;
    }

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: iconColor.withValues(alpha: 0.1),
        child: Icon(iconData, color: iconColor),
      ),
      title: Text(
        notification.title,
        style: TextStyle(
          fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(notification.message),
          const SizedBox(height: 4),
          if (notification.createdAt != null)
            Text(
              DateFormat('MM/dd HH:mm').format(notification.createdAt!),
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
        ],
      ),
      tileColor: notification.isRead
          ? null
          : Colors.blue.withValues(alpha: 0.05),
      onTap: () {
        if (!notification.isRead) {
          ref
              .read(notificationControllerProvider.notifier)
              .markAsRead(notification.id);
        }

        // Handle navigation based on targetType
        if (notification.targetType == 'POST' &&
            notification.targetId != null) {
          context.push('/community/${notification.targetId}');
        } else if (notification.targetType == 'MATCH') {
          // context.push('/friend'); // or similar
        }
      },
    );
  }
}

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/notification_models.dart';
import '../data/notification_repository.dart';

part 'notification_providers.g.dart';

@riverpod
class NotificationList extends _$NotificationList {
  @override
  FutureOr<List<NotificationModel>> build() async {
    return _fetchNotifications(page: 0);
  }

  Future<List<NotificationModel>> _fetchNotifications({required int page}) {
    return ref
        .read(notificationRepositoryProvider)
        .getNotifications(page: page);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchNotifications(page: 0));
  }

  // Method to mark a specific notification as read in the local state
  void markAsReadLocally(int notificationId) {
    if (state.hasValue) {
      final currentList = state.value!;
      final updatedList = currentList.map((n) {
        if (n.id == notificationId) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();
      state = AsyncValue.data(updatedList);
    }
  }

  // Method to remove a notification locally
  void removeLocally(int notificationId) {
    if (state.hasValue) {
      final currentList = state.value!;
      final updatedList = currentList
          .where((n) => n.id != notificationId)
          .toList();
      state = AsyncValue.data(updatedList);
    }
  }
}

@riverpod
Future<int> unreadNotificationCount(Ref ref) async {
  final repository = ref.read(notificationRepositoryProvider);
  return repository.getUnreadCount();
}

@riverpod
class NotificationController extends _$NotificationController {
  @override
  FutureOr<void> build() {}

  Future<void> markAsRead(int notificationId) async {
    final repository = ref.read(notificationRepositoryProvider);
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await repository.markAsRead(notificationId);
      // Update the list state optimistically or re-fetch
      ref
          .read(notificationListProvider.notifier)
          .markAsReadLocally(notificationId);
      ref.invalidate(unreadNotificationCountProvider);
    });
  }

  Future<void> markAllAsRead() async {
    final repository = ref.read(notificationRepositoryProvider);
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await repository.markAllAsRead();
      ref.invalidate(notificationListProvider);
      ref.invalidate(unreadNotificationCountProvider);
    });
  }

  Future<void> deleteNotification(int notificationId) async {
    final repository = ref.read(notificationRepositoryProvider);
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await repository.deleteNotification(notificationId);
      ref.read(notificationListProvider.notifier).removeLocally(notificationId);
      ref.invalidate(unreadNotificationCountProvider);
    });
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import 'notification_models.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository(ref.read(apiClientProvider));
});

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository(this._apiClient);

  Future<List<NotificationModel>> getNotifications({
    int page = 0,
    int size = 20,
  }) async {
    final response = await _apiClient.get(
      '/v1/notifications',
      queryParameters: {'page': page, 'size': size},
    );
    // Spring Page response handling
    final content = response.data['content'] as List;
    return content.map((e) => NotificationModel.fromJson(e)).toList();
  }

  Future<int> getUnreadCount() async {
    final response = await _apiClient.get('/v1/notifications/unread-count');
    return UnreadCountResponse.fromJson(response.data).count;
  }

  Future<void> markAsRead(int notificationId) async {
    await _apiClient.post('/v1/notifications/$notificationId/read');
  }

  Future<void> markAllAsRead() async {
    await _apiClient.post('/v1/notifications/read-all');
  }

  Future<void> deleteNotification(int notificationId) async {
    await _apiClient.delete('/v1/notifications/$notificationId');
  }
}

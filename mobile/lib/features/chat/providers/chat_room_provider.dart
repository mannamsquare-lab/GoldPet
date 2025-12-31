import 'dart:async';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/chat_models.dart';
import '../data/chat_repository.dart';

part 'chat_room_provider.g.dart';

@riverpod
class ChatRoom extends _$ChatRoom {
  StreamSubscription<ChatMessageModel>? _subscription;

  @override
  FutureOr<List<ChatMessageModel>> build(int roomId) async {
    final repository = ref.read(chatRepositoryProvider);

    // 1. Connect and Subscribe
    await repository.connect();
    repository.subscribeToRoom(roomId);

    // 2. Listen for real-time messages
    _subscription = repository.messageStream.listen((message) {
      if (message.roomId == roomId) {
        // Append new message to the list
        final currentList = state.value ?? [];
        // Dedup check if needed, but simple append for now
        if (!currentList.any((m) => m.id == message.id)) {
          // Optional check
          state = AsyncValue.data([...currentList, message]);
        }
      }
    });

    // 3. Clean up on dispose
    ref.onDispose(() {
      _subscription?.cancel();
      // repository.disconnect(); // Optional: or keep it alive for other rooms?
      // For now, keeping it alive might be better for switching rooms.
      // But if we want to save battery/resources, maybe disconnect if no listeners?
      // Leaving global disconnect logic for later or app lifecycle.
    });

    // 4. Fetch History
    final history = await repository.getChatMessages(roomId);
    return history.reversed.toList();
  }

  Future<void> sendMessage(String text, int senderId) async {
    final repository = ref.read(chatRepositoryProvider);
    final request = ChatMessageRequest(
      roomId: roomId,
      senderId: senderId,
      messageType: 'TEXT',
      textContent: text,
    );
    repository.sendMessage(request);
  }
}

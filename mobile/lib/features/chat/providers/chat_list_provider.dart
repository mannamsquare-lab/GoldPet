import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/chat_models.dart';
import '../data/chat_repository.dart';

part 'chat_list_provider.g.dart';

@riverpod
class ChatList extends _$ChatList {
  @override
  FutureOr<List<ChatRoomModel>> build() async {
    final repository = ref.watch(chatRepositoryProvider);
    return await repository.getMyChatRooms();
  }
}

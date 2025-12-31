import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import 'chat_models.dart';

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepository(
    ref.read(apiClientProvider),
    const FlutterSecureStorage(),
  );
});

class ChatRepository {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage;
  StompClient? _stompClient;

  // Stream controller to broadcast incoming messages to listeners (ChatRoomNotifier)
  final _messageStreamController =
      StreamController<ChatMessageModel>.broadcast();
  Stream<ChatMessageModel> get messageStream => _messageStreamController.stream;

  ChatRepository(this._apiClient, this._storage);

  Future<void> connect() async {
    final token = await _storage.read(key: StorageKeys.accessToken);
    if (token == null) return;

    // Replace http:// with ws:// for WebSocket connection
    // Assuming ApiConstants.baseUrl is like 'http://192.168.1.5:8080'
    final baseUrl = ApiConstants.baseUrl
        .replaceAll('http://', 'ws://')
        .replaceAll('https://', 'wss://');
    final socketUrl = '$baseUrl/ws';

    _stompClient = StompClient(
      config: StompConfig(
        url: socketUrl,
        onConnect: _onConnect,
        beforeConnect: () async {
          debugPrint('ChatRepository: Connecting to $socketUrl...');
        },
        onWebSocketError: (dynamic error) =>
            debugPrint('ChatRepository: Error on WebSocket connection: $error'),
        stompConnectHeaders: {'Authorization': 'Bearer $token'},
        webSocketConnectHeaders: {'Authorization': 'Bearer $token'},
      ),
    );

    _stompClient?.activate();
  }

  void _onConnect(StompFrame frame) {
    debugPrint('ChatRepository: Connected to WebSocket');
  }

  void disconnect() {
    _stompClient?.deactivate();
    _stompClient = null;
  }

  void subscribeToRoom(int roomId) {
    _stompClient?.subscribe(
      destination: '/topic/chat/$roomId',
      callback: (StompFrame frame) {
        if (frame.body != null) {
          final json = jsonDecode(frame.body!);
          final message = ChatMessageModel.fromJson(json);
          _messageStreamController.add(message);
        }
      },
    );
  }

  void sendMessage(ChatMessageRequest request) {
    _stompClient?.send(
      destination: '/app/chat.sendMessage',
      body: jsonEncode(request.toJson()),
    );
  }

  Future<List<ChatRoomModel>> getMyChatRooms() async {
    final response = await _apiClient.get('/api/v1/chat/rooms/my');
    return (response.data as List)
        .map((e) => ChatRoomModel.fromJson(e))
        .toList();
  }

  Future<List<ChatMessageModel>> getChatMessages(
    int roomId, {
    int page = 0,
    int size = 50,
  }) async {
    final response = await _apiClient.get(
      '/api/v1/chat/rooms/$roomId/messages',
      queryParameters: {'page': page, 'size': size},
    );
    return (response.data as List)
        .map((e) => ChatMessageModel.fromJson(e))
        .toList();
  }

  Future<ChatRoomModel> createChatRoom(int targetUserId) async {
    // Assuming backend takes targetUserId to create 1:1 room
    // Actual DTO needs verification. Using assumed 'targetUserId'.
    final response = await _apiClient.post(
      '/api/v1/chat/rooms',
      data: {'targetUserId': targetUserId, 'roomType': 'ONE_ON_ONE'},
    );
    return ChatRoomModel.fromJson(response.data);
  }
}

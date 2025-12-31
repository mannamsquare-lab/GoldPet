// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_room_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$chatRoomHash() => r'1d23ef7c831f6faa9a20792313880a95c1328922';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

abstract class _$ChatRoom
    extends BuildlessAutoDisposeAsyncNotifier<List<ChatMessageModel>> {
  late final int roomId;

  FutureOr<List<ChatMessageModel>> build(int roomId);
}

/// See also [ChatRoom].
@ProviderFor(ChatRoom)
const chatRoomProvider = ChatRoomFamily();

/// See also [ChatRoom].
class ChatRoomFamily extends Family<AsyncValue<List<ChatMessageModel>>> {
  /// See also [ChatRoom].
  const ChatRoomFamily();

  /// See also [ChatRoom].
  ChatRoomProvider call(int roomId) {
    return ChatRoomProvider(roomId);
  }

  @override
  ChatRoomProvider getProviderOverride(covariant ChatRoomProvider provider) {
    return call(provider.roomId);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'chatRoomProvider';
}

/// See also [ChatRoom].
class ChatRoomProvider
    extends
        AutoDisposeAsyncNotifierProviderImpl<ChatRoom, List<ChatMessageModel>> {
  /// See also [ChatRoom].
  ChatRoomProvider(int roomId)
    : this._internal(
        () => ChatRoom()..roomId = roomId,
        from: chatRoomProvider,
        name: r'chatRoomProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$chatRoomHash,
        dependencies: ChatRoomFamily._dependencies,
        allTransitiveDependencies: ChatRoomFamily._allTransitiveDependencies,
        roomId: roomId,
      );

  ChatRoomProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.roomId,
  }) : super.internal();

  final int roomId;

  @override
  FutureOr<List<ChatMessageModel>> runNotifierBuild(
    covariant ChatRoom notifier,
  ) {
    return notifier.build(roomId);
  }

  @override
  Override overrideWith(ChatRoom Function() create) {
    return ProviderOverride(
      origin: this,
      override: ChatRoomProvider._internal(
        () => create()..roomId = roomId,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        roomId: roomId,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<ChatRoom, List<ChatMessageModel>>
  createElement() {
    return _ChatRoomProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is ChatRoomProvider && other.roomId == roomId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, roomId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin ChatRoomRef
    on AutoDisposeAsyncNotifierProviderRef<List<ChatMessageModel>> {
  /// The parameter `roomId` of this provider.
  int get roomId;
}

class _ChatRoomProviderElement
    extends
        AutoDisposeAsyncNotifierProviderElement<
          ChatRoom,
          List<ChatMessageModel>
        >
    with ChatRoomRef {
  _ChatRoomProviderElement(super.provider);

  @override
  int get roomId => (origin as ChatRoomProvider).roomId;
}

// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

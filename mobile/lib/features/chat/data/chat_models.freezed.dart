// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'chat_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ChatRoomModel _$ChatRoomModelFromJson(Map<String, dynamic> json) {
  return _ChatRoomModel.fromJson(json);
}

/// @nodoc
mixin _$ChatRoomModel {
  int get id => throw _privateConstructorUsedError;
  String get roomType => throw _privateConstructorUsedError;
  String? get title => throw _privateConstructorUsedError;
  int? get ownerUserId => throw _privateConstructorUsedError;
  int? get matchId => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  List<int> get participantUserIds => throw _privateConstructorUsedError;

  /// Serializes this ChatRoomModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChatRoomModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChatRoomModelCopyWith<ChatRoomModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatRoomModelCopyWith<$Res> {
  factory $ChatRoomModelCopyWith(
    ChatRoomModel value,
    $Res Function(ChatRoomModel) then,
  ) = _$ChatRoomModelCopyWithImpl<$Res, ChatRoomModel>;
  @useResult
  $Res call({
    int id,
    String roomType,
    String? title,
    int? ownerUserId,
    int? matchId,
    DateTime createdAt,
    DateTime updatedAt,
    List<int> participantUserIds,
  });
}

/// @nodoc
class _$ChatRoomModelCopyWithImpl<$Res, $Val extends ChatRoomModel>
    implements $ChatRoomModelCopyWith<$Res> {
  _$ChatRoomModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChatRoomModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomType = null,
    Object? title = freezed,
    Object? ownerUserId = freezed,
    Object? matchId = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? participantUserIds = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            roomType: null == roomType
                ? _value.roomType
                : roomType // ignore: cast_nullable_to_non_nullable
                      as String,
            title: freezed == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String?,
            ownerUserId: freezed == ownerUserId
                ? _value.ownerUserId
                : ownerUserId // ignore: cast_nullable_to_non_nullable
                      as int?,
            matchId: freezed == matchId
                ? _value.matchId
                : matchId // ignore: cast_nullable_to_non_nullable
                      as int?,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            participantUserIds: null == participantUserIds
                ? _value.participantUserIds
                : participantUserIds // ignore: cast_nullable_to_non_nullable
                      as List<int>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ChatRoomModelImplCopyWith<$Res>
    implements $ChatRoomModelCopyWith<$Res> {
  factory _$$ChatRoomModelImplCopyWith(
    _$ChatRoomModelImpl value,
    $Res Function(_$ChatRoomModelImpl) then,
  ) = __$$ChatRoomModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String roomType,
    String? title,
    int? ownerUserId,
    int? matchId,
    DateTime createdAt,
    DateTime updatedAt,
    List<int> participantUserIds,
  });
}

/// @nodoc
class __$$ChatRoomModelImplCopyWithImpl<$Res>
    extends _$ChatRoomModelCopyWithImpl<$Res, _$ChatRoomModelImpl>
    implements _$$ChatRoomModelImplCopyWith<$Res> {
  __$$ChatRoomModelImplCopyWithImpl(
    _$ChatRoomModelImpl _value,
    $Res Function(_$ChatRoomModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChatRoomModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomType = null,
    Object? title = freezed,
    Object? ownerUserId = freezed,
    Object? matchId = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? participantUserIds = null,
  }) {
    return _then(
      _$ChatRoomModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        roomType: null == roomType
            ? _value.roomType
            : roomType // ignore: cast_nullable_to_non_nullable
                  as String,
        title: freezed == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String?,
        ownerUserId: freezed == ownerUserId
            ? _value.ownerUserId
            : ownerUserId // ignore: cast_nullable_to_non_nullable
                  as int?,
        matchId: freezed == matchId
            ? _value.matchId
            : matchId // ignore: cast_nullable_to_non_nullable
                  as int?,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        participantUserIds: null == participantUserIds
            ? _value._participantUserIds
            : participantUserIds // ignore: cast_nullable_to_non_nullable
                  as List<int>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatRoomModelImpl implements _ChatRoomModel {
  const _$ChatRoomModelImpl({
    required this.id,
    required this.roomType,
    this.title,
    this.ownerUserId,
    this.matchId,
    required this.createdAt,
    required this.updatedAt,
    final List<int> participantUserIds = const [],
  }) : _participantUserIds = participantUserIds;

  factory _$ChatRoomModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatRoomModelImplFromJson(json);

  @override
  final int id;
  @override
  final String roomType;
  @override
  final String? title;
  @override
  final int? ownerUserId;
  @override
  final int? matchId;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  final List<int> _participantUserIds;
  @override
  @JsonKey()
  List<int> get participantUserIds {
    if (_participantUserIds is EqualUnmodifiableListView)
      return _participantUserIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_participantUserIds);
  }

  @override
  String toString() {
    return 'ChatRoomModel(id: $id, roomType: $roomType, title: $title, ownerUserId: $ownerUserId, matchId: $matchId, createdAt: $createdAt, updatedAt: $updatedAt, participantUserIds: $participantUserIds)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatRoomModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.roomType, roomType) ||
                other.roomType == roomType) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.ownerUserId, ownerUserId) ||
                other.ownerUserId == ownerUserId) &&
            (identical(other.matchId, matchId) || other.matchId == matchId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            const DeepCollectionEquality().equals(
              other._participantUserIds,
              _participantUserIds,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    roomType,
    title,
    ownerUserId,
    matchId,
    createdAt,
    updatedAt,
    const DeepCollectionEquality().hash(_participantUserIds),
  );

  /// Create a copy of ChatRoomModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatRoomModelImplCopyWith<_$ChatRoomModelImpl> get copyWith =>
      __$$ChatRoomModelImplCopyWithImpl<_$ChatRoomModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatRoomModelImplToJson(this);
  }
}

abstract class _ChatRoomModel implements ChatRoomModel {
  const factory _ChatRoomModel({
    required final int id,
    required final String roomType,
    final String? title,
    final int? ownerUserId,
    final int? matchId,
    required final DateTime createdAt,
    required final DateTime updatedAt,
    final List<int> participantUserIds,
  }) = _$ChatRoomModelImpl;

  factory _ChatRoomModel.fromJson(Map<String, dynamic> json) =
      _$ChatRoomModelImpl.fromJson;

  @override
  int get id;
  @override
  String get roomType;
  @override
  String? get title;
  @override
  int? get ownerUserId;
  @override
  int? get matchId;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  List<int> get participantUserIds;

  /// Create a copy of ChatRoomModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChatRoomModelImplCopyWith<_$ChatRoomModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ChatMessageModel _$ChatMessageModelFromJson(Map<String, dynamic> json) {
  return _ChatMessageModel.fromJson(json);
}

/// @nodoc
mixin _$ChatMessageModel {
  int get id => throw _privateConstructorUsedError;
  int get roomId => throw _privateConstructorUsedError;
  int? get senderId => throw _privateConstructorUsedError;
  String? get senderNickname => throw _privateConstructorUsedError;
  String get messageType => throw _privateConstructorUsedError;
  String? get textContent => throw _privateConstructorUsedError;
  int? get fileId => throw _privateConstructorUsedError;
  int? get emoticonId => throw _privateConstructorUsedError;
  String? get emojiCode => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  int get readCount => throw _privateConstructorUsedError;

  /// Serializes this ChatMessageModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChatMessageModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChatMessageModelCopyWith<ChatMessageModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatMessageModelCopyWith<$Res> {
  factory $ChatMessageModelCopyWith(
    ChatMessageModel value,
    $Res Function(ChatMessageModel) then,
  ) = _$ChatMessageModelCopyWithImpl<$Res, ChatMessageModel>;
  @useResult
  $Res call({
    int id,
    int roomId,
    int? senderId,
    String? senderNickname,
    String messageType,
    String? textContent,
    int? fileId,
    int? emoticonId,
    String? emojiCode,
    DateTime createdAt,
    int readCount,
  });
}

/// @nodoc
class _$ChatMessageModelCopyWithImpl<$Res, $Val extends ChatMessageModel>
    implements $ChatMessageModelCopyWith<$Res> {
  _$ChatMessageModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChatMessageModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomId = null,
    Object? senderId = freezed,
    Object? senderNickname = freezed,
    Object? messageType = null,
    Object? textContent = freezed,
    Object? fileId = freezed,
    Object? emoticonId = freezed,
    Object? emojiCode = freezed,
    Object? createdAt = null,
    Object? readCount = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            roomId: null == roomId
                ? _value.roomId
                : roomId // ignore: cast_nullable_to_non_nullable
                      as int,
            senderId: freezed == senderId
                ? _value.senderId
                : senderId // ignore: cast_nullable_to_non_nullable
                      as int?,
            senderNickname: freezed == senderNickname
                ? _value.senderNickname
                : senderNickname // ignore: cast_nullable_to_non_nullable
                      as String?,
            messageType: null == messageType
                ? _value.messageType
                : messageType // ignore: cast_nullable_to_non_nullable
                      as String,
            textContent: freezed == textContent
                ? _value.textContent
                : textContent // ignore: cast_nullable_to_non_nullable
                      as String?,
            fileId: freezed == fileId
                ? _value.fileId
                : fileId // ignore: cast_nullable_to_non_nullable
                      as int?,
            emoticonId: freezed == emoticonId
                ? _value.emoticonId
                : emoticonId // ignore: cast_nullable_to_non_nullable
                      as int?,
            emojiCode: freezed == emojiCode
                ? _value.emojiCode
                : emojiCode // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            readCount: null == readCount
                ? _value.readCount
                : readCount // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ChatMessageModelImplCopyWith<$Res>
    implements $ChatMessageModelCopyWith<$Res> {
  factory _$$ChatMessageModelImplCopyWith(
    _$ChatMessageModelImpl value,
    $Res Function(_$ChatMessageModelImpl) then,
  ) = __$$ChatMessageModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int roomId,
    int? senderId,
    String? senderNickname,
    String messageType,
    String? textContent,
    int? fileId,
    int? emoticonId,
    String? emojiCode,
    DateTime createdAt,
    int readCount,
  });
}

/// @nodoc
class __$$ChatMessageModelImplCopyWithImpl<$Res>
    extends _$ChatMessageModelCopyWithImpl<$Res, _$ChatMessageModelImpl>
    implements _$$ChatMessageModelImplCopyWith<$Res> {
  __$$ChatMessageModelImplCopyWithImpl(
    _$ChatMessageModelImpl _value,
    $Res Function(_$ChatMessageModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChatMessageModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomId = null,
    Object? senderId = freezed,
    Object? senderNickname = freezed,
    Object? messageType = null,
    Object? textContent = freezed,
    Object? fileId = freezed,
    Object? emoticonId = freezed,
    Object? emojiCode = freezed,
    Object? createdAt = null,
    Object? readCount = null,
  }) {
    return _then(
      _$ChatMessageModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        roomId: null == roomId
            ? _value.roomId
            : roomId // ignore: cast_nullable_to_non_nullable
                  as int,
        senderId: freezed == senderId
            ? _value.senderId
            : senderId // ignore: cast_nullable_to_non_nullable
                  as int?,
        senderNickname: freezed == senderNickname
            ? _value.senderNickname
            : senderNickname // ignore: cast_nullable_to_non_nullable
                  as String?,
        messageType: null == messageType
            ? _value.messageType
            : messageType // ignore: cast_nullable_to_non_nullable
                  as String,
        textContent: freezed == textContent
            ? _value.textContent
            : textContent // ignore: cast_nullable_to_non_nullable
                  as String?,
        fileId: freezed == fileId
            ? _value.fileId
            : fileId // ignore: cast_nullable_to_non_nullable
                  as int?,
        emoticonId: freezed == emoticonId
            ? _value.emoticonId
            : emoticonId // ignore: cast_nullable_to_non_nullable
                  as int?,
        emojiCode: freezed == emojiCode
            ? _value.emojiCode
            : emojiCode // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        readCount: null == readCount
            ? _value.readCount
            : readCount // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatMessageModelImpl implements _ChatMessageModel {
  const _$ChatMessageModelImpl({
    required this.id,
    required this.roomId,
    this.senderId,
    this.senderNickname,
    required this.messageType,
    this.textContent,
    this.fileId,
    this.emoticonId,
    this.emojiCode,
    required this.createdAt,
    this.readCount = 0,
  });

  factory _$ChatMessageModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatMessageModelImplFromJson(json);

  @override
  final int id;
  @override
  final int roomId;
  @override
  final int? senderId;
  @override
  final String? senderNickname;
  @override
  final String messageType;
  @override
  final String? textContent;
  @override
  final int? fileId;
  @override
  final int? emoticonId;
  @override
  final String? emojiCode;
  @override
  final DateTime createdAt;
  @override
  @JsonKey()
  final int readCount;

  @override
  String toString() {
    return 'ChatMessageModel(id: $id, roomId: $roomId, senderId: $senderId, senderNickname: $senderNickname, messageType: $messageType, textContent: $textContent, fileId: $fileId, emoticonId: $emoticonId, emojiCode: $emojiCode, createdAt: $createdAt, readCount: $readCount)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatMessageModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.roomId, roomId) || other.roomId == roomId) &&
            (identical(other.senderId, senderId) ||
                other.senderId == senderId) &&
            (identical(other.senderNickname, senderNickname) ||
                other.senderNickname == senderNickname) &&
            (identical(other.messageType, messageType) ||
                other.messageType == messageType) &&
            (identical(other.textContent, textContent) ||
                other.textContent == textContent) &&
            (identical(other.fileId, fileId) || other.fileId == fileId) &&
            (identical(other.emoticonId, emoticonId) ||
                other.emoticonId == emoticonId) &&
            (identical(other.emojiCode, emojiCode) ||
                other.emojiCode == emojiCode) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.readCount, readCount) ||
                other.readCount == readCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    roomId,
    senderId,
    senderNickname,
    messageType,
    textContent,
    fileId,
    emoticonId,
    emojiCode,
    createdAt,
    readCount,
  );

  /// Create a copy of ChatMessageModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatMessageModelImplCopyWith<_$ChatMessageModelImpl> get copyWith =>
      __$$ChatMessageModelImplCopyWithImpl<_$ChatMessageModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatMessageModelImplToJson(this);
  }
}

abstract class _ChatMessageModel implements ChatMessageModel {
  const factory _ChatMessageModel({
    required final int id,
    required final int roomId,
    final int? senderId,
    final String? senderNickname,
    required final String messageType,
    final String? textContent,
    final int? fileId,
    final int? emoticonId,
    final String? emojiCode,
    required final DateTime createdAt,
    final int readCount,
  }) = _$ChatMessageModelImpl;

  factory _ChatMessageModel.fromJson(Map<String, dynamic> json) =
      _$ChatMessageModelImpl.fromJson;

  @override
  int get id;
  @override
  int get roomId;
  @override
  int? get senderId;
  @override
  String? get senderNickname;
  @override
  String get messageType;
  @override
  String? get textContent;
  @override
  int? get fileId;
  @override
  int? get emoticonId;
  @override
  String? get emojiCode;
  @override
  DateTime get createdAt;
  @override
  int get readCount;

  /// Create a copy of ChatMessageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChatMessageModelImplCopyWith<_$ChatMessageModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ChatMessageRequest _$ChatMessageRequestFromJson(Map<String, dynamic> json) {
  return _ChatMessageRequest.fromJson(json);
}

/// @nodoc
mixin _$ChatMessageRequest {
  int get roomId => throw _privateConstructorUsedError;
  int get senderId => throw _privateConstructorUsedError;
  String get messageType => throw _privateConstructorUsedError;
  String? get textContent => throw _privateConstructorUsedError;
  int? get fileId => throw _privateConstructorUsedError;
  int? get emoticonId => throw _privateConstructorUsedError;
  String? get emojiCode => throw _privateConstructorUsedError;

  /// Serializes this ChatMessageRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChatMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChatMessageRequestCopyWith<ChatMessageRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatMessageRequestCopyWith<$Res> {
  factory $ChatMessageRequestCopyWith(
    ChatMessageRequest value,
    $Res Function(ChatMessageRequest) then,
  ) = _$ChatMessageRequestCopyWithImpl<$Res, ChatMessageRequest>;
  @useResult
  $Res call({
    int roomId,
    int senderId,
    String messageType,
    String? textContent,
    int? fileId,
    int? emoticonId,
    String? emojiCode,
  });
}

/// @nodoc
class _$ChatMessageRequestCopyWithImpl<$Res, $Val extends ChatMessageRequest>
    implements $ChatMessageRequestCopyWith<$Res> {
  _$ChatMessageRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChatMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? roomId = null,
    Object? senderId = null,
    Object? messageType = null,
    Object? textContent = freezed,
    Object? fileId = freezed,
    Object? emoticonId = freezed,
    Object? emojiCode = freezed,
  }) {
    return _then(
      _value.copyWith(
            roomId: null == roomId
                ? _value.roomId
                : roomId // ignore: cast_nullable_to_non_nullable
                      as int,
            senderId: null == senderId
                ? _value.senderId
                : senderId // ignore: cast_nullable_to_non_nullable
                      as int,
            messageType: null == messageType
                ? _value.messageType
                : messageType // ignore: cast_nullable_to_non_nullable
                      as String,
            textContent: freezed == textContent
                ? _value.textContent
                : textContent // ignore: cast_nullable_to_non_nullable
                      as String?,
            fileId: freezed == fileId
                ? _value.fileId
                : fileId // ignore: cast_nullable_to_non_nullable
                      as int?,
            emoticonId: freezed == emoticonId
                ? _value.emoticonId
                : emoticonId // ignore: cast_nullable_to_non_nullable
                      as int?,
            emojiCode: freezed == emojiCode
                ? _value.emojiCode
                : emojiCode // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ChatMessageRequestImplCopyWith<$Res>
    implements $ChatMessageRequestCopyWith<$Res> {
  factory _$$ChatMessageRequestImplCopyWith(
    _$ChatMessageRequestImpl value,
    $Res Function(_$ChatMessageRequestImpl) then,
  ) = __$$ChatMessageRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int roomId,
    int senderId,
    String messageType,
    String? textContent,
    int? fileId,
    int? emoticonId,
    String? emojiCode,
  });
}

/// @nodoc
class __$$ChatMessageRequestImplCopyWithImpl<$Res>
    extends _$ChatMessageRequestCopyWithImpl<$Res, _$ChatMessageRequestImpl>
    implements _$$ChatMessageRequestImplCopyWith<$Res> {
  __$$ChatMessageRequestImplCopyWithImpl(
    _$ChatMessageRequestImpl _value,
    $Res Function(_$ChatMessageRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChatMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? roomId = null,
    Object? senderId = null,
    Object? messageType = null,
    Object? textContent = freezed,
    Object? fileId = freezed,
    Object? emoticonId = freezed,
    Object? emojiCode = freezed,
  }) {
    return _then(
      _$ChatMessageRequestImpl(
        roomId: null == roomId
            ? _value.roomId
            : roomId // ignore: cast_nullable_to_non_nullable
                  as int,
        senderId: null == senderId
            ? _value.senderId
            : senderId // ignore: cast_nullable_to_non_nullable
                  as int,
        messageType: null == messageType
            ? _value.messageType
            : messageType // ignore: cast_nullable_to_non_nullable
                  as String,
        textContent: freezed == textContent
            ? _value.textContent
            : textContent // ignore: cast_nullable_to_non_nullable
                  as String?,
        fileId: freezed == fileId
            ? _value.fileId
            : fileId // ignore: cast_nullable_to_non_nullable
                  as int?,
        emoticonId: freezed == emoticonId
            ? _value.emoticonId
            : emoticonId // ignore: cast_nullable_to_non_nullable
                  as int?,
        emojiCode: freezed == emojiCode
            ? _value.emojiCode
            : emojiCode // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatMessageRequestImpl implements _ChatMessageRequest {
  const _$ChatMessageRequestImpl({
    required this.roomId,
    required this.senderId,
    required this.messageType,
    this.textContent,
    this.fileId,
    this.emoticonId,
    this.emojiCode,
  });

  factory _$ChatMessageRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatMessageRequestImplFromJson(json);

  @override
  final int roomId;
  @override
  final int senderId;
  @override
  final String messageType;
  @override
  final String? textContent;
  @override
  final int? fileId;
  @override
  final int? emoticonId;
  @override
  final String? emojiCode;

  @override
  String toString() {
    return 'ChatMessageRequest(roomId: $roomId, senderId: $senderId, messageType: $messageType, textContent: $textContent, fileId: $fileId, emoticonId: $emoticonId, emojiCode: $emojiCode)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatMessageRequestImpl &&
            (identical(other.roomId, roomId) || other.roomId == roomId) &&
            (identical(other.senderId, senderId) ||
                other.senderId == senderId) &&
            (identical(other.messageType, messageType) ||
                other.messageType == messageType) &&
            (identical(other.textContent, textContent) ||
                other.textContent == textContent) &&
            (identical(other.fileId, fileId) || other.fileId == fileId) &&
            (identical(other.emoticonId, emoticonId) ||
                other.emoticonId == emoticonId) &&
            (identical(other.emojiCode, emojiCode) ||
                other.emojiCode == emojiCode));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    roomId,
    senderId,
    messageType,
    textContent,
    fileId,
    emoticonId,
    emojiCode,
  );

  /// Create a copy of ChatMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatMessageRequestImplCopyWith<_$ChatMessageRequestImpl> get copyWith =>
      __$$ChatMessageRequestImplCopyWithImpl<_$ChatMessageRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatMessageRequestImplToJson(this);
  }
}

abstract class _ChatMessageRequest implements ChatMessageRequest {
  const factory _ChatMessageRequest({
    required final int roomId,
    required final int senderId,
    required final String messageType,
    final String? textContent,
    final int? fileId,
    final int? emoticonId,
    final String? emojiCode,
  }) = _$ChatMessageRequestImpl;

  factory _ChatMessageRequest.fromJson(Map<String, dynamic> json) =
      _$ChatMessageRequestImpl.fromJson;

  @override
  int get roomId;
  @override
  int get senderId;
  @override
  String get messageType;
  @override
  String? get textContent;
  @override
  int? get fileId;
  @override
  int? get emoticonId;
  @override
  String? get emojiCode;

  /// Create a copy of ChatMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChatMessageRequestImplCopyWith<_$ChatMessageRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

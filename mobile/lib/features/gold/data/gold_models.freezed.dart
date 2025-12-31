// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'gold_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

GoldBalanceModel _$GoldBalanceModelFromJson(Map<String, dynamic> json) {
  return _GoldBalanceModel.fromJson(json);
}

/// @nodoc
mixin _$GoldBalanceModel {
  int get balance => throw _privateConstructorUsedError;
  int get totalCharged => throw _privateConstructorUsedError;
  int get totalSpent => throw _privateConstructorUsedError;

  /// Serializes this GoldBalanceModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of GoldBalanceModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $GoldBalanceModelCopyWith<GoldBalanceModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $GoldBalanceModelCopyWith<$Res> {
  factory $GoldBalanceModelCopyWith(
    GoldBalanceModel value,
    $Res Function(GoldBalanceModel) then,
  ) = _$GoldBalanceModelCopyWithImpl<$Res, GoldBalanceModel>;
  @useResult
  $Res call({int balance, int totalCharged, int totalSpent});
}

/// @nodoc
class _$GoldBalanceModelCopyWithImpl<$Res, $Val extends GoldBalanceModel>
    implements $GoldBalanceModelCopyWith<$Res> {
  _$GoldBalanceModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of GoldBalanceModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? balance = null,
    Object? totalCharged = null,
    Object? totalSpent = null,
  }) {
    return _then(
      _value.copyWith(
            balance: null == balance
                ? _value.balance
                : balance // ignore: cast_nullable_to_non_nullable
                      as int,
            totalCharged: null == totalCharged
                ? _value.totalCharged
                : totalCharged // ignore: cast_nullable_to_non_nullable
                      as int,
            totalSpent: null == totalSpent
                ? _value.totalSpent
                : totalSpent // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$GoldBalanceModelImplCopyWith<$Res>
    implements $GoldBalanceModelCopyWith<$Res> {
  factory _$$GoldBalanceModelImplCopyWith(
    _$GoldBalanceModelImpl value,
    $Res Function(_$GoldBalanceModelImpl) then,
  ) = __$$GoldBalanceModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int balance, int totalCharged, int totalSpent});
}

/// @nodoc
class __$$GoldBalanceModelImplCopyWithImpl<$Res>
    extends _$GoldBalanceModelCopyWithImpl<$Res, _$GoldBalanceModelImpl>
    implements _$$GoldBalanceModelImplCopyWith<$Res> {
  __$$GoldBalanceModelImplCopyWithImpl(
    _$GoldBalanceModelImpl _value,
    $Res Function(_$GoldBalanceModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of GoldBalanceModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? balance = null,
    Object? totalCharged = null,
    Object? totalSpent = null,
  }) {
    return _then(
      _$GoldBalanceModelImpl(
        balance: null == balance
            ? _value.balance
            : balance // ignore: cast_nullable_to_non_nullable
                  as int,
        totalCharged: null == totalCharged
            ? _value.totalCharged
            : totalCharged // ignore: cast_nullable_to_non_nullable
                  as int,
        totalSpent: null == totalSpent
            ? _value.totalSpent
            : totalSpent // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$GoldBalanceModelImpl implements _GoldBalanceModel {
  const _$GoldBalanceModelImpl({
    required this.balance,
    required this.totalCharged,
    required this.totalSpent,
  });

  factory _$GoldBalanceModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$GoldBalanceModelImplFromJson(json);

  @override
  final int balance;
  @override
  final int totalCharged;
  @override
  final int totalSpent;

  @override
  String toString() {
    return 'GoldBalanceModel(balance: $balance, totalCharged: $totalCharged, totalSpent: $totalSpent)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GoldBalanceModelImpl &&
            (identical(other.balance, balance) || other.balance == balance) &&
            (identical(other.totalCharged, totalCharged) ||
                other.totalCharged == totalCharged) &&
            (identical(other.totalSpent, totalSpent) ||
                other.totalSpent == totalSpent));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, balance, totalCharged, totalSpent);

  /// Create a copy of GoldBalanceModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GoldBalanceModelImplCopyWith<_$GoldBalanceModelImpl> get copyWith =>
      __$$GoldBalanceModelImplCopyWithImpl<_$GoldBalanceModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$GoldBalanceModelImplToJson(this);
  }
}

abstract class _GoldBalanceModel implements GoldBalanceModel {
  const factory _GoldBalanceModel({
    required final int balance,
    required final int totalCharged,
    required final int totalSpent,
  }) = _$GoldBalanceModelImpl;

  factory _GoldBalanceModel.fromJson(Map<String, dynamic> json) =
      _$GoldBalanceModelImpl.fromJson;

  @override
  int get balance;
  @override
  int get totalCharged;
  @override
  int get totalSpent;

  /// Create a copy of GoldBalanceModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GoldBalanceModelImplCopyWith<_$GoldBalanceModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

GoldProductModel _$GoldProductModelFromJson(Map<String, dynamic> json) {
  return _GoldProductModel.fromJson(json);
}

/// @nodoc
mixin _$GoldProductModel {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  int get goldAmount => throw _privateConstructorUsedError;
  int get price => throw _privateConstructorUsedError;
  int get bonus => throw _privateConstructorUsedError;

  /// Serializes this GoldProductModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of GoldProductModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $GoldProductModelCopyWith<GoldProductModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $GoldProductModelCopyWith<$Res> {
  factory $GoldProductModelCopyWith(
    GoldProductModel value,
    $Res Function(GoldProductModel) then,
  ) = _$GoldProductModelCopyWithImpl<$Res, GoldProductModel>;
  @useResult
  $Res call({String id, String name, int goldAmount, int price, int bonus});
}

/// @nodoc
class _$GoldProductModelCopyWithImpl<$Res, $Val extends GoldProductModel>
    implements $GoldProductModelCopyWith<$Res> {
  _$GoldProductModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of GoldProductModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? goldAmount = null,
    Object? price = null,
    Object? bonus = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            goldAmount: null == goldAmount
                ? _value.goldAmount
                : goldAmount // ignore: cast_nullable_to_non_nullable
                      as int,
            price: null == price
                ? _value.price
                : price // ignore: cast_nullable_to_non_nullable
                      as int,
            bonus: null == bonus
                ? _value.bonus
                : bonus // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$GoldProductModelImplCopyWith<$Res>
    implements $GoldProductModelCopyWith<$Res> {
  factory _$$GoldProductModelImplCopyWith(
    _$GoldProductModelImpl value,
    $Res Function(_$GoldProductModelImpl) then,
  ) = __$$GoldProductModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String id, String name, int goldAmount, int price, int bonus});
}

/// @nodoc
class __$$GoldProductModelImplCopyWithImpl<$Res>
    extends _$GoldProductModelCopyWithImpl<$Res, _$GoldProductModelImpl>
    implements _$$GoldProductModelImplCopyWith<$Res> {
  __$$GoldProductModelImplCopyWithImpl(
    _$GoldProductModelImpl _value,
    $Res Function(_$GoldProductModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of GoldProductModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? goldAmount = null,
    Object? price = null,
    Object? bonus = null,
  }) {
    return _then(
      _$GoldProductModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        goldAmount: null == goldAmount
            ? _value.goldAmount
            : goldAmount // ignore: cast_nullable_to_non_nullable
                  as int,
        price: null == price
            ? _value.price
            : price // ignore: cast_nullable_to_non_nullable
                  as int,
        bonus: null == bonus
            ? _value.bonus
            : bonus // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$GoldProductModelImpl implements _GoldProductModel {
  const _$GoldProductModelImpl({
    required this.id,
    required this.name,
    required this.goldAmount,
    required this.price,
    this.bonus = 0,
  });

  factory _$GoldProductModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$GoldProductModelImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final int goldAmount;
  @override
  final int price;
  @override
  @JsonKey()
  final int bonus;

  @override
  String toString() {
    return 'GoldProductModel(id: $id, name: $name, goldAmount: $goldAmount, price: $price, bonus: $bonus)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GoldProductModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.goldAmount, goldAmount) ||
                other.goldAmount == goldAmount) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.bonus, bonus) || other.bonus == bonus));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, name, goldAmount, price, bonus);

  /// Create a copy of GoldProductModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GoldProductModelImplCopyWith<_$GoldProductModelImpl> get copyWith =>
      __$$GoldProductModelImplCopyWithImpl<_$GoldProductModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$GoldProductModelImplToJson(this);
  }
}

abstract class _GoldProductModel implements GoldProductModel {
  const factory _GoldProductModel({
    required final String id,
    required final String name,
    required final int goldAmount,
    required final int price,
    final int bonus,
  }) = _$GoldProductModelImpl;

  factory _GoldProductModel.fromJson(Map<String, dynamic> json) =
      _$GoldProductModelImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  int get goldAmount;
  @override
  int get price;
  @override
  int get bonus;

  /// Create a copy of GoldProductModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GoldProductModelImplCopyWith<_$GoldProductModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

GoldTransactionModel _$GoldTransactionModelFromJson(Map<String, dynamic> json) {
  return _GoldTransactionModel.fromJson(json);
}

/// @nodoc
mixin _$GoldTransactionModel {
  int get id => throw _privateConstructorUsedError;
  TransactionType get type => throw _privateConstructorUsedError;
  int get amount => throw _privateConstructorUsedError;
  int get balanceAfter => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  TransactionStatus get status => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this GoldTransactionModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of GoldTransactionModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $GoldTransactionModelCopyWith<GoldTransactionModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $GoldTransactionModelCopyWith<$Res> {
  factory $GoldTransactionModelCopyWith(
    GoldTransactionModel value,
    $Res Function(GoldTransactionModel) then,
  ) = _$GoldTransactionModelCopyWithImpl<$Res, GoldTransactionModel>;
  @useResult
  $Res call({
    int id,
    TransactionType type,
    int amount,
    int balanceAfter,
    String? description,
    TransactionStatus status,
    DateTime? createdAt,
  });
}

/// @nodoc
class _$GoldTransactionModelCopyWithImpl<
  $Res,
  $Val extends GoldTransactionModel
>
    implements $GoldTransactionModelCopyWith<$Res> {
  _$GoldTransactionModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of GoldTransactionModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? amount = null,
    Object? balanceAfter = null,
    Object? description = freezed,
    Object? status = null,
    Object? createdAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as TransactionType,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as int,
            balanceAfter: null == balanceAfter
                ? _value.balanceAfter
                : balanceAfter // ignore: cast_nullable_to_non_nullable
                      as int,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as TransactionStatus,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$GoldTransactionModelImplCopyWith<$Res>
    implements $GoldTransactionModelCopyWith<$Res> {
  factory _$$GoldTransactionModelImplCopyWith(
    _$GoldTransactionModelImpl value,
    $Res Function(_$GoldTransactionModelImpl) then,
  ) = __$$GoldTransactionModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    TransactionType type,
    int amount,
    int balanceAfter,
    String? description,
    TransactionStatus status,
    DateTime? createdAt,
  });
}

/// @nodoc
class __$$GoldTransactionModelImplCopyWithImpl<$Res>
    extends _$GoldTransactionModelCopyWithImpl<$Res, _$GoldTransactionModelImpl>
    implements _$$GoldTransactionModelImplCopyWith<$Res> {
  __$$GoldTransactionModelImplCopyWithImpl(
    _$GoldTransactionModelImpl _value,
    $Res Function(_$GoldTransactionModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of GoldTransactionModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? amount = null,
    Object? balanceAfter = null,
    Object? description = freezed,
    Object? status = null,
    Object? createdAt = freezed,
  }) {
    return _then(
      _$GoldTransactionModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as TransactionType,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as int,
        balanceAfter: null == balanceAfter
            ? _value.balanceAfter
            : balanceAfter // ignore: cast_nullable_to_non_nullable
                  as int,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as TransactionStatus,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$GoldTransactionModelImpl implements _GoldTransactionModel {
  const _$GoldTransactionModelImpl({
    required this.id,
    required this.type,
    required this.amount,
    required this.balanceAfter,
    this.description,
    required this.status,
    required this.createdAt,
  });

  factory _$GoldTransactionModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$GoldTransactionModelImplFromJson(json);

  @override
  final int id;
  @override
  final TransactionType type;
  @override
  final int amount;
  @override
  final int balanceAfter;
  @override
  final String? description;
  @override
  final TransactionStatus status;
  @override
  final DateTime? createdAt;

  @override
  String toString() {
    return 'GoldTransactionModel(id: $id, type: $type, amount: $amount, balanceAfter: $balanceAfter, description: $description, status: $status, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GoldTransactionModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.balanceAfter, balanceAfter) ||
                other.balanceAfter == balanceAfter) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    type,
    amount,
    balanceAfter,
    description,
    status,
    createdAt,
  );

  /// Create a copy of GoldTransactionModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GoldTransactionModelImplCopyWith<_$GoldTransactionModelImpl>
  get copyWith =>
      __$$GoldTransactionModelImplCopyWithImpl<_$GoldTransactionModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$GoldTransactionModelImplToJson(this);
  }
}

abstract class _GoldTransactionModel implements GoldTransactionModel {
  const factory _GoldTransactionModel({
    required final int id,
    required final TransactionType type,
    required final int amount,
    required final int balanceAfter,
    final String? description,
    required final TransactionStatus status,
    required final DateTime? createdAt,
  }) = _$GoldTransactionModelImpl;

  factory _GoldTransactionModel.fromJson(Map<String, dynamic> json) =
      _$GoldTransactionModelImpl.fromJson;

  @override
  int get id;
  @override
  TransactionType get type;
  @override
  int get amount;
  @override
  int get balanceAfter;
  @override
  String? get description;
  @override
  TransactionStatus get status;
  @override
  DateTime? get createdAt;

  /// Create a copy of GoldTransactionModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GoldTransactionModelImplCopyWith<_$GoldTransactionModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}

ChargeRequest _$ChargeRequestFromJson(Map<String, dynamic> json) {
  return _ChargeRequest.fromJson(json);
}

/// @nodoc
mixin _$ChargeRequest {
  int get amount => throw _privateConstructorUsedError;
  String get paymentMethod => throw _privateConstructorUsedError;
  String? get externalTransactionId => throw _privateConstructorUsedError;

  /// Serializes this ChargeRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChargeRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChargeRequestCopyWith<ChargeRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChargeRequestCopyWith<$Res> {
  factory $ChargeRequestCopyWith(
    ChargeRequest value,
    $Res Function(ChargeRequest) then,
  ) = _$ChargeRequestCopyWithImpl<$Res, ChargeRequest>;
  @useResult
  $Res call({int amount, String paymentMethod, String? externalTransactionId});
}

/// @nodoc
class _$ChargeRequestCopyWithImpl<$Res, $Val extends ChargeRequest>
    implements $ChargeRequestCopyWith<$Res> {
  _$ChargeRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChargeRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? amount = null,
    Object? paymentMethod = null,
    Object? externalTransactionId = freezed,
  }) {
    return _then(
      _value.copyWith(
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as int,
            paymentMethod: null == paymentMethod
                ? _value.paymentMethod
                : paymentMethod // ignore: cast_nullable_to_non_nullable
                      as String,
            externalTransactionId: freezed == externalTransactionId
                ? _value.externalTransactionId
                : externalTransactionId // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ChargeRequestImplCopyWith<$Res>
    implements $ChargeRequestCopyWith<$Res> {
  factory _$$ChargeRequestImplCopyWith(
    _$ChargeRequestImpl value,
    $Res Function(_$ChargeRequestImpl) then,
  ) = __$$ChargeRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int amount, String paymentMethod, String? externalTransactionId});
}

/// @nodoc
class __$$ChargeRequestImplCopyWithImpl<$Res>
    extends _$ChargeRequestCopyWithImpl<$Res, _$ChargeRequestImpl>
    implements _$$ChargeRequestImplCopyWith<$Res> {
  __$$ChargeRequestImplCopyWithImpl(
    _$ChargeRequestImpl _value,
    $Res Function(_$ChargeRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChargeRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? amount = null,
    Object? paymentMethod = null,
    Object? externalTransactionId = freezed,
  }) {
    return _then(
      _$ChargeRequestImpl(
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as int,
        paymentMethod: null == paymentMethod
            ? _value.paymentMethod
            : paymentMethod // ignore: cast_nullable_to_non_nullable
                  as String,
        externalTransactionId: freezed == externalTransactionId
            ? _value.externalTransactionId
            : externalTransactionId // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChargeRequestImpl implements _ChargeRequest {
  const _$ChargeRequestImpl({
    required this.amount,
    required this.paymentMethod,
    this.externalTransactionId,
  });

  factory _$ChargeRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChargeRequestImplFromJson(json);

  @override
  final int amount;
  @override
  final String paymentMethod;
  @override
  final String? externalTransactionId;

  @override
  String toString() {
    return 'ChargeRequest(amount: $amount, paymentMethod: $paymentMethod, externalTransactionId: $externalTransactionId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChargeRequestImpl &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.paymentMethod, paymentMethod) ||
                other.paymentMethod == paymentMethod) &&
            (identical(other.externalTransactionId, externalTransactionId) ||
                other.externalTransactionId == externalTransactionId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, amount, paymentMethod, externalTransactionId);

  /// Create a copy of ChargeRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChargeRequestImplCopyWith<_$ChargeRequestImpl> get copyWith =>
      __$$ChargeRequestImplCopyWithImpl<_$ChargeRequestImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ChargeRequestImplToJson(this);
  }
}

abstract class _ChargeRequest implements ChargeRequest {
  const factory _ChargeRequest({
    required final int amount,
    required final String paymentMethod,
    final String? externalTransactionId,
  }) = _$ChargeRequestImpl;

  factory _ChargeRequest.fromJson(Map<String, dynamic> json) =
      _$ChargeRequestImpl.fromJson;

  @override
  int get amount;
  @override
  String get paymentMethod;
  @override
  String? get externalTransactionId;

  /// Create a copy of ChargeRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChargeRequestImplCopyWith<_$ChargeRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

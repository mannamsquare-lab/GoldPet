// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'gold_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$GoldBalanceModelImpl _$$GoldBalanceModelImplFromJson(
  Map<String, dynamic> json,
) => _$GoldBalanceModelImpl(
  balance: (json['balance'] as num).toInt(),
  totalCharged: (json['totalCharged'] as num).toInt(),
  totalSpent: (json['totalSpent'] as num).toInt(),
);

Map<String, dynamic> _$$GoldBalanceModelImplToJson(
  _$GoldBalanceModelImpl instance,
) => <String, dynamic>{
  'balance': instance.balance,
  'totalCharged': instance.totalCharged,
  'totalSpent': instance.totalSpent,
};

_$GoldProductModelImpl _$$GoldProductModelImplFromJson(
  Map<String, dynamic> json,
) => _$GoldProductModelImpl(
  id: json['id'] as String,
  name: json['name'] as String,
  goldAmount: (json['goldAmount'] as num).toInt(),
  price: (json['price'] as num).toInt(),
  bonus: (json['bonus'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$$GoldProductModelImplToJson(
  _$GoldProductModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'goldAmount': instance.goldAmount,
  'price': instance.price,
  'bonus': instance.bonus,
};

_$GoldTransactionModelImpl _$$GoldTransactionModelImplFromJson(
  Map<String, dynamic> json,
) => _$GoldTransactionModelImpl(
  id: (json['id'] as num).toInt(),
  type: $enumDecode(_$TransactionTypeEnumMap, json['type']),
  amount: (json['amount'] as num).toInt(),
  balanceAfter: (json['balanceAfter'] as num).toInt(),
  description: json['description'] as String?,
  status: $enumDecode(_$TransactionStatusEnumMap, json['status']),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$$GoldTransactionModelImplToJson(
  _$GoldTransactionModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'type': _$TransactionTypeEnumMap[instance.type]!,
  'amount': instance.amount,
  'balanceAfter': instance.balanceAfter,
  'description': instance.description,
  'status': _$TransactionStatusEnumMap[instance.status]!,
  'createdAt': instance.createdAt?.toIso8601String(),
};

const _$TransactionTypeEnumMap = {
  TransactionType.CHARGE: 'CHARGE',
  TransactionType.SPEND: 'SPEND',
  TransactionType.REWARD: 'REWARD',
  TransactionType.REFUND: 'REFUND',
};

const _$TransactionStatusEnumMap = {
  TransactionStatus.PENDING: 'PENDING',
  TransactionStatus.COMPLETED: 'COMPLETED',
  TransactionStatus.FAILED: 'FAILED',
  TransactionStatus.CANCELLED: 'CANCELLED',
};

_$ChargeRequestImpl _$$ChargeRequestImplFromJson(Map<String, dynamic> json) =>
    _$ChargeRequestImpl(
      amount: (json['amount'] as num).toInt(),
      paymentMethod: json['paymentMethod'] as String,
      externalTransactionId: json['externalTransactionId'] as String?,
    );

Map<String, dynamic> _$$ChargeRequestImplToJson(_$ChargeRequestImpl instance) =>
    <String, dynamic>{
      'amount': instance.amount,
      'paymentMethod': instance.paymentMethod,
      'externalTransactionId': instance.externalTransactionId,
    };

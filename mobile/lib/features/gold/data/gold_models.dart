import 'package:freezed_annotation/freezed_annotation.dart';

part 'gold_models.freezed.dart';
part 'gold_models.g.dart';

@freezed
sealed class GoldBalanceModel with _$GoldBalanceModel {
  const factory GoldBalanceModel({
    required int balance,
    required int totalCharged,
    required int totalSpent,
  }) = _GoldBalanceModel;

  factory GoldBalanceModel.fromJson(Map<String, dynamic> json) =>
      _$GoldBalanceModelFromJson(json);
}

@freezed
sealed class GoldProductModel with _$GoldProductModel {
  const factory GoldProductModel({
    required String id,
    required String name,
    required int goldAmount,
    required int price,
    @Default(0) int bonus,
  }) = _GoldProductModel;

  factory GoldProductModel.fromJson(Map<String, dynamic> json) =>
      _$GoldProductModelFromJson(json);
}

enum TransactionType { CHARGE, SPEND, REWARD, REFUND }

enum TransactionStatus { PENDING, COMPLETED, FAILED, CANCELLED }

@freezed
sealed class GoldTransactionModel with _$GoldTransactionModel {
  const factory GoldTransactionModel({
    required int id,
    required TransactionType type,
    required int amount,
    required int balanceAfter,
    String? description,
    required TransactionStatus status,
    required DateTime? createdAt,
  }) = _GoldTransactionModel;

  factory GoldTransactionModel.fromJson(Map<String, dynamic> json) =>
      _$GoldTransactionModelFromJson(json);
}

@freezed
sealed class ChargeRequest with _$ChargeRequest {
  const factory ChargeRequest({
    required int amount,
    required String paymentMethod,
    String? externalTransactionId,
  }) = _ChargeRequest;

  factory ChargeRequest.fromJson(Map<String, dynamic> json) =>
      _$ChargeRequestFromJson(json);

  // Freezed generates toJson automatically if we use json_serializable on the mixin
  // but simpler to just define the factory and run build.
}

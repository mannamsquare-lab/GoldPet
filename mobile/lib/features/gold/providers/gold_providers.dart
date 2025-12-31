import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/gold_models.dart';
import '../data/gold_repository.dart';

part 'gold_providers.g.dart';

@riverpod
Future<GoldBalanceModel> goldBalance(Ref ref) async {
  return ref.watch(goldRepositoryProvider).getBalance();
}

@riverpod
Future<List<GoldProductModel>> goldProducts(Ref ref) async {
  return ref.watch(goldRepositoryProvider).getProducts();
}

@riverpod
class GoldTransactions extends _$GoldTransactions {
  @override
  Future<List<GoldTransactionModel>> build() async {
    return ref.watch(goldRepositoryProvider).getTransactions(page: 0, size: 20);
  }

  Future<void> loadMore({required int page}) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return ref
          .read(goldRepositoryProvider)
          .getTransactions(page: page, size: 20);
    });
  }
}

@riverpod
class GoldController extends _$GoldController {
  @override
  FutureOr<void> build() {
    // no-op initial
  }

  Future<void> chargeGold({
    required int amount,
    required String paymentMethod,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref
          .read(goldRepositoryProvider)
          .chargeGold(
            ChargeRequest(amount: amount, paymentMethod: paymentMethod),
          );
      ref.invalidate(goldBalanceProvider);
      ref.invalidate(goldTransactionsProvider);
    });
  }
}

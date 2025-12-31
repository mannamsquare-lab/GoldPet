import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import 'gold_models.dart';

final goldRepositoryProvider = Provider<GoldRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return GoldRepository(apiClient);
});

class GoldRepository {
  final ApiClient _apiClient;

  GoldRepository(this._apiClient);

  Future<GoldBalanceModel> getBalance() async {
    final response = await _apiClient.get('/api/v1/gold/balance');
    return GoldBalanceModel.fromJson(response.data);
  }

  Future<List<GoldProductModel>> getProducts() async {
    final response = await _apiClient.get('/api/v1/gold/products');
    return (response.data as List)
        .map((e) => GoldProductModel.fromJson(e))
        .toList();
  }

  Future<List<GoldTransactionModel>> getTransactions({
    int page = 0,
    int size = 20,
  }) async {
    final response = await _apiClient.get(
      '/api/v1/gold/transactions',
      queryParameters: {'page': page, 'size': size},
    );
    // Assuming Page response, extract content
    // If backend returns Page<T>, it's usually { content: [], number: 0, ... }
    final content = response.data['content'] as List;
    return content.map((e) => GoldTransactionModel.fromJson(e)).toList();
  }

  Future<GoldTransactionModel> chargeGold(ChargeRequest request) async {
    final response = await _apiClient.post(
      '/api/v1/gold/charge',
      data: request.toJson(),
    );
    return GoldTransactionModel.fromJson(response.data);
  }
}

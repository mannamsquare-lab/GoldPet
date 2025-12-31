import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../data/gold_models.dart';
import '../providers/gold_providers.dart';

class GoldScreen extends ConsumerWidget {
  const GoldScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('골드 스토어'),
          bottom: const TabBar(
            tabs: [
              Tab(text: '충전'),
              Tab(text: '이용내역'),
            ],
          ),
        ),
        body: const TabBarView(children: [_ChargeTab(), _HistoryTab()]),
      ),
    );
  }
}

class _ChargeTab extends ConsumerWidget {
  const _ChargeTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final balanceAsync = ref.watch(goldBalanceProvider);
    final productsAsync = ref.watch(goldProductsProvider);
    final controllerState = ref.watch(goldControllerProvider);

    // Listen for errors
    ref.listen(goldControllerProvider, (prev, next) {
      if (next.hasError) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: ${next.error}')));
      }
      if (next.isLoading) {
        // Optional: show loading overlay
      }
    });

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Balance Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFFD700), Color(0xFFFFA000)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.orange.withOpacity(0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              children: [
                const Text(
                  '보유 골드',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                balanceAsync.when(
                  data: (data) => Text(
                    '${NumberFormat('#,###').format(data.balance)} G',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  loading: () =>
                      const CircularProgressIndicator(color: Colors.white),
                  error: (_, __) => const Text(
                    'Error',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            '골드 충전',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          productsAsync.when(
            data: (products) => GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.8,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return _ProductCard(
                  product: product,
                  isLoading: controllerState.isLoading,
                  onTap: () async {
                    if (controllerState.isLoading) return;

                    // Simple Mock Payment Flow
                    final confirmed = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: Text('${product.name} 구매'),
                        content: Text(
                          '${NumberFormat('#,###').format(product.price)}원을 결제하시겠습니까? (테스트)',
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, false),
                            child: const Text('취소'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            child: const Text('결제'),
                          ),
                        ],
                      ),
                    );

                    if (confirmed == true) {
                      ref
                          .read(goldControllerProvider.notifier)
                          .chargeGold(
                            amount: product.goldAmount,
                            paymentMethod: 'TEST_CARD',
                          );
                    }
                  },
                );
              },
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text('Error: $err')),
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final GoldProductModel product;
  final VoidCallback onTap;
  final bool isLoading;

  const _ProductCard({
    required this.product,
    required this.onTap,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.monetization_on, size: 40, color: Colors.amber),
              const SizedBox(height: 12),
              Text(
                product.name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              if (product.bonus > 0)
                Text(
                  '+ ${product.bonus} G 보너스',
                  style: const TextStyle(
                    color: Colors.green,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: onTap,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                  ),
                  child: isLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text('￦${NumberFormat('#,###').format(product.price)}'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HistoryTab extends ConsumerWidget {
  const _HistoryTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(goldTransactionsProvider);

    return historyAsync.when(
      data: (transactions) {
        if (transactions.isEmpty) {
          return const Center(child: Text('거래 내역이 없습니다.'));
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: transactions.length,
          separatorBuilder: (_, __) => const Divider(),
          itemBuilder: (context, index) {
            final tx = transactions[index];
            final isPlus = tx.amount > 0;
            return ListTile(
              leading: CircleAvatar(
                backgroundColor: isPlus
                    ? Colors.green.withOpacity(0.1)
                    : Colors.red.withOpacity(0.1),
                child: Icon(
                  isPlus ? Icons.add : Icons.remove,
                  color: isPlus ? Colors.green : Colors.red,
                ),
              ),
              title: Text(tx.description ?? '골드 거래'),
              subtitle: Text(
                DateFormat(
                  'yyyy.MM.dd HH:mm',
                ).format(tx.createdAt ?? DateTime.now()),
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${isPlus ? '+' : ''}${NumberFormat('#,###').format(tx.amount)} G',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isPlus ? Colors.green : Colors.red,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    '잔액: ${NumberFormat('#,###').format(tx.balanceAfter)}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(child: Text('Error: $err')),
    );
  }
}

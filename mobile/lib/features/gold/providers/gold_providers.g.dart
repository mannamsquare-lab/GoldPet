// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'gold_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$goldBalanceHash() => r'1724cc06ce595a077b5cf3908a11c96469e99213';

/// See also [goldBalance].
@ProviderFor(goldBalance)
final goldBalanceProvider =
    AutoDisposeFutureProvider<GoldBalanceModel>.internal(
      goldBalance,
      name: r'goldBalanceProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$goldBalanceHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef GoldBalanceRef = AutoDisposeFutureProviderRef<GoldBalanceModel>;
String _$goldProductsHash() => r'b86545a83b60b0b63674d4687167ca5132f91d57';

/// See also [goldProducts].
@ProviderFor(goldProducts)
final goldProductsProvider =
    AutoDisposeFutureProvider<List<GoldProductModel>>.internal(
      goldProducts,
      name: r'goldProductsProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$goldProductsHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef GoldProductsRef = AutoDisposeFutureProviderRef<List<GoldProductModel>>;
String _$goldTransactionsHash() => r'f7f9bec40a75d3381b986c8d7667fe77a21f3e7d';

/// See also [GoldTransactions].
@ProviderFor(GoldTransactions)
final goldTransactionsProvider =
    AutoDisposeAsyncNotifierProvider<
      GoldTransactions,
      List<GoldTransactionModel>
    >.internal(
      GoldTransactions.new,
      name: r'goldTransactionsProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$goldTransactionsHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$GoldTransactions =
    AutoDisposeAsyncNotifier<List<GoldTransactionModel>>;
String _$goldControllerHash() => r'fd4362308c2de4536f30a1441bf9cd1642d491b5';

/// See also [GoldController].
@ProviderFor(GoldController)
final goldControllerProvider =
    AutoDisposeAsyncNotifierProvider<GoldController, void>.internal(
      GoldController.new,
      name: r'goldControllerProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$goldControllerHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$GoldController = AutoDisposeAsyncNotifier<void>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

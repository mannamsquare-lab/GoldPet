// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ai_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$aiStylesHash() => r'8d06996ff3278b2a597cd1abf19e2ffcd86dec3c';

/// See also [aiStyles].
@ProviderFor(aiStyles)
final aiStylesProvider =
    AutoDisposeFutureProvider<List<AIStyleOption>>.internal(
      aiStyles,
      name: r'aiStylesProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$aiStylesHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef AiStylesRef = AutoDisposeFutureProviderRef<List<AIStyleOption>>;
String _$aiRequestsHash() => r'e5447f639bc4acecc4c7d2db02a45cd544c9f58f';

/// See also [AiRequests].
@ProviderFor(AiRequests)
final aiRequestsProvider =
    AutoDisposeAsyncNotifierProvider<
      AiRequests,
      List<AIProfileRequestResponse>
    >.internal(
      AiRequests.new,
      name: r'aiRequestsProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$aiRequestsHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$AiRequests = AutoDisposeAsyncNotifier<List<AIProfileRequestResponse>>;
String _$aiControllerHash() => r'e273bcb5b4918a8abdbd70e8927e77cfcfb2a616';

/// See also [AiController].
@ProviderFor(AiController)
final aiControllerProvider =
    AutoDisposeAsyncNotifierProvider<AiController, void>.internal(
      AiController.new,
      name: r'aiControllerProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$aiControllerHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$AiController = AutoDisposeAsyncNotifier<void>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

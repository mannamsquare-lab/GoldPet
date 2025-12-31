// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'community_list_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$communityCategoriesHash() =>
    r'ef644246f63bc70609910e2b449a4cc3a772ae2c';

/// See also [communityCategories].
@ProviderFor(communityCategories)
final communityCategoriesProvider =
    AutoDisposeFutureProvider<List<CommunityCategoryModel>>.internal(
      communityCategories,
      name: r'communityCategoriesProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$communityCategoriesHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef CommunityCategoriesRef =
    AutoDisposeFutureProviderRef<List<CommunityCategoryModel>>;
String _$communityListHash() => r'e231aa54a28ba6e2b4a0d78f184391ab1cd383bb';

/// See also [CommunityList].
@ProviderFor(CommunityList)
final communityListProvider =
    AutoDisposeAsyncNotifierProvider<
      CommunityList,
      List<CommunityPostModel>
    >.internal(
      CommunityList.new,
      name: r'communityListProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$communityListHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$CommunityList = AutoDisposeAsyncNotifier<List<CommunityPostModel>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

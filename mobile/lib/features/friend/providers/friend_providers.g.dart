// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'friend_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$nearbyFriendsHash() => r'd40d1fd5dd24a0563fde76111080d10c921349b3';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

/// See also [nearbyFriends].
@ProviderFor(nearbyFriends)
const nearbyFriendsProvider = NearbyFriendsFamily();

/// See also [nearbyFriends].
class NearbyFriendsFamily
    extends Family<AsyncValue<List<FriendLocationModel>>> {
  /// See also [nearbyFriends].
  const NearbyFriendsFamily();

  /// See also [nearbyFriends].
  NearbyFriendsProvider call({
    required double minLat,
    required double minLon,
    required double maxLat,
    required double maxLon,
  }) {
    return NearbyFriendsProvider(
      minLat: minLat,
      minLon: minLon,
      maxLat: maxLat,
      maxLon: maxLon,
    );
  }

  @override
  NearbyFriendsProvider getProviderOverride(
    covariant NearbyFriendsProvider provider,
  ) {
    return call(
      minLat: provider.minLat,
      minLon: provider.minLon,
      maxLat: provider.maxLat,
      maxLon: provider.maxLon,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'nearbyFriendsProvider';
}

/// See also [nearbyFriends].
class NearbyFriendsProvider
    extends AutoDisposeFutureProvider<List<FriendLocationModel>> {
  /// See also [nearbyFriends].
  NearbyFriendsProvider({
    required double minLat,
    required double minLon,
    required double maxLat,
    required double maxLon,
  }) : this._internal(
         (ref) => nearbyFriends(
           ref as NearbyFriendsRef,
           minLat: minLat,
           minLon: minLon,
           maxLat: maxLat,
           maxLon: maxLon,
         ),
         from: nearbyFriendsProvider,
         name: r'nearbyFriendsProvider',
         debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
             ? null
             : _$nearbyFriendsHash,
         dependencies: NearbyFriendsFamily._dependencies,
         allTransitiveDependencies:
             NearbyFriendsFamily._allTransitiveDependencies,
         minLat: minLat,
         minLon: minLon,
         maxLat: maxLat,
         maxLon: maxLon,
       );

  NearbyFriendsProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.minLat,
    required this.minLon,
    required this.maxLat,
    required this.maxLon,
  }) : super.internal();

  final double minLat;
  final double minLon;
  final double maxLat;
  final double maxLon;

  @override
  Override overrideWith(
    FutureOr<List<FriendLocationModel>> Function(NearbyFriendsRef provider)
    create,
  ) {
    return ProviderOverride(
      origin: this,
      override: NearbyFriendsProvider._internal(
        (ref) => create(ref as NearbyFriendsRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        minLat: minLat,
        minLon: minLon,
        maxLat: maxLat,
        maxLon: maxLon,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<List<FriendLocationModel>> createElement() {
    return _NearbyFriendsProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is NearbyFriendsProvider &&
        other.minLat == minLat &&
        other.minLon == minLon &&
        other.maxLat == maxLat &&
        other.maxLon == maxLon;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, minLat.hashCode);
    hash = _SystemHash.combine(hash, minLon.hashCode);
    hash = _SystemHash.combine(hash, maxLat.hashCode);
    hash = _SystemHash.combine(hash, maxLon.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin NearbyFriendsRef
    on AutoDisposeFutureProviderRef<List<FriendLocationModel>> {
  /// The parameter `minLat` of this provider.
  double get minLat;

  /// The parameter `minLon` of this provider.
  double get minLon;

  /// The parameter `maxLat` of this provider.
  double get maxLat;

  /// The parameter `maxLon` of this provider.
  double get maxLon;
}

class _NearbyFriendsProviderElement
    extends AutoDisposeFutureProviderElement<List<FriendLocationModel>>
    with NearbyFriendsRef {
  _NearbyFriendsProviderElement(super.provider);

  @override
  double get minLat => (origin as NearbyFriendsProvider).minLat;
  @override
  double get minLon => (origin as NearbyFriendsProvider).minLon;
  @override
  double get maxLat => (origin as NearbyFriendsProvider).maxLat;
  @override
  double get maxLon => (origin as NearbyFriendsProvider).maxLon;
}

String _$myMatchesHash() => r'0a56210594f99c6e09728242d5a72af3f6f14a12';

/// See also [myMatches].
@ProviderFor(myMatches)
final myMatchesProvider = AutoDisposeFutureProvider<List<MatchModel>>.internal(
  myMatches,
  name: r'myMatchesProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$myMatchesHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef MyMatchesRef = AutoDisposeFutureProviderRef<List<MatchModel>>;
String _$friendActionControllerHash() =>
    r'fced99c83edb90720bb40947766b1ee70c2f78d4';

/// See also [FriendActionController].
@ProviderFor(FriendActionController)
final friendActionControllerProvider =
    AutoDisposeAsyncNotifierProvider<FriendActionController, void>.internal(
      FriendActionController.new,
      name: r'friendActionControllerProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$friendActionControllerHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$FriendActionController = AutoDisposeAsyncNotifier<void>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

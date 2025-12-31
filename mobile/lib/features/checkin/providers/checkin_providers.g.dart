// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'checkin_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$nearbyPlacesHash() => r'231f3db0ac698c7f46c7b08a9278c680b515523d';

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

/// See also [nearbyPlaces].
@ProviderFor(nearbyPlaces)
const nearbyPlacesProvider = NearbyPlacesFamily();

/// See also [nearbyPlaces].
class NearbyPlacesFamily extends Family<AsyncValue<List<PlaceResponse>>> {
  /// See also [nearbyPlaces].
  const NearbyPlacesFamily();

  /// See also [nearbyPlaces].
  NearbyPlacesProvider call({
    required double lat,
    required double lng,
    double radius = 1000.0,
  }) {
    return NearbyPlacesProvider(lat: lat, lng: lng, radius: radius);
  }

  @override
  NearbyPlacesProvider getProviderOverride(
    covariant NearbyPlacesProvider provider,
  ) {
    return call(lat: provider.lat, lng: provider.lng, radius: provider.radius);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'nearbyPlacesProvider';
}

/// See also [nearbyPlaces].
class NearbyPlacesProvider
    extends AutoDisposeFutureProvider<List<PlaceResponse>> {
  /// See also [nearbyPlaces].
  NearbyPlacesProvider({
    required double lat,
    required double lng,
    double radius = 1000.0,
  }) : this._internal(
         (ref) => nearbyPlaces(
           ref as NearbyPlacesRef,
           lat: lat,
           lng: lng,
           radius: radius,
         ),
         from: nearbyPlacesProvider,
         name: r'nearbyPlacesProvider',
         debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
             ? null
             : _$nearbyPlacesHash,
         dependencies: NearbyPlacesFamily._dependencies,
         allTransitiveDependencies:
             NearbyPlacesFamily._allTransitiveDependencies,
         lat: lat,
         lng: lng,
         radius: radius,
       );

  NearbyPlacesProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.lat,
    required this.lng,
    required this.radius,
  }) : super.internal();

  final double lat;
  final double lng;
  final double radius;

  @override
  Override overrideWith(
    FutureOr<List<PlaceResponse>> Function(NearbyPlacesRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: NearbyPlacesProvider._internal(
        (ref) => create(ref as NearbyPlacesRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        lat: lat,
        lng: lng,
        radius: radius,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<List<PlaceResponse>> createElement() {
    return _NearbyPlacesProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is NearbyPlacesProvider &&
        other.lat == lat &&
        other.lng == lng &&
        other.radius == radius;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, lat.hashCode);
    hash = _SystemHash.combine(hash, lng.hashCode);
    hash = _SystemHash.combine(hash, radius.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin NearbyPlacesRef on AutoDisposeFutureProviderRef<List<PlaceResponse>> {
  /// The parameter `lat` of this provider.
  double get lat;

  /// The parameter `lng` of this provider.
  double get lng;

  /// The parameter `radius` of this provider.
  double get radius;
}

class _NearbyPlacesProviderElement
    extends AutoDisposeFutureProviderElement<List<PlaceResponse>>
    with NearbyPlacesRef {
  _NearbyPlacesProviderElement(super.provider);

  @override
  double get lat => (origin as NearbyPlacesProvider).lat;
  @override
  double get lng => (origin as NearbyPlacesProvider).lng;
  @override
  double get radius => (origin as NearbyPlacesProvider).radius;
}

String _$checkInControllerHash() => r'cbfa840383a157b6f75c112e97ad45b6d9d38b7c';

/// See also [CheckInController].
@ProviderFor(CheckInController)
final checkInControllerProvider =
    AutoDisposeAsyncNotifierProvider<CheckInController, void>.internal(
      CheckInController.new,
      name: r'checkInControllerProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$checkInControllerHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$CheckInController = AutoDisposeAsyncNotifier<void>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

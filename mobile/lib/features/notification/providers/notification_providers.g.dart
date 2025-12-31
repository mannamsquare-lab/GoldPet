// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$unreadNotificationCountHash() =>
    r'472c0ed521a956d29c00bee5e4bbee7661542893';

/// See also [unreadNotificationCount].
@ProviderFor(unreadNotificationCount)
final unreadNotificationCountProvider = AutoDisposeFutureProvider<int>.internal(
  unreadNotificationCount,
  name: r'unreadNotificationCountProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$unreadNotificationCountHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef UnreadNotificationCountRef = AutoDisposeFutureProviderRef<int>;
String _$notificationListHash() => r'9ed5a6e1398fced865e70d792fd3fa53ffe1bb11';

/// See also [NotificationList].
@ProviderFor(NotificationList)
final notificationListProvider =
    AutoDisposeAsyncNotifierProvider<
      NotificationList,
      List<NotificationModel>
    >.internal(
      NotificationList.new,
      name: r'notificationListProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$notificationListHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$NotificationList = AutoDisposeAsyncNotifier<List<NotificationModel>>;
String _$notificationControllerHash() =>
    r'9eb2720fa76be822ed8e21c45e6749bb9ba24f2a';

/// See also [NotificationController].
@ProviderFor(NotificationController)
final notificationControllerProvider =
    AutoDisposeAsyncNotifierProvider<NotificationController, void>.internal(
      NotificationController.new,
      name: r'notificationControllerProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$notificationControllerHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$NotificationController = AutoDisposeAsyncNotifier<void>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package

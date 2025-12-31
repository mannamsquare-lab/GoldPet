import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import 'package:flutter_naver_map/flutter_naver_map.dart';
import '../../../core/theme/app_theme.dart';
import '../data/friend_models.dart';
import '../providers/friend_providers.dart';

class FriendScreen extends ConsumerStatefulWidget {
  const FriendScreen({super.key});

  @override
  ConsumerState<FriendScreen> createState() => _FriendScreenState();
}

class _FriendScreenState extends ConsumerState<FriendScreen> {
  // Default to Seoul City Hall
  double queryMinLat = 37.560;
  double queryMinLon = 126.970;
  double queryMaxLat = 37.570;
  double queryMaxLon = 126.980;
  bool _isLoadingLocation = true;
  NaverMapController? _mapController;
  NLatLng? _initialPosition;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) setState(() => _isLoadingLocation = false);
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) setState(() => _isLoadingLocation = false);
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) setState(() => _isLoadingLocation = false);
      return;
    }

    try {
      final position = await Geolocator.getCurrentPosition();
      _initialPosition = NLatLng(position.latitude, position.longitude);

      // Create a roughly 1km bounding box
      const double delta = 0.01;
      if (mounted) {
        setState(() {
          queryMinLat = position.latitude - delta;
          queryMinLon = position.longitude - delta;
          queryMaxLat = position.latitude + delta;
          queryMaxLon = position.longitude + delta;
          _isLoadingLocation = false;
        });
      }
    } catch (e) {
      debugPrint('Error getting location: $e');
      if (mounted) setState(() => _isLoadingLocation = false);
    }
  }

  void _updateMarkers(List<FriendLocationModel> friends) {
    if (_mapController == null) return;
    _mapController!.clearOverlays();

    final Set<NMarker> markers = {};
    for (var friend in friends) {
      if (friend.latitude != null && friend.longitude != null) {
        final marker = NMarker(
          id: friend.id.toString(),
          position: NLatLng(friend.latitude!, friend.longitude!),
          caption: NOverlayCaption(text: friend.nickname ?? 'Friend'),
        );
        markers.add(marker);
      }
    }
    _mapController!.addOverlayAll(markers);
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('친구 찾기'),
          bottom: const TabBar(
            tabs: [
              Tab(text: '주변 친구'),
              Tab(text: '내 매칭'),
            ],
            labelColor: AppColors.primary,
            indicatorColor: AppColors.primary,
          ),
        ),
        body: TabBarView(children: [_buildNearbyTab(), _buildMatchesTab()]),
      ),
    );
  }

  Widget _buildNearbyTab() {
    if (_isLoadingLocation) {
      return const Center(child: CircularProgressIndicator());
    }

    final provider = nearbyFriendsProvider(
      minLat: queryMinLat,
      minLon: queryMinLon,
      maxLat: queryMaxLat,
      maxLon: queryMaxLon,
    );
    final nearbyFriendsAsync = ref.watch(provider);

    ref.listen(provider, (prev, next) {
      next.whenData((friends) => _updateMarkers(friends));
    });

    // Calculate center from bounding box
    final centerLat = (queryMinLat + queryMaxLat) / 2;
    final centerLon = (queryMinLon + queryMaxLon) / 2;

    return Column(
      children: [
        Expanded(
          child: NaverMap(
            options: NaverMapViewOptions(
              initialCameraPosition: NCameraPosition(
                target: _initialPosition ?? NLatLng(centerLat, centerLon),
                zoom: 14,
              ),
              locationButtonEnable: true,
            ),
            onMapReady: (controller) {
              _mapController = controller;
              if (_initialPosition != null) {
                controller.setLocationTrackingMode(
                  NLocationTrackingMode.follow,
                );
              }
              if (nearbyFriendsAsync.hasValue) {
                _updateMarkers(nearbyFriendsAsync.value!);
              }
            },
          ),
        ),
        Container(
          height: 200,
          padding: const EdgeInsets.all(16),
          child: nearbyFriendsAsync.when(
            data: (friends) {
              if (friends.isEmpty) {
                return const Center(child: Text('주변에 친구가 없습니다.'));
              }
              return ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: friends.length,
                itemBuilder: (context, index) =>
                    _FriendCard(friend: friends[index]),
              );
            },
            error: (err, stack) => Center(child: Text('오류: $err')),
            loading: () => const Center(child: CircularProgressIndicator()),
          ),
        ),
      ],
    );
  }

  Widget _buildMatchesTab() {
    final myMatchesAsync = ref.watch(myMatchesProvider);

    return myMatchesAsync.when(
      data: (matches) {
        if (matches.isEmpty) {
          return const Center(child: Text('매칭된 친구가 없습니다.'));
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: matches.length,
          itemBuilder: (context, index) => _MatchItem(match: matches[index]),
        );
      },
      error: (err, stack) => Center(child: Text('오류: $err')),
      loading: () => const Center(child: CircularProgressIndicator()),
    );
  }
}

class _FriendCard extends ConsumerWidget {
  final FriendLocationModel friend;
  const _FriendCard({required this.friend});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      width: 150,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primaryLight,
                backgroundImage: friend.profileImageUrl != null
                    ? NetworkImage(friend.profileImageUrl!)
                    : null,
                child: friend.profileImageUrl == null
                    ? const Icon(Icons.pets, color: AppColors.primary)
                    : null,
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  ref
                      .read(friendActionControllerProvider.notifier)
                      .likeUser(friend.id);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        '${friend.nickname ?? "친구"}님에게 좋아요를 보냈습니다!',
                      ),
                    ),
                  );
                },
                child: const Icon(
                  Icons.favorite_border,
                  size: 20,
                  color: AppColors.error,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            friend.nickname ?? '알 수 없음',
            style: const TextStyle(fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const Spacer(),
          // Distance calculation could be added here if we passed current loc
        ],
      ),
    );
  }
}

class _MatchItem extends ConsumerWidget {
  final MatchModel match;
  const _MatchItem({required this.match});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: AppColors.primaryLight,
            backgroundImage: match.partnerProfileImage != null
                ? NetworkImage(match.partnerProfileImage!)
                : null,
            child: match.partnerProfileImage == null
                ? const Icon(Icons.pets, color: AppColors.primary)
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  match.partnerNickname ?? '알 수 없음',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                if (match.matchedAt != null)
                  Text(
                    '매칭됨: ${match.matchedAt}', // formatting needed
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Navigate to ChatRoom with partnerId
              // context.push('/chat/room/new?partnerId=${match.partnerId}');
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(const SnackBar(content: Text('채팅 기능 연동 예정')));
            },
            style: ElevatedButton.styleFrom(minimumSize: const Size(80, 36)),
            child: const Text('채팅'),
          ),
        ],
      ),
    );
  }
}

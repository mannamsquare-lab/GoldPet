import 'dart:async';
import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/webview/hybrid_webview.dart';
import '../../../core/widgets/goldpet_alert_dialog.dart';
import '../mixins/walk_tracking_mixin.dart';
// TODO: extract walkSpotActionController to walk_events.dart when a third walk screen type is added
import 'walk_screen.dart' show walkSpotActionController;

/// Data model for a course spot passed from React WebView via bridge.
class CourseSpotData {
  final double latitude;
  final double longitude;
  final String type;
  final String? name;
  final String? description;

  const CourseSpotData({
    required this.latitude,
    required this.longitude,
    required this.type,
    this.name,
    this.description,
  });

  factory CourseSpotData.fromJson(Map<String, dynamic> json) {
    return CourseSpotData(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      type: json['type'] as String? ?? 'OTHER',
      name: json['name'] as String?,
      description: json['description'] as String?,
    );
  }
}

class CourseWalkScreen extends ConsumerStatefulWidget {
  final int courseId;
  final List<List<double>> coursePath; // [[lat,lng], ...]
  final List<CourseSpotData> courseSpots;
  final String? courseTitle;

  /// Singleton guard (same pattern as WalkScreen)
  static bool isOnStack = false;

  const CourseWalkScreen({
    super.key,
    required this.courseId,
    required this.coursePath,
    this.courseSpots = const [],
    this.courseTitle,
  });

  @override
  ConsumerState<CourseWalkScreen> createState() => _CourseWalkScreenState();
}

class _CourseWalkScreenState extends ConsumerState<CourseWalkScreen>
    with WidgetsBindingObserver, WalkTrackingMixin {
  final Key _mapKey = UniqueKey();
  final DraggableScrollableController _sheetController = DraggableScrollableController();
  StreamSubscription<String>? _spotActionSubscription;
  String? _pendingSpotAction;

  // Course-specific state
  bool _isOffCourse = false;
  double _deviationDistance = 0.0;
  double _courseProgress = 0.0; // 0.0 ~ 1.0
  int _nearestSegmentIndex = 0;
  int _progressWaypointIndex = 0; // Sequential waypoint tracker for progress
  bool _completionShown = false;

  // Course path as NLatLng for map overlay
  late final List<NLatLng> _coursePathLatLng;

  // Design colors
  static const Color _panelBg = Color(0xFFEFE1C4);
  static const Color _actionBarBg = Color(0xFFF9ECD2);
  static const Color _handleColor = Color(0xFFA58A54);
  static const Color _courseColor = Color(0xFF4A90D9); // Blue for course path
  static const double _headerToolbarHeight = 56.0;

  double get _bottomSafeArea => MediaQuery.of(context).padding.bottom;
  double get _headerTotalHeight => MediaQuery.of(context).padding.top + _headerToolbarHeight;
  double get _mapAreaHeight => MediaQuery.of(context).size.height - _headerTotalHeight;
  double get _collapsedSheetSize => (80.0 + _bottomSafeArea) / _mapAreaHeight;
  double get _expandedSheetSize => (260.0 + _bottomSafeArea) / _mapAreaHeight;

  // --- Mixin overrides ---

  @override
  dynamic get walkRef => ref;

  @override
  int? get followedCourseId => widget.courseId;

  @override
  void onWalkSaved() {
    Navigator.of(context).pop();
    HybridWebView.ensureContentAlive?.call();
  }

  @override
  Future<Map<String, dynamic>?> showPhotoMemoSheet(String photoPath) {
    return showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _CoursePhotoMemoSheet(photoPath: photoPath),
    );
  }

  @override
  void onLocationUpdate(Position position, NLatLng latLng) {
    _checkDeviation(position);
    _updateProgress(latLng);
  }

  // --- Lifecycle ---

  @override
  void initState() {
    super.initState();
    CourseWalkScreen.isOnStack = true;
    WidgetsBinding.instance.addObserver(this);

    // Subscribe to global spot action stream (same pattern as WalkScreen)
    _spotActionSubscription = walkSpotActionController.stream.listen((type) {
      if (type == 'STOP') {
        if (trackingIsWalking) unawaited(stopWalk());
        return;
      }
      if (trackingIsWalking) {
        addSpot(type);
      } else {
        _pendingSpotAction = type;
      }
    });

    // Convert course path to NLatLng
    _coursePathLatLng = widget.coursePath
        .map((p) => NLatLng(p[0], p[1]))
        .toList();

    initTracking(isPublic: true);
  }

  @override
  void dispose() {
    disposeTracking();
    CourseWalkScreen.isOnStack = false;
    WidgetsBinding.instance.removeObserver(this);
    _spotActionSubscription?.cancel();
    _sheetController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) handleAppResumed();
  }

  // --- Walk start: add course overlay after map is ready ---

  @override
  Future<void> startWalk() async {
    await super.startWalk();
    // Add course path overlay on map
    _addCourseOverlay();

    // Execute any pending spot action that arrived before walk started
    if (_pendingSpotAction != null) {
      final action = _pendingSpotAction!;
      _pendingSpotAction = null;
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted && trackingIsWalking) addSpot(action);
      });
    }
  }

  void _addCourseOverlay() {
    if (trackingMapController == null || _coursePathLatLng.length < 2) return;

    // Course path polyline (blue, dashed effect via wider line)
    final courseOverlay = NPathOverlay(
      id: 'course_path',
      coords: _coursePathLatLng,
      color: _courseColor.withValues(alpha: 0.6),
      width: 8,
    );
    trackingMapController!.addOverlay(courseOverlay);

    // Course start marker
    final startMarker = NMarker(
      id: 'course_start',
      position: _coursePathLatLng.first,
      icon: const NOverlayImage.fromAssetImage('assets/images/walk/marker_camera.png'),
      size: const Size(24, 24),
      caption: const NOverlayCaption(text: '출발', textSize: 10, color: _courseColor),
    );
    trackingMapController!.addOverlay(startMarker);

    // Course end marker
    final endMarker = NMarker(
      id: 'course_end',
      position: _coursePathLatLng.last,
      icon: const NOverlayImage.fromAssetImage('assets/images/walk/marker_camera.png'),
      size: const Size(24, 24),
      caption: const NOverlayCaption(text: '도착', textSize: 10, color: Colors.red),
    );
    trackingMapController!.addOverlay(endMarker);

    // Course spot markers
    for (var i = 0; i < widget.courseSpots.length; i++) {
      final spot = widget.courseSpots[i];
      final marker = NMarker(
        id: 'course_spot_$i',
        position: NLatLng(spot.latitude, spot.longitude),
        size: const Size(20, 20),
        caption: NOverlayCaption(
          text: spot.name ?? _getSpotEmoji(spot.type),
          textSize: 9,
        ),
      );
      trackingMapController!.addOverlay(marker);
    }

    // Fit camera to show course path
    if (_coursePathLatLng.length >= 2) {
      final bounds = NLatLngBounds.from(_coursePathLatLng);
      trackingMapController!.updateCamera(
        NCameraUpdate.fitBounds(bounds, padding: const EdgeInsets.all(60)),
      );
    }
  }

  String _getSpotEmoji(String type) {
    return switch (type) {
      'WATER_FOUNTAIN' => '💧',
      'REST_AREA' => '🪑',
      'TRASH_CAN' => '🗑️',
      'DANGER_ZONE' => '⚠️',
      'SCENIC_POINT' => '📸',
      'CONVENIENCE_STORE' => '🏪',
      'CAFE' => '☕',
      'PARK_ENTRANCE' => '🌳',
      'CROSSWALK' => '🚶',
      'PHOTO_SPOT' => '📷',
      _ => '📍',
    };
  }

  // --- Deviation detection ---

  void _checkDeviation(Position position) {
    if (_coursePathLatLng.length < 2) return;

    // Find minimum distance from current position to any course segment
    double minDist = double.infinity;
    int nearestIdx = 0;

    for (var i = 0; i < _coursePathLatLng.length - 1; i++) {
      final dist = _distanceToSegment(
        position.latitude, position.longitude,
        _coursePathLatLng[i].latitude, _coursePathLatLng[i].longitude,
        _coursePathLatLng[i + 1].latitude, _coursePathLatLng[i + 1].longitude,
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    _nearestSegmentIndex = nearestIdx;
    _deviationDistance = minDist;

    // Dynamic threshold: max(50m, accuracy * 2.5)
    final threshold = math.max(50.0, position.accuracy * 2.5);
    final wasOffCourse = _isOffCourse;
    _isOffCourse = minDist > threshold;

    if (_isOffCourse && !wasOffCourse && mounted) {
      // Just went off course - show alert
      showTrackingSnackBar('코스에서 벗어났습니다! (${minDist.toStringAsFixed(0)}m)');
    }

    if (mounted) setState(() {});
  }

  /// Distance from point (px,py) to line segment (ax,ay)-(bx,by) in meters.
  double _distanceToSegment(
    double px, double py,
    double ax, double ay,
    double bx, double by,
  ) {
    final segLen = Geolocator.distanceBetween(ax, ay, bx, by);
    if (segLen < 0.001) return Geolocator.distanceBetween(px, py, ax, ay);

    // Project point onto segment
    final dpa = Geolocator.distanceBetween(px, py, ax, ay);
    final dpb = Geolocator.distanceBetween(px, py, bx, by);

    // Use the triangle approach: if either angle is obtuse, nearest point is the vertex
    final dab = segLen;
    if (dpa * dpa > dpb * dpb + dab * dab) return dpb; // angle at B is obtuse
    if (dpb * dpb > dpa * dpa + dab * dab) return dpa; // angle at A is obtuse

    // Otherwise, compute perpendicular distance using Heron's formula
    final s = (dpa + dpb + dab) / 2;
    final area = math.sqrt(math.max(0, s * (s - dpa) * (s - dpb) * (s - dab)));
    return 2 * area / dab;
  }

  // --- Progress tracking (segment projection) ---

  void _updateProgress(NLatLng latLng) {
    if (_coursePathLatLng.length < 2) return;

    // Find the nearest segment, searching from a few behind current progress
    // to allow for GPS jitter, but covering all segments ahead.
    final searchStart = math.max(0, _progressWaypointIndex - 2);
    double minDist = double.infinity;
    int nearestIdx = _progressWaypointIndex;

    for (var i = searchStart; i < _coursePathLatLng.length - 1; i++) {
      final dist = _distanceToSegment(
        latLng.latitude, latLng.longitude,
        _coursePathLatLng[i].latitude, _coursePathLatLng[i].longitude,
        _coursePathLatLng[i + 1].latitude, _coursePathLatLng[i + 1].longitude,
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    // Only allow forward progress (prevent backward jumps)
    nearestIdx = math.max(nearestIdx, _progressWaypointIndex);
    _progressWaypointIndex = nearestIdx;

    // Calculate progress: sum of completed segments + fraction within current segment
    double totalLength = 0;
    double progressLength = 0;

    for (var i = 0; i < _coursePathLatLng.length - 1; i++) {
      final segLen = Geolocator.distanceBetween(
        _coursePathLatLng[i].latitude, _coursePathLatLng[i].longitude,
        _coursePathLatLng[i + 1].latitude, _coursePathLatLng[i + 1].longitude,
      );
      totalLength += segLen;
      if (i < nearestIdx) {
        progressLength += segLen;
      } else if (i == nearestIdx) {
        // Project position onto this segment for fractional progress
        final dToA = Geolocator.distanceBetween(
          latLng.latitude, latLng.longitude,
          _coursePathLatLng[i].latitude, _coursePathLatLng[i].longitude,
        );
        final dToB = Geolocator.distanceBetween(
          latLng.latitude, latLng.longitude,
          _coursePathLatLng[i + 1].latitude, _coursePathLatLng[i + 1].longitude,
        );
        final fraction = (dToA + dToB) > 0 ? (dToA / (dToA + dToB)).clamp(0.0, 1.0) : 0.0;
        progressLength += segLen * fraction;
      }
    }

    final newProgress = totalLength > 0 ? (progressLength / totalLength).clamp(0.0, 1.0) : 0.0;
    _courseProgress = math.max(_courseProgress, newProgress);

    // Check completion: within 100m of course end point
    final distToEnd = Geolocator.distanceBetween(
      latLng.latitude, latLng.longitude,
      _coursePathLatLng.last.latitude, _coursePathLatLng.last.longitude,
    );

    if (distToEnd < 10 && !_completionShown && trackingIsWalking
        && _courseProgress >= 0.95
        && trackingDurationNotifier.value >= 60) {
      _completionShown = true;
      _showCompletionDialog();
    }

    if (mounted) setState(() {});
  }

  Future<void> _showCompletionDialog() async {
    if (!mounted) return;
    final shouldStop = await showGoldPetConfirm(
      context,
      message: '코스를 완주했습니다! 🎉\n산책을 종료하시겠습니까?',
      confirmText: '종료',
      cancelText: '계속 산책',
    );
    if (shouldStop && mounted) {
      await stopWalk();
    }
  }

  // --- Navigation ---

  Future<void> _handleBackNavigation() async {
    if (trackingIsSaving) return;
    if (trackingIsWalking) {
      final confirmed = await showStopWalkDialog();
      if (confirmed) await stopWalk();
    } else {
      Navigator.of(context).pop();
    }
  }

  // --- Build ---

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !trackingIsWalking && !trackingIsSaving,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _handleBackNavigation();
      },
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        body: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: Stack(
                children: [
                  // Map
                  Positioned.fill(
                    child: trackingIsInitializing
                        ? const Center(child: CircularProgressIndicator())
                        : NaverMap(
                            key: _mapKey,
                            options: NaverMapViewOptions(
                              initialCameraPosition: trackingInitialPosition != null
                                  ? NCameraPosition(target: trackingInitialPosition!, zoom: 16)
                                  : const NCameraPosition(
                                      target: NLatLng(37.5665, 126.9780),
                                      zoom: 16,
                                    ),
                              locationButtonEnable: true,
                              logoClickEnable: false,
                              consumeSymbolTapEvents: false,
                            ),
                            onMapReady: (controller) {
                              trackingMapController = controller;
                              controller.setLocationTrackingMode(NLocationTrackingMode.follow);
                              // Course overlay may have been skipped if startWalk()
                              // ran before the map was ready — add it now.
                              if (trackingIsWalking) {
                                _addCourseOverlay();
                              }
                            },
                          ),
                  ),

                  // Deviation warning banner
                  if (trackingIsWalking && _isOffCourse)
                    Positioned(
                      top: 12,
                      left: 16,
                      right: 16,
                      child: _DeviationBanner(distance: _deviationDistance),
                    ),

                  // Location chip
                  if (trackingIsWalking && trackingCurrentAddress.isNotEmpty && !_isOffCourse)
                    Positioned(
                      top: 12,
                      right: 16,
                      child: _CourseLocationChip(address: trackingCurrentAddress),
                    ),

                  // Info panel with progress bar
                  if (trackingIsWalking)
                    _buildInfoPanel(),

                  // Walk controls
                  if (trackingIsWalking)
                    _buildWalkControls(),

                  // Saving overlay
                  if (trackingIsSaving)
                    Positioned.fill(
                      child: Container(
                        color: Colors.black.withValues(alpha: 0.3),
                        child: const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(color: Colors.white),
                              SizedBox(height: 16),
                              Text(
                                '산책 기록 저장 중...',
                                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      color: AppColors.background,
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: _headerToolbarHeight,
          child: Row(
            children: [
              GestureDetector(
                onTap: _handleBackNavigation,
                child: Padding(
                  padding: const EdgeInsets.only(left: 16),
                  child: Icon(Icons.arrow_back_ios_new, size: 20, color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  widget.courseTitle ?? '코스 따라가기',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoPanel() {
    return DraggableScrollableSheet(
      controller: _sheetController,
      initialChildSize: _expandedSheetSize,
      minChildSize: _collapsedSheetSize,
      maxChildSize: _expandedSheetSize,
      snap: true,
      snapSizes: [_collapsedSheetSize, _expandedSheetSize],
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: _panelBg,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, -2))],
          ),
          child: SingleChildScrollView(
            controller: scrollController,
            child: Column(
              children: [
                // Drag handle
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Center(
                    child: Container(
                      width: 40, height: 4,
                      decoration: BoxDecoration(color: _handleColor, borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                ),
                // Course progress bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '코스 진행률',
                            style: TextStyle(fontSize: 11, color: _handleColor, fontWeight: FontWeight.w500),
                          ),
                          Text(
                            '${(_courseProgress * 100).toStringAsFixed(0)}%',
                            style: TextStyle(fontSize: 11, color: _courseColor, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: _courseProgress,
                          backgroundColor: Colors.white.withValues(alpha: 0.5),
                          valueColor: const AlwaysStoppedAnimation<Color>(_courseColor),
                          minHeight: 6,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                // Stats row
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      Expanded(
                        child: ValueListenableBuilder<double>(
                          valueListenable: trackingDistanceNotifier,
                          builder: (_, distance, child) => _CourseStat(
                            value: distance.toStringAsFixed(2),
                            unit: 'km',
                            label: '거리',
                          ),
                        ),
                      ),
                      Expanded(
                        child: ValueListenableBuilder<int>(
                          valueListenable: trackingDurationNotifier,
                          builder: (_, seconds, child) => _CourseStat(
                            value: formatDuration(seconds),
                            label: '시간',
                          ),
                        ),
                      ),
                      Expanded(
                        child: ValueListenableBuilder<double>(
                          valueListenable: trackingDistanceNotifier,
                          builder: (_, distance, child) => _CourseStat(
                            value: (distance * 50).toStringAsFixed(0),
                            unit: 'Kcal',
                            label: '칼로리',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                // Spot action buttons
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                    decoration: BoxDecoration(color: _actionBarBg, borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _CourseSpotButton(label: '응가', svgAsset: 'assets/images/walk/icon_poop.svg', onTap: () => addSpot('POOP')),
                        _CourseSpotButton(label: '쉬', svgAsset: 'assets/images/walk/icon_pee.svg', onTap: () => addSpot('PEE')),
                        _CourseSpotButton(label: '사진', svgAsset: 'assets/images/walk/icon_camera.svg', onTap: () => addSpot('PHOTO')),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: _bottomSafeArea),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildWalkControls() {
    return ListenableBuilder(
      listenable: _sheetController,
      builder: (context, child) {
        double sheetHeight;
        try {
          sheetHeight = _sheetController.size * _mapAreaHeight;
        } catch (_) {
          sheetHeight = _expandedSheetSize * _mapAreaHeight;
        }
        return Positioned(right: 16, bottom: sheetHeight + 16, child: child!);
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Stop button
          GestureDetector(
            onTap: () async {
              final confirmed = await showStopWalkDialog();
              if (confirmed) await stopWalk();
            },
            child: Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: const Color(0xFF353D4C).withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 12))],
              ),
              child: Center(
                child: Container(
                  width: 14, height: 14,
                  decoration: BoxDecoration(color: _handleColor, borderRadius: BorderRadius.circular(1)),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Pause button
          GestureDetector(
            onTap: togglePause,
            child: Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: const Color(0xFF353D4C).withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 12))],
              ),
              child: Center(
                child: trackingIsPaused
                    ? CustomPaint(size: const Size(14, 14), painter: _CoursePlayIconPainter(color: _handleColor))
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(width: 6, height: 14, decoration: BoxDecoration(color: _handleColor, borderRadius: BorderRadius.circular(1))),
                          const SizedBox(width: 3),
                          Container(width: 6, height: 14, decoration: BoxDecoration(color: _handleColor, borderRadius: BorderRadius.circular(1))),
                        ],
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// --- Course-specific widgets ---

class _DeviationBanner extends StatelessWidget {
  final double distance;
  const _DeviationBanner({required this.distance});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3CD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFFD700)),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: Color(0xFFFF8C00), size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '코스에서 ${distance.toStringAsFixed(0)}m 벗어났습니다',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF856404)),
            ),
          ),
        ],
      ),
    );
  }
}

class _CourseLocationChip extends StatelessWidget {
  final String address;
  const _CourseLocationChip({required this.address});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.location_on, size: 16, color: AppColors.primary),
          const SizedBox(width: 4),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 200),
            child: Text(address, style: const TextStyle(fontSize: 12, color: AppColors.textPrimary), overflow: TextOverflow.ellipsis),
          ),
        ],
      ),
    );
  }
}

class _CourseStat extends StatelessWidget {
  final String value;
  final String? unit;
  final String label;
  const _CourseStat({required this.value, this.unit, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary)),
            if (unit != null) ...[
              const SizedBox(width: 2),
              Text(unit!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.primary)),
            ],
          ],
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF727272))),
      ],
    );
  }
}

class _CourseSpotButton extends StatelessWidget {
  final String label;
  final String svgAsset;
  final VoidCallback onTap;
  const _CourseSpotButton({required this.label, required this.svgAsset, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: Column(
          children: [
            SizedBox(width: 40, height: 40, child: SvgPicture.asset(svgAsset)),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF727272))),
          ],
        ),
      ),
    );
  }
}

class _CoursePhotoMemoSheet extends StatefulWidget {
  final String photoPath;
  const _CoursePhotoMemoSheet({required this.photoPath});

  @override
  State<_CoursePhotoMemoSheet> createState() => _CoursePhotoMemoSheetState();
}

class _CoursePhotoMemoSheetState extends State<_CoursePhotoMemoSheet> {
  final _textController = TextEditingController();

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFFFF7E6),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(20, 12, 20, 24 + bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[400], borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 8),
          const Text('사진', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF333333))),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.file(File(widget.photoPath), height: 220, width: double.infinity, fit: BoxFit.cover),
          ),
          const SizedBox(height: 20),
          const Text('메모', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF333333))),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _textController,
              maxLength: 100,
              maxLines: 3,
              decoration: const InputDecoration(hintText: '이 장소에 대한 메모를 남겨보세요.', border: InputBorder.none, counterText: ''),
            ),
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerRight,
            child: ValueListenableBuilder<TextEditingValue>(
              valueListenable: _textController,
              builder: (_, value, child) => Text('${value.text.length}/100자', style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.camera_alt, size: 18),
                  label: const Text('다시 촬영'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF614108),
                    side: const BorderSide(color: Color(0xFF614108)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => Navigator.pop(context, <String, dynamic>{'retake': true}),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF614108),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => Navigator.pop(context, <String, dynamic>{'memo': _textController.text}),
                  child: const Text('저장'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CoursePlayIconPainter extends CustomPainter {
  final Color color;
  _CoursePlayIconPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, size.height / 2)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

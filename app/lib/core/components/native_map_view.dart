import 'package:flutter/material.dart';
import 'package:kakao_map_sdk/kakao_map_sdk.dart';

class NativeMapView extends StatefulWidget {
  final void Function(KakaoMapController controller)? onMapReady;

  const NativeMapView({super.key, this.onMapReady});

  @override
  State<NativeMapView> createState() => _NativeMapViewState();
}

class _NativeMapViewState extends State<NativeMapView> {
  @override
  Widget build(BuildContext context) {
    return KakaoMap(
      onMapReady: (controller) {
        if (widget.onMapReady != null) {
          widget.onMapReady!(controller);
        }
      },
    );
  }
}

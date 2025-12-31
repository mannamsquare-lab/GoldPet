import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

import 'package:flutter_naver_map/flutter_naver_map.dart';

import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // ignore: deprecated_member_use
  await NaverMapSdk.instance.initialize(clientId: 'ex0an0bs06');
  KakaoSdk.init(nativeAppKey: '0d1faed93f83b48a4c1ce04f8583d345');
  runApp(const ProviderScope(child: GoldPetApp()));
}

class GoldPetApp extends ConsumerWidget {
  const GoldPetApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'GoldPet',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}

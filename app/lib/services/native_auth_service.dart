import 'package:flutter/services.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart';
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:flutter_naver_login/interface/types/naver_login_result.dart';
import 'package:flutter_naver_login/interface/types/naver_token.dart';
import 'package:flutter_naver_login/interface/types/naver_login_status.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:goldpet_app/core/config/environment.dart';

class NativeAuthService {
  Future<String?> loginWithKakao() async {
    try {
      bool isInstalled = await isKakaoTalkInstalled();
      OAuthToken token;
      if (isInstalled) {
        try {
          token = await UserApi.instance.loginWithKakaoTalk();
          debugPrint('Logged in with KakaoTalk');
        } catch (e) {
          debugPrint('KakaoTalk login failed: $e');
          // 카카오톡에 연결된 계정이 없는 경우, 카카오계정으로 로그인
          if (e is PlatformException && e.code == 'CANCELED') {
            return null;
          }
          token = await UserApi.instance.loginWithKakaoAccount();
          debugPrint('Logged in with Kakao Account (Fallback)');
        }
      } else {
        token = await UserApi.instance.loginWithKakaoAccount();
        debugPrint('Logged in with Kakao Account');
      }
      return token.accessToken;
    } catch (e) {
      debugPrint('Kakao login failed: $e');
      return null;
    }
  }

  Future<String?> loginWithNaver() async {
    try {
      final NaverLoginResult result = await FlutterNaverLogin.logIn();
      if (result.status == NaverLoginStatus.loggedIn) {
        final NaverToken accessToken =
            await FlutterNaverLogin.getCurrentAccessToken();
        debugPrint('Logged in with Naver');
        return accessToken.accessToken;
      }
    } catch (e) {
      debugPrint('Naver login failed: $e');
    }
    return null;
  }

  Future<String?> loginWithGoogle() async {
    try {
      // v7 Migration: Initialize singleton
      await GoogleSignIn.instance.initialize();

      // v7 Migration: Use authenticate() instead of signIn()
      final GoogleSignInAccount? googleUser = await GoogleSignIn.instance
          .authenticate();

      if (googleUser != null) {
        final GoogleSignInAuthentication googleAuth =
            await googleUser.authentication;
        debugPrint('Logged in with Google');
        // v7 Migration: Use idToken as accessToken is removed
        return googleAuth.idToken;
      }
    } catch (e) {
      debugPrint('Google login failed: $e');
    }
    return null;
  }

  Future<String?> loginWithApple() async {
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      debugPrint('Logged in with Apple: ${credential.identityToken}');
      return credential.identityToken;
    } catch (e) {
      debugPrint('Apple login failed: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> verifyTokenWithBackend(
    String provider,
    String accessToken,
  ) async {
    final config = EnvironmentConfig.fromEnv();
    final url = Uri.parse(
      '${config.apiBaseUrl}/api/v1/auth/login/$provider',
    );
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'accessToken': accessToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        debugPrint('Backend verification success: $data');
        return data;
      } else {
        debugPrint(
          'Backend verification failed: Status ${response.statusCode}, Body: ${response.body}',
        );
        return null;
      }
    } catch (e) {
      debugPrint('Backend connection failed: $e');
      return null;
    }
  }
}

// ignore_for_file: new_with_undefined_constructor_default, undefined_method, unused_field
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/constants/app_constants.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart';
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'auth_remote_source.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.read(authRemoteSourceProvider),
    const FlutterSecureStorage(),
  );
});

class AuthRepository {
  final AuthRemoteSource _remoteSource;
  final FlutterSecureStorage _storage;
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;
  bool _isGoogleInitialized = false;

  AuthRepository(this._remoteSource, this._storage);

  Future<void> _ensureGoogleInitialized() async {
    if (!_isGoogleInitialized) {
      await _googleSignIn.initialize();
      _isGoogleInitialized = true;
    }
  }

  Future<void> signInWithGoogle() async {
    try {
      await _ensureGoogleInitialized();
      final account = await _googleSignIn.authenticate();
      if (account == null) return;

      final googleAuth = await account.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) throw Exception('Google ID Token is null');

      await _authenticateBackend('google', idToken);
    } catch (e) {
      if (e is GoogleSignInException &&
          e.code == GoogleSignInExceptionCode.canceled) {
        return;
      }
      rethrow;
    }
  }

  Future<void> signInWithKakao() async {
    if (await isKakaoTalkInstalled()) {
      try {
        final token = await UserApi.instance.loginWithKakaoTalk();
        await _authenticateBackend('kakao', token.accessToken);
      } catch (error) {
        // User might have cancelled login with KakaoTalk
        if (error is PlatformException && error.code == 'CANCELED') {
          return;
        }
        // Fallback to Account
        try {
          final token = await UserApi.instance.loginWithKakaoAccount();
          await _authenticateBackend('kakao', token.accessToken);
        } catch (e) {
          rethrow;
        }
      }
    } else {
      try {
        final token = await UserApi.instance.loginWithKakaoAccount();
        await _authenticateBackend('kakao', token.accessToken);
      } catch (e) {
        rethrow;
      }
    }
  }

  Future<void> signInWithNaver() async {
    try {
      final result = await FlutterNaverLogin.logIn();
      // Use toString check to avoid Enum issues if import is acting up
      if (result.status.toString().contains('loggedIn')) {
        final accessToken = result.accessToken;
        if (accessToken == null) throw Exception("Naver Access Token is null");
        await _authenticateBackend('naver', accessToken.accessToken);
      } else {
        if (result.status.toString().contains('error')) {
          throw Exception(result.errorMessage);
        }
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signInWithApple() async {
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      if (credential.identityToken != null) {
        await _authenticateBackend('apple', credential.identityToken!);
      } else {
        throw Exception('Apple Identity Token is null');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> _authenticateBackend(String provider, String token) async {
    final response = await _remoteSource.loginWithProvider(provider, token);
    final accessToken = response['accessToken'];
    final refreshToken = response['refreshToken'];

    if (accessToken != null) {
      await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    }
    if (refreshToken != null) {
      await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
    }
  }

  Future<void> signOut() async {
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);

    try {
      await _ensureGoogleInitialized();
      await _googleSignIn.signOut();
    } catch (_) {}
    try {
      await FlutterNaverLogin.logOut();
    } catch (_) {}
    // Add other providers logout if needed
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: StorageKeys.accessToken);
  }
}

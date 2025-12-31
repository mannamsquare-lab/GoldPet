class ApiConstants {
  static const String baseUrl = 'http://192.168.0.186:8081';
  static const Duration connectTimeout = Duration(seconds: 60);
  static const Duration receiveTimeout = Duration(seconds: 60);
}

class StorageKeys {
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
  static const String isLoggedIn = 'is_logged_in';
  static const String onboardingComplete = 'onboarding_complete';
}

class AppConfig {
  static const String appName = 'GoldPet';
  static const String appVersion = '1.0.0';
  static const String naverMapClientId = 'YOUR_NAVER_MAP_CLIENT_ID';
}

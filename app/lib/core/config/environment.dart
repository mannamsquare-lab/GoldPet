/// 앱 실행 환경
enum Environment {
  local, // 로컬 개발 (localhost)
  dev,   // 개발 서버 (mannamsquare.com)
  prod,  // 상용 서버 (goldpet.com)
}

/// 환경별 설정 값
class EnvironmentConfig {
  final Environment environment;
  final String apiBaseUrl;
  final String appBaseUrl;
  final String adminBaseUrl;

  const EnvironmentConfig._({
    required this.environment,
    required this.apiBaseUrl,
    required this.appBaseUrl,
    required this.adminBaseUrl,
  });

  /// 로컬 개발 환경
  static const local = EnvironmentConfig._(
    environment: Environment.local,
    apiBaseUrl: 'http://10.0.2.2:8081', // Android emulator localhost
    appBaseUrl: 'http://10.0.2.2:5173',
    adminBaseUrl: 'http://10.0.2.2:5174',
  );

  /// 개발 서버 환경 (mannamsquare.com)
  static const dev = EnvironmentConfig._(
    environment: Environment.dev,
    apiBaseUrl: 'https://api.mannamsquare.com',
    appBaseUrl: 'https://app.mannamsquare.com',
    adminBaseUrl: 'https://admin.mannamsquare.com',
  );

  /// 상용 서버 환경 (goldpet.com)
  static const prod = EnvironmentConfig._(
    environment: Environment.prod,
    apiBaseUrl: 'https://api.goldpet.com',
    appBaseUrl: 'https://app.goldpet.com',
    adminBaseUrl: 'https://admin.goldpet.com',
  );

  /// dart-define으로 전달된 ENV 값에 따라 환경 설정 반환
  /// 사용법: flutter run --dart-define=ENV=local
  static EnvironmentConfig fromEnv() {
    const envName = String.fromEnvironment('ENV', defaultValue: 'dev');

    switch (envName) {
      case 'local':
        return local;
      case 'dev':
        return dev;
      case 'prod':
        return prod;
      default:
        return dev; // 기본값: 개발 서버
    }
  }

  bool get isLocal => environment == Environment.local;
  bool get isDev => environment == Environment.dev;
  bool get isProd => environment == Environment.prod;
}

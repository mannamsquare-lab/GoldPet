/// JavaScript Bridge 메시지 프로토콜 정의
class BridgeProtocol {
  // 메서드 이름 상수
  static const String requestPushPermission = 'requestPushPermission';
  static const String getPushToken = 'getPushToken';
  static const String subscribeToTopic = 'subscribeToTopic';
  
  static const String requestLocationPermission = 'requestLocationPermission';
  static const String getCurrentLocation = 'getCurrentLocation';
  static const String startLocationTracking = 'startLocationTracking';
  static const String stopLocationTracking = 'stopLocationTracking';
  
  static const String requestCameraPermission = 'requestCameraPermission';
  static const String requestPhotoPermission = 'requestPhotoPermission';
  static const String openCamera = 'openCamera';
  static const String openPhotoLibrary = 'openPhotoLibrary';
  static const String pickImage = 'pickImage';
  
  static const String saveFile = 'saveFile';
  static const String readFile = 'readFile';
  static const String deleteFile = 'deleteFile';
  
  static const String getAppVersion = 'getAppVersion';
  static const String getDeviceInfo = 'getDeviceInfo';
  static const String openSettings = 'openSettings';
  
  // 이벤트 타입
  static const String pushNotificationReceived = 'pushNotificationReceived';
  static const String locationUpdated = 'locationUpdated';
  static const String permissionStatusChanged = 'permissionStatusChanged';
  static const String appStateChanged = 'appStateChanged';
}


import Flutter
import UIKit
import UserNotifications
import ActivityKit

@main
@objc class AppDelegate: FlutterAppDelegate {
  private var walkActivity: Any? = nil

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)

    // Request notification permissions and register for remote notifications
    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self
      let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
      UNUserNotificationCenter.current().requestAuthorization(
        options: authOptions,
        completionHandler: { _, _ in }
      )
    } else {
      let settings: UIUserNotificationSettings =
        UIUserNotificationSettings(types: [.alert, .badge, .sound], categories: nil)
      application.registerUserNotificationSettings(settings)
    }

    application.registerForRemoteNotifications()

    // Walk Live Activity MethodChannel
    let controller = window?.rootViewController as! FlutterViewController
    let walkChannel = FlutterMethodChannel(
      name: "com.mannam.goldpet/walk_live_activity",
      binaryMessenger: controller.binaryMessenger
    )
    walkChannel.setMethodCallHandler { [weak self] call, result in
      switch call.method {
      case "start":
        self?.startWalkActivity()
        result(nil)
      case "update":
        guard let args = call.arguments as? [String: Any] else { result(nil); return }
        self?.updateWalkActivity(args)
        result(nil)
      case "end":
        self?.endWalkActivity()
        result(nil)
      default:
        result(FlutterMethodNotImplemented)
      }
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // MARK: - Live Activity Helpers

  @available(iOS 16.2, *)
  private func typedWalkActivity() -> Activity<WalkActivityAttributes>? {
    return walkActivity as? Activity<WalkActivityAttributes>
  }

  private func startWalkActivity() {
    if #available(iOS 16.2, *) {
      guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
      let attributes = WalkActivityAttributes(petName: "")
      let initialState = WalkActivityAttributes.ContentState(
        distanceKm: 0.0,
        durationSeconds: 0,
        paceMinPerKm: 0.0
      )
      do {
        let activity = try Activity.request(
          attributes: attributes,
          content: .init(state: initialState, staleDate: nil),
          pushType: nil
        )
        walkActivity = activity
      } catch {
        print("Failed to start Live Activity: \(error)")
      }
    }
  }

  private func updateWalkActivity(_ args: [String: Any]) {
    if #available(iOS 16.2, *) {
      guard let activity = typedWalkActivity() else { return }
      let distance = args["distanceKm"] as? Double ?? 0.0
      let duration = args["durationSeconds"] as? Int ?? 0
      let pace = args["paceMinPerKm"] as? Double ?? 0.0
      let updatedState = WalkActivityAttributes.ContentState(
        distanceKm: distance,
        durationSeconds: duration,
        paceMinPerKm: pace
      )
      Task {
        await activity.update(.init(state: updatedState, staleDate: nil))
      }
    }
  }

  private func endWalkActivity() {
    if #available(iOS 16.2, *) {
      guard let activity = typedWalkActivity() else { return }
      let finalState = activity.content.state
      walkActivity = nil
      Task {
        await activity.end(.init(state: finalState, staleDate: nil), dismissalPolicy: .immediate)
      }
    }
  }

  // MARK: - APNs

  override func application(_ application: UIApplication,
                            didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
  }

  override func application(_ application: UIApplication,
                            didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Failed to register for remote notifications: \(error.localizedDescription)")
  }
}

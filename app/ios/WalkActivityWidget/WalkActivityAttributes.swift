import ActivityKit

@available(iOS 16.2, *)
struct WalkActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var distanceKm: Double
        var durationSeconds: Int
        var paceMinPerKm: Double
    }
    var petName: String
}

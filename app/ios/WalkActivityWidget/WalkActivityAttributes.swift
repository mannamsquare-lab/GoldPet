import ActivityKit

struct WalkActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var distanceKm: Double
        var durationSeconds: Int
        var paceMinPerKm: Double
    }
    var petName: String
}

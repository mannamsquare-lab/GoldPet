import ActivityKit
import WidgetKit
import SwiftUI

struct WalkLiveActivityView: View {
    let state: WalkActivityAttributes.ContentState

    private var formattedDistance: String {
        String(format: "%.2f", state.distanceKm)
    }

    private var formattedDuration: String {
        let minutes = state.durationSeconds / 60
        let seconds = state.durationSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    private var formattedPace: String {
        if state.paceMinPerKm <= 0 { return "0'00\"" }
        let totalSeconds = Int(state.paceMinPerKm * 60)
        let m = totalSeconds / 60
        let s = totalSeconds % 60
        return "\(m)'\(String(format: "%02d", s))\""
    }

    var body: some View {
        HStack(spacing: 0) {
            // Distance
            VStack(spacing: 2) {
                Text(formattedDistance)
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.black)
                Text("km")
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity)

            // Divider
            Rectangle()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 1, height: 32)

            // Duration
            VStack(spacing: 2) {
                Text(formattedDuration)
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.black)
                Text("time")
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity)

            // Divider
            Rectangle()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 1, height: 32)

            // Pace
            VStack(spacing: 2) {
                Text(formattedPace)
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.black)
                Text("avg pace")
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity)
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 8)
    }
}

struct WalkLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WalkActivityAttributes.self) { context in
            // Lock screen / banner view
            WalkLiveActivityView(state: context.state)
                .activityBackgroundTint(Color(red: 0.976, green: 0.925, blue: 0.824))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(String(format: "%.2f", context.state.distanceKm))
                            .font(.system(size: 18, weight: .bold))
                        Text("km")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    let minutes = context.state.durationSeconds / 60
                    let seconds = context.state.durationSeconds % 60
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(String(format: "%02d:%02d", minutes, seconds))
                            .font(.system(size: 18, weight: .bold))
                        Text("time")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    EmptyView()
                }
            } compactLeading: {
                Text(String(format: "%.1fkm", context.state.distanceKm))
                    .font(.system(size: 12, weight: .semibold))
            } compactTrailing: {
                let minutes = context.state.durationSeconds / 60
                let seconds = context.state.durationSeconds % 60
                Text(String(format: "%02d:%02d", minutes, seconds))
                    .font(.system(size: 12, weight: .semibold))
            } minimal: {
                Text(String(format: "%.1f", context.state.distanceKm))
                    .font(.system(size: 12, weight: .semibold))
            }
        }
    }
}

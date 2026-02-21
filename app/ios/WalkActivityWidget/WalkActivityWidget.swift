import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Spot Action Button

struct SpotActionButton: View {
    let icon: String
    let label: String
    let url: String
    let color: Color

    var body: some View {
        Link(destination: URL(string: url)!) {
            VStack(spacing: 2) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(color)
                Text(label)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.black)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .background(Color.white.opacity(0.5))
            .cornerRadius(8)
        }
    }
}

// MARK: - Lock Screen View

struct WalkLiveActivityView: View {
    let state: WalkActivityAttributes.ContentState

    private var formattedDistance: String {
        String(format: "%.2f", state.distanceKm)
    }

    private var formattedDuration: String {
        let h = state.durationSeconds / 3600
        let m = (state.durationSeconds % 3600) / 60
        let s = state.durationSeconds % 60
        if h > 0 {
            return String(format: "%d:%02d:%02d", h, m, s)
        }
        return String(format: "%02d:%02d", m, s)
    }

    private var formattedCalories: String {
        let cal = Int(state.caloriesBurned.rounded())
        return "\(cal)"
    }

    var body: some View {
        VStack(spacing: 8) {
            // Stats row
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
                    Text("시간")
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)

                // Divider
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 1, height: 32)

                // Calories
                VStack(spacing: 2) {
                    Text(formattedCalories)
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundColor(.black)
                    Text("kcal")
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
            }

            // Spot action buttons + stop button
            HStack(spacing: 6) {
                SpotActionButton(
                    icon: "drop.fill",
                    label: "쉬~",
                    url: "goldpet://spot/pee",
                    color: Color(red: 0.9, green: 0.7, blue: 0.2)
                )
                SpotActionButton(
                    icon: "circle.fill",
                    label: "응가",
                    url: "goldpet://spot/poop",
                    color: Color(red: 0.55, green: 0.35, blue: 0.17)
                )
                SpotActionButton(
                    icon: "camera.fill",
                    label: "사진",
                    url: "goldpet://spot/photo",
                    color: Color(red: 0.3, green: 0.6, blue: 0.85)
                )
                SpotActionButton(
                    icon: "stop.fill",
                    label: "종료",
                    url: "goldpet://walk/stop",
                    color: .red
                )
            }
            .padding(.horizontal, 4)
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 8)
    }
}

// MARK: - Dynamic Island Spot Buttons

struct DynamicIslandSpotButtons: View {
    var body: some View {
        HStack(spacing: 8) {
            Link(destination: URL(string: "goldpet://spot/pee")!) {
                Image(systemName: "drop.fill")
                    .font(.system(size: 14))
                    .foregroundColor(Color(red: 0.9, green: 0.7, blue: 0.2))
            }
            Link(destination: URL(string: "goldpet://spot/poop")!) {
                Image(systemName: "circle.fill")
                    .font(.system(size: 14))
                    .foregroundColor(Color(red: 0.55, green: 0.35, blue: 0.17))
            }
            Link(destination: URL(string: "goldpet://spot/photo")!) {
                Image(systemName: "camera.fill")
                    .font(.system(size: 14))
                    .foregroundColor(Color(red: 0.3, green: 0.6, blue: 0.85))
            }
            Link(destination: URL(string: "goldpet://walk/stop")!) {
                Image(systemName: "stop.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.red)
            }
        }
    }
}

// MARK: - Widget Configuration

struct WalkLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WalkActivityAttributes.self) { context in
            // Lock screen / banner view
            WalkLiveActivityView(state: context.state)
                .widgetURL(URL(string: "goldpet://walk"))
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
                        Text("시간")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    DynamicIslandSpotButtons()
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

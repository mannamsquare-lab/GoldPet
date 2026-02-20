import WidgetKit
import SwiftUI
import ActivityKit

struct WalkLiveActivityView: View {
    let context: ActivityViewContext<WalkActivityAttributes>

    var body: some View {
        HStack(spacing: 0) {
            // 거리
            statColumn(
                value: String(format: "%.2f", context.state.distanceKm),
                label: "킬로미터"
            )
            divider
            // 시간
            statColumn(
                value: formatDuration(context.state.durationSeconds),
                label: "시간"
            )
            divider
            // 페이스
            statColumn(
                value: formatPace(context.state.paceMinPerKm),
                label: "평균 페이스"
            )
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 16)
    }

    private func statColumn(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private var divider: some View {
        Rectangle()
            .fill(Color.gray.opacity(0.3))
            .frame(width: 1, height: 36)
    }

    private func formatDuration(_ seconds: Int) -> String {
        let m = (seconds % 3600) / 60
        let s = seconds % 60
        if seconds >= 3600 {
            let h = seconds / 3600
            return String(format: "%d:%02d:%02d", h, m, s)
        }
        return String(format: "%02d:%02d", m, s)
    }

    private func formatPace(_ pace: Double) -> String {
        guard pace > 0 && pace < 60 else { return "--'--\"" }
        let minutes = Int(pace)
        let seconds = Int((pace - Double(minutes)) * 60)
        return String(format: "%d'%02d\"", minutes, seconds)
    }
}

@main
struct WalkActivityWidgetBundle: WidgetBundle {
    var body: some Widget {
        WalkLiveActivity()
    }
}

struct WalkLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WalkActivityAttributes.self) { context in
            // 잠금화면 뷰
            VStack(spacing: 4) {
                HStack {
                    Image(systemName: "pawprint.fill")
                        .foregroundColor(Color(red: 0.38, green: 0.25, blue: 0.03))
                    Text("GoldPet 산책 중")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(Color(red: 0.38, green: 0.25, blue: 0.03))
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)

                WalkLiveActivityView(context: context)
            }
            .activityBackgroundTint(Color(red: 0.976, green: 0.925, blue: 0.824))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.center) {
                    WalkLiveActivityView(context: context)
                }
            } compactLeading: {
                Image(systemName: "pawprint.fill")
                    .foregroundColor(.orange)
            } compactTrailing: {
                Text(String(format: "%.1fkm", context.state.distanceKm))
                    .font(.system(size: 12, weight: .semibold))
            } minimal: {
                Image(systemName: "pawprint.fill")
                    .foregroundColor(.orange)
            }
        }
    }
}

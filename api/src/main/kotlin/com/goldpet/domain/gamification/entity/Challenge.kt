package com.goldpet.domain.gamification.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "challenges")
class Challenge(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val title: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    val description: String,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val goalType: GoalType,

    @Column(nullable = false)
    val goalValue: Int,

    val rewardGold: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_badge_id")
    val rewardBadge: Badge? = null,

    @Column(nullable = false)
    val startDate: LocalDateTime,

    @Column(nullable = false)
    val endDate: LocalDateTime,

    @Column(nullable = false)
    var isActive: Boolean = true
) {
    enum class GoalType {
        WALK_DISTANCE_TOTAL, CHECK_IN_COUNT
    }
}

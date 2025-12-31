package com.goldpet.domain.gamification.entity

import com.goldpet.domain.user.entity.User
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "user_challenge_progress", uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "challenge_id"])])
class UserChallengeProgress(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    val challenge: Challenge,

    @Column(nullable = false)
    var currentValue: Int = 0,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: Status = Status.IN_PROGRESS,

    var completedAt: LocalDateTime? = null
) {
    enum class Status {
        IN_PROGRESS, COMPLETED, FAILED
    }
}

package com.goldpet.domain.walk.entity

import com.goldpet.domain.common.entity.BaseTimeEntity
import com.goldpet.domain.user.entity.User
import jakarta.persistence.*
import org.locationtech.jts.geom.LineString
import java.time.LocalDateTime

@Entity
@Table(name = "walks")
class Walk(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false)
    var startTime: LocalDateTime,

    @Column(nullable = false)
    var endTime: LocalDateTime,

    @Column(nullable = false)
    var distanceKm: Double,

    @Column(nullable = false)
    var durationSeconds: Long,

    @Column(columnDefinition = "geometry(LineString, 4326)", nullable = false)
    var path: LineString,

    var caloriesBurned: Double?,

    var notes: String?,

) : BaseTimeEntity()

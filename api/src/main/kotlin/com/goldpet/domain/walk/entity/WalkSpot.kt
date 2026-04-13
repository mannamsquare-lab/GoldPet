package com.goldpet.domain.walk.entity

import com.goldpet.domain.common.entity.BaseTimeEntity
import jakarta.persistence.*
import org.locationtech.jts.geom.Point
import java.time.LocalDateTime

@Entity
@Table(name = "walk_spots")
class WalkSpot(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "walk_id", nullable = false)
    val walk: Walk,

    @Column(columnDefinition = "geometry(Point, 4326)", nullable = false)
    val location: Point,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: WalkSpotType,

    @Column(nullable = false)
    val timestamp: LocalDateTime,

    var imageUrl: String? = null,

    @Column(columnDefinition = "TEXT")
    var note: String? = null,

    @Column(nullable = false)
    var hiddenFromPublic: Boolean = false

) : BaseTimeEntity()

enum class WalkSpotType {
    PEE, POOP, PHOTO, PROBLEM, OTHER
}
